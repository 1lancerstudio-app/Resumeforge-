"use client";

import { useState } from "react";
import { Search, Filter, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockCandidates = [
  { id: 1, name: "Sarah Johnson", role: "Senior Developer", verified: true, trustScore: 9.2, starred: false },
  { id: 2, name: "Alex Chen", role: "Product Manager", verified: true, trustScore: 8.7, starred: true },
  { id: 3, name: "Emma Davis", role: "Designer", verified: false, trustScore: 7.1, starred: false },
  { id: 4, name: "Michael Brown", role: "Data Scientist", verified: true, trustScore: 9.5, starred: true },
  { id: 5, name: "Lisa Anderson", role: "DevOps Engineer", verified: true, trustScore: 8.9, starred: false },
];

export function CandidatePool() {
  const [candidates, setCandidates] = useState(mockCandidates);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "flagged">("all");

  const toggleStar = (id: number) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c))
    );
  };

  const deleteCandidate = (id: number) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterVerified === "all" ||
      (filterVerified === "verified" && c.verified) ||
      (filterVerified === "flagged" && !c.verified);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Candidate Pool</h3>
        <p className="text-sm text-muted-foreground">Manage and review your verified candidates</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterVerified === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterVerified("all")}
          >
            All ({candidates.length})
          </Button>
          <Button
            variant={filterVerified === "verified" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterVerified("verified")}
          >
            Verified ({candidates.filter((c) => c.verified).length})
          </Button>
          <Button
            variant={filterVerified === "flagged" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterVerified("flagged")}
          >
            Flagged ({candidates.filter((c) => !c.verified).length})
          </Button>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Trust Score</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((candidate) => (
                <tr key={candidate.id} className="border-b border-border hover:bg-card/50">
                  <td className="px-4 py-3">{candidate.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{candidate.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        candidate.verified
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {candidate.verified ? "Verified" : "Flagged"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-12 bg-secondary rounded-full h-1.5">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${(candidate.trustScore / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs">{candidate.trustScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleStar(candidate.id)}
                        className="p-1 hover:bg-secondary rounded"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            candidate.starred
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => deleteCandidate(candidate.id)}
                        className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground">
            No candidates found
          </div>
        )}
      </div>
    </div>
  );
}
