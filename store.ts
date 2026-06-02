import { create } from "zustand";

type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: "student" | "instructor" | "admin";
  };
};

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type CustomeSessionStore = {
  session: Session | null;
  status: SessionStatus;
  fetchSession: () => Promise<void>;
  clearSession: () => Promise<void>;
};

export const useCustomeSession = create<CustomeSessionStore>((set) => ({
  session: null,
  status: "loading",

  fetchSession: async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        set({ session: null, status: "unauthenticated" });
        return;
      }

      const data = await res.json();
      if (!data || !data.session)
        set({ session: null, status: "unauthenticated" });
      else set({ session: data.session, status: "authenticated" });
    } catch (err) {
      console.log(err);
      set({ session: null, status: "unauthenticated" });
    }
  },
  clearSession: async () => {
    set({ status: "loading" });
    try {
      const res = await fetch("/api/auth/signout", {
        method: "DELETE",
      });
      if (res.status === 200) {
        set({ session: null, status: "unauthenticated" });
        return;
      }
      set({ status: "authenticated" });
    } catch (err) { 
      console.log(err);
      set({ session: null, status: "unauthenticated" });
    }
  },
}));
