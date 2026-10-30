import React, { useId } from "react";
import { MuscleId, MuscleMapMode } from "../../types";
import { MUSCLE_DEFINITIONS } from "../../data/muscles";

export interface AnatomicalBodyProps {
  selectedMuscle: MuscleId | null;
  onSelectMuscle?: (id: MuscleId) => void;
  mode?: MuscleMapMode;
  primaryMuscles?: MuscleId[];
  secondaryMuscles?: MuscleId[];
  muscleColors?: Record<
    string,
    { fill: string; stroke: string; opacity: number }
  >;
}

type Region = { id: MuscleId; paths: string[]; paired?: boolean };

// Each paired region describes the left side; the right side is mirrored.
const front: Region[] = [
  {
    id: "traps_upper",
    paired: true,
    paths: ["M108 68 L104 80 L82 87 L100 89 L117 80 L117 70 Z"],
  },
  {
    id: "deltoid_side",
    paired: true,
    paths: ["M76 88 Q62 91 59 108 L57 123 L64 128 L69 111 Z"],
  },
  {
    id: "deltoid_front",
    paired: true,
    paths: ["M79 89 Q70 99 68 112 L66 129 L75 127 L86 111 L90 95 Z"],
  },
  {
    id: "chest_upper",
    paired: true,
    paths: ["M117 86 L94 91 L85 97 L82 107 L99 103 L117 98 Z"],
  },
  {
    id: "chest_mid",
    paired: true,
    paths: ["M117 101 L98 106 L82 112 L85 129 L102 137 L117 132 Z"],
  },
  {
    id: "chest_lower",
    paired: true,
    paths: ["M87 133 L101 141 L117 136 L117 145 L102 149 L91 143 Z"],
  },
  {
    id: "biceps",
    paired: true,
    paths: ["M64 133 L73 131 L73 151 L64 173 L56 182 L52 176 L56 151 Z"],
  },
  {
    id: "forearms",
    paired: true,
    paths: ["M53 185 L61 187 L55 210 L42 248 L35 255 L33 249 L40 214 Z"],
  },
  {
    id: "abs",
    paired: true,
    paths: [
      "M117 151 L105 151 L103 166 L117 167 Z",
      "M117 172 L103 171 L104 187 L117 189 Z",
      "M117 194 L105 193 L107 209 L117 215 Z",
      "M117 220 L108 215 L110 234 L117 245 Z",
    ],
  },
  {
    id: "obliques",
    paired: true,
    paths: [
      "M96 151 L87 146 L90 170 L91 194 L97 217 L106 231 L101 203 L99 173 Z",
    ],
  },
  {
    id: "adductors",
    paired: true,
    paths: ["M110 263 L117 271 L115 298 L108 331 L104 318 L103 289 Z"],
  },
  {
    id: "quads",
    paired: true,
    paths: [
      "M90 252 L103 262 L99 294 L96 329 L90 357 L82 363 L78 349 L80 303 Z",
      "M106 269 L103 300 L101 329 L96 353 L99 370 L108 363 L112 339 L110 309 Z",
    ],
  },
  {
    id: "calves_front",
    paired: true,
    paths: [
      "M88 391 L97 392 L98 425 L94 459 L91 491 L86 493 L83 449 L80 420 Z",
    ],
  },
];

const back: Region[] = [
  {
    id: "traps_upper",
    paired: true,
    paths: ["M108 68 L104 79 L83 89 L103 97 L117 107 L117 72 Z"],
  },
  {
    id: "traps_mid_lower",
    paired: true,
    paths: ["M117 111 L102 101 L91 102 L99 127 L117 152 Z"],
  },
  {
    id: "deltoid_side",
    paired: true,
    paths: ["M76 88 Q62 91 59 108 L57 123 L64 128 L69 111 Z"],
  },
  {
    id: "deltoid_rear",
    paired: true,
    paths: ["M79 90 L91 98 L86 115 L74 129 L66 127 L69 110 Z"],
  },
  {
    id: "lats",
    paired: true,
    paths: [
      "M87 120 L98 133 L113 158 L108 192 L101 214 L91 191 L88 164 L81 140 Z",
    ],
  },
  {
    id: "triceps",
    paired: true,
    paths: ["M64 134 L74 132 L72 156 L64 176 L57 185 L52 176 L55 155 Z"],
  },
  {
    id: "forearms",
    paired: true,
    paths: ["M53 189 L61 190 L53 216 L42 249 L35 255 L33 249 L40 217 Z"],
  },
  {
    id: "lower_back",
    paired: true,
    paths: ["M117 163 L113 176 L109 202 L105 225 L117 239 Z"],
  },
  {
    id: "glutes",
    paired: true,
    paths: [
      "M102 227 L115 244 L117 262 L112 283 L98 289 L85 281 L82 268 L88 242 Z",
    ],
  },
  {
    id: "hamstrings",
    paired: true,
    paths: [
      "M85 290 L97 296 L96 320 L90 349 L83 370 L77 361 L79 331 Z",
      "M103 293 L111 288 L111 322 L107 348 L100 372 L94 367 L99 337 Z",
    ],
  },
  {
    id: "calves_back",
    paired: true,
    paths: [
      "M85 389 L92 398 L91 425 L85 446 L79 435 L77 417 Z",
      "M98 389 L102 413 L99 437 L94 447 L93 423 L94 400 Z",
    ],
  },
];

