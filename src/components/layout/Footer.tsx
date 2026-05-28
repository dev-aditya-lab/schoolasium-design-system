import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

const FOOTER_LINKS = {
  Design: [
    { href: "/tokens",             label: "Design Tokens" },
    { href: "/tokens#colors",      label: "Colors"        },
    { href: "/tokens#typography",  label: "Typography"    },
    { href: "/tokens#spacing",     label: "Spacing"       },
  ],
  Develop: [
    { href: "/components",         label: "Components"    },
    { href: "/resources",          label: "Resources"     },
    { href: "/guide#developers",   label: "Dev Guide"     },
    { href: "/guide",              label: "Getting Started"},
  ],
  Platform: [
    { href: "/ai-guidelines",      label: "AI Guidelines" },
    { href: "/employee-portal",    label: "Employee Portal"},
    { href: "/guide#branding",     label: "Branding Rules"},
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo-square.png"
                alt="Schoolasium"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="font-bold text-[15px] text-[var(--foreground)]">
                Schoolasium <span className="text-[var(--color-primary-500)]">DS</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[200px]">
              The design ecosystem for building world-class EdTech experiences.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--color-primary-500)]/30 text-[var(--color-primary-400)] bg-[var(--color-primary-500)]/10">
                v1.0.0
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--color-success)]/30 text-[var(--color-success-dark)] bg-[var(--color-success)]/10">
                Stable
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
                {heading}
              </h4>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            Made with{" "}
            <Heart size={11} className="text-[var(--color-error)]" fill="currentColor" />
            {" "}by Schoolasium Design &amp; Engineering
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} Schoolasium. Internal use only.
          </p>
        </div>
      </div>
    </footer>
  );
}
