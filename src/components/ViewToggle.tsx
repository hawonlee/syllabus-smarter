import { Calendar, LayoutGrid, List } from "lucide-react";
import type { ViewMode } from "@/lib/types";

interface ViewToggleProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const views: { mode: ViewMode; icon: typeof Calendar; label: string }[] = [
  { mode: "calendar", icon: Calendar, label: "Calendar" },
  { mode: "cards", icon: LayoutGrid, label: "All Courses" },
  { mode: "list", icon: List, label: "All Assignments" },
];

export function ViewToggle({ current, onChange }: ViewToggleProps) {
  return (
    // <div className="inline-flex items-center gap-0.5 rounded-full bg-secondary p-1">
    //   {views.map(({ mode, icon: Icon, label }) => (
    //     <button
    //       key={mode}
    //       onClick={() => onChange(mode)}
    //       className={`
    //         flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all
    //         ${current === mode
    //           ? "bg-card text-foreground "
    //           : "text-muted-foreground hover:text-foreground"
    //         }
    //       `}
    //     >
    //       <Icon className="h-3.5 w-3.5" />
    //       {label}
    //     </button>
    //   ))}
    // </div>
    <div className="inline-flex items-center gap-0.5 rounded-full">
      {views.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`
            flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all
            ${current === mode
              ? "bg-secondary text-foreground "
              : "text-muted-foreground hover:text-foreground"
            }
          `}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
