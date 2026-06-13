"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface FraudFlag {
  type: string;
  severity: "high" | "medium" | "low";
  description: string;
}

const sampleFlags: FraudFlag[] = [
  {
    type: "Education Mismatch",
    severity: "high",
    description: "Claimed graduation date does not match university records",
  },
  {
    type: "Employment Gap",
    severity: "medium",
    description: "6-month gap in employment history not explained",
  },
  {
    type: "Certification Invalid",
    severity: "high",
    description: "AWS certification not verified in credential database",
  },
];

export function FraudDetails() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="w-4 h-4" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4" />;
      case "low":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Fraud Detection Details</h3>
        <p className="text-sm text-muted-foreground">AI-powered anomaly detection and verification results</p>
      </div>

      <div className="space-y-3">
        {sampleFlags.map((flag, index) => (
          <div key={index} className="border border-border rounded-lg p-4 hover:bg-card/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${getSeverityColor(flag.severity)}`}>
                {getSeverityIcon(flag.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{flag.type}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getSeverityColor(
                      flag.severity
                    )}`}
                  >
                    {flag.severity.charAt(0).toUpperCase() + flag.severity.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Verification Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Flags:</span>
            <span className="font-medium">{sampleFlags.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">High Severity:</span>
            <span className="font-medium text-red-400">{sampleFlags.filter((f) => f.severity === "high").length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recommendation:</span>
            <span className="font-medium">Manual Review Required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
