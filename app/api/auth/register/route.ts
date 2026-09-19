// app/api/login/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: "Usuario y contraseña requeridos" }, { status: 400 });
  }

  // Buscar usuario en la base de datos
  const user = await prisma.users.findUnique({
    where: { username }
  });

  // Nota: En un caso real, usa bcrypt para comparar el hash de la contraseña
  if (!user || user.password !== password) {
    return NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Login correcto",
    user: { username: user.username }
  });
}