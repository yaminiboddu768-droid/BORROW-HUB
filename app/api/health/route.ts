import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Attempt a lightweight database query to test the connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error: any) {
    console.error("Health check failed:", error);
    return NextResponse.json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
