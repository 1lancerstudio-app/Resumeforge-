"use client";

import { ResumeData } from "@/lib/resume-types";

interface ModernMinimalistCVProps {
  data: ResumeData;
}

export function ModernMinimalistCVTemplate({ data }: ModernMinimalistCVProps) {
  return (
    <div
      style={{
        width: "595px",
        height: "842px",
        background: "#ffffff",
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        fontFamily: '"Instrument Sans", sans-serif',
        fontSize: "9px",
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          background: "#1a1a2e",
          color: "#ffffff",
          padding: "30px 15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Photo */}
        {data.photoUrl ? (
          <img
            src={data.photoUrl}
            alt="Profile"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              marginBottom: "15px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "#444",
              marginBottom: "15px",
            }}
          />
        )}

        {/* Name */}
        <div style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center", marginBottom: "2px" }}>
          {data.firstName}
        </div>
        <div style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center", marginBottom: "10px" }}>
          {data.lastName}
        </div>
        <div style={{ fontSize: "8px", textAlign: "center", marginBottom: "15px", opacity: 0.8 }}>
          {data.jobTitle}
        </div>

        {/* Contact */}
        <div style={{ fontSize: "7.5px", width: "100%", textAlign: "center", borderTop: "1px solid #444", paddingTop: "10px", marginBottom: "15px" }}>
          <div style={{ marginBottom: "3px" }}>{data.email}</div>
          <div style={{ marginBottom: "3px" }}>{data.phone}</div>
          <div>{data.location}</div>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div style={{ fontSize: "7.5px", textAlign: "center" }}>
            <div style={{ fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase" }}>Skills</div>
            {data.skills.slice(0, 10).map((skill, idx) => (
              <div key={idx} style={{ marginBottom: "2px" }}>
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right content */}
      <div style={{ padding: "30px 20px", color: "#000" }}>
        {/* About */}
        {data.summary && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px", textTransform: "uppercase" }}>About Me</div>
            <div style={{ fontSize: "8px", lineHeight: 1.5 }}>{data.summary}</div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px", textTransform: "uppercase" }}>Education</div>
            {data.education.map((edu, idx) => (
              <div key={idx} style={{ fontSize: "8px", marginBottom: "4px" }}>
                <div style={{ fontWeight: "600" }}>{edu.degree}</div>
                <div>{edu.school}</div>
                <div style={{ fontSize: "7px", color: "#666" }}>{edu.dates}{edu.gpa && ` • GPA: ${edu.gpa}`}</div>
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px", textTransform: "uppercase" }}>Experience</div>
            {data.experience.map((exp, idx) => (
              <div key={idx} style={{ fontSize: "8px", marginBottom: "6px" }}>
                <div style={{ fontWeight: "600" }}>{exp.role}</div>
                <div style={{ color: "#666" }}>{exp.company}</div>
                <div style={{ color: "#999", fontSize: "7px", marginBottom: "3px" }}>{exp.dates}</div>
                <ul style={{ marginLeft: "12px", fontSize: "7.5px" }}>
                  {exp.bullets.slice(0, 2).map((bullet, bidx) => (
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
    </div>
  );
}
