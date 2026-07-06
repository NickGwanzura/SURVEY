// Service Worker source — compiled by @serwist/next.
// Strategy:
//   • Precache the build manifest (Next pages and static assets)
//   • Runtime cache: SWR for HTML pages, CacheFirst for images and tiles,
//     NetworkOnly for API and admin routes
//   • Offline fallback page at /survey/offline
//   • A background-sync queue named "survey-submit-queue" retries failed
//     POST /api/survey/submit when the network returns

/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope &
  SerwistGlobalConfig & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  };

// Override default-cache entries that should never be cached, and keep the
// rest. We add custom rules in front so they win route-matching.
const customRuntimeCaching = [
  // ----- Never cache anything admin: data freshness > offline reads -----
  {
    matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/admin"),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/api/admin"),
    handler: new NetworkOnly(),
  },

  // ----- Survey submit: network-only — offline retry is handled by the
  //       app-level IndexedDB queue (lib/offline-sync.ts + SyncWatcher) -----
  {
    matcher: ({ url, request }: { url: URL; request: Request }) =>
      url.pathname === "/api/survey/submit" && request.method === "POST",
    handler: new NetworkOnly(),
    method: "POST" as const,
  },

  // ----- Survey check-phone: cache miss is fine, network is preferred -----
  {
    matcher: ({ url }: { url: URL }) =>
      url.pathname === "/api/survey/check-phone",
    handler: new NetworkOnly(),
  },

  // ----- Photo upload signed-URL endpoint: never cache -----
  {
    matcher: ({ url }: { url: URL }) =>
      url.pathname === "/api/survey/upload-photo",
    handler: new NetworkOnly(),
  },

  // ----- OpenStreetMap tiles: cache aggressively -----
  {
    matcher: ({ url }: { url: URL }) =>
      /\.tile\.openstreetmap\.org$/.test(url.hostname),
    handler: new CacheFirst({
      cacheName: "osm-tiles",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
  },

  // ----- R2 photo public URLs: cache for 24h (admin detail-view re-renders) -----
  {
    matcher: ({ url }: { url: URL }) => url.hostname.endsWith(".r2.dev"),
    handler: new CacheFirst({
      cacheName: "r2-photos",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },

  // ----- Public HTML pages: SWR so the offline shell stays usable -----
  {
    matcher: ({ url, request }: { url: URL; request: Request }) =>
      request.destination === "document" && !url.pathname.startsWith("/admin"),
    handler: new StaleWhileRevalidate({
      cacheName: "public-pages",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...customRuntimeCaching, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/survey/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();

// Note: Offline sync is handled by the app-level IndexedDB queue
// (lib/offline-sync.ts + SyncWatcher), not by the service worker.
