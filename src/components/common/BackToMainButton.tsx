// src/components/common/BackToMainButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function BackToMainButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      className="
        fixed z-50
        bottom-6 right-6
        md:bottom-10 md:right-10
        rounded-full border bg-white
        px-5 py-3 text-sm font-semibold
        shadow-md hover:bg-gray-50"
    >
      ← 메인으로
    </button>
  );
}