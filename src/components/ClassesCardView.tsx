import { format } from "date-fns";
import { motion } from "framer-motion";
import type { SyllabusData } from "@/lib/types";
import { getUrgency, getUrgencyLabel } from "@/lib/urgency";
import { ClassInfoBar } from "@/components/ClassInfoBar";
import { Edit2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ClassInfo, ExtractedItem } from "@/lib/types";
import { EditClassDialog } from "@/components/EditClassDialog";
import { EditItemDialog } from "@/components/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { InlineAddTask } from "@/components/InlineAddTask";
import type { ReactNode } from "react";

const urgencyDot: Record<string, string> = {
  low: "bg-urgency-low",
  medium: "bg-urgency-medium",
  high: "bg-urgency-high",
  critical: "bg-urgency-critical",
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
  onEditClass: (classId: string, nextInfo: ClassInfo) => void;
  onDeleteClass: (classId: string) => void;
  onEditItem: (classId: string, itemId: string, nextItem: ExtractedItem) => void;
  onDeleteItem: (classId: string, itemId: string) => void;
  onAddItem: (classId: string, item: ExtractedItem) => void;
  emptyState?: ReactNode;
};

export function ClassesCardView({
  classes,
  onEditClass,
  onDeleteClass,
  onEditItem,
  onDeleteItem,
  onAddItem,
  emptyState,
}: ClassesCardViewProps) {
  const getDueDateLabel = (dueDate?: string) => {
    if (!dueDate?.trim()) return "No due date detected";
    const parsed = new Date(dueDate);
    return Number.isNaN(parsed.getTime()) ? "No due date detected" : format(parsed, "MMM d, yyyy");
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
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
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
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: klass.classInfo.color ?? "#3B82F6" }}
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {klass.classInfo.name}
                  </h3>
                </div>
                <div className="mt-2">
                  <ClassInfoBar info={klass.classInfo} />
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

            <div className="mt-4 space-y-2">
              {classItems.map((item) => {
                const urgency = getUrgency(item.dueDate);
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2"
                  >
                    <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${urgencyDot[urgency]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${typeBadge[item.type] || typeBadge.other}`}
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
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getDueDateLabel(item.dueDate)}</span>
                        <span>{item.weight ? `· ${item.weight}%` : "· No grade distribution detected"}</span>
                        <span className="ml-auto text-[10px]">{getUrgencyLabel(urgency)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <InlineAddTask
                classNameLabel={itemClassName}
                onAdd={(item) => onAddItem(classId, item)}
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

