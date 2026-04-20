import { SyllabusUpload } from "@/components/SyllabusUpload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SyllabusUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTextReady: (text: string) => void;
  isProcessing: boolean;
  onCreateEmpty?: () => void;
};

export function SyllabusUploadModal({
  open,
  onOpenChange,
  onTextReady,
  isProcessing,
  onCreateEmpty,
}: SyllabusUploadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle>Add a class</DialogTitle>
          <DialogDescription>
            Upload a syllabus PDF (or paste text) to extract assignments, exams, and deadlines — or
            create an empty class and add work manually.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-1">
          <SyllabusUpload onTextReady={onTextReady} isProcessing={isProcessing} />
        </div>

        <div className="flex items-center w-xl mx-auto gap-3 mt-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

        {onCreateEmpty && (
          <div className="flex justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-xl"
              disabled={isProcessing}
              onClick={() => {
                onCreateEmpty();
                onOpenChange(false);
              }}
            >
              Create empty class (no syllabus)
            </Button>
          </div>
        )}

        {/* <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}

