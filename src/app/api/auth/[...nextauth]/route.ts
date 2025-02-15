// import NextAuth, { NextAuthOptions } from "next-auth"
// import GoogleProvider from "next-auth/providers/google";
// import GitHubProvider from "next-auth/providers/github";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export const authOptions:NextAuthOptions = {
//     adapter: PrismaAdapter(prisma),
//     providers:[
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret:process.env.GOOGLE_CLIENT_SECRET!,
//         }),
//         GitHubProvider({
//             clientId:process.env.GITHUB_CLIENT_ID!,
//             clientSecret:process.env.GITHUB_CLIENT_SECRET!,
//         }),
//     ],
//     session:{
//         strategy:"jwt",
//     },
//     callbacks:{
//         async session({session,token}){
//             if(session?.user){
//                 (session.user as { id: string }).id = token.sub as string;
//             }
//             return session;
//         },
//     },
//     secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);
// export {handler as GET,handler as POST};

import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "your-email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Invalid email or password");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        (session.user as { id: string }).id = token.sub as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (!user.email) {
        throw new Error("Email is required for authentication");
      }

      // ✅ Fetch the full user from Prisma to get the `id`
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!dbUser) {
        // ✅ Create a new user if it doesn't exist (set `password: null` for OAuth)
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name ?? "Unknown User",
            image: user.image ?? "",
            password: "", // ✅ Fix: Allow user creation without a password
          },
        });
      }

      if (!account) {
        throw new Error("Authentication failed: No account provided.");
      }

      // ✅ Use `findFirst()` with `AND` condition to find existing OAuth accounts
      const existingAccount = await prisma.account.findFirst({
        where: {
          AND: [
            { provider: account.provider },
            { providerAccountId: account.providerAccountId },
          ],
        },
      });

      if (!existingAccount) {
        // ✅ If account does not exist, create a new one
        await prisma.account.create({
          data: {
            userId: dbUser.id,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            access_token: account.access_token ?? null,
            refresh_token: account.refresh_token ?? null,
            expires_at: account.expires_at ?? null,
          },
        });
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET as string,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
