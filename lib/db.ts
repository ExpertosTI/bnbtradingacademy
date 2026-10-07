import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword, newToken, sha256 } from "./crypto";
import { startOfIsoWeek } from "./format";

export type Role = "admin" | "teacher" | "student";
export type Experience = "beginner" | "intermediate" | "advanced";

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  experience: Experience | null;
  bio: string;
  avatar: string;
  muted_until: string | null;
  suspended: number;
  terms_accepted_at: string | null;
  created_at: string;
};

export type Settings = {
  academy_name: string;
  entry_price_cents: number;
  monthly_price_cents: number;
  currency: string;
  timezone: string;
  live_start: string;
  live_end: string;
  live_days: string;
  live_stream_url: string;
  review_start: string;
  review_end: string;
  review_stream_url: string;
  min_watch_ratio: number;
  expire_locks: string;
};

export type Level = {
  id: number;
  code: string;
  name: string;
  summary: string;
  sort_order: number;
  practical: number;
};

export type Lesson = {
  id: number;
  level_id: number;
  title: string;
  summary: string;
  duration_min: number;
  sort_order: number;
  video_ref: string;
};

export type Progress = {
  user_id: number;
  lesson_id: number;
  watched_seconds: number;
  completed: number;
  completed_at: string | null;
};

export type Exam = {
  id: number;
  level_id: number | null;
  code: string;
  title: string;
  min_score: number;
  cooldown_hours: number;
  time_limit_min: number;
  price_cents: number;
};

export type Question = {
  id: number;
  exam_id: number;
  prompt: string;
  kind: "mc" | "tf";
  points: number;
  sort_order: number;
};

export type Option = {
  id: number;
  question_id: number;
  label: string;
  is_correct: number;
  sort_order: number;
};

export type Attempt = {
  id: number;
  user_id: number;
  exam_id: number;
  status: "in_progress" | "graded";
  score: number;
  max_score: number;
  percent: number;
  passed: number;
  started_at: string;
  finished_at: string | null;
  duration_sec: number;
};

export type Membership = {
  user_id: number;
  status: "active" | "expired" | "cancelled" | "pending";
  amount_cents: number;
  currency: string;
  started_at: string | null;
  current_period_end: string | null;
  next_charge_at: string | null;
  cancelled_at: string | null;
};

export type Transaction = {
  id: number;
  user_id: number;
  product_key: string;
  description: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  created_at: string;
};

export type Channel = {
  id: number;
  slug: string;
  name: string;
  description: string;
  min_level: number;
  staff_only_post: number;
  requires_practical: number;
};

export type Message = {
  id: number;
  channel_id: number;
  user_id: number;
  body: string;
  created_at: string;
  deleted: number;
  name?: string;
  role?: Role;
  experience?: Experience | null;
};

export type Broadcast = {
  id: number;
  kind: "live" | "review";
  title: string;
  starts_at: string;
  ends_at: string;
  stream_url: string;
  recording_url: string;
  published: number;
};

const defaults: Settings = {
  academy_name: "B&B Trading Academy",
  entry_price_cents: 2500,
  monthly_price_cents: 5000,
  currency: "USD",
  timezone: "America/Santo_Domingo",
  live_start: "09:00",
  live_end: "10:30",
  live_days: "1,2,3,4,5",
  live_stream_url: "",
  review_start: "19:00",
  review_end: "20:30",
  review_stream_url: "",
  min_watch_ratio: 0.8,
  expire_locks: "premium",
};

const globalForDb = globalThis as unknown as { bbDb?: DatabaseSync };

function database() {
  if (!globalForDb.bbDb) {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    const file = new DatabaseSync(path.join(dir, "academy.db"));
    file.exec("PRAGMA foreign_keys = ON");
    file.exec("PRAGMA busy_timeout = 3000");
    migrate(file);
    ensureReferenceColumn(file);
    seed(file);
    globalForDb.bbDb = file;
  }
  return globalForDb.bbDb;
}

function all<T>(sql: string, ...params: Array<string | number | null>) {
  return database().prepare(sql).all(...params) as T[];
}

function get<T>(sql: string, ...params: Array<string | number | null>) {
  return database().prepare(sql).get(...params) as T | undefined;
}

function run(sql: string, ...params: Array<string | number | null>) {
  return database().prepare(sql).run(...params);
}

function ensureReferenceColumn(file: DatabaseSync) {
  const cols = file.prepare("PRAGMA table_info(transactions)").all() as Array<{ name: string }>;
  if (!cols.some((col) => col.name === "reference")) {
    file.exec("ALTER TABLE transactions ADD COLUMN reference TEXT");
  }
  file.exec("CREATE UNIQUE INDEX IF NOT EXISTS transactions_reference_idx ON transactions(reference) WHERE reference IS NOT NULL");
}

function migrate(file: DatabaseSync) {
  file.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),
      experience TEXT CHECK(experience IN ('beginner','intermediate','advanced')),
      bio TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT '',
      muted_until TEXT,
      suspended INTEGER NOT NULL DEFAULT 0,
      terms_accepted_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      summary TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      practical INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      duration_min INTEGER NOT NULL,
      sort_order INTEGER NOT NULL,
      video_ref TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS lesson_progress (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      watched_seconds INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      PRIMARY KEY (user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level_id INTEGER REFERENCES levels(id) ON DELETE SET NULL,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      min_score INTEGER NOT NULL,
      cooldown_hours INTEGER NOT NULL DEFAULT 0,
      time_limit_min INTEGER NOT NULL,
      price_cents INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
      prompt TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('mc','tf')),
      points INTEGER NOT NULL,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK(status IN ('in_progress','graded')),
      score INTEGER NOT NULL DEFAULT 0,
      max_score INTEGER NOT NULL DEFAULT 0,
      percent REAL NOT NULL DEFAULT 0,
      passed INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      duration_sec INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS attempt_answers (
      attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      option_id INTEGER,
      correct INTEGER NOT NULL,
      points_earned INTEGER NOT NULL,
      PRIMARY KEY (attempt_id, question_id)
    );
    CREATE TABLE IF NOT EXISTS memberships (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK(status IN ('active','expired','cancelled','pending')),
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL,
      started_at TEXT,
      current_period_end TEXT,
      next_charge_at TEXT,
      cancelled_at TEXT
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_key TEXT NOT NULL,
      description TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending','paid','failed')),
      created_at TEXT NOT NULL,
      reference TEXT
    );
    CREATE TABLE IF NOT EXISTS broadcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL CHECK(kind IN ('live','review')),
      title TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      stream_url TEXT NOT NULL DEFAULT '',
      recording_url TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      min_level INTEGER NOT NULL DEFAULT 1,
      staff_only_post INTEGER NOT NULL DEFAULT 0,
      requires_practical INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      kind TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS prizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_key TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      confirmed_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      label TEXT NOT NULL,
      awarded_at TEXT NOT NULL,
      UNIQUE(user_id, code)
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      sent INTEGER NOT NULL DEFAULT 0
    );
  `);
}

function insertUser(file: DatabaseSync, email: string, password: string, name: string, role: Role, experience: Experience | null, bio = "") {
  const now = new Date().toISOString();
  const result = file.prepare(
    `INSERT INTO users (email, password_hash, name, role, experience, bio, terms_accepted_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(email, hashPassword(password), name, role, experience, bio, now, now);
  return Number(result.lastInsertRowid);
}

