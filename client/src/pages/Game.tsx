import "../utils/Game.css";

import { useState, useEffect, useRef, useCallback } from "react";

import mqtt from "mqtt";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
type Color = 'yellow' | 'green' | 'red' | 'blue';
const COLORS: Color[] = ["yellow", "green", "red", "blue"];
const COLOR_META: Record<Color, { hex: string; glow: string; label: string }> = {
  yellow: { hex: "#FFD700", glow: "#FFD70088", label: "J" },
  green:  { hex: "#39FF14", glow: "#39FF1488", label: "V" },
  red:    { hex: "#FF2D55", glow: "#FF2D5588", label: "R" },
  blue:   { hex: "#00BFFF", glow: "#00BFFF88", label: "B" },
};

const BROKER_URL  = "ws://10.214.81.52:9001";   // WebSocket Mosquitto
const TOPIC_PRESS = "pico/groupe3/simon/press";  // Pico → Site
const TOPIC_CMD   = "pico/groupe3/simon/cmd";    // Site → Pico

const FLASH_DURATION = 500; // ms each color lit
const FLASH_PAUSE    = 200; // ms between flashes

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SimonGame() {
  const [masterSeq,   setMasterSeq]   = useState<Color[]>([]);
  const [playerInput, setPlayerInput] = useState<Color[]>([]);
  const [phase,       setPhase]       = useState<string>("idle");
  const [litColor,    setLitColor]    = useState<Color | "error" | null>(null);
  const [score,       setScore]       = useState<number>(0);
  const [round,       setRound]       = useState<number>(0);
  const [resultMsg,   setResultMsg]   = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [playerName,  setPlayerName]  = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mqttStatus,  setMqttStatus]  = useState<string>("disconnected");
  const [mqttLog,     setMqttLog]     = useState<string[]>([]);

  const clientRef      = useRef<any>(null);
  const phaseRef       = useRef<string>(phase);
  const playerInputRef = useRef<Color[]>(playerInput);
  const masterSeqRef   = useRef<Color[]>(masterSeq);
  const scoreRef       = useRef<number>(score);

  useEffect(() => { phaseRef.current       = phase;       }, [phase]);
  useEffect(() => { playerInputRef.current = playerInput; }, [playerInput]);
  useEffect(() => { masterSeqRef.current   = masterSeq;   }, [masterSeq]);
  useEffect(() => { scoreRef.current       = score;       }, [score]);

  useEffect(() => {
    fetch("http://localhost:3000/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then((user) => {
        setCurrentUser(user);
        if (user?.prenom_user) setPlayerName(user.prenom_user);
      })
      .catch(err => console.error("Auth error:", err));
  }, []);

  // ── Fetch leaderboard ──────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/scores/top5");
      if (res.ok) setLeaderboard(await res.json());
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // ── Connexion MQTT ─────────────────────────────────────────────────────────
  useEffect(() => {
    const c = mqtt.connect(BROKER_URL);
    clientRef.current = c;

    c.on("connect", () => {
      setMqttStatus("connected");
      logMqtt("Broker MQTT connecté ✓");
      c.subscribe(TOPIC_PRESS);
    });

    c.on("error", (err: any) => {
      setMqttStatus("error");
      logMqtt(`Erreur: ${err.message}`);
    });

    c.on("close", () => {
      setMqttStatus("disconnected");
      logMqtt("Déconnecté du broker");
    });

    c.on("message", (topic: string, msg: Buffer) => {
      const text = msg.toString().trim();
      logMqtt(`← ${text}`);

      if (topic === TOPIC_PRESS && text.startsWith("PRESS:")) {
        const color = text.split(":")[1]?.toLowerCase();
        if (color && COLORS.includes(color as Color)) {
          if (phaseRef.current === "waiting") {
            handleColorPress(color as Color);
          }
        }
      }
    });

    return () => { c.end(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Publish vers le Pico ───────────────────────────────────────────────────
  const publish = useCallback((msg: string) => {
    if (!clientRef.current) return;
    clientRef.current.publish(TOPIC_CMD, msg);
    logMqtt(`→ ${msg}`);
  }, []);

  const logMqtt = (msg: string) => {
    setMqttLog(l => [...l.slice(-19), msg]);
  };

  // ── Save score to backend ──────────────────────────────────────────────────
  const saveScore = useCallback(async (finalScore: number) => {
    if (finalScore === 0) return;
    if (!currentUser?.id_user) return;

    try {
      const res = await fetch("http://localhost:3000/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_user: currentUser.id_user,
          score: finalScore,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Backend error:", err);
        return;
      }

      fetchLeaderboard();
    } catch (err) {
      console.error("Erreur saveScore:", err);
    }
  }, [fetchLeaderboard, currentUser?.id_user]);

  // ── Ajoute une couleur aléatoire à la séquence maître ─────────────────────
  const appendColor = (): Color => COLORS[Math.floor(Math.random() * COLORS.length)];

  // ── Flash la séquence visible ──────────────────────────────────────────────
  const showSequence = useCallback(async (seq: Color[]) => {
    setPhase("showing");
    setLitColor(null);
    await delay(600);

    for (const color of seq) {
      setLitColor(color);
      publish(`SHOW:${color}`);
      await delay(FLASH_DURATION);
      setLitColor(null);
      publish("OFF");
      await delay(FLASH_PAUSE);
    }

    await delay(300);
    setPhase("waiting");
    setPlayerInput([]);
  }, [publish]);

  // ── Démarre une nouvelle manche ────────────────────────────────────────────
  const nextRound = useCallback(async (prevMaster: Color[]) => {
    const newColor = appendColor();
    const newSeq   = [...prevMaster, newColor];
    setMasterSeq(newSeq);
    setRound(newSeq.length);
    await showSequence(newSeq);
  }, [showSequence]);

  // ── Démarre le jeu ─────────────────────────────────────────────────────────
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

  // ── Gestion d'une pression couleur ────────────────────────────────────────
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
      const newScore = seq.length;
      setScore(newScore);
      setResultMsg("✓ BRAVO !");
      setPhase("result");
      setTimeout(async () => {
        setResultMsg("");
        await nextRound(masterSeqRef.current);
      }, 900);
    }
  }, [saveScore, nextRound]);

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
    <div className="sg-root">

      {/* ── Left panel: Leaderboard ── */}
      <aside className="sg-panel sg-panel--left">
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
            const meta    = COLOR_META[color];
            const isLit   = litColor === color;
            const isError = litColor === "error";
            return (
              <button
                key={color}
                className={`sg-btn sg-btn--${color} ${isLit ? "sg-btn--lit" : ""} ${isError ? "sg-btn--error" : ""}`}
                style={{ "--c": meta.hex, "--glow": meta.glow } as React.CSSProperties}
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

        {/* Progress dots */}
        {phase === "waiting" && (
          <div className="sg-progress">
            {masterSeq.map((c, i) => {
              const pressed = i < playerInput.length;
              return (
                <span
                  key={i}
                  className={`sg-dot ${pressed ? "sg-dot--done" : ""}`}
                  style={{ "--c": pressed ? COLOR_META[c].hex : "#ffffff33" } as React.CSSProperties}
                />
              );
            })}
          </div>
        )}

        {/* Bouton démarrer / redémarrer */}
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

        {/* 🏆 LEADERBOARD */}
        <div className="sg-leaderboard-container">
          <h2>🏆 Top 5</h2>
          <table className="sg-leaderboard">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Joueur</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={entry.id_score}>
                  <td>#{i + 1}</td>
                  <td>
                    {entry.utilisateur?.prenom_user} {entry.utilisateur?.nom_user}
                  </td>
                  <td>{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Right panel: MQTT ── */}
      <aside className="sg-panel sg-panel--right">
        <h2 className="sg-panel-title">PI PICO</h2>
        <div className={`sg-serial-badge sg-serial-badge--${mqttStatus}`}>
          {mqttStatus === "connected" ? "● CONNECTÉ"  :
           mqttStatus === "error"     ? "● ERREUR"    :
                                        "○ DÉCONNECTÉ"}
        </div>

        <p className="sg-serial-hint">
          Broker : <code>10.214.81.52</code><br />
          Utilisez les boutons du Pico ou les tuiles ci-dessus.
        </p>

        <div className="sg-log">
          {mqttLog.map((l, i) => (
            <div key={i} className="sg-log-line">{l}</div>
          ))}
          {mqttLog.length === 0 && (
            <div className="sg-log-line sg-log-line--empty">— console MQTT —</div>
          )}
        </div>
      </aside>

    </div>
  );
}

