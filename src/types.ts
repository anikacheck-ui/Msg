export type PortalThemeId = 'cyber-toxic' | 'deep-void' | 'red-obsidian' | 'vapor-dream';

export interface SecretMessage {
  id: string;
  sender: string;
  isAnonymous: boolean;
  content: string;
  category: 'confession' | 'feedback' | 'question' | 'appreciation' | 'other';
  pin: string; // 4 digit custom tracking PIN
  timestamp: number;
  read: boolean;
  replyText?: string;
  repliedAt?: number;
}

export interface PortalTheme {
  id: PortalThemeId;
  name: string;
  bgGrad: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
  accentGlow: string;
  borderColor: string;
  badgeStyle: string;
}

export const PORTAL_THEMES: Record<PortalThemeId, PortalTheme> = {
  'cyber-toxic': {
    id: 'cyber-toxic',
    name: 'Cyber Toxic',
    bgGrad: 'from-[#030712] via-[#022c22] to-[#01140e]',
    cardBg: 'bg-[#031510]/35 border-[#0d9488]/35 backdrop-blur-2xl',
    textPrimary: 'text-emerald-300',
    textSecondary: 'text-teal-400/70',
    accentColor: 'emerald',
    accentGlow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]',
    borderColor: 'border-emerald-500/15',
    badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  },
  'deep-void': {
    id: 'deep-void',
    name: 'Deep Void',
    bgGrad: 'from-[#03000a] via-[#110124] to-[#040114]',
    cardBg: 'bg-[#0a041a]/35 border-[#a855f7]/35 backdrop-blur-2xl',
    textPrimary: 'text-purple-300',
    textSecondary: 'text-indigo-400/70',
    accentColor: 'purple',
    accentGlow: 'shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]',
    borderColor: 'border-purple-500/15',
    badgeStyle: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
  },
  'red-obsidian': {
    id: 'red-obsidian',
    name: 'Red Obsidian',
    bgGrad: 'from-[#050101] via-[#1a0505] to-[#0c0101]',
    cardBg: 'bg-[#120303]/35 border-[#ef4444]/35 backdrop-blur-2xl',
    textPrimary: 'text-red-400',
    textSecondary: 'text-rose-500/60',
    accentColor: 'red',
    accentGlow: 'shadow-[0_0_25px_rgba(239,68,68,0.15)] hover:shadow-[0_0_35px_rgba(239,68,68,0.25)]',
    borderColor: 'border-red-500/15',
    badgeStyle: 'bg-red-500/10 text-red-300 border-red-500/20'
  },
  'vapor-dream': {
    id: 'vapor-dream',
    name: 'Vapor Dream',
    bgGrad: 'from-[#0a0b1e] via-[#24132b] to-[#120822]',
    cardBg: 'bg-[#18112d]/35 border-[#ec4899]/35 backdrop-blur-2xl',
    textPrimary: 'text-pink-300',
    textSecondary: 'text-cyan-300/70',
    accentColor: 'pink',
    accentGlow: 'shadow-[0_0_25px_rgba(236,72,153,0.15)] hover:shadow-[0_0_35px_rgba(236,72,153,0.25)]',
    borderColor: 'border-pink-500/15',
    badgeStyle: 'bg-pink-500/10 text-pink-300 border-pink-500/20'
  }
};
