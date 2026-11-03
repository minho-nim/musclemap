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
    paths: ["M108 68 Q108 77 102 81 Q91 83 82 88 Q100 88 117 80 L117 70 Z"],
  },
  {
    id: "deltoid_side",
    paired: true,
    paths: ["M77 87 C65 87 59 96 57 108 Q55 120 60 127 Q65 128 67 118 C68 106 71 96 77 87 Z"],
  },
  {
    id: "deltoid_front",
    paired: true,
    paths: ["M79 89 C71 93 68 105 67 115 Q65 126 69 130 Q77 128 83 117 Q89 106 89 97 Z"],
  },
  {
    id: "chest_upper",
    paired: true,
    paths: ["M117 87 Q103 87 94 92 Q85 95 83 105 Q99 102 117 99 Z"],
  },
  {
    id: "chest_mid",
    paired: true,
    paths: ["M117 102 C105 102 91 106 83 110 Q82 125 91 132 Q104 141 117 132 Z"],
  },
  {
    id: "chest_lower",
    paired: true,
    paths: ["M87 133 Q101 143 117 135 L117 144 Q107 150 98 146 Q91 143 87 133 Z"],
  },
  {
    id: "biceps",
    paired: true,
    paths: ["M65 132 Q73 128 74 139 C75 152 65 175 57 182 Q51 183 52 174 C54 159 57 141 65 132 Z"],
  },
  {
    id: "forearms",
    paired: true,
    paths: ["M53 185 Q58 183 61 188 C57 207 47 233 39 252 Q34 258 33 251 C35 229 43 202 53 185 Z"],
  },
  {
    id: "abs",
    paired: true,
    paths: [
      "M117 152 Q110 148 105 153 Q101 160 104 166 Q110 170 117 167 Z",
      "M117 174 Q108 170 104 174 Q101 180 105 187 Q110 191 117 188 Z",
      "M117 196 Q110 191 106 195 Q104 203 109 210 Q113 215 117 214 Z",
      "M117 220 Q112 220 108 216 Q108 234 117 245 Z",
    ],
  },
  {
    id: "obliques",
    paired: true,
    paths: [
      "M96 151 Q91 150 86 145 Q91 168 90 185 Q90 210 106 231 Q100 209 100 188 Q102 167 96 151 Z",
    ],
  },
  {
    id: "adductors",
    paired: true,
    paths: ["M110 263 Q117 266 117 278 C116 298 111 319 108 331 Q102 315 103 294 Q104 275 110 263 Z"],
  },
  {
    id: "quads",
    paired: true,
    paths: [
      "M90 252 Q99 254 103 263 C100 286 98 313 94 335 Q90 356 83 363 C75 353 77 328 79 307 Q81 275 90 252 Z",
      "M106 269 C111 280 113 310 112 332 Q112 355 106 366 Q102 372 99 369 Q94 360 98 348 C104 324 100 297 106 269 Z",
    ],
  },
  {
    id: "calves_front",
    paired: true,
    paths: [
      "M88 391 Q94 387 98 395 C101 423 95 452 93 472 L91 491 Q89 496 86 492 C85 470 82 449 80 431 Q77 408 88 391 Z",
    ],
  },
];

const back: Region[] = [
  {
    id: "traps_upper",
    paired: true,
    paths: ["M108 68 Q108 76 103 81 Q91 84 83 89 Q101 94 117 107 L117 72 Z"],
  },
  {
    id: "traps_mid_lower",
    paired: true,
    paths: ["M117 111 Q103 100 92 102 Q94 117 103 131 Q110 144 117 152 Z"],
  },
  {
    id: "deltoid_side",
    paired: true,
    paths: ["M76 88 Q62 91 59 108 L57 123 L64 128 L69 111 Z"],
  },
  {
    id: "deltoid_rear",
    paired: true,
    paths: ["M79 90 Q86 92 91 98 C89 112 80 125 71 129 Q65 131 66 123 Q67 101 79 90 Z"],
  },
  {
    id: "lats",
    paired: true,
    paths: [
      "M86 119 Q93 128 100 138 Q107 149 113 158 C112 178 108 202 101 214 Q91 197 89 181 Q90 159 81 140 Z",
    ],
  },
  {
    id: "triceps",
    paired: true,
    paths: ["M65 134 Q72 130 74 135 C76 150 65 176 57 185 Q51 183 52 174 C54 157 57 141 65 134 Z"],
  },
  {
    id: "forearms",
    paired: true,
    paths: ["M53 189 Q58 186 61 191 C56 211 46 237 39 252 Q35 257 33 250 C35 227 44 202 53 189 Z"],
  },
  {
    id: "lower_back",
    paired: true,
    paths: ["M117 163 C112 179 114 204 105 225 Q110 234 117 239 Z"],
  },
  {
    id: "glutes",
    paired: true,
    paths: [
      "M102 227 C111 234 118 246 117 260 C117 274 113 286 102 289 C90 293 81 281 82 269 Q84 245 102 227 Z",
    ],
  },
  {
    id: "hamstrings",
    paired: true,
    paths: [
      "M85 291 Q91 296 97 296 C98 314 91 345 84 368 Q81 373 78 364 C74 344 79 310 85 291 Z",
      "M103 294 Q108 292 111 288 C115 313 110 344 101 369 Q98 374 94 367 C95 347 104 323 103 294 Z",
    ],
  },
  {
    id: "calves_back",
    paired: true,
    paths: [
      "M85 389 Q93 391 93 406 C94 423 90 441 85 447 Q79 443 77 431 C74 412 78 396 85 389 Z",
      "M98 389 C105 402 105 420 101 434 Q99 444 94 447 C91 430 92 405 98 389 Z",
    ],
  },
];

const halfBody = "M120 61 Q114 62 109 60 Q109 70 105 76 C94 81 84 82 75 86 Q61 89 57 105 C52 123 52 142 46 161 Q42 173 45 184 C39 204 31 226 28 248 Q26 261 22 270 Q20 280 24 286 Q26 291 29 286 L32 275 Q35 270 37 260 C49 241 61 207 66 184 Q72 165 77 153 L83 137 C84 156 88 175 85 195 Q81 219 78 239 C72 262 71 294 72 324 Q73 348 76 368 Q78 380 76 391 C70 408 73 430 77 451 Q81 474 82 492 L79 505 Q77 508 73 513 Q69 521 80 522 Q87 522 95 517 Q99 513 98 502 C98 479 102 450 107 424 Q110 405 106 390 Q107 380 110 367 C114 342 117 315 117 291 Q117 276 120 270 Z";

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
      strokeWidth: selected ? 1.8 : 0.8,
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
