/**
 * @file IntervalTimer.jsx
 * @description Full-screen interval timer for training sessions
 * @project Felony Fitness
 * 
 * This component provides a customizable interval timer with:
 * - Work/rest time configuration
 * - Full-screen countdown display
 * - Visual cues (green for work, yellow for rest)
 * - Countdown animations for final 4 seconds
 * - Continuous cycling until stopped
 */

import { Pause, Play, Settings, StopCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './IntervalTimer.css';

/**
 * IntervalTimer component for workout interval training
 * 
 * @component
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

    /** @type {[number, Function]} Current countdown value */
    const [currentTime, setCurrentTime] = useState(0);

    /** @type {[string, Function]} Current phase: 'work' or 'rest' */
    const [phase, setPhase] = useState('work');

    /** @type {[number, Function]} Round counter */
    const [round, setRound] = useState(1);

    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    /**
     * Start the timer
     */
    const handleStart = () => {
        const work = parseInt(workTime) || 30;
        setShowConfig(false);
        setShowTimer(true);
        setIsRunning(true);
        setCurrentTime(work);
        setPhase('work');
    };

    /**
     * Stop the timer and return to config
     */
    const handleStop = () => {
        setIsRunning(false);
        setShowTimer(false);
        setShowConfig(false);
        setCurrentTime(0);
        setPhase('work');
        setRound(1);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (onClose) {
            onClose();
        }
    };

    /**
     * Toggle pause/resume
     */
    const handlePause = () => {
        setIsRunning(!isRunning);
    };

    /**
     * Timer countdown logic
     */
    useEffect(() => {
        if (isRunning) {
            const work = parseInt(workTime) || 30;
            const rest = parseInt(restTime) || 15;

            intervalRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev <= 0) {
                        // Phase complete - switch to next phase
                        if (phase === 'work') {
                            setPhase('rest');
                            return rest;
                        } else {
                            // Delay before switching to work to show "GO!"
                            timeoutRef.current = setTimeout(() => {
                                setPhase('work');
                                setRound(r => r + 1);
                                setCurrentTime(work);
                            }, 1000);
                            return 0; // Keep at 0 to display "GO!"
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isRunning, phase, workTime, restTime]);

    /**
     * Format time as MM:SS
     */
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    /**
     * Get display text based on phase and time remaining
     */
    const getDisplayText = () => {
        const rest = parseInt(restTime) || 15;

        if (phase === 'rest') {
            if (currentTime === rest) {
                return 'BREAK!';
            } else if (currentTime <= 4 && currentTime > 0) {
                return currentTime.toString();
            } else if (currentTime === 0) {
                return 'GO!';
            } else {
                return formatTime(currentTime);
            }
        }
        if (phase === 'work') {
            return formatTime(currentTime);
        }
    };

    /**
     * Get background color class
     */
    const getBackgroundClass = () => {
        if (phase === 'work') return 'bg-work';
        if (phase === 'rest' && currentTime <= 4 && currentTime > 0) return 'bg-countdown';
        if (phase === 'rest' && currentTime === 0) return 'bg-work'; // Green for "GO!"
        return 'bg-rest';
    };

    /**
     * Get text size class based on content
     */
    const getTextSizeClass = () => {
        const rest = parseInt(restTime) || 15;

        if (phase === 'rest' && currentTime <= 4 && currentTime > 0) return 'text-countdown';
        if (phase === 'rest' && currentTime === 0) return 'text-countdown'; // GO! uses countdown size
        if (phase === 'rest' && currentTime === rest) return 'text-break'; // BREAK! 
        return 'text-timer';
    };

    return (
        <div className="interval-timer-container">
            {/* Configuration Modal */}
            {showConfig && (
                <div className="timer-config-modal">
                    <div className="config-content">
                        <div className="config-header">
                            <div>
                                <Settings size={32} />
                                <h2>Interval Timer Setup</h2>
                                <p>Configure your work and rest intervals</p>
                            </div>
                            <button onClick={onClose} className="close-btn" aria-label="Close">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="config-body">
                            <div className="time-input-group">
                                <label htmlFor="work-time">Work Time (seconds)</label>
                                <input
                                    id="work-time"
                                    type="number"
                                    min="5"
                                    max="300"
                                    placeholder="30"
                                    value={workTime}
                                    onChange={(e) => setWorkTime(e.target.value)}
                                />
                            </div>

                            <div className="time-input-group">
                                <label htmlFor="rest-time">Rest Time (seconds)</label>
                                <input
                                    id="rest-time"
                                    type="number"
                                    min="5"
                                    max="300"
                                    placeholder="15"
                                    value={restTime}
                                    onChange={(e) => setRestTime(e.target.value)}
                                />
                            </div>

                            <div className="config-preview">
                                <p><strong>Work:</strong> {formatTime(parseInt(workTime) || 30)}</p>
                                <p><strong>Rest:</strong> {formatTime(parseInt(restTime) || 15)}</p>
                                <p><strong>Total Cycle:</strong> {formatTime((parseInt(workTime) || 30) + (parseInt(restTime) || 15))}</p>
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
