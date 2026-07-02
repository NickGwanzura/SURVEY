"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  PROVINCE_LABELS,
  PROVINCES,
  HAS_CERTIFICATION_LABELS,
} from "@/lib/admin/labels";
import { HAS_CERTIFICATION_OPTIONS } from "@/lib/constants/refrigerants";

export function TechniciansDirectoryFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [province, setProvince] = useState(searchParams.get("province") ?? "");
  const [hasCertification, setHasCertification] = useState(searchParams.get("hasCertification") ?? "");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 on filter change
      params.set("page", "1");

      const all = {
        q,
        province,
        hasCertification,
        ...overrides,
      };

      for (const [key, value] of Object.entries(all)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, q, province, hasCertification],
  );

  // Debounced search
  const handleSearch = useCallback(
    (value: string) => {
      setQ(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushParams({ q: value });
      }, 400);
    },
    [pushParams],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleReset = () => {
    setQ("");
    setProvince("");
    setHasCertification("");
    router.replace(pathname);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="sm:col-span-2">
          <label htmlFor="filter-q" className="sr-only">
            Search by name, phone, email, or card number
          </label>
          <Input
            id="filter-q"
            placeholder="Search by name, phone, email, or card number…"
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Province */}
        <div>
          <label htmlFor="filter-province" className="sr-only">
            Province
          </label>
          <Select
            id="filter-province"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              pushParams({ province: e.target.value });
            }}
          >
            <option value="">All provinces</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {PROVINCE_LABELS[p]}
              </option>
            ))}
          </Select>
        </div>

        {/* Has certification */}
        <div>
          <label htmlFor="filter-cert" className="sr-only">
            Has certification
          </label>
          <Select
            id="filter-cert"
            value={hasCertification}
            onChange={(e) => {
              setHasCertification(e.target.value);
              pushParams({ hasCertification: e.target.value });
            }}
          >
            <option value="">Any certification</option>
            {HAS_CERTIFICATION_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {HAS_CERTIFICATION_LABELS[c]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" type="button" onClick={handleReset}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
