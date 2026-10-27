"use client";

import { useEffect, useMemo, useState } from "react";

type Prioridad = "alta" | "media" | "baja";
type Estado = "pendiente" | "hecha";
type Filtro = "todas" | "pendientes" | "hechas";

interface Tarea {
  id: string;
  titulo: string;
  prioridad: Prioridad;
  fechaLimite: string | null; // formato YYYY-MM-DD
  estado: Estado;
}

const STORAGE_KEY = "seguimiento-tareas:v1";

const ORDEN_PRIORIDAD: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

const ETIQUETA_PRIORIDAD: Record<Prioridad, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const ESTILO_PRIORIDAD: Record<Prioridad, string> = {
  alta: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  media: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  baja: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
};

function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function estaVencida(t: Tarea): boolean {
  return t.estado === "pendiente" && t.fechaLimite !== null && t.fechaLimite < hoyISO();
}

function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function compararTareas(a: Tarea, b: Tarea): number {
  const p = ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
  if (p !== 0) return p;
  // Las tareas sin fecha van al final
  if (a.fechaLimite === b.fechaLimite) return 0;
  if (a.fechaLimite === null) return 1;
  if (b.fechaLimite === null) return -1;
  return a.fechaLimite.localeCompare(b.fechaLimite);
}

function cargarTareas(): Tarea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function nuevoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface Borrador {
  titulo: string;
  prioridad: Prioridad;
  fechaLimite: string;
}

const BORRADOR_VACIO: Borrador = { titulo: "", prioridad: "media", fechaLimite: "" };

