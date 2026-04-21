import { format } from "date-fns";
import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { EditClassDialog } from "@/components/EditClassDialog";
import { EditItemDialog } from "@/components/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { InlineAddTask } from "@/components/InlineAddTask";
import { Checkbox } from "@/components/ui/checkbox";
import type { ClassInfo, ExtractedItem, SyllabusData } from "@/lib/types";
import { parseDateOnly } from "@/lib/date";
import { getUrgency } from "@/lib/urgency";

const urgencyColor: Record<string, string> = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
  overdue: "#DC2626",
};

type ClassesListViewProps = {
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

type FlattenedItem = {
  classColor: string;
  classDisplayName: string;
  classId: string;
  item: ExtractedItem;
};

function getDateValue(dueDate?: string) {
  const parsed = parseDateOnly(dueDate)?.getTime();
  if (parsed == null) return Number.POSITIVE_INFINITY;
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

export function ClassesListView({
  classes,
  completedTaskIds,
  onEditClass,
  onDeleteClass,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onToggleTaskCompletion,
  emptyState,
}: ClassesListViewProps) {
  const sortedClasses = useMemo(
    () => [...classes].sort((a, b) => a.classInfo.name.localeCompare(b.classInfo.name)),
    [classes]
  );

  const allItems = useMemo(
    () =>
      sortedClasses
        .flatMap((klass, classIndex) => {
          const classId = klass.id || `${klass.classInfo.name}-${classIndex}`;

          return klass.items.map((item) => ({
            classColor: klass.classInfo.color ?? "#3B82F6",
            classDisplayName: klass.classInfo.name,
            classId,
            item,
          }));
        })
        .sort((a, b) => getDateValue(a.item.dueDate) - getDateValue(b.item.dueDate)),
    [sortedClasses]
  );

  const classOptions = useMemo(
    () =>
      sortedClasses.map((klass, classIndex) => ({
        classId: klass.id || `${klass.classInfo.name}-${classIndex}`,
        label:
          klass.classInfo.code?.trim() ||
          klass.classInfo.name.split(" - ")?.[0]?.trim() ||
          klass.classInfo.name,
      })),
    [sortedClasses]
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
    () =>
      sortedClasses.find((c, index) => (c.id || `${c.classInfo.name}-${index}`) === editingClassId) ??
      null,
    [editingClassId, sortedClasses]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      {sortedClasses.length === 0 ? <>{emptyState ?? null}</> : null}

      {sortedClasses.length > 0 ? (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1.4fr)_100px_80px_100px_80px] gap-2 px-4 py-2.5 bg-secondary text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <span aria-hidden="true">&nbsp;</span>
              <span>Class</span>
              <span>Assignment</span>
              <span>Type</span>
              <span>Weight</span>
              <span>Due</span>
              <span className="text-right">Actions</span>
            </div>

            {allItems.map(({ classColor, classDisplayName, classId, item }, i) => {
              const urgency = getUrgency(item.dueDate);
              const parsedDueDate = parseDateOnly(item.dueDate);
              const isCompleted = completedTaskIds.has(item.id);

              return (
                <motion.div
                  key={`${classId}-${item.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  className={`grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1.4fr)_100px_80px_100px_80px] gap-2 px-4 py-3 border-t border-border items-center transition-colors ${
                    isCompleted ? "bg-muted/30 text-muted-foreground" : "hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={(checked) => onToggleTaskCompletion(item.id, checked === true)}
                      aria-label={`Mark ${item.name} complete`}
                    />
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-flex max-w-full items-center rounded-md px-2.5 py-0.5 text-xs  text-white"
                      style={{ backgroundColor: `${classColor}20` }}
                    >
                      <span className="truncate" style={{ color: `${classColor}`}}>{classDisplayName}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="min-w-0">
                      <span
                        className={`block text-sm truncate ${
                          isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {item.name}
                      </span>
                      {/* <span className="text-xs text-muted-foreground">{getUrgencyLabel(urgency)}</span> */}
                    </div>
                  </div>

                  <span className="text-sm text-muted-foreground capitalize">{item.type}</span>

                  <span className="text-sm text-muted-foreground">
                    {item.weight ? `${item.weight}%` : "—"}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {parsedDueDate ? (
                      <span
                        className="inline-flex items-center rounded-md px-2.5 py-0.5 font-medium"
                        style={{
                          backgroundColor: `${urgencyColor[urgency]}20`,
                          color: urgencyColor[urgency],
                        }}
                      >
                        {format(parsedDueDate, "MMM d")}
                      </span>
                    ) : (
                      "No date"
                    )}
                  </span>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingItem({ classId, item })}
                      className="p-1.5 rounded-md hover:bg-accent transition-colors"
                      aria-label="Edit item"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingItem({ classId, item })}
                      className="p-1.5 rounded-md hover:bg-accent transition-colors"
                      aria-label="Delete item"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {allItems.length === 0 ? (
              <div className="border-t border-border px-4 py-6 text-sm text-muted-foreground">
                No assignments yet.
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 px-3 py-3">
            <InlineAddTask
              classOptions={classOptions}
              onAdd={(item, classId) => onAddItem(classId, item)}
            />
          </div>
        </>
      ) : null}

      {editingClass && (
        <EditClassDialog
          open={!!editingClassId}
          onOpenChange={(open) => setEditingClassId(open ? editingClassId : null)}
          value={editingClass.classInfo}
          onSave={(next) => {
            if (!editingClassId) return;
            onEditClass(editingClassId, next);
          }}
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
