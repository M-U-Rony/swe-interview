"use client";

import React, { useState, useRef } from "react";
import { Label, buttonPrimary } from "@/components/ui";

interface ResumesClientProps {
  initialFileName: string | null;
}

export default function ResumesClient({ initialFileName }: ResumesClientProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(initialFileName);
  const [error, setError] = useState<string>( "");
  const [success, setSuccess] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const [parsingStep, setParsingStep] = useState<string>("Uploading file...");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag over handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Only PDF files are supported at this time.");
      }
    }
  };

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError("");
    setSuccess("");
  };

  // Submit file to backend parser
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setSuccess("");
    setWarning("");
    
    setParsingStep("Reading your resume…");

    try {
      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse PDF document.");
      }

      setSuccess("Resume saved. Your next interview will use it.");
      setWarning(data.warning || "");
      setCurrentFileName(file.name);
      setFile(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred during parsing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-ink pt-6">
        <Label>Current resume</Label>
        <span className="text-lg font-semibold">{currentFileName ?? "None yet"}</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <label
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-start gap-3 border-[1.5px] border-dashed p-8 ${
            dragActive ? "border-signal bg-mark/40" : "border-ink bg-surface"
          }`}
        >
          <span className="font-display text-2xl font-extrabold tracking-[-0.02em]">
            {file ? file.name : "Drop a PDF here, or click to choose one"}
          </span>
          <span className="text-[15px] text-muted">
            Text-based PDF · up to 5 MB · the first 5 pages and 8,000 characters are used
          </span>
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="sr-only" />
        </label>

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
        {warning && (
          <p role="alert" className="m-0 border-l-2 border-signal bg-mark/40 py-2 pl-4 text-base">
            {warning}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-5">
          <button type="submit" disabled={!file || loading} className={`${buttonPrimary} cursor-pointer`}>
            {loading ? parsingStep : currentFileName ? "Replace resume" : "Upload resume"}
          </button>
          {file && !loading && (
            <button type="button" onClick={handleRemoveFile} className="cursor-pointer text-[15px] underline underline-offset-4">
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
