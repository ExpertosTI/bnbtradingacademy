"use client";

import { useEffect, useRef, useState } from "react";
import { gradeExamAction } from "@/lib/actions/learn";

type Option = { id: number; label: string };
type Question = { id: number; prompt: string; points: number; options: Option[] };

export function ExamRunner({
  attemptId,
  title,
  secondsLeft,
  questions,
}: {
  attemptId: number;
  title: string;
  secondsLeft: number;
  questions: Question[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [left, setLeft] = useState(secondsLeft);

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          formRef.current?.requestSubmit();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const minutes = String(Math.floor(left / 60)).padStart(2, "0");
  const seconds = String(left % 60).padStart(2, "0");

  return (
    <form ref={formRef} action={gradeExamAction} className="space-y-5">
      <input type="hidden" name="attempt_id" value={attemptId} />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Examen en curso</p>
          <h1 className="mt-2 font-serif text-4xl">{title}</h1>
        </div>
        <p className="font-mono text-3xl text-gold">{minutes}:{seconds}</p>
      </div>
      {questions.map((question, index) => (
        <fieldset key={question.id} className="card">
          <legend className="font-medium text-cream">
            {index + 1}. {question.prompt}
          </legend>
          <p className="mb-3 font-mono text-xs text-mute">{question.points} puntos</p>
          <div className="space-y-2">
            {question.options.map((option) => (
              <label key={option.id} className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 px-3 py-2 hover:border-gold/40">
                <input type="radio" name={`q-${question.id}`} value={option.id} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button className="btn-gold" type="submit">
        Entregar examen
      </button>
    </form>
  );
}
