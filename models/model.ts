import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

const resumeSchema = new mongoose.Schema({

    fileName: { type: String, required: true },
    rawText: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: { type: String, required: true },
    targetRole: { type: String, required: true },
    experienceLevel: { 
        type: String, 
        enum: ['Junior', 'Mid', 'Senior', 'Lead'], 
        required: true 
    },
    bio: { type: String },
    profileImage: { type: String }
}, { timestamps: true });

export const INTERVIEW_STATUSES = ['pending', 'in_progress', 'completed', 'abandoned', 'failed'] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

// 'conduct': Marcus ended the call over inappropriate language (D5 #19).
export const END_REASONS = ['user', 'agent', 'error', 'unknown', 'conduct'] as const;
export type EndReason = (typeof END_REASONS)[number];

export const SCORING_STATUSES = ['pending', 'running', 'done', 'failed'] as const;
export type ScoringStatus = (typeof SCORING_STATUSES)[number];

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // No default on purpose: interviews saved before statuses existed have none and are shown as finished.
    status: { type: String, enum: INTERVIEW_STATUSES },
    // Copied from the profile when the interview starts, so later profile edits don't change history (D10).
    targetRole: { type: String },
    experienceLevel: { type: String },
    // Set once the browser connects to ElevenLabs.
    conversationId: { type: String },
    // How the call ended, as reported by the browser. Missing if the tab closed.
    endReason: { type: String, enum: END_REASONS },
    // JSON array of { role, message, timeInCallSecs }, filled once ElevenLabs finishes processing.
    transcript: { type: String },
    answerCount: { type: Number },
    // ElevenLabs' own description of why the call ended, kept for debugging.
    terminationReason: { type: String },
    durationSecs: { type: Number },

    scoring: {
        status: { type: String, enum: SCORING_STATUSES },
        attempts: { type: Number, default: 0 },
        startedAt: { type: Date },
    },
    // Weighted overall score and summary (D5, D11).
    score: { type: Number },
    feedback: { type: String },
    evaluation: {
        criteria: {
            technical: { assessed: Boolean, score: Number, summary: String },
            problemSolving: { assessed: Boolean, score: Number, summary: String },
            communication: { assessed: Boolean, score: Number, summary: String },
            behavioral: { assessed: Boolean, score: Number, summary: String },
        },
        // Shown separately, never part of `score` (D11 #35).
        fluency: { score: Number, summary: String },
        // Quotes copied from candidate turns, verified to exist in the transcript (D5).
        evidence: [{ _id: false, criterion: String, polarity: { type: String, enum: ['+', '-'] }, quote: String, note: String }],
        strengths: [String],
        improvements: [String],
        manipulationAttempt: Boolean,
    },
}, { timestamps: true })

interviewSchema.index({ conversationId: 1 }, { unique: true, sparse: true });
interviewSchema.index({ user: 1, createdAt: -1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
