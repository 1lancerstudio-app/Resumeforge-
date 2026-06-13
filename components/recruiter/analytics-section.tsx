"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

const verificationData = [
  { month: "Jan", verified: 45, flagged: 8 },
  { month: "Feb", verified: 52, flagged: 6 },
  { month: "Mar", verified: 48, flagged: 10 },
  { month: "Apr", verified: 61, flagged: 5 },
  { month: "May", verified: 55, flagged: 7 },
  { month: "Jun", verified: 67, flagged: 9 },
];

const fraudData = [
  { name: "Education Mismatch", value: 35 },
  { name: "Employment Gap", value: 25 },
  { name: "Certification Invalid", value: 20 },
  { name: "Duplicate Entry", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

export function AnalyticsSection() {
  return (
    <div className="space-y-8">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Success Rate</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <span className="text-3xl font-semibold">87%</span>
          <p className="text-xs text-muted-foreground mt-2">+5% vs last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Avg Trust Score</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-3xl font-semibold">8.4/10</span>
          <p className="text-xs text-muted-foreground mt-2">Based on 187 verifications</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Fraud Detected</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-3xl font-semibold">13%</span>
          <p className="text-xs text-muted-foreground mt-2">12 flagged resumes</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Avg Time</span>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <span className="text-3xl font-semibold">2.3s</span>
          <p className="text-xs text-muted-foreground mt-2">Per verification</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Trend */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Verification Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={verificationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }} />
              <Legend />
              <Line type="monotone" dataKey="verified" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fraud Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Fraud Flags Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={fraudData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {fraudData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
