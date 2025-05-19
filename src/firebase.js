// src/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  onValue,
  update,
  remove,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCg-6cblknwQjUtquSuR4DDT9x6oJqddW0",
    authDomain: "aicruiter-9f603.firebaseapp.com",
    projectId: "aicruiter-9f603",
    storageBucket: "aicruiter-9f603.firebasestorage.app",
    messagingSenderId: "11182193282",
    appId: "1:11182193282:web:35aba860a376db2f4fd29b",
    measurementId: "G-RQSQX0PFPX",
    databaseURL: "https://aicruiter-9f603-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
console.log('Firebase initialized with database URL:', firebaseConfig.databaseURL);
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const registerWithEmailAndPassword = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Interview database functions
export const scheduleInterview = async (interviewData) => {
  console.log('scheduleInterview called with:', interviewData);
  try {
    const user = auth.currentUser;
    console.log('Current user:', user ? `${user.uid} (${user.email})` : 'No user');
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create a new interview entry
    const interviewRef = ref(database, 'interviews');
    console.log('Creating interview reference at:', 'interviews');
    const newInterviewRef = push(interviewRef);
    console.log('Generated new interview ID:', newInterviewRef.key);
    
    // Add user ID and timestamp to the interview data
    const interview = {
      ...interviewData,
      userId: user.uid,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };
    
    console.log('Final interview data to save:', interview);
    
    try {
      await set(newInterviewRef, interview);
      console.log('Interview successfully saved to database');
      return { id: newInterviewRef.key, error: null };
    } catch (dbError) {
      console.error('Database error when saving interview:', dbError);
      return { id: null, error: dbError.message };
    }
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return { id: null, error: error.message };
  }
};

export const getUserInterviews = (userId, callback) => {
  console.log('getUserInterviews called for userId:', userId);
  
  if (!userId) {
    console.error('getUserInterviews called with null/undefined userId');
    callback([]);
    return () => {};
  }
  
  try {
    // Reference to the 'interviews' collection in Firebase
    const interviewsRef = ref(database, 'interviews');
    
    // Log the database URL to verify connection
    console.log('Database URL:', database._databaseURL);
    
    // Create a query to filter interviews by userId
    const userInterviewsQuery = query(interviewsRef, orderByChild('userId'), equalTo(userId));
    console.log('Query created for interviews with userId:', userId);
    
    // Set up listener for real-time updates
    const unsubscribe = onValue(userInterviewsQuery, (snapshot) => {
      console.log('onValue callback triggered');
      console.log('Snapshot exists:', snapshot.exists());
      
      const interviews = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const id = childSnapshot.key;
          const data = childSnapshot.val();
          console.log('Interview found:', id, data);
          interviews.push({ id, ...data });
        });
        console.log(`Found ${interviews.length} interviews for user:`, interviews);
      } else {
        console.log('No interviews found for this user');
        
        // If no interviews found but we know they should exist, 
        // try getting all interviews as a fallback for debugging
        const allInterviewsRef = ref(database, 'interviews');
        get(allInterviewsRef).then((allSnapshot) => {
          if (allSnapshot.exists()) {
            console.log('All interviews in database:', allSnapshot.val());
          } else {
            console.log('No interviews exist in the database at all');
          }
        }).catch(err => {
          console.error('Error fetching all interviews:', err);
        });
      }
      
      // Sort interviews by date (ascending)
      interviews.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Return interviews to component
      callback(interviews);
    }, (error) => {
      // This is the error callback for onValue
      console.error('Error in onValue listener:', error);
      callback([]);
    });
    
    // Return function to unsubscribe from the listener
    return unsubscribe;
  } catch (error) {
    console.error('Exception in getUserInterviews:', error);
    callback([]);
    return () => {};
  }
};

export const updateInterviewStatus = async (interviewId, status) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const interviewRef = ref(database, `interviews/${interviewId}`);
    await update(interviewRef, { status });
    
    return { error: null };
  } catch (error) {
    console.error('Error updating interview status:', error);
    return { error: error.message };
  }
};

export const cancelInterview = async (interviewId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Update the status to 'canceled' instead of deleting
    return await updateInterviewStatus(interviewId, 'canceled');
  } catch (error) {
    console.error('Error canceling interview:', error);
    return { error: error.message };
  }
};

// Test database connectivity
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    const testRef = ref(database, 'connection-test');
    const testData = { timestamp: new Date().toISOString(), message: 'Test connection' };
    
    await set(testRef, testData);
    console.log('Test data written successfully');
    
    const snapshot = await get(testRef);
    console.log('Test data read successfully:', snapshot.val());
    
    await remove(testRef);
    console.log('Test data removed successfully');
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Direct test for interview database
export const getDirectInterviews = async () => {
  try {
    console.log('Attempting direct interview database access...');
    const interviewsRef = ref(database, 'interviews');
    
    // Get all interviews without real-time updates
    const snapshot = await get(interviewsRef);
    
    if (snapshot.exists()) {
      const interviewsData = snapshot.val();
      console.log('Successfully retrieved interviews directly:', interviewsData);
      
      // Convert the object to an array
      const interviewsArray = Object.entries(interviewsData).map(([id, data]) => ({
        id,
        ...data
      }));
      
      return { success: true, data: interviewsArray, error: null };
    } else {
      console.log('No interviews found in database');
      return { success: true, data: [], error: null };
    }
  } catch (error) {
    console.error('Error directly accessing interviews:', error);
    return { success: false, data: [], error: error.message };
  }
};

export { auth, database, onAuthStateChanged }; 