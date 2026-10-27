"use client";

import { aISO, inicioSemana, sumarDias, type Tarea } from "../lib/tareas";

type Etapa = "huevo" | "cria" | "joven" | "alada" | "legendaria";

// Porcentaje mínimo de tareas hechas para llegar a cada etapa
const ETAPAS: { id: Etapa; nombre: string; desde: number }[] = [
  { id: "huevo", nombre: "Huevo", desde: 0 },
  { id: "cria", nombre: "Cría", desde: 25 },
  { id: "joven", nombre: "Joven", desde: 50 },
  { id: "alada", nombre: "Alada", desde: 75 },
  { id: "legendaria", nombre: "Legendaria", desde: 100 },
];

const MENSAJES: Record<Etapa, string> = {
  huevo: "Me cuesta salir del huevo… ¿hacemos una tarea?",
  cria: "Zzz… ya nací, pero tengo sueño. ¡Despiértame con más tareas!",
  joven: "¡Vamos súper bien! Ya pasamos la mitad.",
  alada: "¡Me salieron alas! Estamos imparables.",
  legendaria: "¡Semana perfecta! Soy legendaria gracias a ti.",
};

// Animación en reposo de cada etapa (keyframes en globals.css)
const ANIMACION: Record<Etapa, string> = {
  huevo: "motion-safe:animate-[tambalear_2.4s_ease-in-out_infinite]",
  cria: "motion-safe:animate-[respirar_3s_ease-in-out_infinite]",
  joven: "motion-safe:animate-[saltar_1.6s_ease-in-out_infinite]",
  alada: "motion-safe:animate-[flotar_2.6s_ease-in-out_infinite]",
  legendaria: "motion-safe:animate-[flotar_2.2s_ease-in-out_infinite]",
};

// Centro horizontal de cada dibujo dentro del lienzo compartido
const CENTRO: Record<Etapa, number> = { huevo: 100, cria: 220, joven: 340, alada: 460, legendaria: 580 };

interface Props {
  tareas: Tarea[];
  // Aumenta cada vez que se completa una tarea, para que Chispi celebre
  celebraciones: number;
}

