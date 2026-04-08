import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ClipboardList,
  GraduationCap,
  Inbox,
  KeyRound,
  Loader2,
  Lock,
  Megaphone,
} from "lucide-react";
import { useEffect } from "react";

const PROTECTED_TASKS = [
  {
    icon: ClipboardList,
    title: "Manage Assessments",
    description:
      "Add and manage scheduled assessments with file attachments for students to download.",
  },
  {
    icon: Megaphone,
    title: "Post Notices",
    description:
      "Write and publish notices for students and parents to view on the Notice Board.",
  },
  {
    icon: Inbox,
    title: "View Inquiry Submissions",
    description:
      "Review all inquiry form submissions from students and parents.",
  },
];

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export default function LoginPage({ onLoginSuccess, onBack }: LoginPageProps) {
  const { identity, login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === "logging-in";

  // Auto-return to main site once logged in
  useEffect(() => {
    if (identity) {
      onLoginSuccess();
    }
  }, [identity, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-navy shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-3 group"
              aria-label="Go back to main site"
            >
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-navy" />
              </div>
              <span className="font-display font-bold text-gold text-lg leading-tight hidden sm:block group-hover:text-gold/80 transition-colors">
                Mehjoor Educational Institute
              </span>
              <span className="font-display font-bold text-gold text-base leading-tight sm:hidden">
                MEI
              </span>
            </button>

            <button
              type="button"
              onClick={onBack}
              data-ocid="login-page.back.button"
              className="text-white/70 hover:text-white text-sm transition-colors px-3 py-1.5 rounded border border-white/20 hover:border-white/40"
            >
              ← Back to Website
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 bg-navy" />

            <div className="px-8 py-10">
              {/* Icon + heading */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-navy" />
                </div>
                <h1 className="font-display text-3xl font-bold text-navy mb-2">
                  Owner Login
                </h1>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                  Log in with Internet Identity to access owner-only management
                  tools for Mehjoor Educational Institute.
                </p>
              </div>

              {/* Protected tasks */}
              <div className="space-y-3 mb-8">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  You will be able to
                </p>
                {PROTECTED_TASKS.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border"
                  >
                    <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon
                        className="w-4.5 h-4.5 text-navy"
                        style={{ width: "1.125rem", height: "1.125rem" }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">{title}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Login button */}
              <button
                type="button"
                data-ocid="login-page.login.button"
                onClick={login}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-dark text-gold font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Login with Internet Identity
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Secure, passwordless login powered by the Internet Computer
              </p>
            </div>
          </div>

          {/* Back link */}
          <p className="text-center mt-6">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-navy transition-colors underline-offset-2 hover:underline"
            >
              ← Return to Mehjoor Educational Institute website
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy-dark text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Mehjoor Educational Institute · Mehjoor
            Nagar, Srinagar
          </p>
        </div>
      </footer>
    </div>
  );
}
