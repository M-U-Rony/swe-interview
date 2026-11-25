"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

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

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
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
    
    // Simulate premium parsing steps
    setParsingStep("Uploading PDF file to secure parser...");
    setTimeout(() => setParsingStep("Reading document structure..."), 1000);
    setTimeout(() => setParsingStep("Extracting text and skill matrices..."), 2000);

    try {
      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse PDF document.");
      }

      setSuccess("Resume successfully parsed and uploaded!");
      setWarning(data.warning || "");
      setCurrentFileName(file.name);
      setFile(null);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during parsing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left 2 Cols: Dropzone Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-light-secondary/20 dark:border-brand-dark-primary/20 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Upload PDF Resume</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/30">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-900/30">
                {success}
              </div>
            )}

            {warning && (
              <div role="alert" className="p-4 text-xs font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300 rounded-2xl border border-amber-200 dark:border-amber-900/30">
                {warning}
              </div>
            )}

            {/* Drag and Drop Zone */}
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`border-2 border-dashed rounded-2xl p-10 text-center space-y-4 cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? "border-brand-dark-secondary bg-brand-light-accent/15 dark:border-brand-light-primary dark:bg-brand-dark-secondary/5"
                    : "border-brand-light-primary/45 dark:border-brand-dark-primary/40 hover:bg-brand-light-accent/10 dark:hover:bg-brand-dark-secondary/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <div className="w-12 h-12 rounded-full bg-brand-dark-secondary/10 dark:bg-brand-light-primary/10 text-brand-dark-secondary dark:text-brand-light-primary flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Drag & Drop your resume here, or <span className="text-brand-dark-secondary dark:text-brand-light-primary hover:underline">browse files</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Only PDF files are supported (max. 5MB)</p>
                </div>
              </div>
            ) : (
              /* Selected File Card */
              <div className="p-5 rounded-2xl bg-white dark:bg-brand-dark-bg/60 border border-brand-light-secondary dark:border-brand-dark-primary/30 flex items-center justify-between">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-xl flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-brand-dark-accent/20 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}

            {file && (
              <div className="flex flex-col space-y-4">
                {loading ? (
                  <div className="glass-panel p-5 rounded-2xl border border-brand-light-primary/10 flex flex-col items-center justify-center space-y-3">
                    <svg className="animate-spin h-6 w-6 text-brand-dark-secondary dark:text-brand-light-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest animate-pulse">
                      {parsingStep}
                    </p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/95 text-white dark:text-brand-dark-bg font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Upload & Parse Resume</span>
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right 1 Col: Active Resume Display / History */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-brand-light-secondary/20 dark:border-brand-dark-primary/20 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Profile</h3>

          {!currentFileName ? (
            <div className="text-center py-12 px-4 bg-brand-light-accent/15 dark:bg-brand-dark-bg/25 border border-dashed border-brand-light-primary/30 dark:border-brand-dark-primary/30 rounded-2xl text-gray-500 dark:text-gray-400 space-y-3">
              <svg className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Resume not uploaded yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Please select a PDF document on the left to initialize your AI session profile.</p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white/50 dark:bg-brand-dark-bg/30 border border-brand-light-secondary dark:border-brand-dark-primary/25 space-y-4">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2.5 bg-brand-dark-secondary/15 dark:bg-brand-light-primary/20 text-brand-dark-secondary dark:text-brand-light-primary rounded-xl flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentFileName}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Status: Active & Processed</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-brand-light-primary/10">
                <Link
                  href="/dashboard/interview"
                  className="w-full py-2.5 bg-brand-dark-secondary hover:bg-brand-dark-secondary/90 dark:bg-brand-light-primary dark:hover:bg-brand-light-primary/90 text-white dark:text-brand-dark-bg font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Start Mock Interview</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
