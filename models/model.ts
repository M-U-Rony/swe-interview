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

export const END_REASONS = ['user', 'agent', 'error', 'unknown'] as const;
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
    // Set once the browser connects to ElevenLabs.
    conversationId: { type: String },
    // How the call ended, as reported by the browser. Missing if the tab closed.
    endReason: { type: String, enum: END_REASONS },
    // JSON array of { role, message, timeInCallSecs }, filled once ElevenLabs finishes processing.
    transcript: { type: String },
    answerCount: { type: Number },
    durationSecs: { type: Number },

    scoring: {
        status: { type: String, enum: SCORING_STATUSES },
        attempts: { type: Number, default: 0 },
        startedAt: { type: Date },
    },
    score: { type: Number },
    feedback: { type: String },
}, { timestamps: true })

interviewSchema.index({ conversationId: 1 }, { unique: true, sparse: true });
interviewSchema.index({ user: 1, createdAt: -1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
