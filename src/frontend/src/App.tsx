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
  CheckCircle,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Inbox,
  KeyRound,
  Loader2,
  Lock,
  MapPin,
  Menu,
  Phone,
  PlusCircle,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
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
  { href: "#submissions", label: "Submissions" },
  { href: "#contact", label: "Contact" },
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

// ─── Gallery images ──────────────────────────────────────────────────────────
const GALLERY_ITEMS: { id: string; src: string; label: string }[] = [
  {
    id: "gallery-1",
    src: "/assets/img-20250524-wa0005-019d664a-d692-7551-b6fb-985505a71b4d.jpg",
    label: "School Life",
  },
  {
    id: "gallery-2",
    src: "/assets/img-20241108-wa0028-019d664a-d14a-74a4-bbf8-b0cf81110159.jpg",
    label: "School Life",
  },
  {
    id: "gallery-3",
    src: "/assets/img-20241107-wa0004-019d664a-d275-703f-b48d-dfc631f12104.jpg",
    label: "School Life",
  },
  {
    id: "gallery-4",
    src: "/assets/002-019d665c-273d-70f7-81b8-4b81f64df406.jpg",
    label: "School Life",
  },
  {
    id: "gallery-5",
    src: "/assets/whatsapp_image_2026-04-07_at_9.25.17_am-019d6c37-4b0c-706f-bb24-5ba48b86ca00.jpeg",
    label: "School Life",
  },
  {
    id: "gallery-6",
    src: "/assets/untitled-019d6644-7f4e-7764-a376-56cbc711d6d7.jpg",
    label: "School Celebration",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(ts: bigint): string {
  return new Date(Number(ts)).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const { identity, login } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [admissionsOpen, setAdmissionsOpen] = useState(false);

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

  const { data: inquirySubmissions = [], isLoading: submissionsLoading } =
    useQuery<Inquiry[]>({
      queryKey: ["inquiries-owner"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getInquiriesOwner();
      },
      enabled: !!actor && !isFetching && isOwner,
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

  const addInquiryMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.addInquiry(inquiryName, inquiryClass, inquiryMsg);
    },
    onSuccess: () => {
      toast.success("Inquiry submitted! We will get back to you soon.");
      setInquiryName("");
      setInquiryClass("");
      setInquiryMsg("");
    },
    onError: () => {
      toast.error("Failed to submit inquiry. Please try again.");
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

  function handleAssessSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assessTitle || !assessSubject || !assessClass || !assessDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    addAssessmentMutation.mutate();
  }

  function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryName || !inquiryClass || !inquiryMsg) {
      toast.error("Please fill in all required fields.");
      return;
    }
    addInquiryMutation.mutate();
  }

  function handleNoticeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) {
      toast.error("Please fill in title and content.");
      return;
    }
    addNoticeMutation.mutate();
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
                  onClick={() => scrollTo(link.href)}
                  className="px-3 py-2 text-sm text-white/80 hover:text-gold transition-colors rounded font-sans"
                >
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
                  onClick={() => scrollTo(link.href)}
                  className="text-left px-3 py-2.5 text-sm text-white/80 hover:text-gold transition-colors rounded"
                >
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
                img: "/assets/img-20241108-wa0028-019d664a-d14a-74a4-bbf8-b0cf81110159.jpg",
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
      {/* ── GALLERY ─────────────────────────────────────────────────────── */}
      <section id="gallery" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              Gallery
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
              A glimpse into the vibrant life at Mehjoor Educational Institute
            </p>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {GALLERY_ITEMS.map((item, i) => (
              <div
                key={item.id}
                data-ocid={`gallery.item.${i + 1}`}
                className="gallery-item break-inside-avoid rounded-lg overflow-hidden shadow-card cursor-pointer"
              >
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full h-auto block"
                />
                <div className="overlay">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-semibold text-sm">
                      {item.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── ASSESSMENTS ─────────────────────────────────────────────────── */}
      <section id="assessments" className="py-20 bg-secondary/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              Assessments
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
              Upcoming tests, exams, and evaluations for all classes
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* ── Assessment list ── */}
            <div>
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
                    Use the form to add the first assessment.
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

            {/* ── Add Assessment form (owner-only) ── */}
            <div>
              {!identity ? (
                /* Not logged in */
                <Card
                  data-ocid="assessments.login.card"
                  className="shadow-card"
                >
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                      <Lock className="w-7 h-7 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-navy mb-2">
                        Owner Login Required
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        Only the school owner can add assessments. Please log in
                        with Internet Identity to continue.
                      </p>
                    </div>
                    <Button
                      data-ocid="assessments.login.button"
                      className="bg-navy hover:bg-navy-dark text-white px-8"
                      onClick={login}
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </CardContent>
                </Card>
              ) : noOwnerSet ? (
                /* Logged in and no owner set yet — claim ownership */
                <Card
                  data-ocid="assessments.claim.card"
                  className="shadow-card"
                >
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center">
                      <Award className="w-7 h-7 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-navy mb-2">
                        Claim School Ownership
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        No owner has been set yet. As the first logged-in user,
                        you can claim ownership to manage assessments.
                      </p>
                    </div>
                    <Button
                      data-ocid="assessments.claim.button"
                      className="bg-gold hover:bg-gold-dark text-navy font-semibold px-8"
                      disabled={claimOwnerMutation.isPending}
                      onClick={() => claimOwnerMutation.mutate()}
                    >
                      {claimOwnerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Claim Ownership
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : !isOwner ? (
                /* Logged in but not the owner */
                <Card
                  data-ocid="assessments.restricted.card"
                  className="shadow-card"
                >
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                      <ShieldAlert className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-navy mb-2">
                        Access Restricted
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        Assessment management is restricted to the school owner.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Logged in AND is the owner */
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="font-display text-2xl font-bold text-navy flex items-center gap-2">
                      <Award className="w-6 h-6 text-gold" />
                      Add New Assessment
                    </h3>
                    <Badge
                      data-ocid="assessments.owner.badge"
                      className="bg-green-100 text-green-800 border-green-200 text-xs font-medium"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Logged in as owner
                    </Badge>
                  </div>
                  <Card className="shadow-card">
                    <CardContent className="pt-6">
                      <form
                        data-ocid="assessments.form"
                        onSubmit={handleAssessSubmit}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="assess-title">Title *</Label>
                          <Input
                            id="assess-title"
                            data-ocid="assessments.title.input"
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
                              data-ocid="assessments.subject.input"
                              placeholder="e.g. Mathematics"
                              value={assessSubject}
                              onChange={(e) => setAssessSubject(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="assess-date">Date *</Label>
                            <Input
                              id="assess-date"
                              data-ocid="assessments.date.input"
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
                              data-ocid="assessments.class.select"
                            >
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {CLASS_LEVELS.map((level) => (
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
                            data-ocid="assessments.description.textarea"
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
                            data-ocid="assessments.file.input"
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
                          data-ocid="assessments.submit_button"
                          className="w-full bg-navy hover:bg-navy-dark text-white"
                          disabled={addAssessmentMutation.isPending}
                        >
                          {addAssessmentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Assessment"
                          )}
                        </Button>
                        {addAssessmentMutation.isError && (
                          <p
                            data-ocid="assessments.error_state"
                            className="text-sm text-destructive text-center"
                          >
                            Something went wrong. Please try again.
                          </p>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* ── NOTICE BOARD ────────────────────────────────────────────────── */}
      <section id="notices" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              Notice Board
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
              Important notices and announcements from the school administration
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* ── Notices list ── */}
            <div>
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
                    The school owner can post notices using the form.
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

            {/* ── Post Notice form (owner-only) ── */}
            <div>
              {!identity ? (
                <Card data-ocid="notices.login.card" className="shadow-card">
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                      <Lock className="w-7 h-7 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-navy mb-2">
                        Owner Login Required
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        Only the school owner can post notices. Please log in
                        with Internet Identity to continue.
                      </p>
                    </div>
                    <Button
                      data-ocid="notices.login.button"
                      className="bg-navy hover:bg-navy-dark text-white px-8"
                      onClick={login}
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </CardContent>
                </Card>
              ) : noOwnerSet ? (
                <Card data-ocid="notices.claim.card" className="shadow-card">
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center">
                      <Award className="w-7 h-7 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-navy mb-2">
                        Claim School Ownership
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        No owner has been set yet. Claim ownership to manage
                        notices.
                      </p>
                    </div>
                    <Button
                      data-ocid="notices.claim.button"
                      className="bg-gold hover:bg-gold-dark text-navy font-semibold px-8"
                      disabled={claimOwnerMutation.isPending}
                      onClick={() => claimOwnerMutation.mutate()}
                    >
                      {claimOwnerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Claim Ownership
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : !isOwner ? (
                <Card
                  data-ocid="notices.restricted.card"
                  className="shadow-card"
                >
                  <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                      <Bell className="w-7 h-7 text-navy/50" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-navy mb-2">
                        View Only
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        You can view notices but only the school owner can post.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Logged in AND is the owner */
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="font-display text-2xl font-bold text-navy flex items-center gap-2">
                      <PlusCircle className="w-6 h-6 text-gold" />
                      Post a Notice
                    </h3>
                    <Badge
                      data-ocid="notices.owner.badge"
                      className="bg-green-100 text-green-800 border-green-200 text-xs font-medium"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Logged in as owner
                    </Badge>
                  </div>
                  <Card className="shadow-card">
                    <CardContent className="pt-6">
                      <form
                        data-ocid="notices.form"
                        onSubmit={handleNoticeSubmit}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="notice-title">Title *</Label>
                          <Input
                            id="notice-title"
                            data-ocid="notices.title.input"
                            placeholder="e.g. School Holiday Announcement"
                            value={noticeTitle}
                            onChange={(e) => setNoticeTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="notice-content">Content *</Label>
                          <Textarea
                            id="notice-content"
                            data-ocid="notices.content.textarea"
                            placeholder="Write your notice here..."
                            rows={5}
                            value={noticeContent}
                            onChange={(e) => setNoticeContent(e.target.value)}
                          />
                        </div>
                        <Button
                          type="submit"
                          data-ocid="notices.submit_button"
                          className="w-full bg-navy hover:bg-navy-dark text-white"
                          disabled={addNoticeMutation.isPending}
                        >
                          {addNoticeMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            "Post Notice"
                          )}
                        </Button>
                        {addNoticeMutation.isError && (
                          <p
                            data-ocid="notices.error_state"
                            className="text-sm text-destructive text-center"
                          >
                            Something went wrong. Please try again.
                          </p>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
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
      {/* ── INQUIRY SUBMISSIONS ─────────────────────────────────────────── */}
      <section id="submissions" className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy section-heading">
              Inquiry Submissions
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
              View all inquiry submissions from students and parents
            </p>
          </div>

          {!identity ? (
            /* Not logged in */
            <Card
              data-ocid="submissions.login.card"
              className="shadow-card max-w-sm mx-auto"
            >
              <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                  <Lock className="w-7 h-7 text-navy" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-navy mb-2">
                    Login Required
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    Only the school owner can view inquiry submissions. Please
                    log in with Internet Identity to continue.
                  </p>
                </div>
                <Button
                  data-ocid="submissions.login.button"
                  className="bg-navy hover:bg-navy-dark text-white px-8"
                  onClick={login}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </CardContent>
            </Card>
          ) : !isOwner ? (
            /* Logged in but not the owner */
            <Card
              data-ocid="submissions.restricted.card"
              className="shadow-card max-w-sm mx-auto"
            >
              <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-navy mb-2">
                    Access Restricted
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    Inquiry submissions are restricted to the school owner only.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : submissionsLoading ? (
            /* Owner — loading */
            <div
              data-ocid="submissions.loading_state"
              className="flex items-center justify-center py-16"
            >
              <Loader2 className="w-8 h-8 animate-spin text-navy" />
            </div>
          ) : inquirySubmissions.length === 0 ? (
            /* Owner — empty */
            <div
              data-ocid="submissions.empty_state"
              className="text-center py-16 text-muted-foreground bg-card rounded-lg shadow-xs border border-border"
            >
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-navy">No submissions yet.</p>
              <p className="text-sm mt-1">
                Inquiry form submissions will appear here once students submit
                them.
              </p>
            </div>
          ) : (
            /* Owner — list */
            <div data-ocid="submissions.list">
              <div className="flex items-center gap-3 mb-6">
                <Inbox className="w-5 h-5 text-gold" />
                <span className="font-display text-lg font-semibold text-navy">
                  {inquirySubmissions.length}{" "}
                  {inquirySubmissions.length === 1
                    ? "submission"
                    : "submissions"}
                </span>
                <Badge
                  data-ocid="submissions.owner.badge"
                  className="bg-green-100 text-green-800 border-green-200 text-xs font-medium"
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Owner view
                </Badge>
              </div>
              <div className="space-y-4">
                {[...inquirySubmissions]
                  .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                  .map((inq, i) => (
                    <Card
                      key={String(inq.id)}
                      data-ocid={`submissions.item.${i + 1}`}
                      className="shadow-card"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <CardTitle className="font-display text-navy text-lg">
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
        </div>
      </section>
      {/* ── CONTACT ─────────────────────────────────────────────────────── */}{" "}
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
                line2: "8:00 AM – 3:00 PM",
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
