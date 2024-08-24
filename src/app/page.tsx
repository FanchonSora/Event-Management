"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function App() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    router.push("/auth");
  } else {
    router.push("/home");
  }
}
