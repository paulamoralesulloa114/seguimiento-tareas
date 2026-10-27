"use client";

import { COLOR_PRIORIDAD, ETIQUETA_PRIORIDAD, estaVencida, formatearFecha, type Borrador, type Tarea } from "../lib/tareas";
import { IconoBasura, IconoCalendario, IconoCheck, IconoLapiz } from "./Iconos";
import TaskForm from "./TaskForm";

interface Props {
  tarea: Tarea;
  editando: boolean;
  resaltada: boolean;
  onAlternar: () => void;
  onEditar: () => void;
  onGuardar: (b: Borrador) => void;
  onCancelar: () => void;
  onEliminar: () => void;
}

export default function TaskItem({
  tarea: t,
  editando,
  resaltada,
  onAlternar,
  onEditar,
  onGuardar,
  onCancelar,
  onEliminar,
}: Props) {
  const vencida = estaVencida(t);
  const hecha = t.estado === "hecha";
  const color = COLOR_PRIORIDAD[t.prioridad];

  if (editando) {
    return (
      <li
        id={`tarea-${t.id}`}
        className="rounded-2xl border border-violet-200 bg-white p-4 shadow-lg shadow-violet-500/5 dark:border-violet-500/30 dark:bg-zinc-900"
      >
        <TaskForm
          autoFocus
          textoBoton="Guardar cambios"
          inicial={{
            titulo: t.titulo,
            descripcion: t.descripcion,
            prioridad: t.prioridad,
            fechaLimite: t.fechaLimite ?? "",
          }}
          onGuardar={onGuardar}
          onCancelar={onCancelar}
        />
      </li>
    );
  }

  return (
    <li
      id={`tarea-${t.id}`}
      className={`group relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 pl-5 transition before:absolute before:inset-y-0 before:left-0 before:w-1 ${
        hecha ? "before:bg-zinc-300 dark:before:bg-zinc-700" : color.borde
      } ${
        vencida
          ? "border-red-200 bg-red-50/80 dark:border-red-500/30 dark:bg-red-500/10"
          : "border-zinc-200/80 bg-white hover:shadow-md hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900"
      } ${resaltada ? "ring-4 ring-violet-300 dark:ring-violet-500/50" : ""}`}
    >
      <button
        onClick={onAlternar}
        aria-label={hecha ? "Marcar como pendiente" : "Marcar como hecha"}
        aria-pressed={hecha}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          hecha
            ? "border-violet-600 bg-violet-600 text-white"
            : vencida
              ? "border-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
              : "border-zinc-300 hover:border-violet-500 hover:bg-violet-50 dark:border-zinc-600 dark:hover:bg-violet-500/10"
        }`}
      >
        {hecha && <IconoCheck className="h-3.5 w-3.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`break-words font-medium leading-snug ${
            hecha
              ? "text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500"
              : vencida
                ? "text-red-700 dark:text-red-300"
                : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {t.titulo}
        </p>

        {t.descripcion && (
          <p
            className={`mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed ${
              hecha ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {t.descripcion}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${color.insignia}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${color.punto}`} />
            {ETIQUETA_PRIORIDAD[t.prioridad]}
          </span>
          {t.fechaLimite && (
            <span
              className={`inline-flex items-center gap-1 ${
                vencida ? "font-semibold text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <IconoCalendario className="h-3.5 w-3.5" />
              {vencida && "Vencida · "}
              {formatearFecha(t.fechaLimite)}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-0.5 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <button
          onClick={onEditar}
          aria-label={`Editar ${t.titulo}`}
          title="Editar"
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <IconoLapiz className="h-4 w-4" />
        </button>
        <button
          onClick={onEliminar}
          aria-label={`Eliminar ${t.titulo}`}
          title="Eliminar"
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <IconoBasura className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
