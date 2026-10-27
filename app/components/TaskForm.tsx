"use client";

import { useState } from "react";
import { BORRADOR_VACIO, COLOR_PRIORIDAD, ETIQUETA_PRIORIDAD, PRIORIDADES, type Borrador } from "../lib/tareas";
import { IconoCalendario, IconoTexto } from "./Iconos";

interface Props {
  inicial?: Borrador;
  textoBoton: string;
  onGuardar: (b: Borrador) => void;
  onCancelar?: () => void;
  // En el formulario de creación se limpia después de guardar
  limpiarAlGuardar?: boolean;
  autoFocus?: boolean;
}

export const claseCampo =
  "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:ring-violet-500/20";

export default function TaskForm({
  inicial = BORRADOR_VACIO,
  textoBoton,
  onGuardar,
  onCancelar,
  limpiarAlGuardar = false,
  autoFocus = false,
}: Props) {
  const [b, setB] = useState<Borrador>(inicial);
  const [conDescripcion, setConDescripcion] = useState(inicial.descripcion !== "");
  const valido = b.titulo.trim() !== "";

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!valido) return;
    onGuardar({ ...b, titulo: b.titulo.trim(), descripcion: conDescripcion ? b.descripcion.trim() : "" });
    if (limpiarAlGuardar) {
      setB({ ...BORRADOR_VACIO, prioridad: b.prioridad });
      setConDescripcion(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <input
        autoFocus={autoFocus}
        className={claseCampo}
        placeholder="¿Qué tienes que hacer?"
        aria-label="Título de la tarea"
        value={b.titulo}
        onChange={(e) => setB({ ...b, titulo: e.target.value })}
      />

      {conDescripcion ? (
        <textarea
          className={`${claseCampo} min-h-20 resize-y text-sm`}
          placeholder="Agrega detalles, notas o pasos…"
          aria-label="Descripción"
          rows={3}
          value={b.descripcion}
          autoFocus={!autoFocus && b.descripcion === ""}
          onChange={(e) => setB({ ...b, descripcion: e.target.value })}
        />
      ) : (
        <button
          type="button"
          onClick={() => setConDescripcion(true)}
          className="flex w-fit items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
        >
          <IconoTexto className="h-4 w-4" />
          Agregar descripción
        </button>
      )}

      <div className="flex flex-col gap-3">
        <fieldset className="flex-1">
          <legend className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Prioridad</legend>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
            {PRIORIDADES.map((p) => {
              const activa = b.prioridad === p;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => setB({ ...b, prioridad: p })}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium transition ${
                    activa
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${COLOR_PRIORIDAD[p].punto}`} />
                  {ETIQUETA_PRIORIDAD[p]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="flex-1">
          <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <IconoCalendario className="h-3.5 w-3.5" />
            Fecha límite <span className="font-normal text-zinc-400">(opcional)</span>
          </span>
          <input
            type="date"
            className={`${claseCampo} py-2`}
            value={b.fechaLimite}
            onChange={(e) => setB({ ...b, fechaLimite: e.target.value })}
          />
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={!valido}
          className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {textoBoton}
        </button>
      </div>
    </form>
  );
}
