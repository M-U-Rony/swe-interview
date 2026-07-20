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

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: { type: Number },
    transcript: {
        type: String,
        required: true
    },
    
    conversationId: {
        type: String,
        required: true
    }
}, { timestamps: true })

const aiFeedbackSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    },

    conversationId: {
        type: String,
        required: true
    },

    aiFeedback: { type: String }
})

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
export const AiFeedback = mongoose.models.AiFeedback || mongoose.model('AiFeedback', aiFeedbackSchema);