function insertQuestion(file: DatabaseSync, examId: number, sort: number, prompt: string, kind: "mc" | "tf", points: number, choices: Array<{ label: string; correct?: boolean }>) {
  const q = file.prepare(
    `INSERT INTO questions (exam_id, prompt, kind, points, sort_order) VALUES (?, ?, ?, ?, ?)`,
  ).run(examId, prompt, kind, points, sort);
  const qid = Number(q.lastInsertRowid);
  choices.forEach((choice, index) => {
    file.prepare(`INSERT INTO options (question_id, label, is_correct, sort_order) VALUES (?, ?, ?, ?)`).run(
      qid,
      choice.label,
      choice.correct ? 1 : 0,
      index + 1,
    );
  });
}

function seed(file: DatabaseSync) {
  const count = file.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number };
  if (count.c > 0) return;
  const now = new Date();
  const iso = now.toISOString();
  const plus30 = new Date(now.getTime() + 30 * 86400000).toISOString();

  const settings: Record<string, string> = {
    academy_name: defaults.academy_name,
    entry_price_cents: String(defaults.entry_price_cents),
    monthly_price_cents: String(defaults.monthly_price_cents),
    currency: defaults.currency,
    timezone: defaults.timezone,
    live_start: defaults.live_start,
    live_end: defaults.live_end,
    live_days: defaults.live_days,
    live_stream_url: "",
    review_start: defaults.review_start,
    review_end: defaults.review_end,
    review_stream_url: "",
    min_watch_ratio: String(defaults.min_watch_ratio),
    expire_locks: defaults.expire_locks,
  };
  const setStmt = file.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(settings)) setStmt.run(key, value);

  insertUser(file, "admin@bbtrading.academy", "BbAdmin2026!", "Administración", "admin", null, "Operación de la academia.");
  const analisis = insertUser(file, "analisis@bbtrading.academy", "BbProfe2026!", "Profesor de análisis", "teacher", null, "Contexto, estructura y revisión de escenarios.");
  const ejecucion = insertUser(file, "ejecucion@bbtrading.academy", "BbProfe2026!", "Profesor de ejecución", "teacher", null, "Ejecución, gestión y registro de operaciones.");
  insertUser(file, "entrenamiento@bbtrading.academy", "BbProfe2026!", "Profesor de entrenamiento", "teacher", null, "Práctica guiada y sesiones uno a uno.");
  const alumno = insertUser(file, "alumno@bbtrading.academy", "BbAlumno2026!", "Alumno demo", "student", "intermediate", "Cuenta de recorrido para revisar la academia.");

  const level = file.prepare(`INSERT INTO levels (code, name, summary, sort_order, practical) VALUES (?, ?, ?, ?, ?)`);
  const l1 = Number(level.run("nivel-1", "Nivel 1 · Fundamentos", "Tres lecciones obligatorias de criterio, riesgo y plan. El examen se habilita al completarlas.", 1, 0).lastInsertRowid);
  const l2 = Number(level.run("nivel-2", "Nivel 2 · Intermedio", "Análisis y ejecución. El examen desbloquea el nivel intensivo.", 2, 0).lastInsertRowid);
  const l3 = Number(level.run("nivel-3", "Nivel 3 · Intensivo", "Lección final y evaluación. Aprobar abre la etapa práctica si la membresía está activa.", 3, 0).lastInsertRowid);
  level.run("etapa-4", "Etapa práctica", "Mesa en vivo de lunes a viernes, repaso del domingo y espacios de miembros habilitados.", 4, 1);

  const lesson = file.prepare(
    `INSERT INTO lessons (level_id, title, summary, duration_min, sort_order, video_ref) VALUES (?, ?, ?, ?, ?, '')`,
  );
  const lessons = [
    [l1, "El mercado y el plan escrito", "Qué se estudia, qué no se promete y cómo queda registrado un plan antes de operar.", 2, 1],
    [l1, "Riesgo y tamaño de posición", "Definir la pérdida aceptada y el tamaño antes de pensar en el resultado.", 2, 2],
    [l1, "Registro y conducta", "Qué anotar después de cada operación de estudio y cómo no romper el plan.", 2, 3],
    [l2, "Lectura de estructura", "Contexto y escenarios. El análisis ordena el trabajo; no asegura la dirección.", 2, 1],
    [l2, "Ejecución y gestión", "Entrada, invalidación y salida según reglas definidas antes de la sesión.", 2, 2],
    [l3, "Intensivo de criterio", "Repetición del proceso completo antes de la mesa en vivo.", 2, 1],
  ] as const;
  const lessonIds: number[] = [];
  for (const row of lessons) lessonIds.push(Number(lesson.run(...row).lastInsertRowid));

  const exam = file.prepare(
    `INSERT INTO exams (level_id, code, title, min_score, cooldown_hours, time_limit_min, price_cents) VALUES (?, ?, ?, ?, ?, ?, 0)`,
  );
  const e1 = Number(exam.run(l1, "nivel-1", "Examen de Nivel 1", 70, 0, 20).lastInsertRowid);
  const e2 = Number(exam.run(l2, "nivel-2", "Examen de Nivel 2", 70, 0, 20).lastInsertRowid);
  const e3 = Number(exam.run(l3, "nivel-3", "Evaluación final", 70, 0, 25).lastInsertRowid);
  const e4 = Number(exam.run(null, "validacion-avanzada", "Validación avanzada", 80, 0, 30).lastInsertRowid);

  const bank: Array<[number, string, "mc" | "tf", Array<{ label: string; correct?: boolean }>]> = [
    [e1, "Antes de abrir una operación de estudio, ¿qué debe estar definido?", "mc", [
      { label: "El tamaño de la posición y el punto donde la idea queda invalidada", correct: true },
      { label: "Solo la ganancia que se espera" },
      { label: "La opinión de un grupo de chat" },
      { label: "El resultado de la semana pasada" },
    ]],
    [e1, "Si el precio alcanza el stop, la conducta alineada con un plan es:", "mc", [
      { label: "Cerrar según la regla y registrar el resultado", correct: true },
      { label: "Mover el stop para no tomar la pérdida" },
      { label: "Duplicar el tamaño para recuperar" },
      { label: "Ignorar el plan porque el mercado se ve distinto" },
    ]],
    [e1, "¿Qué describe mejor el riesgo por operación?", "mc", [
      { label: "La cantidad que se acepta perder si la idea falla", correct: true },
      { label: "La ganancia mínima garantizada" },
      { label: "El apalancamiento máximo del bróker" },
      { label: "El premio de la academia" },
    ]],
    [e1, "Un examen aprobado en la academia garantiza ganancias en una cuenta real.", "tf", [
      { label: "Falso", correct: true },
      { label: "Verdadero" },
    ]],
    [e1, "El avance de nivel ocurre cuando:", "mc", [
      { label: "Se cumple el requisito del nivel y se aprueba su examen", correct: true },
      { label: "El alumno elige Avanzado en el registro" },
      { label: "Alguien envía un enlace por fuera de la plataforma" },
      { label: "Se paga la inscripción, sin evaluación" },
    ]],
    [e2, "Un análisis de estructura sirve para:", "mc", [
      { label: "Ubicar contexto y escenarios, sin prometer un resultado", correct: true },
      { label: "Asegurar la dirección del mercado" },
      { label: "Reemplazar el control de riesgo" },
      { label: "Evitar el registro de operaciones" },
    ]],
    [e2, "Ejecutar con regla implica:", "mc", [
      { label: "Entrar, gestionar y salir según criterios definidos antes", correct: true },
      { label: "Seguir otra operación en vivo sin plan propio" },
      { label: "Aumentar el tamaño después de una pérdida" },
      { label: "Operar solo cuando hay prisa" },
    ]],
    [e2, "¿Qué dato debe quedar en el registro de una operación de estudio?", "mc", [
      { label: "Contexto, entrada, invalidación y resultado", correct: true },
      { label: "Solo la captura si hubo ganancia" },
      { label: "Una promesa de fondeo" },
      { label: "El ranking de otros alumnos" },
    ]],
    [e2, "Una racha de pérdidas dentro del plan indica que:", "mc", [
      { label: "Hay que revisar el proceso sin romper el riesgo por operación", correct: true },
      { label: "Hay que recuperar el dinero en la siguiente entrada" },
      { label: "El examen de la academia estaba mal" },
      { label: "El mercado está obligado a revertir" },
    ]],
    [e2, "Copiar una operación en vivo de la mesa sustituye el criterio del alumno.", "tf", [
      { label: "Falso", correct: true },
      { label: "Verdadero" },
    ]],
    [e3, "La etapa práctica se habilita cuando:", "mc", [
      { label: "Se aprueba la evaluación definida y la membresía está activa", correct: true },
      { label: "Se mira un solo video" },
      { label: "Se pide acceso por el chat" },
      { label: "Se aparece en el ranking" },
    ]],
    [e3, "En el intensivo, la prioridad es:", "mc", [
      { label: "Criterio, riesgo y repetición del proceso", correct: true },
      { label: "Aumentar el lote para aprovechar" },
      { label: "Operar todas las velas" },
      { label: "Buscar un premio garantizado" },
    ]],
    [e3, "Un premio anunciado por la academia:", "mc", [
      { label: "Lo confirma un administrador y no promete rendimiento", correct: true },
      { label: "Se acredita solo por estar en el top" },
      { label: "Equivale a una ganancia futura" },
      { label: "Reemplaza la mensualidad" },
    ]],
    [e3, "Antes de una sesión en vivo, el alumno debe:", "mc", [
      { label: "Conocer su riesgo máximo y las condiciones en las que no opera", correct: true },
      { label: "Entrar a todas las ideas que aparezcan" },
      { label: "Dejar el plan escrito a un lado" },
      { label: "Operar sin stop porque es en vivo" },
    ]],
    [e3, "El horario de la mesa puede cambiarse desde la administración, sin editar código.", "tf", [
      { label: "Verdadero", correct: true },
      { label: "Falso" },
    ]],
    [e4, "Declararte avanzado en el registro:", "mc", [
      { label: "No desbloquea la etapa práctica por sí solo", correct: true },
      { label: "Omite exámenes y pagos" },
      { label: "Activa el live de inmediato" },
      { label: "Aprueba el nivel 3 automáticamente" },
    ]],
    [e4, "La validación avanzada existe para:", "mc", [
      { label: "Comprobar criterio antes de la etapa práctica", correct: true },
      { label: "Entregar una cuenta fondeada" },
      { label: "Garantizar un porcentaje mensual" },
      { label: "Saltarse la gestión de riesgo" },
    ]],
    [e4, "En una cuenta de estudio, el tamaño de posición debe:", "mc", [
      { label: "Caber en el riesgo definido aunque la idea parezca clara", correct: true },
      { label: "Ser el máximo del bróker si hay convicción" },
      { label: "Depender del ranking semanal" },
      { label: "Copiar el lote de la mesa" },
    ]],
    [e4, "Si la membresía vence, la plataforma debe:", "mc", [
      { label: "Suspender los accesos premium según la regla configurada", correct: true },
      { label: "Mantener el live y ocultar solo el botón" },
      { label: "Borrar el progreso" },
      { label: "Aprobar los exámenes pendientes" },
    ]],
    [e4, "Un resultado pasado de la mesa es una garantía del resultado del alumno.", "tf", [
      { label: "Falso", correct: true },
      { label: "Verdadero" },
    ]],
  ];
  bank.forEach((item, index) => insertQuestion(file, item[0], (index % 5) + 1, item[1], item[2], 20, item[3]));

  for (const lessonId of lessonIds.slice(0, 3)) {
    file.prepare(
      `INSERT INTO lesson_progress (user_id, lesson_id, watched_seconds, completed, completed_at) VALUES (?, ?, 120, 1, ?)`,
    ).run(alumno, lessonId, iso);
  }
  file.prepare(
    `INSERT INTO attempts (user_id, exam_id, status, score, max_score, percent, passed, started_at, finished_at, duration_sec)
     VALUES (?, ?, 'graded', 80, 100, 80, 1, ?, ?, 640)`,
  ).run(alumno, e1, iso, iso);
  file.prepare(
    `INSERT INTO memberships (user_id, status, amount_cents, currency, started_at, current_period_end, next_charge_at)
     VALUES (?, 'active', 5000, 'USD', ?, ?, ?)`,
  ).run(alumno, iso, plus30, plus30);
  const tx = file.prepare(
    `INSERT INTO transactions (user_id, product_key, description, amount_cents, currency, status, created_at) VALUES (?, ?, ?, ?, 'USD', 'paid', ?)`,
  );
  tx.run(alumno, "entry", "Inscripción", 2500, iso);
  tx.run(alumno, "monthly", "Membresía mensual", 5000, iso);
  file.prepare(`INSERT INTO badges (user_id, code, label, awarded_at) VALUES (?, 'nivel-1', 'Nivel 1 aprobado', ?)`).run(alumno, iso);
  file.prepare(
    `INSERT INTO notifications (user_id, title, body, kind, created_at) VALUES (?, ?, ?, 'welcome', ?)`,
  ).run(alumno, "Bienvenida a la academia", "Tu inscripción y el primer mes quedaron activos. Sigues en el Nivel 2.", iso);

  const channel = file.prepare(
    `INSERT INTO channels (slug, name, description, min_level, staff_only_post, requires_practical) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const general = Number(channel.run("general", "Comunidad", "Conversación de toda la academia.", 1, 0, 0).lastInsertRowid);
  channel.run("principiante", "Principiante", "Sala del Nivel 1.", 1, 0, 0);
  channel.run("intermedio", "Intermedio", "Sala desde el Nivel 2.", 2, 0, 0);
  channel.run("premium", "Avanzado y práctica", "Sala de quienes ya habilitaron la etapa práctica.", 4, 0, 1);
  channel.run("anuncios", "Anuncios", "Solo profesores y administración publican aquí.", 1, 1, 0);

  file.prepare(`INSERT INTO messages (channel_id, user_id, body, created_at) VALUES (?, ?, ?, ?)`).run(
    general,
    analisis,
    "La mesa de lunes a viernes se abre desde Trading en vivo. No hace falta pedir el enlace por fuera.",
    iso,
  );
  file.prepare(`INSERT INTO messages (channel_id, user_id, body, created_at) VALUES (?, ?, ?, ?)`).run(
    general,
    ejecucion,
    "El domingo revisamos las operaciones de la semana y el tablero de exámenes. El premio, si lo hay, lo confirma administración.",
    iso,
  );

  file.prepare(
    `INSERT INTO audit_log (actor_id, action, detail, created_at) VALUES (NULL, 'seed', 'Academia inicial lista', ?)`,
  ).run(iso);
}

export function getSettings(): Settings {
  const rows = all<{ key: string; value: string }>("SELECT key, value FROM settings");
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    academy_name: map.academy_name || defaults.academy_name,
    entry_price_cents: Number(map.entry_price_cents ?? defaults.entry_price_cents),
    monthly_price_cents: Number(map.monthly_price_cents ?? defaults.monthly_price_cents),
    currency: map.currency || defaults.currency,
    timezone: map.timezone || defaults.timezone,
    live_start: map.live_start || defaults.live_start,
    live_end: map.live_end || defaults.live_end,
    live_days: map.live_days || defaults.live_days,
    live_stream_url: map.live_stream_url || "",
    review_start: map.review_start || defaults.review_start,
    review_end: map.review_end || defaults.review_end,
    review_stream_url: map.review_stream_url || "",
    min_watch_ratio: Number(map.min_watch_ratio ?? defaults.min_watch_ratio),
    expire_locks: map.expire_locks || defaults.expire_locks,
  };
}

export function updateSettings(values: Record<string, string>) {
  const stmt = database().prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  );
  for (const [key, value] of Object.entries(values)) stmt.run(key, value);
}

const userColumns = `id, email, name, role, experience, bio, avatar, muted_until, suspended, terms_accepted_at, created_at`;

export function createUser(input: { email: string; password: string; name: string; experience: Experience }) {
  const now = new Date().toISOString();
  const result = run(
    `INSERT INTO users (email, password_hash, name, role, experience, terms_accepted_at, created_at)
     VALUES (?, ?, ?, 'student', ?, ?, ?)`,
    input.email.toLowerCase().trim(),
    hashPassword(input.password),
    input.name.trim(),
    input.experience,
    now,
    now,
  );
  return Number(result.lastInsertRowid);
}

export function findUserByEmail(email: string) {
  return get<User>(`SELECT ${userColumns} FROM users WHERE email = ?`, email.toLowerCase().trim());
}

export function findUserAuth(email: string) {
  return get<User & { password_hash: string }>(
    `SELECT ${userColumns}, password_hash FROM users WHERE email = ?`,
    email.toLowerCase().trim(),
  );
}

export function getUser(id: number) {
  return get<User>(`SELECT ${userColumns} FROM users WHERE id = ?`, id);
}

export function listTeachers() {
  return all<User>(`SELECT ${userColumns} FROM users WHERE role = 'teacher' ORDER BY id`);
}

export function listStudents() {
  return all<User & { membership_status: string | null; amount_cents: number | null; current_period_end: string | null }>(
    `SELECT u.id, u.email, u.name, u.role, u.experience, u.bio, u.avatar, u.muted_until, u.suspended, u.terms_accepted_at, u.created_at,
            m.status AS membership_status, m.amount_cents, m.current_period_end
     FROM users u LEFT JOIN memberships m ON m.user_id = u.id
     WHERE u.role = 'student' ORDER BY u.created_at DESC`,
  );
}

export function updateProfile(userId: number, name: string, bio: string) {
  run(`UPDATE users SET name = ?, bio = ? WHERE id = ?`, name, bio, userId);
}

export function setAvatar(userId: number, avatar: string) {
  run(`UPDATE users SET avatar = ? WHERE id = ?`, avatar, userId);
}

export function setExperience(userId: number, experience: Experience) {
  run(`UPDATE users SET experience = ? WHERE id = ?`, experience, userId);
}

export function setPassword(userId: number, password: string) {
  run(`UPDATE users SET password_hash = ? WHERE id = ?`, hashPassword(password), userId);
}

export function setSuspended(userId: number, suspended: number) {
  run(`UPDATE users SET suspended = ? WHERE id = ?`, suspended, userId);
}

export function setMuted(userId: number, until: string | null) {
  run(`UPDATE users SET muted_until = ? WHERE id = ?`, until, userId);
}

export function createSession(userId: number) {
  const raw = newToken();
  const now = new Date();
  run(
    `INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    sha256(raw),
    userId,
    now.toISOString(),
    new Date(now.getTime() + 30 * 86400000).toISOString(),
  );
  return raw;
}

