import { Mail, Clock, User, Phone, Users } from "lucide-react";
import type { ClassInfo } from "@/lib/types";

interface ClassInfoBarProps {
  info: ClassInfo;
}

export function ClassInfoBar({ info }: ClassInfoBarProps) {
  const assistants = info.assistants?.length
    ? info.assistants
    : info.ta
      ? [{ name: info.ta, role: "TA" as const, email: info.taEmail }]
      : [];

  return (
    <div className="space-y-3 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
        {info.instructor && (
          <span className="flex items-center gap-1.5 font-medium">
            <User className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/90">Instructor</span>
            {info.instructor}
          </span>
        )}
        {info.instructorEmail && (
          <a href={`mailto:${info.instructorEmail}`} className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors">
            <Mail className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/90">Email</span>
            {info.instructorEmail}
          </a>
        )}
        {info.officeHours && (
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/90 mr-1">Office hours</span>
              {info.officeHours}
            </span>
          </span>
        )}
      </div>

      {assistants.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <Users className="h-3 w-3" />
            Teaching staff
          </div>
          <ul className="space-y-2 pl-0 list-none">
            {assistants.map((a, i) => (
              <li
                key={`${a.name}-${a.email ?? ""}-${i}`}
                className="flex flex-wrap items-start gap-x-4 gap-y-1 rounded-md border border-border/60 bg-background/40 px-3 py-2"
              >
                <span className="font-medium text-foreground">
                  {a.role ? `${a.role}: ` : ""}
                  {a.name}
                </span>
                {a.email && (
                  <a
                    href={`mailto:${a.email}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    {a.email}
                  </a>
                )}
                {a.phone && (
                  <a
                    href={`tel:${a.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Phone className="h-3 w-3 shrink-0" />
                    {a.phone}
                  </a>
                )}
                {a.officeHours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    {a.officeHours}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
