import { format } from "date-fns";
import { motion } from "framer-motion";
import type { ExtractedItem } from "@/lib/types";
import { getUrgency, getUrgencyLabel } from "@/lib/urgency";

interface CardViewProps {
  items: ExtractedItem[];
}

const urgencyBorder: Record<string, string> = {
  low: "border-l-urgency-low",
  medium: "border-l-urgency-medium",
  high: "border-l-urgency-high",
  critical: "border-l-urgency-critical",
  overdue: "border-l-red-600",
};


const typeBadge: Record<string, string> = {
  assignment: "bg-urgency-low/10 text-urgency-low",
  exam: "bg-urgency-critical/10 text-urgency-critical",
  quiz: "bg-urgency-medium/10 text-urgency-medium",
  project: "bg-urgency-high/10 text-urgency-high",
  other: "bg-muted text-muted-foreground",
};

export function CardView({ items }: CardViewProps) {
  // Group by class
  const grouped = items.reduce<Record<string, ExtractedItem[]>>((acc, item) => {
    const key = item.className;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {Object.entries(grouped).map(([className, classItems]) => (
        <div key={className}>
          <h3 className="text-sm font-semibold text-foreground mb-3">{className}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {classItems
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((item, i) => {
                const urgency = getUrgency(item.dueDate);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-lg border border-border bg-card p-4 border-l-[3px] ${urgencyBorder[urgency]} hover:bg-surface-hover transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${typeBadge[item.type] || typeBadge.other}`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>{format(new Date(item.dueDate), "MMM d, yyyy")}</span>
                      {item.weight && <span>· {item.weight}%</span>}
                      <span className="ml-auto text-[10px]">{getUrgencyLabel(urgency)}</span>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
