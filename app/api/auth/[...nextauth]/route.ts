import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

export async function GET(request: Request, context: { params: Promise<{ nextauth?: string[] }> }) {
  const params = await context.params;
  return handler(request, { params });
}

export async function POST(request: Request, context: { params: Promise<{ nextauth?: string[] }> }) {
  const params = await context.params;
  return handler(request, { params });
}