export default function Mascota({ tareas, celebraciones }: Props) {
  const lunes = inicioSemana(new Date());
  const desde = aISO(lunes);
  const hasta = aISO(sumarDias(lunes, 6));
  const deLaSemana = tareas.filter((t) => t.fechaLimite !== null && t.fechaLimite >= desde && t.fechaLimite <= hasta);
  const total = deLaSemana.length;
  const hechas = deLaSemana.filter((t) => t.estado === "hecha").length;
  const porcentaje = total === 0 ? 0 : Math.round((hechas / total) * 100);

  const indice = total === 0 ? 0 : ETAPAS.filter((e) => porcentaje >= e.desde).length - 1;
  const etapa = ETAPAS[indice];
  const siguiente = ETAPAS[indice + 1];
  const faltan = siguiente ? Math.ceil((siguiente.desde / 100) * total) - hechas : 0;

  const mensaje = total === 0 ? "Agrega tareas con fecha para esta semana y ayúdame a nacer." : MENSAJES[etapa.id];

  return (
    <section className="flex items-center gap-4 rounded-3xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:gap-6 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
      <div
        key={`${etapa.id}-${celebraciones}`}
        className={`h-24 w-24 shrink-0 sm:h-32 sm:w-32 ${
          celebraciones > 0
            ? "motion-safe:animate-[celebrar_0.9s_ease-out]"
            : "motion-safe:animate-[aparecer_0.5s_ease-out]"
        }`}
      >
        <svg
          viewBox={`${CENTRO[etapa.id] - 70} 62 140 124`}
          className={`h-full w-full origin-bottom ${ANIMACION[etapa.id]}`}
          role="img"
          aria-label={`Chispi en etapa ${etapa.nombre}`}
        >
          <Dibujo etapa={etapa.id} />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Chispi</h2>
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Etapa {indice + 1} · {etapa.nombre}
          </span>
        </div>
        <p className="mt-1 text-sm leading-snug text-zinc-600 dark:text-zinc-300">“{mensaje}”</p>

        <div className="mt-3">
          <div
            className="relative h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
            role="progressbar"
            aria-valuenow={porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tareas de la semana completadas"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 transition-[width] duration-700"
              style={{ width: `${porcentaje}%` }}
            />
            {[25, 50, 75].map((m) => (
              <span key={m} className="absolute inset-y-0 w-0.5 bg-white/80 dark:bg-zinc-900/80" style={{ left: `${m}%` }} />
            ))}
          </div>
          <p className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {hechas} de {total} {total === 1 ? "tarea" : "tareas"} de la semana · {porcentaje} %
            </span>
            {total > 0 && (
              <span className="font-medium text-violet-600 dark:text-violet-400">
                {siguiente
                  ? `${faltan === 1 ? "Falta 1 tarea" : `Faltan ${faltan} tareas`} para evolucionar`
                  : "¡Nivel máximo!"}
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function Destello({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <path
      d={`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`}
      fill="#f5c542"
    />
  );
}

function Dibujo({ etapa }: { etapa: Etapa }) {
  switch (etapa) {
    case "huevo":
      return (
        <g>
          <ellipse cx="100" cy="176" rx="34" ry="6" fill="#8b7fb0" opacity="0.25" />
          <path
            d="M100 92 C76 92 68 128 68 146 C68 166 82 176 100 176 C118 176 132 166 132 146 C132 128 124 92 100 92 Z"
            fill="#f3efe4"
            stroke="#bdb4cf"
            strokeWidth="1.5"
          />
          <circle cx="86" cy="118" r="6" fill="#c9b8f0" />
          <circle cx="116" cy="140" r="8" fill="#c9b8f0" />
          <circle cx="92" cy="162" r="5" fill="#c9b8f0" />
          <path d="M76 132 L86 128 L92 136 L100 129 L108 136 L116 130 L124 134" fill="none" stroke="#8a7fa3" strokeWidth="1.5" />
          <path d="M90 144 Q93 141 96 144" fill="none" stroke="#4b4060" strokeWidth="2" strokeLinecap="round" />
          <path d="M104 144 Q107 141 110 144" fill="none" stroke="#4b4060" strokeWidth="2" strokeLinecap="round" />
          <path d="M95 154 Q100 151 105 154" fill="none" stroke="#4b4060" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    case "cria":
      return (
        <g>
          <ellipse cx="220" cy="176" rx="30" ry="6" fill="#8b7fb0" opacity="0.25" />
          <ellipse cx="220" cy="152" rx="28" ry="24" fill="#b9a3f5" />
          <path d="M220 128 C220 120 216 116 210 114 C214 122 216 126 220 128 Z" fill="#6fcf8a" />
          <path d="M207 150 L215 150" stroke="#3d2f63" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M225 150 L233 150" stroke="#3d2f63" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="220" cy="161" rx="3" ry="2" fill="#3d2f63" />
          <text x="248" y="126" fontSize="12" fontWeight="600" fill="#8b7fb0">z</text>
          <text x="256" y="114" fontSize="14" fontWeight="600" fill="#8b7fb0">z</text>
        </g>
      );
    case "joven":
      return (
        <g>
          <ellipse cx="340" cy="176" rx="40" ry="7" fill="#8b7fb0" opacity="0.25" />
          <path d="M310 128 Q298 112 302 100" fill="none" stroke="#9b7ff0" strokeWidth="7" strokeLinecap="round" />
          <path d="M370 128 Q382 112 378 100" fill="none" stroke="#9b7ff0" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="340" cy="142" rx="36" ry="33" fill="#9b7ff0" />
          <ellipse cx="340" cy="152" rx="20" ry="16" fill="#cfc0fa" />
          <path d="M340 110 C338 98 330 92 322 92 C326 102 332 108 340 110 Z" fill="#4fbf72" />
          <path d="M340 110 C342 98 350 92 358 92 C354 102 348 108 340 110 Z" fill="#6fcf8a" />
          <circle cx="327" cy="134" r="5" fill="#2b1f4d" />
          <circle cx="353" cy="134" r="5" fill="#2b1f4d" />
          <circle cx="329" cy="132" r="1.6" fill="#fff" />
          <circle cx="355" cy="132" r="1.6" fill="#fff" />
          <path d="M331 146 Q340 155 349 146" fill="none" stroke="#2b1f4d" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="318" cy="145" r="4" fill="#f4a6c8" />
          <circle cx="362" cy="145" r="4" fill="#f4a6c8" />
        </g>
      );
    case "alada":
      return (
        <g>
          <ellipse cx="460" cy="180" rx="46" ry="5" fill="#8b7fb0" opacity="0.25" />
          <path d="M424 128 C396 108 400 88 412 84 C414 100 424 110 434 118 Z" fill="#c9b8f0" />
          <path d="M496 128 C524 108 520 88 508 84 C506 100 496 110 486 118 Z" fill="#c9b8f0" />
          <ellipse cx="460" cy="138" rx="40" ry="38" fill="#7c5ce6" />
          <ellipse cx="460" cy="150" rx="23" ry="20" fill="#cfc0fa" />
          <path d="M436 108 L430 86 L446 102 Z" fill="#7c5ce6" />
          <path d="M484 108 L490 86 L474 102 Z" fill="#7c5ce6" />
          <path d="M460 100 C456 88 448 82 440 82 C444 92 452 98 460 100 Z" fill="#3fae63" />
          <path d="M460 100 C464 88 472 82 480 82 C476 92 468 98 460 100 Z" fill="#4fbf72" />
          <path d="M440 128 Q446 122 452 128" fill="none" stroke="#1f1440" strokeWidth="3" strokeLinecap="round" />
          <path d="M468 128 Q474 122 480 128" fill="none" stroke="#1f1440" strokeWidth="3" strokeLinecap="round" />
          <path d="M448 142 Q460 156 472 142 Z" fill="#1f1440" />
          <circle cx="434" cy="140" r="5" fill="#f4a6c8" />
          <circle cx="486" cy="140" r="5" fill="#f4a6c8" />
          <Destello x={514} y={100} r={7} />
        </g>
      );
    case "legendaria":
      return (
        <g>
          <ellipse cx="580" cy="182" rx="50" ry="5" fill="#d9a520" opacity="0.3" />
          <circle cx="580" cy="128" r="54" fill="none" stroke="#f5c542" strokeWidth="2" strokeDasharray="3 6" />
          <path d="M538 130 C504 104 512 78 528 74 C530 94 542 108 554 116 Z" fill="#f7e3a1" />
          <path d="M622 130 C656 104 648 78 632 74 C630 94 618 108 606 116 Z" fill="#f7e3a1" />
          <ellipse cx="580" cy="138" rx="42" ry="40" fill="#5b3cc4" />
          <ellipse cx="580" cy="152" rx="24" ry="21" fill="#e4dafd" />
          <path d="M556 106 L548 82 L566 100 Z" fill="#5b3cc4" />
          <path d="M604 106 L612 82 L594 100 Z" fill="#5b3cc4" />
          <path d="M562 98 L562 78 L571 88 L580 74 L589 88 L598 78 L598 98 Z" fill="#f5c542" stroke="#d9a520" strokeWidth="1" />
          <circle cx="580" cy="86" r="3" fill="#e2557a" />
          <circle cx="564" cy="128" r="5" fill="#1f1440" />
          <circle cx="596" cy="128" r="5" fill="#1f1440" />
          <circle cx="566" cy="126" r="1.8" fill="#fff" />
          <circle cx="598" cy="126" r="1.8" fill="#fff" />
          <path d="M568 142 Q580 156 592 142 Z" fill="#1f1440" />
          <circle cx="553" cy="140" r="5" fill="#f4a6c8" />
          <circle cx="607" cy="140" r="5" fill="#f4a6c8" />
          <Destello x={532} y={76} r={6} />
          <Destello x={632} y={164} r={5} />
          <Destello x={628} y={84} r={4} />
        </g>
      );
  }
}
