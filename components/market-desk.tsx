"use client";

import { motion, useReducedMotion } from "motion/react";

const series = [
  { o: 42, h: 56, l: 38, c: 53 },
  { o: 53, h: 58, l: 47, c: 49 },
  { o: 49, h: 66, l: 48, c: 63 },
  { o: 63, h: 68, l: 55, c: 57 },
  { o: 57, h: 74, l: 56, c: 72 },
  { o: 72, h: 76, l: 64, c: 66 },
  { o: 66, h: 81, l: 65, c: 79 },
  { o: 79, h: 83, l: 70, c: 73 },
  { o: 73, h: 90, l: 72, c: 88 },
  { o: 88, h: 91, l: 78, c: 80 },
  { o: 80, h: 96, l: 79, c: 94 },
  { o: 94, h: 99, l: 86, c: 97 },
];

const W = 720;
const H = 280;

export function MarketDesk({
  entry,
  monthly,
  live,
  review,
}: {
  entry: string;
  monthly: string;
  live: string;
  review: string;
}) {
  const reduce = useReducedMotion();
  const low = Math.min(...series.map((candle) => candle.l)) - 6;
  const high = Math.max(...series.map((candle) => candle.h)) + 6;
  const y = (value: number) => 18 + ((high - value) / (high - low)) * (H - 36);
  const slot = (W - 28) / series.length;
  const line = series
    .map((candle, index) => {
      const x = 14 + index * slot + slot / 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y(candle.c).toFixed(1)}`;
    })
    .join(" ");
  const last = series[series.length - 1];
  const lastX = 14 + (series.length - 1) * slot + slot / 2;
  const lastY = y(last.c);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-mute">BB-RUTA</p>
          <p className="mt-1 text-sm text-cream">Estructura de la formación</p>
        </div>
        <p className="font-mono text-sm text-good">▲ alcista</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-64 w-full" role="img" aria-label="Gráfico ilustrativo de velas">
        <defs>
          <filter id="candle-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[0.25, 0.5, 0.75].map((row) => (
          <line key={row} x1="0" x2={W} y1={H * row} y2={H * row} stroke="rgba(255,255,255,0.06)" />
        ))}
        {series.map((candle, index) => {
          const up = candle.c >= candle.o;
          const color = up ? "#3ddc97" : "#ff5d5d";
          const x = 14 + index * slot + slot / 2;
          const top = y(Math.max(candle.o, candle.c));
          const body = Math.max(2.5, Math.abs(y(candle.o) - y(candle.c)));
          return (
            <g key={index}>
              <motion.line
                x1={x}
                x2={x}
                y1={y(candle.h)}
                y2={y(candle.l)}
                stroke={color}
                strokeWidth="1.25"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              />
              <motion.rect
                x={x - slot * 0.18}
                width={slot * 0.36}
                rx="1"
                fill={color}
                initial={reduce ? { y: top, height: body } : { y: y(candle.l), height: 0 }}
                animate={{ y: top, height: body }}
                transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </g>
          );
        })}
        <motion.path
          d={line}
          fill="none"
          stroke="#f4f4f5"
          strokeWidth="1.5"
          filter="url(#candle-glow)"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <circle cx={lastX} cy={lastY} r="3.5" fill="#3ddc97" />
        <circle cx={lastX} cy={lastY} r="8" fill="#3ddc97" opacity="0.25" />
      </svg>
      <p className="px-5 pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Ilustración de estructura · no es una cotización</p>
      <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        <Stat k="Aparta" v={entry} />
        <Stat k="30 días" v={monthly} />
        <Stat k="Mesa" v={live} />
        <Stat k="Domingo" v={review} />
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-black px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{k}</p>
      <p className="mt-1 font-mono text-sm text-cream">{v}</p>
    </div>
  );
}
