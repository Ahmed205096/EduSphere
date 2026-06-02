"use client";
import { useState } from "react";
import { useCustomeSession } from "@/store";
import Link from "next/link";
import NotificationBell from "@/app/components/notifications/NotificationBell";

const navLinks = [
  { label: "Dashboard", icon: "dashboard", link: "/instructor" },
  { label: "My Courses", icon: "school", link: "/instructor/courses" },
  { label: "Analytics", icon: "monitoring", link: "" },
  { label: "Resources", icon: "folder_open", link: "" },
];

type Props = { onCreateCourse: () => void };

export default function InstructorTopbar({ onCreateCourse }: Props) {
  const { session, clearSession } = useCustomeSession();
  const [active, setActive] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface/80 backdrop-blur-xl border-b border-white/10 flex items-center gap-2 px-3 sm:px-4 lg:gap-4 lg:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0 lg:mr-2">
        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/20">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
          >
            school
          </span>
        </div>
        <span className="font-semibold text-primary text-[15px] hidden xl:block">
          EduSphere
        </span>
      </div>

      {/* Nav links */}
      <nav className="hidden md:flex flex-1 min-w-0 items-center justify-center gap-1 lg:justify-start">
        {navLinks.map((link) => (
          <Link
            href={link.link}
            key={link.label}
            onClick={() => setActive(link.label)}
            aria-label={link.label}
            title={link.label}
            className={`flex h-10 w-10 shrink-0 items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition-all xl:w-auto xl:px-3 ${
              active === link.label
                ? "text-primary bg-primary/10"
                : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              {link.icon}
            </span>
            <span className="hidden xl:inline">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Search */}
      <div className="relative hidden xl:block xl:w-64">
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          style={{ fontSize: 16 }}
        >
          search
        </span>
        <input
          type="text"
          placeholder="Search courses, students..."
          className="w-full bg-surface-container-low border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={onCreateCourse}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-[13px] font-medium hover:brightness-110 active:scale-95 transition-all xl:mr-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            add
          </span>
          New Course
        </button>

        <NotificationBell />
        <button className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary rounded-lg hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            settings
          </span>
        </button>

        {/* Avatar + dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary text-xs font-bold">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-10 z-50 w-52 glass-card rounded-xl py-2 shadow-xl">
                {session?.user && (
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-[13px] font-medium text-on-surface truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {session.user.email}
                    </p>
                  </div>
                )}
                <button className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16 }}
                  >
                    help
                  </span>
                  Help Center
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    clearSession();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-error hover:bg-error/10 transition-colors"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16 }}
                  >
                    logout
                  </span>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