export function userBySession(raw: string) {
  const row = get<User>(
    `SELECT ${userColumns.split(", ").map((c) => `u.${c}`).join(", ")}
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ? AND u.suspended = 0`,
    sha256(raw),
    new Date().toISOString(),
  );
  return row;
}

export function deleteSession(raw: string) {
  run(`DELETE FROM sessions WHERE token_hash = ?`, sha256(raw));
}

export function createReset(userId: number) {
  const raw = newToken();
  run(`DELETE FROM password_resets WHERE user_id = ?`, userId);
  run(
    `INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)`,
    sha256(raw),
    userId,
    new Date(Date.now() + 3600 * 1000).toISOString(),
  );
  return raw;
}

export function consumeReset(raw: string) {
  const row = get<{ user_id: number }>(
    `SELECT user_id FROM password_resets WHERE token_hash = ? AND expires_at > ?`,
    sha256(raw),
    new Date().toISOString(),
  );
  if (!row) return null;
  run(`DELETE FROM password_resets WHERE token_hash = ?`, sha256(raw));
  return row.user_id;
}

export function listLevels() {
  return all<Level>(`SELECT * FROM levels ORDER BY sort_order`);
}

export function getLevel(id: number) {
  return get<Level>(`SELECT * FROM levels WHERE id = ?`, id);
}

