import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "plyr-react/plyr.css";
import "./globals.css";
import InitSession from "./components/InitSession/InitSession";
import AppShell from "./components/navigation/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST ?? "http://localhost:3000"),
  applicationName: "EduSphere",
  title: {
    default: "EduSphere | Modern Learning Management System",
    template: "%s | EduSphere",
  },
  description:
    "EduSphere is a modern LMS for online courses, instructor dashboards, video lessons, quizzes, progress tracking, and real-time learning notifications.",
  keywords: [
    "EduSphere",
    "LMS",
    "learning management system",
    "online courses",
    "student dashboard",
    "instructor dashboard",
    "video lessons",
    "online quizzes",
    "course platform",
    "e-learning",
  ],
  authors: [{ name: "Ahmed Khattab" }],
  creator: "Ahmed Khattab",
  publisher: "EduSphere",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/logo.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/logo.png",
    apple: [
      {
        url: "/logo.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "EduSphere",
    title: "EduSphere | Modern Learning Management System",
    description:
      "A polished LMS with course management, video lessons, quizzes, student progress, instructor analytics, and notifications.",
    url: "/",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "EduSphere logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "EduSphere | Modern Learning Management System",
    description:
      "A modern platform for courses, video learning, quizzes, dashboards, progress tracking, and notifications.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <InitSession>
          <AppShell>{children}</AppShell>
        </InitSession>
        </body>
    </html>
  );
}
