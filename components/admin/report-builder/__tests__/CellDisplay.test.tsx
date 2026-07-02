import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CellDisplay } from "@/components/admin/report-builder/CellDisplay";

describe("CellDisplay", () => {
  // --- Status ---
  it("renders a StatusBadge for status field", () => {
    const { container } = render(<CellDisplay fieldKey="status" value="verified" />);
    expect(container.querySelector("span")).toBeInTheDocument();
    expect(container.textContent).toBe("Verified");
  });

  it("renders Pending status badge", () => {
    const { container } = render(<CellDisplay fieldKey="status" value="pending" />);
    expect(container.textContent).toBe("Pending");
  });

  it("renders Flagged status badge", () => {
    const { container } = render(<CellDisplay fieldKey="status" value="flagged" />);
    expect(container.textContent).toBe("Flagged");
  });

  it("renders Duplicate status badge", () => {
    const { container } = render(<CellDisplay fieldKey="status" value="duplicate" />);
    expect(container.textContent).toBe("Duplicate");
  });

  // --- Boolean fields ---
  it('renders "Yes" for boolean field with value "yes"', () => {
    render(<CellDisplay fieldKey="hasCertification" value="yes" />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it('renders "No" for boolean field with value "no"', () => {
    render(<CellDisplay fieldKey="hasFormalTraining" value="no" />);
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders em dash for boolean field with null", () => {
    const { container } = render(<CellDisplay fieldKey="consentToContact" value={null} />);
    expect(container.textContent).toBe("\u2014");
  });

  it("renders em dash for boolean field with undefined", () => {
    const { container } = render(<CellDisplay fieldKey="consentToPublicRegistry" value={undefined} />);
    expect(container.textContent).toBe("\u2014");
  });

  it('renders raw value for unexpected boolean field value', () => {
    render(<CellDisplay fieldKey="installsEnergyEfficient" value="sometimes" />);
    expect(screen.getByText("sometimes")).toBeInTheDocument();
  });

  // --- Date field ---
  it("formats submittedAt as a readable date", () => {
    const { container } = render(<CellDisplay fieldKey="submittedAt" value="2024-03-15T14:30:00.000Z" />);
    expect(container.textContent).toContain("Mar");
    expect(container.textContent).toContain("2024");
  });

  it("renders em dash for null submittedAt", () => {
    const { container } = render(<CellDisplay fieldKey="submittedAt" value={null} />);
    expect(container.textContent).toBe("\u2014");
  });

  // --- Null / undefined generic ---
  it("renders em dash for null generic value", () => {
    const { container } = render(<CellDisplay fieldKey="province" value={null} />);
    expect(container.textContent).toBe("\u2014");
  });

  it("renders em dash for undefined generic value", () => {
    const { container } = render(<CellDisplay fieldKey="city" value={undefined} />);
    expect(container.textContent).toBe("\u2014");
  });

  // --- Array ---
  it("joins array values with comma", () => {
    render(<CellDisplay fieldKey="mainWorkFocus" value={["a", "b", "c"]} />);
    expect(screen.getByText("a, b, c")).toBeInTheDocument();
  });

  it("handles empty array", () => {
    const { container } = render(<CellDisplay fieldKey="mainWorkFocus" value={[]} />);
    expect(container.textContent).toBe("");
  });

  // --- String fallback ---
  it("renders plain string for text fields", () => {
    render(<CellDisplay fieldKey="firstName" value="John" />);
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  it("renders number as string for numeric fields", () => {
    render(<CellDisplay fieldKey="yearsExperience" value={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
