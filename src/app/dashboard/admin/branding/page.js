"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Save, Loader2, Eye, RotateCcw, Upload, X } from "lucide-react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_FORM = {
  companyName: "KUN Real Estate",
  tagline: "Building excellence through trusted partnerships.",
  aboutText:
    "We are a leading developer and investment group in Saudi Arabia, managing large-scale hospitality, residential, and mixed-use projects.",
  learnMoreUrl: "/about",
  logoUrl: "",
  faviconUrl: "",
  backgroundImageUrl: "",
  primaryColor: "#0A1628",
  accentColor: "#B8960A",
  statProjects: "50+",
  statPartners: "200+",
  statYears: "15+",
};

// ─── Helper components ────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <div
      className="bg-white rounded-xl p-6 mb-6"
      style={{ boxShadow: "0 2px 8px rgba(10,22,40,0.08)" }}
    >
      <h2 className="text-[#0A1628] font-bold text-base mb-5 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#B8960A] rounded-full flex-shrink-0" />
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-[#0A1628] mb-1.5">
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-[10px] bg-white border border-[#CBD5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8960A]/20 focus:border-[#B8960A] transition-all duration-200 text-[#1A1A2E] placeholder-gray-400";

// ─── Image upload row ─────────────────────────────────────────────────────────
function ImageField({ label, fieldKey, value, onUpload, onRemove, uploading, accept = "image/*" }) {
  const inputRef = useRef(null);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {value ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-[#E2E8F0] rounded-xl mb-2">
          <img
            src={value}
            alt={label}
            className="w-12 h-12 object-contain rounded-lg border border-[#E2E8F0] bg-gray-50"
          />
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-xs truncate">{value}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-[#0A1628] text-sm font-medium rounded-xl border border-[#CBD5E0] transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {value ? "Replace" : "Upload"} {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0], fieldKey); e.target.value = ""; }}
      />
    </div>
  );
}

// ─── Live Preview (inner content stays dark — shows login page mockup) ────────
function LivePreview({ form }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#E2E8F0]"
      style={{ height: "430px", boxShadow: "0 2px 8px rgba(10,22,40,0.08)" }}
    >
      <div
        style={{
          transform: "scale(0.52)",
          transformOrigin: "top left",
          width: "192%",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          className="p-10 min-h-screen"
          style={{
            background: `linear-gradient(135deg, #0F1B35 0%, #1A365D 55%, #2D3748 100%)`,
          }}
        >
          {/* Logo + company name */}
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${form.accentColor}cc, ${form.accentColor})` }}
            >
              {form.logoUrl ? (
                <img src={form.logoUrl} alt={form.companyName} className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-white font-bold text-xl">KUN</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{form.companyName || "Company Name"}</h1>
              <p className="text-white/70 text-base">Procurement &amp; Contracts Department</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <p className="text-2xl font-light text-white italic leading-relaxed">
              &ldquo;{form.tagline || "Your tagline here"}&rdquo;
            </p>
          </div>

          {/* About box */}
          <div className="bg-white/10 rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">About {form.companyName}</h3>
            <p className="text-white/80 text-base leading-relaxed">
              {form.aboutText || "About text will appear here."}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: form.statProjects, label: "Projects" },
              { value: form.statPartners, label: "Partners" },
              { value: form.statYears,    label: "Years" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-2xl p-6 text-center border border-white/10"
                style={{ backgroundColor: `${form.accentColor}22` }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: form.accentColor }}
                >
                  {value || "—"}
                </div>
                <div className="text-white/60 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BrandingSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/login"); return; }
    const user = JSON.parse(raw);
    if (user.roleId !== 1) { router.replace("/dashboard/executive"); return; }
  }, [router]);

  // ── Load current branding ───────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/branding`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data) setForm(prev => ({ ...prev, ...data })); })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, []);

  // ── Field helpers ───────────────────────────────────────────────────────
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // ── Image upload ────────────────────────────────────────────────────────
  const handleImageUpload = async (file, fieldKey) => {
    setUploadingField(fieldKey);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("field", fieldKey);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/branding/upload`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd }
      );
      const data = await res.json();
      if (res.ok && data.url) {
        set(fieldKey, data.url);
        toast.success("Image uploaded.");
      } else {
        toast.error(data.message || "Upload failed.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploadingField(null);
    }
  };

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/branding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save failed.");
      }
      toast.success("Branding settings saved successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to save branding settings.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#B8960A]" />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      {/* ── Reset confirmation modal (stays dark) ── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0A1628] border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Reset to Defaults?</h3>
            </div>
            <p className="text-white/70 text-sm mb-6">
              All branding settings will be restored to KUN Real Estate defaults. This cannot be undone unless you save first.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setForm(DEFAULT_FORM);
                  setShowResetModal(false);
                  toast.success("Reset to defaults.");
                }}
                className="flex-1 py-2.5 bg-red-500/80 hover:bg-red-500 text-white font-bold rounded-xl transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Light page background ── */}
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F8FC" }}>
        <div className="max-w-7xl mx-auto w-full p-6">

          {/* ── Page header ── */}
          <div className="mb-8">
            <nav className="text-sm text-gray-400 mb-2 flex items-center gap-1">
              <span>Dashboard</span>
              <span className="mx-1">›</span>
              <span>Administration</span>
              <span className="mx-1">›</span>
              <span className="text-[#B8960A] font-medium">Branding Settings</span>
            </nav>
            <h1 className="text-[28px] font-bold text-[#0A1628]">Branding Settings</h1>
            <p className="text-gray-500 text-sm mt-1">
              Control how your system looks to suppliers and staff.
            </p>
          </div>

          {/* ── Two-column grid ── */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">

            {/* ── LEFT: Settings form ── */}
            <div className="lg:col-span-2">

              {/* Section 1 — Identity */}
              <SectionCard title="Identity">
                <div>
                  <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                  <input
                    id="companyName"
                    type="text"
                    value={form.companyName}
                    onChange={e => set("companyName", e.target.value)}
                    placeholder="e.g. KUN Real Estate"
                    className={inputCls}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
                  <input
                    id="tagline"
                    type="text"
                    value={form.tagline}
                    onChange={e => set("tagline", e.target.value)}
                    placeholder="e.g. Building excellence through trusted partnerships."
                    className={inputCls}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel htmlFor="aboutText">About Text</FieldLabel>
                    <span className={`text-xs font-mono ${form.aboutText.length > 300 ? "text-red-500" : "text-gray-400"}`}>
                      {form.aboutText.length}/300
                    </span>
                  </div>
                  <textarea
                    id="aboutText"
                    value={form.aboutText}
                    onChange={e => set("aboutText", e.target.value.slice(0, 300))}
                    rows={4}
                    placeholder="A short description of your company..."
                    className={inputCls + " resize-none"}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="learnMoreUrl">Learn More URL</FieldLabel>
                  <input
                    id="learnMoreUrl"
                    type="text"
                    value={form.learnMoreUrl}
                    onChange={e => set("learnMoreUrl", e.target.value)}
                    placeholder="/about"
                    className={inputCls}
                  />
                </div>
              </SectionCard>

              {/* Section 2 — Logo & Images */}
              <SectionCard title="Logo &amp; Images">
                <ImageField
                  label="Logo"
                  fieldKey="logoUrl"
                  value={form.logoUrl}
                  onUpload={handleImageUpload}
                  onRemove={() => set("logoUrl", "")}
                  uploading={uploadingField === "logoUrl"}
                />
                <ImageField
                  label="Favicon"
                  fieldKey="faviconUrl"
                  value={form.faviconUrl}
                  onUpload={handleImageUpload}
                  onRemove={() => set("faviconUrl", "")}
                  uploading={uploadingField === "faviconUrl"}
                />
                <ImageField
                  label="Background Image (optional)"
                  fieldKey="backgroundImageUrl"
                  value={form.backgroundImageUrl}
                  onUpload={handleImageUpload}
                  onRemove={() => set("backgroundImageUrl", "")}
                  uploading={uploadingField === "backgroundImageUrl"}
                />
              </SectionCard>

              {/* Section 3 — Brand Colors */}
              <SectionCard title="Brand Colors">
                <div>
                  <FieldLabel>Primary Color (Navy)</FieldLabel>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={e => set("primaryColor", e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer border border-[#CBD5E0] bg-white p-0.5 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={form.primaryColor}
                      onChange={e => set("primaryColor", e.target.value)}
                      placeholder="#0A1628"
                      className="w-32 p-2.5 bg-white border border-[#CBD5E0] rounded-lg text-[#1A1A2E] font-mono text-sm focus:outline-none focus:border-[#B8960A] focus:ring-2 focus:ring-[#B8960A]/20 transition-all"
                    />
                    <div
                      className="w-9 h-9 rounded-lg border border-[#CBD5E0] flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: form.primaryColor }}
                    />
                    <span className="text-gray-400 text-xs">Used for backgrounds &amp; nav</span>
                  </div>
                </div>

                <div>
                  <FieldLabel>Accent Color (Gold)</FieldLabel>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={e => set("accentColor", e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer border border-[#CBD5E0] bg-white p-0.5 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={form.accentColor}
                      onChange={e => set("accentColor", e.target.value)}
                      placeholder="#B8960A"
                      className="w-32 p-2.5 bg-white border border-[#CBD5E0] rounded-lg text-[#1A1A2E] font-mono text-sm focus:outline-none focus:border-[#B8960A] focus:ring-2 focus:ring-[#B8960A]/20 transition-all"
                    />
                    <div
                      className="w-9 h-9 rounded-lg border border-[#CBD5E0] flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: form.accentColor }}
                    />
                    <span className="text-gray-400 text-xs">Used for buttons &amp; highlights</span>
                  </div>
                </div>
              </SectionCard>

              {/* Section 4 — Statistics */}
              <SectionCard title="Statistics (shown on login page)">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <FieldLabel htmlFor="statProjects">Projects</FieldLabel>
                    <input
                      id="statProjects"
                      type="text"
                      value={form.statProjects}
                      onChange={e => set("statProjects", e.target.value)}
                      placeholder="50+"
                      className={inputCls + " text-center font-bold text-lg"}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="statPartners">Partners</FieldLabel>
                    <input
                      id="statPartners"
                      type="text"
                      value={form.statPartners}
                      onChange={e => set("statPartners", e.target.value)}
                      placeholder="200+"
                      className={inputCls + " text-center font-bold text-lg"}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="statYears">Years</FieldLabel>
                    <input
                      id="statYears"
                      type="text"
                      value={form.statYears}
                      onChange={e => set("statYears", e.target.value)}
                      placeholder="15+"
                      className={inputCls + " text-center font-bold text-lg"}
                    />
                  </div>
                </div>
              </SectionCard>

              {/* ── Action buttons ── */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-[#E2E8F0]">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-[10px] bg-[#0A1628] hover:bg-[#B8960A] text-white font-bold rounded-lg transition-colors duration-200 disabled:opacity-50 shadow-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={() => setShowResetModal(true)}
                  className="flex items-center gap-2 px-6 py-[10px] bg-white hover:bg-gray-50 text-[#0A1628] font-bold rounded-lg border border-[#CBD5E0] transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>
              </div>
            </div>

            {/* ── RIGHT: Live preview ── */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <div className="sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-[#B8960A]" />
                  <h3 className="text-[#0A1628] font-bold">Live Preview</h3>
                  <span className="text-gray-400 text-xs ml-auto">Login page left panel</span>
                </div>

                <LivePreview form={form} />

                <p className="text-gray-400 text-xs mt-2 text-center">
                  Updates as you type
                </p>
              </div>
            </div>

          </div>{/* /grid */}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
