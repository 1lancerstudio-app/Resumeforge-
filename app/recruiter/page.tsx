"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Mail, Phone, MapPin, Calendar, Gift, MessageCircle, Phone as PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/role-guard";
import Link from "next/link";

const teamHierarchy = {
  name: "Courtney Henry",
  role: "HR-VP",
  avatar: "👩‍💼",
  team: [
    {
      name: "Admin",
      role: "Admin",
      avatar: "👨‍💼",
      team: [
        { name: "Recruiting Manager", role: "Recruiting Manager", avatar: "👩‍💼", team: [
          { name: "Sr. Recruiter", role: "Sr. Recruiter", avatar: "👨‍💼", team: [] },
          { name: "Mid Recruiter", role: "Mid Recruiter", avatar: "👩‍💼", team: [] },
          { name: "Recruiter", role: "Recruiter", avatar: "👨‍💼", team: [] },
        ]},
        { name: "PM", role: "PM", avatar: "👩‍💼", team: [] },
      ]
    },
    {
      name: "Sourcing Manager",
      role: "Sourcing Manager",
      avatar: "👨‍💼",
      team: [
        { name: "Sr. Recruiter", role: "Sr. Recruiter", avatar: "👩‍💼", team: [] },
        { name: "Sourcer", role: "Sourcer", avatar: "👨‍💼", team: [] },
        { name: "Sourcer", role: "Sourcer", avatar: "👩‍💼", team: [] },
      ]
    },
    {
      name: "Coordinator",
      role: "Coordinator",
      avatar: "👩‍💼",
      team: [
        { name: "Intern", role: "Intern", avatar: "👨‍💼", team: [] },
        { name: "Intern", role: "Intern", avatar: "👩‍💼", team: [] },
      ]
    },
  ]
};

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  team: TeamMember[];
}

function TeamNode({ member, level = 0 }: { member: TeamMember; level?: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg mb-2 shadow-md">
          {member.avatar}
        </div>
        <span className="font-semibold text-sm text-gray-900">{member.name}</span>
        <span className="text-xs text-gray-500">{member.role}</span>
      </div>

      {member.team.length > 0 && (
        <div className="relative">
          {/* Vertical line down */}
          <div className="h-4 w-0.5 bg-gray-300 mx-auto"></div>
          
          {/* Horizontal line and children */}
          <div className="flex items-stretch gap-8 mt-4">
            {member.team.length === 1 ? (
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-gray-300 mx-auto mb-4"></div>
                <TeamNode member={member.team[0]} level={level + 1} />
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300" style={{ width: "100%", top: "-16px" }}></div>
                </div>
                {member.team.map((child, idx) => (
                  <div key={idx} className="flex flex-col items-center relative">
                    <div className="w-0.5 h-4 bg-gray-300 mx-auto mb-4 absolute -top-4 left-1/2 transform -translate-x-1/2"></div>
                    <TeamNode member={child} level={level + 1} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecruiterDetailsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const stored = localStorage.getItem("resumeforge_recruiter");
    if (!stored) {
      localStorage.setItem(
        "resumeforge_recruiter",
        JSON.stringify({
          name: "Courtney Henry",
          email: "georgia.young@example.com",
          role: "Senior Recruiter",
          phone: "(123) 456-7890",
          location: "New York, ny",
          joinDate: "15 January, 2025",
          birthday: "31 January",
        })
      );
    }
  }, []);

  return (
    <>
      <RoleGuard required="recruiter" />
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-y-auto shadow-sm`}
        >
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <div className={`font-bold text-xl text-blue-600 ${!sidebarOpen && "hidden"}`}>
              Level Up
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2">
            <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 ${!sidebarOpen && "hidden"}`}>
              Main
            </div>
            {[
              { icon: "📊", label: "Dashboard" },
              { icon: "👥", label: "Candidates" },
              { icon: "📅", label: "Interviews" },
              { icon: "📝", label: "Offers & Hires" },
            ].map((item) => (
              <Link
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
                  !sidebarOpen && "justify-center"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Tools */}
          <nav className="px-3 py-6 border-t border-gray-200 space-y-2">
            <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 ${!sidebarOpen && "hidden"}`}>
              Tools
            </div>
            {[
              { icon: "👤", label: "Recruiter Profile", active: true },
              { icon: "🤖", label: "Sora" },
              { icon: "🏠", label: "The Hub" },
              { icon: "📈", label: "Reports & Analytics" },
            ].map((item) => (
              <Link
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  item.active
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                } ${!sidebarOpen && "justify-center"}`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Others */}
          <nav className="px-3 py-4 border-t border-gray-200 space-y-2">
            <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 ${!sidebarOpen && "hidden"}`}>
              Others
            </div>
            {[
              { icon: "⚙️", label: "Settings" },
              { icon: "❓", label: "Help & Center" },
              { icon: "🚪", label: "Sign out" },
            ].map((item) => (
              <Link
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
                  !sidebarOpen && "justify-center"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Link href="/recruiter" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={24} className="text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Recruiter Details</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search anything"
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-gray-500">⌘ F</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recruiter Profile Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
                  Recruiter Info
                </p>
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl mb-4 shadow-md">
                    👩
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Courtney Henry</h2>
                  <p className="text-gray-600 mb-4">georgia.young@example.com</p>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                    Senior Recruiter
                  </div>

                  <div className="w-full space-y-4 text-left border-t border-gray-200 pt-6">
                    <div className="flex items-start gap-3">
                      <PhoneCall size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Phone</p>
                        <p className="text-gray-900 font-medium">(123) 456-7890</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Location</p>
                        <p className="text-gray-900 font-medium">New York, ny</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Joined Date</p>
                        <p className="text-gray-900 font-medium">15 January, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Gift size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Birthday</p>
                        <p className="text-gray-900 font-medium">31 January</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full mt-6">
                    <Button className="flex-1 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50">
                      <PhoneCall size={18} /> Call
                    </Button>
                    <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                      <MessageCircle size={18} /> Message
                    </Button>
                  </div>
                </div>
              </div>

              {/* Account Info Tabs */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Tab Navigation */}
                  <div className="border-b border-gray-200 flex">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "team", label: "My Team" },
                      { id: "jobs", label: "Job Listings" },
                      { id: "candidates", label: "Candidates Managed" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === "overview" && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">
                            Total Candidates Managed: <span className="font-bold text-gray-900">124</span>
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">
                            Placements this Quarter: <span className="font-bold text-gray-900">18</span>
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">
                            Success Rate: <span className="font-bold text-gray-900">92%</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === "team" && (
                      <div className="overflow-x-auto">
                        <div className="inline-block min-w-full p-4">
                          <TeamNode member={teamHierarchy} />
                        </div>
                      </div>
                    )}

                    {activeTab === "jobs" && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">3 active job listings</p>
                      </div>
                    )}

                    {activeTab === "candidates" && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">124 candidates in pipeline</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
