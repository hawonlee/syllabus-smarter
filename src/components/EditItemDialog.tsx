import { useEffect, useMemo, useState } from "react";
import type { ExtractedItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: ExtractedItem;
  onSave: (next: ExtractedItem) => void;
};

const ITEM_TYPES: ExtractedItem["type"][] = ["assignment", "exam", "quiz", "project", "other"];

export function EditItemDialog({ open, onOpenChange, value, onSave }: EditItemDialogProps) {
  const initial = useMemo(() => value, [value]);
  const [draft, setDraft] = useState<ExtractedItem>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const canSave = draft.name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(draft.dueDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
          <DialogDescription>Update the assignment/exam details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <Select
              value={draft.type}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, type: v as ExtractedItem["type"] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ITEM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Due date</label>
              <Input
                type="date"
                value={draft.dueDate}
                onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Weight (%)</label>
              <Input
                type="number"
                inputMode="numeric"
                value={draft.weight ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const n = raw === "" ? undefined : Number(raw);
                  setDraft((d) => ({ ...d, weight: Number.isFinite(n) ? n : undefined }));
                }}
                placeholder="—"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={draft.description ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value || undefined }))
              }
              placeholder="Optional"
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

