import { format } from "date-fns";
import { motion } from "framer-motion";
import type { ExtractedItem } from "@/lib/types";
import { getUrgency, getUrgencyLabel } from "@/lib/urgency";

interface ListViewProps {
  items: ExtractedItem[];
}

const urgencyDot: Record<string, string> = {
  low: "bg-urgency-low",
  medium: "bg-urgency-medium",
  high: "bg-urgency-high",
  critical: "bg-urgency-critical",
};

export function ListView({ items }: ListViewProps) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_80px_80px_100px] gap-2 px-4 py-2.5 bg-secondary text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        <span>Name</span>
        <span>Type</span>
        <span>Weight</span>
        <span>Due</span>
        <span>Urgency</span>
      </div>

      {/* Rows */}
      {sorted.map((item, i) => {
        const urgency = getUrgency(item.dueDate);
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-[1fr_100px_80px_80px_100px] gap-2 px-4 py-3 border-t border-border items-center hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${urgencyDot[urgency]}`} />
              <span className="text-sm text-foreground truncate">{item.name}</span>
            </div>
            <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
            <span className="text-xs text-muted-foreground">{item.weight ? `${item.weight}%` : "—"}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(item.dueDate), "MMM d")}</span>
            <span className="text-xs text-muted-foreground">{getUrgencyLabel(urgency)}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
