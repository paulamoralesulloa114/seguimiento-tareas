"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { aISO, COLOR_PRIORIDAD, compararTareas, estaVencida, hoyISO, inicioSemana, sumarDias, type Tarea } from "../lib/tareas";
import { IconoDerecha, IconoIzquierda } from "./Iconos";

interface Props {
  tareas: Tarea[];
  onSeleccionar: (id: string) => void;
}

function rangoSemana(lunes: Date): string {
  const domingo = sumarDias(lunes, 6);
  const mesL = lunes.toLocaleDateString("es", { month: "short" });
  const mesD = domingo.toLocaleDateString("es", { month: "short" });
  return mesL === mesD
    ? `${lunes.getDate()} – ${domingo.getDate()} ${mesD}`
    : `${lunes.getDate()} ${mesL} – ${domingo.getDate()} ${mesD}`;
}

export default function WeeklyCalendar({ tareas, onSeleccionar }: Props) {
  const [desfase, setDesfase] = useState(0); // semanas desde la actual
  const contenedor = useRef<HTMLDivElement>(null);
  const hoy = hoyISO();

  const lunes = useMemo(() => sumarDias(inicioSemana(new Date()), desfase * 7), [desfase]);
  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i)), [lunes]);

  const porDia = useMemo(() => {
    const mapa = new Map<string, Tarea[]>();
    for (const t of tareas) {
      if (!t.fechaLimite) continue;
      const lista = mapa.get(t.fechaLimite) ?? [];
      lista.push(t);
      mapa.set(t.fechaLimite, lista);
    }
    for (const lista of mapa.values()) {
      // Pendientes primero, luego por prioridad
      lista.sort((a, b) => (a.estado === b.estado ? compararTareas(a, b) : a.estado === "pendiente" ? -1 : 1));
    }
    return mapa;
  }, [tareas]);

  const enSemana = dias.reduce((n, d) => n + (porDia.get(aISO(d))?.length ?? 0), 0);

  // En el celular, desplaza la fila para que hoy quede visible
  useEffect(() => {
    const c = contenedor.current;
    const el = c?.querySelector<HTMLElement>("[data-hoy]");
    if (c && el) c.scrollLeft = el.offsetLeft - 16;
  }, [desfase]);

  return (
    <section className="rounded-3xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {desfase === 0
              ? "Esta semana"
              : desfase === 1
                ? "Próxima semana"
                : desfase === -1
                  ? "Semana pasada"
                  : "Semana"}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {rangoSemana(lunes)}
            <span>
              {" "}
              · {enSemana} {enSemana === 1 ? "tarea" : "tareas"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          {desfase !== 0 && (
            <button
              onClick={() => setDesfase(0)}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
            >
              Hoy
            </button>
          )}
          <button
            onClick={() => setDesfase((d) => d - 1)}
            aria-label="Semana anterior"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <IconoIzquierda className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDesfase((d) => d + 1)}
            aria-label="Semana siguiente"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <IconoDerecha className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={contenedor}
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-7 sm:overflow-visible sm:px-0"
      >
        {dias.map((d) => {
          const iso = aISO(d);
          const esHoy = iso === hoy;
          const pasado = iso < hoy;
          const lista = porDia.get(iso) ?? [];
          return (
            <div
              key={iso}
              data-hoy={esHoy || undefined}
              className={`flex min-h-36 w-[8.5rem] shrink-0 snap-start flex-col rounded-2xl p-2 sm:w-auto ${
                esHoy
                  ? "bg-violet-50 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:ring-violet-500/30"
                  : "bg-zinc-50 dark:bg-zinc-800/40"
              }`}
            >
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    esHoy ? "text-violet-700 dark:text-violet-300" : "text-zinc-400"
                  }`}
                >
                  {d.toLocaleDateString("es", { weekday: "short" }).replace(".", "")}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                    esHoy
                      ? "bg-violet-600 text-white"
                      : pasado
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {d.getDate()}
                </span>
              </div>

              <ul className="flex flex-col gap-1">
                {lista.map((t) => {
                  const hecha = t.estado === "hecha";
                  const vencida = estaVencida(t);
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => onSeleccionar(t.id)}
                        title={t.titulo}
                        className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-xs font-medium transition ${
                          hecha
                            ? "bg-zinc-100 text-zinc-400 line-through hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500"
                            : vencida
                              ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-200"
                              : COLOR_PRIORIDAD[t.prioridad].chip
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            hecha ? "bg-zinc-300 dark:bg-zinc-600" : vencida ? "bg-red-500" : COLOR_PRIORIDAD[t.prioridad].punto
                          }`}
                        />
                        <span className="truncate">{t.titulo}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
