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
  const [playing, setPlaying] = useState(Boolean(videoRef) && !initialDone);
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
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-desk">
      {videoRef ? (
        <iframe className="aspect-video w-full" src={videoRef} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title="Lección" />
      ) : (
        <div className="relative flex aspect-video flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_center,rgba(212,176,106,0.18),transparent_62%)]">
          <p className="eyebrow">Aula protegida</p>
          <button className="btn-gold px-8 py-3 text-base" type="button" onClick={() => setPlaying((value) => !value)}>
            {done ? "Lección registrada" : playing ? "Pausar estudio" : "Reproducir lección"}
          </button>
          <p className="max-w-sm text-center text-sm text-mute">El archivo no se publica como enlace. El tiempo de visualización queda en tu perfil.</p>
        </div>
      )}
      <div className="space-y-2 p-5">
        <div className="progress-bar">
          <span style={{ width: `${ratio}%` }} />
        </div>
        <p className="font-mono text-xs text-mute">
          {done ? "Visualización completa · examen del nivel puede habilitarse" : `${ratio}% del tiempo mínimo`} · {durationMin} min
        </p>
      </div>
    </div>
  );
}
