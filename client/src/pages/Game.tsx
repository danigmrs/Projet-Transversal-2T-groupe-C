import  "../utils/Game.css";

import { useState, useEffect, useRef, useCallback } from "react";
 
// ─── CONFIG ───────────────────────────────────────────────────────────────────
type Color = 'yellow' | 'green' | 'red' | 'blue';
const COLORS: Color[] = ["yellow", "green", "red", "blue"];
const COLOR_META: Record<Color, { hex: string; glow: string; label: string }> = {
  yellow: { hex: "#FFD700", glow: "#FFD70088", label: "J" },
  green:  { hex: "#39FF14", glow: "#39FF1488", label: "V" },
  red:    { hex: "#FF2D55", glow: "#FF2D5588", label: "R" },
  blue:   { hex: "#00BFFF", glow: "#00BFFF88", label: "B" },
};
 
const FLASH_DURATION = 500; // ms each color lit
const FLASH_PAUSE    = 200; // ms between flashes
// La séquence maître grandit de 1 couleur à chaque manche (vrai Simon)
 
// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SimonGame() {
  const [masterSeq,    setMasterSeq]    = useState<Color[]>([]);   // séquence maître complète (grandit)
  const [playerInput,  setPlayerInput]  = useState<Color[]>([]);   // saisie en cours du joueur
  const [phase,        setPhase]        = useState<string>("idle"); // idle | showing | waiting | gameover
  const [litColor,     setLitColor]     = useState<Color | "error" | null>(null);
  const [score,        setScore]        = useState<number>(0);    // nb de couleurs mémorisées
  const [round,        setRound]        = useState<number>(0);    // longueur de la séquence affichée
  const [resultMsg,    setResultMsg]    = useState<string>("");
  const [leaderboard,  setLeaderboard]  = useState<any[]>([]);
  const [playerName,   setPlayerName]   = useState<string>("");
  const [serialStatus, setSerialStatus] = useState<string>("disconnected");
  const [serialLog,    setSerialLog]    = useState<string[]>([]);
 
  const portRef        = useRef<any>(null);
  const writerRef      = useRef<any>(null);
  const readerRef      = useRef<any>(null);
  const readLoopRef    = useRef<Promise<void> | null>(null);
  const phaseRef       = useRef<string>(phase);
  const playerInputRef = useRef<Color[]>(playerInput);
  const masterSeqRef   = useRef<Color[]>(masterSeq);
  const scoreRef       = useRef<number>(score);
 
  useEffect(() => { phaseRef.current = phase; },       [phase]);
  useEffect(() => { playerInputRef.current = playerInput; }, [playerInput]);
  useEffect(() => { masterSeqRef.current = masterSeq; },    [masterSeq]);
  useEffect(() => { scoreRef.current = score; },            [score]);
 
  // ── Fetch leaderboard ──────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/scores/top5");
      if (res.ok) setLeaderboard(await res.json());
    } catch (_) {}
  }, []);
 
  useEffect(() => {
    fetchLeaderboard();
    // Get current user name from session/token (adapt to your auth)
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setPlayerName(JSON.parse(stored).prenom_user || ""); } catch (_) {}
    }
  }, [fetchLeaderboard]);
 
  // ── Save score to backend ──────────────────────────────────────────────────
  const saveScore = useCallback(async (finalScore: number) => {
    if (finalScore === 0) return;
    try {
      await fetch("http://localhost:3000/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ score: finalScore }),
      });
      fetchLeaderboard();
    } catch (_) {}
  }, [fetchLeaderboard]);
 
  // ── Ajoute une couleur aléatoire à la séquence maître ─────────────────────
  const appendColor = (): Color => COLORS[Math.floor(Math.random() * COLORS.length)];
 
  // ── Flash la séquence visible (du début jusqu'à roundLen) ─────────────────
  const showSequence = useCallback(async (seq: Color[]) => {
    setLitColor(null);
    await delay(600);
 
    for (const color of seq) {
      setLitColor(color);
      await sendSerial(`SHOW:${color}\n`);
      await delay(FLASH_DURATION);
      setLitColor(null);
      await sendSerial("OFF\n");
      await delay(FLASH_PAUSE);
    }
 
    await delay(300);
    setPhase("waiting");
    setPlayerInput([]);
  }, []);
 
  // ── Démarre une nouvelle manche (séquence += 1 couleur) ───────────────────
  const nextRound = useCallback(async (prevMaster: Color[]) => {
    const newColor = appendColor();
    const newSeq   = [...prevMaster, newColor];
    setMasterSeq(newSeq);
    setRound(newSeq.length);
    await showSequence(newSeq);
  }, [showSequence]);
 
  // ── Démarre le jeu (repart à zéro) ────────────────────────────────────────
  const startGame = useCallback(async () => {
    setScore(0);
    setRound(0);
    setResultMsg("");
    setPlayerInput([]);
    setMasterSeq([]);
    const firstColor = appendColor();
    const firstSeq   = [firstColor];
    setMasterSeq(firstSeq);
    setRound(1);
    await delay(400);
    await showSequence(firstSeq);
  }, [showSequence]);
 
  // ── Gestion d'une pression couleur (écran ou Pico) ────────────────────────
  const handleColorPress = useCallback((color: Color) => {
 
    const newInput = [...playerInputRef.current, color];
    setPlayerInput(newInput);
 
    const seq = masterSeqRef.current;
    const idx = newInput.length - 1;
 
    // ❌ Mauvaise couleur → game over
    if (newInput[idx] !== seq[idx]) {
      setPhase("gameover");
      setLitColor("error");
      const finalScore = scoreRef.current;
      saveScore(finalScore);
      setTimeout(() => setLitColor(null), 800);
      return;
    }
 
    // ✅ Toute la séquence saisie correctement
    if (newInput.length === seq.length) {
      // +1 point par couleur mémorisée (= longueur de la séquence)
      const newScore = seq.length;
      setScore(newScore);
      setResultMsg("✓ BRAVO !");
      setPhase("result");
      setTimeout(async () => {
        setResultMsg("");
        // Lance la manche suivante avec la séquence courante (masterSeqRef à jour)
        await nextRound(masterSeqRef.current);
      }, 900);
    }
  }, [saveScore, nextRound]);
 
  // ── Serial (Web Serial API) ───────────────────────────────────────────────
  const sendSerial = async (msg: string) => {
    if (!writerRef.current) return;
    try {
      const enc = new TextEncoder();
      await writerRef.current.write(enc.encode(msg));
    } catch (_) {}
  };
 
  const connectSerial = async () => {
    if (!("serial" in navigator)) {
      alert("Web Serial API non supporté. Utilisez Chrome/Edge.");
      return;
    }
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
 
      const writer = port.writable.getWriter();
      writerRef.current = writer;
 
      const reader = port.readable.getReader();
      readerRef.current = reader;
      setSerialStatus("connected");
      logSerial("Pico connecté ✓");
 
      // Read loop
      const readLoop = async () => {
        const dec = new TextDecoder();
        let buf = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value);
            const lines = buf.split("\n");
            buf = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              logSerial(`← ${trimmed}`);
              // Pico sends "PRESS:color"
              if (trimmed.startsWith("PRESS:")) {
                const color = trimmed.split(":")[1]?.toLowerCase();
                if (color && COLORS.includes(color as Color)) handleColorPress(color as Color);
              }
            }
          }
        } catch (_) {}
      };
      readLoopRef.current = readLoop();
    } catch (err: any) {
      logSerial(`Erreur: ${err.message}`);
    }
  };
 
  const disconnectSerial = async () => {
    try {
      readerRef.current?.cancel();
      writerRef.current?.releaseLock();
      await portRef.current?.close();
    } catch (_) {}
    portRef.current = null;
    writerRef.current = null;
    readerRef.current = null;
    setSerialStatus("disconnected");
    logSerial("Déconnecté");
  };
 
  const logSerial = (msg: string) => {
    setSerialLog(l => [...l.slice(-19), msg]);
  };

  const handleLogout = async () => {
  try {
    await fetch("http://localhost:3000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("user");

    window.location.href = "/";
  } catch (error) {
    console.error("Erreur logout :", error);
  }
};
 
  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="sg-root">
 
        {/* ── Left panel: Leaderboard ── */}
        <aside className="sg-panel sg-panel--left">
          <h2 className="sg-panel-title">TOP 5</h2>
          <ol className="sg-leaderboard">
            {leaderboard.map((entry, i) => (
              <li key={entry.id_score} className={`sg-lb-row sg-lb-row--${i + 1}`}>
                <span className="sg-lb-rank">#{i + 1}</span>
                <span className="sg-lb-name">
                  {entry.prenom_user} {entry.nom_user?.[0]}.
                </span>
                <span className="sg-lb-score">{entry.score}</span>
              </li>
            ))}
            {leaderboard.length === 0 && (
              <li className="sg-lb-empty">Aucun score</li>
            )}
          </ol>
        </aside>
 
        {/* ── Center: Game ── */}
        <main className="sg-center">
          <header className="sg-header">
            <div className="sg-scanline" />
            <h1 className="sg-title">SIMON</h1>
            <p className="sg-subtitle">MEMORY CHALLENGE</p>
            <button className="sg-logout-btn" onClick={handleLogout}>
              Déconnexion
            </button>
          </header>
 
          {/* Score & Round */}
          <div className="sg-stats">
            <div className="sg-stat">
              <span className="sg-stat-label">MANCHE</span>
              <span className="sg-stat-val">{round || "—"}</span>
            </div>
            <div className="sg-stat sg-stat--score">
              <span className="sg-stat-label">SCORE</span>
              <span className="sg-stat-val sg-stat-val--big">{score}</span>
            </div>
            <div className="sg-stat">
              <span className="sg-stat-label">JOUEUR</span>
              <span className="sg-stat-val sg-stat-val--name">{playerName || "—"}</span>
            </div>
          </div>
 
          {/* Result message */}
          {resultMsg && (
            <div className="sg-result-msg sg-result-msg--ok">
              {resultMsg}
            </div>
          )}
          {phase === "gameover" && !resultMsg && (
            <div className="sg-result-msg sg-result-msg--err">✗ GAME OVER</div>
          )}
 
          <div className="sg-grid">
            {COLORS.map(color => {
              const meta = COLOR_META[color];
              const isLit = litColor === color;
              const isError = litColor === "error";
              return (
                <button
                  key={color}
                  className={`sg-btn sg-btn--${color} ${isLit ? "sg-btn--lit" : ""} ${isError ? "sg-btn--error" : ""}`}
                  style={{"--c": meta.hex, "--glow": meta.glow} as any}
                  onClick={() => handleColorPress(color)}
                  disabled={phase !== "waiting"}
                  aria-label={color}
                >
                  <span className="sg-btn-label">{meta.label}</span>
                  <span className="sg-btn-shine" />
                </button>
              );
            })}
          </div>
 
          {/* Phase indicator */}
          <div className="sg-phase-row">
            {phase === "showing" && (
              <span className="sg-phase sg-phase--showing">▶ SÉQUENCE EN COURS…</span>
            )}
            {phase === "waiting" && (
              <span className="sg-phase sg-phase--waiting">⬤ À VOUS DE JOUER</span>
            )}
            {phase === "idle" && (
              <span className="sg-phase sg-phase--idle">Prêt ?</span>
            )}
          </div>
 
          {/* Progress dots — les couleurs ne s'affichent qu'après validation par le joueur */}
          {phase === "waiting" && (
            <div className="sg-progress">
              {masterSeq.map((c, i) => {
                const pressed = i < playerInput.length;
                return (
                  <span
                    key={i}
                    className={`sg-dot ${pressed ? "sg-dot--done" : ""}`}
                    style={{"--c": pressed ? COLOR_META[c].hex : "#ffffff33"} as any}
                  />
                );
              })}
            </div>
          )}
 
          {/* Bouton démarrer (idle) ou redémarrer (gameover) */}
          {phase === "idle" && (
            <button className="sg-start-btn" onClick={startGame}>
              DÉMARRER
            </button>
          )}
          {phase === "gameover" && (
            <div className="sg-gameover-area">
              <p className="sg-gameover-score">
                Score final : <strong>{score}</strong>
              </p>
              <button className="sg-start-btn sg-start-btn--restart" onClick={startGame}>
                ↺ RECOMMENCER
              </button>
            </div>
          )}
        </main>
 
        {/* ── Right panel: Pico ── */}
        <aside className="sg-panel sg-panel--right">
          <h2 className="sg-panel-title">PI PICO</h2>
          <div className={`sg-serial-badge sg-serial-badge--${serialStatus}`}>
            {serialStatus === "connected" ? "● CONNECTÉ" : "○ DÉCONNECTÉ"}
          </div>
 
          {serialStatus === "disconnected" ? (
            <button className="sg-serial-btn" onClick={connectSerial}>
              Connecter USB
            </button>
          ) : (
            <button className="sg-serial-btn sg-serial-btn--disc" onClick={disconnectSerial}>
              Déconnecter
            </button>
          )}
 
          <p className="sg-serial-hint">
            Utilisez les boutons du Pico ou les tuiles de gauche.
          </p>
 
          <div className="sg-log">
            {serialLog.map((l, i) => (
              <div key={i} className="sg-log-line">{l}</div>
            ))}
            {serialLog.length === 0 && (
              <div className="sg-log-line sg-log-line--empty">— console —</div>
            )}
          </div>
        </aside>
 
      </div>
    </>
  );
}
 
// ─── HELPERS ──────────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
 
