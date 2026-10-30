import React from 'react';
import { Exercise, MuscleId } from '../../types';

interface ExerciseIllustrationProps {
  exercise: Exercise;
  size?: 'thumb' | 'medium' | 'large';
  className?: string;
  highlightColor?: string; // default lime #B4F34C or coral #FF806B
}

export const ExerciseIllustration: React.FC<ExerciseIllustrationProps> = ({
  exercise,
  size = 'medium',
  className = '',
  highlightColor = '#B4F34C',
}) => {
  const cat = exercise.category;
  const eq = exercise.equipment;
  const id = exercise.id.toLowerCase();

  // Determine movement posture type
  let poseType: 'bench' | 'row' | 'pulldown' | 'shoulder_press' | 'deadlift' | 'squat' | 'curl' | 'cardio' | 'core' = 'bench';

  if (cat === 'cardio' || eq === 'cardio_machine' || id.includes('cycle') || id.includes('treadmill')) {
    poseType = 'cardio';
  } else if (id.includes('deadlift') || id.includes('romanian')) {
    poseType = 'deadlift';
  } else if (cat === 'legs' || id.includes('squat') || id.includes('lunge')) {
    poseType = 'squat';
  } else if (id.includes('pulldown') || id.includes('pull_up') || id.includes('chin')) {
    poseType = 'pulldown';
  } else if (id.includes('row')) {
    poseType = 'row';
  } else if (cat === 'shoulders' || id.includes('overhead') || id.includes('ohp') || id.includes('shoulder')) {
    poseType = 'shoulder_press';
  } else if (id.includes('curl')) {
    poseType = 'curl';
  } else if (cat === 'core') {
    poseType = 'core';
  } else if (cat === 'chest' || id.includes('bench') || id.includes('push_up') || id.includes('dip')) {
    poseType = 'bench';
  }

  const dimensions =
    size === 'thumb'
      ? 'w-12 h-12'
      : size === 'large'
      ? 'w-64 h-52 sm:w-80 sm:h-60'
      : 'w-44 h-40';

  return (
    <div
      className={`relative rounded-2xl bg-[#26282E] border border-[#3E4048]/80 flex items-center justify-center overflow-hidden shrink-0 ${dimensions} ${className}`}
    >
      <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-2 select-none"
      >
        <defs>
          <radialGradient id={`glow_${exercise.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={highlightColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={highlightColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient subtle glow centered on target muscle */}
        <circle cx="100" cy="75" r="45" fill={`url(#glow_${exercise.id})`} />

        {/* Equipment Silhouette & Anatomical Pose Vector */}
        {poseType === 'deadlift' && (
          <g>
            {/* Barbell Ground & Plates */}
            <line x1="20" y1="130" x2="180" y2="130" stroke="#5E636E" strokeWidth="4" strokeLinecap="round" />
            <circle cx="36" cy="130" r="16" fill="#42454E" stroke="#5E636E" strokeWidth="2" />
            <circle cx="164" cy="130" r="16" fill="#42454E" stroke="#5E636E" strokeWidth="2" />
            {/* Human Lifter in Hinged Deadlift Stance */}
            {/* Head */}
            <circle cx="100" cy="40" r="9" fill="#9DA3AF" />
            {/* Torso - spine neutral 45 deg */}
            <line x1="100" y1="49" x2="88" y2="85" stroke="#9DA3AF" strokeWidth="12" strokeLinecap="round" />
            {/* Glutes & Hips */}
            <circle cx="85" cy="88" r="10" fill={highlightColor} />
            {/* Upper Back / Lats Highlight */}
            <path d="M94 54 L106 62 L90 76 Z" fill={highlightColor} />
            {/* Thighs / Hamstrings Highlight */}
            <line x1="85" y1="88" x2="96" y2="114" stroke={highlightColor} strokeWidth="9" strokeLinecap="round" />
            {/* Calves */}
            <line x1="96" y1="114" x2="98" y2="136" stroke="#9DA3AF" strokeWidth="7" strokeLinecap="round" />
            {/* Arms reaching barbell */}
            <line x1="98" y1="58" x2="108" y2="95" stroke="#9DA3AF" strokeWidth="5" strokeLinecap="round" />
            <line x1="108" y1="95" x2="106" y2="128" stroke="#9DA3AF" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {poseType === 'bench' && (
          <g>
            {/* Bench Structure */}
            <rect x="40" y="105" width="120" height="8" rx="3" fill="#42454E" stroke="#5E636E" strokeWidth="1.5" />
            <line x1="60" y1="113" x2="56" y2="138" stroke="#5E636E" strokeWidth="4" />
            <line x1="140" y1="113" x2="144" y2="138" stroke="#5E636E" strokeWidth="4" />
            {/* Athlete lying on bench */}
            <circle cx="62" cy="95" r="9" fill="#9DA3AF" />
            {/* Torso & Chest Highlight */}
            <line x1="72" y1="99" x2="115" y2="99" stroke="#9DA3AF" strokeWidth="11" strokeLinecap="round" />
            <ellipse cx="88" cy="94" rx="14" ry="7" fill={highlightColor} />
            {/* Arms holding barbell */}
            <polyline points="85,96 85,68 83,50" stroke="#9DA3AF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="95,96 95,68 97,50" stroke="#9DA3AF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Barbell Pressed */}
            <line x1="45" y1="48" x2="155" y2="48" stroke="#8A909D" strokeWidth="4" strokeLinecap="round" />
            <rect x="35" y="38" width="10" height="20" rx="2" fill="#5E636E" />
            <rect x="155" y="38" width="10" height="20" rx="2" fill="#5E636E" />
            {/* Legs on floor */}
            <polyline points="115,99 128,112 128,138" stroke="#9DA3AF" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {poseType === 'pulldown' && (
          <g>
            {/* Machine Top Frame & Pulley */}
            <path d="M40 25 L160 25 L150 145" stroke="#5E636E" strokeWidth="3" fill="none" />
            <circle cx="100" cy="25" r="5" fill="#8A909D" />
            {/* Lat Pulldown Wide Bar */}
            <path d="M60 46 Q100 42 140 46" stroke="#8A909D" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Seated Athlete */}
            <circle cx="100" cy="62" r="8" fill="#9DA3AF" />
            {/* Back & Lats Highlight */}
            <line x1="100" y1="71" x2="100" y2="108" stroke="#9DA3AF" strokeWidth="11" strokeLinecap="round" />
            <path d="M92 74 C82 82 82 98 94 104 C94 92 92 84 92 74 Z" fill={highlightColor} />
            <path d="M108 74 C118 82 118 98 106 104 C106 92 108 84 108 74 Z" fill={highlightColor} />
            {/* Arms reaching up */}
            <polyline points="94,76 74,58 68,47" stroke="#9DA3AF" strokeWidth="4.5" strokeLinecap="round" />
            <polyline points="106,76 126,58 132,47" stroke="#9DA3AF" strokeWidth="4.5" strokeLinecap="round" />
            {/* Seat & Pad */}
            <rect x="85" y="108" width="30" height="6" rx="2" fill="#42454E" />
          </g>
        )}

        {poseType === 'shoulder_press' && (
          <g>
            {/* Upright Seat */}
            <rect x="75" y="65" width="6" height="50" rx="2" fill="#42454E" stroke="#5E636E" strokeWidth="1" />
            <rect x="75" y="112" width="40" height="6" rx="2" fill="#42454E" />
            {/* Seated Athlete Head */}
            <circle cx="95" cy="52" r="8.5" fill="#9DA3AF" />
            {/* Torso */}
            <line x1="95" y1="62" x2="95" y2="110" stroke="#9DA3AF" strokeWidth="11" strokeLinecap="round" />
            {/* Deltoids Highlight (Shoulders) */}
            <circle cx="84" cy="66" r="6" fill={highlightColor} />
            <circle cx="106" cy="66" r="6" fill={highlightColor} />
            {/* Arms Overhead */}
            <polyline points="84,66 78,48 82,32" stroke="#9DA3AF" strokeWidth="4.5" strokeLinecap="round" />
            <polyline points="106,66 112,48 108,32" stroke="#9DA3AF" strokeWidth="4.5" strokeLinecap="round" />
            {/* Dumbbells or Bar overhead */}
            <line x1="72" y1="30" x2="92" y2="30" stroke="#8A909D" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="98" y1="30" x2="118" y2="30" stroke="#8A909D" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {poseType === 'row' && (
          <g>
            {/* Bench / Cable Machine Base */}
            <rect x="35" y="122" width="130" height="6" rx="2" fill="#42454E" />
            {/* Head */}
            <circle cx="90" cy="52" r="8.5" fill="#9DA3AF" />
            {/* Bent Torso */}
            <line x1="90" y1="62" x2="78" y2="96" stroke="#9DA3AF" strokeWidth="11" strokeLinecap="round" />
            {/* Upper Back / Lats Highlight */}
            <path d="M82 66 L98 76 L82 88 Z" fill={highlightColor} />
            {/* Arms Rowing Elbows Back */}
            <polyline points="86,68 104,78 98,92" stroke="#9DA3AF" strokeWidth="5" strokeLinecap="round" />
            {/* Dumbbell / Barbell */}
            <line x1="90" y1="94" x2="110" y2="94" stroke="#8A909D" strokeWidth="4" strokeLinecap="round" />
            {/* Legs */}
            <polyline points="78,96 74,114 68,134" stroke="#9DA3AF" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {poseType === 'squat' && (
          <g>
            {/* Barbell Across Traps */}
            <line x1="45" y1="52" x2="155" y2="52" stroke="#8A909D" strokeWidth="4.5" strokeLinecap="round" />
            <rect x="35" y="42" width="10" height="20" rx="2" fill="#5E636E" />
            <rect x="155" y="42" width="10" height="20" rx="2" fill="#5E636E" />
            {/* Head */}
            <circle cx="100" cy="40" r="8.5" fill="#9DA3AF" />
            {/* Torso Squat Depth */}
            <line x1="100" y1="50" x2="94" y2="82" stroke="#9DA3AF" strokeWidth="11" strokeLinecap="round" />
            {/* Quads & Glutes Highlight */}
            <line x1="94" y1="82" x2="116" y2="104" stroke={highlightColor} strokeWidth="10" strokeLinecap="round" />
            <circle cx="92" cy="84" r="7" fill={highlightColor} />
            {/* Calves & Knees */}
            <line x1="116" y1="104" x2="110" y2="136" stroke="#9DA3AF" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {poseType === 'curl' && (
          <g>
            {/* Standing Athlete */}
            <circle cx="100" cy="38" r="8.5" fill="#9DA3AF" />
            <line x1="100" y1="48" x2="100" y2="92" stroke="#9DA3AF" strokeWidth="11" strokeLinecap="round" />
            {/* Biceps Highlight */}
            <circle cx="89" cy="68" r="5.5" fill={highlightColor} />
            <circle cx="111" cy="68" r="5.5" fill={highlightColor} />
            {/* Flexed Arms holding Barbell */}
            <polyline points="94,54 88,68 96,62" stroke="#9DA3AF" strokeWidth="4.5" strokeLinecap="round" />
            <polyline points="106,54 112,68 104,62" stroke="#9DA3AF" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="78" y1="60" x2="122" y2="60" stroke="#8A909D" strokeWidth="4" strokeLinecap="round" />
            {/* Legs */}
            <line x1="95" y1="92" x2="92" y2="138" stroke="#9DA3AF" strokeWidth="7" strokeLinecap="round" />
            <line x1="105" y1="92" x2="108" y2="138" stroke="#9DA3AF" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {poseType === 'cardio' && (
          <g>
            {/* Stationary Bike Frame */}
            <circle cx="65" cy="115" r="18" stroke="#5E636E" strokeWidth="3" fill="none" />
            <circle cx="135" cy="115" r="18" stroke="#5E636E" strokeWidth="3" fill="none" />
            <path d="M65 115 L100 85 L135 115" stroke="#5E636E" strokeWidth="4" fill="none" />
            <path d="M100 85 L95 62 L85 62" stroke="#5E636E" strokeWidth="3" fill="none" />
            <path d="M100 85 L125 58 L135 58" stroke="#5E636E" strokeWidth="3" fill="none" />
            {/* Cyclist with active leg highlight */}
            <circle cx="106" cy="40" r="7.5" fill="#9DA3AF" />
            <line x1="104" y1="48" x2="96" y2="70" stroke="#9DA3AF" strokeWidth="9" strokeLinecap="round" />
            <line x1="96" y1="70" x2="108" y2="92" stroke={highlightColor} strokeWidth="8" strokeLinecap="round" />
            <line x1="108" y1="92" x2="102" y2="114" stroke="#9DA3AF" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {poseType === 'core' && (
          <g>
            {/* Floor mat */}
            <line x1="25" y1="125" x2="175" y2="125" stroke="#42454E" strokeWidth="4" strokeLinecap="round" />
            {/* Athlete in Plank position */}
            <circle cx="145" cy="78" r="8" fill="#9DA3AF" />
            {/* Forearm on ground */}
            <polyline points="140,84 140,110 152,122" stroke="#9DA3AF" strokeWidth="5" strokeLinecap="round" />
            {/* Straight Core highlighted */}
            <line x1="135" y1="88" x2="75" y2="102" stroke="#9DA3AF" strokeWidth="10" strokeLinecap="round" />
            <line x1="120" y1="92" x2="95" y2="98" stroke={highlightColor} strokeWidth="7" strokeLinecap="round" />
            {/* Legs & Toes on ground */}
            <line x1="75" y1="102" x2="42" y2="120" stroke="#9DA3AF" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
