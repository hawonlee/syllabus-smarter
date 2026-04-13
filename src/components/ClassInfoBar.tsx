import { Mail, Clock, User } from "lucide-react";
import type { ClassInfo } from "@/lib/types";

interface ClassInfoBarProps {
  info: ClassInfo;
}

export function ClassInfoBar({ info }: ClassInfoBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {info.instructor && (
        <span className="flex items-center gap-1.5">
          <User className="h-3 w-3" />
          {info.instructor}
        </span>
      )}
      {info.instructorEmail && (
        <a href={`mailto:${info.instructorEmail}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
          <Mail className="h-3 w-3" />
          {info.instructorEmail}
        </a>
      )}
      {info.officeHours && (
        <span className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {info.officeHours}
        </span>
      )}
    </div>
  );
}
