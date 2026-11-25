"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { buttonOutline, buttonPrimary, inputClass } from "@/components/ui";

interface ProfileDetails {
  fullName: string;
  targetRole: string;
  experienceLevel: "Junior" | "Mid" | "Senior" | "Lead";
  bio: string;
  profileImage: string | null;
}

interface ProfileClientProps {
  initialProfile: ProfileDetails;
}

export default function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState<string>(initialProfile.fullName);
  const [targetRole, setTargetRole] = useState<string>(initialProfile.targetRole);
  const [experienceLevel, setExperienceLevel] = useState<"Junior" | "Mid" | "Senior" | "Lead">(
    initialProfile.experienceLevel
  );
  const [bio, setBio] = useState<string>(initialProfile.bio);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialProfile.profileImage);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size exceeds 2MB limit.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("targetRole", targetRole);
    formData.append("experienceLevel", experienceLevel);
    formData.append("bio", bio);
    if (imageFile) {
      formData.append("profileImage", imageFile);
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile settings.");
      }

      setSuccess("Saved. Your next interview will use this.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col">
      <Row label="Photo">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex size-24 items-center justify-center overflow-hidden border border-ink bg-surface">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview or our own upload route
              <img src={imagePreview} alt="Profile photo" className="size-full object-cover" />
            ) : (
              <span className="font-display text-3xl font-extrabold uppercase">{fullName.substring(0, 2)}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <button type="button" onClick={handleUploadClick} className={buttonOutline}>
              Choose image
            </button>
            <span className="text-sm text-muted">PNG, JPEG or WebP · up to 2 MB</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </Row>

      <Row label="Full name" htmlFor="fullName">
        <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
      </Row>

      <Row label="Target role" htmlFor="targetRole" hint="The interview is built around this role.">
        <input
          id="targetRole"
          type="text"
          required
          placeholder="Backend Engineer"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className={inputClass}
        />
      </Row>

      <Row label="Level" htmlFor="experienceLevel" hint="Questions and scoring are pitched at this level.">
        <select
          id="experienceLevel"
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value as ProfileDetails["experienceLevel"])}
          className={inputClass}
        >
          <option value="Junior">Junior (0–2 years)</option>
          <option value="Mid">Mid (2–5 years)</option>
          <option value="Senior">Senior (5–8 years)</option>
          <option value="Lead">Lead / Principal (8+ years)</option>
        </select>
      </Row>

      <Row label="Bio" htmlFor="bio">
        <textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass} />
      </Row>

      <div className="flex flex-col items-start gap-4 border-t border-ink pt-7">
        {error && (
          <p role="alert" className="m-0 border-l-2 border-signal pl-4 text-base">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="m-0 border-l-2 border-ink pl-4 text-base">
            {success}
          </p>
        )}
        <button type="submit" disabled={saving} className={`${buttonPrimary} cursor-pointer`}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

function Row({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 border-t border-rule py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
      <label htmlFor={htmlFor} className="pt-3 font-mono text-[13px] uppercase tracking-[0.04em]">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {children}
        {hint && <span className="text-sm text-muted">{hint}</span>}
      </div>
    </div>
  );
}
