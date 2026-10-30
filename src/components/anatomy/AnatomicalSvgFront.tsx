import React from 'react';
import { MuscleId, MuscleMapMode } from '../../types';

interface AnatomicalSvgFrontProps {
  selectedMuscle: MuscleId | null;
  onSelectMuscle?: (muscleId: MuscleId) => void;
  mode?: MuscleMapMode;
  primaryMuscles?: MuscleId[];
  secondaryMuscles?: MuscleId[];
  muscleColors?: Record<string, { fill: string; stroke: string; opacity: number }>;
}

export const AnatomicalSvgFront: React.FC<AnatomicalSvgFrontProps> = ({
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
      aria-label="인체 전면 근육 지도"
    >
      <defs>
        {/* Subtle grid pattern background */}
        <pattern id="grid-pattern-front" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1D211E" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width="400" height="800" fill="url(#grid-pattern-front)" opacity="0.4" />

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

      {/* Head & Face Contour */}
      <g fill="#1A1F1C" stroke="#363D36" strokeWidth="1.2">
        <path d="M 166 70 C 166 45, 234 45, 234 70 C 234 94, 218 116, 200 118 C 182 116, 166 94, 166 70 Z" />
        {/* Collar bones / Clavicle lines */}
        <path d="M 200 136 L 152 142 M 200 136 L 248 142" stroke="#4B5650" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* ================= TRAPEZIUS (상부 승모근) ================= */}
      <g
        id="front-traps_upper"
        onClick={() => handleMuscleClick('traps_upper')}
        role="button"
        tabIndex={0}
        aria-label="상부 승모근"
        className="hover:brightness-125"
      >
        {/* Left Upper Trap */}
        <path
          d="M 180 114 C 168 122, 150 134, 134 146 C 146 146, 162 144, 178 140 Z"
          style={getMuscleStyle('traps_upper')}
        />
        {/* Right Upper Trap */}
        <path
          d="M 220 114 C 232 122, 250 134, 266 146 C 254 146, 238 144, 222 140 Z"
          style={getMuscleStyle('traps_upper')}
        />
      </g>

      {/* ================= SHOULDERS / DELTOIDS ================= */}
      {/* Front Deltoid (전면 삼각근) */}
      <g
        id="front-deltoid_front"
        onClick={() => handleMuscleClick('deltoid_front')}
        role="button"
        tabIndex={0}
        aria-label="전면 삼각근"
        className="hover:brightness-125"
      >
        {/* Left Front Deltoid */}
        <path
          d="M 132 148 C 120 152, 114 168, 114 186 C 118 198, 126 206, 134 208 C 138 196, 140 180, 138 160 Z"
          style={getMuscleStyle('deltoid_front')}
        />
        {/* Right Front Deltoid */}
        <path
          d="M 268 148 C 280 152, 286 168, 286 186 C 282 198, 274 206, 266 208 C 262 196, 260 180, 262 160 Z"
          style={getMuscleStyle('deltoid_front')}
        />
      </g>

      {/* Side Deltoid (측면 삼각근) */}
      <g
        id="front-deltoid_side"
        onClick={() => handleMuscleClick('deltoid_side')}
        role="button"
        tabIndex={0}
        aria-label="측면 삼각근"
        className="hover:brightness-125"
      >
        {/* Left Side Deltoid */}
        <path
          d="M 130 148 C 114 154, 102 168, 100 186 C 98 198, 104 208, 114 212 C 114 196, 118 178, 128 162 Z"
          style={getMuscleStyle('deltoid_side')}
        />
        {/* Right Side Deltoid */}
        <path
          d="M 270 148 C 286 154, 298 168, 300 186 C 302 198, 296 208, 286 212 C 286 196, 282 178, 272 162 Z"
          style={getMuscleStyle('deltoid_side')}
        />
      </g>

      {/* ================= CHEST (흉근) ================= */}
      {/* Upper Chest (상부 흉근 - 쇄골두) */}
      <g
        id="front-chest_upper"
        onClick={() => handleMuscleClick('chest_upper')}
        role="button"
        tabIndex={0}
        aria-label="상부 흉근"
        className="hover:brightness-125"
      >
        {/* Left Upper Chest */}
        <path
          d="M 197 142 L 146 148 C 142 164, 142 174, 146 182 C 160 176, 178 170, 197 168 Z"
          style={getMuscleStyle('chest_upper')}
        />
        {/* Right Upper Chest */}
        <path
          d="M 203 142 L 254 148 C 258 164, 258 174, 254 182 C 240 176, 222 170, 203 168 Z"
          style={getMuscleStyle('chest_upper')}
        />
      </g>

      {/* Middle Chest (중부 흉근 - 흉골두) */}
      <g
        id="front-chest_mid"
        onClick={() => handleMuscleClick('chest_mid')}
        role="button"
        tabIndex={0}
        aria-label="중부 흉근"
        className="hover:brightness-125"
      >
        {/* Left Mid Chest */}
        <path
          d="M 197 170 C 178 172, 160 178, 146 184 C 146 198, 150 210, 160 216 C 174 216, 188 210, 197 206 Z"
          style={getMuscleStyle('chest_mid')}
        />
        {/* Right Mid Chest */}
        <path
          d="M 203 170 C 222 172, 240 178, 254 184 C 254 198, 250 210, 240 216 C 226 216, 212 210, 203 206 Z"
          style={getMuscleStyle('chest_mid')}
        />
      </g>

      {/* Lower Chest (하부 흉근 - 복근두) */}
      <g
        id="front-chest_lower"
        onClick={() => handleMuscleClick('chest_lower')}
        role="button"
        tabIndex={0}
        aria-label="하부 흉근"
        className="hover:brightness-125"
      >
        {/* Left Lower Chest */}
        <path
          d="M 197 208 C 188 212, 174 218, 160 218 C 166 226, 178 230, 197 228 Z"
          style={getMuscleStyle('chest_lower')}
        />
        {/* Right Lower Chest */}
        <path
          d="M 203 208 C 212 212, 226 218, 240 218 C 234 226, 222 230, 203 228 Z"
          style={getMuscleStyle('chest_lower')}
        />
      </g>

      {/* ================= ARMS (팔) ================= */}
      {/* Biceps (이두근) */}
      <g
        id="front-biceps"
        onClick={() => handleMuscleClick('biceps')}
        role="button"
        tabIndex={0}
        aria-label="이두근"
        className="hover:brightness-125"
      >
        {/* Left Biceps */}
        <path
          d="M 112 214 C 104 226, 98 250, 102 274 C 108 280, 118 282, 126 276 C 130 254, 130 230, 124 212 Z"
          style={getMuscleStyle('biceps')}
        />
        {/* Right Biceps */}
        <path
          d="M 288 214 C 296 226, 302 250, 298 274 C 292 280, 282 282, 274 276 C 270 254, 270 230, 276 212 Z"
          style={getMuscleStyle('biceps')}
        />
      </g>

      {/* Forearms (전완근) */}
      <g
        id="front-forearms"
        onClick={() => handleMuscleClick('forearms')}
        role="button"
        tabIndex={0}
        aria-label="전완근"
        className="hover:brightness-125"
      >
        {/* Left Forearm */}
        <path
          d="M 104 282 C 94 294, 84 330, 80 376 C 80 398, 88 406, 94 408 C 102 386, 110 344, 118 288 Z"
          style={getMuscleStyle('forearms')}
        />
        {/* Right Forearm */}
        <path
          d="M 296 282 C 306 294, 316 330, 320 376 C 320 398, 312 406, 306 408 C 298 386, 290 344, 282 288 Z"
          style={getMuscleStyle('forearms')}
        />
      </g>

      {/* ================= CORE (복부 & 옆구리) ================= */}
      {/* Rectus Abdominis (복직근) */}
      <g
        id="front-abs"
        onClick={() => handleMuscleClick('abs')}
        role="button"
        tabIndex={0}
        aria-label="복직근"
        className="hover:brightness-125"
      >
        {/* Upper Abs Pair */}
        <path
          d="M 198 234 L 176 236 C 174 254, 174 266, 178 274 L 198 274 Z"
          style={getMuscleStyle('abs')}
        />
        <path
          d="M 202 234 L 224 236 C 226 254, 226 266, 222 274 L 202 274 Z"
          style={getMuscleStyle('abs')}
        />
        {/* Mid Abs Pair */}
        <path
          d="M 198 278 L 177 278 C 176 294, 176 306, 179 316 L 198 316 Z"
          style={getMuscleStyle('abs')}
        />
        <path
          d="M 202 278 L 223 278 C 224 294, 224 306, 221 316 L 202 316 Z"
          style={getMuscleStyle('abs')}
        />
        {/* Lower Abs Pair */}
        <path
          d="M 198 320 L 178 320 C 178 338, 184 354, 198 364 Z"
          style={getMuscleStyle('abs')}
        />
        <path
          d="M 202 320 L 222 320 C 222 338, 216 354, 202 364 Z"
          style={getMuscleStyle('abs')}
        />
      </g>

      {/* Obliques (외복사근) */}
      <g
        id="front-obliques"
        onClick={() => handleMuscleClick('obliques')}
        role="button"
        tabIndex={0}
        aria-label="외복사근"
        className="hover:brightness-125"
      >
        {/* Left Obliques */}
        <path
          d="M 168 238 C 152 248, 142 272, 146 304 C 150 334, 160 354, 174 366 C 172 344, 170 300, 172 260 Z"
          style={getMuscleStyle('obliques')}
        />
        {/* Right Obliques */}
        <path
          d="M 232 238 C 248 248, 258 272, 254 304 C 250 334, 240 354, 226 366 C 228 344, 230 300, 228 260 Z"
          style={getMuscleStyle('obliques')}
        />
      </g>

      {/* Pelvis / Hip Joint Center Line */}
      <path d="M 174 368 L 200 394 L 226 368" fill="none" stroke="#363D36" strokeWidth="1.5" />

      {/* ================= LEGS (하체) ================= */}
      {/* Adductors (내전근) */}
      <g
        id="front-adductors"
        onClick={() => handleMuscleClick('adductors')}
        role="button"
        tabIndex={0}
        aria-label="내전근"
        className="hover:brightness-125"
      >
        {/* Left Adductor */}
        <path
          d="M 197 400 L 180 402 C 182 432, 186 468, 194 504 L 198 504 Z"
          style={getMuscleStyle('adductors')}
        />
        {/* Right Adductor */}
        <path
          d="M 203 400 L 220 402 C 218 432, 214 468, 206 504 L 202 504 Z"
          style={getMuscleStyle('adductors')}
        />
      </g>

      {/* Quadriceps (대퇴사두근) */}
      <g
        id="front-quads"
        onClick={() => handleMuscleClick('quads')}
        role="button"
        tabIndex={0}
        aria-label="대퇴사두근"
        className="hover:brightness-125"
      >
        {/* Left Quad Muscle Group */}
        <path
          d="M 176 390 C 152 400, 138 430, 134 476 C 132 522, 142 556, 160 568 C 172 576, 184 570, 188 554 C 188 518, 180 456, 176 390 Z"
          style={getMuscleStyle('quads')}
        />
        {/* Right Quad Muscle Group */}
        <path
          d="M 224 390 C 248 400, 262 430, 266 476 C 268 522, 258 556, 240 568 C 228 576, 216 570, 212 554 C 212 518, 220 456, 224 390 Z"
          style={getMuscleStyle('quads')}
        />
      </g>

      {/* Knee Joint Caps */}
      <circle cx="166" cy="590" r="10" fill="#1E2420" stroke="#363D36" strokeWidth="1" />
      <circle cx="234" cy="590" r="10" fill="#1E2420" stroke="#363D36" strokeWidth="1" />

      {/* Calves Front / Tibialis Anterior (정강이 전경골근) */}
      <g
        id="front-calves_front"
        onClick={() => handleMuscleClick('calves_front')}
        role="button"
        tabIndex={0}
        aria-label="전경골근"
        className="hover:brightness-125"
      >
        {/* Left Front Calf */}
        <path
          d="M 158 604 C 146 620, 140 652, 144 688 C 148 718, 154 742, 160 746 C 168 746, 172 718, 172 682 C 172 646, 170 616, 166 604 Z"
          style={getMuscleStyle('calves_front')}
        />
        {/* Right Front Calf */}
        <path
          d="M 242 604 C 254 620, 260 652, 256 688 C 252 718, 246 742, 240 746 C 232 746, 228 718, 228 682 C 228 646, 230 616, 234 604 Z"
          style={getMuscleStyle('calves_front')}
        />
      </g>
    </svg>
  );
};
