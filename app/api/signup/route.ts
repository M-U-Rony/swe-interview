import { User } from "@/models/model";
import dbConnect from "@/utils/dbConnection";
import { signupSchema } from "@/utils/zodSchemas";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();

        const result = signupSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid input",
                errors: result.error.issues
            }, { status: 400 });
        }

        const data = result.data;

        const isUserExist = await User.findOne({ email: data.email });
        if (isUserExist) {
            return NextResponse.json({
                success: false,
                message: "User with this email already exists"
            }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        await User.create({
            username: data.username,
            email: data.email,
            password: hashedPassword 
        });

        return NextResponse.json({
            success: true,
            message: "Account created successfully"
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error during signup:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}