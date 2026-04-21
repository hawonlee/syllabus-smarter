import { useState, useCallback } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SyllabusUploadProps {
  onTextReady: (text: string) => void;
  isProcessing: boolean;
}

export function SyllabusUpload({ onTextReady, isProcessing }: SyllabusUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;
  };

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }
    setFileName(file.name);
    try {
      const text = await extractTextFromPdf(file);
      onTextReady(text);
    } catch (err) {
      console.error("PDF parsing error:", err);
      alert("Could not read this PDF. Try pasting the text instead.");
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handlePasteSubmit = () => {
    if (pastedText.trim().length > 50) {
      onTextReady(pastedText.trim());
    }
  };

  return (
    <motion.div
    
      className="mx-auto w-full min-w-0 max-w-xl"
    >
      {!pasteMode ? (
        <>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative flex min-h-0 flex-col cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all sm:gap-4 sm:p-10 md:p-12
              ${dragActive
                ? "border-foreground bg-surface-hover scale-[1.01]"
                : "border-border bg-card hover:border-muted-foreground hover:bg-surface"
              }
              ${isProcessing ? "pointer-events-none opacity-60" : ""}
            `}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileInput}
            />

            {isProcessing ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Processing {fileName}...</p>
                  <p className="text-xs text-muted-foreground mt-1">Extracting assignments and deadlines</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Drop your syllabus here</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF files supported</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="default"
            className="w-full mt-6 gap-2"
            onClick={() => setPasteMode(true)}
            disabled={isProcessing}
          >
            <FileText className="h-4 w-4" />
            Paste syllabus text
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your syllabus content here..."
            className="h-36 max-h-[min(12rem,45dvh)] w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring sm:h-48 sm:max-h-none sm:p-4"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { setPasteMode(false); setPastedText(""); }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handlePasteSubmit}
              disabled={pastedText.trim().length < 50 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                "Extract deadlines"
              )}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
