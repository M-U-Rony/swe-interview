import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.set("session", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0, // Expire immediately
        });

        return NextResponse.json({
            success: true,
            message: "Signout successful"
        }, { status: 200 });
    } catch (error) {
        console.error("Error during signout:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

export async function GET() {
    // Also allow GET requests for direct link click sign-outs if needed
    try {
        const cookieStore = await cookies();
        cookieStore.set("session", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0,
        });
        
        return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    } catch (error) {
        console.error("Error during GET signout:", error);
        return NextResponse.redirect(new URL("/", "http://localhost:3000"));
    }
}
