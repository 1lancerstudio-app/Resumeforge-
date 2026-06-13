"use client";

import { Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BatchUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "text/csv" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => file.type === "text/csv" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUploadProgress(i);
    }
    setIsUploading(false);
    setUploadProgress(0);
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Batch Upload Resumes</h3>
        <p className="text-sm text-muted-foreground">Upload multiple resumes in CSV or Excel format for batch verification</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium mb-1">Drag and drop your files here</p>
        <p className="text-sm text-muted-foreground mb-4">or</p>
        <label>
          <input type="file" multiple accept=".csv,.xlsx" onChange={handleFileSelect} className="hidden" />
          <Button variant="outline" asChild className="cursor-pointer">
            <span>Browse Files</span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-4">Supported formats: CSV, Excel (.xlsx)</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3">Files to Upload ({files.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-card p-2 rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {isUploading && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
              {isUploading ? "Uploading..." : "Upload & Verify"}
            </Button>
            <Button variant="outline" onClick={() => setFiles([])} disabled={isUploading}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
