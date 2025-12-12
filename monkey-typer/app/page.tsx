"use client";

import { useEffect, useRef, useState } from "react";
import { useTyper } from "./hooks/useTyper";

type Score = {
  nickname: string;
  wpm: number;
  accuracy: number;
  created_at: number;
};

export default function Home() {
  const {
    words,
    inputValue,
    currentWordIndex,
    timeLeft,
    gameState,
    wpm,
    correctWords,
    mistakes,
    handleInput,
    resetGame: baseResetGame,
  } = useTyper();

  const inputRef = useRef<HTMLInputElement>(null);
  const wordContainerRef = useRef<HTMLDivElement>(null);

  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);

  // Focus input automatically
  useEffect(() => {
    if (gameState !== "finished") {
      inputRef.current?.focus();
    }
  }, [gameState, currentWordIndex]);

  // Fetch leaderboard on load and when game finishes
  useEffect(() => {
    fetch('/api/scores').then(res => res.json()).then(data => setLeaderboard(data));
  }, [gameState]);

  const submitScore = async () => {
    if (!nickname.trim()) return;
    setIsSubmitting(true);

    const accuracy = correctWords + mistakes > 0
      ? (correctWords / (correctWords + mistakes)) * 100
      : 0;

    await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname,
        wpm,
        accuracy
      })
    });

    setIsSubmitting(false);
    setHasSubmitted(true);
    // Refresh leaderboard
    fetch('/api/scores').then(res => res.json()).then(data => setLeaderboard(data));
  };

  const resetGame = () => {
    setHasSubmitted(false);
    setNickname("");
    baseResetGame();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 font-mono selection:bg-yellow-500/30">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold text-yellow-500 tracking-tighter">
            Monkey Typer
          </h1>
          <div className="flex gap-6 text-2xl font-bold">
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Time</span>
              <span className={timeLeft < 10 ? "text-red-500" : "text-yellow-500"}>{timeLeft}s</span>
            </div>
            {gameState === "finished" && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">WPM</span>
                <span className="text-yellow-500">{wpm}</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="relative group">
          {/* Overlay for finished state */}
          {gameState === "finished" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md rounded-xl border border-zinc-800 animate-in fade-in duration-300 p-4">
              <div className="w-full max-w-3xl space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-3xl font-bold text-white">Time's Up!</h2>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                  <div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider">WPM</div>
                    <div className="text-3xl font-bold text-yellow-500">{wpm}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider">Accuracy</div>
                    <div className="text-3xl font-bold text-white">
                      {correctWords + mistakes > 0
                        ? Math.round((correctWords / (correctWords + mistakes)) * 100)
                        : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider">Correct</div>
                    <div className="text-xl font-bold text-green-500">{correctWords}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider">Mistakes</div>
                    <div className="text-xl font-bold text-red-500">{mistakes}</div>
                  </div>
                </div>

                {/* Submission Form */}
                {!hasSubmitted ? (
                  <div className="flex gap-4 items-center justify-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                    <input
                      type="text"
                      placeholder="Enter Nickname"
                      className="bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 w-56 text-white focus:outline-none focus:border-yellow-500"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                    />
                    <button
                      onClick={submitScore}
                      disabled={isSubmitting || !nickname.trim()}
                      className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded transition-colors text-sm"
                    >
                      {isSubmitting ? '...' : 'Submit'}
                    </button>
                    <button
                      onClick={resetGame}
                      className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded transition-colors text-sm"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="text-center flex items-center justify-center gap-4">
                    <span className="text-green-500 font-bold text-sm">Score Submitted!</span>
                    <button
                      onClick={resetGame}
                      className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-colors text-sm"
                    >
                      Play Again
                    </button>
                  </div>
                )}

                {/* Leaderboard */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center">Top 10 Leaderboard</h3>
                  <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-950 text-zinc-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2 font-medium">Rank</th>
                          <th className="px-4 py-2 font-medium">Player</th>
                          <th className="px-4 py-2 font-medium text-right">WPM</th>
                          <th className="px-4 py-2 font-medium text-right">Acc</th>
                          <th className="px-4 py-2 font-medium text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {leaderboard.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-zinc-600">No scores yet.</td>
                          </tr>
                        ) : (
                          leaderboard.map((score, i) => (
                            <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                              <td className="px-4 py-1.5 text-zinc-500">#{i + 1}</td>
                              <td className="px-4 py-1.5 font-medium text-white">{score.nickname}</td>
                              <td className="px-4 py-1.5 text-right text-yellow-500 font-bold">{score.wpm}</td>
                              <td className="px-4 py-1.5 text-right text-zinc-400">{Math.round(score.accuracy)}%</td>
                              <td className="px-4 py-1.5 text-right text-zinc-600">
                                {new Date(score.created_at * 1000).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Words Display */}
          <div
            ref={wordContainerRef}
            className="relative z-10 bg-zinc-900/50 rounded-xl p-8 border border-zinc-800 min-h-[200px] flex flex-wrap content-start gap-4 text-2xl leading-relaxed select-none overflow-hidden"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Blur hints to focus user */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_20px_rgba(9,9,11,1)]"></div>

            {words.map((word, idx) => {
              const isCurrent = idx === currentWordIndex;
              const isPast = idx < currentWordIndex;

              return (
                <span
                  key={idx}
                  className={`relative px-1 rounded transition-colors duration-100 ${isCurrent
                    ? "text-yellow-500 bg-yellow-500/10"
                    : isPast
                      ? "text-zinc-700 decoration-zinc-800"
                      : "text-zinc-500"
                    }`}
                >
                  {/* Cursor for current word */}
                  {isCurrent && (
                    <span
                      className="absolute -left-1 top-1 bottom-1 w-[2px] bg-yellow-500 animate-pulse"
                      style={{ left: `${inputValue.length * 0.6 + 0.2}em` }}
                    ></span>
                  )}

                  {word.split('').map((char, charIdx) => {
                    let charColor = "inherit";
                    if (isCurrent) {
                      if (charIdx < inputValue.length) {
                        charColor = inputValue[charIdx] === char ? "text-white" : "text-red-500";
                      }
                    }
                    return <span key={charIdx} className={charColor === "inherit" ? "" : charColor}>{char}</span>
                  })}
                </span>
              );
            })}
          </div>

          {/* Hidden Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInput}
            className="absolute opacity-0 inset-0 cursor-default"
            autoFocus
            onBlur={(e) => {
              if (gameState !== "finished") e.target.focus();
            }}
          />
        </div>

        {/* Footer / Instructions */}
        <div className="text-center text-zinc-600 text-sm">
          <p>Start typing to begin. Press <kbd className="bg-zinc-800 px-2 py-1 rounded text-zinc-400 font-sans">Space</kbd> to jump to the next word.</p>
        </div>
      </div>
    </div>
  );
}
