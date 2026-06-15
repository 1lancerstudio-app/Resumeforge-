"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function RoleGuard({ required }: { required: "candidate" | "recruiter" }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure localStorage is available and hydrated
    const timer = setTimeout(() => {
      const role = localStorage.getItem("resumeforge_role");
      const authToken = localStorage.getItem("resumeforge_auth_token");
      
      if (!role || !authToken) {
        console.log("[v0] RoleGuard: No role or auth token found, redirecting to login");
        router.replace("/login");
        return;
      }
      
      if (role !== required) {
        console.log(`[v0] RoleGuard: Role mismatch. Required: ${required}, Got: ${role}`);
        router.replace(role === "recruiter" ? "/recruiter" : "/dashboard");
        return;
      }
      
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [router, required]);

  // Don't render anything while checking auth
  if (isChecking) {
    return null;
  }

  return null;
}
