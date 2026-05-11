import { useEffect, useState } from "react";
import "../utils/Game.css";

export default function ReactionGameResults() {
  const [bestScores, setBestScores] = useState([]);
  const [lastScore, setLastScore] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/scores");
        const data = await response.json();

        setLastScore(data.lastScore);
        setBestScores(data.topScores);
      } catch (error) {
        console.error("Erreur lors du chargement des scores:", error);
      }
    };

    fetchScores();
  }, []);

  return (
    <div className="app-container">
      <div className="game-card">
        <div className="header">
          <h1 className="title">Reaction LED Game</h1>
          <p className="subtitle">
            Appuie le plus vite possible quand la LED s’allume.
          </p>
        </div>

        <div className="last-score-card">
          <p className="score-label">
            Dernier score
          </p>
          <h2 className="score-value">
            {lastScore}
            <span className="score-unit">ms</span>
          </h2>
        </div>

        <div className="top-scores-card">
          <h3 className="top-title">
            Top 5 Scores
          </h3>

          <div className="scores-list">
            {bestScores.map((score, index) => (
              <div
                key={index}
                className="score-item"
              >
                <span className="rank">
                  #{index + 1}
                </span>
                <span className="score">
                  {score} ms
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="button-container">
          <button className="start-button">
            START
          </button>
        </div>
      </div>
    </div>
  );
}
