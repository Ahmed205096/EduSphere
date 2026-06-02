import { C } from "../../register/_components/colors";

export default function Footer() {
  return (
    <footer
      className="flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-10 w-full mt-auto"
      style={{
        borderTop: `1px solid ${C.outlineVariant}`,
        backgroundColor: C.surfaceContainerLowest,
      }}
    >
      <div
        className="text-sm font-medium mb-4 md:mb-0"
        style={{ color: C.onSurface }}
      >
        EduSphere LMS
      </div>
      <div
        className="text-xs mb-4 md:mb-0"
        style={{ color: C.onSurfaceVariant }}
      >
        © {new Date().getFullYear()} EduSphere LMS. Professional Growth
        Redefined.
      </div>
      <div className="flex gap-6">
        {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(
          (link) => (
            <a
              key={link}
              href="#"
              className="text-xs hover:opacity-80"
              style={{ color: C.onSurfaceVariant }}
            >
              {link}
            </a>
          ),
        )}
      </div>
    </footer>
  );
}
