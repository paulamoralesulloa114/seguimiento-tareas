export type Prioridad = "alta" | "media" | "baja";
export type Estado = "pendiente" | "hecha";
export type Filtro = "todas" | "pendientes" | "hechas";

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  fechaLimite: string | null; // formato YYYY-MM-DD
  estado: Estado;
}

export interface Borrador {
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  fechaLimite: string;
}

export const BORRADOR_VACIO: Borrador = { titulo: "", descripcion: "", prioridad: "media", fechaLimite: "" };

export const STORAGE_KEY = "seguimiento-tareas:v1";

export const PRIORIDADES: Prioridad[] = ["alta", "media", "baja"];

const ORDEN_PRIORIDAD: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

export const ETIQUETA_PRIORIDAD: Record<Prioridad, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

// Clases de color por prioridad: punto, insignia, borde lateral y chip del calendario
export const COLOR_PRIORIDAD: Record<Prioridad, { punto: string; insignia: string; borde: string; chip: string }> = {
  alta: {
    punto: "bg-rose-500",
    insignia: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
    borde: "before:bg-rose-500",
    chip: "bg-rose-50 text-rose-800 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25",
  },
  media: {
    punto: "bg-amber-400",
    insignia:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
    borde: "before:bg-amber-400",
    chip: "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/25",
  },
  baja: {
    punto: "bg-emerald-500",
    insignia:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
    borde: "before:bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/25",
  },
};

export function aISO(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function hoyISO(): string {
  return aISO(new Date());
}

export function desdeISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Lunes de la semana que contiene la fecha dada
export function inicioSemana(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dia = (r.getDay() + 6) % 7; // lunes = 0
  r.setDate(r.getDate() - dia);
  return r;
}

export function sumarDias(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function estaVencida(t: Tarea): boolean {
  return t.estado === "pendiente" && t.fechaLimite !== null && t.fechaLimite < hoyISO();
}

export function formatearFecha(iso: string): string {
  const hoy = hoyISO();
  if (iso === hoy) return "Hoy";
  if (iso === aISO(sumarDias(desdeISO(hoy), 1))) return "Mañana";
  if (iso === aISO(sumarDias(desdeISO(hoy), -1))) return "Ayer";
  const d = desdeISO(iso);
  const mismoAnio = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(mismoAnio ? {} : { year: "numeric" }),
  });
}

export function compararTareas(a: Tarea, b: Tarea): number {
  const p = ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
  if (p !== 0) return p;
  // Las tareas sin fecha van al final
  if (a.fechaLimite === b.fechaLimite) return 0;
  if (a.fechaLimite === null) return 1;
  if (b.fechaLimite === null) return -1;
  return a.fechaLimite.localeCompare(b.fechaLimite);
}

export function cargarTareas(): Tarea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    // Las tareas guardadas antes de existir la descripción no la traen
    return data.map((t) => ({ ...t, descripcion: typeof t.descripcion === "string" ? t.descripcion : "" }));
  } catch {
    return [];
  }
}

export function nuevoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
