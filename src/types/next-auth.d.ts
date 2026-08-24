import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "patient" | "doctor" | "admin";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "patient" | "doctor" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "patient" | "doctor" | "admin";
  }
}
