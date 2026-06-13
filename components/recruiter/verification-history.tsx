"use client";

import { Calendar, CheckCircle, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const verificationHistory = [
  {
    id: 1,
    candidateName: "Sarah Johnson",
    status: "verified",
    date: "2024-06-13",
    trustScore: 9.2,
    flags: 0,
  },
  {
    id: 2,
    candidateName: "Alex Chen",
    status: "flagged",
    date: "2024-06-12",
    trustScore: 6.8,
    flags: 2,
  },
  {
    id: 3,
    candidateName: "Emma Davis",
    status: "verified",
    date: "2024-06-12",
    trustScore: 8.5,
    flags: 0,
  },
  {
    id: 4,
    candidateName: "Michael Brown",
    status: "verified",
    date: "2024-06-11",
    trustScore: 9.5,
    flags: 0,
  },
  {
    id: 5,
    candidateName: "Lisa Anderson",
    status: "flagged",
    date: "2024-06-11",
    trustScore: 5.2,
    flags: 3,
  },
];

export function VerificationHistory() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Verification History</h3>
          <p className="text-sm text-muted-foreground">Recent verification activities and results</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Candidate</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Trust Score</th>
                <th className="px-4 py-3 text-left font-semibold">Flags</th>
              </tr>
            </thead>
            <tbody>
              {verificationHistory.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-card/50">
                  <td className="px-4 py-3">{item.candidateName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === "verified" ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-400">Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-400">Flagged</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-secondary rounded-full h-1.5">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${(item.trustScore / 10) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium">{item.trustScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.flags > 0 ? (
                      <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium">
                        {item.flags} flag{item.flags !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