export function updateLevel(id: number, name: string, summary: string) {
  run(`UPDATE levels SET name = ?, summary = ? WHERE id = ?`, name, summary, id);
}

export function listLessons(levelId?: number) {
  if (levelId) return all<Lesson>(`SELECT * FROM lessons WHERE level_id = ? ORDER BY sort_order, id`, levelId);
  return all<Lesson>(`SELECT * FROM lessons ORDER BY level_id, sort_order, id`);
}

export function getLesson(id: number) {
  return get<Lesson>(`SELECT * FROM lessons WHERE id = ?`, id);
}

export function saveLesson(input: { id?: number; level_id: number; title: string; summary: string; duration_min: number; video_ref: string }) {
  if (input.id) {
    run(
      `UPDATE lessons SET level_id = ?, title = ?, summary = ?, duration_min = ?, video_ref = ? WHERE id = ?`,
      input.level_id,
      input.title,
      input.summary,
      input.duration_min,
      input.video_ref,
      input.id,
    );
    return input.id;
  }
  const sort = get<{ c: number }>(`SELECT COALESCE(MAX(sort_order), 0) + 1 AS c FROM lessons WHERE level_id = ?`, input.level_id);
  const result = run(
    `INSERT INTO lessons (level_id, title, summary, duration_min, sort_order, video_ref) VALUES (?, ?, ?, ?, ?, ?)`,
    input.level_id,
    input.title,
    input.summary,
    input.duration_min,
    sort?.c ?? 1,
    input.video_ref,
  );
  return Number(result.lastInsertRowid);
}

