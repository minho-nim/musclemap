## 1.0.0 — 2026-10-30

- 기존 색상을 유지하고 홈을 주간 일정·선택한 루틴·종목 목록 중심으로 재구성함.
- 종목별 세트·횟수·중량과 상세 안내, 루틴 편집, 운동 시작을 연결함.
- 운동 부위·주간 목표·최근 운동과 기록 공유 기능을 유지함.
- 모바일 하단 안전 영역과 키보드 초점 표시를 보완함.
- Vite와 esbuild 버전 충돌을 수정하고 npm 잠금 파일·GitHub Pages 배포를 구성함.
# Changelog

All notable changes to **MuscleMap** are documented in this file.

## [v0.2.0] - 2026-10-28

### 🚀 Planfit UI/UX Full Completion, Muscle Detail & SNS Workout Share Card

#### 1. Dual Front/Back Anatomical Model & Recovery Visualization (`image_2b358369.png`)
- **Dual Side-by-Side Anatomical Model**:
  - Displays Front and Back athletic figures side-by-side in high definition inside a single dark panel (`#24252A`).
  - Highlights stimulated/fatigued muscles in Coral `#FF806B` for primary and Peach `#E9AB87` for secondary.
  - Interactive selection highlights corresponding muscles on both models.
- **Horizontal Recovery Gradient Bar**:
  - Recreates Planfit reference bar: `회복도 0%` (Coral `#FF806B`) to `100%` (White / Lime `#B4F34C`).
- **Main Muscle Groups Status List (`메인 근육 그룹`)**:
  - Vertical list directly beneath the anatomy view for 11 core muscular regions (광배근, 전면 어깨, 햄스트링, 둔근, 대퇴사두근, 대흉근, 승모근, 삼두근, 이두근, 복근, 종아리).
  - High-res localized SVG cutout thumbnail with coral highlighting.
  - Dynamic workout recency subtitles: `최근 운동 없음`, `오늘 N세트 완료`, `어제 N세트 완료`, `X일 전 N세트`.
  - Recovery percentage capsules (`100%`, `80%`, `50%`) grounded in ACSM 48~72h muscle recovery models.

#### 2. Workout Record SNS Share Card (`image_ba2beac0.png`)
- **Planfit-Style Minimal Dark Share Card (`WorkoutShareModal`)**:
  - Top navigation bar: `< 기록 공유` with right-hand `저장` pill button.
  - Multi-ratio support: Instagram Feed `4:5` and Instagram Story `9:16`.
  - Minimal dark card container (`#2B2D33`) featuring completed exercise list with set counts (e.g. `바벨 벤치프레스 4 sets`).
  - Bottom metadata row: `[Calendar] YYYY.MM.DD`, `[Flame] 150kcal`, `[Clock] HH:MM:SS`.
  - High-resolution HTML5 Canvas rendering engine for crisp 2x PNG generation.
  - Native `navigator.share` integration with automatic PNG download fallback.
  - Integrated into `WorkoutSummaryModal` (workout completion modal) and `HomePage`/`AnalyticsPage` history items.

#### 3. Responsive Desktop (PC) Split-Pane Layout
- **Large Viewport Optimization ($\ge 1024$px, 1440px, 1920px)**:
  - Eliminates the narrow, isolated 400px mobile box on large monitors.
  - Left column: Active exercise, athletic illustration, Pace Mode panel, compact set table, and docked set logging CTA.
  - Right column: Pinned workout sequence with real-time completion checkmarks, quick jump, and live target muscle anatomical visualizer.
  - Mobile maintains the bottom-pinned action bar (`[≡]`, `[Timer]`, `[Log Set N]`).

## [v0.1.1] - 2026-10-28

### 💎 Planfit-Style UI/UX Redesign & Exercise Physiology Enhancements

#### 1. Planfit-Inspired Design Overhaul
- **Dark Charcoal Slate Palette**:
  - `Background`: `#1B1C20`
  - `Surface`: `#303137` / `Hover`: `#3A3B43`
  - `Input`: `#42434A`
  - `Border`: `#3E4048`
  - `Accent (Lime)`: `#B4F34C`
  - `Muscle Target (Coral)`: `#FF806B` / `Secondary`: `#E9AB87`
  - `Text`: `#F4F4F5` / `Secondary Text`: `#A9AAB3`
