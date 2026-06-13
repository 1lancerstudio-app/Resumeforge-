"use client";

import { ResumeData } from "@/lib/resume-types";

interface WhiteBusinessProps {
  data: ResumeData;
}

export function WhiteBusinessTemplate({ data }: WhiteBusinessProps) {
  return (
    <div
      style={{
        width: "595px",
        height: "842px",
        background: "#ffffff",
        color: "#000000",
        padding: "40px",
        fontFamily: '"Instrument Sans", sans-serif',
        fontSize: "10px",
        lineHeight: 1.4,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #000" }}>
        <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "2px" }}>
          {data.firstName}
        </div>
        <div style={{ fontSize: "28px", marginBottom: "4px" }}>{data.lastName}</div>
        <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
          {data.jobTitle}
        </div>
        <div style={{ fontSize: "9px", color: "#666" }}>
          {data.phone} · {data.email} · {data.location}
          {data.linkedin && ` · ${data.linkedin}`}
        </div>
      </div>

      {/* Two column body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left column */}
        <div>
          {/* Education */}
          {data.education.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase" }}>
                Education
              </div>
              {data.education.map((edu, idx) => (
                <div key={idx} style={{ marginBottom: "6px", fontSize: "9px" }}>
                  <div style={{ fontWeight: "600" }}>{edu.degree}</div>
                  <div style={{ color: "#666" }}>{edu.school}</div>
                  <div style={{ color: "#999", fontSize: "8px" }}>{edu.dates}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div>
          {/* Skills */}
          {data.skills.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase" }}>
                Skills
              </div>
              <div style={{ fontSize: "9px", lineHeight: 1.6 }}>
                {data.skills.join(" · ")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Experience */}
      {data.experience.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase" }}>
            Experience
          </div>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: "10px", fontSize: "9px" }}>
              <div style={{ fontWeight: "600" }}>
                {exp.role} at {exp.company}
              </div>
              <div style={{ color: "#999", fontSize: "8px", marginBottom: "3px" }}>
                {exp.dates}
              </div>
              <ul style={{ marginLeft: "16px", paddingLeft: 0 }}>
                {exp.bullets.map((bullet, bidx) => (
                  <li key={bidx} style={{ marginBottom: "2px" }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
