"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function MessagingPage() {
  const toast = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<
    "technicians" | "admins"
  >("technicians");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "verified" | "pending" | "flagged" | "duplicate"
  >("all");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) return;

    setSending(true);

    try {
      const res = await fetch("/api/admin/messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          recipientType,
          filterStatus: recipientType === "admins" ? "all" : filterStatus,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        toast.push({
          variant: "error",
          title: "Failed to send message",
          description: json?.error ?? `Request failed (HTTP ${res.status})`,
        });
        return;
      }

      toast.push({
        variant: "success",
        title: "Message sent",
        description: `${json.sent} of ${json.total} delivered${json.failed > 0 ? ` (${json.failed} failed)` : ""}.`,
      });
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Failed to send message",
        description: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setSending(false);
    }
  }

  const charactersLeft = 10000 - message.length;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Message Board
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Send broadcast messages to technicians or admin users via email.
        </p>
      </div>

      {/* Compose form */}
      <form onSubmit={handleSend} className="flex flex-col gap-6">
        {/* Recipient filter */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Recipients
          </h2>
          <label className="text-xs font-medium text-slate-500">
            Recipient group
          </label>
          <select
            value={recipientType}
            onChange={(e) => setRecipientType(e.target.value as "technicians" | "admins")}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
          >
            <option value="technicians">Technicians (filter by status)</option>
            <option value="admins">Admin users</option>
          </select>

          {recipientType === "technicians" ? (
            <>
              <label className="mt-3 block text-xs font-medium text-slate-500">
                Technician status filter
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-brand-600"
              >
                <option value="all">All statuses (anyone with an email)</option>
                <option value="verified">Verified only</option>
                <option value="pending">Pending only</option>
                <option value="flagged">Flagged only</option>
                <option value="duplicate">Duplicates only</option>
              </select>
            </>
          ) : null}

          <p className="mt-1.5 text-xs text-slate-400">
            {recipientType === "admins"
              ? "Messages are sent to all active admin users (admin & super_admin roles)."
              : "Messages are sent to all registered technicians with an email address matching the selected status."}
          </p>
        </section>

        {/* Message body */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Message
          </h2>

          <label htmlFor="msg-subject" className="block text-xs font-medium text-slate-500">
            Subject
          </label>
          <input
            id="msg-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Training Workshop Invitation"
            maxLength={200}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-brand-600"
          />

          <label htmlFor="msg-body" className="mt-4 block text-xs font-medium text-slate-500">
            Message body
          </label>
          <textarea
            id="msg-body"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here...&#10;&#10;Line breaks create separate paragraphs."
            rows={10}
            maxLength={10000}
            required
            className="mt-1 block w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-brand-600"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {charactersLeft.toLocaleString()} characters remaining
          </p>
        </section>

        {/* Preview */}
        {subject.trim() || message.trim() ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Preview
            </h2>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {subject || "(no subject)"}
              </p>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {message || "(empty)"}
              </div>
            </div>
          </section>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSubject("");
              setMessage("");
              setFilterStatus("all");
            }}
          >
            Clear
          </Button>
          <Button
            type="submit"
            loading={sending}
            disabled={!subject.trim() || !message.trim()}
          >
            {sending ? "Sending…" : "Send Message"}
          </Button>
        </div>
      </form>
    </div>
  );
}
