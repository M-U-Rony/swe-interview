import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "interview-prep-ai-secret-default-key-98765";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;

        if (!sessionToken) {
            return NextResponse.json({
                success: false,
                isAuthenticated: false,
                message: "No session found"
            }, { status: 401 });
        }

        let payload: any = null;
        try {
            payload = jwt.verify(sessionToken, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({
                success: false,
                isAuthenticated: false,
                message: "Invalid or expired session"
            }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            isAuthenticated: true,
            user: {
                userId: payload.userId,
                email: payload.email,
                username: payload.username
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching current user session:", error);
        return NextResponse.json({
            success: false,
            isAuthenticated: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}
