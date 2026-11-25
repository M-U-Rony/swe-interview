import { User } from "@/models/model";
import dbConnect from "@/utils/dbConnection";
import { signinSchema } from "@/utils/zodSchemas";
import { NextRequest, NextResponse } from "next/server";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import { clientIp, getCount, hit, reset } from "@/lib/rateLimit";

// D9 #29: 5 wrong passwords per email, 20 per IP, within 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 20;
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();

        const result = signinSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid input",
                errors: result.error.issues
            }, { status: 400 });
        }

        const { email, password } = result.data;
        const emailKey = `signin:email:${email}`;
        const ipKey = `signin:ip:${clientIp(req.headers)}`;

        if ((await getCount(emailKey)) >= MAX_FAILS_PER_EMAIL || (await getCount(ipKey)) >= MAX_FAILS_PER_IP) {
            return NextResponse.json({
                success: false,
                message: "Too many failed attempts. Please wait 15 minutes and try again.",
            }, { status: 429 });
        }

        // Emails are stored lowercase now; the original spelling covers accounts made before that.
        const isUser = await User.findOne({ email: { $in: [email, body?.email] } });
        const isPasswordCorrect = isUser ? await bcrypt.compare(password, isUser.password) : false;

        if (!isUser || !isPasswordCorrect) {
            await Promise.all([hit(emailKey, WINDOW_MS), hit(ipKey, WINDOW_MS)]);
            return NextResponse.json({
                success: false,
                message: "Incorrect email or password",
            }, { status: 401 });
        }

        await reset(emailKey);

        const token = signSession({
            userId: isUser._id.toString(),
            email: isUser.email,
            username: isUser.username,
        }, isUser.tokenVersion ?? 0);

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: SESSION_MAX_AGE_SECONDS,
        });

        return NextResponse.json({
            success: true,
            message: "Login successful",
            user: {
                username: isUser.username,
                email: isUser.email
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error during signin:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}