import { User } from "@/models/model";
import dbConnect from "@/utils/dbConnection";
import { signinSchema } from "@/utils/zodSchemas";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
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

        const token = jwt.sign({
            userId: isUser._id.toString(),
            email: isUser.email,
            username: isUser.username,
        }, process.env.JWT_SECRET || "interview-prep-ai-secret-default-key-98765", {
            expiresIn: "7d"
        });

        const cookieStore = await cookies();
        cookieStore.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
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