import { ExerciseGuide } from '../types';

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  ch_bb_flat_bench: {
    exerciseId: 'ch_bb_flat_bench',
    summary: '상체 가슴 전반의 근비대와 근력을 발달시키는 대표적인 복합 다관절 프레스 운동입니다.',
    difficulty: 'intermediate',
    instructions: [
      '벤치에 누워 견갑골을 후인하강(모으고 내리기)하여 등 상부를 단단히 고정합니다.',
      '발바닥 전체를 지면에 밀착시키고 허리에 자연스러운 아치를 만듭니다.',
      '어깨너비보다 약간 넓게 바벨을 오버그립으로 쥐고 랙에서 들어 올립니다.',
      '팔꿈치가 몸통과 약 45~70도를 이루도록 유지하며 흉골 중간부위로 바벨을 천천히 내립니다.',
      '가슴 근육의 이완을 느낀 후, 발바닥과 가슴으로 밀어낸다는 느낌으로 강하게 밀어 올립니다.',
    ],
    breathingTips: '바벨을 내릴 때 숨을 깊게 들이마셔 복압을 잡고, 바벨을 끝까지 밀어 올리면서 숨을 내쉽니다.',
    commonMistakes: [
      '바벨이 가슴에 튕겨지듯 반동을 주는 행위',
      '어깨가 벤치에서 들리면서 전면 삼각근에 과도한 부하가 집중되는 현상',
      '손목이 뒤로 과도하게 꺾인 상태로 중량을 받는 것',
    ],
    safetyNotes: [
      '고중량 시도 시 반드시 세이프티 바를 설치하거나 보조자와 함께 진행하세요.',
      '손목 보호대 착용을 권장합니다.',
    ],
    alternativeExerciseIds: ['ch_db_flat_bench', 'ch_machine_chest_press', 'ch_pushup'],
  },
  ch_db_incline_bench: {
    exerciseId: 'ch_db_incline_bench',
    summary: '30~45도 각도의 벤치에서 덤벨을 활용해 쇄골두(윗가슴) 부위를 집중 타겟하는 운동입니다.',
    difficulty: 'intermediate',
    instructions: [
      '인클라인 벤치 각도를 약 30도로 맞춘 후 덤벨을 허벅지 위에 올려놓고 눕습니다.',
      '무릎을 차올려 덤벨을 어깨 위로 위치시키고 가슴을 활짝 열어 견갑을 고정합니다.',
      '팔꿈치가 바깥으로 너무 벌어지지 않게 주의하며 덤벨을 윗가슴 라인으로 내립니다.',
      '윗가슴의 수축감을 느끼며 덤벨을 위로 밀어 올리되 끝에서 부딪치지 않습니다.',
    ],
    breathingTips: '덤벨을 내리면서 숨을 들이쉬고, 밀어 올릴 때 숨을 내쉽니다.',
    commonMistakes: [
      '벤치 각도를 45도 이상 너무 높여 전면 어깨로 부하가 분산되는 경우',
      '덤벨 상단에서 부딪혀 텐션이 풀리는 것',
    ],
    safetyNotes: ['덤벨을 던지듯이 내려놓지 말고 무릎 위로 안전하게 착지시키세요.'],
    alternativeExerciseIds: ['ch_bb_incline_bench', 'ch_smith_incline_bench'],
  },
  bk_bb_deadlift: {
    exerciseId: 'bk_bb_deadlift',
    summary: '전신 후면 사슬(기립근, 둔근, 햄스트링, 등)을 모두 동원하는 최고의 전신 복합 운동입니다.',
    difficulty: 'advanced',
    instructions: [
      '발을 골반 너비로 벌리고 바벨이 발등 중앙(신발 끈 매듭) 위에 오도록 섭니다.',
      '골반을 뒤로 빼는 힙 힌지(Hip Hinge) 자세로 정강이가 바벨에 살짝 닿을 때까지 내려갑니다.',
      '어깨너비로 바벨을 잡고 등을 곧게 펴며 가슴을 들어 체스트 업 상태를 만듭니다.',
      '발바닥으로 지면을 강하게 밀어내며 바벨을 몸에 밀착시켜 수직으로 들어 올립니다.',
      '정점에서 둔근을 꽉 조인 후, 역순으로 바벨을 바닥까지 컨트롤하며 내립니다.',
    ],
    breathingTips: '시작 전 숨을 깊이 들이마셔 복압(발살바 호흡)을 최대치로 잡고 리프팅 후 상단 또는 바닥에서 내쉽니다.',
    commonMistakes: [
      '허리가 둥글게 굽은 상태(고양이등)로 중량을 드는 행위 (허리 부상 위험)',
      '바벨이 몸에서 멀어져 모멘트 암이 길어지는 현상',
      '마지막에 허리를 과도하게 뒤로 젖히는 과신전',
    ],
    safetyNotes: [
      '허리 통증이 있다면 가벼운 무게부터 시작하거나 루마니안 데드리프트로 힙 힌지를 먼저 익히세요.',
      '리프팅 벨트 착용을 추천합니다.',
    ],
    alternativeExerciseIds: ['lg_romanian_deadlift', 'bk_tbar_row', 'bk_hyperextension'],
  },
  bk_lat_pulldown: {
    exerciseId: 'bk_lat_pulldown',
    summary: '광배근의 너비감과 등의 입체감을 안전하게 키울 수 있는 최고의 케이블 등 운동입니다.',
    difficulty: 'beginner',
    instructions: [
      '허벅지 패드를 단단히 고정하고 바를 어깨너비의 약 1.5배로 넓게 오버핸드 그립으로 잡습니다.',
      '가슴을 살짝 천장을 향해 열고 상체를 약 10~15도 뒤로 기울입니다.',
      '견갑골을 먼저 아래로 끌어내린 뒤, 팔꿈치를 옆구리 쪽으로 찍어 누른다는 느낌으로 당깁니다.',
      '바가 쇄골 아랫부분에 닿을 정도로 당긴 후, 등의 저항을 느끼며 천천히 바를 올립니다.',
    ],
    breathingTips: '바를 당기면서 숨을 내쉬고, 바를 올리며 등이 늘어날 때 숨을 들이마십니다.',
    commonMistakes: [
      '상체를 과도하게 뒤로 젖히며 체중으로 당기는 치팅',
      '팔 힘(이두근)으로만 바를 당겨 등에 자극이 안 오는 경우',
    ],
    safetyNotes: ['목 뒤로 당기는 비하인드 넥 풀다운은 어깨 관절 부담이 크므로 프론트 풀다운을 기본으로 하세요.'],
    alternativeExerciseIds: ['bk_pullup', 'bk_close_grip_pulldown', 'bk_seated_cable_row'],
  },
  sh_ohp: {
    exerciseId: 'sh_ohp',
    summary: '서서 머리 위로 바벨을 밀어 올려 전면·측면 어깨와 코어의 수직 밀기 힘을 기르는 기본 종목입니다.',
    difficulty: 'intermediate',
    instructions: [
      '바벨을 쇄골 바로 위에 얹고 손은 어깨 바로 바깥쪽에 위치하도록 그립을 잡습니다.',
      '둔근과 복근에 강한 힘을 주어 몸통을 단단한 일직선 기둥으로 만듭니다.',
      '바벨이 지나갈 수 있도록 턱을 살짝 뒤로 당기며 수직 궤적으로 밀어 올립니다.',
      '바벨이 이마를 통과하면 머리를 다시 앞으로 넣고 팔을 완전히 폅니다.',
      '천천히 컨트롤하며 바벨을 쇄골 원위치로 내립니다.',
    ],
    breathingTips: '동작 시작 전 복압을 유지하고, 락아웃 직후 짧게 숨을 내쉰 뒤 다시 들이마십니다.',
    commonMistakes: [
      '허리를 과도하게 뒤로 꺾어 요추에 부담을 주는 동작',
      '바벨이 수직이 아닌 대각선 앞쪽으로 밀리는 현상',
    ],
    safetyNotes: ['어깨 충돌이 느껴진다면 덤벨 숄더 프레스로 그립 각도를 조절해 보세요.'],
    alternativeExerciseIds: ['sh_db_shoulder_press', 'sh_machine_shoulder_press', 'sh_arnold_press'],
  },
  sh_side_lateral_raise: {
    exerciseId: 'sh_side_lateral_raise',
    summary: '어깨 프레임 너비를 넓혀주는 측면 삼각근을 고립 타겟하는 필수 어깨 운동입니다.',
    difficulty: 'beginner',
    instructions: [
      '덤벨을 쥐고 허리를 곧게 펴며 상체를 아주 살짝(약 5도) 앞으로 기울입니다.',
      '팔꿈치를 살짝 구부린 상태를 고정하고, 손이 아니라 팔꿈치를 들어 올린다는 느낌으로 옆으로 올립니다.',
      '어깨 높이까지만 들어 올린 후 1초간 정점 수축을 유지합니다.',
      '천천히 측면 삼각근의 저항을 버티며 원위치로 내립니다.',
    ],
    breathingTips: '덤벨을 올릴 때 숨을 내쉬고, 천천히 내릴 때 숨을 들이마십니다.',
    commonMistakes: [
      '승모근을 과도하게 으쓱거리며 귀 쪽으로 올리는 현상',
      '과도하게 무거운 덤벨로 반동(몸 튕기기)을 사용하는 행위',
    ],
    safetyNotes: ['사레레는 저중량 고반복(12~20회)으로 자극에 집중하는 것이 훨씬 효과적입니다.'],
    alternativeExerciseIds: ['sh_cable_lateral_raise', 'sh_upright_row'],
  },
  lg_bb_back_squat: {
    exerciseId: 'lg_bb_back_squat',
    summary: '하체 근육(대퇴사두, 둔근, 햄스트링)과 체간 안정성을 극대화하는 하체 운동의 꽃입니다.',
    difficulty: 'advanced',
    instructions: [
      '바벨을 승모근 상단(하이바) 또는 견갑극 바로 아래(로우바)에 단단히 얹습니다.',
      '발을 어깨너비로 벌리고 발끝을 바깥으로 15~30도 벌려 안정적인 스탠스를 취합니다.',
      '무릎과 고관절을 동시에 접으며 무릎이 발끝 방향을 향하도록 앉습니다.',
      '고관절 주름이 무릎 윗선보다 아래로 내려갈 때(패러렐 스쿼트)까지 깊이 앉습니다.',
      '발바닥 중앙(미드풋)으로 바닥을 밀어내며 폭발적으로 일어섭니다.',
    ],
    breathingTips: '앉기 전 깊게 숨을 들이마셔 복압을 단단히 채우고, 상승 구간을 지난 뒤 내쉽니다.',
    commonMistakes: [
      '일어날 때 무릎이 안쪽으로 모이는 현상(Knee Valgus)',
      '상체가 앞으로 쏟아지며 엉덩이만 먼저 들리는 굿모닝 스쿼트',
      '뒤꿈치가 들리는 현상 (발목 가동성 부족)',
    ],
    safetyNotes: [
      '반드시 랙의 안전바(Safety Pin)를 골반 높이에 맞춰 조절하고 운동하세요.',
      '허리 부상 방지를 위해 척추 중립을 절대 무너뜨리지 마세요.',
    ],
    alternativeExerciseIds: ['lg_leg_press', 'lg_hack_squat', 'lg_goblet_squat'],
  },
  lg_romanian_deadlift: {
    exerciseId: 'lg_romanian_deadlift',
    summary: '무릎 굴곡을 최소화하고 햄스트링과 둔근의 신장성 수축을 극대화하는 대표적 힙 힌지 운동입니다.',
    difficulty: 'intermediate',
    instructions: [
      '바벨을 들고 선 상태에서 무릎을 10~15도 정도 살짝 굽혀 고정합니다.',
      '엉덩이를 뒤쪽 벽으로 찌른다는 느낌으로 골반을 뒤로 밀어내며 바벨을 허벅지를 스치듯 내립니다.',
      '햄스트링이 팽팽하게 늘어나는 지점(정강이 중간)까지 상체를 숙입니다.',
      '둔근을 앞으로 밀어 넣으며 상체를 곧게 세워 시작 자세로 돌아옵니다.',
    ],
    breathingTips: '상체를 내릴 때 숨을 들이마시고, 올라오면서 둔근을 수축하며 내쉽니다.',
    commonMistakes: [
      '무릎을 과도하게 구부려 일반 스쿼트처럼 변질되는 것',
      '허리가 둥글게 말린 상태로 무게를 받는 것',
    ],
    safetyNotes: ['바벨이 몸에서 떨어지지 않도록 항상 허벅지와 정강이에 붙여서 움직이세요.'],
    alternativeExerciseIds: ['lg_lying_leg_curl', 'lg_hip_thrust', 'bk_hyperextension'],
  },
  arm_bb_biceps_curl: {
    exerciseId: 'arm_bb_biceps_curl',
    summary: '상완이두근의 크기와 파워를 키우는 가장 표준적인 팔 앞쪽 운동입니다.',
    difficulty: 'beginner',
    instructions: [
      '어깨너비로 바벨을 언더그립(손바닥이 위를 향함)으로 잡고 바르게 섭니다.',
      '팔꿈치를 옆구리에 고정하고 팔꿈치 관절만 접어 바벨을 가슴 높이까지 들어 올립니다.',
      '상단에서 이두근을 1초간 쥐어짜듯 수축합니다.',
      '이두근의 저항을 천천히 버티며 시작 자세로 내립니다.',
    ],
    breathingTips: '바벨을 올릴 때 숨을 내쉬고, 내릴 때 들이마십니다.',
    commonMistakes: [
      '상체를 앞뒤로 흔들며 반동으로 들어 올리는 행위',
      '팔꿈치가 앞뒤로 심하게 움직여 어깨 개입이 커지는 것',
    ],
    safetyNotes: ['손목에 부담이 있다면 곡선형 이지바(EZ-Bar)를 사용하는 것이 좋습니다.'],
    alternativeExerciseIds: ['arm_db_biceps_curl', 'arm_cable_curl', 'arm_preacher_curl'],
  },
  arm_triceps_pushdown: {
    exerciseId: 'arm_triceps_pushdown',
    summary: '케이블과 바 또는 로프를 이용해 상완삼두근의 외측두를 집중 발달시키는 운동입니다.',
    difficulty: 'beginner',
    instructions: [
      '케이블 머신 앞에 서서 상체를 살짝 앞으로 숙입니다.',
      '팔꿈치를 옆구리에 단단히 고정하고 바 또는 로프를 잡습니다.',
      '팔꿈치 위치를 그대로 유지한 채 아래 방향으로 팔을 완전히 폅니다.',
      '끝에서 삼두근을 1초간 강하게 쥐어짠 후, 천천히 90도 각도까지 접어 올립니다.',
    ],
    breathingTips: '팔을 아래로 밀어 펼 때 숨을 내쉬고, 팔꿈치를 접으며 숨을 들이쉽니다.',
    commonMistakes: [
      '팔꿈치가 위아래로 흔들리며 어깨와 광배근이 개입하는 경우',
      '손목을 아래로 꺾어서 누르는 현상',
    ],
    safetyNotes: ['팔꿈치 관절염이나 통증이 있을 때는 중량을 낮추고 로프 그립을 사용하세요.'],
    alternativeExerciseIds: ['arm_skullcrusher', 'arm_overhead_cable_extension', 'arm_close_grip_bench'],
  },
  cr_hanging_leg_raise: {
    exerciseId: 'cr_hanging_leg_raise',
    summary: '철봉에 매달려 골반을 말아 올려 복직근 하부와 전체 코어를 강력하게 단련합니다.',
    difficulty: 'intermediate',
    instructions: [
      '철봉을 어깨너비보다 약간 넓게 잡고 매달립니다.',
      '몸의 반동을 줄이기 위해 코어에 긴장을 유지합니다.',
      '단순히 다리만 올리지 않고, 골반을 가슴 쪽으로 말아 올린다는 느낌으로 다리를 들어 올립니다.',
      '복근의 강한 수축을 느낀 후, 반동 없이 천천히 다리를 내립니다.',
    ],
    breathingTips: '다리를 올릴 때 숨을 완전히 내뱉고, 내리면서 들이마십니다.',
    commonMistakes: [
      '몸을 앞뒤로 그네처럼 흔들며 반동을 이용하는 것',
      '복근 수축 없이 대퇴사두근과 장요근만으로 다리를 드는 행위',
    ],
    safetyNotes: ['어깨가 빠지지 않도록 견갑골을 살짝 당겨 숄더 패킹을 유지하세요.'],
    alternativeExerciseIds: ['cr_cable_crunch', 'cr_captain_chair_leg_raise', 'cr_plank'],
  },
};

