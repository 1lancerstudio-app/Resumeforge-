"use client";

import { ResumeData } from "@/lib/resume-types";

interface MinimalistModernProps {
  data: ResumeData;
}

export function MinimalistModernTemplate({ data }: MinimalistModernProps) {
  return (
    <div
      style={{
        width: "595px",
        height: "842px",
        background: "#ffffff",
        color: "#000000",
        padding: "40px 50px",
        fontFamily: '"Instrument Sans", sans-serif',
        fontSize: "10px",
        lineHeight: 1.5,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px", position: "relative" }}>
        {/* Photo top right */}
        {data.photoUrl && (
          <img
            src={data.photoUrl}
            alt="Profile"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        )}

        <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "6px" }}>
          {data.firstName} {data.lastName}
        </div>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
          {data.jobTitle}
        </div>
        <div style={{ fontSize: "9px", color: "#999", marginBottom: "6px" }}>
          {data.phone} • {data.email} • {data.location}
          {data.linkedin && ` • ${data.linkedin}`}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "#ccc", marginBottom: "20px" }} />

      {/* Profile */}
      {data.summary && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase" }}>
            Profile
          </div>
          <p style={{ fontSize: "9px", lineHeight: 1.6, color: "#333" }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase" }}>
            Experience
          </div>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: "12px", fontSize: "9px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>
                    {exp.role} • {exp.company}
                  </div>
                  <ul style={{ marginLeft: "16px", marginTop: "4px", paddingLeft: 0 }}>
                    {exp.bullets.slice(0, 2).map((bullet, bidx) => (
                      <li key={bidx} style={{ marginBottom: "2px", fontSize: "8.5px" }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ color: "#999", fontSize: "8px", textAlign: "right" }}>
                  {exp.dates}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase" }}>
            Education
          </div>
          {data.education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: "6px", fontSize: "9px" }}>
              <div style={{ fontWeight: "600" }}>
                {edu.degree} • {edu.school}
              </div>
              <div style={{ color: "#999", fontSize: "8px" }}>
                {edu.dates} {edu.gpa && `• GPA: ${edu.gpa}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase" }}>
            Skills
          </div>
          <div style={{ fontSize: "9px", color: "#333" }}>
            {data.skills.join(" • ")}
          </div>
        </div>
      )}
    </div>
  );
}
