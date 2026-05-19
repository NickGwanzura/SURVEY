"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export function InviteAdminModal() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("admin");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !name) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });

      const json = (await res.json()) as { error?: string; invited?: boolean };

      if (!res.ok) {
        toast.push({
          variant: "error",
          title: "Invite failed",
          description: json.error ?? "Something went wrong.",
        });
        return;
      }

      toast.push({
        variant: "success",
        title: "Invitation sent",
        description: `An invitation email has been sent to ${email}.`,
      });
      setOpen(false);
      setEmail("");
      setName("");
      setRole("admin");
      router.refresh();
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Invite failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="mr-1.5"
        >
          <path
            d="M8 3v10M3 8h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Invite Admin
      </Button>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEmail("");
          setName("");
          setRole("admin");
        }}
        title="Invite an admin"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full name" required htmlFor="invite-name">
            <Input
              id="invite-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tatenda Moyo"
            />
          </Field>
          <Field label="Email address" required htmlFor="invite-email">
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tatenda@example.com"
            />
          </Field>
          <Field label="Role" htmlFor="invite-role">
            <Select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpen(false);
                setEmail("");
                setName("");
                setRole("admin");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={!email || !name}>
              Send invitation
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
