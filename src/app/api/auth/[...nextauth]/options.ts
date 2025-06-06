import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { GithubProfile } from "next-auth/providers/github";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username:",
          type: "text",
          placeholder: "Enter username",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "Enter password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Get the base URL for internal API calls
          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

          // console.log("📡 Making API call to authenticate user");

          // Make API call to your authentication endpoint
          const response = await fetch(`${baseUrl}/api/auth/authenticate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          // console.log("📡 API response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json();
            // console.log("❌ API authentication failed:", errorData.error);
            return null;
          }

          const result = await response.json();
          // console.log("✅ API authentication successful", result);

          if (result.success && result.user) {
            // console.log("👤 Returning authenticated user:", {
            //   id: result.user.id,
            //   username: result.user.username,
            //   email: result.user.email,
            //   role: result.user.role,
            // });

            // console.log("👤 Returning authenticated user:", result.user);

            // return {
            //   id: result.user.id,
            //   username: result.user.username,
            //   email: result.user.email,
            //   role: result.user.role,
            //   profilePic: result.user.profilePic,
            //   firstName: result.user.firstName,
            //   lastName: result.user.lastName,
            // };

            // const { password, ...userWithoutPassword } = result.user;

            return result.user;
          }

          return null;
        } catch (error) {
          console.error("💥 API call error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        // console.log("User in JWT callback:", user);
        token.id = user._id ?? user.id ?? "";
        token.image = user.profilePic ?? "/images/avatar.svg";
        token.username = user.username;
        token.fullName = user.fullName;
        token.role = user.role;
        token.profilePic = user.profilePic;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.image = token.image as string;
        //@ts-ignore
        session.user.username = token.username as string;
        session.user.fullName = token.fullName as string;
        session.user.role = token.role as string;
        //@ts-ignore
        session.user.profilePic = token.profilePic as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
