// src/components/FileUploadWithPreview.tsx
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Check,
  FileVideo,
  FileImage,
  Box,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadWithPreviewProps {
  accept: string;
  label: string;
  description: string;
  onFileSelect: (file: File) => void;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUploadWithPreview({
  accept,
  label,
  description,
  onFileSelect,
  maxSize = 50,
  className,
}: FileUploadWithPreviewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return FileImage;
    if (type.startsWith("video/")) return FileVideo;
    return Box;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File terlalu besar. Maksimal ${maxSize}MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const fileType = file.type;
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    const isValidType = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileExt === type;
      }
      return fileType.match(new RegExp(type.replace("*", ".*")));
    });

    if (!isValidType) {
      return `Tipe file tidak didukung. Hanya: ${accept}`;
    }

    return null;
  };

  const handleFileChange = (selectedFile: File) => {
    setError(null);

    // Validate
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const FileIcon = file ? getFileIcon(file.type) : Upload;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium">{label}</label>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border/50 hover:border-primary/50 bg-muted/30",
            error && "border-destructive bg-destructive/5"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleInputChange}
          />

          <FileIcon
            className={cn(
              "w-12 h-12 mb-3 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />

          <p className="text-sm font-medium mb-1">
            {isDragging ? "Drop file disini" : "Click atau drag file kesini"}
          </p>
          <p className="text-xs text-muted-foreground">
            Maksimal {maxSize}MB • {accept}
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl p-4 border border-border/50">
          <div className="flex items-start gap-4">
            {/* Preview */}
            <div className="flex-shrink-0">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={handleRemove}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {formatFileSize(file.size)}
              </p>

              {/* Success indicator */}
              <div className="flex items-center gap-2 text-xs text-primary">
                <Check className="w-3 h-3" />
                <span>File siap diupload</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