const halfBody =
  "M120 61 L109 61 L106 75 L79 84 Q64 87 58 104 L52 135 L46 166 L45 182 L35 213 L27 251 L22 268 L23 283 L28 288 L33 280 L35 267 L40 258 L50 235 L62 201 L66 182 L77 150 L83 137 L86 169 L85 195 L79 232 L76 258 L72 292 L71 329 L75 370 L76 386 L72 416 L76 452 L81 492 L78 505 L73 514 Q73 521 84 521 L96 516 L98 505 L99 484 L103 450 L108 418 L106 390 L109 370 L115 329 L117 292 L120 270 Z";

export function AnatomicalBody({
  view,
  selectedMuscle,
  onSelectMuscle,
  mode = "explore",
  primaryMuscles = [],
  secondaryMuscles = [],
  muscleColors = {},
}: AnatomicalBodyProps & { view: "front" | "back" }) {
  const gradientId = useId().replace(/:/g, "");
  const styleFor = (id: MuscleId): React.CSSProperties => {
    const selected = selectedMuscle === id;
    const analysis = mode === "analysis" ? muscleColors[id] : undefined;
    const primary = mode === "guide" && primaryMuscles.includes(id);
    const secondary = mode === "guide" && secondaryMuscles.includes(id);
    return {
      fill:
        selected || primary
          ? "#FF806B"
          : secondary
            ? "#E9AB87"
            : (analysis?.fill ?? "#727781"),
      stroke: selected ? "#B4F34C" : "#24252A",
      strokeWidth: selected ? 2 : 1.5,
      // Keep the full body legible even when a heatmap assigns a low opacity.
      opacity: analysis && !selected ? Math.max(0.55, analysis.opacity) : 1,
      strokeLinejoin: "round",
      cursor: onSelectMuscle ? "pointer" : "default",
      transition: "fill 180ms ease, stroke 180ms ease",
    };
  };
  return (
    <svg
      viewBox="0 0 240 540"
      className="w-full h-auto max-h-[580px] select-none"
      aria-label={`인체 ${view === "front" ? "전면" : "후면"} 근육 지도`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#555A64" />
          <stop offset="1" stopColor="#383C44" />
        </linearGradient>
      </defs>
      <g
        fill={`url(#${gradientId})`}
        stroke="#8A8F99"
        strokeWidth="1"
        strokeLinejoin="round"
      >
        <path d={halfBody} />
        <path d={halfBody} transform="translate(240 0) scale(-1 1)" />
        <path d="M102 30 Q101 11 120 10 Q139 11 138 30 L136 44 Q131 59 120 62 Q109 59 104 44 Z" />
      </g>
      <g
        fill="none"
        stroke="#9297A0"
        strokeWidth="1"
        opacity="0.6"
        pointerEvents="none"
      >
        <path d="M110 65 L109 77 M130 65 L131 77 M80 378 Q87 370 99 379 M141 379 Q153 370 160 378 M84 493 L95 494 M145 494 L156 493" />
        {view === "front" ? (
          <path d="M113 43 Q120 46 127 43 M120 31 L118 38 L122 38" />
        ) : (
          <path d="M120 77 L120 233" />
        )}
      </g>
      {(view === "front" ? front : back).map((region) => (
        <g
          key={region.id}
          data-muscle-id={region.id}
          role={onSelectMuscle ? "button" : undefined}
          tabIndex={onSelectMuscle ? 0 : undefined}
          aria-label={MUSCLE_DEFINITIONS[region.id].nameKo}
          aria-pressed={
            onSelectMuscle ? selectedMuscle === region.id : undefined
          }
          onClick={() => onSelectMuscle?.(region.id)}
          onKeyDown={(event) => {
            if (
              onSelectMuscle &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              onSelectMuscle(region.id);
            }
          }}
          className="outline-none hover:brightness-110 focus-visible:brightness-125"
          style={styleFor(region.id)}
        >
          <title>{MUSCLE_DEFINITIONS[region.id].nameKo}</title>
          {region.paths.map((path, index) => (
            <React.Fragment key={index}>
              <path d={path} />
              {region.paired && (
                <path d={path} transform="translate(240 0) scale(-1 1)" />
              )}
            </React.Fragment>
          ))}
        </g>
      ))}
      <g
        fill="none"
        stroke="#24252A"
        strokeWidth="0.8"
        opacity="0.45"
        pointerEvents="none"
      >
        {view === "front" ? (
          <path d="M91 117 L112 115 M94 126 L112 123 M128 115 L149 117 M128 123 L146 126 M85 278 L83 333 M155 278 L157 333 M54 208 L41 246 M186 208 L199 246" />
        ) : (
          <path d="M87 140 L105 169 M89 154 L103 180 M153 140 L135 169 M151 154 L137 180 M91 251 Q101 253 110 266 M149 251 Q139 253 130 266 M83 303 L82 342 M157 303 L158 342" />
        )}
      </g>
    </svg>
  );
}
