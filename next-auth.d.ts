import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      role: string;
      username: string;
      profilePic: string;
    } & DefaultSession;
  }

  interface User extends DefaultUser {
    role: string;
    username: string;
    profilePic: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    role: string;
    profilePic: string;
  }
}
