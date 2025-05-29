import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { GithubProfile } from "next-auth/providers/github";
import clientPromise from "@/app/lib/mongodb";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username:",
          type: "text",
          placeholder: "your-username",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "your-password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const users = client.db().collection("users");

          // Find user by username
          const user = await users.findOne({
            username: credentials.username,
          });

          // console.log("ggg", user);

          if (!user) {
            return null;
          }

          // Check password
          // const isPasswordValid = await bcrypt.compare(
          //   credentials.password,
          //   user.password
          // );

          // if (!isPasswordValid) {
          //   return null;
          // }

          // Return user object (without password)
          // return {
          //   id: user._id.toString(),
          //   name: user.name || user.username,
          //   username: user.username,
          //   role: user.role,
          // };

          return user as any; // Cast to any to avoid type issues, ensure user object matches expected shape
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }

        // const user = {
        //   id: "42",
        //   name: "Admin",
        //   password: "admin",
        //   role: "manager",
        // };

        // if (
        //   credentials?.username === user.name &&
        //   credentials?.password === user.password
        // ) {
        //   return user;
        // } else {
        //   return null;
        // }
      },
    }),
  ],
  callbacks: {
    // async redirect({ url, baseUrl }) {
    //   // If it's a sign-in, go to home
    //   if (url.includes("/auth/signin")) {
    //     return baseUrl + "/";
    //   }
    //   // If it's a sign-out, go to home
    //   if (url.includes("/auth/signout")) {
    //     return baseUrl + "/";
    //   }
    //   // Default to home page
    //   return baseUrl + "/";
    // },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    // async jwt({ token, user }) {
    //   if (user) token.role = user.role;

    //   return token;
    // },
    async jwt({ token, user }) {
      // When user signs in, add custom fields to token
      if (user) {
        // console.log("User in JWT callback:", user);
        token.id = user._id ?? "";
        token.image = user.profilePic ?? "";
        token.username = user.username;
        token.role = user.role;
        token.profilePic = user.profilePic;
      }
      return token;
    },
    // async session({ session, token }) {
    //   if (session?.user) session.user.role = token.role;

    //   return session;
    // },
    async session({ session, token }) {
      // Add custom fields from token to session
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.image = token.image as string;
        //@ts-ignore
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        //@ts-ignore
        session.user.profilePic = token.profilePic as string;
      }
      return session;
    },
  },
  // Add this for production
  session: {
    strategy: "jwt",
  },
};
