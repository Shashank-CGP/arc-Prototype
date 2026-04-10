'use client';

type Screen = 'queue' | 'detail' | 'site' | 'config' | 'validation-queue' | 'validation-detail' | 'contract-acceptance' | 'graph-validation';

interface Props {
  currentScreen: Screen;
  onNavigate: (screen: 'queue' | 'config' | 'validation-queue' | 'graph-validation') => void;
}

export function Sidebar({ currentScreen, onNavigate }: Props) {
  return (
    <aside className="w-60 min-h-screen bg-[#1e293b] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <span className="text-white font-black text-sm tracking-tight">A</span>
          </div>
          <div>
            <div className="text-white font-bold text-base tracking-tight leading-none">Arc</div>
            <div className="text-slate-400 text-[10px] leading-none mt-0.5">Energy Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
          Workflows
        </div>

        <button
          onClick={() => onNavigate('queue')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentScreen === 'queue' || currentScreen === 'detail' || currentScreen === 'site'
              ? 'bg-sky-600 text-white'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Curve Approval Queue
        </button>

        <button
          onClick={() => onNavigate('validation-queue')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentScreen === 'validation-queue' || currentScreen === 'validation-detail' || currentScreen === 'contract-acceptance'
              ? 'bg-sky-600 text-white'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Validation Queue
        </button>

        <button
          onClick={() => onNavigate('graph-validation')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentScreen === 'graph-validation'
              ? 'bg-sky-600 text-white'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Graph Validation
        </button>

        <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-3 mb-1">
          Settings
        </div>

        <button
          onClick={() => onNavigate('config')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentScreen === 'config'
              ? 'bg-sky-600 text-white'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Auto-Approval Config
        </button>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold">
            TW
          </div>
          <div>
            <div className="text-white text-xs font-medium">Tom Walsh</div>
            <div className="text-slate-400 text-[10px]">Analyst</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
