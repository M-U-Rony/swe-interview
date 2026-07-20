import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession();

        if (!session) {
            return NextResponse.json({
                success: false,
                isAuthenticated: false,
                message: "No session or invalid token"
            }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            isAuthenticated: true,
            user: {
                userId: session.userId,
                email: session.email,
                username: session.username
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