export function deleteLesson(id: number) {
  run(`DELETE FROM lessons WHERE id = ?`, id);
}

export function progressFor(userId: number, lessonId: number) {
  return get<Progress>(`SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?`, userId, lessonId);
}

export function allProgress(userId: number) {
  return all<Progress>(`SELECT * FROM lesson_progress WHERE user_id = ?`, userId);
}

export function addWatchSeconds(userId: number, lessonId: number, seconds: number, ratio: number, durationMin: number) {
  const current = progressFor(userId, lessonId);
  const cap = durationMin * 60;
  const watched = Math.min(cap, (current?.watched_seconds ?? 0) + seconds);
  const completed = watched >= cap * ratio ? 1 : current?.completed ?? 0;
  const completedAt = completed ? current?.completed_at || new Date().toISOString() : null;
  run(
    `INSERT INTO lesson_progress (user_id, lesson_id, watched_seconds, completed, completed_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, lesson_id) DO UPDATE SET
       watched_seconds = excluded.watched_seconds,
       completed = CASE WHEN lesson_progress.completed = 1 THEN 1 ELSE excluded.completed END,
       completed_at = COALESCE(lesson_progress.completed_at, excluded.completed_at)`,
    userId,
    lessonId,
    watched,
    completed,
    completedAt,
  );
  return progressFor(userId, lessonId);
}

export function listExams() {
  return all<Exam>(`SELECT * FROM exams ORDER BY id`);
}

export function getExam(id: number) {
  return get<Exam>(`SELECT * FROM exams WHERE id = ?`, id);
}

export function getExamByCode(code: string) {
  return get<Exam>(`SELECT * FROM exams WHERE code = ?`, code);
}

export function saveExam(id: number, minScore: number, cooldown: number, timeLimit: number, priceCents: number, title: string) {
  run(
    `UPDATE exams SET min_score = ?, cooldown_hours = ?, time_limit_min = ?, price_cents = ?, title = ? WHERE id = ?`,
    minScore,
    cooldown,
    timeLimit,
    priceCents,
    title,
    id,
  );
}

export function questionsFor(examId: number) {
  return all<Question>(`SELECT * FROM questions WHERE exam_id = ? ORDER BY sort_order, id`, examId);
}

export function optionsFor(questionId: number) {
  return all<Option>(`SELECT * FROM options WHERE question_id = ? ORDER BY sort_order, id`, questionId);
}

export function publicExam(examId: number) {
  return questionsFor(examId).map((question) => ({
    ...question,
    options: optionsFor(question.id).map((option) => ({ id: option.id, label: option.label })),
  }));
}

export function addQuestion(examId: number, prompt: string, kind: "mc" | "tf", points: number, labels: string[], correctIndex: number) {
  const sort = get<{ c: number }>(`SELECT COALESCE(MAX(sort_order), 0) + 1 AS c FROM questions WHERE exam_id = ?`, examId);
  const result = run(
    `INSERT INTO questions (exam_id, prompt, kind, points, sort_order) VALUES (?, ?, ?, ?, ?)`,
    examId,
    prompt,
    kind,
    points,
    sort?.c ?? 1,
  );
  const id = Number(result.lastInsertRowid);
  labels.forEach((label, index) => {
    run(
      `INSERT INTO options (question_id, label, is_correct, sort_order) VALUES (?, ?, ?, ?)`,
      id,
      label,
      index === correctIndex ? 1 : 0,
      index + 1,
    );
  });
  return id;
}

export function updateQuestion(id: number, prompt: string, points: number, labels: string[], correctIndex: number) {
  run(`UPDATE questions SET prompt = ?, points = ? WHERE id = ?`, prompt, points, id);
  run(`DELETE FROM options WHERE question_id = ?`, id);
  labels.forEach((label, index) => {
    run(
      `INSERT INTO options (question_id, label, is_correct, sort_order) VALUES (?, ?, ?, ?)`,
      id,
      label,
      index === correctIndex ? 1 : 0,
      index + 1,
    );
  });
}

export function deleteQuestion(id: number) {
  run(`DELETE FROM questions WHERE id = ?`, id);
}

export function attemptsForUser(userId: number) {
  return all<Attempt & { code: string; title: string }>(
    `SELECT a.*, e.code, e.title FROM attempts a JOIN exams e ON e.id = a.exam_id
     WHERE a.user_id = ? ORDER BY a.id DESC`,
    userId,
  );
}

export function allGradedAttempts() {
  return all<Attempt & { code: string; title: string; name: string; email: string }>(
    `SELECT a.*, e.code, e.title, u.name, u.email
     FROM attempts a JOIN exams e ON e.id = a.exam_id JOIN users u ON u.id = a.user_id
     WHERE a.status = 'graded' ORDER BY a.finished_at DESC`,
  );
}

