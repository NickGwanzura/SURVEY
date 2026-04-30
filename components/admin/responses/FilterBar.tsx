"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  PROVINCE_LABELS,
  DISTRICTS_BY_PROVINCE,
  PROVINCES,
  MAIN_WORK_FOCUS_LABELS,
  MAIN_WORK_FOCUS,
  YEARS_EXPERIENCE_LABELS,
  EDUCATION_LEVEL_LABELS,
} from "@/lib/admin/labels";
import { YEARS_EXPERIENCE } from "@/lib/constants/ageGroups";
import { EDUCATION_LEVELS } from "@/lib/constants/educationLevels";
import {
  HAS_CERTIFICATION_LABELS,
  HAS_CERTIFICATION_OPTIONS,
} from "@/lib/constants/refrigerants";
import type { Province } from "@/lib/constants/provinces";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "flagged", label: "Flagged" },
  { value: "duplicate", label: "Duplicate" },
] as const;

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state mirrors searchParams so we can update URL on change
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [province, setProvince] = useState(searchParams.get("province") ?? "");
  const [district, setDistrict] = useState(searchParams.get("district") ?? "");
  const [mainWorkFocus, setMainWorkFocus] = useState(searchParams.get("mainWorkFocus") ?? "");
  const [hasCertification, setHasCertification] = useState(searchParams.get("hasCertification") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [yearsExperience, setYearsExperience] = useState(searchParams.get("yearsExperience") ?? "");
  const [educationLevel, setEducationLevel] = useState(searchParams.get("educationLevel") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") ?? "");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 on filter change
      params.set("page", "1");

      const all = {
        q,
        province,
        district,
        mainWorkFocus,
        hasCertification,
        status,
        yearsExperience,
        educationLevel,
        dateFrom,
        dateTo,
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
    [
      router,
      pathname,
      searchParams,
      q, province, district, mainWorkFocus, hasCertification,
      status, yearsExperience, educationLevel, dateFrom, dateTo,
    ],
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
    setDistrict("");
    setMainWorkFocus("");
    setHasCertification("");
    setStatus("");
    setYearsExperience("");
    setEducationLevel("");
    setDateFrom("");
    setDateTo("");
    router.replace(pathname);
  };

  const districtOptions =
    province && DISTRICTS_BY_PROVINCE[province as Province]
      ? DISTRICTS_BY_PROVINCE[province as Province]
      : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="filter-q" className="sr-only">
            Search by name or phone
          </label>
          <Input
            id="filter-q"
            placeholder="Search by name or phone…"
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="filter-status" className="sr-only">
            Status
          </label>
          <Select
            id="filter-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              pushParams({ status: e.target.value });
            }}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
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
              const val = e.target.value;
              setProvince(val);
              setDistrict(""); // reset district when province changes
              pushParams({ province: val, district: "" });
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

        {/* District — only shown when a province is selected */}
        {province ? (
          <div>
            <label htmlFor="filter-district" className="sr-only">
              District
            </label>
            <Select
              id="filter-district"
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                pushParams({ district: e.target.value });
              }}
            >
              <option value="">All districts</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {/* Main work focus */}
        <div>
          <label htmlFor="filter-focus" className="sr-only">
            Main work focus
          </label>
          <Select
            id="filter-focus"
            value={mainWorkFocus}
            onChange={(e) => {
              setMainWorkFocus(e.target.value);
              pushParams({ mainWorkFocus: e.target.value });
            }}
          >
            <option value="">All work focus</option>
            {MAIN_WORK_FOCUS.map((f) => (
              <option key={f} value={f}>
                {MAIN_WORK_FOCUS_LABELS[f]}
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

        {/* Years experience */}
        <div>
          <label htmlFor="filter-years" className="sr-only">
            Years of experience
          </label>
          <Select
            id="filter-years"
            value={yearsExperience}
            onChange={(e) => {
              setYearsExperience(e.target.value);
              pushParams({ yearsExperience: e.target.value });
            }}
          >
            <option value="">Any experience</option>
            {YEARS_EXPERIENCE.map((y) => (
              <option key={y} value={y}>
                {YEARS_EXPERIENCE_LABELS[y]}
              </option>
            ))}
          </Select>
        </div>

        {/* Education level */}
        <div>
          <label htmlFor="filter-edu" className="sr-only">
            Education level
          </label>
          <Select
            id="filter-edu"
            value={educationLevel}
            onChange={(e) => {
              setEducationLevel(e.target.value);
              pushParams({ educationLevel: e.target.value });
            }}
          >
            <option value="">Any education</option>
            {EDUCATION_LEVELS.map((e) => (
              <option key={e} value={e}>
                {EDUCATION_LEVEL_LABELS[e]}
              </option>
            ))}
          </Select>
        </div>

        {/* Date from */}
        <div>
          <label htmlFor="filter-date-from" className="sr-only">
            Submitted from
          </label>
          <Input
            id="filter-date-from"
            type="date"
            value={dateFrom}
            aria-label="Submitted from"
            placeholder="From date"
            onChange={(e) => {
              setDateFrom(e.target.value);
              pushParams({ dateFrom: e.target.value });
            }}
          />
        </div>

        {/* Date to */}
        <div>
          <label htmlFor="filter-date-to" className="sr-only">
            Submitted to
          </label>
          <Input
            id="filter-date-to"
            type="date"
            value={dateTo}
            aria-label="Submitted to"
            placeholder="To date"
            onChange={(e) => {
              setDateTo(e.target.value);
              pushParams({ dateTo: e.target.value });
            }}
          />
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