- **Active Workout Screen (`image_dcfbb3ac.png`)**:
  - Pinned top bar: `<` Back/pause, centered bold elapsed stopwatch `00:45:24`, options menu `...`, Pace Mode toggle badge.
  - Subheader: Exercise progress `1 / 8`, Korean/English titles, primary/secondary target muscles.
  - Center: High-fidelity athletic `ExerciseIllustration` with glowing target muscle highlight.
  - Action row with `Edit Set` launcher and Workout Style selector.
  - Compact Set rows: completed (`#22352E` green tint with `✓`), active (highlighted `#B4F34C` border), upcoming (`#303137/60`).
  - **Fixed Bottom Action Bar** (pinned to viewport regardless of scroll):
    - Left: `[≡]` icon button opening the Workout Exercise List Bottom Sheet.
    - Center: `[Timer]` button showing resolved rest seconds (e.g. `휴식 150s`).
    - Right: Prominent `[Log Set N]` CTA in `#B4F34C` for instant single-tap completion and rest timer trigger.

#### 2. Planfit Contextual Bottom Sheets
- **Exercise List Bottom Sheet (`image_0c91cf1b.png`)**:
  - High-density list showing exercise count, estimated duration, square thumbnails with active muscle coloring, and 3-dots menu (세트 설정, 종목 대체, 삭제).
  - Pinned `+ 운동 추가하기` button.
- **Exercise Edit & Replacement Bottom Sheet (`image_5aa084b7.png`)**:
  - Upper illustration in dark container, clean set weight and repetition inputs, add set button, and bottom `🗑 삭제` / `🔄 대체` actions.

#### 3. Exercise-Specific Rest Timers & Physiological Grounding
- **5-Tier Priority Cascade**:
  1. Current set temporary setting
  2. Exercise group setting (superset/circuit rest)
  3. Routine-saved exercise setting
  4. Personal per-exercise preference setting
  5. Default exercise data / physiological recommendation
- **Literature Grounding**:
  - Heavy lower compound (Squat, Deadlift, Leg Press): 180s (ATP-PCr resynthesis; Schoenfeld et al. 2024).
  - Main upper compound (Bench Press, OHP, Barbell Row, Pull-ups): 150s (Neuromuscular recovery; ACSM 2009/2021).
  - Machine compound (Chest Press, Lat Pulldown, Cable Row): 120s.
  - Isolation movements (Curls, Lateral Raises, Triceps, Calves, Abs): 90s.
  - Warmup sets: 60s.
  - *Rest extensions are never penalized in performance scores.*

#### 4. Workout Style Gamification XP System
- Small motivation element separated from the 100-point performance scores:
  - 미지정: 0 XP
  - 슈퍼세트: 4 XP
  - 드롭세트: 3 XP
  - 피라미드: 2 XP
  - 컴파운드세트: 4 XP
  - 레스트-포즈: 3 XP
  - 서킷 트레이닝: 5 XP
  - 자이언트세트: 5 XP
- Daily cap strictly enforced at **15 XP max per day** with deduplication preventing repeat triggers.

#### 5. Planfit Recovery Anatomy & Radar Balance Chart (`image_dad73c80.png` & `image_3c71883a.png`)
- **근육 회복도 & 최근 신체 부하**:
  - Side-by-side Front and Back anatomical figures with stimulation coloring.
  - Horizontal recovery gradient bar from 0% (coral) to 100% (lime).
  - Science-based disclaimer explaining load estimation from elapsed rest time and volume without fake biometric claims.
- **운동 균형도 (Radar Balance Chart)**:
  - 6-axis polygon visualizing volume distribution across 등, 가슴, 어깨, 팔, 하체, 코어/유산소.

#### 6. Removal of Fanfare
- Confetti animation and sound fanfare completely removed from `WorkoutSummaryModal.tsx` ("빵빠레 없애").

---

## [v0.1.0] - 2026-10-28

### 🚀 Major Highlights

#### 1. UI/UX & Design System (Black + Lime + Coral)
- Applied cohesive, dark-mode design tokens:
  - **Background**: `#101213`
  - **Surface**: `#1D211E`
  - **Input**: `#292E29`
  - **Border**: `#363D36`
  - **Primary Accent (Lime)**: `#B4F34C` (Main CTA, set completion, active tab)
  - **Target Muscle Primary (Coral)**: `#FF806B`
  - **Target Muscle Secondary**: `#E9AB87`
  - **Muscle Inactive**: `#4B5650`
  - **Text Primary**: `#F5F6F5` / **Text Secondary**: `#A9B2AC`
