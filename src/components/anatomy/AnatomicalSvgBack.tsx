import React from 'react';
import { MuscleId, MuscleMapMode } from '../../types';

interface AnatomicalSvgBackProps {
  selectedMuscle: MuscleId | null;
  onSelectMuscle?: (muscleId: MuscleId) => void;
  mode?: MuscleMapMode;
  primaryMuscles?: MuscleId[];
  secondaryMuscles?: MuscleId[];
  muscleColors?: Record<string, { fill: string; stroke: string; opacity: number }>;
}

export const AnatomicalSvgBack: React.FC<AnatomicalSvgBackProps> = ({
  selectedMuscle,
  onSelectMuscle,
  mode = 'explore',
  primaryMuscles = [],
  secondaryMuscles = [],
  muscleColors = {},
}) => {
  const getMuscleStyle = (muscleId: MuscleId) => {
    // If analysis mode has computed colors
    if (mode === 'analysis' && muscleColors[muscleId]) {
      const c = muscleColors[muscleId];
      const isSelected = selectedMuscle === muscleId;
      return {
        fill: isSelected ? '#FF806B' : c.fill,
        stroke: isSelected ? '#B4F34C' : c.stroke,
        strokeWidth: isSelected ? 3 : 1.5,
        opacity: isSelected ? 1 : c.opacity,
        cursor: onSelectMuscle ? 'pointer' : 'default',
        filter: isSelected ? 'drop-shadow(0px 0px 8px rgba(255, 128, 107, 0.7))' : undefined,
        transition: 'all 0.25s ease',
      };
    }

    // Guide mode for active exercise
    if (mode === 'guide') {
      const isPrimary = primaryMuscles.includes(muscleId);
      const isSecondary = secondaryMuscles.includes(muscleId);
      const isSelected = selectedMuscle === muscleId;

      if (isPrimary) {
        return {
          fill: '#FF806B',
          stroke: '#FF9E8D',
          strokeWidth: 2,
          opacity: 1,
          filter: 'drop-shadow(0px 0px 6px rgba(255, 128, 107, 0.8))',
          cursor: onSelectMuscle ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        };
      }
      if (isSecondary) {
        return {
          fill: '#E9AB87',
          stroke: '#F4C5A9',
          strokeWidth: 1.5,
          opacity: 0.9,
          cursor: onSelectMuscle ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        };
      }
      return {
        fill: isSelected ? '#363D36' : '#222825',
        stroke: '#363D36',
        strokeWidth: 1,
        opacity: 0.5,
        cursor: onSelectMuscle ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      };
    }

    // Explore mode (Default)
    const isSelected = selectedMuscle === muscleId;
    if (isSelected) {
      return {
        fill: '#FF806B',
        stroke: '#B4F34C',
        strokeWidth: 3,
        opacity: 1,
        filter: 'drop-shadow(0px 0px 10px rgba(255, 128, 107, 0.8))',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      };
    }

    return {
      fill: '#262D29',
      stroke: '#3B443F',
      strokeWidth: 1.2,
      opacity: 0.85,
      cursor: onSelectMuscle ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
    };
  };

  const handleMuscleClick = (id: MuscleId) => {
    if (onSelectMuscle) onSelectMuscle(id);
  };

  return (
    <svg
      viewBox="0 0 400 800"
      className="w-full h-auto max-h-[580px] select-none"
      aria-label="인체 후면 근육 지도"
    >
      <defs>
        <pattern id="grid-pattern-back" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1D211E" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width="400" height="800" fill="url(#grid-pattern-back)" opacity="0.4" />

      {/* Anatomical Body Silhouette Underlay */}
      <g opacity="0.15" fill="#363D36">
        {/* Head & Neck */}
        <ellipse cx="200" cy="70" rx="36" ry="46" />
        <path d="M 184 110 L 216 110 L 224 140 L 176 140 Z" />
        {/* Hands */}
        <ellipse cx="78" cy="455" rx="14" ry="24" />
        <ellipse cx="322" cy="455" rx="14" ry="24" />
        {/* Feet */}
        <ellipse cx="155" cy="770" rx="18" ry="12" />
        <ellipse cx="245" cy="770" rx="18" ry="12" />
      </g>

      {/* Head Back / Occiput */}
      <g fill="#1A1F1C" stroke="#363D36" strokeWidth="1.2">
        <path d="M 166 70 C 166 45, 234 45, 234 70 C 234 94, 218 116, 200 118 C 182 116, 166 94, 166 70 Z" />
      </g>

      {/* Spine vertical midline indicator */}
      <path d="M 200 120 L 200 370" stroke="#363D36" strokeWidth="1" strokeDasharray="3 3" />

      {/* ================= UPPER TRAPEZIUS (상부 승모근) ================= */}
      <g
        id="back-traps_upper"
        onClick={() => handleMuscleClick('traps_upper')}
        role="button"
        tabIndex={0}
        aria-label="상부 승모근"
        className="hover:brightness-125"
      >
        <path
          d="M 200 114 L 182 114 C 168 122, 146 136, 134 148 L 160 148 L 200 144 L 240 148 L 266 148 C 254 136, 232 122, 218 114 Z"
          style={getMuscleStyle('traps_upper')}
        />
      </g>

      {/* ================= MID & LOWER TRAPEZIUS / RHOMBOIDS (중·하부 승모근) ================= */}
      <g
        id="back-traps_mid_lower"
        onClick={() => handleMuscleClick('traps_mid_lower')}
        role="button"
        tabIndex={0}
        aria-label="중·하부 승모근 및 능형근"
        className="hover:brightness-125"
      >
        <path
          d="M 200 146 L 162 150 C 158 174, 162 202, 174 228 L 200 248 L 226 228 C 238 202, 242 174, 238 150 Z"
          style={getMuscleStyle('traps_mid_lower')}
        />
      </g>

      {/* ================= SHOULDERS / DELTOIDS ================= */}
      {/* Rear Deltoids (후면 삼각근) */}
      <g
        id="back-deltoid_rear"
        onClick={() => handleMuscleClick('deltoid_rear')}
        role="button"
        tabIndex={0}
        aria-label="후면 삼각근"
        className="hover:brightness-125"
      >
        {/* Left Rear Deltoid */}
        <path
          d="M 132 150 C 122 154, 114 168, 114 186 C 118 200, 128 208, 138 206 C 146 196, 154 178, 158 160 Z"
          style={getMuscleStyle('deltoid_rear')}
        />
        {/* Right Rear Deltoid */}
        <path
          d="M 268 150 C 278 154, 286 168, 286 186 C 282 200, 272 208, 262 206 C 254 196, 246 178, 242 160 Z"
          style={getMuscleStyle('deltoid_rear')}
        />
      </g>

      {/* Side Deltoids (측면 삼각근 후면 뷰) */}
      <g
        id="back-deltoid_side"
        onClick={() => handleMuscleClick('deltoid_side')}
        role="button"
        tabIndex={0}
        aria-label="측면 삼각근"
        className="hover:brightness-125"
      >
        {/* Left Side Deltoid */}
        <path
          d="M 130 150 C 114 156, 102 170, 100 188 C 98 200, 104 210, 114 214 C 114 198, 118 180, 128 164 Z"
          style={getMuscleStyle('deltoid_side')}
        />
        {/* Right Side Deltoid */}
        <path
          d="M 270 150 C 286 156, 298 170, 300 188 C 302 200, 296 210, 286 214 C 286 198, 282 180, 272 164 Z"
          style={getMuscleStyle('deltoid_side')}
        />
      </g>

      {/* ================= LATS (광배근) ================= */}
      <g
        id="back-lats"
        onClick={() => handleMuscleClick('lats')}
        role="button"
        tabIndex={0}
        aria-label="광배근"
        className="hover:brightness-125"
      >
        {/* Left Latissimus Dorsi */}
        <path
          d="M 158 170 C 146 190, 138 226, 142 270 C 146 304, 158 334, 176 348 C 182 320, 186 280, 186 244 C 172 222, 162 196, 158 170 Z"
          style={getMuscleStyle('lats')}
        />
        {/* Right Latissimus Dorsi */}
        <path
          d="M 242 170 C 254 190, 262 226, 258 270 C 254 304, 242 334, 224 348 C 218 320, 214 280, 214 244 C 228 222, 238 196, 242 170 Z"
          style={getMuscleStyle('lats')}
        />
      </g>

      {/* ================= ARMS (팔 후면) ================= */}
      {/* Triceps (삼두근) */}
      <g
        id="back-triceps"
        onClick={() => handleMuscleClick('triceps')}
        role="button"
        tabIndex={0}
        aria-label="삼두근"
        className="hover:brightness-125"
      >
        {/* Left Triceps */}
        <path
          d="M 112 216 C 102 228, 98 252, 102 278 C 108 284, 118 286, 126 278 C 132 254, 130 232, 124 214 Z"
          style={getMuscleStyle('triceps')}
        />
        {/* Right Triceps */}
        <path
          d="M 288 216 C 298 228, 302 252, 298 278 C 292 284, 282 286, 274 278 C 268 254, 270 232, 276 214 Z"
          style={getMuscleStyle('triceps')}
        />
      </g>

      {/* Forearms (전완근 후면) */}
      <g
        id="back-forearms"
        onClick={() => handleMuscleClick('forearms')}
        role="button"
        tabIndex={0}
        aria-label="전완근"
        className="hover:brightness-125"
      >
        {/* Left Forearm */}
        <path
          d="M 104 286 C 94 298, 84 334, 80 380 C 80 402, 88 410, 94 412 C 102 390, 110 348, 118 292 Z"
          style={getMuscleStyle('forearms')}
        />
        {/* Right Forearm */}
        <path
          d="M 296 286 C 306 298, 316 334, 320 380 C 320 402, 312 410, 306 412 C 298 390, 290 348, 282 292 Z"
          style={getMuscleStyle('forearms')}
        />
      </g>

      {/* ================= LOWER BACK (척추기립근) ================= */}
      <g
        id="back-lower_back"
        onClick={() => handleMuscleClick('lower_back')}
        role="button"
        tabIndex={0}
        aria-label="척추기립근"
        className="hover:brightness-125"
      >
        {/* Left Erector Spinae */}
        <path
          d="M 198 252 L 186 252 C 182 286, 178 326, 176 360 L 198 368 Z"
          style={getMuscleStyle('lower_back')}
        />
        {/* Right Erector Spinae */}
        <path
          d="M 202 252 L 214 252 C 218 286, 222 326, 224 360 L 202 368 Z"
          style={getMuscleStyle('lower_back')}
        />
      </g>

      {/* ================= GLUTES (둔근 / 엉덩이) ================= */}
      <g
        id="back-glutes"
        onClick={() => handleMuscleClick('glutes')}
        role="button"
        tabIndex={0}
        aria-label="둔근"
        className="hover:brightness-125"
      >
        {/* Left Gluteus */}
        <path
          d="M 198 372 L 168 366 C 148 376, 138 402, 138 434 C 138 460, 156 478, 180 478 C 190 478, 196 462, 198 440 Z"
          style={getMuscleStyle('glutes')}
        />
        {/* Right Gluteus */}
        <path
          d="M 202 372 L 232 366 C 252 376, 262 402, 262 434 C 262 460, 244 478, 220 478 C 210 478, 204 462, 202 440 Z"
          style={getMuscleStyle('glutes')}
        />
      </g>

      {/* ================= HAMSTRINGS (햄스트링) ================= */}
      <g
        id="back-hamstrings"
        onClick={() => handleMuscleClick('hamstrings')}
        role="button"
        tabIndex={0}
        aria-label="햄스트링"
        className="hover:brightness-125"
      >
        {/* Left Hamstring Group */}
        <path
          d="M 180 482 C 160 482, 142 498, 138 528 C 134 554, 142 574, 158 584 C 170 588, 184 578, 190 560 C 194 532, 192 504, 186 482 Z"
          style={getMuscleStyle('hamstrings')}
        />
        {/* Right Hamstring Group */}
        <path
          d="M 220 482 C 240 482, 258 498, 262 528 C 266 554, 258 574, 242 584 C 230 588, 216 578, 210 560 C 206 532, 208 504, 214 482 Z"
          style={getMuscleStyle('hamstrings')}
        />
      </g>

      {/* Knee Back / Popliteal Fossa */}
      <circle cx="166" cy="594" r="8" fill="#1E2420" stroke="#363D36" strokeWidth="1" />
      <circle cx="234" cy="594" r="8" fill="#1E2420" stroke="#363D36" strokeWidth="1" />

      {/* ================= CALVES BACK (종아리 비복근·가자미근) ================= */}
      <g
        id="back-calves_back"
        onClick={() => handleMuscleClick('calves_back')}
        role="button"
        tabIndex={0}
        aria-label="종아리 비복근 및 가자미근"
        className="hover:brightness-125"
      >
        {/* Left Calf */}
        <path
          d="M 166 606 C 150 618, 140 644, 140 674 C 140 706, 150 736, 160 746 C 168 746, 174 722, 174 686 C 174 648, 172 620, 168 606 Z"
          style={getMuscleStyle('calves_back')}
        />
        {/* Right Calf */}
        <path
          d="M 234 606 C 250 618, 260 644, 260 674 C 260 706, 250 736, 240 746 C 232 746, 226 722, 226 686 C 226 648, 228 620, 232 606 Z"
          style={getMuscleStyle('calves_back')}
        />
      </g>
    </svg>
  );
};
