import prisma from "@/lib/prisma";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (!username || !password) {
    return NextResponse.json({ message: "Usuario y contraseña requeridos" }, { status: 400 });
  }

  const user = await prisma.users.findUnique({
    where: { username }
  });

  if (!user || user.password !== password) {
    return NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 });
  }

    // Crear el token
  const token = await new SignJWT({ 
    userId: user.id_user, 
    username: user.username, 
    role: user.rol 
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  // Retornar el token y guardarlo en una cookie
  const response = NextResponse.json({ success: true });

  response.cookies.set("auth_token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7200, // 2 horas en segundos
  });

  // Guardar datos no sensibles en cookies accesibles por JS si los necesitas
  response.cookies.set("username", user.username, { secure: process.env.NODE_ENV === "production", sameSite: "lax" });
  response.cookies.set("role", user.rol, { secure: process.env.NODE_ENV === "production", sameSite: "lax" });

  return response;
}