"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

type BulkAction = "verify" | "flag" | "duplicate" | "pending";

type Props = {
  selectedIds: string[];
  onClearSelection: () => void;
};

export function BulkActions({ selectedIds, onClearSelection }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const count = selectedIds.length;

  async function performAction(action: BulkAction, reason?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action, reason }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Request failed");
      }
      const data = (await res.json()) as { updated: number };
      toast.push({
        variant: "success",
        title: `Updated ${data.updated} response${data.updated === 1 ? "" : "s"}`,
      });
      onClearSelection();
      router.refresh();
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Bulk action failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  if (count === 0) return null;

  return (
    <>
      <div
        role="toolbar"
        aria-label="Bulk actions"
        className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 shadow"
      >
        <span className="text-sm font-medium text-brand-800">
          {count} selected
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={() => performAction("verify")}
          >
            Verify selected
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={() => setFlagModalOpen(true)}
          >
            Flag selected
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={() => performAction("duplicate")}
          >
            Mark duplicate
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={() => performAction("pending")}
          >
            Reset to pending
          </Button>
        </div>
        <button
          type="button"
          className="text-xs text-slate-500 hover:text-slate-800"
          onClick={onClearSelection}
          aria-label="Clear selection"
        >
          Clear
        </button>
      </div>

      <Modal
        open={flagModalOpen}
        onClose={() => {
          setFlagModalOpen(false);
          setFlagReason("");
        }}
        title={`Flag ${count} response${count === 1 ? "" : "s"}`}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="flag-reason"
              className="mb-1.5 block text-sm font-medium text-slate-800"
            >
              Reason (optional)
            </label>
            <Input
              id="flag-reason"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Describe the issue…"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFlagModalOpen(false);
                setFlagReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={loading}
              onClick={async () => {
                setFlagModalOpen(false);
                await performAction("flag", flagReason || undefined);
                setFlagReason("");
              }}
            >
              Flag responses
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
