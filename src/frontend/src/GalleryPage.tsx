import { GraduationCap, Images } from "lucide-react";

export const GALLERY_ITEMS: { id: string; src: string; label: string }[] = [
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
    src: "/assets/whatsapp_image_2025-11-17_at_10.19.06_am-019d6c4f-b156-725c-8f24-f58936beb3bb.jpeg",
    label: "School Celebration",
  },
];

interface GalleryPageProps {
  onBack: () => void;
}

export default function GalleryPage({ onBack }: GalleryPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="bg-navy shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / back button */}
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-3 group"
              aria-label="Back to main site"
              data-ocid="gallery-page.back.logo"
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
              data-ocid="gallery-page.back.button"
              className="text-white/70 hover:text-white text-sm transition-colors px-3 py-1.5 rounded border border-white/20 hover:border-white/40"
            >
              ← Back to Website
            </button>
          </div>
        </div>
      </header>

      {/* ── PAGE HERO ───────────────────────────────────────────────────── */}
      <div className="bg-navy-dark py-14 text-center">
        <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-4">
          <Images className="w-7 h-7 text-gold" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-gold">
          Gallery
        </h1>
        <p className="mt-3 text-white/70 text-base max-w-md mx-auto">
          A glimpse into the vibrant life at Mehjoor Educational Institute
        </p>
      </div>

      {/* ── GALLERY GRID ────────────────────────────────────────────────── */}
      <main className="flex-1 py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {GALLERY_ITEMS.map((item, i) => (
              <div
                key={item.id}
                data-ocid={`gallery-page.item.${i + 1}`}
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
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-navy-dark text-white py-8">
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
