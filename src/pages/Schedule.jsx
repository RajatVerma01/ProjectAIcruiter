import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import InterviewScheduler from '../components/InterviewScheduler';
import { 
  getUserInterviews, 
  cancelInterview, 
  testDatabaseConnection, 
  getDirectInterviews 
} from '../firebase';
import './Schedule.css';

function Schedule() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [upcomingInterviews, setUpcomingInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('Checking connection...');

    // Callback to update interviews - memoize to avoid infinite re-renders
    const updateInterviews = useCallback((interviews) => {
        console.log("Updating interviews in state:", interviews);
        // Filter out canceled interviews if needed
        const activeInterviews = interviews.filter(
            interview => interview.status !== 'canceled'
        );
        setUpcomingInterviews(activeInterviews);
        setLoading(false);
    }, []);

    useEffect(() => {
        console.log("Schedule component mounted");
        let unsubscribe = () => {};
        
        // Test database connection on component mount
        const testConnection = async () => {
            try {
                setConnectionStatus('Testing connection...');
                const { success, error: connectionError } = await testDatabaseConnection();
                
                if (!success) {
                    console.error('Database connection test failed:', connectionError);
                    setError(`Database connection issue: ${connectionError}`);
                    setConnectionStatus('Connection failed');
                } else {
                    console.log('Database connection test successful');
                    setConnectionStatus('Connected');
                    
                    // If connection test succeeded but we're still not getting interviews
                    // Try direct access as fallback after 3 seconds
                    setTimeout(tryDirectAccess, 3000);
                }
            } catch (err) {
                console.error('Exception testing connection:', err);
                setConnectionStatus('Connection error');
                setError(`Connection test error: ${err.message}`);
            }
        };
        
        // Fallback function to try direct database access
        const tryDirectAccess = async () => {
            // Only run if we're still loading (meaning the real-time listener didn't work)
            if (loading) {
                console.log('Real-time listener taking too long, trying direct database access...');
                
                try {
                    const { success, data, error: directError } = await getDirectInterviews();
                    
                    if (success) {
                        if (data && data.length > 0) {
                            console.log('Direct access successful, found interviews:', data);
                            // Filter to just this user's interviews
                            const userInterviews = data.filter(
                                interview => interview.userId === currentUser?.uid
                            );
                            
                            if (userInterviews.length > 0) {
                                console.log(`Found ${userInterviews.length} interviews for current user`);
                                updateInterviews(userInterviews);
                            } else {
                                console.log('No interviews found for current user');
                                setUpcomingInterviews([]);
                                setLoading(false);
                            }
                        } else {
                            console.log('Direct access successful, but no interviews found');
                            setUpcomingInterviews([]);
                            setLoading(false);
                        }
                    } else {
                        console.error('Direct access failed:', directError);
                        setError(`Direct database access failed: ${directError}`);
                        setLoading(false);
                    }
                } catch (err) {
                    console.error('Exception in direct access:', err);
                    setError(`Failed to access database directly: ${err.message}`);
                    setLoading(false);
                }
            }
        };
        
        testConnection();
        
        // Set up real-time listener for user interviews
        if (currentUser && currentUser.uid) {
            console.log("Setting up interviews listener for user:", currentUser.uid);
            try {
                unsubscribe = getUserInterviews(currentUser.uid, updateInterviews);
                console.log("Listener setup complete");
            } catch (err) {
                console.error("Error setting up listener:", err);
                setError(`Failed to load interviews: ${err.message}`);
                setLoading(false);
            }
        } else {
            console.log("No current user available");
            setLoading(false);
        }
        
        // Clean up the listener when component unmounts
        return () => {
            console.log("Schedule component unmounting, cleaning up listener");
            if (unsubscribe) unsubscribe();
        };
    }, [currentUser, updateInterviews, loading]);

    const openScheduler = () => {
        setIsSchedulerOpen(true);
    };

    const closeScheduler = () => {
        setIsSchedulerOpen(false);
    };

    const handleInterviewScheduled = (newInterview) => {
        console.log('New interview scheduled (callback triggered):', newInterview);
        closeScheduler();
        
        // We don't need to manually update state here as the 
        // real-time listener will automatically update
    };

    const handleJoinInterview = (interview) => {
        try {
            console.log("Joining interview:", interview);
            // Store interview data in localStorage for use in the interview session page
            localStorage.setItem('currentInterview', JSON.stringify(interview));
            // Navigate to the interview session page
            navigate(`/interview-session/${interview.id}`);
        } catch (err) {
            console.error('Error joining interview:', err);
            setError(`Failed to join interview: ${err.message}`);
        }
    };

    const handleCancelInterview = async (interviewId) => {
        try {
            console.log("Attempting to cancel interview:", interviewId);
            const { error: cancelError } = await cancelInterview(interviewId);
            if (cancelError) {
                throw new Error(cancelError);
            }
            console.log("Interview canceled successfully");
        } catch (err) {
            console.error('Error canceling interview:', err);
            setError(`Failed to cancel interview: ${err.message}`);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
        } catch (err) {
            console.error("Error formatting date:", dateString, err);
            return dateString || 'Invalid date';
        }
    };

    console.log("Rendering Schedule component with interviews:", upcomingInterviews);

    return (
        <PageTransition>
            <div className="schedule-container">
                <div className="schedule-header">
                    <h1>Interview Dashboard</h1>
                    <p>Welcome to your personal dashboard, {currentUser?.email}</p>
                    {connectionStatus && <p className="connection-status">{connectionStatus}</p>}
                </div>
                
                <div className="schedule-banner">
                    <div className="banner-content">
                        <h2>Ready for your next interview?</h2>
                        <p>Schedule a mock interview with our expert interviewers and get valuable feedback.</p>
                        <button className="schedule-now-button" onClick={openScheduler}>
                            Schedule Now
                        </button>
                    </div>
                    <div className="banner-image">
                        <img src="https://img.freepik.com/free-vector/job-interview-process-concept-illustration_114360-5881.jpg" alt="Interview illustration" />
                    </div>
                </div>

                <div className="schedule-content">
                    <div className="schedule-section">
                        <h2>Upcoming Interviews</h2>
                        {error && <div className="error-message">{error}</div>}
                        
                        {loading ? (
                            <div className="loading-spinner">Loading your interviews...</div>
                        ) : upcomingInterviews && upcomingInterviews.length > 0 ? (
                            <div className="interviews-list">
                                {upcomingInterviews.map(interview => (
                                    <div key={interview.id} className="interview-card">
                                        <div className="interview-card-header">
                                            <div className="interview-type">{interview.type}</div>
                                            <div className={`interview-status ${interview.status}`}>{interview.status}</div>
                                        </div>
                                        <div className="interview-card-body">
                                            <div className="interview-detail">
                                                <span className="detail-icon">📅</span>
                                                <span className="detail-text">{formatDate(interview.date)}</span>
                                            </div>
                                            <div className="interview-detail">
                                                <span className="detail-icon">⏰</span>
                                                <span className="detail-text">{interview.time} ({interview.duration} mins)</span>
                                            </div>
                                            <div className="interview-detail">
                                                <span className="detail-icon">👤</span>
                                                <span className="detail-text">Interviewer: {interview.interviewer || 'To be assigned'}</span>
                                            </div>
                                            {interview.specialRequirements && (
                                                <div className="interview-detail">
                                                    <span className="detail-icon">📝</span>
                                                    <span className="detail-text">Notes: {interview.specialRequirements}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="interview-card-footer">
                                            <button 
                                                className="interview-action join-button" 
                                                onClick={() => handleJoinInterview(interview)}
                                            >
                                                Join
                                            </button>
                                            <button className="interview-action reschedule-button">Reschedule</button>
                                            <button 
                                                className="interview-action cancel-button" 
                                                onClick={() => handleCancelInterview(interview.id)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>You don't have any upcoming interviews.</p>
                                <button className="schedule-button" onClick={openScheduler}>Schedule your first interview</button>
                            </div>
                        )}
                    </div>

                    <div className="user-profile-section">
                        <h3>Your Account Information</h3>
                        <div className="user-info-card">
                            <p><strong>Email:</strong> {currentUser?.email}</p>
                            <p><strong>User ID:</strong> {currentUser?.uid}</p>
                            <p><strong>Email Verified:</strong> {currentUser?.emailVerified ? 'Yes' : 'No'}</p>
                            {currentUser?.metadata && (
                                <>
                                    <p><strong>Created:</strong> {new Date(parseInt(currentUser.metadata.createdAt)).toLocaleString()}</p>
                                    <p><strong>Last Sign In:</strong> {new Date(parseInt(currentUser.metadata.lastSignInTime)).toLocaleString()}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <InterviewScheduler 
                    isOpen={isSchedulerOpen} 
                    onRequestClose={closeScheduler} 
                    onInterviewScheduled={handleInterviewScheduled}
                />
            </div>
        </PageTransition>
    );
}

export default Schedule;