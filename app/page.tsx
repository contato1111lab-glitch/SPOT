// TypeScript / app/page.tsx / Next.js App Router / browser target
'use client';

import { Check, Pause, Play, Volume2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  reward: number;
  questions: string[];
};

type Answers = Record<string, string | undefined>;

// 6 active songs in exact user-specified order and values
const songs: Song[] = [
  {
    id: 'adele',
    title: 'Someone Like You',
    artist: 'Adele',
    cover: '/covers/adele.jpg',
    audioUrl: '/audio/adele-preview.mp3',
    reward: 67.45,
    questions: [
      'Do you listen to Adele often?',
      'Do you usually listen to Someone Like You?',
    ],
  },
  {
    id: 'olivia',
    title: 'good 4 u',
    artist: 'Olivia Rodrigo',
    cover: '/covers/olivia.jpg',
    audioUrl: '/audio/olivia-preview.mp3',
    reward: 81.30,
    questions: [
      'Do you listen to Olivia Rodrigo often?',
      'Do you usually listen to good 4 u?',
    ],
  },
  {
    id: 'weeknd',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    cover: '/covers/weeknd.jpg',
    audioUrl: '/audio/weeknd-preview.mp3',
    reward: 74.20,
    questions: [
      'Do you listen to The Weeknd often?',
      'Do you usually listen to Blinding Lights?',
    ],
  },
  {
    id: 'dua-lipa',
    title: 'Levitating',
    artist: 'Dua Lipa',
    cover: '/covers/dua-lipa.jpg',
    audioUrl: '/audio/dua-lipa-preview.mp3',
    reward: 69.80,
    questions: [
      'Do you listen to Dua Lipa often?',
      'Do you usually listen to Levitating?',
    ],
  },
  {
    id: 'harry-styles',
    title: 'As It Was',
    artist: 'Harry Styles',
    cover: '/covers/harry-styles.jpg',
    audioUrl: '/audio/harry-styles-preview.mp3',
    reward: 78.50,
    questions: [
      'Do you listen to Harry Styles often?',
      'Do you usually listen to As It Was?',
    ],
  },
  {
    id: 'miley',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    cover: '/covers/miley.jpg',
    audioUrl: '/audio/miley-preview.mp3',
    reward: 67.52,
    questions: [
      'Do you listen to Miley Cyrus often?',
      'Do you usually listen to Flowers?',
    ],
  },
];

function BrandLogo({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`logo ${dark ? 'logo-dark' : ''}`}>
      <Image
        className="logo-image"
        src="/spotify-logo.webp"
        alt="Spotify"
        width={34}
        height={34}
        priority
      />
      <b>Rewards</b>
    </div>
  );
}

function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth fill

    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          onFinishRef.current();
        }, 120);
      }
    }, 25);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="loading-screen"
      onClick={() => onFinishRef.current()}
      role="button"
      tabIndex={0}
      title="Click anywhere to skip loading"
    >
      <div className="loading-inner">
        <div className="brand-line">
          <BrandLogo dark />
          <span />
          <small>CASHOUT</small>
        </div>

        <div className="spinner" />

        <h1 className="loading-title">Connecting to support representative...</h1>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function ChatHeader({ balance }: { balance: number }) {
  return (
    <header className="chat-header">
      <div className="brand-line">
        <BrandLogo />
        <span />
        <small>CASHOUT</small>
      </div>
      <div className="balance-pill">${balance.toFixed(2)}</div>
    </header>
  );
}

function SpotifyAvatar() {
  return (
    <div className="chat-avatar pop-bounce" title="Spotify Rewards">
      <Image
        src="/spotify-logo.webp"
        alt="Spotify"
        width={44}
        height={44}
        priority
      />
    </div>
  );
}

function AgentAvatar() {
  return (
    <div className="chat-avatar agent-chat-avatar pop-bounce" title="Kaitlynn W.">
      <Image
        src="/agent-avatar.jpg"
        alt="Kaitlynn"
        width={44}
        height={44}
      />
    </div>
  );
}

function MessageBubble({
  children,
  showAvatar = true,
  isAgent = false,
}: {
  children: React.ReactNode;
  showAvatar?: boolean;
  isAgent?: boolean;
}) {
  return (
    <div className="msg-row msg-anim">
      {showAvatar && (isAgent ? <AgentAvatar /> : <SpotifyAvatar />)}
      <div className="msg-bubble">{children}</div>
    </div>
  );
}

