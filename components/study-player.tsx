"use client";

import { useEffect, useState } from "react";
import { tickLessonAction } from "@/lib/actions/learn";

export function StudyPlayer({
  lessonId,
  durationMin,
  initialWatched,
  initialDone,
  videoRef,
}: {
  lessonId: number;
  durationMin: number;
  initialWatched: number;
  initialDone: boolean;
  videoRef: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [watched, setWatched] = useState(initialWatched);
  const [done, setDone] = useState(initialDone);
  const cap = durationMin * 60;
  const ratio = Math.min(100, Math.round((watched / cap) * 100));

  useEffect(() => {
    if (!playing || done) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      void tickLessonAction(lessonId).then((result) => {
        setWatched((value) => Math.min(cap, value + 10));
        if (result?.completed) setDone(true);
      });
    }, 10000);
    return () => clearInterval(id);
  }, [playing, done, lessonId, cap]);

  return (
    <div className="overflow-hidden rounded-[28px] border border-gold/20 bg-black">
      {videoRef ? (
        <iframe className="aspect-video w-full" src={videoRef} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title="Lección" />
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,rgba(198,161,91,0.16),transparent_60%)]">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">Reproductor protegido</p>
          <button className="btn-gold" type="button" onClick={() => setPlaying((value) => !value)}>
            {done ? "Lección registrada" : playing ? "Pausar estudio" : "Reproducir"}
          </button>
          <p className="max-w-sm text-center text-sm text-mute">El enlace del archivo no se publica. La visualización queda en tu perfil.</p>
        </div>
      )}
      <div className="space-y-2 p-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-gold" style={{ width: `${ratio}%` }} />
        </div>
        <p className="font-mono text-xs text-mute">
          {done ? "Visualización completa" : `${ratio}% del tiempo mínimo`} · {durationMin} min
        </p>
      </div>
    </div>
  );
}
