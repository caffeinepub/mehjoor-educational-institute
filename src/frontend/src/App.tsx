import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  MapPin,
  Menu,
  Phone,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import GalleryPage from "./GalleryPage";
import LoginPage from "./LoginPage";
import {
  type Announcement,
  type Assessment,
  type Inquiry,
  createActor,
} from "./backend";

// ─── Nav links ──────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#programs", label: "Programs" },
  { href: "#gallery", label: "Gallery" },
  { href: "#assessments", label: "Assessments" },
  { href: "#notices", label: "Notices" },
  { href: "#admissions", label: "Admissions" },
  { href: "#inquiry", label: "Inquiry" },
  { href: "#contact", label: "Contact" },
  { href: "#login", label: "Login" },
];

const CLASS_LEVELS = [
  "Foundational Stage",
  "Primary",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

const INQUIRY_CLASS_LEVELS = [
  "Foundational Stage",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(ts: bigint): string {
  return new Date(Number(ts)).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── App Root (handles view switching) ───────────────────────────────────────
export default function App() {
  const [currentView, setCurrentView] = useState<"main" | "login" | "gallery">(
    "main",
  );

  if (currentView === "login") {
    return (
      <>
        <Toaster richColors position="top-right" />
        <LoginPageWrapper onBack={() => setCurrentView("main")} />
      </>
    );
  }

  if (currentView === "gallery") {
    return (
      <>
        <Toaster richColors position="top-right" />
        <GalleryPage onBack={() => setCurrentView("main")} />
      </>
    );
  }

  return (
    <MainApp
      onGoToLogin={() => setCurrentView("login")}
      onGoToGallery={() => setCurrentView("gallery")}
    />
  );
}

// ─── LoginPage wrapper with its own data hooks ────────────────────────────────
function LoginPageWrapper({ onBack }: { onBack: () => void }) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal();

  // ── Assessment form state ──────────────────────────────────────────────────
  const [assessTitle, setAssessTitle] = useState("");
  const [assessSubject, setAssessSubject] = useState("");
  const [assessClass, setAssessClass] = useState("");
  const [assessDate, setAssessDate] = useState("");
  const [assessDesc, setAssessDesc] = useState("");
  const [assessFile, setAssessFile] = useState<File | null>(null);
  const assessFileRef = useRef<HTMLInputElement>(null);

  // ── Notice form state ─────────────────────────────────────────────────────
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: ownerResult, refetch: refetchOwner } = useQuery<
    import("@icp-sdk/core/principal").Principal | null
  >({
    queryKey: ["owner"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getOwner();
    },
    enabled: !!actor && !isFetching,
  });

  const ownerPrincipal = ownerResult ?? null;
  const isOwner = !!(
    currentPrincipal &&
    ownerPrincipal &&
    currentPrincipal.toText() === ownerPrincipal.toText()
  );
  const noOwnerSet = ownerResult !== undefined && ownerResult === null;

  const { data: assessments = [], isLoading: assessLoading } = useQuery<
    Assessment[]
  >({
    queryKey: ["assessments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssessments();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: notices = [], isLoading: noticesLoading } = useQuery<
    Announcement[]
  >({
    queryKey: ["notices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: inquirySubmissions = [], isLoading: submissionsLoading } =
    useQuery<Inquiry[]>({
      queryKey: ["inquiries-owner"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getInquiriesOwner();
      },
      enabled: !!actor && !isFetching && isOwner,
    });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addAssessmentMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const dateTs = BigInt(new Date(assessDate).getTime());
      let fileUrl: string | null = null;
      if (assessFile) {
        const bytes = new Uint8Array(await assessFile.arrayBuffer());
        const { ExternalBlob } = await import("./backend");
        const blob = ExternalBlob.fromBytes(bytes);
        fileUrl = blob.getDirectURL();
      }
      return actor.addAssessment(
        assessTitle,
        assessSubject,
        assessClass,
        dateTs,
        assessDesc,
        fileUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Assessment added successfully!");
      setAssessTitle("");
      setAssessSubject("");
      setAssessClass("");
      setAssessDate("");
      setAssessDesc("");
      setAssessFile(null);
      if (assessFileRef.current) assessFileRef.current.value = "";
    },
    onError: () => {
      toast.error("Failed to add assessment. Please try again.");
    },
  });

  const claimOwnerMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.setOwner();
    },
    onSuccess: () => {
      refetchOwner();
      toast.success("Ownership claimed successfully!");
    },
    onError: () => {
      toast.error("Failed to claim ownership. Please try again.");
    },
  });

  const addNoticeMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.addAnnouncement(noticeTitle, noticeContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Notice posted successfully!");
      setNoticeTitle("");
      setNoticeContent("");
    },
    onError: () => {
      toast.error("Failed to post notice. Please try again.");
    },
  });

  return (
    <LoginPage
      onBack={onBack}
      identity={identity ?? null}
      isOwner={isOwner}
      noOwnerSet={noOwnerSet}
      claimOwnerMutation={claimOwnerMutation}
      addAssessmentMutation={addAssessmentMutation}
      addNoticeMutation={addNoticeMutation}
      assessments={assessments}
      assessLoading={assessLoading}
      notices={notices}
      noticesLoading={noticesLoading}
      inquirySubmissions={inquirySubmissions}
      submissionsLoading={submissionsLoading}
      // Assessment form state
      assessTitle={assessTitle}
      setAssessTitle={setAssessTitle}
      assessSubject={assessSubject}
      setAssessSubject={setAssessSubject}
      assessClass={assessClass}
      setAssessClass={setAssessClass}
      assessDate={assessDate}
      setAssessDate={setAssessDate}
      assessDesc={assessDesc}
      setAssessDesc={setAssessDesc}
      assessFile={assessFile}
      setAssessFile={setAssessFile}
      assessFileRef={assessFileRef}
      // Notice form state
      noticeTitle={noticeTitle}
      setNoticeTitle={setNoticeTitle}
      noticeContent={noticeContent}
      setNoticeContent={setNoticeContent}
      classLevels={CLASS_LEVELS}
    />
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function MainApp({
  onGoToLogin,
  onGoToGallery,
}: {
  onGoToLogin: () => void;
  onGoToGallery: () => void;
}) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [admissionsOpen, setAdmissionsOpen] = useState(false);

  // ── Inquiry form state ─────────────────────────────────────────────────────
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryClass, setInquiryClass] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: assessments = [], isLoading: assessLoading } = useQuery<
    Assessment[]
  >({
    queryKey: ["assessments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssessments();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: notices = [], isLoading: noticesLoading } = useQuery<
    Announcement[]
  >({
    queryKey: ["notices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addInquiryMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.addInquiry(inquiryName, inquiryClass, inquiryMsg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries-owner"] });
      toast.success("Inquiry submitted! We will get back to you soon.");
      setInquiryName("");
      setInquiryClass("");
      setInquiryMsg("");
    },
    onError: () => {
      toast.error("Failed to submit inquiry. Please try again.");
    },
  });

  function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryName || !inquiryClass || !inquiryMsg) {
      toast.error("Please fill in all required fields.");
      return;
    }
    addInquiryMutation.mutate();
  }

  function scrollTo(id: string) {
    setMobileOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-navy shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-navy" />
              </div>
              <span className="font-display font-bold text-gold text-lg leading-tight hidden sm:block">
                Mehjoor Educational
              </span>
              <span className="font-display font-bold text-gold text-base leading-tight sm:hidden">
                MEI
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  type="button"
                  key={link.href}
                  data-ocid={`nav.${link.label.toLowerCase()}.link`}
                  onClick={() => {
                    if (link.label === "Login") {
                      onGoToLogin();
                    } else if (link.label === "Gallery") {
                      onGoToGallery();
                    } else {
                      scrollTo(link.href);
                    }
                  }}
                  className={
                    link.label === "Login"
                      ? "ml-2 px-3 py-1.5 text-sm bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 transition-colors rounded font-semibold font-sans flex items-center gap-1.5"
                      : "px-3 py-2 text-sm text-white/80 hover:text-gold transition-colors rounded font-sans"
                  }
                >
                  {link.label === "Login" && <Lock className="w-3.5 h-3.5" />}
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Mobile menu toggle */}
            <button
              type="button"
              data-ocid="nav.mobile_menu.toggle"
              className="lg:hidden text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-navy-dark border-t border-white/10">
            <nav className="flex flex-col px-4 py-3 gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  type="button"
                  key={link.href}
                  data-ocid={`nav.mobile.${link.label.toLowerCase()}.link`}
                  onClick={() => {
                    if (link.label === "Login") {
                      setMobileOpen(false);
                      onGoToLogin();
                    } else if (link.label === "Gallery") {
                      setMobileOpen(false);
                      onGoToGallery();
                    } else {
                      scrollTo(link.href);
                    }
                  }}
                  className={
                    link.label === "Login"
                      ? "text-left px-3 py-2.5 text-sm text-gold font-semibold flex items-center gap-2 hover:text-gold/80 transition-colors rounded"
                      : "text-left px-3 py-2.5 text-sm text-white/80 hover:text-gold transition-colors rounded"
                  }
                >
                  {link.label === "Login" && <Lock className="w-3.5 h-3.5" />}
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="min-h-screen flex items-center justify-center bg-navy-dark"
      >
        <div className="text-center px-4 flex flex-col items-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gold leading-tight">
            Mehjoor Educational Institute
          </h1>
          <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-white/80 tracking-wide font-light">
            Building the Future Leaders of Tomorrow
          </p>
        </div>
      </section>
      {/* ── ABOUT ───────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              About Us
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Mehjoor Educational Institute is committed to providing quality
                education from the Foundational Stage through High School,
                fostering academic excellence and character development.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Our dedicated faculty, modern facilities, and holistic
                curriculum ensure that every student reaches their fullest
                potential — both academically and as responsible members of
                society.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: Users, value: "500+", label: "Students" },
                  { icon: BookOpen, value: "14", label: "Programs" },
                  { icon: Award, value: "20+", label: "Years" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-6 h-6 text-navy" />
                    </div>
                    <div className="font-display text-2xl font-bold text-navy">
                      {value}
                    </div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/sc-019d664b-d464-7608-af45-784bf604837a.jpeg"
                alt="School campus grounds"
                className="rounded-lg shadow-card w-full object-cover h-72"
              />
              <div className="absolute -bottom-4 -left-4 bg-gold rounded-lg p-4 shadow-card-hover">
                <p className="font-display font-bold text-navy text-sm">
                  Est. 2004
                </p>
                <p className="text-navy/70 text-xs">Serving Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── PROGRAMS ────────────────────────────────────────────────────── */}
      <section id="programs" className="py-20 bg-secondary/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              Our Programs
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
              Comprehensive education pathways from early childhood through
              advanced levels
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Foundational Stage",
                desc: "Play-based learning to build early foundations in literacy, numeracy, and social skills.",
                img: "/assets/whatsapp_image_2026-04-07_at_9.25.17_am-019d6c44-d7d9-73ca-9133-f8daf4b6ccad.jpeg",
                badge: "Ages 3–5",
              },
              {
                title: "Primary School",
                desc: "Core subjects with creative enrichment to develop confident, curious learners.",
                img: "/assets/solar_system-019d6625-0d4a-7437-a4a7-2dd885a2d4df.jpg",
                badge: "Grades 1–5",
              },
              {
                title: "High School",
                desc: "Rigorous academics preparing students for advanced levels with critical thinking and lab sciences.",
                img: "/assets/highschool-019d6644-7f4e-7764-a376-56cbc711d6d7.jpg",
                badge: "Grades 6–10",
              },
            ].map((prog, i) => (
              <Card
                key={prog.title}
                data-ocid={`programs.item.${i + 1}`}
                className="overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="relative overflow-hidden h-44">
                  <img
                    src={prog.img}
                    alt={prog.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <Badge className="absolute top-3 right-3 bg-gold text-navy font-semibold border-0">
                    {prog.badge}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-navy">
                    {prog.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {prog.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* ── ASSESSMENTS (public list only) ──────────────────────────────── */}
      <section id="assessments" className="py-20 bg-secondary/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              Assessments
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
              Upcoming tests, exams, and evaluations for all classes
            </p>
          </div>

          <h3 className="font-display text-2xl font-bold text-navy mb-6 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-gold" />
            Scheduled Assessments
          </h3>

          {assessLoading ? (
            <div
              data-ocid="assessments.loading_state"
              className="flex items-center justify-center py-12"
            >
              <Loader2 className="w-8 h-8 animate-spin text-navy" />
            </div>
          ) : assessments.length === 0 ? (
            <div
              data-ocid="assessments.empty_state"
              className="text-center py-12 text-muted-foreground bg-card rounded-lg shadow-xs border border-border"
            >
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No assessments scheduled yet.</p>
              <p className="text-sm mt-1">
                Check back later for upcoming assessments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((a, i) => (
                <Card
                  key={String(a.id)}
                  data-ocid={`assessments.item.${i + 1}`}
                  className="shadow-card"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="font-display text-navy text-lg">
                        {a.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-secondary text-navy border-0 text-xs"
                      >
                        {a.classLevel}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-xs mt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {a.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(a.date)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  {(a.description || a.fileUrl) && (
                    <CardContent className="pt-0">
                      {a.description && (
                        <p className="text-sm text-muted-foreground">
                          {a.description}
                        </p>
                      )}
                      {a.fileUrl && (
                        <a
                          href={a.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          data-ocid={`assessments.download.${i + 1}`}
                          className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-navy border border-navy/30 rounded px-3 py-1.5 hover:bg-navy/5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download File
                        </a>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* ── NOTICE BOARD (public list only) ─────────────────────────────── */}
      <section id="notices" className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              Notice Board
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
              Important notices and announcements from the school administration
            </p>
          </div>

          <h3 className="font-display text-2xl font-bold text-navy mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-gold" />
            Posted Notices
          </h3>

          {noticesLoading ? (
            <div
              data-ocid="notices.loading_state"
              className="flex items-center justify-center py-12"
            >
              <Loader2 className="w-8 h-8 animate-spin text-navy" />
            </div>
          ) : notices.length === 0 ? (
            <div
              data-ocid="notices.empty_state"
              className="text-center py-12 text-muted-foreground bg-card rounded-lg shadow-xs border border-border"
            >
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No notices posted yet.</p>
              <p className="text-sm mt-1">
                Check back later for school notices and announcements.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...notices]
                .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                .map((notice, i) => (
                  <Card
                    key={String(notice.id)}
                    data-ocid={`notices.item.${i + 1}`}
                    className="shadow-card border-l-4 border-l-gold"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="font-display text-navy text-lg">
                          {notice.title}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {formatDate(notice.timestamp)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {notice.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </section>
      {/* ── ADMISSIONS ──────────────────────────────────────────────────── */}
      <section id="admissions" className="py-20 bg-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 border border-gold/40 mb-6">
            <GraduationCap className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Admissions Open
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Join Mehjoor Educational Institute and become part of a vibrant
            learning community dedicated to academic excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={admissionsOpen} onOpenChange={setAdmissionsOpen}>
              <DialogTrigger asChild>
                <Button
                  data-ocid="admissions.open_modal_button"
                  size="lg"
                  className="bg-gold hover:bg-gold-dark text-navy font-semibold px-10"
                >
                  Get Admission Details
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="admissions.dialog" className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-navy text-xl">
                    Admission Information
                  </DialogTitle>
                  <DialogDescription className="text-base leading-relaxed mt-2">
                    Visit the school premises for more details or contact{" "}
                    <a
                      href="tel:9070239572"
                      className="font-semibold text-navy underline"
                    >
                      9070239572
                    </a>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <MapPin className="w-5 h-5 text-gold shrink-0" />
                    <p className="text-sm text-foreground">
                      Visit us at our school campus during working hours
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <Phone className="w-5 h-5 text-gold shrink-0" />
                    <p className="text-sm text-foreground">
                      Call us:{" "}
                      <a
                        href="tel:9070239572"
                        className="font-semibold text-navy"
                      >
                        9070239572
                      </a>
                    </p>
                  </div>
                </div>
                <Button
                  data-ocid="admissions.close_button"
                  className="mt-2 bg-navy hover:bg-navy-dark text-white w-full"
                  onClick={() => setAdmissionsOpen(false)}
                >
                  Close
                </Button>
              </DialogContent>
            </Dialog>
            <Button
              data-ocid="admissions.inquiry.secondary_button"
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 px-10"
              onClick={() => scrollTo("#inquiry")}
            >
              Submit Inquiry
            </Button>
          </div>
        </div>
      </section>
      {/* ── INQUIRY ─────────────────────────────────────────────────────── */}
      <section id="inquiry" className="py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              Inquiry
            </h2>
            <p className="text-muted-foreground mt-6">
              Have a question? Send us a message and we&#39;ll get back to you.
            </p>
          </div>
          <Card className="shadow-card">
            <CardContent className="pt-8 pb-8">
              <form
                data-ocid="inquiry.form"
                onSubmit={handleInquirySubmit}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-name">Student Name *</Label>
                  <Input
                    id="inquiry-name"
                    data-ocid="inquiry.name.input"
                    placeholder="Full name of the student"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-class">Class *</Label>
                  <Select value={inquiryClass} onValueChange={setInquiryClass}>
                    <SelectTrigger
                      id="inquiry-class"
                      data-ocid="inquiry.class.select"
                    >
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {INQUIRY_CLASS_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-msg">Message *</Label>
                  <Textarea
                    id="inquiry-msg"
                    data-ocid="inquiry.message.textarea"
                    placeholder="Write your question or message here..."
                    rows={4}
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="inquiry.submit_button"
                  className="w-full bg-navy hover:bg-navy-dark text-white font-semibold"
                  disabled={addInquiryMutation.isPending}
                  size="lg"
                >
                  {addInquiryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Inquiry"
                  )}
                </Button>
                {addInquiryMutation.isError && (
                  <p
                    data-ocid="inquiry.error_state"
                    className="text-sm text-destructive text-center"
                  >
                    Failed to submit. Please try again.
                  </p>
                )}
                {addInquiryMutation.isSuccess && (
                  <p
                    data-ocid="inquiry.success_state"
                    className="text-sm text-green-600 text-center font-medium"
                  >
                    ✓ Inquiry submitted successfully!
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* ── CONTACT ─────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-secondary/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              Contact Us
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Phone,
                title: "Phone",
                line1: "9070239572",
                line2: "Available Mon–Sat",
                href: "tel:9070239572",
              },
              {
                icon: MapPin,
                title: "Address",
                line1: "Mehjoor Educational Institute",
                line2: "Mehjoor Nagar, Srinagar",
                href: undefined,
              },
              {
                icon: BookOpen,
                title: "Office Hours",
                line1: "Monday – Saturday",
                line2: "9:00 AM – 3:00 PM",
                href: undefined,
              },
            ].map(({ icon: Icon, title, line1, line2, href }) => (
              <Card
                key={title}
                className="text-center shadow-card hover:shadow-card-hover transition-shadow"
              >
                <CardContent className="pt-8 pb-8">
                  <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-navy" />
                  </div>
                  <h3 className="font-display font-bold text-navy text-lg mb-2">
                    {title}
                  </h3>
                  {href ? (
                    <a
                      href={href}
                      className="text-muted-foreground hover:text-navy transition-colors"
                    >
                      <p className="font-medium">{line1}</p>
                      <p className="text-sm mt-0.5">{line2}</p>
                    </a>
                  ) : (
                    <>
                      <p className="text-muted-foreground font-medium">
                        {line1}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {line2}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-navy-dark text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-navy" />
              </div>
              <div>
                <p className="font-display font-bold text-white">
                  Mehjoor Educational Institute
                </p>
                <p className="text-white/50 text-sm">
                  Nurturing Minds, Building Futures
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-white/70 text-sm">
                📞{" "}
                <a
                  href="tel:9070239572"
                  className="hover:text-gold transition-colors"
                >
                  9070239572
                </a>
              </p>
              <p className="text-white/40 text-xs mt-2">
                © {new Date().getFullYear()}. Built with ❤️ using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? window.location.hostname
                      : "",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white/60 transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
