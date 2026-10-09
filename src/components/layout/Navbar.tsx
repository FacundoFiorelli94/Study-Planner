import React from 'react';
import { BookOpen, Calendar, LineChart, MessageSquare, Bell, Plus, Timer, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: 'roadmap' | 'planner' | 'progress' | 'chat';
  onSelectTab: (tab: 'roadmap' | 'planner' | 'progress' | 'chat') => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenNewRoadmapModal: () => void;
  onOpenTimerModal: () => void;
  activeRoadmapTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenNewRoadmapModal,
  onOpenTimerModal,
  activeRoadmapTitle,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold tracking-wider text-base shadow-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Kamino
            </span>
            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[170px] sm:max-w-[240px]">
              {activeRoadmapTitle}
            </span>
          </div>
        </div>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('roadmap')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'roadmap'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rutas de Estudio</span>
          </button>

          <button
            onClick={() => onSelectTab('planner')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'planner'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Planificador Semanal</span>
          </button>

          <button
            onClick={() => onSelectTab('progress')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'progress'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Progreso & Portafolio</span>
          </button>

          <button
            onClick={() => onSelectTab('chat')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'chat'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mentor IA & Thinking</span>
          </button>
        </nav>

        {/* Zone 3: Primary action + Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenTimerModal}
            title="Temporizador de Enfoque Pomodoro"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Timer className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenNotifications}
            title="Notificaciones automáticas"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNewRoadmapModal}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Ruta</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center justify-around bg-white">
        <button
          onClick={() => onSelectTab('roadmap')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            currentTab === 'roadmap' ? 'text-slate-950 font-bold' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          Rutas
        </button>
        <button
          onClick={() => onSelectTab('planner')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            currentTab === 'planner' ? 'text-slate-950 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          Planificador
        </button>
        <button
          onClick={() => onSelectTab('progress')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            currentTab === 'progress' ? 'text-slate-950 font-bold' : 'text-slate-500'
          }`}
        >
          <LineChart className="w-5 h-5 mb-0.5" />
          Progreso
        </button>
        <button
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            currentTab === 'chat' ? 'text-slate-950 font-bold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          Mentor IA
        </button>
      </div>
    </header>
  );
};
