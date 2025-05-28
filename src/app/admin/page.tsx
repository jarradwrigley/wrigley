"use client"

// export default async function ExtraPage() {

//     return <h1 className="text-5xl">Admin Page!</h1>

// }

// pages/admin/index.tsx or app/admin/page.tsx
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    if (session.user.role !== 'admin') {
      router.push('/denied');
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
    </div>
  );
}