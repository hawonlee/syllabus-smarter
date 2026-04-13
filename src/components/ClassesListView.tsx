import { format } from "date-fns";
import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ClassInfo, ExtractedItem, SyllabusData } from "@/lib/types";
import { getUrgency, getUrgencyLabel } from "@/lib/urgency";
import { ClassInfoBar } from "@/components/ClassInfoBar";
import { EditClassDialog } from "@/components/EditClassDialog";
import { EditItemDialog } from "@/components/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import type { ReactNode } from "react";

const urgencyDot: Record<string, string> = {
  low: "bg-urgency-low",
  medium: "bg-urgency-medium",
  high: "bg-urgency-high",
  critical: "bg-urgency-critical",
};

type ClassesListViewProps = {
  classes: SyllabusData[];
  onEditClass: (classId: string, nextInfo: ClassInfo) => void;
  onDeleteClass: (classId: string) => void;
  onEditItem: (classId: string, itemId: string, nextItem: ExtractedItem) => void;
  onDeleteItem: (classId: string, itemId: string) => void;
  emptyState?: ReactNode;
};

export function ClassesListView({
  classes,
  onEditClass,
  onDeleteClass,
  onEditItem,
  onDeleteItem,
  emptyState,
}: ClassesListViewProps) {
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {sortedClasses.length === 0 ? <>{emptyState ?? null}</> : null}
      {sortedClasses.map((klass, classIndex) => {
        const sortedItems = [...klass.items].sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        const classId = klass.id || `${klass.classInfo.name}-${classIndex}`;

        return (
          <div key={`${klass.classInfo.name}-${classIndex}`}>
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: klass.classInfo.color ?? "#3B82F6" }}
                  aria-hidden="true"
                />
                <h3 className="text-sm font-semibold text-foreground">
                  {klass.classInfo.name}
                </h3>
                <div className="ml-auto flex items-center gap-1">
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
              <div className="mt-2">
                <ClassInfoBar info={klass.classInfo} />
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_80px_80px_100px_80px] gap-2 px-4 py-2.5 bg-secondary text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <span>Name</span>
                <span>Type</span>
                <span>Weight</span>
                <span>Due</span>
                <span>Urgency</span>
                <span className="text-right">Actions</span>
              </div>

              {sortedItems.map((item, i) => {
                const urgency = getUrgency(item.dueDate);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className="grid grid-cols-[1fr_100px_80px_80px_100px_80px] gap-2 px-4 py-3 border-t border-border items-center hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${urgencyDot[urgency]}`} />
                      <span className="text-sm text-foreground truncate">{item.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.weight ? `${item.weight}%` : "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(item.dueDate), "MMM d")}
                    </span>
                    <span className="text-xs text-muted-foreground">{getUrgencyLabel(urgency)}</span>
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
            </div>
          </div>
        );
      })}

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

