"use client";

import { type IDBPDatabase, openDB } from "idb";

import type { SurveySubmission } from "./validation";

const DB_NAME = "zw-rac-survey";
const DB_VERSION = 1;
const SUBMISSIONS_STORE = "submissions";
const PHOTOS_STORE = "photos";

export type QueuedSubmission = {
  id: string;
  payload: SurveySubmission;
  createdAt: number;
  attempts: number;
  lastAttemptAt?: number;
  lastError?: string;
};

export type QueuedPhoto = {
  id: string;
  blob: Blob;
  contentType: string;
  createdAt: number;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (typeof window === "undefined") {
    throw new Error("offline-sync can only run in the browser.");
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(SUBMISSIONS_STORE)) {
          database.createObjectStore(SUBMISSIONS_STORE, { keyPath: "id" });
        }
        if (!database.objectStoreNames.contains(PHOTOS_STORE)) {
          database.createObjectStore(PHOTOS_STORE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function queueSubmission(
  payload: SurveySubmission,
): Promise<QueuedSubmission> {
  const db = await getDb();
  const entry: QueuedSubmission = {
    id: crypto.randomUUID(),
    payload,
    createdAt: Date.now(),
    attempts: 0,
  };
  await db.put(SUBMISSIONS_STORE, entry);
  return entry;
}

export async function listQueuedSubmissions(): Promise<QueuedSubmission[]> {
  const db = await getDb();
  return db.getAll(SUBMISSIONS_STORE);
}

export async function removeQueuedSubmission(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(SUBMISSIONS_STORE, id);
}

export async function markSubmissionAttempt(
  id: string,
  error?: string,
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SUBMISSIONS_STORE, "readwrite");
  const existing = (await tx.store.get(id)) as QueuedSubmission | undefined;
  if (existing) {
    existing.attempts += 1;
    existing.lastAttemptAt = Date.now();
    existing.lastError = error;
    await tx.store.put(existing);
  }
  await tx.done;
}

export async function flushQueuedSubmissions(): Promise<{
  succeeded: number;
  failed: number;
}> {
  const queued = await listQueuedSubmissions();
  let succeeded = 0;
  let failed = 0;
  for (const entry of queued) {
    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...entry.payload,
          submissionSource: "pwa_offline_sync",
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        await markSubmissionAttempt(entry.id, text || `HTTP ${res.status}`);
        failed += 1;
        continue;
      }
      await removeQueuedSubmission(entry.id);
      succeeded += 1;
    } catch (err) {
      await markSubmissionAttempt(
        entry.id,
        err instanceof Error ? err.message : String(err),
      );
      failed += 1;
    }
  }
  return { succeeded, failed };
}

export async function queuePhoto(
  blob: Blob,
  contentType: string,
): Promise<QueuedPhoto> {
  const db = await getDb();
  const entry: QueuedPhoto = {
    id: crypto.randomUUID(),
    blob,
    contentType,
    createdAt: Date.now(),
  };
  await db.put(PHOTOS_STORE, entry);
  return entry;
}

export async function removeQueuedPhoto(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(PHOTOS_STORE, id);
}

export const SURVEY_DRAFT_LS_KEY = "zw-rac-survey-draft-v1";