export function hasPassed(userId: number, code: string) {
  const row = get<{ c: number }>(
    `SELECT COUNT(*) AS c FROM attempts a JOIN exams e ON e.id = a.exam_id
     WHERE a.user_id = ? AND e.code = ? AND a.passed = 1`,
    userId,
    code,
  );
  return (row?.c ?? 0) > 0;
}

export function failedCount(userId: number, examId: number) {
  const row = get<{ c: number }>(
    `SELECT COUNT(*) AS c FROM attempts WHERE user_id = ? AND exam_id = ? AND status = 'graded' AND passed = 0`,
    userId,
    examId,
  );
  return row?.c ?? 0;
}

export function lastGraded(userId: number, examId: number) {
  return get<Attempt>(
    `SELECT * FROM attempts WHERE user_id = ? AND exam_id = ? AND status = 'graded' ORDER BY finished_at DESC LIMIT 1`,
    userId,
    examId,
  );
}

export function bestAttempt(userId: number, examId: number) {
  return get<Attempt>(
    `SELECT * FROM attempts WHERE user_id = ? AND exam_id = ? AND status = 'graded' ORDER BY percent DESC, id DESC LIMIT 1`,
    userId,
    examId,
  );
}

function closeExpired(attempt: Attempt, limitMin: number) {
  const elapsed = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
  if (elapsed <= limitMin * 60 + 20) return false;
  run(
    `UPDATE attempts SET status = 'graded', score = 0, max_score = 0, percent = 0, passed = 0, finished_at = ?, duration_sec = ? WHERE id = ?`,
    new Date().toISOString(),
    elapsed,
    attempt.id,
  );
  return true;
}

export function openAttempt(userId: number, exam: Exam) {
  const existing = get<Attempt>(
    `SELECT * FROM attempts WHERE user_id = ? AND exam_id = ? AND status = 'in_progress' ORDER BY id DESC LIMIT 1`,
    userId,
    exam.id,
  );
  if (existing) {
    if (!closeExpired(existing, exam.time_limit_min)) return existing;
  }
  const result = run(
    `INSERT INTO attempts (user_id, exam_id, status, started_at) VALUES (?, ?, 'in_progress', ?)`,
    userId,
    exam.id,
    new Date().toISOString(),
  );
  return get<Attempt>(`SELECT * FROM attempts WHERE id = ?`, Number(result.lastInsertRowid))!;
}

export function getAttempt(id: number) {
  return get<Attempt & { code: string; title: string; min_score: number }>(
    `SELECT a.*, e.code, e.title, e.min_score FROM attempts a JOIN exams e ON e.id = a.exam_id WHERE a.id = ?`,
    id,
  );
}

export function answerRows(attemptId: number) {
  return all<{ question_id: number; option_id: number | null; correct: number; points_earned: number; prompt: string; label: string | null }>(
    `SELECT aa.question_id, aa.option_id, aa.correct, aa.points_earned, q.prompt, o.label
     FROM attempt_answers aa
     JOIN questions q ON q.id = aa.question_id
     LEFT JOIN options o ON o.id = aa.option_id
     WHERE aa.attempt_id = ?`,
    attemptId,
  );
}

export function gradeAttempt(attemptId: number, userId: number, answers: Record<number, number>) {
  const attempt = get<Attempt>(`SELECT * FROM attempts WHERE id = ? AND user_id = ? AND status = 'in_progress'`, attemptId, userId);
  if (!attempt) return null;
  const exam = getExam(attempt.exam_id);
  if (!exam) return null;
  const elapsed = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
  const questions = questionsFor(exam.id);
  let score = 0;
  let max = 0;
  const file = database();
  file.exec("BEGIN");
  try {
    for (const question of questions) {
      max += question.points;
      const options = optionsFor(question.id);
      const chosen = answers[question.id];
      const correctOption = options.find((option) => option.is_correct === 1);
      const correct = chosen != null && correctOption?.id === chosen;
      const points = correct ? question.points : 0;
      score += points;
      file.prepare(
        `INSERT INTO attempt_answers (attempt_id, question_id, option_id, correct, points_earned) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(attempt_id, question_id) DO UPDATE SET option_id = excluded.option_id, correct = excluded.correct, points_earned = excluded.points_earned`,
      ).run(attemptId, question.id, chosen ?? null, correct ? 1 : 0, points);
    }
    const percent = max === 0 ? 0 : Math.round((score / max) * 1000) / 10;
    const timedOut = elapsed > exam.time_limit_min * 60 + 30;
    const passed = !timedOut && percent >= exam.min_score ? 1 : 0;
    const finalScore = timedOut ? 0 : score;
    const finalPercent = timedOut ? 0 : percent;
    file.prepare(
      `UPDATE attempts SET status = 'graded', score = ?, max_score = ?, percent = ?, passed = ?, finished_at = ?, duration_sec = ? WHERE id = ?`,
    ).run(finalScore, max, finalPercent, passed, new Date().toISOString(), elapsed, attemptId);
    file.exec("COMMIT");
    return { attemptId, passed: passed === 1, percent: finalPercent, score: finalScore, max, timedOut, exam };
  } catch (error) {
    file.exec("ROLLBACK");
    throw error;
  }
}

export function hasPaid(userId: number, productKey: string) {
  const row = get<{ c: number }>(
    `SELECT COUNT(*) AS c FROM transactions WHERE user_id = ? AND product_key = ? AND status = 'paid'`,
    userId,
    productKey,
  );
  return (row?.c ?? 0) > 0;
}

export function getMembership(userId: number) {
  return get<Membership>(`SELECT * FROM memberships WHERE user_id = ?`, userId);
}

export function refreshMembership(userId: number) {
  const membership = getMembership(userId);
  if (!membership?.current_period_end) return membership ?? null;
  const ended = new Date(membership.current_period_end).getTime() < Date.now();
  if (ended && (membership.status === "active" || membership.status === "cancelled")) {
    run(`UPDATE memberships SET status = 'expired' WHERE user_id = ?`, userId);
    const already = get<{ c: number }>(
      `SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND kind = ?`,
      userId,
      `expired:${membership.current_period_end}`,
    );
    if ((already?.c ?? 0) === 0) {
      notify(userId, "Membresía vencida", "El periodo terminó. Los accesos premium quedan suspendidos hasta renovar.", `expired:${membership.current_period_end}`);
    }
    return getMembership(userId) ?? null;
  }
  return membership;
}

export function hasReference(reference: string) {
  const row = get<{ id: number }>(`SELECT id FROM transactions WHERE reference = ? OR reference LIKE ?`, reference, `${reference}:%`);
  return Boolean(row);
}

