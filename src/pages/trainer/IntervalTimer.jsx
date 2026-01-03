/**
 * @file IntervalTimer.jsx
 * @description Full-screen interval timer for training sessions
 * @project Felony Fitness
 * * Updates:
 * - Fixed bug where round counter incremented on every phase change (1, 3, 5...)
 * - Logic now only increments round when switching from Rest -> Work
 */

import { Pause, Play, Settings, StopCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './IntervalTimer.css';

/**
 * IntervalTimer component for workout interval training
 * * @component
 * @param {Object} props
 * @param {Function} props.onClose - Callback to close the timer
 * @returns {JSX.Element} Interval timer with full-screen display
 */
const IntervalTimer = ({ onClose }) => {
    /** @type {[boolean, Function]} Configuration modal visibility */
    const [showConfig, setShowConfig] = useState(true);

    /** @type {[boolean, Function]} Timer running state */
    const [isRunning, setIsRunning] = useState(false);

    /** @type {[boolean, Function]} Full-screen timer visibility */
    const [showTimer, setShowTimer] = useState(false);

    /** @type {[number|string, Function]} Work time in seconds */
    const [workTime, setWorkTime] = useState('');

    /** @type {[number|string, Function]} Rest time in seconds */
    const [restTime, setRestTime] = useState('');

    /** @type {[number, Function]} Current time remaining */
    const [timeLeft, setTimeLeft] = useState(0);

    /** @type {[string, Function]} Current phase: 'work' | 'rest' */
    const [phase, setPhase] = useState('work');

    /** @type {[number, Function]} Current round number */
    const [round, setRound] = useState(1);

    /** @type {Object} Audio context refs */
    const audioContextRef = useRef(null);

    // Initialize audio context on mount
    useEffect(() => {
        // Create audio context only on user interaction to comply with browser policies
        // We'll initialize it in handleStart
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const playBeep = (freq = 440, type = 'sine', duration = 0.1) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    // Timer Logic
    useEffect(() => {
        let interval = null;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    // Beep on last 3 seconds (3, 2, 1)
                    if (prev <= 4 && prev > 1) {
                        playBeep(440, 'sine', 0.1); // Low beep
                    } else if (prev === 1) {
                        playBeep(880, 'square', 0.3); // High beep on zero/switch
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (isRunning && timeLeft === 0) {
            // Switch phases
            if (phase === 'work') {
                // Work -> Rest
                setPhase('rest');
                setTimeLeft(Number(restTime));
                // Do NOT increment round here
            } else {
                // Rest -> Work
                setPhase('work');
                setTimeLeft(Number(workTime));
                setRound((prev) => prev + 1); // Only increment when starting new Work round
            }
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, phase, workTime, restTime]);

    const handleStart = () => {
        if (!workTime || !restTime) return;
        
        // Initialize audio on first user interaction
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        setShowConfig(false);
        setShowTimer(true);
        setIsRunning(true);
        setPhase('work');
        setRound(1);
        setTimeLeft(Number(workTime));
    };

    const handleStop = () => {
        setIsRunning(false);
        setShowTimer(false);
        setShowConfig(true);
        setRound(1);
    };

    const handlePause = () => {
        setIsRunning(!isRunning);
    };

    const getBackgroundClass = () => {
        if (phase === 'work') return 'bg-work'; // Green/Orange
        return 'bg-rest'; // Yellow/Blue
    };

    const getTextSizeClass = () => {
        if (timeLeft <= 3) return 'text-countdown';
        if (phase === 'rest') return 'text-break';
        return 'text-timer';
    };

    const getDisplayText = () => {
        if (timeLeft <= 3 && timeLeft > 0) return timeLeft; // Big 3, 2, 1
        if (phase === 'rest' && timeLeft > 3) return 'REST';
        
        // Format MM:SS if > 60s, else just seconds
        if (timeLeft >= 60) {
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }
        return timeLeft;
    };

    return (
        <div className="interval-timer-container">
            {/* Configuration Modal */}
            {showConfig && (
                <div className="timer-config-modal">
                    <div className="config-content">
                        <div className="config-header">
                            <Settings size={32} />
                            <h2>Interval Timer</h2>
                            <button onClick={onClose} className="close-btn"><X size={24} /></button>
                        </div>

                        <div className="time-inputs">
                            <div className="input-group">
                                <label>Work (sec)</label>
                                <input 
                                    type="number" 
                                    value={workTime} 
                                    onChange={(e) => setWorkTime(e.target.value)}
                                    placeholder="45"
                                />
                            </div>
                            <div className="input-group">
                                <label>Rest (sec)</label>
                                <input 
                                    type="number" 
                                    value={restTime} 
                                    onChange={(e) => setRestTime(e.target.value)}
                                    placeholder="15"
                                />
                            </div>
                        </div>

                        <div className="config-actions">
                            <button onClick={handleStart} className="start-button">
                                <Play size={20} />
                                <span>Start Timer</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full-Screen Timer Display */}
            {showTimer && (
                <div className={`timer-fullscreen ${getBackgroundClass()}`}>
                    <div className="timer-controls">
                        <button onClick={handlePause} className="control-btn">
                            {isRunning ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button onClick={handleStop} className="control-btn stop-btn">
                            <StopCircle size={24} />
                            <span>Stop</span>
                        </button>
                    </div>

                    <div className="timer-info">
                        <div className="round-counter">Round {round}</div>
                        <div className="phase-label">{phase === 'work' ? 'WORK' : 'REST'}</div>
                    </div>

                    <div className={`timer-display ${getTextSizeClass()}`}>
                        {getDisplayText()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntervalTimer;