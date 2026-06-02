import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export default async function customeAuth() {
  try {
    const cookie = await cookies();
    const token = cookie.get("auth_token")?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const payload = (await jwtVerify(token, secret)).payload;

    return {
      user: {
        id: payload.id as string,
        name: payload.name as string,
        email: payload.email as string,
        image: payload.image as string,
        role: payload.role as string,
      },
    };
  } catch (err) {
    return false;
  }
}