export function activateMembership(userId: number, amountCents: number, currency: string, includeEntry: boolean, entryCents: number, reference: string | null = null) {
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 86400000).toISOString();
  const iso = now.toISOString();
  if (includeEntry) {
    run(
      `INSERT INTO transactions (user_id, product_key, description, amount_cents, currency, status, created_at, reference) VALUES (?, 'entry', 'Inscripción', ?, ?, 'paid', ?, ?)`,
      userId,
      entryCents,
      currency,
      iso,
      reference ? `${reference}:entry` : null,
    );
  }
  run(
    `INSERT INTO transactions (user_id, product_key, description, amount_cents, currency, status, created_at, reference) VALUES (?, 'monthly', 'Membresía mensual', ?, ?, 'paid', ?, ?)`,
    userId,
    amountCents,
    currency,
    iso,
    reference ? `${reference}:month` : null,
  );
  run(
    `INSERT INTO memberships (user_id, status, amount_cents, currency, started_at, current_period_end, next_charge_at, cancelled_at)
     VALUES (?, 'active', ?, ?, ?, ?, ?, NULL)
     ON CONFLICT(user_id) DO UPDATE SET
       status = 'active', amount_cents = excluded.amount_cents, currency = excluded.currency,
       started_at = COALESCE(memberships.started_at, excluded.started_at),
       current_period_end = excluded.current_period_end, next_charge_at = excluded.next_charge_at, cancelled_at = NULL`,
    userId,
    amountCents,
    currency,
    iso,
    end,
    end,
  );
  return end;
}

export function payExam(userId: number, exam: Exam, currency: string) {
  run(
    `INSERT INTO transactions (user_id, product_key, description, amount_cents, currency, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'paid', ?)`,
    userId,
    `exam:${exam.code}`,
    exam.title,
    exam.price_cents,
    currency,
    new Date().toISOString(),
  );
}

export function setMembershipStatus(userId: number, status: Membership["status"]) {
  const existing = getMembership(userId);
  if (!existing) {
    run(
      `INSERT INTO memberships (user_id, status, amount_cents, currency, cancelled_at) VALUES (?, ?, 0, 'USD', ?)`,
      userId,
      status,
      status === "cancelled" ? new Date().toISOString() : null,
    );
    return;
  }
  run(
    `UPDATE memberships SET status = ?, cancelled_at = ? WHERE user_id = ?`,
    status,
    status === "cancelled" ? new Date().toISOString() : existing.cancelled_at,
    userId,
  );
}

export function cancelMembership(userId: number) {
  run(`UPDATE memberships SET status = 'cancelled', cancelled_at = ? WHERE user_id = ?`, new Date().toISOString(), userId);
}

export function listTransactions(userId: number): Transaction[];
export function listTransactions(): Array<Transaction & { name: string; email: string }>;
export function listTransactions(userId?: number) {
  if (userId) return all<Transaction>(`SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC`, userId);
  return all<Transaction & { name: string; email: string }>(
    `SELECT t.*, u.name, u.email FROM transactions t JOIN users u ON u.id = t.user_id ORDER BY t.id DESC LIMIT 200`,
  );
}

export function listChannels() {
  return all<Channel>(`SELECT * FROM channels ORDER BY id`);
}

export function getChannel(slug: string) {
  return get<Channel>(`SELECT * FROM channels WHERE slug = ?`, slug);
}

export function listMessages(channelId: number, after = 0) {
  return all<Message>(
    `SELECT m.id, m.channel_id, m.user_id, m.body, m.created_at, m.deleted, u.name, u.role, u.experience
     FROM messages m JOIN users u ON u.id = m.user_id
     WHERE m.channel_id = ? AND m.id > ? ORDER BY m.id ASC LIMIT 200`,
    channelId,
    after,
  );
}

export function recentMessages(limit = 40) {
  return all<Message & { slug: string }>(
    `SELECT m.id, m.channel_id, m.user_id, m.body, m.created_at, m.deleted, u.name, u.role, c.slug
     FROM messages m JOIN users u ON u.id = m.user_id JOIN channels c ON c.id = m.channel_id
     ORDER BY m.id DESC LIMIT ?`,
    limit,
  );
}

export function addMessage(channelId: number, userId: number, body: string) {
  const result = run(
    `INSERT INTO messages (channel_id, user_id, body, created_at) VALUES (?, ?, ?, ?)`,
    channelId,
    userId,
    body,
    new Date().toISOString(),
  );
  return Number(result.lastInsertRowid);
}

export function softDeleteMessage(id: number) {
  run(`UPDATE messages SET deleted = 1, body = '' WHERE id = ?`, id);
}

export function reportMessage(messageId: number, userId: number, reason: string) {
  run(
    `INSERT INTO reports (message_id, user_id, reason, created_at) VALUES (?, ?, ?, ?)`,
    messageId,
    userId,
    reason,
    new Date().toISOString(),
  );
}

export function listReports() {
  return all<{ id: number; message_id: number; reason: string; created_at: string; resolved: number; body: string; name: string }>(
    `SELECT r.id, r.message_id, r.reason, r.created_at, r.resolved, m.body, u.name
     FROM reports r JOIN messages m ON m.id = r.message_id JOIN users u ON u.id = m.user_id
     ORDER BY r.resolved ASC, r.id DESC LIMIT 100`,
  );
}

export function resolveReport(id: number) {
  run(`UPDATE reports SET resolved = 1 WHERE id = ?`, id);
}

export function notify(userId: number, title: string, body: string, kind: string) {
  run(
    `INSERT INTO notifications (user_id, title, body, kind, created_at) VALUES (?, ?, ?, ?, ?)`,
    userId,
    title,
    body,
    kind,
    new Date().toISOString(),
  );
  const user = getUser(userId);
  if (user) queueMail(user.email, title, body);
}

export function notifyStaff(title: string, body: string, kind: string) {
  const staff = all<User>(`SELECT ${userColumns} FROM users WHERE role IN ('admin','teacher')`);
  for (const person of staff) notify(person.id, title, body, kind);
}

