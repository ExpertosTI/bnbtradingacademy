"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function OfferClock({ target }: { target: string }) {
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
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">{done ? "Oferta cerrada" : "Cierra en"}</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {["Días", "Horas", "Min", "Seg"].map((label, index) => (
          <div key={label} className="border border-white/10 bg-black px-2 py-3 text-center">
            <p className="font-mono text-2xl text-cream sm:text-3xl">{parts[index]}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mute">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
