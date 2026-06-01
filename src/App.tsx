import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Lock, 
  Unlock,
  Sparkles, 
  CheckCircle2, 
  User, 
  Key,
  Database,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus,
  LogOut,
  Activity,
  Trash2,
  Calendar,
  Layers,
  MessageSquare,
  AlertTriangle,
  Heart,
  ThumbsUp,
  Smile,
  Flame,
  Search,
  Hash,
  Users,
  MessageCircle,
  Clock,
  SendHorizontal,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Globe,
  Edit3,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

import { database } from './firebase';
import { ref, push, set, get, onValue, remove } from 'firebase/database';
import { PORTAL_THEMES, PortalThemeId } from './types';
import ParticleBackground from './components/ParticleBackground';
import { motion, AnimatePresence } from 'motion/react';

interface ReactionType {
  [emoji: string]: {
    [username: string]: number; // username -> timestamp
  };
}

interface MessageType {
  id: string;
  sender: string;
  content: string;
  category: string;
  timestamp: number;
  dateString: string;
  status: string;
  reactions?: ReactionType;
  edited?: boolean;
  editedAt?: number;
}

const PRESET_EMOJIS = ['❤️', '🔥', '👍', '😂', '😮', '🎉'];

// Bilingual dictionary supporting real-time switching between English and Bengali
const TRANSLATIONS = {
  en: {
    themeLabel: "Aesthetic Core:",
    verifiedCloud: "Connected to Firebase Secure Realtime Cloud Hub",
    mainTitle: "Whisper Lobby",
    subTitle: "Cyber Secret Portal • Easy & Secure",
    chooseUsername: "Choose your identity username:",
    usernameHint: "Anyone can read transmissions, but you need a secure handle registered on Firebase to broadcast whispers.",
    usernamePlaceholder: "e.g. cyber_ghost",
    usernameRequired: "Please enter an identity username first.",
    usernameLengthError: "Username must be at least 3 characters.",
    usernameInvalidChar: "Use letters, numbers, dash or underscores only.",
    checkingRegistry: "Pinging database registry...",
    checkAvailability: "Check Handle Availability",
    targetUsername: "Target Identity:",
    identityTaken: "🛡️ Handle register locked! Provide password to verify session.",
    identityFree: "🎉 Identity open! Enter a secret passcode to secure it permanently.",
    passcodeLabel: "Secret Passcode Key:",
    passcodePlaceholder: "Choose 4+ letters or numbers...",
    passcodeRequired: "Please enter both credentials.",
    passcodeLengthError: "Passcode must be 4+ characters for crypt stability.",
    registerSuccess: "Registry secure! Entering live Lobby stream...",
    loginSuccess: "Session authorized! Synchronizing secret threads...",
    dbOffline: "Database offline. Check console logs.",
    wrongPasscode: "Access Denied. Passcode does not match.",
    authCheckFail: "Failed verifying credentials from registry.",
    backBtn: "Back",
    unlockBtn: "🔐 Enter Safe Session",
    registerBtn: "🚀 Secure Username Now",
    securedStream: "Secured Direct Stream:",
    encryptionEngaged: "Direct client node encryption actively engaged",
    exitBtn: "Disconnect",
    decryptingFeeds: "Decrypting live secure feeds...",
    noSecretsTitle: "Vault Stream Empty",
    noSecretsDesc: "Zero transmissions recorded in this motif. Send the first cryptographic whisper below.",
    meText: "me",
    shredTitle: "Shred permanently from database",
    shredConfirm: "Do you want to permanently delete/shred this message from Firebase?",
    motifLabel: "Filter Category:",
    totalMessages: "Total Whispers:",
    totalMessagesSuffix: " entries",
    draftPlaceholderCommon: "Type message to transmit... (Press Enter)",
    encryptingText: "[ ENCRYPTING ]",
    routingText: "[ ROUTING ]",
    footerText: "WhisperBox • Created Safely & Zero Logged • Live on Firebase Cloud Instances",
    dismiss: "dismiss",
    quickInject: "Fast Injects:",
    searchPlaceholder: "Search secrets by content or sender...",
    spamWarning: "Holographic cool down active. Wait {sec}s.",
    editTitle: "Edit Secret Whisper",
    editConfirm: "Save Changes",
    editCancel: "Cancel",
    editedLabel: "(edited)",
    categories: {
      all: "#all",
      general: "#general",
      confession: "#confession",
      feedback: "#feedback",
      appreciation: "#appreciation"
    }
  },
  bn: {
    themeLabel: "আবহ বা থিম:",
    verifiedCloud: "ফায়ারবেস রিয়েলটাইম সুরক্ষিত ক্লাউডের সাথে সংযুক্ত",
    mainTitle: "গোপন চ্যাট লবি",
    subTitle: "Cyber Whisper Portal • অতি সুরক্ষিত",
    chooseUsername: "নাম বা ইউজারনেম পছন্দ করুন:",
    usernameHint: "বার্তা সবাই পড়তে পারবে, তবে পাঠাতে ও সিকিউরিটি লক করতে একটি নির্দিষ্ট নাম বেছে নেওয়া দরকার।",
    usernamePlaceholder: "যেমন: koushik_vibe",
    usernameRequired: "দয়া করে প্রথমে একটি ইউজারনেম দিন!",
    usernameLengthError: "ইউজারনেমটি কমপক্ষে ৩ অক্ষরের হতে হবে।",
    usernameInvalidChar: "ইউজারনেমে কেবল ইংরেজি অক্ষর, সংখ্যা, ড্যাশ বা আন্ডারস্কোর ব্যবহার করুন।",
    checkingRegistry: "ডাটাবেজ চেক করা হচ্ছে...",
    checkAvailability: "ইউজারনেম অ্যাভেইলেবিলিটি চেক করুন",
    targetUsername: "পছন্দকৃত নাম:",
    identityTaken: "🛡️ এই নামটি আগে থেকেই লক করা রয়েছে! আপনার সুরক্ষিত সিক্রেট পাসকোডটি দিয়ে আনলক করে নিন।",
    identityFree: "🎉 বাহ! লক করার জন্য এই নামটি উন্মুক্ত আছে। আপনার পছন্দের ৪ সংখ্যার পাসকোড সেট করে প্রোফাইল লক করুন।",
    passcodeLabel: "সিক্রেট সিকিউরিটি পাসকোড লিখুন:",
    passcodePlaceholder: "কমপক্ষে ৪ অক্ষরের পাসকোড...",
    passcodeRequired: "দয়া করে সবগুলো ঘর পূরণ করুন!",
    passcodeLengthError: "ক্রিপ্টোগ্রাফিক সুরক্ষার জন্য পাসকোডটি কমপক্ষে ৪ অক্ষরের হতে হবে।",
    registerSuccess: "রেজিস্ট্রেশন সফল হয়েছে! চ্যাট লবিতে প্রবেশ করানো হচ্ছে...",
    loginSuccess: "পাসকোড মিলেছে! আপনার সুরক্ষিত সিক্রেট চ্যাট লোড হচ্ছে...",
    dbOffline: "ডাটাবেজ কানেকশন অফলাইন রয়েছে।",
    wrongPasscode: "প্রবেশাধিকার নাকচ! পাসকোডটি ডাটাবেজ রেকর্ডের সাথে মিলছে না।",
    authCheckFail: "সুরক্ষা যাচাইকরণে অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে।",
    backBtn: "পিছনে যান",
    unlockBtn: "🔐 লবি আনলক করুন",
    registerBtn: "🚀 আইডি লক করুন",
    securedStream: "সুরক্ষিত চ্যাট:",
    encryptionEngaged: "এন্ড-টু-এন্ড এনক্রিপশন সক্রিয় রয়েছে",
    exitBtn: "বেরিয়ে যান",
    decryptingFeeds: "বার্তা ডিক্রিপ্ট করা হচ্ছে...",
    noSecretsTitle: "কোনো গোপন বার্তা নেই",
    noSecretsDesc: "এখানে এখনো কেউ গোপন বার্তা পাঠায়নি। নিচের প্যানেল থেকে প্রথম গোপন চ্যাটটি শুরু করুন!",
    meText: "আমি",
    shredTitle: "বার্তা চিরতরে ডাটাবেজ থেকে মুছে ফেলুন",
    shredConfirm: "আপনি কি নিশ্চিতভাবে এই গোপন বার্তাটি ডাটাবেজ থেকে মুছে ফেলতে চান?",
    motifLabel: "ফিল্টার ক্যাটাগরি:",
    totalMessages: "মোট বার্তা:",
    totalMessagesSuffix: " টি",
    draftPlaceholderCommon: "গোপন বার্তা লিখুন... (পাঠাতে Enter চাপুন)",
    encryptingText: "[ এনক্রিপ্ট হচ্ছে ]",
    routingText: "[ পাঠানো হচ্ছে ]",
    footerText: "হুইস্পার বক্স • সরাসরি সেন্ট্রাল ফায়ারবেস ক্লাউডের মাধ্যমে সুরক্ষিতভাবে পরিচালিত",
    dismiss: "ডismiss",
    quickInject: "ইমোজি ইনজেক্ট:",
    searchPlaceholder: "মেসেজ বা মেইল বা প্রেরকে সার্চ করুন...",
    spamWarning: "হলো-কুলডাউন সক্রিয়। {sec} সেকেন্ড পরে চেষ্টা করুন।",
    editTitle: "গোপন বার্তা সংশোধন করুন",
    editConfirm: "পরিবর্তন সেভ করুন",
    editCancel: "বাতিল",
    editedLabel: "(সম্পাদিত)",
    categories: {
      all: "#সব-চ্যাট",
      general: "#সাধারণ",
      confession: "#স্বীকারোক্তি",
      feedback: "#মতামত",
      appreciation: "#প্রশংসা"
    }
  }
};

