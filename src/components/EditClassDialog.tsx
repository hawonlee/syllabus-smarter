import { useEffect, useMemo, useState } from "react";
import type { ClassInfo } from "@/lib/types";
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
    if (open) setDraft(value);
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
              onSave({ ...draft, name: draft.name.trim() });
              onOpenChange(false);
            }}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

