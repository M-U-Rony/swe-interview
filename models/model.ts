import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

const resumeSchema = new mongoose.Schema({

    rawText: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);