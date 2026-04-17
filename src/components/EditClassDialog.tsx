import { useEffect, useMemo, useState } from "react";
import type { ClassInfo, CourseAssistant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditClassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: ClassInfo;
  onSave: (next: ClassInfo) => void;
};

export function EditClassDialog({ open, onOpenChange, value, onSave }: EditClassDialogProps) {
  const initial = useMemo(() => value, [value]);
  const [draft, setDraft] = useState<ClassInfo>(value);

  useEffect(() => {
    if (open) {
      const withAssistants: ClassInfo =
        value.assistants?.length || !value.ta?.trim()
          ? value
          : {
              ...value,
              assistants: [
                {
                  name: value.ta.trim(),
                  role: "TA",
                  email: value.taEmail?.trim() || undefined,
                },
              ],
            };
      setDraft(withAssistants);
    }
  }, [open, value]);

  const canSave = draft.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit class</DialogTitle>
          <DialogDescription>Update the class details and color.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Class name</label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="CS 301 - Data Structures"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Short code</label>
            <Input
              value={draft.code ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
              placeholder="CS 301"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={draft.color ?? "#3B82F6"}
                onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
                className="h-9 w-12 rounded border border-input bg-transparent p-1"
                aria-label="Class color"
              />
              <Input
                value={draft.color ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Instructor</label>
            <Input
              value={draft.instructor ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, instructor: e.target.value || undefined }))}
              placeholder="Dr. Sarah Chen"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Instructor email</label>
            <Input
              value={draft.instructorEmail ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, instructorEmail: e.target.value || undefined }))
              }
              placeholder="name@university.edu"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Office hours</label>
            <Input
              value={draft.officeHours ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, officeHours: e.target.value || undefined }))}
              placeholder="Mon/Wed 2–4 PM, Room 312"
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-foreground">TAs, CAs, and other staff</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    assistants: [...(d.assistants ?? []), { name: "", role: "TA" }],
                  }))
                }
              >
                Add person
              </Button>
            </div>
            {(draft.assistants ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No assistants listed.</p>
            ) : (
              <div className="space-y-3">
                {(draft.assistants ?? []).map((row, i) => (
                  <div
                    key={i}
                    className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2"
                  >
                    <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
                      <Input
                        value={row.name}
                        onChange={(e) => {
                          const next = [...(draft.assistants ?? [])];
                          next[i] = { ...row, name: e.target.value };
                          setDraft((d) => ({ ...d, assistants: next }));
                        }}
                        placeholder="Name"
                      />
                      <Input
                        value={row.role ?? ""}
                        onChange={(e) => {
                          const next = [...(draft.assistants ?? [])];
                          next[i] = { ...row, role: e.target.value || undefined };
                          setDraft((d) => ({ ...d, assistants: next }));
                        }}
                        placeholder="Role (TA, CA, …)"
                      />
                    </div>
                    <Input
                      value={row.email ?? ""}
                      onChange={(e) => {
                        const next = [...(draft.assistants ?? [])];
                        next[i] = { ...row, email: e.target.value || undefined };
                        setDraft((d) => ({ ...d, assistants: next }));
                      }}
                      placeholder="Email"
                    />
                    <Input
                      value={row.phone ?? ""}
                      onChange={(e) => {
                        const next = [...(draft.assistants ?? [])];
                        next[i] = { ...row, phone: e.target.value || undefined };
                        setDraft((d) => ({ ...d, assistants: next }));
                      }}
                      placeholder="Phone"
                    />
                    <Input
                      className="sm:col-span-2"
                      value={row.officeHours ?? ""}
                      onChange={(e) => {
                        const next = [...(draft.assistants ?? [])];
                        next[i] = { ...row, officeHours: e.target.value || undefined };
                        setDraft((d) => ({ ...d, assistants: next }));
                      }}
                      placeholder="Their office / help hours"
                    />
                    <div className="sm:col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          const next = (draft.assistants ?? []).filter((_, j) => j !== i);
                          setDraft((d) => ({ ...d, assistants: next.length ? next : undefined }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(initial);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!canSave) return;
              const assistants = (draft.assistants ?? [])
                .map((a): CourseAssistant => ({
                  name: a.name.trim(),
                  role: a.role?.trim() || undefined,
                  email: a.email?.trim() || undefined,
                  phone: a.phone?.trim() || undefined,
                  officeHours: a.officeHours?.trim() || undefined,
                }))
                .filter((a) => a.name.length > 0);
              onSave({
                ...draft,
                name: draft.name.trim(),
                assistants: assistants.length ? assistants : undefined,
              });
              onOpenChange(false);
            }}
            disabled={!canSave}
            className="bg-black text-white hover:bg-zinc-800"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

