"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCustomeSession } from "@/store";
import NotificationBell from "@/app/components/notifications/NotificationBell";

type AppShellProps = {
  children: React.ReactNode;
};

const hiddenNavPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
];

function dashboardPath(role?: string) {
  return role === "admin" || role === "instructor" ? "/instructor" : "/student";
}

function navLinks(role?: string) {
  if (role === "admin" || role === "instructor") {
    return [
      { label: "Dashboard", href: "/instructor" },
      { label: "Courses", href: "/instructor/courses" },
      { label: "Quizzes", href: "/instructor/quizzes" },
      { label: "Create", href: "/instructor/create" },
    ];
  }

  if (role === "student") {
    return [
      { label: "Browse", href: "/" },
      { label: "Courses", href: "/courses" },
      { label: "Dashboard", href: "/student" },
      { label: "Quiz", href: "/quiz/student" },
      { label: "Results", href: "/student/quizzes" },
    ];
  }

  return [
    { label: "Courses", href: "/courses" },
    { label: "Search", href: "/search" },
  ];
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, status, clearSession } = useCustomeSession();
  const hideNav = hiddenNavPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const links = navLinks(session?.user.role);

  async function handleSignOut() {
    await clearSession();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {!hideNav && (
        <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-surface/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2" aria-label="EduSphere home">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/15 text-primary">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                >
                  school
                </span>
              </span>
              <span className="text-sm font-semibold text-primary">EduSphere</span>
            </Link>

            <div className="ml-4 hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {status === "loading" ? (
                <span className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />
              ) : session ? (
                <>
                  <NotificationBell />
                  <span className="hidden max-w-36 truncate text-[13px] text-on-surface-variant sm:block">
                    {session.user.name}
                  </span>
                  <button
                    onClick={() => router.push(dashboardPath(session.user.role))}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="hidden rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface sm:inline-flex"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/login")}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
      <div className={hideNav ? "" : "pt-16"}>{children}</div>
    </>
  );
}
