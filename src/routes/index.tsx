import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { SyllabusUpload } from "@/components/SyllabusUpload";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { CalendarView } from "@/components/CalendarView";
import { CardView } from "@/components/CardView";
import { ListView } from "@/components/ListView";
import { ViewToggle } from "@/components/ViewToggle";
import { ClassInfoBar } from "@/components/ClassInfoBar";
import { extractSyllabus } from "@/lib/extract.functions";
import type { SyllabusData, ViewMode } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SyllabEase — See Your Semester at a Glance" },
      { name: "description", content: "Upload your syllabus and instantly see all assignments, exams, and deadlines organized in one calm, clear view." },
    ],
  }),
});

type AppState = "upload" | "confirm" | "dashboard";

function Index() {
  const [state, setState] = useState<AppState>("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingData, setPendingData] = useState<SyllabusData | null>(null);
  const [confirmedData, setConfirmedData] = useState<SyllabusData | null>(null);
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
    setConfirmedData(data);
    setState("dashboard");
  };

  const handleReset = () => {
    setState("upload");
    setPendingData(null);
    setConfirmedData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-foreground" />
            <span className="text-sm font-semibold tracking-tight text-foreground">SyllabEase</span>
          </div>
          {state === "dashboard" && (
            <div className="flex items-center gap-3">
              <ViewToggle current={viewMode} onChange={setViewMode} />
              <button
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                + Add syllabus
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Upload state */}
      {state === "upload" && (
        <main className="max-w-5xl mx-auto px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              See your semester at a glance
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Upload a syllabus and we'll extract every assignment, exam, and deadline — so you can plan ahead without the manual work.
            </p>
          </motion.div>
          <SyllabusUpload onTextReady={handleTextReady} isProcessing={isProcessing} />
        </main>
      )}

      {/* Confirmation modal */}
      <AnimatePresence>
        {state === "confirm" && pendingData && (
          <ConfirmationModal
            data={pendingData}
            onConfirm={handleConfirm}
            onCancel={handleReset}
          />
        )}
      </AnimatePresence>

      {/* Dashboard */}
      {state === "dashboard" && confirmedData && (
        <main className="max-w-5xl mx-auto px-6 py-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">{confirmedData.classInfo.name}</h2>
            <div className="mt-2">
              <ClassInfoBar info={confirmedData.classInfo} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={viewMode}>
              {viewMode === "calendar" && <CalendarView items={confirmedData.items} />}
              {viewMode === "cards" && <CardView items={confirmedData.items} />}
              {viewMode === "list" && <ListView items={confirmedData.items} />}
            </motion.div>
          </AnimatePresence>
        </main>
      )}
    </div>
  );
}
