import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import dbConnect from "@/utils/dbConnection";
import { Profile } from "@/models/model";
import { getUserId } from "@/lib/auth";

// GET handler: Fetch active user profile
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userProfile = await Profile.findOne({ user: userId });

    return NextResponse.json({
      success: true,
      profile: userProfile || null,
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST handler: Create/Update user profile
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const formData = await req.formData();

    const fullName = formData.get("fullName") as string;
    const targetRole = formData.get("targetRole") as string;
    const experienceLevel = formData.get("experienceLevel") as string;
    const bio = formData.get("bio") as string;
    const profileImageFile = formData.get("profileImage") as File | null;

    if (!fullName || !targetRole || !experienceLevel) {
      return NextResponse.json(
        { error: "Full Name, Target Role, and Experience Level are required" },
        { status: 400 }
      );
    }

    let profileImagePath: string | undefined = undefined;

    // Check and save image if uploaded
    if (profileImageFile && profileImageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "uploads");
      
      // Ensure uploads folder exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(profileImageFile.name) || ".jpg";
      const filename = `${userId}-${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadDir, filename);

      const arrayBuffer = await profileImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(filePath, buffer);
      profileImagePath = `/api/uploads/${filename}`;
    }

    // Prepare update parameters
    const updateData: any = {
      fullName,
      targetRole,
      experienceLevel,
      bio: bio || "",
    };

    if (profileImagePath) {
      updateData.profileImage = profileImagePath;
    }

    // Upsert profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
