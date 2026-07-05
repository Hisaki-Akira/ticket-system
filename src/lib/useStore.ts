import { useState, useEffect } from 'react';
import { db, isFirebaseConfigured, Flight, Ticket } from './firebase';
import { mockFlights, mockTickets, addMockTicket, subscribeToMockData, updateMockFlightStatus, addMockFlight } from './mockStore';
import { collection, onSnapshot, doc, setDoc, query, where } from 'firebase/firestore';

export function useStore() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setFlights([...mockFlights]);
      setTickets([...mockTickets]);
      
      return subscribeToMockData(() => {
        setFlights([...mockFlights]);
        setTickets([...mockTickets]);
      });
    }

    if (!db) return;

    // Listen to flights
    const unsubscribeFlights = onSnapshot(collection(db, 'flights'), (snapshot) => {
      const flightsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Flight));
      setFlights(flightsData);
    });

    // Listen to tickets
    const unsubscribeTickets = onSnapshot(collection(db, 'tickets'), (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setTickets(ticketsData);
    });

    return () => {
      unsubscribeFlights();
      unsubscribeTickets();
    };
  }, []);

  const issueTicket = async (flightId: string, passengerName: string, seat: string) => {
    const ticket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      flightId,
      passengerName,
      seat,
      issuedAt: Date.now()
    };

    if (!isFirebaseConfigured) {
      addMockTicket(ticket);
      return ticket;
    }

    if (db) {
      await setDoc(doc(db, 'tickets', ticket.id), ticket);
    }
    return ticket;
  };

  const updateStatus = async (flightId: string, status: Flight['status']) => {
    if (!isFirebaseConfigured) {
      updateMockFlightStatus(flightId, status);
      return;
    }

    if (db) {
      const flightRef = doc(db, 'flights', flightId);
      // Wait, we need to updateDoc
      // import updateDoc from firebase/firestore
      // But we just use setDoc with merge for simplicity
      await setDoc(flightRef, { status }, { merge: true });
    }
  };

  const addFlight = async (flightData: Omit<Flight, 'id' | 'totalSeats' | 'seats'>) => {
    const flightId = Math.random().toString(36).substr(2, 9);
    
    // Generate initial seat data for 24 seats (1A - 6D)
    const COLUMNS = ['A', 'B', 'C', 'D'];
    const ROWS = 6;
    const initialSeats = [];
    for (let r = 1; r <= ROWS; r++) {
      for (const c of COLUMNS) {
        initialSeats.push({ seatId: `${r}${c}`, isBooked: false });
      }
    }

    const newFlight: Flight = {
      id: flightId,
      ...flightData,
      totalSeats: 24,
      seats: initialSeats
    };

    if (!isFirebaseConfigured) {
      addMockFlight(newFlight);
      return newFlight;
    }

    if (db) {
      await setDoc(doc(db, 'flights', flightId), newFlight);
    }
    return newFlight;
  };

  return {
    flights,
    tickets,
    issueTicket,
    updateStatus,
    addFlight,
    isFirebaseConfigured
  };
}