export default function TaskTracker() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargado, setCargado] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [borrador, setBorrador] = useState<Borrador>(BORRADOR_VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<Borrador>(BORRADOR_VACIO);

  // Cargar desde localStorage solo en el cliente, después del primer render
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronizar con localStorage al montar
    setTareas(cargarTareas());
    setCargado(true);
  }, []);

  // Guardar cada vez que cambian las tareas (después de haber cargado)
  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
    } catch {
      // almacenamiento no disponible: se ignora
    }
  }, [tareas, cargado]);

  const pendientes = tareas.filter((t) => t.estado === "pendiente").length;

  const visibles = useMemo(() => {
    const filtradas = tareas.filter((t) =>
      filtro === "todas" ? true : filtro === "pendientes" ? t.estado === "pendiente" : t.estado === "hecha",
    );
    return [...filtradas].sort(compararTareas);
  }, [tareas, filtro]);

  function agregar(e: React.FormEvent) {
    e.preventDefault();
    const titulo = borrador.titulo.trim();
    if (!titulo) return;
    setTareas((prev) => [
      ...prev,
      {
        id: nuevoId(),
        titulo,
        prioridad: borrador.prioridad,
        fechaLimite: borrador.fechaLimite || null,
        estado: "pendiente",
      },
    ]);
    setBorrador({ ...BORRADOR_VACIO, prioridad: borrador.prioridad });
  }

  function alternarEstado(id: string) {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: t.estado === "hecha" ? "pendiente" : "hecha" } : t)),
    );
  }

  function eliminar(id: string) {
    setTareas((prev) => prev.filter((t) => t.id !== id));
    if (editandoId === id) setEditandoId(null);
  }

  function empezarEdicion(t: Tarea) {
    setEditandoId(t.id);
    setEdicion({ titulo: t.titulo, prioridad: t.prioridad, fechaLimite: t.fechaLimite ?? "" });
  }

  function guardarEdicion(e: React.FormEvent) {
    e.preventDefault();
    const titulo = edicion.titulo.trim();
    if (!titulo || !editandoId) return;
    setTareas((prev) =>
      prev.map((t) =>
        t.id === editandoId
          ? { ...t, titulo, prioridad: edicion.prioridad, fechaLimite: edicion.fechaLimite || null }
          : t,
      ),
    );
    setEditandoId(null);
  }

  const inputBase =
    "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-900";

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Seguimiento de tareas</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {cargado ? (
            pendientes === 0 ? (
              "No tienes tareas pendientes 🎉"
            ) : (
              <>
                Tienes <span className="font-semibold text-zinc-900 dark:text-zinc-100">{pendientes}</span>{" "}
                {pendientes === 1 ? "tarea pendiente" : "tareas pendientes"}
              </>
            )
          ) : (
            "Cargando…"
          )}
        </p>
      </header>

      {/* Formulario para agregar */}
      <form
        onSubmit={agregar}
        className="mb-6 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <label className="sr-only" htmlFor="nueva-tarea">
          Nueva tarea
        </label>
        <input
          id="nueva-tarea"
          className={inputBase}
          placeholder="¿Qué tienes que hacer?"
          value={borrador.titulo}
          onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Prioridad
            <select
              className={inputBase}
              value={borrador.prioridad}
              onChange={(e) => setBorrador({ ...borrador, prioridad: e.target.value as Prioridad })}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Fecha límite (opcional)
            <input
              type="date"
              className={inputBase}
              value={borrador.fechaLimite}
              onChange={(e) => setBorrador({ ...borrador, fechaLimite: e.target.value })}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={!borrador.titulo.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar tarea
        </button>
      </form>

      {/* Filtros */}
      <div className="mb-4 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900" role="tablist">
        {(
          [
            ["todas", "Todas"],
            ["pendientes", "Pendientes"],
            ["hechas", "Hechas"],
          ] as [Filtro, string][]
        ).map(([valor, etiqueta]) => (
          <button
            key={valor}
            role="tab"
            aria-selected={filtro === valor}
            onClick={() => setFiltro(valor)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              filtro === valor
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {/* Lista */}
      {cargado && visibles.length === 0 && (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {tareas.length === 0 ? "Aún no hay tareas. ¡Agrega la primera!" : "No hay tareas en este filtro."}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {visibles.map((t) => {
          const vencida = estaVencida(t);
          const hecha = t.estado === "hecha";

          if (editandoId === t.id) {
            return (
              <li
                key={t.id}
                className="rounded-xl border border-indigo-300 bg-white p-3 dark:border-indigo-800 dark:bg-zinc-900"
              >
                <form onSubmit={guardarEdicion} className="flex flex-col gap-2">
                  <input
                    autoFocus
                    className={inputBase}
                    value={edicion.titulo}
                    onChange={(e) => setEdicion({ ...edicion, titulo: e.target.value })}
                    aria-label="Título"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      className={`${inputBase} flex-1`}
                      value={edicion.prioridad}
                      onChange={(e) => setEdicion({ ...edicion, prioridad: e.target.value as Prioridad })}
                      aria-label="Prioridad"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                    <input
                      type="date"
                      className={`${inputBase} flex-1`}
                      value={edicion.fechaLimite}
                      onChange={(e) => setEdicion({ ...edicion, fechaLimite: e.target.value })}
                      aria-label="Fecha límite"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditandoId(null)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!edicion.titulo.trim()}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </li>
            );
          }

          return (
            <li
              key={t.id}
              className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                vencida
                  ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <input
                type="checkbox"
                checked={hecha}
                onChange={() => alternarEstado(t.id)}
                aria-label={hecha ? "Marcar como pendiente" : "Marcar como hecha"}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-indigo-600"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`break-words font-medium ${
                    hecha
                      ? "text-zinc-400 line-through dark:text-zinc-500"
                      : vencida
                        ? "text-red-700 dark:text-red-300"
                        : ""
                  }`}
                >
                  {t.titulo}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${ESTILO_PRIORIDAD[t.prioridad]}`}>
                    {ETIQUETA_PRIORIDAD[t.prioridad]}
                  </span>
                  {t.fechaLimite && (
                    <span
                      className={
                        vencida ? "font-semibold text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"
                      }
                    >
                      {vencida ? "Vencida · " : "Vence "}
                      {formatearFecha(t.fechaLimite)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => empezarEdicion(t)}
                  className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  aria-label={`Editar ${t.titulo}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminar(t.id)}
                  className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  aria-label={`Eliminar ${t.titulo}`}
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
