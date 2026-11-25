import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import dbConnect from "@/utils/dbConnection";
import { Profile } from "@/models/model";
import { getUserId } from "@/lib/auth";
import { detectImageType, MAX_IMAGE_BYTES, UPLOAD_DIR } from "@/lib/uploads";

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

    // Check and save image if uploaded (D8 #25): PNG/JPEG/WebP only, by content, max 2 MB.
    if (profileImageFile && profileImageFile.size > 0) {
      if (profileImageFile.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: "Profile image must be 2 MB or smaller." }, { status: 400 });
      }

      const buffer = Buffer.from(await profileImageFile.arrayBuffer());
      const ext = detectImageType(buffer);
      if (!ext) {
        return NextResponse.json({ error: "Profile image must be a PNG, JPEG or WebP." }, { status: 400 });
      }

      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      // The server picks the name and extension; nothing comes from the uploaded file name.
      const filename = `${userId}-${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
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