export function listNotifications(userId: number) {
  return all<{ id: number; title: string; body: string; kind: string; read: number; created_at: string }>(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50`,
    userId,
  );
}

export function unreadCount(userId: number) {
  return get<{ c: number }>(`SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0`, userId)?.c ?? 0;
}

export function markAllRead(userId: number) {
  run(`UPDATE notifications SET read = 1 WHERE user_id = ?`, userId);
}

export function hasKind(userId: number, kind: string) {
  return (get<{ c: number }>(`SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND kind = ?`, userId, kind)?.c ?? 0) > 0;
}

export function awardBadge(userId: number, code: string, label: string) {
  run(
    `INSERT INTO badges (user_id, code, label, awarded_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, code) DO NOTHING`,
    userId,
    code,
    label,
    new Date().toISOString(),
  );
}

export function badgesFor(userId: number) {
  return all<{ code: string; label: string; awarded_at: string }>(`SELECT code, label, awarded_at FROM badges WHERE user_id = ? ORDER BY id`, userId);
}

export function addAudit(actorId: number | null, action: string, detail: string) {
  run(
    `INSERT INTO audit_log (actor_id, action, detail, created_at) VALUES (?, ?, ?, ?)`,
    actorId,
    action,
    detail,
    new Date().toISOString(),
  );
}

export function recentAudit() {
  return all<{ id: number; action: string; detail: string; created_at: string; name: string | null }>(
    `SELECT a.id, a.action, a.detail, a.created_at, u.name
     FROM audit_log a LEFT JOIN users u ON u.id = a.actor_id ORDER BY a.id DESC LIMIT 30`,
  );
}

export function queueMail(to: string, subject: string, body: string) {
  const result = run(
    `INSERT INTO outbox (to_email, subject, body, created_at, sent) VALUES (?, ?, ?, ?, 0)`,
    to,
    subject,
    body,
    new Date().toISOString(),
  );
  return Number(result.lastInsertRowid);
}

export function markMailSent(id: number) {
  run(`UPDATE outbox SET sent = 1 WHERE id = ?`, id);
}

export function recentMail(limit = 8) {
  return all<{ id: number; to_email: string; subject: string; sent: number; created_at: string }>(
    `SELECT id, to_email, subject, sent, created_at FROM outbox ORDER BY id DESC LIMIT ?`,
    limit,
  );
}

export function pendingMail(limit = 20) {
  return all<{ id: number; to_email: string; subject: string; body: string }>(
    `SELECT id, to_email, subject, body FROM outbox WHERE sent = 0 ORDER BY id ASC LIMIT ?`,
    limit,
  );
}

export function outboxCount() {
  return get<{ pending: number; total: number }>(`SELECT SUM(CASE WHEN sent = 0 THEN 1 ELSE 0 END) AS pending, COUNT(*) AS total FROM outbox`) ?? { pending: 0, total: 0 };
}

export function listBroadcasts(kind?: "live" | "review") {
  if (kind) return all<Broadcast>(`SELECT * FROM broadcasts WHERE kind = ? ORDER BY starts_at DESC`, kind);
  return all<Broadcast>(`SELECT * FROM broadcasts ORDER BY starts_at DESC`);
}

export function saveBroadcast(input: { id?: number; kind: "live" | "review"; title: string; starts_at: string; ends_at: string; stream_url: string; recording_url: string }) {
  if (input.id) {
    run(
      `UPDATE broadcasts SET kind = ?, title = ?, starts_at = ?, ends_at = ?, stream_url = ?, recording_url = ? WHERE id = ?`,
      input.kind,
      input.title,
      input.starts_at,
      input.ends_at,
      input.stream_url,
      input.recording_url,
      input.id,
    );
    return input.id;
  }
  const result = run(
    `INSERT INTO broadcasts (kind, title, starts_at, ends_at, stream_url, recording_url, published) VALUES (?, ?, ?, ?, ?, ?, 1)`,
    input.kind,
    input.title,
    input.starts_at,
    input.ends_at,
    input.stream_url,
    input.recording_url,
  );
  return Number(result.lastInsertRowid);
}

export function deleteBroadcast(id: number) {
  run(`DELETE FROM broadcasts WHERE id = ?`, id);
}

export function confirmPrize(week: string, userId: number, title: string, actorId: number) {
  run(
    `INSERT INTO prizes (week_key, user_id, title, status, confirmed_by, created_at) VALUES (?, ?, ?, 'confirmed', ?, ?)`,
    week,
    userId,
    title,
    actorId,
    new Date().toISOString(),
  );
}

export function prizesForWeek(week: string) {
  return all<{ id: number; user_id: number; title: string; name: string; created_at: string }>(
    `SELECT p.id, p.user_id, p.title, u.name, p.created_at FROM prizes p JOIN users u ON u.id = p.user_id WHERE p.week_key = ?`,
    week,
  );
}

export function prizesForUser(userId: number) {
  return all<{ title: string; week_key: string; created_at: string }>(
    `SELECT title, week_key, created_at FROM prizes WHERE user_id = ? ORDER BY id DESC`,
    userId,
  );
}

export function passedSince(iso: string) {
  return all<{ user_id: number; name: string; email: string; title: string; percent: number; finished_at: string; code: string }>(
    `SELECT a.user_id, u.name, u.email, e.title, a.percent, a.finished_at, e.code
     FROM attempts a JOIN users u ON u.id = a.user_id JOIN exams e ON e.id = a.exam_id
     WHERE a.passed = 1 AND a.finished_at >= ? ORDER BY a.finished_at DESC`,
    iso,
  );
}

export function attemptCountForUser(userId: number) {
  return get<{ c: number }>(`SELECT COUNT(*) AS c FROM attempts WHERE user_id = ?`, userId)?.c ?? 0;
}

export function metrics() {
  const students = get<{ c: number }>(`SELECT COUNT(*) AS c FROM users WHERE role = 'student'`)?.c ?? 0;
  const active = get<{ c: number }>(`SELECT COUNT(*) AS c FROM memberships WHERE status = 'active'`)?.c ?? 0;
  const cancelled = get<{ c: number }>(`SELECT COUNT(*) AS c FROM memberships WHERE status IN ('cancelled','expired')`)?.c ?? 0;
  const pending = get<{ c: number }>(`SELECT COUNT(*) AS c FROM memberships WHERE status = 'pending'`)?.c ?? 0;
  const revenue = get<{ c: number }>(`SELECT COALESCE(SUM(amount_cents), 0) AS c FROM transactions WHERE status = 'paid'`)?.c ?? 0;
  const paidEntries = get<{ c: number }>(`SELECT COUNT(DISTINCT user_id) AS c FROM transactions WHERE product_key = 'entry' AND status = 'paid'`)?.c ?? 0;
  const graded = get<{ c: number }>(`SELECT COUNT(*) AS c FROM attempts WHERE status = 'graded'`)?.c ?? 0;
  const passed = get<{ c: number }>(`SELECT COUNT(*) AS c FROM attempts WHERE passed = 1`)?.c ?? 0;
  return { students, active, cancelled, pending, revenue, paidEntries, graded, passed };
}

export function weekRanking(fromIso: string) {
  const rows = passedSince(fromIso);
  const map = new Map<number, { userId: number; name: string; best: number; exams: number }>();
  for (const row of rows) {
    const current = map.get(row.user_id) ?? { userId: row.user_id, name: row.name, best: 0, exams: 0 };
    current.exams += 1;
    current.best = Math.max(current.best, row.percent);
    map.set(row.user_id, current);
  }
  return [...map.values()].sort((a, b) => b.best - a.best || b.exams - a.exams);
}

export { startOfIsoWeek };
