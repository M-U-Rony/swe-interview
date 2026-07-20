"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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

      setSuccess("Profile settings saved successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-light-secondary/20 dark:border-brand-dark-primary/20 shadow-sm">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Avatar Upload Left Column */}
        <div className="flex flex-col items-center text-center space-y-4">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-brand-light-primary/20 pb-2 w-full">
            Profile Photo
          </h3>

          <div className="relative group">
            {/* Circular Preview Container */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-brand-light-primary/10 border-2 border-brand-light-primary/45 dark:border-brand-dark-primary/45 flex items-center justify-center relative shadow">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-brand-dark-secondary dark:text-brand-light-primary font-black text-4xl uppercase">
                  {fullName.substring(0, 2)}
                </span>
              )}
            </div>
            {/* Overlay trigger */}
            <button
              type="button"
              onClick={handleUploadClick}
              className="absolute inset-0 rounded-full bg-brand-dark-bg/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            >
              <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider">Change Photo</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleUploadClick}
            className="px-4 py-2 border border-brand-light-primary/30 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl hover:bg-brand-light-accent/10 transition-all focus:outline-none"
          >
            Upload Photo
          </button>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Supports PNG, JPG, or WEBP. Max. 2MB</p>
        </div>

        {/* Form Fields Right Column (Spans 2) */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-brand-light-primary/20 pb-2">
            Professional Profile
          </h3>

          {error && (
            <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 transition-all"
              />
            </div>

            {/* Target Role */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Target Role / Specialty</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                required
                placeholder="E.g., Senior Fullstack Developer"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 transition-all"
              />
            </div>

            {/* Experience Level Dropdown */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Experience Seniority</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 transition-all"
              >
                <option value="Junior">Junior (0 - 2 years)</option>
                <option value="Mid">Mid-Level (2 - 5 years)</option>
                <option value="Senior">Senior (5 - 8 years)</option>
                <option value="Lead">Lead / Principal (8+ years)</option>
              </select>
            </div>

            {/* Bio Text Area */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Professional Bio / Summary</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A brief summary of your tech stack, career focus, and achievements..."
                className="w-full px-4 py-2.5 rounded-xl border border-brand-light-secondary dark:border-brand-dark-primary/30 bg-white dark:bg-brand-dark-bg/40 text-sm text-gray-900 placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/95 text-white dark:text-brand-dark-bg font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 focus:outline-none"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
