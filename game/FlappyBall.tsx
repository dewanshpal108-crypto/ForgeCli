import React, { useRef, useEffect, useState } from "react";
import { startGame } from './gameLogic';
import './styles.css';

const FlappyBall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [runId, setRunId] = useState(0);
  const gameRef = useRef<any>(null);

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    setRunId((id) => id + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = (canvas as any).getContext('2d');
    if (!ctx) return;

    const game = startGame(
      canvas,
      ctx,
      setScore,
      () => setGameOver(true)
    );

    gameRef.current = game;

    return () => gameRef.current?.stop();
  }, [runId]);

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="game-canvas"
      />
      <div className="score-overlay">Score: {score}</div>
      {gameOver && (
        <div className="game-over-overlay">
          <h1>Game Over</h1>
          <p>Score: {score}</p>
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default FlappyBall;