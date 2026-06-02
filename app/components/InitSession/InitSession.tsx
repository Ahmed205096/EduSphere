"use client";
import { ReactNode, useEffect } from "react";
import { useCustomeSession } from "@/store";

export default function InitSession({ children }: { children: ReactNode }) {
  const fetchSession = useCustomeSession((state) => state.fetchSession);
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);
  return <>{children}</>;
}