- Responsive layout with desktop sidebar and mobile bottom navigation (홈, 운동, 근육, 분석).

#### 2. 2D Anatomical SVG Muscle Map
- Custom front & back vector anatomy models (400x800 viewBox) with exact anatomical muscle groupings (가슴, 등, 어깨, 이두, 삼두, 전완, 복근, 대퇴사두, 햄스트링, 둔근, 종아리 등).
- Three operational modes:
  - `explore`: Interactive muscle selection with filterable exercise recommendations and category badges.
  - `guide`: Visual primary/secondary muscle highlights on exercise detail cards and active workout headers.
  - `analysis`: Heatmap visualization of weekly volume and set distribution with direct vs. indirect stimulation calculation.

#### 3. Free Workout & Routine Management
- **Free Workout (자유 운동)**: Start workout instantly without a routine, search & add exercises on the fly, adjust target sets dynamically.
- **Routine Integration**: Pre-loaded default split routines (3-Day Split, Upper/Lower, Full Body), custom routine creator/editor with scheduled day tags, and the ability to save any finished free workout session directly as a reusable routine.
- **Non-Offsetting Goal Tracking**: Weekly goal calculation that does not offset over-performed muscle sets into lagging muscle groups.

#### 4. 8 Workout Styles Support (운동 방식 8종)
Strictly standardized and ordered with dedicated execution flows:
1. **미지정 (Standard)**: Standard straight sets with customizable rest timers.
2. **슈퍼세트 (Superset)**: Alternating antagonist muscles (e.g., bench press & bent-over row) with zero rest between pairs and full rest between rounds.
3. **드롭세트 (Drop Set)**: Multi-stage drop sets with segment weight and repetition tracking, calculating total accumulated volume.
4. **피라미드세트 (Pyramid Set)**: Ascending, descending, triangle, and custom weight/rep patterns with pre-calculated volume targets.
5. **컴파운드세트 (Compound Set)**: Two consecutive exercises for the same target muscle group with no rest in between.
6. **레스트-포즈 (Rest-Pause)**: Failure set followed by 10~20s micro-pause bursts with accumulated rep tracking.
7. **서킷 트레이닝 (Circuit Training)**: High-density 3+ exercise multi-station rotations with lap tracking and station countdowns.
8. **자이언트세트 (Giant Set)**: 4+ exercises targeting the same muscle group without intermediate rest.
- Includes quick-access **Favorites** and **Recently Used** style tracking in IndexedDB.

#### 5. Pace Mode State Machine
- Optional toggleable mode (defaults to OFF) for high-focus tempo tracking:
  - `READY`: Initial state awaiting set start.
  - `PREPARING`: Configurable preparation countdown (default 5s) with 3-2-1 acoustic chimes.
  - `ACTIVE`: Real-time set duration stopwatch.
  - `RESTING`: Automatic countdown of recovery duration upon set completion.
  - `WAITING_NEXT`: Strict boundary condition that chimes on rest completion and **waits for user prompt** (no hazardous auto-starting).
  - `PAUSED` / `INTERRUPTED`: Graceful suspension and recovery during session interruption.
- Event tracking table (`paceEvents`) in IndexedDB recording every timestamped user and timer transition for auditability.

#### 6. Dual Scoring System (100 Points Each)
- **일반 운동 점수 (General Workout Score, 100점)**:
  - 목표 세트 달성률 (50점)
  - 기록 완성도 (25점)
  - 계획 종목 달성률 (15점)
  - 세션 마무리 (10점)
  - Renormalized automatically when in Free Workout mode to ensure fair evaluation.
- **페이스 챌린지 점수 (Pace Challenge Score, 100점)**:
  - 시작 버튼 실행률 (35점)
  - 준비 카운트다운 완료율 (15점)
  - 휴식 후 재시작 타이밍 (30점)
  - 타이머 흐름 정상 진행도 (20점)
  - Incorporates configurable grace period (15s default) and excused rest extension logic.

#### 7. Local Storage & Zero External Dependency Architecture
- Pure client-side persistence powered by **Dexie (IndexedDB)**.
- Full offline-readiness: zero external AI APIs, external auth, Firebase, or Supabase required.
- JSON backup export and restore utility with integrity validation.

