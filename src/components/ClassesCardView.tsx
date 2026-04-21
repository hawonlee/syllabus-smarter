import { format } from "date-fns";
import { motion } from "framer-motion";
import type { SyllabusData } from "@/lib/types";
import { parseDateOnly } from "@/lib/date";
import { getUrgency } from "@/lib/urgency";
import { ClassInfoBar } from "@/components/ClassInfoBar";
import { Edit2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ClassInfo, ExtractedItem } from "@/lib/types";
import { EditClassDialog } from "@/components/EditClassDialog";
import { EditItemDialog } from "@/components/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { InlineAddTask } from "@/components/InlineAddTask";
import { Checkbox } from "@/components/ui/checkbox";
import type { ReactNode } from "react";

const urgencyColor: Record<string, string> = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
  overdue: "#DC2626",
};

const typeBadge: Record<string, string> = {
  assignment: "bg-urgency-low/10 text-urgency-low",
  exam: "bg-urgency-critical/10 text-urgency-critical",
  quiz: "bg-urgency-medium/10 text-urgency-medium",
  project: "bg-urgency-high/10 text-urgency-high",
  other: "bg-muted text-muted-foreground",
};

type ClassesCardViewProps = {
  classes: SyllabusData[];
  completedTaskIds: Set<string>;
  onEditClass: (classId: string, nextInfo: ClassInfo) => void;
  onDeleteClass: (classId: string) => void;
  onEditItem: (classId: string, itemId: string, nextItem: ExtractedItem) => void;
  onDeleteItem: (classId: string, itemId: string) => void;
  onAddItem: (classId: string, item: ExtractedItem) => void;
  onToggleTaskCompletion: (itemId: string, checked: boolean) => void;
  emptyState?: ReactNode;
};

export function ClassesCardView({
  classes,
  completedTaskIds,
  onEditClass,
  onDeleteClass,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onToggleTaskCompletion,
  emptyState,
}: ClassesCardViewProps) {
  const getDueDateLabel = (dueDate?: string) => {
    if (!dueDate?.trim()) return "No due date";
    const parsed = parseDateOnly(dueDate);
    if (!parsed) return "No due date";
    return Number.isNaN(parsed.getTime()) ? "No due date" : format(parsed, "MMM d, yyyy");
  };

  const sortedClasses = [...classes].sort((a, b) =>
    a.classInfo.name.localeCompare(b.classInfo.name)
  );

  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ classId: string; item: ExtractedItem } | null>(
    null
  );
  const [deletingItem, setDeletingItem] = useState<{ classId: string; item: ExtractedItem } | null>(
    null
  );

  const editingClass = useMemo(
    () => sortedClasses.find((c) => c.id === editingClassId) ?? null,
    [editingClassId, sortedClasses]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2">
      {sortedClasses.length === 0 ? (
        <>{emptyState ?? null}</>
      ) : (
        sortedClasses.map((klass, classIndex) => {
        const classItems = [...klass.items].sort(
          (a, b) =>
            (parseDateOnly(a.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY) -
            (parseDateOnly(b.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY)
        );
        const classId = klass.id || `${klass.classInfo.name}-${classIndex}`;
        const itemClassName =
          klass.classInfo.code?.trim() ||
          klass.classInfo.name.split(" - ")?.[0]?.trim() ||
          klass.classInfo.name;

        return (
          <motion.div
            key={`${klass.classInfo.name}-${classIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: classIndex * 0.04 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 w-full">
                <div className="flex items-center justify-between min-w-0">
                 <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex max-w-full items-center rounded-md px-3.5 py-1 text-sm "
                        style={{ backgroundColor: `${klass.classInfo.color ?? "#3B82F6"}20` }}
                      >
                        <span
                          className="truncate"
                          style={{ color: `${klass.classInfo.color ?? "#3B82F6"}` }}
                        >
                          {klass.classInfo.name}
                        </span>
                      </span>
                    </div>
                 </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {classItems.length} item{classItems.length === 1 ? "" : "s"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingClassId(classId)}
                      className="p-1.5 rounded-md hover:bg-accent transition-colors"
                      aria-label="Edit class"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingClassId(classId)}
                      className="p-1.5 rounded-md hover:bg-accent transition-colors"
                      aria-label="Delete class"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 w-full">
                  <ClassInfoBar info={klass.classInfo} />
                </div>
              </div>

            </div>

            <div className="mt-4 space-y-2">
              {classItems.map((item) => {
                const urgency = getUrgency(item.dueDate);
                const isCompleted = completedTaskIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2 rounded-lg border border-border/70 px-3 py-2 ${
                      isCompleted ? "bg-muted/40" : "bg-background/60"
                    }`}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={(checked) => onToggleTaskCompletion(item.id, checked === true)}
                      aria-label={`Mark ${item.name} complete`}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs font-medium truncate ${
                            isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                          }`}
                        >
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] text-muted-foreground font-medium uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap `}
                          >
                            {item.type}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingItem({ classId, item })}
                            className="p-1 rounded hover:bg-accent transition-colors"
                            aria-label="Edit item"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingItem({ classId, item })}
                            className="p-1 rounded hover:bg-accent transition-colors"
                            aria-label="Delete item"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {parseDateOnly(item.dueDate) ? (
                          <span
                            className="inline-flex items-center rounded-md px-2 py-0.5 font-medium"
                            style={{
                              backgroundColor: `${urgencyColor[urgency]}10`,
                              color: `${urgencyColor[urgency]}`,
                            }}
                          >
                            {getDueDateLabel(item.dueDate)}
                          </span>
                        ) : (
                          <span>{getDueDateLabel(item.dueDate)}</span>
                        )}
                        <span>{item.weight ? `· ${item.weight}%` : "· No grade distribution detected"}</span>
                        {/* <span className="ml-auto text-[10px]">{getUrgencyLabel(urgency)}</span> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <InlineAddTask
                classNameLabel={itemClassName}
                onAdd={(item, _selectedClassId) => onAddItem(classId, item)}
              />
            </div>
          </motion.div>
        );
        })
      )}

      {editingClass && (
        <EditClassDialog
          open={!!editingClassId}
          onOpenChange={(open) => setEditingClassId(open ? editingClassId : null)}
          value={editingClass.classInfo}
          onSave={(next) => onEditClass(editingClass.id as string, next)}
        />
      )}

      {editingItem && (
        <EditItemDialog
          open={!!editingItem}
          onOpenChange={(open) => setEditingItem(open ? editingItem : null)}
          value={editingItem.item}
          onSave={(next) => onEditItem(editingItem.classId, editingItem.item.id, next)}
        />
      )}

      {deletingClassId && (
        <ConfirmDeleteDialog
          open={!!deletingClassId}
          onOpenChange={(open) => setDeletingClassId(open ? deletingClassId : null)}
          title="Delete class?"
          description="This will permanently remove the class and all its items."
          onConfirm={() => {
            onDeleteClass(deletingClassId);
            setDeletingClassId(null);
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDeleteDialog
          open={!!deletingItem}
          onOpenChange={(open) => setDeletingItem(open ? deletingItem : null)}
          title="Delete item?"
          description="This will permanently remove the item."
          onConfirm={() => {
            onDeleteItem(deletingItem.classId, deletingItem.item.id);
            setDeletingItem(null);
          }}
        />
      )}
    </motion.div>
  );
}
