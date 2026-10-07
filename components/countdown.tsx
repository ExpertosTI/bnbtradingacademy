"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Countdown({ target, label }: { target: string; label: string }) {
  const router = useRouter();
  const [text, setText] = useState("—");

  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setText("00:00:00");
        router.refresh();
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setText([hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":"));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, router]);

  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-mono text-4xl text-gold2">{text}</p>
    </div>
  );
}
