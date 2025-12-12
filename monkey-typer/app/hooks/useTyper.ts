"use client";

import { useState, useEffect, useCallback } from "react";
import { words as wordList } from "../utils/words";

const WORD_COUNT = 50;
const GAME_DURATION = 30; // seconds

export type GameState = "idle" | "running" | "finished";

export const useTyper = () => {
    const [words, setWords] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [correctWords, setCorrectWords] = useState(0);
    const [correctChars, setCorrectChars] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [gameState, setGameState] = useState<GameState>("idle");
    const [wpm, setWpm] = useState(0);

    // Initialize game
    const resetGame = useCallback(() => {
        const shuffled = [...wordList].sort(() => 0.5 - Math.random()).slice(0, WORD_COUNT);
        setWords(shuffled);
        setInputValue("");
        setCurrentWordIndex(0);
        setCorrectWords(0);
        setCorrectChars(0);
        setMistakes(0);
        setTimeLeft(GAME_DURATION);
        setGameState("idle");
        setWpm(0);
    }, []);

    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === "running" && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        setGameState("finished");
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timeLeft]);

    // Calculate WPM when finished
    useEffect(() => {
        if (gameState === "finished") {
            const timeElapsed = GAME_DURATION - timeLeft;
            const minutes = timeElapsed / 60;
            // Standard formula: (characters / 5) / minutes
            const calculatedWpm = Math.round((correctChars / 5) / (GAME_DURATION / 60));
            setWpm(calculatedWpm);
        }
    }, [gameState, correctChars, timeLeft]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (gameState === "finished") return;

        const value = e.target.value;
        if (gameState === "idle") {
            setGameState("running");
        }

        // Handle space (word submission)
        if (value.endsWith(" ")) {
            const currentWord = words[currentWordIndex];
            const trimmedValue = value.trim();

            if (trimmedValue === currentWord) {
                setCorrectWords((prev) => prev + 1);
                setCorrectChars((prev) => prev + currentWord.length + 1); // +1 for space
            } else {
                setMistakes((prev) => prev + 1);
            }

            setCurrentWordIndex((prev) => {
                const next = prev + 1;
                if (next >= words.length) {
                    setGameState("finished");
                    return prev;
                }
                return next;
            });
            setInputValue("");
        } else {
            setInputValue(value);
        }
    };

    return {
        words,
        inputValue,
        currentWordIndex,
        timeLeft,
        gameState,
        wpm,
        correctWords,
        mistakes,
        handleInput,
        resetGame,
    };
};
