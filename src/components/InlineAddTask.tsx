import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
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
import type { ExtractedItem } from "@/lib/types";

const ITEM_TYPES: ExtractedItem["type"][] = ["assignment", "exam", "quiz", "project", "other"];

function newItemId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type InlineAddTaskProps = {
  /** Stored on each item as `className` (calendar / grouping). */
  classNameLabel: string;
  onAdd: (item: ExtractedItem) => void;
};

export function InlineAddTask({ classNameLabel, onAdd }: InlineAddTaskProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ExtractedItem["type"]>("assignment");
  const [dueDate, setDueDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");

  const resetDefaults = () => {
    setType("assignment");
    setDueDate(format(new Date(), "yyyy-MM-dd"));
  };

  const canSubmit =
    name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dueDate);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return;
    const w = weight.trim() === "" ? undefined : Number(weight);
    onAdd({
      id: newItemId(),
      name: trimmed,
      type,
      dueDate,
      className: classNameLabel,
      weight: Number.isFinite(w) ? w : undefined,
      description: description.trim() || undefined,
    });
    setName("");
    setWeight("");
    setDescription("");
    resetDefaults();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-2"
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Add task
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Name (assignment, exam, …)"
          className="sm:min-w-[160px] sm:flex-1"
          aria-label="Task name"
        />
        <Select value={type} onValueChange={(v) => setType(v as ExtractedItem["type"])}>
          <SelectTrigger className="w-full sm:w-[130px]" aria-label="Task type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {ITEM_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full sm:w-[140px]"
          aria-label="Due date"
        />
        <Input
          type="number"
          inputMode="numeric"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="% weight"
          className="w-full sm:w-[88px]"
          min={0}
          max={100}
          aria-label="Weight percent"
        />
        <Button
          type="submit"
          size="sm"
          className="w-full sm:w-auto shrink-0 gap-1"
          disabled={!canSubmit}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Notes (optional)"
        className="min-h-[52px] resize-y text-sm"
        rows={2}
        aria-label="Description"
      />
    </form>
  );
}
