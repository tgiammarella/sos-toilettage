"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

const labels = {
  fr: {
    dragPrompt: "Glissez votre CV ici ou cliquez pour téléverser",
    format: "Format accepté : PDF",
    maxSize: "Taille max : 16 Mo",
    uploading: "Téléversement en cours…",
    success: "CV téléversé avec succès !",
    error: "Échec du téléversement.",
    typeError: "Fichier PDF uniquement (max 16 Mo).",
    current: "Fichier actuel :",
    open: "Ouvrir",
    replace: "Remplacer le fichier",
    upload: "Téléverser un PDF",
  },
  en: {
    dragPrompt: "Drag your CV here or click to upload",
    format: "Accepted format: PDF",
    maxSize: "Max size: 16 MB",
    uploading: "Uploading…",
    success: "CV uploaded successfully!",
    error: "Upload failed.",
    typeError: "PDF only, max 16 MB.",
    current: "Current file:",
    open: "Open",
    replace: "Replace file",
    upload: "Upload PDF",
  },
};

export function CvUploadButton({
  lang,
  currentUrl,
}: {
  lang: "fr" | "en";
  currentUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const t = labels[lang];

  const { startUpload } = useUploadThing("cvUploader", {
    onUploadProgress: (p) => setProgress(p),
    onClientUploadComplete: () => {
      toast.success(t.success);
      setUploading(false);
      setProgress(0);
      router.refresh();
    },
    onUploadError: (err) => {
      toast.error(err.message || t.error);
      setUploading(false);
      setProgress(0);
    },
  });

  function validateAndUpload(file: File) {
    if (file.type !== "application/pdf" || file.size > 16 * 1024 * 1024) {
      toast.error(t.typeError);
      return;
    }
    setUploading(true);
    setProgress(0);
    startUpload([file]);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndUpload(file);
    e.target.value = "";
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      validateAndUpload(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  return (
    <div className="space-y-4">
      {/* Current file */}
      {currentUrl && (
        <div className="rounded-md bg-muted/50 px-3 py-2.5 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate">{t.current}</span>
          </div>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline shrink-0"
          >
            {t.open}
          </a>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          "relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer select-none",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/30",
          uploading ? "pointer-events-none opacity-70" : "",
        ].join(" ")}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-medium">{t.uploading}</p>
            <div className="w-full max-w-xs bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-center">{t.dragPrompt}</p>
            <div className="flex flex-col items-center gap-0.5">
              <p className="text-xs text-muted-foreground">{t.format}</p>
              <p className="text-xs text-muted-foreground">{t.maxSize}</p>
            </div>
            {currentUrl && (
              <Button size="sm" variant="secondary" className="mt-1 pointer-events-none">
                {t.replace}
              </Button>
            )}
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
