"use client";

import { useState, useEffect } from "react";
import { ResumeData, TemplateId, TEMPLATES, selectTemplate } from "@/lib/resume-types";
import { TemplateGallery } from "@/components/resume-builder/template-gallery";
import { ResumeChat } from "@/components/resume-builder/resume-chat";
import { ResumePreview } from "@/components/resume-builder/resume-preview";
import { PhotoUploadModal } from "@/components/resume-builder/photo-upload";

const EMPTY_RESUME: ResumeData = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  phone: "",
  email: "",
  location: "",
  linkedin: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  achievements: [],
  photoUrl: "",
};

export default function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState<ResumeData>(EMPTY_RESUME);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("minimalist-modern");
  const [aiSelectedTemplate, setAiSelectedTemplate] = useState<TemplateId>("minimalist-modern");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Auto-select template based on job title
  useEffect(() => {
    if (resumeData.jobTitle) {
      const template = selectTemplate(resumeData.jobTitle);
      setAiSelectedTemplate(template);
      setSelectedTemplate(template);
    }
  }, [resumeData.jobTitle]);

  function handleResumeDataUpdate(data: ResumeData) {
    setResumeData(data);
  }

  function handleTemplateSelect(id: TemplateId) {
    setSelectedTemplate(id);
  }

  function handlePhotoUpload(photoUrl: string) {
    setResumeData((prev) => ({ ...prev, photoUrl }));
    setShowPhotoModal(false);
  }

  function handlePhotoSkip() {
    setShowPhotoModal(false);
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Nav */}
      <div className="shrink-0 h-14 px-6 border-b border-border flex items-center">
        <span className="font-display text-lg">ResumeForge AI</span>
        <div className="ml-auto font-mono text-xs text-muted-foreground">
          Resume Builder
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Template Gallery (280px) */}
        <div className="w-[280px] shrink-0">
          <TemplateGallery
            selectedTemplate={selectedTemplate}
            aiSelected={aiSelectedTemplate}
            onSelect={handleTemplateSelect}
          />
        </div>

        {/* Center: Chat (flex) */}
        <div className="flex-1 flex flex-col">
          <ResumeChat
            onDataUpdate={handleResumeDataUpdate}
            onTemplateSelect={handleTemplateSelect}
            onPhotoModalOpen={() => setShowPhotoModal(true)}
            resumeData={resumeData}
            isComplete={isComplete}
          />
        </div>

        {/* Right: Preview (420px) */}
        <div className="w-[420px] shrink-0">
          <ResumePreview
            data={resumeData}
            templateId={selectedTemplate}
            isComplete={isComplete}
          />
        </div>
      </div>

      {/* Photo upload modal */}
      <PhotoUploadModal
        isOpen={showPhotoModal}
        onPhotoSelected={handlePhotoUpload}
        onSkip={handlePhotoSkip}
      />
    </div>
  );
}