function TypingIndicator({
  showAvatar = true,
  isAgent = false,
}: {
  showAvatar?: boolean;
  isAgent?: boolean;
}) {
  return (
    <div className="typing-row msg-anim">
      {showAvatar && (isAgent ? <AgentAvatar /> : <SpotifyAvatar />)}
      <div className="typing-bubble">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

const PLAY_BEFORE_FADE_SECONDS = 8.0; // Plays at full volume for 8 full seconds
const FADE_DURATION = 3.0; // 3 seconds gentle fade out (from 8.0s to 11.0s)
const TOTAL_PLAY_TIME = PLAY_BEFORE_FADE_SECONDS + FADE_DURATION; // 11.0s total

function AudioPlayer({
  song,
  unlocked,
  onUnlock,
}: {
  song: Song;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeAnimRef = useRef<number | null>(null);
  const isFadingRef = useRef(false);
  const onUnlockRef = useRef(onUnlock);
  onUnlockRef.current = onUnlock;
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;

  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Smooth gradual volume fade out strictly after 8 seconds
  const startFadeOut = (audioEl: HTMLAudioElement) => {
    if (isFadingRef.current) return;
    isFadingRef.current = true;

    const startVol = audioEl.volume;
    const startTime = performance.now();
    const durationMs = FADE_DURATION * 1000;

    const step = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth gradual fade: volume drops gently down to 0
      audioEl.volume = Math.max(0, startVol * Math.pow(1 - progress, 1.4));

      if (progress < 1) {
        fadeAnimRef.current = requestAnimationFrame(step);
      } else {
        audioEl.pause();
        audioEl.volume = 1;
        setPlaying(false);
        isFadingRef.current = false;
        fadeAnimRef.current = null;
      }
    };

    fadeAnimRef.current = requestAnimationFrame(step);
  };

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;

    if (playing) {
      if (fadeAnimRef.current) {
        cancelAnimationFrame(fadeAnimRef.current);
        fadeAnimRef.current = null;
        isFadingRef.current = false;
      }
      el.pause();
      setPlaying(false);
    } else {
      try {
        if (!isFadingRef.current) {
          el.volume = 1;
        }
        await el.play();
        setPlaying(true);
      } catch (err) {
        console.warn('Audio playback error (browser policy / sandbox):', err);
        setHasError(true);
        onUnlockRef.current();
      }
    }
  };

  // Manage audio event listeners and track changes cleanly
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    // Reset track-specific state
    setPlaying(false);
    setHasError(false);
    setCurrentTime(0);
    isFadingRef.current = false;
    if (fadeAnimRef.current) {
      cancelAnimationFrame(fadeAnimRef.current);
      fadeAnimRef.current = null;
    }

    try {
      el.pause();
      el.currentTime = 0;
      el.volume = 1;
      el.load();
    } catch {}

    const onTimeUpdate = () => {
      const current = el.currentTime;
      setCurrentTime(current);

      // Unlocks evaluation at exactly 8.0 seconds!
      if (current >= PLAY_BEFORE_FADE_SECONDS) {
        if (!unlockedRef.current) {
          onUnlockRef.current();
        }
        if (!isFadingRef.current) {
          startFadeOut(el);
        }
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => {
      setHasError(true);
      onUnlockRef.current();
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('error', onError);

    return () => {
      if (fadeAnimRef.current) {
        cancelAnimationFrame(fadeAnimRef.current);
        fadeAnimRef.current = null;
      }
      try {
        el.pause();
        el.currentTime = 0;
        el.volume = 1;
      } catch {}
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('error', onError);
    };
  }, [song.id]);

  const remainingSeconds = Math.max(1, Math.ceil(PLAY_BEFORE_FADE_SECONDS - currentTime));

  const noticeText = hasError
    ? '⚠️ Audio preview restricted by browser — questions unlocked below!'
    : unlocked
    ? '🎉 Preview completed! Answer the questions below and tap FINISH & EARN'
    : playing
    ? `🎵 Listen to the preview (${remainingSeconds}s remaining) to unlock evaluation.`
    : '🎵 Press PLAY to listen to the preview and unlock the evaluation.';

  return (
    <>
      <audio
        key={song.id}
        ref={audioRef}
        src={song.audioUrl}
        preload="auto"
        onError={() => {
          setHasError(true);
          onUnlock();
        }}
      />

      <div
        className={`notice-banner ${unlocked ? 'is-unlocked' : ''}`}
        onClick={() => {
          if (!unlocked) onUnlock();
        }}
        role="button"
        tabIndex={0}
        title={!unlocked ? 'Click to bypass and unlock evaluation' : undefined}
      >
        {noticeText}
      </div>

      <div className={`track-player ${playing ? 'is-playing' : ''}`}>
        <div className="track-cover">
          <Image
            src={song.cover}
            alt={`${song.artist} cover`}
            fill
            sizes="56px"
          />
        </div>

        <div className="track-meta">
          <b>{song.title}</b>
          <div>
            <em>PREVIEW</em>
            <small>{song.artist}</small>
          </div>
        </div>

        <button
          type="button"
          className="play-btn"
          onClick={togglePlay}
          aria-label={playing ? 'Pause preview' : 'Play preview'}
        >
          {playing ? (
            <Pause size={22} fill="currentColor" />
          ) : (
            <Play size={22} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>
    </>
  );
}

function MusicEvaluationBox({
  song,
  isConfirmed,
  lastReward,
  showAvatar = true,
  onComplete,
}: {
  song: Song;
  isConfirmed: boolean;
  lastReward: number;
  showAvatar?: boolean;
  onComplete: (amount: number) => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});

  // Reset unlocked state and answers when advancing to the next song
  useEffect(() => {
    setUnlocked(false);
    setAnswers({});
  }, [song.id]);

  const isReady = unlocked && song.questions.every((_, idx) => answers[idx]);

  return (
    <div className="card-shell msg-anim music-eval-shell">
      {showAvatar && <SpotifyAvatar />}

      {isConfirmed ? (
        <div className="success-card msg-anim">
          <div className="check-icon">
            <Check size={28} strokeWidth={3} />
          </div>
          <b>Evaluation Submitted!</b>
          <span className="success-track-title">
            {song.title} • {song.artist}
          </span>
          <small>BALANCE UPDATED</small>
          <strong>+${lastReward.toFixed(2)}</strong>
        </div>
      ) : (
        <div className="eval-card msg-anim" key={song.id}>
          <AudioPlayer
            song={song}
            unlocked={unlocked}
            onUnlock={() => setUnlocked(true)}
          />

          <div className="questions-list">
            {song.questions.map((question, idx) => (
              <div className="question-block" key={question}>
                <b>{question}</b>
                <div className="options-grid">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!unlocked}
                      className={`opt-btn ${
                        answers[idx] === opt ? 'selected' : ''
                      }`}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [idx]: opt }))
                      }
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={`finish-btn ${isReady ? 'ready' : ''}`}
            disabled={!isReady}
            onClick={() => onComplete(song.reward)}
          >
            FINISH &amp; EARN
          </button>
        </div>
      )}
    </div>
  );
}

function DemoSummaryCard({
  balance,
  totalSongs,
  showAvatar = true,
}: {
  balance: number;
  totalSongs: number;
  showAvatar?: boolean;
}) {
  return (
    <div className="card-shell msg-anim summary-card-shell">
      {showAvatar && <SpotifyAvatar />}
      <DemoSummary balance={balance} totalSongs={totalSongs} />
    </div>
  );
}

function DemoSummary({
  balance,
  totalSongs,
}: {
  balance: number;
  totalSongs: number;
}) {
  return (
    <section className="demo-summary-box msg-anim">
      <div className="summary-header">
        <Image
          src="/spotify-logo.webp"
          alt="Spotify"
          width={22}
          height={22}
        />
        <strong>Rewards</strong>
        <span className="tag">DEMO</span>
      </div>

      <div className="summary-banner">BALANCE SUMMARY</div>

      <div className="summary-content">
        <div className="summary-parties">
          <div>
            <b>ACTIVITY</b>
            <strong>Music evaluations</strong>
            <span>Rewards session</span>
          </div>
          <div>
            <b>TRACKS</b>
            <strong>{totalSongs} completed</strong>
          </div>
        </div>

        <div className="summary-grid">
          <span className="th">Description</span>
          <span className="th">Tracks</span>
          <span className="th">Balance</span>
          <span>Music evaluations</span>
          <span>{totalSongs}</span>
          <strong>${balance.toFixed(2)}</strong>
        </div>

        <div className="summary-total">
          <span>ACCUMULATED BALANCE</span>
          <strong>${balance.toFixed(2)}</strong>
        </div>
      </div>

      <div className="summary-footer">
        <Image
          src="/spotify-logo.webp"
          alt="Spotify"
          width={24}
          height={24}
        />
      </div>
    </section>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [songIndex, setSongIndex] = useState(0);

  // In-place confirmation state for the single evaluation card (no extra bubbles/cards)
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [lastReward, setLastReward] = useState(0);

  // Chat sequence state machine:
  // step 0: Typing 1
  // step 1: Msg 1 displayed
  // step 2: Typing 2
  // step 3: Msg 2 displayed
  // step 4: Typing 3
  // step 5: Msg 3 displayed
  // step 6: Typing 4
  // step 7: Music Evaluation Box displayed!
  const [chatStep, setChatStep] = useState(0);

  // Final stage sequence state machine:
  // 0: not started
  // 1: typing before Message 4 (Spotify)
  // 2: Message 4 visible (Spotify)
  // 3: typing before Message 5 (Spotify)
  // 4: Message 5 & Start Verification button visible (Spotify)
  // 5: typing for Kaitlynn (Agent)
  // 6: Kaitlynn joined message visible (Agent)
  // 7: typing before Video Card (Agent)
  // 8: Video Card visible (Agent)
  // 9: typing before Summary Card (Spotify)
  // 10: Summary Card visible (Spotify)
  const [finalStage, setFinalStage] = useState(false);
  const [finalPhase, setFinalPhase] = useState(0);

  const [sessionId, setSessionId] = useState('809821');

  const cashAudioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const currentSong = songs[songIndex] || songs[0];

  const clearAllTimers = () => {
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
    finalTimersRef.current.forEach(clearTimeout);
    finalTimersRef.current = [];
  };

  // Initialize session ID and balance safely without crashing iframe storage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedCase = window.sessionStorage?.getItem('rewards-case');
        if (savedCase) {
          setSessionId(savedCase);
        } else {
          const generated = String(Math.floor(100000 + Math.random() * 899999));
          window.sessionStorage?.setItem('rewards-case', generated);
          setSessionId(generated);
        }

        const savedBal = window.sessionStorage?.getItem('rewards-balance');
        if (savedBal) {
          const val = Number(savedBal);
          if (!isNaN(val)) {
            setBalance(val);
            setDisplayBalance(val);
          }
        }
      }
    } catch {
      // Storage fallback
    }
  }, []);

  // Save balance safely
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage?.setItem('rewards-balance', String(balance));
      }
    } catch {
      // Storage fallback
    }
  }, [balance]);

  // Step-by-step chat pacing
  useEffect(() => {
    if (loading) return;

    // Reset to step 0 when chat opens
    setChatStep(0);

    const timeouts = [
      setTimeout(() => setChatStep(1), 900),   // Msg 1 pops
      setTimeout(() => setChatStep(2), 1700),  // Typing 2
      setTimeout(() => setChatStep(3), 2600),  // Msg 2 pops
      setTimeout(() => setChatStep(4), 3500),  // Typing 3
      setTimeout(() => setChatStep(5), 4400),  // Msg 3 pops
      setTimeout(() => setChatStep(6), 5200),  // Typing 4
      setTimeout(() => setChatStep(7), 6100),  // Song card pops!
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [loading]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Reset entire flow
  const handleReset = () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage?.removeItem('rewards-balance');
      }
    } catch {}
    clearAllTimers();
    setBalance(0);
    setDisplayBalance(0);
    setSongIndex(0);
    setIsConfirmed(false);
    setLastReward(0);
    setFinalStage(false);
    setFinalPhase(0);
    setLoading(true);
  };

  // Start the 3-second paced final messages sequence after 6th track evaluation
  const startFinalSequence = () => {
    setFinalPhase(1); // Typing before Message 4 (Spotify)

    const t1 = setTimeout(() => {
      setFinalPhase(2); // Message 4 arrives (Spotify)
    }, 1200);

    const t2 = setTimeout(() => {
      setFinalPhase(3); // 3 seconds later: Typing before Message 5 (Spotify)
    }, 4200);

    const t3 = setTimeout(() => {
      setFinalPhase(4); // Message 5 + Start Verification button arrives (Spotify)
    }, 5400);

    finalTimersRef.current.push(t1, t2, t3);
  };

  // User clicked Start Verification -> Kaitlynn sequence
  const handleStartVerification = () => {
    setFinalPhase(5); // Typing for Kaitlynn (Agent)

    const t1 = setTimeout(() => {
      setFinalPhase(6); // Kaitlynn joined message (Agent)
    }, 1200);

    const t2 = setTimeout(() => {
      setFinalPhase(7); // 3 seconds later: Typing before Video Card (Agent)
    }, 4200);

    const t3 = setTimeout(() => {
      setFinalPhase(8); // Video card arrives (Agent)
    }, 5400);

    const t4 = setTimeout(() => {
      setFinalPhase(9); // 3 seconds later: Typing before Summary Card (Spotify)
    }, 8400);

    const t5 = setTimeout(() => {
      setFinalPhase(10); // Summary card arrives (Spotify)
    }, 9600);

    finalTimersRef.current.push(t1, t2, t3, t4, t5);
  };

  // Handle completing an evaluation:
  // Shows 4-second confirmation in the EXACT SAME box, then advances in-place to next song
  const handleFinishSong = (rewardAmount: number) => {
    if (isConfirmed) return;

    setIsConfirmed(true);
    setLastReward(rewardAmount);

    cashAudioRef.current?.play().catch(() => {});

    const startVal = displayBalance;
    const endVal = balance + rewardAmount;
    const startTimestamp = performance.now();

    const animateNumber = (now: number) => {
      const progress = Math.min(1, (now - startTimestamp) / 800);
      const current = startVal + (endVal - startVal) * (1 - Math.pow(1 - progress, 3));
      setDisplayBalance(current);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setBalance(endVal);
        setDisplayBalance(endVal);
      }
    };

    requestAnimationFrame(animateNumber);

    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);

    // Keep confirmation displayed for exactly 4 seconds, then update in-place
    confirmTimerRef.current = setTimeout(() => {
      if (songIndex < songs.length - 1) {
        setSongIndex((i) => i + 1);
        setIsConfirmed(false);
      } else {
        // All 6 tracks completed! Advance to final verification sequence
        setFinalStage(true);
        startFinalSequence();
      }
    }, 4000);
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    });
  };

  // Auto-scroll smoothly on any state changes
  useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => {
      scrollToBottom(true);
    }, 60);

    return () => clearTimeout(timeout);
  }, [
    loading,
    chatStep,
    songIndex,
    isConfirmed,
    finalStage,
    finalPhase,
  ]);

  // Observer to smoothly scroll whenever height expands (cards, media, typing)
  useEffect(() => {
    if (loading) return;
    const container = scrollRef.current;
    if (!container) return;

    let lastHeight = container.scrollHeight;

    const handleHeightChange = () => {
      if (container.scrollHeight > lastHeight) {
        lastHeight = container.scrollHeight;
        scrollToBottom(true);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleHeightChange();
    });

    const mutationObserver = new MutationObserver(() => {
      handleHeightChange();
    });

    resizeObserver.observe(container);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [loading]);

  return (
    <div className="app-viewport">
      <audio
        ref={cashAudioRef}
        src="/audio/cash-confirmation.mp3"
        preload="auto"
      />

      <div className="app-frame">
        {loading ? (
          <LoadingScreen onFinish={() => setLoading(false)} />
        ) : (
          <>
            <ChatHeader balance={displayBalance} />

            <section className="agent-bar">
              <div className="agent-avatar">
                <Image
                  src="/agent-avatar.jpg"
                  alt="Kaitlynn W."
                  width={52}
                  height={52}
                  priority
                />
              </div>
              <div className="agent-info">
                <b>Kaitlynn W.</b>
                <small>
                  <i className="status-dot" /> Live Support Agent
                </small>
              </div>
            </section>

            <main className="messages-area" ref={scrollRef}>
              {/* STEP 0: Typing Message 1 */}
              {chatStep === 0 && (
                <TypingIndicator showAvatar={true} />
              )}

              {/* STEP 1+: Message 1 */}
              {chatStep >= 1 && (
                <MessageBubble showAvatar={chatStep === 1}>
                  <b>To begin your service,</b> your case number is{' '}
                  <u>{sessionId}</u>
                </MessageBubble>
              )}

              {/* STEP 2: Typing Message 2 */}
              {chatStep === 2 && (
                <TypingIndicator showAvatar={true} />
              )}

              {/* STEP 3+: Message 2 */}
              {chatStep >= 3 && (
                <MessageBubble showAvatar={chatStep === 3}>
                  You&apos;ve been <b>one of the few people</b> selected for the{' '}
                  <b>Spotify Rewards Program</b>
                </MessageBubble>
              )}

              {/* STEP 4: Typing Message 3 */}
              {chatStep === 4 && (
                <TypingIndicator showAvatar={true} />
              )}

              {/* STEP 5+: Message 3 */}
              {chatStep >= 5 && (
                <MessageBubble showAvatar={chatStep === 5}>
                  <b>
                    We&apos;ve selected six songs for you to listen to and rate.
                    Get started right here below.
                  </b>{' '}
                  👇
                </MessageBubble>
              )}

              {/* STEP 6: Typing Song Card */}
              {chatStep === 6 && (
                <TypingIndicator showAvatar={true} />
              )}

              {/* STEP 7+: Single Persistent Music Evaluation Box in Conversation (no duplicates, in-place 4s confirmation) */}
              {chatStep >= 7 && (
                <MusicEvaluationBox
                  song={currentSong}
                  isConfirmed={isConfirmed}
                  lastReward={lastReward}
                  showAvatar={!finalStage}
                  onComplete={handleFinishSong}
                />
              )}

              {/* Final Verification Flow (after all 6 tracks) */}
              {finalStage && (
                <div className="final-stage-wrap">
                  {/* Step 1: Typing before Message 4 (Spotify) */}
                  {finalPhase === 1 && (
                    <TypingIndicator showAvatar={true} isAgent={false} />
                  )}

                  {/* Step 2+: Message 4 */}
                  {finalPhase >= 2 && (
                    <MessageBubble showAvatar={finalPhase === 2}>
                      <u>Click the button below to continue with your registration.</u>
                    </MessageBubble>
                  )}

                  {/* Step 3: Typing before Message 5 (Spotify) */}
                  {finalPhase === 3 && (
                    <TypingIndicator showAvatar={true} isAgent={false} />
                  )}

                  {/* Step 4+: Message 5 */}
                  {finalPhase >= 4 && (
                    <>
                      <MessageBubble showAvatar={finalPhase === 4}>
                        <em>(Click the button below to continue with your withdrawal)</em>
                      </MessageBubble>

                      {finalPhase === 4 && (
                        <button
                          type="button"
                          className="verification-btn pop-bounce"
                          onClick={handleStartVerification}
                        >
                          Start Verification
                        </button>
                      )}
                    </>
                  )}

                  {/* Step 5: Typing for Kaitlynn (Agent) */}
                  {finalPhase === 5 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Step 6+: Kaitlynn joined */}
                  {finalPhase >= 6 && (
                    <div className="joined-row msg-anim">
                      {finalPhase === 6 && <AgentAvatar />}
                      <div className="msg-bubble">
                        <b>
                          ✅ Kaitlynn, the Spotify Rewards representative, has
                          joined the chat
                        </b>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Typing before Video Card (Agent) */}
                  {finalPhase === 7 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Step 8+: Video Card */}
                  {finalPhase >= 8 && (
                    <div className="card-shell msg-anim video-card-shell">
                      {finalPhase === 8 && <AgentAvatar />}
                      <div className="video-card">
                        <video
                          src="/kaitlynn-video.mp4"
                          controls
                          autoPlay
                          playsInline
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 9: Typing before Demo Summary (Spotify) */}
                  {finalPhase === 9 && (
                    <TypingIndicator showAvatar={true} isAgent={false} />
                  )}

                  {/* Step 10: Demo Summary Card */}
                  {finalPhase >= 10 && (
                    <DemoSummaryCard
                      balance={balance}
                      totalSongs={songs.length}
                      showAvatar={finalPhase === 10}
                    />
                  )}
                </div>
              )}

              <div ref={messagesEndRef} className="scroll-anchor" />
            </main>
          </>
        )}
      </div>
    </div>
  );
}
