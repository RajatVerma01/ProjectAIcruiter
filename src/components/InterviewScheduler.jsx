import React, { useState } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import { useAuth } from '../context/AuthContext';
import { scheduleInterview } from '../firebase';
import 'react-datepicker/dist/react-datepicker.css';
import './InterviewScheduler.css';

// Initialize react-modal
Modal.setAppElement('#modal-root');

const InterviewScheduler = ({ isOpen, onRequestClose, onInterviewScheduled }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    interviewType: '',
    date: new Date(),
    time: '',
    duration: '60',
    interviewerPreference: 'no-preference',
    specialRequirements: '',
    resume: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);
  const [error, setError] = useState('');

  const interviewTypes = [
    { id: 'technical', name: 'Technical Interview', icon: '💻' },
    { id: 'hr', name: 'HR Interview', icon: '👥' },
    { id: 'behavioral', name: 'Behavioral Interview', icon: '🤝' }
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, resume: e.target.files[0] ? e.target.files[0].name : null }));
  };

  const handleInterviewTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, interviewType: type }));
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Format the interview data for Firebase
      const interviewData = {
        type: interviewTypes.find(t => t.id === formData.interviewType)?.name || formData.interviewType,
        date: formData.date.toISOString(),
        time: formData.time,
        duration: parseInt(formData.duration),
        interviewerPreference: formData.interviewerPreference,
        specialRequirements: formData.specialRequirements || '',
        resumeUploaded: formData.resume ? true : false,
        interviewer: 'To be assigned', // This would be assigned later by the system
      };
      
      console.log('Attempting to schedule interview with data:', interviewData);
      
      // Save to Firebase
      const result = await scheduleInterview(interviewData);
      console.log('Result from scheduleInterview:', result);
      
      const { id, error } = result;
      
      if (error) {
        console.error('Error received from scheduleInterview:', error);
        setError(error);
        setIsSubmitting(false);
        return;
      }
      
      console.log('Interview scheduled successfully with ID:', id);
      
      // If onInterviewScheduled callback is provided, call it
      if (onInterviewScheduled) {
        console.log('Calling onInterviewScheduled with:', { id, ...interviewData });
        onInterviewScheduled({ id, ...interviewData });
      }
      
      setIsSubmitting(false);
      setScheduleConfirmed(true);
      
    } catch (err) {
      console.error('Exception in handleSubmit:', err);
      setError('Failed to schedule interview. Please try again.');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      interviewType: '',
      date: new Date(),
      time: '',
      duration: '60',
      interviewerPreference: 'no-preference',
      specialRequirements: '',
      resume: null
    });
    setScheduleConfirmed(false);
    setError('');
  };

  const closeAndReset = () => {
    resetForm();
    onRequestClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <h3>Select Interview Type</h3>
            <div className="interview-types">
              {interviewTypes.map(type => (
                <div 
                  key={type.id}
                  className={`interview-type-card ${formData.interviewType === type.id ? 'selected' : ''}`}
                  onClick={() => handleInterviewTypeSelect(type.id)}
                >
                  <div className="interview-type-icon">{type.icon}</div>
                  <h4>{type.name}</h4>
                  <p className="interview-type-desc">
                    {type.id === 'technical' && 'Coding, system design, and technical knowledge assessment'}
                    {type.id === 'hr' && 'Culture fit, background and work experience discussion'}
                    {type.id === 'behavioral' && 'Soft skills and situation-based assessment'}
                  </p>
                </div>
              ))}
            </div>
            <div className="step-buttons">
              <button 
                className="next-button" 
                onClick={nextStep}
                disabled={!formData.interviewType}
              >
                Continue
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="step-content">
            <h3>Select Date & Time</h3>
            <div className="datetime-section">
              <div className="date-picker-container">
                <label>Select Date</label>
                <DatePicker
                  selected={formData.date}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  className="date-picker"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
              
              <div className="time-slots-container">
                <label>Select Time (Your local time)</label>
                <div className="time-slots">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`time-slot ${formData.time === time ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, time }))}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="duration-container">
                <label>Duration</label>
                <select 
                  name="duration" 
                  value={formData.duration}
                  onChange={handleChange}
                  className="duration-select"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes (recommended)</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
            </div>
            
            <div className="step-buttons">
              <button className="back-button" onClick={prevStep}>
                Back
              </button>
              <button 
                className="next-button" 
                onClick={nextStep}
                disabled={!formData.time}
              >
                Continue
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="step-content">
            <h3>Additional Information</h3>
            
            <div className="form-group">
              <label>Interviewer Preference</label>
              <select
                name="interviewerPreference"
                value={formData.interviewerPreference}
                onChange={handleChange}
                className="form-control"
              >
                <option value="no-preference">No Preference</option>
                <option value="experienced">Experienced (5+ years)</option>
                <option value="expert">Industry Expert</option>
                <option value="female">Female Interviewer</option>
                <option value="male">Male Interviewer</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Special Requirements or Notes</label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleChange}
                className="form-control textarea"
                placeholder="Any specific topics you'd like to focus on or requirements for the interviewer..."
              />
            </div>
            
            <div className="form-group">
              <label>Upload Resume (Optional)</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="file-upload-label">
                  {formData.resume ? formData.resume : 'Choose file...'}
                </label>
              </div>
              <p className="file-hint">PDF, DOC or DOCX (Max 5MB)</p>
            </div>
            
            <div className="step-buttons">
              <button className="back-button" onClick={prevStep}>
                Back
              </button>
              <button 
                className="next-button" 
                onClick={nextStep}
              >
                Review
              </button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="step-content">
            <h3>Review and Confirm</h3>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="review-section">
              <div className="review-card">
                <h4>Interview Details</h4>
                <div className="review-item">
                  <span className="review-label">Type:</span>
                  <span className="review-value">
                    {interviewTypes.find(t => t.id === formData.interviewType)?.name}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Date:</span>
                  <span className="review-value">
                    {formData.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Time:</span>
                  <span className="review-value">{formData.time}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Duration:</span>
                  <span className="review-value">{formData.duration} minutes</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Interviewer:</span>
                  <span className="review-value">
                    {formData.interviewerPreference === 'no-preference' 
                      ? 'No Preference' 
                      : formData.interviewerPreference.charAt(0).toUpperCase() + formData.interviewerPreference.slice(1)}
                  </span>
                </div>
                {formData.specialRequirements && (
                  <div className="review-item">
                    <span className="review-label">Special Notes:</span>
                    <span className="review-value">{formData.specialRequirements}</span>
                  </div>
                )}
                {formData.resume && (
                  <div className="review-item">
                    <span className="review-label">Resume:</span>
                    <span className="review-value">{formData.resume}</span>
                  </div>
                )}
              </div>
              
              <div className="interview-tips">
                <h4>Interview Tips</h4>
                <ul>
                  <li>Be ready 5 minutes before your scheduled time</li>
                  <li>Ensure you have a stable internet connection</li>
                  <li>Find a quiet place with good lighting</li>
                  <li>Have a notepad and pen ready for notes</li>
                  <li>You can reschedule up to 24 hours before the interview</li>
                </ul>
              </div>
            </div>
            
            <div className="step-buttons">
              <button className="back-button" onClick={prevStep}>
                Back
              </button>
              <button 
                className="confirm-button" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Scheduling...' : 'Confirm and Schedule'}
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderConfirmation = () => (
    <div className="confirmation-content">
      <div className="confirmation-icon">✅</div>
      <h2>Interview Scheduled Successfully!</h2>
      <p className="confirmation-details">
        Your {interviewTypes.find(t => t.id === formData.interviewType)?.name} has been scheduled for{' '}
        {formData.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}{' '}
        at {formData.time}.
      </p>
      <p className="confirmation-email">
        A confirmation email has been sent to <strong>{currentUser.email}</strong>
      </p>
      <div className="what-next">
        <h4>What's Next?</h4>
        <ul>
          <li>You'll receive interview details and preparation materials via email</li>
          <li>The interviewer will join the call at the scheduled time</li>
          <li>After the interview, you'll receive feedback within 24 hours</li>
        </ul>
      </div>
      <div className="confirmation-buttons">
        <button className="schedule-another-button" onClick={resetForm}>
          Schedule Another Interview
        </button>
        <button className="close-button" onClick={closeAndReset}>
          Close
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeAndReset}
      contentLabel="Schedule Interview"
      className="scheduler-modal"
      overlayClassName="scheduler-overlay"
    >
      <div className="scheduler-header">
        <h2>Schedule Your Interview</h2>
        <button className="close-modal-button" onClick={closeAndReset}>×</button>
      </div>
      
      {!scheduleConfirmed ? (
        <div className="scheduler-content">
          <div className="progress-bar">
            {[1, 2, 3, 4].map(stepNumber => (
              <div 
                key={stepNumber}
                className={`progress-step ${stepNumber === step ? 'active' : stepNumber < step ? 'completed' : ''}`}
              >
                <div className="step-number">{stepNumber}</div>
                <div className="step-name">
                  {stepNumber === 1 && 'Type'}
                  {stepNumber === 2 && 'Schedule'}
                  {stepNumber === 3 && 'Details'}
                  {stepNumber === 4 && 'Review'}
                </div>
              </div>
            ))}
          </div>
          
          {renderStepContent()}
        </div>
      ) : (
        renderConfirmation()
      )}
    </Modal>
  );
};

export default InterviewScheduler; 