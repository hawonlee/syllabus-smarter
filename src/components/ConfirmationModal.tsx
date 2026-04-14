import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { SyllabusData, ExtractedItem, ClassInfo } from "@/lib/types";
import { ClassInfoBar } from "@/components/ClassInfoBar";

interface ConfirmationModalProps {
  data: SyllabusData;
  onConfirm: (data: SyllabusData) => void;
  onCancel: () => void;
}

export function ConfirmationModal({ data, onConfirm, onCancel }: ConfirmationModalProps) {
  const [items, setItems] = useState<ExtractedItem[]>(data.items);
  const [classInfo] = useState<ClassInfo>(data.classInfo);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ExtractedItem>>({});

  const startEdit = (item: ExtractedItem) => {
    setEditingId(item.id);
    setEditValues({ name: item.name, dueDate: item.dueDate, type: item.type, weight: item.weight });
  };

  const saveEdit = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...editValues } : item
    ));
    setEditingId(null);
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const typeColors: Record<string, string> = {
    assignment: "bg-urgency-low/15 text-urgency-low",
    exam: "bg-urgency-critical/15 text-urgency-critical",
    quiz: "bg-urgency-medium/15 text-urgency-medium",
    project: "bg-urgency-high/15 text-urgency-high",
    other: "bg-muted text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-card border border-border shadow-lg"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Review extracted data</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {classInfo.name} · {items.length} items found
          </p>
          <div className="mt-3">
            <ClassInfoBar info={classInfo} />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 rounded-lg border border-border p-3 bg-background"
              >
                {editingId === item.id ? (
                  <div className="flex-1 grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                    <input
                      value={editValues.name || ""}
                      onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))}
                      className="rounded border border-input bg-card px-2 py-1 text-sm text-foreground"
                    />
                    <input
                      type="date"
                      value={editValues.dueDate || ""}
                      onChange={(e) => setEditValues(v => ({ ...v, dueDate: e.target.value }))}
                      className="rounded border border-input bg-card px-2 py-1 text-sm text-foreground"
                    />
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(item.id)} className="p-1 rounded hover:bg-accent">
                        <Check className="h-4 w-4 text-urgency-low" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-accent">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColors[item.type] || typeColors.other}`}>
                      {item.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.dueDate}{item.weight ? ` · ${item.weight}%` : ""}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(item)} className="p-1 rounded hover:bg-accent">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="p-1 rounded hover:bg-accent">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Start over
          </Button>
          <Button
            onClick={() => onConfirm({ classInfo, items })}
            disabled={items.length === 0}
            className="flex-1"
          >
            Looks good — continue
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
