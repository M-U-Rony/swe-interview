import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserSession, SESSION_COOKIE } from "@/lib/auth";
import { User } from "@/models/model";

/**
 * Sign out everywhere: bumping tokenVersion invalidates every token issued so
 * far, including copies of this one (D9 #31). POST only, so a link or image on
 * another site cannot sign the user out.
 */
export async function POST() {
    try {
        const session = await getUserSession();
        if (session) {
            await User.updateOne({ _id: session.userId }, { $inc: { tokenVersion: 1 } });
        }

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, "", {
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
