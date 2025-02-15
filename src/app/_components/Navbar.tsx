"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar({ session }: { session: unknown }) {
  return (
    <nav className="bg-zinc-900 p-4 flex justify-between">
      <Link href="/" className="text-white text-lg font-bold">ROLLY</Link>
      {session ? (
        <div className="flex gap-4 items-center">
          <p className="text-white">{session.user?.name}</p>
          <Button onClick={() => signOut()} className="bg-red-500">
            Logout
          </Button>
        </div>
      ) : (
        <Link href="/login">
          <Button className="bg-green-500">Login</Button>
        </Link>
      )}
    </nav>
  );
}
