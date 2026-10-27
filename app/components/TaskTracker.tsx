"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cargarTareas,
  compararTareas,
  estaVencida,
  nuevoId,
  STORAGE_KEY,
  type Borrador,
  type Filtro,
  type Tarea,
} from "../lib/tareas";
import { IconoMas } from "./Iconos";
import TaskForm from "./TaskForm";
import TaskItem from "./TaskItem";
import WeeklyCalendar from "./WeeklyCalendar";

const FILTROS: [Filtro, string][] = [
  ["todas", "Todas"],
  ["pendientes", "Pendientes"],
  ["hechas", "Hechas"],
];

export default function TaskTracker() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargado, setCargado] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [resaltadaId, setResaltadaId] = useState<string | null>(null);

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

  // Al elegir una tarea en el calendario, llevarla a la vista y resaltarla un momento
  useEffect(() => {
    if (!resaltadaId) return;
    document.getElementById(`tarea-${resaltadaId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => setResaltadaId(null), 1800);
    return () => clearTimeout(t);
  }, [resaltadaId]);

  const pendientes = tareas.filter((t) => t.estado === "pendiente").length;
  const hechas = tareas.length - pendientes;
  const vencidas = tareas.filter(estaVencida).length;

  const visibles = useMemo(() => {
    const filtradas = tareas.filter((t) =>
      filtro === "todas" ? true : filtro === "pendientes" ? t.estado === "pendiente" : t.estado === "hecha",
    );
    return [...filtradas].sort(compararTareas);
  }, [tareas, filtro]);

  function agregar(b: Borrador) {
    setTareas((prev) => [
      ...prev,
      {
        id: nuevoId(),
        titulo: b.titulo,
        descripcion: b.descripcion,
        prioridad: b.prioridad,
        fechaLimite: b.fechaLimite || null,
        estado: "pendiente",
      },
    ]);
  }

  function guardarEdicion(id: string, b: Borrador) {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, titulo: b.titulo, descripcion: b.descripcion, prioridad: b.prioridad, fechaLimite: b.fechaLimite || null }
          : t,
      ),
    );
    setEditandoId(null);
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

  function seleccionarDesdeCalendario(id: string) {
    const t = tareas.find((x) => x.id === id);
    if (!t) return;
    const visible = filtro === "todas" || (filtro === "pendientes") === (t.estado === "pendiente");
    if (!visible) setFiltro("todas");
    setResaltadaId(id);
  }

  const fechaHoy = cargado
    ? new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })
    : "";

  return (
    <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      {/* Fondo decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_60%_at_20%_0%,rgba(139,92,246,0.18),transparent),radial-gradient(50%_50%_at_90%_10%,rgba(99,102,241,0.14),transparent)]"
      />

      <header className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="min-h-5 text-sm font-medium first-letter:uppercase text-violet-600 dark:text-violet-400">{fechaHoy}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Mis tareas
          </h1>
        </div>
        <dl className="grid grid-cols-3 gap-2 sm:flex">
          <Estadistica etiqueta="Pendientes" valor={cargado ? pendientes : "–"} clase="text-violet-700 dark:text-violet-300" />
          <Estadistica
            etiqueta="Vencidas"
            valor={cargado ? vencidas : "–"}
            clase={vencidas > 0 ? "text-red-600 dark:text-red-400" : "text-zinc-400"}
          />
          <Estadistica etiqueta="Hechas" valor={cargado ? hechas : "–"} clase="text-emerald-600 dark:text-emerald-400" />
        </dl>
      </header>

      <div className="mb-6 sm:mb-8">
        {cargado ? (
          <WeeklyCalendar tareas={tareas} onSeleccionar={seleccionarDesdeCalendario} />
        ) : (
          <div className="h-56 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <section className="rounded-3xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5 lg:sticky lg:top-6 dark:border-zinc-800 dark:bg-zinc-900/70">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              <IconoMas className="h-4 w-4" />
            </span>
            Nueva tarea
          </h2>
          <TaskForm textoBoton="Agregar tarea" onGuardar={agregar} limpiarAlGuardar />
        </section>

        <section>
          <div className="mb-4 flex gap-1 rounded-2xl bg-zinc-200/60 p-1 dark:bg-zinc-900" role="tablist">
            {FILTROS.map(([valor, etiqueta]) => (
              <button
                key={valor}
                role="tab"
                aria-selected={filtro === valor}
                onClick={() => setFiltro(valor)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  filtro === valor
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          {cargado && visibles.length === 0 && (
            <div className="rounded-3xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
              <p className="text-3xl">{tareas.length === 0 ? "📝" : "✨"}</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {tareas.length === 0 ? "Aún no hay tareas. ¡Agrega la primera!" : "No hay tareas en este filtro."}
              </p>
            </div>
          )}

          <ul className="flex flex-col gap-2.5">
            {visibles.map((t) => (
              <TaskItem
                key={t.id}
                tarea={t}
                editando={editandoId === t.id}
                resaltada={resaltadaId === t.id}
                onAlternar={() => alternarEstado(t.id)}
                onEditar={() => setEditandoId(t.id)}
                onGuardar={(b) => guardarEdicion(t.id, b)}
                onCancelar={() => setEditandoId(null)}
                onEliminar={() => eliminar(t.id)}
              />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Estadistica({ etiqueta, valor, clase }: { etiqueta: string; valor: number | string; clase: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-2.5 text-center shadow-sm backdrop-blur sm:min-w-24 dark:border-zinc-800 dark:bg-zinc-900/70">
      <dd className={`text-2xl font-bold tabular-nums ${clase}`}>{valor}</dd>
      <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{etiqueta}</dt>
    </div>
  );
}
