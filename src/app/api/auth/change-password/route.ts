import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, verifyPassword, hashPassword } from "@/lib/auth";
import { connectDB }  from "@/lib/db";
import { Employee }   from "@/models/Employee";
import { Activity }   from "@/models/Activity";

export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both fields are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "New password must differ from the current one." }, { status: 400 });
    }

    await connectDB();
    const emp = await Employee.findById(user.sub).select("+passwordHash");
    if (!emp) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    const valid = await verifyPassword(currentPassword, emp.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

    emp.passwordHash = await hashPassword(newPassword);
    await emp.save();

    await Activity.create({
      employeeId:   user.sub,
      employeeName: user.name,
      type:    "password_reset",
      detail:  "Changed own password",
      ip:      request.headers.get("x-forwarded-for") ?? "unknown",
      device: "unknown", browser: "unknown", os: "unknown", sessionId: "",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/auth/change-password]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
