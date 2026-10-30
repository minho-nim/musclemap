import React, { useState, useEffect, useRef } from 'react';
import { db, exportDatabaseBackup, importDatabaseBackup } from '../../db';
import { UserSettings, TimerMode } from '../../types';
import {
  X,
  Download,
  Upload,
  Volume2,
  Smartphone,
  Sliders,
  Check,
  AlertCircle,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onDataChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onDataChanged }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const s = await db.settings.get('user_default');
      if (s) setSettings(s);
    }
    load();
  }, []);

  const handleUpdateTimerMode = async (mode: TimerMode) => {
    if (!settings) return;
    const updated: UserSettings = {
      ...settings,
      timer: { ...settings.timer, mode },
      updatedAt: new Date().toISOString(),
    };
    await db.settings.put(updated);
    setSettings(updated);
  };

  const handleToggleSound = async () => {
    if (!settings) return;
    const updated: UserSettings = {
      ...settings,
      timer: { ...settings.timer, soundEnabled: !settings.timer.soundEnabled },
      updatedAt: new Date().toISOString(),
    };
    await db.settings.put(updated);
    setSettings(updated);
  };

  const handleToggleVibrate = async () => {
    if (!settings) return;
    const updated: UserSettings = {
      ...settings,
      timer: { ...settings.timer, vibrateEnabled: !settings.timer.vibrateEnabled },
      updatedAt: new Date().toISOString(),
    };
    await db.settings.put(updated);
    setSettings(updated);
  };

  // JSON Export
  const handleExportBackup = async () => {
    try {
      const backup = await exportDatabaseBackup();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MuscleMap_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: '백업 JSON 파일이 성공적으로 다운로드되었습니다.' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: '백업 생성에 실패했습니다: ' + e?.message });
    }
  };

  // JSON Import
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        const res = await importDatabaseBackup(parsed);
        if (res.success) {
          setStatusMessage({
            type: 'success',
            text: `데이터 복원 완료! (운동 ${res.summary?.exercisesCount}개, 루틴 ${res.summary?.routinesCount}개, 세션 ${res.summary?.sessionsCount}개)`,
          });
          onDataChanged();
        } else {
          setStatusMessage({ type: 'error', text: res.error || '복원 실패' });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: '유효한 JSON 백업 파일이 아닙니다.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1D211E] border border-[#363D36] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#292E29] rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-[#F5F6F5] mb-1">앱 설정 & 데이터 관리</h3>
        <p className="text-xs text-[#A9B2AC] mb-4">MuscleMap v0.1.0</p>

        {statusMessage && (
          <div
            className={`p-3 mb-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-[#B4F34C]/20 text-[#B4F34C] border border-[#B4F34C]/40'
                : 'bg-[#FF806B]/20 text-[#FF806B] border border-[#FF806B]/40'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Rest Timer Settings */}
          {settings && (
            <div className="bg-[#252B27] p-4 rounded-2xl border border-[#363D36] space-y-3">
              <span className="text-xs font-bold text-[#F5F6F5] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#B4F34C]" />
                휴식 타이머 모드
              </span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'auto', label: '자동 모드' },
                  { id: 'adaptive', label: '적응형 모드' },
                  { id: 'manual', label: '수동 모드' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleUpdateTimerMode(m.id as TimerMode)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      settings.timer.mode === m.id
                        ? 'bg-[#B4F34C] text-[#101510] border-[#B4F34C]'
                        : 'bg-[#292E29] text-[#A9B2AC] hover:text-[#F5F6F5] border-[#363D36]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2 border-t border-[#363D36] text-xs">
                <span className="text-[#A9B2AC] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#A9B2AC]" />
                  종료 시 알림음
                </span>
                <input
                  type="checkbox"
                  checked={settings.timer.soundEnabled}
                  onChange={handleToggleSound}
                  className="w-4 h-4 accent-[#B4F34C] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A9B2AC] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#A9B2AC]" />
                  진동 알림 (지원 기기)
                </span>
                <input
                  type="checkbox"
                  checked={settings.timer.vibrateEnabled}
                  onChange={handleToggleVibrate}
                  className="w-4 h-4 accent-[#B4F34C] rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Pace Mode Settings */}
          {settings && (
            <div className="bg-[#252B27] p-4 rounded-2xl border border-[#363D36] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5F6F5] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#B4F34C]" />
                  Pace Mode (선택형 페이스 제어)
                </span>

                <input
                  type="checkbox"
                  checked={settings.paceMode?.enabled ?? false}
                  onChange={async (e) => {
                    const newPace = { ...(settings.paceMode || {}), enabled: e.target.checked };
                    const updated = { ...settings, paceMode: newPace as any };
                    await db.settings.put(updated);
                    setSettings(updated);
                  }}
                  className="w-4 h-4 accent-[#B4F34C] rounded cursor-pointer"
                />
              </div>

              <p className="text-[11px] text-[#A9B2AC] leading-relaxed">
                세트 준비 카운트다운, 스톱워치, 자동 휴식을 활성화하고 페이스 챌린지 점수를 측정합니다. (기본값: OFF)
              </p>

              {settings.paceMode?.enabled && (
                <div className="pt-2 border-t border-[#363D36] space-y-3 text-xs">
                  {/* Preparation Seconds */}
                  <div>
                    <span className="text-[11px] font-semibold text-[#A9B2AC] block mb-1.5">
                      세트 시작 전 준비 카운트다운
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[3, 5, 10, 15].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={async () => {
                            const newPace = { ...settings.paceMode, preparationSeconds: sec };
                            const updated = { ...settings, paceMode: newPace };
                            await db.settings.put(updated);
                            setSettings(updated);
                          }}
                          className={`py-1.5 font-bold rounded-lg border text-center transition-all ${
                            (settings.paceMode?.preparationSeconds || 5) === sec
                              ? 'bg-[#B4F34C] text-[#101510] border-[#B4F34C]'
                              : 'bg-[#292E29] text-[#A9B2AC] border-[#363D36]'
                          }`}
                        >
                          {sec}초
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Restart Grace Period */}
                  <div>
                    <span className="text-[11px] font-semibold text-[#A9B2AC] block mb-1.5">
                      휴식 종료 후 재시작 허용 구간 (100% 구간)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[15, 30, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={async () => {
                            const newPace = { ...settings.paceMode, restartGraceSeconds: sec };
                            const updated = { ...settings, paceMode: newPace };
                            await db.settings.put(updated);
                            setSettings(updated);
                          }}
                          className={`py-1.5 font-bold rounded-lg border text-center transition-all ${
                            (settings.paceMode?.restartGraceSeconds || 15) === sec
                              ? 'bg-[#B4F34C] text-[#101510] border-[#B4F34C]'
                              : 'bg-[#292E29] text-[#A9B2AC] border-[#363D36]'
                          }`}
                        >
                          {sec}초
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Backup & Restore */}
          <div className="bg-[#252B27] p-4 rounded-2xl border border-[#363D36] space-y-3">
            <span className="text-xs font-bold text-[#F5F6F5] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#B4F34C]" />
              로컬 데이터 백업 & 복원
            </span>

            <p className="text-[11px] text-[#A9B2AC] leading-relaxed">
              모든 운동 데이터는 안전한 브라우저 IndexedDB에 저장됩니다. 기기 변경이나 안전한 보관을 위해 JSON으로 내보내거나 가져오세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-[#292E29] hover:bg-[#363D36] text-[#F5F6F5] font-bold text-xs rounded-xl border border-[#363D36] transition-all"
              >
                <Download className="w-4 h-4 text-[#B4F34C]" />
                백업 내보내기 (JSON)
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-[#292E29] hover:bg-[#363D36] text-[#F5F6F5] font-bold text-xs rounded-xl border border-[#363D36] transition-all"
              >
                <Upload className="w-4 h-4 text-[#B4F34C]" />
                백업 가져오기
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Synchronization Notice */}
          <div className="p-3 bg-[#1D211E] rounded-xl border border-[#363D36] flex items-start gap-2 text-[11px] text-[#A9B2AC]">
            <Info className="w-4 h-4 text-[#B4F34C] shrink-0 mt-0.5" />
            <span>
              <strong>기기간 동기화 안내:</strong> PC와 모바일 간 데이터는 자동 클라우드 동기화되지 않으며, 기기를 변경하실 때는 '백업 내보내기/가져오기'를 통해 손쉽게 이전할 수 있습니다.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
