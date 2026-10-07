"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function OfferClock({ target }: { target: string }) {
  const router = useRouter();
  const [label, setLabel] = useState("Calculando el cierre");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const end = new Date(target).getTime();
    let refreshed = false;
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setDone(true);
        setLabel("La oferta ya cerró");
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
      const dayLabel = days === 1 ? "1 día" : `${days} días`;
      setLabel(`${dayLabel}, ${hours} h ${minutes} min ${seconds} s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, router]);

  return (
    <p className="text-sm text-[#d5e5dc]">
      <span className="font-semibold text-white">{done ? "Oferta cerrada" : "Cierra en"}</span>
      {" · "}
      {label}
    </p>
  );
}
