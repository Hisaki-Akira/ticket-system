import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, onSnapshot, query, where, updateDoc } from 'firebase/firestore';

// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey !== "";

// Initialize Firebase only if configured, otherwise we'll use a mock store for preview
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = isFirebaseConfigured ? getFirestore(app!) : null;

// Types
export interface Flight {
  id: string;
  flightNumber: string;
  destination: string;
  departureTime: string;
  status: 'Scheduled' | 'Boarding' | 'Departed' | 'Delayed';
  gate: string;
  totalSeats: number;
  seats?: { seatId: string; isBooked: boolean }[];
}

export interface Ticket {
  id: string;
  flightId: string;
  passengerName: string;
  seat: string;
  issuedAt: number;
}