/**
 * Returns a complete guide for an exercise with safe fallback for any exercise
 */
export function getExerciseGuide(exerciseId: string, exerciseNameKo: string, primaryMuscleName: string): ExerciseGuide {
  if (EXERCISE_GUIDES[exerciseId]) {
    return EXERCISE_GUIDES[exerciseId];
  }

  // Fallback verified generic guide
  return {
    exerciseId,
    summary: `${exerciseNameKo}은(는) ${primaryMuscleName} 부위를 효과적으로 단련할 수 있는 운동입니다.`,
    difficulty: 'intermediate',
    instructions: [
      '준비 자세를 취하고 척추 중립과 안정적인 코어 복압을 만듭니다.',
      '목표 근육의 긴장을 풀지 않고 가동 범위를 유지하며 동작을 시작합니다.',
      '정점 수축 구간에서 1초간 호흡을 정돈하며 근육의 긴장을 확인합니다.',
      '부하를 느끼며 천천히 시작 위치로 컨트롤하며 돌아옵니다.',
    ],
    breathingTips: '힘을 쓰며 수축할 때 숨을 내쉬고, 이완하며 원위치로 돌아올 때 들이마십니다.',
    commonMistakes: [
      '지나치게 무거운 무게로 인해 관절에 무리가 가는 자세',
      '반동을 과도하게 사용하여 목표 근육의 텐션이 빠지는 행위',
    ],
    safetyNotes: [
      '관절 통증이 느껴지면 즉시 중단하고 가벼운 무게로 자세를 점검하세요.',
      '충분한 워밍업 세트 후 본 세트에 들어가세요.',
    ],
    alternativeExerciseIds: [],
  };
}
