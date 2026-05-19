import { describe, it, expect } from "vitest";
import { formatCellDate } from "@/lib/report-builder-utils";

describe("formatCellDate", () => {
  it("returns em dash for null", () => {
    expect(formatCellDate(null)).toBe("\u2014");
  });

  it("returns em dash for undefined", () => {
    expect(formatCellDate(undefined)).toBe("\u2014");
  });

  it("returns em dash for empty string", () => {
    expect(formatCellDate("")).toBe("\u2014");
  });

  it("returns the raw string when value is not a date", () => {
    expect(formatCellDate("hello")).toBe("hello");
  });

  it("returns the raw string for a number", () => {
    expect(formatCellDate(42)).toBe("42");
  });

  it("formats a full ISO date string correctly", () => {
    const result = formatCellDate("2024-03-15T14:30:00.000Z");
    // en-ZA locale: "15 Mar 2024, 16:30" (SAST = UTC+2)
    expect(result).toContain("Mar");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("formats a date-only string (YYYY-MM-DD) correctly", () => {
    const result = formatCellDate("2024-06-01");
    expect(result).toContain("Jun");
    expect(result).toContain("2024");
    expect(result).toContain("01");
  });

  it("handles edge date value", () => {
    const result = formatCellDate("2024-01-01T00:00:00.000Z");
    expect(result).toContain("Jan");
    expect(result).toContain("2024");
  });

  it("returns raw string for malformed date-like input", () => {
    expect(formatCellDate("2024-13-01")).toBe("2024-13-01");
  });
});
