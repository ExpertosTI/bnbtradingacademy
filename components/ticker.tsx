const items = ["Nivel 1", "Examen", "Nivel 2", "Nivel 3", "Mesa de lunes a viernes", "Repaso del domingo"];

export function Ticker() {
  return (
    <p className="border-y border-gold/20 py-4 text-center text-sm tracking-wide text-mute">
      {items.join("   ·   ")}
    </p>
  );
}
