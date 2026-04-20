import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Plus, Badge, BookDashed } from "lucide-react";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { CalendarView } from "@/components/CalendarView";
import { ViewToggle } from "@/components/ViewToggle";
import { SyllabusUploadModal } from "@/components/SyllabusUploadModal";
import { ClassesCardView } from "@/components/ClassesCardView";
import { ClassesListView } from "@/components/ClassesListView";
import { extractSyllabus } from "@/lib/extract.functions";
import type { SyllabusData, ViewMode } from "@/lib/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Syllably" },
      { name: "description", content: "Upload your syllabus and instantly see all assignments, exams, and deadlines organized in one calm, clear view." },
    ],
  }),
});

type AppState = "upload" | "confirm" | "dashboard";

const CLASS_COLORS = [
  "#3B82F6", // blue
  "#22C55E", // green
  "#F97316", // orange
  "#A855F7", // purple
  "#EF4444", // red
  "#06B6D4", // cyan
  "#EAB308", // yellow
  "#F43F5E", // rose
];

function deriveClassCode(data: SyllabusData): string {
  const itemCode = data.items?.[0]?.className?.trim();
  if (itemCode) return itemCode;
  return data.classInfo.name?.split(" - ")?.[0]?.trim() || data.classInfo.name || "Unknown";
}

function newId(): string {
  // crypto.randomUUID is available in modern browsers
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function Index() {
  const [state, setState] = useState<AppState>("dashboard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingData, setPendingData] = useState<SyllabusData | null>(null);
  const [classes, setClasses] = useState<SyllabusData[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const handleTextReady = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await extractSyllabus({ data: { text } });
      setPendingData(result);
      setState("confirm");
    } catch (err: any) {
      console.error("Extraction error:", err);
      alert(err.message || "Failed to extract syllabus data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = (data: SyllabusData) => {
    setClasses((prev) => {
      const used = new Set(prev.map((c) => c.classInfo.color).filter(Boolean) as string[]);
      const nextColor =
        CLASS_COLORS.find((c) => !used.has(c)) ??
        CLASS_COLORS[prev.length % CLASS_COLORS.length];

      const code = data.classInfo.code?.trim() || deriveClassCode(data);

      return [
        ...prev,
        {
          ...data,
          id: data.id || newId(),
          classInfo: {
            ...data.classInfo,
            code,
            color: data.classInfo.color || nextColor,
          },
        },
      ];
    });
    setState("dashboard");
  };

  const handleCreateEmptyClass = () => {
    handleConfirm({
      classInfo: { name: "New class" },
      items: [],
    });
  };

  const updateClassInfo = (classId: string, nextInfo: SyllabusData["classInfo"]) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, classInfo: nextInfo } : c))
    );
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
  };

  const updateItem = (classId: string, itemId: string, nextItem: SyllabusData["items"][number]) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId
          ? { ...c, items: c.items.map((it) => (it.id === itemId ? nextItem : it)) }
          : c
      )
    );
  };

  const deleteItem = (classId: string, itemId: string) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c))
    );
  };

  const addItem = (classId: string, item: SyllabusData["items"][number]) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, items: [...c.items, item] } : c))
    );
  };

  const handleCloseModals = () => {
    setState("dashboard");
    setPendingData(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="w-full mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookDashed className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm tracking-wide text-muted-foreground">SyllaBye</span>
          </div>
          <div className="flex items-center gap-8">
            <ViewToggle current={viewMode} onChange={setViewMode} />
            <Button
              onClick={() => setState("upload")}
              variant="default"
              className="h-full text-xs"
            >
              <Plus className="h-3.5 w-3.5 -ml-1 text-white" />
              Add Course
            </Button>
          </div>
        </div>
      </header>

      {/* Upload modal */}
      <SyllabusUploadModal
        open={state === "upload"}
        onOpenChange={(open) => setState(open ? "upload" : "dashboard")}
        onTextReady={handleTextReady}
        isProcessing={isProcessing}
        onCreateEmpty={handleCreateEmptyClass}
      />

      {/* Confirmation modal */}
      <AnimatePresence>
        {state === "confirm" && pendingData && (
          <ConfirmationModal
            data={pendingData}
            onConfirm={handleConfirm}
            onCancel={handleCloseModals}
          />
        )}
      </AnimatePresence>

      {/* Dashboard */}
      {state === "dashboard" && (
        <main
          className={`w-full mx-auto px-6 py-6 ${
            viewMode === "calendar"
              ? "h-[calc(100vh-3.5rem)] overflow-hidden"
              : "flex-1"
          } flex flex-col min-h-0`}
        >
          {/* <div className="mb-4 rounded-md border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
            SyllabEase takes in your syllabus and scans it for relevant information to then categorize your
            asssignments. You syllabus information will not be used for any other purpose
          </div> */}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              className={viewMode === "calendar" ? "flex h-full min-h-0 flex-1 flex-col" : undefined}
            >
              {viewMode === "calendar" && (
                <CalendarView
                  items={classes.flatMap((c) => c.items)}
                  classColorByName={Object.fromEntries(
                    classes.map((c) => [
                      c.classInfo.code || deriveClassCode(c),
                      c.classInfo.color || CLASS_COLORS[0],
                    ])
                  )}
                />
              )}
              {viewMode === "cards" && (
                <ClassesCardView
                  classes={classes}
                  onEditClass={updateClassInfo}
                  onDeleteClass={deleteClass}
                  onEditItem={updateItem}
                  onDeleteItem={deleteItem}
                  onAddItem={addItem}
                  emptyState={
                    <div className="p-8 text-center sm:col-span-2">
                      <h2 className="text-sm font-semibold text-foreground">No classes yet</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add a class to start seeing assignments and deadlines here.
                      </p>
                      <Button
                        variant="default"
                        onClick={() => setState("upload")}
                        className="mt-4"
                      >
                        Add your first class
                      </Button>
                    </div>
                  }
                />
              )}
              {viewMode === "list" && (
                <ClassesListView
                  classes={classes}
                  onEditClass={updateClassInfo}
                  onDeleteClass={deleteClass}
                  onEditItem={updateItem}
                  onDeleteItem={deleteItem}
                  onAddItem={addItem}
                  emptyState={
                    <div className="p-8 text-center">
                      <h2 className="text-sm font-semibold text-foreground">No classes yet</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add a class to start seeing assignments and deadlines here.
                      </p>
                      <Button
                        variant="default"
                        onClick={() => setState("upload")}
                        className="mt-4 "
                      >
                        Add your first class
                      </Button>
                    </div>
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      )}
    </div>
  );
}
