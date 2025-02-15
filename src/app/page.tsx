import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navbar from "./_components/Navbar";

export default async function Home() {
  const session = await getServerSession(authOptions); // ✅ Fetch session on the server

  if (!session) {
    redirect("/login"); // ✅ Redirect if the user is not logged in
  }

  return (
    <div>
      <Navbar session={session} /> {/* ✅ Pass session as a prop */}
      <h1>Welcome, {session.user?.name}</h1>
    </div>
  );
}
