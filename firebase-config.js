// Firebase Configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAd_3fem_IugC9rUmI8uiJXBzARwh3TbaY-api-key-here",
  authDomain: "student-assignment-portal.firebaseapp.com",
  projectId: "student-assignment-portal",
  storageBucket: "student-assignment-portal.firebasestorage.app",
  messagingSenderId: "924658923422",
  appId: "1:924658923422:web:b2c7fa60c9c564230d088f"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firebase services
window.Firebase = {
  db,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
};

console.log('Firebase initialized successfully');