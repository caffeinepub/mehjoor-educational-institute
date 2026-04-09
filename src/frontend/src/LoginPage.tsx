import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import type { Identity } from "@dfinity/agent";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Inbox,
  KeyRound,
  Loader2,
  Lock,
  Megaphone,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import type { RefObject } from "react";
import type { Announcement, Assessment, Inquiry } from "./backend";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(ts: bigint): string {
  return new Date(Number(ts)).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

export interface LoginPageProps {
  onBack: () => void;
  identity: Identity | null;
  isOwner: boolean;
  noOwnerSet: boolean;
  claimOwnerMutation: UseMutationResult<unknown, Error, void, unknown>;
  addAssessmentMutation: UseMutationResult<unknown, Error, void, unknown>;
  addNoticeMutation: UseMutationResult<unknown, Error, void, unknown>;
  assessments: Assessment[];
  assessLoading: boolean;
  notices: Announcement[];
  noticesLoading: boolean;
  inquirySubmissions: Inquiry[];
  submissionsLoading: boolean;
  // Assessment form state
  assessTitle: string;
  setAssessTitle: (v: string) => void;
  assessSubject: string;
  setAssessSubject: (v: string) => void;
  assessClass: string;
  setAssessClass: (v: string) => void;
  assessDate: string;
  setAssessDate: (v: string) => void;
  assessDesc: string;
  setAssessDesc: (v: string) => void;
  assessFile: File | null;
  setAssessFile: (v: File | null) => void;
  assessFileRef: RefObject<HTMLInputElement | null>;
  // Notice form state
  noticeTitle: string;
  setNoticeTitle: (v: string) => void;
  noticeContent: string;
  setNoticeContent: (v: string) => void;
  classLevels: string[];
}

export default function LoginPage({
  onBack,
  identity,
  isOwner,
  noOwnerSet,
  claimOwnerMutation,
  addAssessmentMutation,
  addNoticeMutation,
  assessments,
  assessLoading,
  notices,
  noticesLoading,
  inquirySubmissions,
  submissionsLoading,
  assessTitle,
  setAssessTitle,
  assessSubject,
  setAssessSubject,
  assessClass,
  setAssessClass,
  assessDate,
  setAssessDate,
  assessDesc,
  setAssessDesc,
  assessFile,
  setAssessFile,
  assessFileRef,
  noticeTitle,
  setNoticeTitle,
  noticeContent,
  setNoticeContent,
  classLevels,
}: LoginPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  function handleAssessSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assessTitle || !assessSubject || !assessClass || !assessDate) return;
    addAssessmentMutation.mutate();
  }

  function handleNoticeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    addNoticeMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="bg-navy shadow-md sticky top-0 z-50">
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

      {/* ── Not logged in ──────────────────────────────────────────────── */}
      {!identity && (
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg">
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="h-1.5 bg-navy" />
              <div className="px-8 py-10">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-navy" />
                  </div>
                  <h1 className="font-display text-3xl font-bold text-navy mb-2">
                    Owner Login
                  </h1>
                  <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                    Log in with Internet Identity to access owner-only
                    management tools for Mehjoor Educational Institute.
                  </p>
                </div>

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
                        <Icon className="w-4 h-4 text-navy" />
                      </div>
                      <div>
                        <p className="font-semibold text-navy text-sm">
                          {title}
                        </p>
                        <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

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
      )}

      {/* ── Logged in but not owner — claim or restricted ─────────────── */}
      {identity && !isOwner && (
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg">
            {noOwnerSet ? (
              <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                <div className="h-1.5 bg-gold" />
                <div className="px-8 py-10 flex flex-col items-center text-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                    <Award className="w-8 h-8 text-gold" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-navy mb-2">
                      Claim School Ownership
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                      No owner has been set yet. As the first logged-in user,
                      you can claim ownership to manage the school content.
                    </p>
                  </div>
                  <Button
                    data-ocid="login-page.claim.button"
                    className="bg-gold hover:bg-gold-dark text-navy font-semibold px-10"
                    disabled={claimOwnerMutation.isPending}
                    onClick={() => claimOwnerMutation.mutate()}
                  >
                    {claimOwnerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming…
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Claim Ownership
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                <div className="h-1.5 bg-destructive" />
                <div className="px-8 py-10 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-navy mb-2">
                      Access Restricted
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                      Management tools are restricted to the school owner only.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-sm text-muted-foreground hover:text-navy transition-colors underline-offset-2 hover:underline mt-2"
                  >
                    ← Return to website
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ── Logged in as OWNER — full dashboard ───────────────────────── */}
      {identity && isOwner && (
        <main className="flex-1 px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Owner badge */}
            <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-navy">
                  Owner Dashboard
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Manage assessments, notices, and view inquiry submissions.
                </p>
              </div>
              <Badge
                data-ocid="owner-dashboard.owner.badge"
                className="bg-green-100 text-green-800 border-green-200 font-medium px-3 py-1.5 text-sm"
              >
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Logged in as Owner
              </Badge>
            </div>

            {/* ── Section 1: Add New Assessment ───────────────────────── */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy">
                    Manage Assessments
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Add new assessments for students to view and download.
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Add form */}
                <Card className="shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-navy flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-gold" />
                      Add New Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <form
                      data-ocid="owner-dashboard.assessment.form"
                      onSubmit={handleAssessSubmit}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="assess-title">Title *</Label>
                        <Input
                          id="assess-title"
                          data-ocid="owner-dashboard.assessment.title.input"
                          placeholder="e.g. Mid-Term Mathematics Exam"
                          value={assessTitle}
                          onChange={(e) => setAssessTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="assess-subject">Subject *</Label>
                          <Input
                            id="assess-subject"
                            data-ocid="owner-dashboard.assessment.subject.input"
                            placeholder="e.g. Mathematics"
                            value={assessSubject}
                            onChange={(e) => setAssessSubject(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="assess-date">Date *</Label>
                          <Input
                            id="assess-date"
                            data-ocid="owner-dashboard.assessment.date.input"
                            type="date"
                            value={assessDate}
                            onChange={(e) => setAssessDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="assess-class">Class *</Label>
                        <Select
                          value={assessClass}
                          onValueChange={setAssessClass}
                        >
                          <SelectTrigger
                            id="assess-class"
                            data-ocid="owner-dashboard.assessment.class.select"
                          >
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="assess-desc">Description</Label>
                        <Textarea
                          id="assess-desc"
                          data-ocid="owner-dashboard.assessment.description.textarea"
                          placeholder="Topics covered, instructions, or additional notes..."
                          rows={3}
                          value={assessDesc}
                          onChange={(e) => setAssessDesc(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="assess-file">
                          Attach File (PDF, Word, etc.) — Optional
                        </Label>
                        <input
                          id="assess-file"
                          type="file"
                          ref={assessFileRef}
                          data-ocid="owner-dashboard.assessment.file.input"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                          onChange={(e) =>
                            setAssessFile(e.target.files?.[0] ?? null)
                          }
                          className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-secondary file:text-navy hover:file:bg-secondary/80 cursor-pointer border border-input rounded-md px-3 py-2"
                        />
                        {assessFile && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {assessFile.name}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        data-ocid="owner-dashboard.assessment.submit_button"
                        className="w-full bg-navy hover:bg-navy-dark text-white"
                        disabled={
                          addAssessmentMutation.isPending ||
                          !assessTitle ||
                          !assessSubject ||
                          !assessClass ||
                          !assessDate
                        }
                      >
                        {addAssessmentMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding…
                          </>
                        ) : (
                          "Add Assessment"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Existing assessments */}
                <div>
                  <h3 className="font-display font-semibold text-navy mb-4 flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5 text-gold" />
                    Current Assessments
                  </h3>
                  {assessLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-7 h-7 animate-spin text-navy" />
                    </div>
                  ) : assessments.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-card rounded-lg border border-border">
                      <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">No assessments yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {assessments.map((a, i) => (
                        <Card
                          key={String(a.id)}
                          data-ocid={`owner-dashboard.assessment.item.${i + 1}`}
                          className="shadow-card"
                        >
                          <CardHeader className="pb-1 pt-4">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="font-display text-navy text-base">
                                {a.title}
                              </CardTitle>
                              <Badge
                                variant="secondary"
                                className="shrink-0 bg-secondary text-navy border-0 text-xs"
                              >
                                {a.classLevel}
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-3 text-xs mt-0.5">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {a.subject}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {formatDate(a.date)}
                              </span>
                            </CardDescription>
                          </CardHeader>
                          {a.fileUrl && (
                            <CardContent className="pt-0 pb-3">
                              <a
                                href={a.fileUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-navy border border-navy/30 rounded px-2.5 py-1 hover:bg-navy/5 transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                Download File
                              </a>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="border-t border-border mb-12" />

            {/* ── Section 2: Post Notice ───────────────────────────────── */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy">
                    Post Notices
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Write and publish notices visible to all visitors.
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Post form */}
                <Card className="shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-navy flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-gold" />
                      Post a Notice
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <form
                      data-ocid="owner-dashboard.notice.form"
                      onSubmit={handleNoticeSubmit}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="notice-title">Title *</Label>
                        <Input
                          id="notice-title"
                          data-ocid="owner-dashboard.notice.title.input"
                          placeholder="e.g. School Holiday Announcement"
                          value={noticeTitle}
                          onChange={(e) => setNoticeTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="notice-content">Content *</Label>
                        <Textarea
                          id="notice-content"
                          data-ocid="owner-dashboard.notice.content.textarea"
                          placeholder="Write your notice here..."
                          rows={5}
                          value={noticeContent}
                          onChange={(e) => setNoticeContent(e.target.value)}
                        />
                      </div>
                      <Button
                        type="submit"
                        data-ocid="owner-dashboard.notice.submit_button"
                        className="w-full bg-navy hover:bg-navy-dark text-white"
                        disabled={
                          addNoticeMutation.isPending ||
                          !noticeTitle ||
                          !noticeContent
                        }
                      >
                        {addNoticeMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Posting…
                          </>
                        ) : (
                          "Post Notice"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Existing notices */}
                <div>
                  <h3 className="font-display font-semibold text-navy mb-4 flex items-center gap-2 text-lg">
                    <Bell className="w-5 h-5 text-gold" />
                    Posted Notices
                  </h3>
                  {noticesLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-7 h-7 animate-spin text-navy" />
                    </div>
                  ) : notices.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-card rounded-lg border border-border">
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">No notices yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {[...notices]
                        .sort(
                          (a, b) => Number(b.timestamp) - Number(a.timestamp),
                        )
                        .map((notice, i) => (
                          <Card
                            key={String(notice.id)}
                            data-ocid={`owner-dashboard.notice.item.${i + 1}`}
                            className="shadow-card border-l-4 border-l-gold"
                          >
                            <CardHeader className="pb-1 pt-4">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="font-display text-navy text-base">
                                  {notice.title}
                                </CardTitle>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                                  <CalendarDays className="w-3 h-3" />
                                  {formatDate(notice.timestamp)}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 pb-3">
                              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 whitespace-pre-wrap">
                                {notice.content}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="border-t border-border mb-12" />

            {/* ── Section 3: Inquiry Submissions ──────────────────────── */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                  <Inbox className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy">
                    Inquiry Submissions
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    All inquiry form submissions from students and parents.
                  </p>
                </div>
              </div>

              {submissionsLoading ? (
                <div
                  data-ocid="owner-dashboard.submissions.loading_state"
                  className="flex justify-center py-14"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-navy" />
                </div>
              ) : inquirySubmissions.length === 0 ? (
                <div
                  data-ocid="owner-dashboard.submissions.empty_state"
                  className="text-center py-14 text-muted-foreground bg-card rounded-lg border border-border"
                >
                  <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-navy">No submissions yet.</p>
                  <p className="text-sm mt-1">
                    Inquiry form submissions will appear here once students
                    submit them.
                  </p>
                </div>
              ) : (
                <div data-ocid="owner-dashboard.submissions.list">
                  <div className="flex items-center gap-3 mb-4">
                    <Inbox className="w-4 h-4 text-gold" />
                    <span className="font-display text-base font-semibold text-navy">
                      {inquirySubmissions.length}{" "}
                      {inquirySubmissions.length === 1
                        ? "submission"
                        : "submissions"}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[...inquirySubmissions]
                      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                      .map((inq, i) => (
                        <Card
                          key={String(inq.id)}
                          data-ocid={`owner-dashboard.submissions.item.${i + 1}`}
                          className="shadow-card"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <CardTitle className="font-display text-navy text-base">
                                {inq.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 bg-secondary text-navy border-0 text-xs"
                                >
                                  {inq.classLevel}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  {formatDate(inq.timestamp)}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {inq.message}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-navy-dark text-white py-6 mt-auto">
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
