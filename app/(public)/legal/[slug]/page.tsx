const pages: Record<string, { title: string; body: string[] }> = {
  terminos: {
    title: "Términos",
    body: [
      "B&B Trading Academy ofrece formación. La cuenta es personal y el acceso depende del nivel aprobado y del estado de la membresía.",
      "El alumno es responsable de la veracidad de sus datos y de la experiencia que declara al registrarse.",
      "Los contenidos, exámenes, horarios y precios pueden actualizarse desde la administración.",
    ],
  },
  privacidad: {
    title: "Privacidad",
    body: [
      "Guardamos nombre, correo, progreso, resultados, mensajes y el historial de pagos necesario para operar la academia.",
      "No vendemos esa información. El equipo docente ve el avance académico de los alumnos.",
      "Puedes pedir la corrección de tus datos de perfil desde la cuenta.",
    ],
  },
  reembolsos: {
    title: "Cancelación y reembolso",
    body: [
      "Puedes cancelar la renovación desde Pagos. El acceso premium del periodo ya pagado se mantiene hasta su fecha de cierre.",
      "Un reembolso, si la academia lo concede, lo registra administración sobre la transacción. Cancelar no borra exámenes ni progreso.",
    ],
  },
  riesgo: {
    title: "Aviso de riesgo",
    body: [
      "Operar en los mercados implica riesgo de pérdida. Esta plataforma es educativa.",
      "Nada de lo publicado —lecciones, mesa en vivo, ranking o premios— es una recomendación personalizada ni una garantía de ganancia, fondeo o resultado.",
      "Un premio lo confirma una persona de administración. No se otorga solo por aparecer en el top.",
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: pages[slug]?.title || "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return <p className="px-5">Página no encontrada.</p>;
  return (
    <article className="relative z-10 mx-auto max-w-3xl px-5">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 font-serif text-5xl">{page.title}</h1>
      <div className="mt-8 space-y-4 text-lg text-mute">
        {page.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
