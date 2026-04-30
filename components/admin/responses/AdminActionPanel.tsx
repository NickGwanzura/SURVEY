"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/admin/Badge";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { SubmissionStatus } from "@/lib/constants/challenges";

const notesSchema = z.object({
  notes: z.string().trim().max(5000),
});

type NotesForm = z.infer<typeof notesSchema>;

type Props = {
  surveyId: string;
  currentStatus: SubmissionStatus;
  currentNotes: string | null;
};

export function AdminActionPanel({ surveyId, currentStatus, currentNotes }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<NotesForm>({
    resolver: zodResolver(notesSchema),
    defaultValues: { notes: currentNotes ?? "" },
  });

  async function patchStatus(status: SubmissionStatus, flagReasonVal?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/responses/${surveyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(flagReasonVal ? { flagReason: flagReasonVal } : {}),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Request failed");
      }
      toast.push({ variant: "success", title: `Status updated to ${status}` });
      router.refresh();
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Failed to update status",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveNotes(data: NotesForm) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/responses/${surveyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: data.notes || null }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Request failed");
      }
      toast.push({ variant: "success", title: "Notes saved" });
      router.refresh();
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Failed to save notes",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteResponse() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/responses/${surveyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Request failed");
      }
      toast.push({ variant: "success", title: "Response deleted" });
      router.push("/admin/responses");
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Failed to delete response",
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setLoading(false);
    }
  }

  return (
    <>
      <aside
        aria-label="Admin actions"
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current status
          </p>
          <StatusBadge status={currentStatus} />
        </div>

        <hr className="border-slate-100" />

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Change status
          </p>
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            disabled={currentStatus === "verified"}
            onClick={() => patchStatus("verified")}
          >
            Mark as verified
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            disabled={currentStatus === "flagged"}
            onClick={() => setFlagModalOpen(true)}
          >
            Flag for review
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            disabled={currentStatus === "duplicate"}
            onClick={() => patchStatus("duplicate")}
          >
            Mark as duplicate
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            disabled={currentStatus === "pending"}
            onClick={() => patchStatus("pending")}
          >
            Reset to pending
          </Button>
        </div>

        <hr className="border-slate-100" />

        <form onSubmit={handleSubmit(saveNotes)} className="flex flex-col gap-2">
          <Field label="Admin notes" htmlFor="admin-notes">
            <Textarea
              id="admin-notes"
              placeholder="Internal notes visible only to admins…"
              {...register("notes")}
            />
          </Field>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={loading}
            disabled={!isDirty}
          >
            Save notes
          </Button>
        </form>

        <hr className="border-slate-100" />

        <Button
          variant="danger"
          size="sm"
          loading={loading}
          onClick={() => setDeleteModalOpen(true)}
        >
          Delete response
        </Button>
      </aside>

      {/* Flag modal */}
      <Modal
        open={flagModalOpen}
        onClose={() => {
          setFlagModalOpen(false);
          setFlagReason("");
        }}
        title="Flag for review"
      >
        <div className="flex flex-col gap-4">
          <Field label="Reason (optional)" htmlFor="flag-reason-detail">
            <Input
              id="flag-reason-detail"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Describe the issue…"
            />
          </Field>
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
                await patchStatus("flagged", flagReason || undefined);
                setFlagReason("");
              }}
            >
              Flag response
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete response?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-700">
            This action is permanent and cannot be undone. The submission and
            all associated audit logs will be permanently removed.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={loading}
              onClick={() => {
                setDeleteModalOpen(false);
                void deleteResponse();
              }}
            >
              Delete permanently
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
