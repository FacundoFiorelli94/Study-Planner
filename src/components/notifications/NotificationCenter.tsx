import React, { useState } from 'react';
import { StudyNotification, UserSettings } from '../../types/study';
import { StorageService } from '../../services/storageService';
import { NotificationEngine } from '../../services/notificationEngine';
import {
  Bell,
  X,
  CheckCheck,
  Flame,
  Award,
  Clock,
  Settings,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: StudyNotification[];
  onNotificationsUpdated: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  const [settings, setSettings] = useState<UserSettings>(() =>
    StorageService.getSettings()
  );
  const [browserPermGranted, setBrowserPermGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
    onNotificationsUpdated();
  };

  const handleRequestBrowserPerm = async () => {
    const granted = await NotificationEngine.requestBrowserPermission();
    setBrowserPermGranted(granted);
    const updated = { ...settings, browserNotifications: granted };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleSaveSettings = () => {
    StorageService.saveSettings(settings);
    onNotificationsUpdated();
    setActiveTab('list');
  };

  const handleTestNotification = () => {
    NotificationEngine.simulateStudyReminder();
    onNotificationsUpdated();
  };

  const getNotificationIcon = (type: StudyNotification['type']) => {
    switch (type) {
      case 'streak':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'milestone':
        return <Award className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181a22] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#262a36] space-y-4 max-h-[85vh] flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262a36] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-300 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Centro de Notificaciones
              </h2>
              <span className="text-[11px] text-slate-400">
                Alertas automáticas de estudio y recordatorios
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'list' ? 'settings' : 'list')}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#20242f] transition-colors"
              title="Configuración de avisos"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#20242f] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === 'list' ? (
          <>
            {/* Quick Action Bar */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleTestNotification}
                className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Simular Aviso Automático</span>
              </button>

              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors text-xs font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Marcar todo como leído</span>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No tienes notificaciones pendientes.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      n.read
                        ? 'bg-[#14161f] border-[#222634] text-slate-400'
                        : 'bg-[#1b1f2b] border-[#2e3447] text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">{getNotificationIcon(n.type)}</div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold leading-tight text-slate-100">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 tabular-nums font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Settings Tab */
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            <h3 className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              Preferencias de Recordatorios Automáticos
            </h3>

            {/* Browser push */}
            <div className="p-3.5 bg-[#14161f] rounded-xl border border-[#262a36] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">
                    Notificaciones en el Navegador
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Recibe alertas emergentes incluso si tienes otra pestaña activa.
                  </span>
                </div>
                {!browserPermGranted ? (
                  <button
                    type="button"
                    onClick={handleRequestBrowserPerm}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm active:scale-95 transition-colors"
                  >
                    Permitir
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold">Activo ✓</span>
                )}
              </div>
            </div>

            {/* Reminder Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Hora preferida de aviso diario:
              </label>
              <input
                type="time"
                value={settings.studyReminderTime}
                onChange={(e) =>
                  setSettings({ ...settings, studyReminderTime: e.target.value })
                }
                className="w-full text-xs font-medium p-2.5 rounded-lg border border-[#2a2f3e] bg-[#14161f] text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Daily goal */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Meta de estudio diario recomendada (minutos):
              </label>
              <select
                value={settings.dailyGoalMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dailyGoalMinutes: Number(e.target.value),
                  })
                }
                className="w-full text-xs font-medium p-2.5 rounded-lg border border-[#2a2f3e] bg-[#14161f] text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value={45} className="bg-[#14161f]">45 minutos</option>
                <option value={60} className="bg-[#14161f]">60 minutos (1 hora)</option>
                <option value={90} className="bg-[#14161f]">90 minutos (1.5 horas)</option>
                <option value={120} className="bg-[#14161f]">120 minutos (2 horas)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-[#262a36] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm active:scale-95 transition-colors"
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
