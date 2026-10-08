"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const labels = ["Días", "Horas", "Min", "Seg"];

export function OfferClock({ target, light = false }: { target: string; light?: boolean }) {
  const router = useRouter();
  const [parts, setParts] = useState(["00", "00", "00", "00"]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const end = new Date(target).getTime();
    let refreshed = false;
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setParts(["00", "00", "00", "00"]);
        setDone(true);
        if (!refreshed) {
          refreshed = true;
          router.refresh();
        }
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setParts([days, hours, minutes, seconds].map((n) => String(n).padStart(2, "0")));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, router]);

  return (
    <div>
      <p className={`text-xs uppercase tracking-[0.22em] ${light ? "text-white/60" : "text-gold"}`}>{done ? "Oferta cerrada" : "La oferta cierra en"}</p>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {labels.map((label, index) => (
          <div key={label} className="text-center">
            <p className={`font-serif text-5xl leading-none sm:text-6xl ${light ? "text-white" : "text-gold2"}`}>{parts[index]}</p>
            <p className={`mt-2 text-[11px] uppercase tracking-[0.16em] ${light ? "text-white/50" : "text-mute"}`}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