export default function App() {
  // Theme state
  const [themeId, setThemeId] = useState<PortalThemeId>(() => {
    const saved = localStorage.getItem('whisper_portal_theme');
    return (saved as PortalThemeId) || 'deep-void';
  });

  const themeConfig = PORTAL_THEMES[themeId];

  // Language state (en / bn) - Defaults to bn based on previous user input but allows seamless switching
  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    const saved = localStorage.getItem('whisper_portal_lang');
    return (saved as 'en' | 'bn') || 'bn';
  });

  const t = TRANSLATIONS[lang];

  // Auth/Identity states
  const [username, setUsername] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [userExists, setUserExists] = useState<boolean | null>(null); // null = not checked, false = register, true = login
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Logged-in User state
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('whisper_active_user');
  });

  // Messenger State
  const [messageText, setMessageText] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [transmissionStep, setTransmissionStep] = useState<'idle' | 'encrypting' | 'routing' | 'delivered'>('idle');
  const [errorText, setErrorText] = useState<string>('');

  // Extended States for VIP Upgrades
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('whisper_sfx_enabled') !== 'false';
  });
  const [cooldown, setCooldown] = useState<number>(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live messages list
  const [allMessages, setAllMessages] = useState<MessageType[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  // Chat window scroll reference
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Audio Synthesizer for Retro/Cyber Haptic feedback
  const playSynthSound = (type: 'send' | 'receive' | 'delete' | 'tap') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'send') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else if (type === 'receive') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.setValueAtTime(780, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'delete') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'tap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch (e) {
      // Audio autoplay restrictions bypass silently
    }
  };

  // Sync SFX state to localStorage
  useEffect(() => {
    localStorage.setItem('whisper_sfx_enabled', String(soundEnabled));
  }, [soundEnabled]);

  // Spambot Cooldown interval timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Sync theme selection to save state in localstorage
  useEffect(() => {
    localStorage.setItem('whisper_portal_theme', themeId);
  }, [themeId]);

  // Sync language selection to save state in localstorage
  useEffect(() => {
    localStorage.setItem('whisper_portal_lang', lang);
  }, [lang]);

  // Load live secrets list from Firebase instance
  useEffect(() => {
    if (!database) return;

    setIsLoadingMessages(true);
    const messagesRef = ref(database, 'secret_messages');

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const val = snapshot.val();
      const list: MessageType[] = [];

      if (val) {
        Object.keys(val).forEach((key) => {
          list.push({
            id: key,
            ...val[key]
          });
        });
      }

      // Sort chronological (oldest to newest for scrolling chat view)
      list.sort((a, b) => a.timestamp - b.timestamp);

      setAllMessages((prevList) => {
        // Trigger a sweet synth "receive" sound if a new message comes from another user
        if (prevList.length > 0 && list.length > prevList.length) {
          const lastMsg = list[list.length - 1];
          const activeUser = localStorage.getItem('whisper_active_user');
          if (lastMsg && lastMsg.sender !== activeUser) {
            playSynthSound('receive');
          }
        }
        return list;
      });

      setIsLoadingMessages(false);
    }, (err) => {
      console.error("Firebase realtime communication error:", err);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [soundEnabled]);

  // Automatic scroll anchor
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, currentUser]);

  // Helper: Verify if username already registered in Firebase Database
  const handleCheckUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setAuthError(t.usernameRequired);
      return;
    }

    if (cleanUsername.length < 3) {
      setAuthError(t.usernameLengthError);
      return;
    }

    // Sanitize user key
    const sanitizedUserKey = cleanUsername.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!sanitizedUserKey) {
      setAuthError(t.usernameInvalidChar);
      return;
    }

    setCheckingUsername(true);

    try {
      if (!database) {
        throw new Error(t.dbOffline);
      }

      const userDbRef = ref(database, `users/${sanitizedUserKey}`);
      const snapshot = await get(userDbRef);

      if (snapshot.exists()) {
        // Identity taken, prompt login
        setUserExists(true);
        setAuthSuccess(t.identityTaken);
      } else {
        // Identity free, prompt instant register
        setUserExists(false);
        setAuthSuccess(t.identityFree);
      }
    } catch (err: any) {
      setAuthError(err.message || t.authCheckFail);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Perform Register / Login Handshake
  const handleIdentityHandshake = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const cleanUsername = username.trim();
    const cleanPasscode = passcode.trim();

    if (!cleanUsername || !cleanPasscode) {
      setAuthError(t.passcodeRequired);
      return;
    }

    if (cleanPasscode.length < 4) {
      setAuthError(t.passcodeLengthError);
      return;
    }

    const sanitizedUserKey = cleanUsername.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setIsAuthLoading(true);

    try {
      if (!database) {
        throw new Error(t.dbOffline);
      }

      const userDbRef = ref(database, `users/${sanitizedUserKey}`);

      if (userExists === false) {
        // REGISTER DIRECTLY: Write identity entry
        const newUserPayload = {
          username: cleanUsername,
          password: cleanPasscode,
          createdAt: Date.now()
        };

        await set(userDbRef, newUserPayload);
        setAuthSuccess(t.registerSuccess);
        
        setTimeout(() => {
          localStorage.setItem('whisper_active_user', cleanUsername);
          setCurrentUser(cleanUsername);
          setIsAuthLoading(false);
        }, 1200);

      } else if (userExists === true) {
        // LOGIN VERIFY: Fetch and match credentials
        const snapshot = await get(userDbRef);
        const registeredData = snapshot.val();

        if (registeredData.password !== cleanPasscode) {
          setAuthError(t.wrongPasscode);
          setIsAuthLoading(false);
          return;
        }

        setAuthSuccess(t.loginSuccess);
        
        setTimeout(() => {
          localStorage.setItem('whisper_active_user', registeredData.username);
          setCurrentUser(registeredData.username);
          setIsAuthLoading(false);
        }, 1200);
      }
    } catch (err: any) {
      setAuthError(err.message || t.authCheckFail);
      setIsAuthLoading(false);
    }
  };

  // Log Out/Exit secure environment
  const handleExitPortal = () => {
    localStorage.removeItem('whisper_active_user');
    setCurrentUser(null);
    setUsername('');
    setPasscode('');
    setUserExists(null);
    setAuthSuccess('');
    setAuthError('');
  };

  // Transmit secret message with custom holographic step animations
  const handleTransmitSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentUser) return;

    if (cooldown > 0) {
      setErrorText(t.spamWarning.replace('{sec}', String(cooldown)));
      return;
    }

    setErrorText('');
    
    // Launch gorgeous holographic steps!
    setTransmissionStep('encrypting');

    const timestamp = Date.now();
    const newMsgPayload = {
      sender: currentUser,
      content: messageText.trim(),
      category: activeCategory === 'all' ? 'general' : activeCategory,
      timestamp,
      dateString: new Date(timestamp).toLocaleString(),
      status: 'sealed'
    };

    // Step 1: Encrypting
    setTimeout(async () => {
      setTransmissionStep('routing');
      
      // Step 2: Routing to Database
      setTimeout(async () => {
        try {
          if (database) {
            const messagesRef = ref(database, 'secret_messages');
            const newMessageRef = push(messagesRef);
            await set(newMessageRef, newMsgPayload);
            
            // Deliver Confirmation stage with audio feedback
            setTransmissionStep('delivered');
            setMessageText('');
            playSynthSound('send');
            setCooldown(5); // Spambot security cooling down active
            
            // Reset to idle after success view
            setTimeout(() => {
              setTransmissionStep('idle');
            }, 1800);
          } else {
            throw new Error(t.dbOffline);
          }
        } catch (err: any) {
          setErrorText(err.message || "Message transmission error.");
          setTransmissionStep('idle');
        }
      }, 700);

    }, 850);
  };

  // Securely delete / shred message on Firebase
  const handleDeleteSecret = async (msgId: string) => {
    if (!window.confirm(t.shredConfirm)) return;

    try {
      if (database) {
        await remove(ref(database, `secret_messages/${msgId}`));
        playSynthSound('delete');
      }
    } catch (err) {
      console.error("Fault shredding transaction:", err);
    }
  };

  // Initialize editing mode for a particular message
  const handleStartEdit = (msgId: string, currentContent: string) => {
    playSynthSound('tap');
    setEditingMessageId(msgId);
    setEditingText(currentContent);
  };

  // Cancel any ongoing message edits
  const handleCancelEdit = () => {
    playSynthSound('tap');
    setEditingMessageId(null);
    setEditingText('');
  };

  // Save modified content back to Firebase Realtime Database
  const handleSaveEdit = async (msgId: string) => {
    if (!editingText.trim()) return;

    try {
      if (database) {
        const msgRef = ref(database, `secret_messages/${msgId}`);
        const found = allMessages.find(m => m.id === msgId);
        if (found) {
          await set(msgRef, {
            ...found,
            content: editingText.trim(),
            edited: true,
            editedAt: Date.now()
          });
          playSynthSound('send');
          setEditingMessageId(null);
          setEditingText('');
        }
      }
    } catch (err: any) {
      setErrorText(err.message || "Could not save message changes.");
    }
  };

  // Toggle quick reactions
  const handleToggleReaction = async (msgId: string, emoji: string) => {
    if (!database || !currentUser) return;
    const cleanUserKey = currentUser.replace(/[^a-z0-9_-]/gi, '');
    const reactRef = ref(database, `secret_messages/${msgId}/reactions/${emoji}/${cleanUserKey}`);
    
    try {
      playSynthSound('tap');
      const snapshot = await get(reactRef);
      if (snapshot.exists()) {
        await remove(reactRef);
      } else {
        await set(reactRef, Date.now());
      }
    } catch (err) {
      console.error("Reaction setup error:", err);
    }
  };

  // Compute filtered messages based on category selections and real-time search texts
  const filteredMessages = allMessages.filter((msg) => {
    const isCategoryMatch = activeCategory === 'all' || msg.category === activeCategory;
    const isSearchMatch = 
      !searchQuery.trim() ||
      msg.content.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      msg.sender.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return isCategoryMatch && isSearchMatch;
  });

  return (
    <div className={`min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-b ${themeConfig.bgGrad} text-slate-100 px-4 py-8 overflow-x-hidden transition-all duration-700 font-sans`}>
      {/* 🔮 Aesthetic Animated Particle Field */}
      <ParticleBackground themeId={themeId} />

      {/* Dynamic Upper Laser Flash Background */}
      <div className="absolute top-0 inset-x-0 h-[320px] bg-radial-gradient from-purple-500/10 to-transparent pointer-events-none z-0" />

      {/* Floating Header Actions block */}
      <div className="fixed top-4 right-4 z-50 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5 flex items-center gap-3 shadow-2xl">
        {/* Language Quick Toggle */}
        <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button 
            onClick={() => setLang('en')}
            className={`text-[10px] font-mono tracking-wider transition-all cursor-pointer font-bold uppercase ${lang === 'en' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-350'}`}
          >
            ENG
          </button>
          <span className="text-[10px] text-slate-600">|</span>
          <button 
            onClick={() => setLang('bn')}
            className={`text-[10px] tracking-wider transition-all cursor-pointer font-bold ${lang === 'bn' ? 'text-pink-400' : 'text-slate-500 hover:text-slate-350'}`}
          >
            বাংলা
          </button>
        </div>

        {/* Theme select dropdown */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black leading-none">{t.themeLabel}</span>
          <select 
            value={themeId} 
            onChange={(e) => setThemeId(e.target.value as PortalThemeId)}
            className="text-[10px] font-mono bg-transparent border-none text-slate-300 focus:outline-none cursor-pointer font-bold uppercase tracking-wide"
            id="aesthetic-theme-picker"
          >
            <option value="deep-void" className="bg-slate-950 text-purple-300">void</option>
            <option value="cyber-toxic" className="bg-slate-950 text-emerald-300">toxic</option>
            <option value="red-obsidian" className="bg-slate-950 text-red-400">obsidian</option>
            <option value="vapor-dream" className="bg-slate-950 text-pink-300">dream</option>
          </select>
        </div>

        {/* Dynamic SFX Sound toggle */}
        <button
          onClick={() => {
            const nextVal = !soundEnabled;
            setSoundEnabled(nextVal);
            if (nextVal) {
              try {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                  const ctx = new AudioCtx();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.frequency.setValueAtTime(800, ctx.currentTime);
                  gain.gain.setValueAtTime(0.02, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.16);
                }
              } catch (e) {}
            }
          }}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-all cursor-pointer"
          title={soundEnabled ? "SFX On" : "SFX Off"}
          id="sound-sfx-toggle-btn"
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0 animate-pulse" />
          )}
          <span className="text-[9.5px] font-mono font-bold tracking-wider uppercase">
            {soundEnabled ? "SFX" : "MUTE"}
          </span>
        </button>
      </div>

      {/* Connection active status bar */}
      <div className="fixed bottom-4 left-4 z-40 hidden md:flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1 bg-black/30 rounded-full border border-white/5 text-[9px] font-mono uppercase text-slate-400 tracking-wider">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        <span>{t.verifiedCloud}</span>
      </div>

      {/* Interactive Main Shell view */}
      <div className="w-full max-w-xl z-20 relative px-1 sm:px-0">
        
        <AnimatePresence mode="wait">
          {!currentUser ? (
            /* ================== REGISTER / LOGIN SCREEN (STAGE 1) ================== */
            <motion.div
              key="auth-card-step"
              initial={{ opacity: 0, y: 35, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.97 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`w-full ${themeConfig.cardBg} border backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.85)] relative overflow-hidden`}
              id="verification-card-box"
            >
              {/* Continuous Cyber Scanning Laser Line decoration */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-[bounce_5s_infinite_linear] pointer-events-none" />

              <div className="text-center mb-8 relative">
                <div className="inline-flex p-3 bg-white/[0.03] border border-white/5 rounded-2xl mb-3 shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]">
                  <Unlock className={`h-6 w-6 ${themeConfig.textPrimary} animate-pulse`} />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-wider text-white">
                  {t.mainTitle}
                </h1>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1.5 leading-none">
                  {t.subTitle}
                </p>
                <div className="h-[1.5px] w-14 bg-gradient-to-r from-transparent via-slate-500/20 to-transparent mx-auto mt-4" />
              </div>

              <AnimatePresence mode="wait">
                {userExists === null ? (
                  /* STEP 1A: Username check */
                  <motion.form
                    key="enter-username-form"
                    onSubmit={handleCheckUsername}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-300 uppercase tracking-widest font-black">
                        {t.chooseUsername}
                      </label>
                      <p className="text-[11px] font-mono text-slate-400 leading-tight">
                        {t.usernameHint}
                      </p>
                      <div className="relative mt-2">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          maxLength={15}
                          placeholder={t.usernamePlaceholder}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-black/45 border border-white/10 rounded-2xl py-3 px-10 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-cyan-400 transition-all font-bold"
                          id="verify-username-input"
                        />
                      </div>
                    </div>

                    {authError && (
                      <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-405 text-red-400 rounded-xl text-[10.5px] font-mono flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5 animate-pulse" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={checkingUsername || !username.trim()}
                      className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500/10 via-purple-600/20 to-pink-500/15 border border-white/10 hover:border-slate-300/40 rounded-2xl font-mono text-xs font-black uppercase tracking-widest text-slate-200 hover:text-white transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                      id="check-username-btn"
                    >
                      {checkingUsername ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />
                          <span>{t.checkingRegistry}</span>
                        </div>
                      ) : (
                        <>
                          <span>{t.checkAvailability}</span>
                          <ChevronRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  /* STEP 1B: Input and register / login passcode key */
                  <motion.form
                    key="enter-passcode-form"
                    onSubmit={handleIdentityHandshake}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    <div className="bg-black/55 p-4 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">{t.targetUsername}</span>
                        <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white`}>
                          @{username}
                        </span>
                      </div>
                      <p className="text-[10.5px] font-mono leading-relaxed text-slate-400">
                        {userExists ? t.identityTaken : t.identityFree}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">
                        {t.passcodeLabel}
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type={showPasscode ? "text" : "password"}
                          required
                          placeholder={t.passcodePlaceholder}
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          className="w-full bg-black/45 border border-white/10 rounded-2xl py-3 px-10 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-cyan-400 transition-all font-bold"
                          id="secure-identity-passcode"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasscode(!showPasscode)}
                          className="absolute right-3.5 top-3.5 text-slate-550 text-slate-500 hover:text-white"
                          id="toggle-passcode-visibility"
                        >
                          {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {authError && (
                      <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-[10.5px] font-mono">
                        ⚠️ {authError}
                      </div>
                    )}

                    {authSuccess && (
                      <div className="p-3 bg-emerald-950/25 border border-emerald-500/25 text-emerald-300 rounded-xl text-[10.5px] font-mono">
                        ✓ {authSuccess}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setUserExists(null); setAuthError(''); setAuthSuccess(''); setPasscode(''); }}
                        className="py-3 px-4 bg-white/5 border border-white/5 hover:bg-white/10 text-[10.5px] font-mono tracking-wider font-bold uppercase rounded-2xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                        id="back-username-btn"
                      >
                        {t.backBtn}
                      </button>

                      <button
                        type="submit"
                        disabled={isAuthLoading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500/10 via-purple-600/20 to-pink-500/10 border border-white/15 hover:border-slate-300/40 rounded-2xl font-mono text-xs font-black uppercase tracking-widest text-[#fbbf24] hover:text-white transition-all cursor-pointer disabled:opacity-40 text-center flex justify-center items-center gap-1"
                        id="authorize-handshake-btn"
                      >
                        {isAuthLoading ? (
                          "..."
                        ) : userExists ? (
                          <span>{t.unlockBtn}</span>
                        ) : (
                          <span>{t.registerBtn}</span>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

            </motion.div>
          ) : (
            /* ================== LIVE SECRET MESSENGER CONTAINER CARD (STAGE 2) ================== */
            <motion.div
              key="secret-messenger-device"
              initial={{ opacity: 0, y: 35, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className={`w-full ${themeConfig.cardBg} border backdrop-blur-2xl rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col h-[70vh] min-h-[500px] max-h-[640px] z-20`}
              id="messenger-centered-device"
            >
              {/* Scanline Sweep animation overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[150%] -translate-y-full animate-[scan_3s_infinite_linear] pointer-events-none z-10" />

              {/* Header Device Panel */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-black/20 relative z-20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/30 to-rose-500/15 border border-white/10 flex items-center justify-center font-bold font-mono text-xs text-white uppercase shadow relative">
                    {currentUser.substring(0, 2)}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#09021a] animate-pulse" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-mono text-slate-400 font-bold uppercase leading-none">
                      {t.securedStream} <span className={`${themeConfig.textPrimary} font-black`}>@{currentUser}</span>
                    </span>
                    <span className="block text-[9.5px] font-mono text-slate-500 mt-1 uppercase tracking-wider leading-none">
                      {t.encryptionEngaged}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleExitPortal}
                  className="px-2.5 py-1 bg-white/5 hover:bg-rose-500/15 border border-white/5 hover:border-rose-500/25 text-slate-400 hover:text-rose-400 text-[10px] font-mono uppercase font-black tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  title="Disconnect and log secure credentials out"
                  id="btn-close-portal"
                >
                  <LogOut className="h-3 w-3" />
                  <span>{t.exitBtn}</span>
                </button>
              </div>

              {/* Sleek Real-time Secret Search bar */}
              <div className="px-4 py-2 bg-black/15 border-b border-white/5 flex items-center gap-2 relative z-20">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-black/25 border border-white/5 rounded-xl py-1.5 pl-9 pr-8 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all font-medium"
                    id="secrets-live-search-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 hover:bg-white/10 rounded-full p-0.5 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Live Scrolling Message stream panel */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-black/15 min-h-0">
                
                {isLoadingMessages ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{t.decryptingFeeds}</p>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-xs mx-auto gap-3">
                    <MessageCircle className="h-8 w-8 text-slate-600 animate-pulse" />
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-300 uppercase">
                        {searchQuery ? (lang === 'bn' ? "কোনো মিল পাওয়া যায়নি" : "No matches found") : t.noSecretsTitle}
                      </p>
                      <p className="text-[10.5px] font-mono text-slate-500 mt-1 leading-relaxed">
                        {searchQuery ? (lang === 'bn' ? "আপনার খোঁজা শব্দ দিয়ে কোনো গোপন বার্তা খুঁজে পাওয়া যায়নি।" : "Your search keyword did not yield any whispers in this lobby.") : t.noSecretsDesc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMessages.map((msg, index) => {
                      const isSelf = msg.sender && msg.sender.toLowerCase() === currentUser.toLowerCase();
                      const reactionsMap = msg.reactions || {};

                      return (
                        <motion.div
                           key={msg.id}
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: 1, y: 0 }}
                           className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-1 relative group`}
                        >
                          {/* Sender details and Date */}
                          <div className={`flex items-center gap-1.5 px-1 text-[9px] font-mono text-slate-500 uppercase ${isSelf ? 'flex-row-reverse' : ''}`}>
                            <span className={`font-black tracking-wide ${isSelf ? 'text-cyan-400' : 'text-slate-300'}`}>
                              {msg.sender}
                            </span>
                            {isSelf && (
                              <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-500/25 px-1 rounded font-sans">{t.meText}</span>
                            )}
                            <span className="text-slate-700 font-bold">•</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {/* Bubble and visual design layout */}
                          <div className={`flex items-end gap-2 max-w-[85%] ${isSelf ? 'flex-row-reverse' : ''}`}>
                            
                            {/* Simple colored initial badge for outer users */}
                            {!isSelf && (
                              <div className="w-6.5 h-6.5 rounded bg-black/40 border border-white/10 flex items-center justify-center font-bold font-mono text-[9px] uppercase text-slate-400 select-none shrink-0" title={msg.sender}>
                                {msg.sender ? msg.sender.substring(0, 2) : '??'}
                              </div>
                            )}

                            {/* Bubble content */}
                            <div className="relative">
                              {editingMessageId === msg.id ? (
                                <div className="p-3 bg-black/85 rounded-2xl border border-amber-500/40 text-[12px] font-mono shadow-2xl min-w-[210px] space-y-2 relative z-30">
                                  <div className="text-[10px] uppercase font-black text-amber-400 tracking-wider flex items-center justify-between border-b border-white/5 pb-1 select-none">
                                    <span>{t.editTitle}</span>
                                  </div>
                                  <textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    rows={2}
                                    maxLength={250}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-xs text-white resize-none"
                                    id={`editing-textarea-${msg.id}`}
                                  />
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[9px] text-slate-400 font-black uppercase rounded-lg cursor-pointer transition-all"
                                    >
                                      {t.editCancel}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(msg.id)}
                                      className="px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-[9px] text-[#fbbf24] font-black uppercase rounded-lg cursor-pointer transition-all border border-amber-500/25"
                                    >
                                      {t.editConfirm}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className={`px-3.5 py-2.5 rounded-2xl text-[12px] font-mono break-words shadow-md transition-all ${
                                  isSelf 
                                    ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-purple-500/25 text-slate-100 rounded-br-sm' 
                                    : 'bg-white/[0.025] border border-white/5 text-slate-200 rounded-bl-sm hover:border-slate-500/25'
                                }`}>
                                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                  {msg.edited && (
                                    <span className="block mt-1 text-[8px] text-slate-500 tracking-wider text-right font-bold uppercase select-none">
                                      {t.editedLabel}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Hover Quick reaction selector ribbon */}
                              {editingMessageId !== msg.id && (
                                <div className={`absolute -top-3.5 ${isSelf ? 'right-2' : 'left-2'} hidden group-hover:flex items-center gap-1 bg-black/95 backdrop-blur-md border border-white/15 px-2 py-0.5 rounded-full z-20 shadow-xl`}>
                                  {PRESET_EMOJIS.map((emoji) => {
                                    // React state lookup
                                    const selfReacted = reactionsMap[emoji]?.[currentUser.replace(/[^a-z0-9_-]/gi, '')];
                                    return (
                                      <button
                                        key={`${msg.id}-rapid-${emoji}`}
                                        onClick={() => handleToggleReaction(msg.id, emoji)}
                                        className={`text-[11px] hover:scale-130 transition-transform cursor-pointer leading-none p-0.5 ${
                                          selfReacted ? 'grayscale-0' : 'grayscale hover:grayscale-0'
                                        }`}
                                        title={selfReacted ? 'Remove Reaction' : `Add ${emoji}`}
                                      >
                                        {emoji}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Action triggers if self matches */}
                            {isSelf && editingMessageId !== msg.id && (
                              <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
                                <button
                                  onClick={() => handleStartEdit(msg.id, msg.content)}
                                  className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-cyan-400 transition-all cursor-pointer"
                                  title="Edit Whisper"
                                  id={`edit-btn-${msg.id}`}
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSecret(msg.id)}
                                  className="p-1 hover:bg-red-500/15 rounded-lg text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                                  title={t.shredTitle}
                                  id={`shred-btn-${msg.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                          </div>

                          {/* Reaction Tally lists */}
                          {Object.keys(reactionsMap).length > 0 && (
                            <div className={`flex flex-wrap gap-1 mt-0.5 px-8 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                              {Object.entries(reactionsMap).map(([emoji, userObj]) => {
                                const clickers = Object.keys(userObj || {});
                                if (clickers.length === 0) return null;
                                const isMyReact = clickers.includes(currentUser.replace(/[^a-z0-9_-]/gi, ''));

                                return (
                                  <button
                                    key={`${msg.id}-react-${emoji}`}
                                    onClick={() => handleToggleReaction(msg.id, emoji)}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono border transition-all ${
                                      isMyReact 
                                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-black' 
                                        : 'bg-black/40 border-white/5 text-slate-400 hover:bg-black/50'
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span>{clickers.length}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                        </motion.div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                )}

              </div>

              {/* Categorization pill selector */}
              <div className="px-3 py-1.5 bg-black/15 border-t border-white/5 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">{t.motifLabel}</span>
                  {[
                    { id: 'all', key: 'all' },
                    { id: 'general', key: 'general' },
                    { id: 'confession', key: 'confession' },
                    { id: 'feedback', key: 'feedback' },
                    { id: 'appreciation', key: 'appreciation' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-white/10 border-white/20 text-white font-bold'
                          : 'bg-black/25 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.categories[cat.key as keyof typeof t.categories]}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[9px] font-mono text-slate-500">
                  <span>{t.totalMessages}</span>
                  <span className="text-white font-bold">{allMessages.length}{t.totalMessagesSuffix}</span>
                </div>
              </div>

              {/* Bot Alert / Error feedback banner */}
              {errorText && (
                <div className="px-4 py-2 bg-red-950/20 border-y border-red-500/20 text-red-405 text-red-450 text-red-400 text-[11px] font-mono flex items-center justify-between">
                  <span>⚠️ {errorText}</span>
                  <button onClick={() => setErrorText('')} className="text-xs font-bold hover:text-white">{t.dismiss}</button>
                </div>
              )}

              {/* Quick Emojis inserters bar */}
              <div className="px-4 py-1 bg-black/15 border-t border-white/5 flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-slate-400 shrink-0 font-bold">{t.quickInject}</span>
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={`bar-inject-${emoji}`}
                    onClick={() => setMessageText(prev => prev + emoji)}
                    className="text-xs hover:scale-120 transition-transform p-0.5 cursor-pointer leading-none"
                    title={`Inject ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Transmitter input panel */}
              <form 
                onSubmit={handleTransmitSecret}
                className="p-3 bg-black/20 border-t border-white/5 flex items-center gap-2 relative z-20"
              >
                <div className="flex-1 relative bg-black/20 border border-white/5 rounded-2xl focus-within:border-cyan-500/30 transition-all">
                  <textarea
                    required
                    maxLength={250}
                    rows={1}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTransmitSecret(e);
                      }
                    }}
                    placeholder={
                      lang === 'en' 
                        ? `Transmit to ${t.categories[activeCategory as keyof typeof t.categories]}...` 
                        : `${t.categories[activeCategory as keyof typeof t.categories]} বক্সে গোপন বার্তা লিখুন...`
                    }
                    className="w-full bg-transparent border-0 rounded-2xl py-3 px-4 pr-10 text-xs sm:text-sm font-sans text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
                    id="secret-draft-input"
                  />
                </div>

                {/* Submit trigger button with high-end quantum visual transition states */}
                <button
                  type="submit"
                  disabled={transmissionStep !== 'idle' || !messageText.trim()}
                  className={`p-3 bg-gradient-to-tr from-cyan-500/10 via-purple-600/20 to-pink-500/10 border border-white/10 hover:border-slate-300/40 rounded-2xl text-cyan-300 hover:text-white hover:scale-105 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0 flex items-center justify-center`}
                  id="transmit-whisper-trigger"
                >
                  <AnimatePresence mode="wait">
                    {transmissionStep === 'idle' ? (
                      <motion.div key="icon-send" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                        <SendHorizontal className="w-4.5 h-4.5" />
                      </motion.div>
                    ) : transmissionStep === 'encrypting' ? (
                      <motion.span key="txt-encrypt" className="text-[9.5px] font-mono font-black uppercase text-amber-400 animate-pulse px-1.5">
                        {t.encryptingText}
                      </motion.span>
                    ) : transmissionStep === 'routing' ? (
                      <motion.span key="txt-routing" className="text-[9.5px] font-mono font-black uppercase text-cyan-400 animate-pulse px-1.5">
                        {t.routingText}
                      </motion.span>
                    ) : (
                      <motion.div key="icon-done" initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </form>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal Slogan signature layout */}
        <div className="mt-8 text-center text-[10px] font-mono text-slate-550 text-slate-500 uppercase tracking-widest leading-none z-10">
          {t.footerText}
        </div>

      </div>
    </div>
  );
}
