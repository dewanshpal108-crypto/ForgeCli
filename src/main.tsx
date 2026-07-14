import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import FlappyBird from '../game/FlappyBall';

type StartScreenProps = {
  onStart: () => void;
};

const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="start-screen-container">
      <h1>Flappy Bird Clone</h1>
      <button className="start-button" onClick={onStart}>
        Start Game
      </button>
      <div className="instructions">Press Space or Click/Tap to fly</div>
    </div>
  );
};

export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  return (
    <div className="app-container">
      {!isGameStarted ? (
        <StartScreen onStart={() => setIsGameStarted(true)} />
      ) : (
        <FlappyBird />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);