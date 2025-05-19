import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import './InterviewSession.css';

function InterviewSession() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRemaining, setTimeRemaining] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isSessionStarted, setIsSessionStarted] = useState(false);

    // Fetch interview details
    useEffect(() => {
        const fetchInterviewDetails = async () => {
            try {
                // Get interview data from localStorage that was set when joining
                const interviewData = JSON.parse(localStorage.getItem('currentInterview'));
                
                if (!interviewData) {
                    throw new Error('Interview details not found');
                }

                setInterview(interviewData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching interview:', err);
                setError('Failed to load interview details');
                setLoading(false);
            }
        };

        fetchInterviewDetails();
    }, [interviewId, currentUser?.uid]);

    // Countdown timer effect
    useEffect(() => {
        if (!interview) return;

        // Parse date and time properly
        const parseInterviewDateTime = () => {
            try {
                // First, properly format the date parts
                const dateParts = interview.date.split('-');
                if (dateParts.length !== 3) {
                    throw new Error('Invalid date format');
                }

                // Parse time - expecting format like "14:00" or "2:00 PM"
                let hours = 0;
                let minutes = 0;
                
                // Check if time includes AM/PM
                if (interview.time.includes('AM') || interview.time.includes('PM')) {
                    const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
                    const matches = interview.time.match(timeRegex);
                    
                    if (matches && matches.length >= 4) {
                        hours = parseInt(matches[1], 10);
                        minutes = parseInt(matches[2], 10);
                        
                        // Convert to 24-hour format if PM
                        if (matches[3].toUpperCase() === 'PM' && hours < 12) {
                            hours += 12;
                        }
                        // Convert 12 AM to 0 hours
                        if (matches[3].toUpperCase() === 'AM' && hours === 12) {
                            hours = 0;
                        }
                    }
                } else {
                    // Assume 24-hour format (HH:MM)
                    const timeParts = interview.time.split(':');
                    if (timeParts.length >= 2) {
                        hours = parseInt(timeParts[0], 10);
                        minutes = parseInt(timeParts[1], 10);
                    }
                }
                
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-based
                const day = parseInt(dateParts[2], 10);
                
                // Create date with specific year, month, day, hours, minutes
                const dateTime = new Date(year, month, day, hours, minutes, 0);
                console.log('Parsed interview date/time:', dateTime.toString());
                
                return dateTime;
            } catch (err) {
                console.error('Error parsing date/time:', err);
                // Fallback to basic parsing as last resort
                return new Date(`${interview.date} ${interview.time}`);
            }
        };

        const interviewDateTime = parseInterviewDateTime();
        
        const updateCountdown = () => {
            const now = new Date();
            const timeDiff = interviewDateTime - now;

            console.log('Current time:', now.toString());
            console.log('Interview time:', interviewDateTime.toString());
            console.log('Time difference (ms):', timeDiff);

            // If interview time has passed
            if (timeDiff <= 0) {
                setTimeRemaining({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                });
                return;
            }
            
            // Calculate time remaining
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            setTimeRemaining({ days, hours, minutes, seconds });
        };

        // Update every second
        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);
        
        return () => clearInterval(intervalId);
    }, [interview]);

    const handleStartSession = () => {
        setIsSessionStarted(true);
        // In a real application, you might initiate a WebRTC connection or similar
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="interview-session-container">
                    <div className="loading-spinner">Loading interview details...</div>
                </div>
            </PageTransition>
        );
    }

    if (error) {
        return (
            <PageTransition>
                <div className="interview-session-container">
                    <div className="error-message">{error}</div>
                    <button 
                        className="back-button"
                        onClick={() => navigate('/schedule')}
                    >
                        Back to Schedule
                    </button>
                </div>
            </PageTransition>
        );
    }

    if (!interview) {
        return (
            <PageTransition>
                <div className="interview-session-container">
                    <div className="error-message">Interview not found</div>
                    <button 
                        className="back-button"
                        onClick={() => navigate('/schedule')}
                    >
                        Back to Schedule
                    </button>
                </div>
            </PageTransition>
        );
    }

    // Helper function to format date for display
    const formatScheduledTime = () => {
        try {
            const dateParts = interview.date.split('-');
            if (dateParts.length !== 3) {
                return `${interview.date} ${interview.time}`;
            }
            
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const day = parseInt(dateParts[2], 10);
            
            // Create a date object for the date only
            const date = new Date(year, month, day);
            
            // Format the date part
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
            });
            
            return `${formattedDate} at ${interview.time}`;
        } catch (err) {
            console.error('Error formatting scheduled time:', err);
            return `${interview.date} ${interview.time}`;
        }
    };

    return (
        <PageTransition>
            <div className="interview-session-container">
                <div className="interview-header">
                    <h1>{interview.type} Interview Session</h1>
                    <div className="interview-meta">
                        <p>Scheduled for: {formatScheduledTime()}</p>
                        <p>Duration: {interview.duration} minutes</p>
                        {interview.interviewer && <p>Interviewer: {interview.interviewer}</p>}
                    </div>
                </div>

                {!isSessionStarted ? (
                    <div className="pre-session">
                        <div className="countdown-container">
                            <h2>Time until interview starts:</h2>
                            <div className="countdown">
                                <div className="time-unit">
                                    <span className="time-value">{timeRemaining.days}</span>
                                    <span className="time-label">Days</span>
                                </div>
                                <div className="time-unit">
                                    <span className="time-value">{timeRemaining.hours}</span>
                                    <span className="time-label">Hours</span>
                                </div>
                                <div className="time-unit">
                                    <span className="time-value">{timeRemaining.minutes}</span>
                                    <span className="time-label">Minutes</span>
                                </div>
                                <div className="time-unit">
                                    <span className="time-value">{timeRemaining.seconds}</span>
                                    <span className="time-label">Seconds</span>
                                </div>
                            </div>
                        </div>

                        <div className="session-actions">
                            <button 
                                className="start-button" 
                                onClick={handleStartSession}
                            >
                                Start Now
                            </button>
                            <button 
                                className="back-button"
                                onClick={() => navigate('/schedule')}
                            >
                                Back to Schedule
                            </button>
                        </div>

                        <div className="preparation-tips">
                            <h3>Preparation Tips</h3>
                            <ul>
                                <li>Test your camera and microphone before the interview</li>
                                <li>Find a quiet, well-lit space for your interview</li>
                                <li>Have a copy of your resume and notes ready</li>
                                <li>Dress professionally, even for remote interviews</li>
                                <li>Prepare questions to ask the interviewer</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="active-session">
                        <h2>Interview in Progress</h2>
                        <div className="video-container">
                            {/* Video conferencing UI would be integrated here in a real app */}
                            <div className="placeholder-video">
                                <p>Video conferencing would appear here in a production app.</p>
                                <p>This is a simulation for demonstration purposes.</p>
                            </div>
                        </div>
                        <div className="session-controls">
                            <button className="control-button mute">Mute</button>
                            <button className="control-button video">Stop Video</button>
                            <button className="control-button share">Share Screen</button>
                            <button className="control-button end" onClick={() => navigate('/schedule')}>End Session</button>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}

export default InterviewSession; 