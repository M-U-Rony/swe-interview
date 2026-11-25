import { User } from "@/models/model";
import dbConnect from "@/utils/dbConnection";
import { signinSchema } from "@/utils/zodSchemas";
import { NextRequest, NextResponse } from "next/server";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
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

        const isUser = await User.findOne({ email });

        if (!isUser) {
            return NextResponse.json({
                success: false,
                message: "Incorrect email or password",
            }, { status: 401 });
        }

        const isPasswordCorrect = await bcrypt.compare(password, isUser.password);

        if (!isPasswordCorrect) {
            return NextResponse.json({
                success: false,
                message: "Incorrect email or password",
            }, { status: 401 });
        }

        const token = signSession({
            userId: isUser._id.toString(),
            email: isUser.email,
            username: isUser.username,
        });

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