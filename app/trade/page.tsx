'use client'

import { useState } from "react";
import Header from "@/components/Header";

export default function Trade() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen w-full bg-[#0B0E14] text-[#ECEEF3]">
      <Header query={query} setQuery={setQuery} />
      <h1>Trade</h1>
      <p className="text-center">coming soon</p>
    </div>
  );
}