"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadModalProps {
  isOpen: boolean;
  onPhotoSelected: (photoUrl: string) => void;
  onSkip: () => void;
}

export function PhotoUploadModal({
  isOpen,
  onPhotoSelected,
  onSkip,
}: PhotoUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  function handleFileSelect(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl">Add your photo</h2>
          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="font-mono text-xs text-muted-foreground mb-6">
          Used in your resume header. Square or portrait, at least 400×400px.
        </p>

        {/* Upload zone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-48 h-48 rounded-full border-2 border-dashed mx-auto mb-6 cursor-pointer transition-all ${
            isDragging
              ? "border-white/60 bg-white/5"
              : "border-gradient"
          }`}
          style={
            !isDragging
              ? {
                  borderImage:
                    "linear-gradient(135deg, #eca8d6, #a78bfa) 1",
                }
              : {}
          }
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="text-center">
              <Camera className="w-8 h-8 text-muted-foreground mb-3 mx-auto" />
              <p className="font-mono text-xs text-muted-foreground">
                Drop photo here or click
              </p>
            </div>
          )}
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          {preview && (
            <Button
              onClick={() => onPhotoSelected(preview)}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-full"
            >
              Use This Photo
            </Button>
          )}
          <Button
            onClick={onSkip}
            variant="outline"
            className="flex-1 rounded-full"
          >
            {preview ? "Change" : "Skip for now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
