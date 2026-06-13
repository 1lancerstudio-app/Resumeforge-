"use client";

import { ResumeData } from "@/lib/resume-types";

interface BrownAuditorProps {
  data: ResumeData;
}

export function BrownAuditorTemplate({ data }: BrownAuditorProps) {
  return (
    <div
      style={{
        width: "595px",
        height: "842px",
        background: "#ffffff",
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        fontFamily: '"Instrument Sans", sans-serif',
        fontSize: "9px",
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          background: "#4A3728",
          color: "#f5f5f5",
          padding: "30px 20px",
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
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              marginBottom: "15px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "#666",
              marginBottom: "15px",
            }}
          />
        )}

        {/* Name */}
        <div style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", marginBottom: "4px" }}>
          {data.firstName} {data.lastName}
        </div>
        <div style={{ fontSize: "10px", textAlign: "center", marginBottom: "15px", opacity: 0.9 }}>
          {data.jobTitle}
        </div>

        {/* Contact */}
        <div style={{ fontSize: "8px", width: "100%", textAlign: "center", marginBottom: "15px", borderTop: "1px solid #666", paddingTop: "10px" }}>
          <div>{data.email}</div>
          <div>{data.phone}</div>
          <div>{data.location}</div>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div style={{ fontSize: "8px", textAlign: "center" }}>
            <div style={{ fontWeight: "bold", marginBottom: "6px" }}>SKILLS</div>
            {data.skills.slice(0, 8).map((skill, idx) => (
              <div key={idx} style={{ marginBottom: "2px" }}>
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right content */}
      <div style={{ padding: "30px 25px", color: "#000" }}>
        {/* About */}
        {data.summary && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px" }}>ABOUT ME</div>
            <div style={{ fontSize: "8px", lineHeight: 1.5 }}>{data.summary}</div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px" }}>EDUCATION</div>
            {data.education.map((edu, idx) => (
              <div key={idx} style={{ fontSize: "8px", marginBottom: "4px" }}>
                <div style={{ fontWeight: "600" }}>{edu.degree}</div>
                <div>{edu.school} • {edu.dates}</div>
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px" }}>EXPERIENCE</div>
            {data.experience.map((exp, idx) => (
              <div key={idx} style={{ fontSize: "8px", marginBottom: "6px" }}>
                <div style={{ fontWeight: "600" }}>{exp.role}</div>
                <div>{exp.company} • {exp.dates}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
