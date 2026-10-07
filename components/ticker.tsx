const items = ["Nivel 1", "Examen", "Nivel 2", "Nivel 3", "Mesa de lunes a viernes", "Repaso del domingo"];

export function Ticker() {
  return (
    <p className="mx-auto max-w-6xl px-5 py-6 text-sm text-mute">
      {items.join("  ·  ")}
    </p>
  );
}
