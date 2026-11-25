import z from 'zod'

const email = z.string().trim().toLowerCase().email('Enter a valid email address')

export const signupSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[A-Za-z0-9_]+$/, 'Username can only contain letters, numbers and _'),
    email,
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        // bcrypt silently ignores everything after 72 bytes.
        .refine((p) => new TextEncoder().encode(p).length <= 72, 'Password must be at most 72 characters')
})

export const signinSchema = z.object({
    email,
    password: z.string().min(1).max(200)
})
