"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RoleGuard({ required }: { required: "candidate" | "recruiter" }) {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("resumeforge_role");
    if (!role) {
      router.replace("/login");
    } else if (role !== required) {
      router.replace(role === "recruiter" ? "/recruiter" : "/dashboard");
    }
  }, [router, required]);

  return null;
}
