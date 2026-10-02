import { useState, useEffect } from 'react';
import { db, isFirebaseConfigured, Flight, Ticket } from './firebase';
import { 
  mockFlights, 
  mockTickets, 
  addMockTicket, 
  deleteMockTicket, 
  clearMockTickets, 
  subscribeToMockData, 
  updateMockFlightStatus, 
  addMockFlight, 
  deleteMockFlight,
  resetMockToDefault,
  getTodayDateStr,
  deletePassedMockFlights,
  markPassedMockFlightsAsDeparted,
  isFlightPassed
} from './mockStore';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

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
      const flightsData = snapshot.docs.map(doc => {
        const d = doc.data();
        return { 
          id: doc.id, 
          ...d,
          departureDate: d.departureDate || getTodayDateStr()
        } as Flight;
      });
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

  const deleteTicket = async (ticketId: string) => {
    if (!isFirebaseConfigured) {
      deleteMockTicket(ticketId);
      return;
    }

    if (db) {
      await deleteDoc(doc(db, 'tickets', ticketId));
    }
  };

  const clearAllTickets = async () => {
    if (!isFirebaseConfigured) {
      clearMockTickets();
      return;
    }

    if (db) {
      const snap = await getDocs(collection(db, 'tickets'));
      const promises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(promises);
    }
  };

  const updateStatus = async (flightId: string, status: Flight['status']) => {
    if (!isFirebaseConfigured) {
      updateMockFlightStatus(flightId, status);
      return;
    }

    if (db) {
      const flightRef = doc(db, 'flights', flightId);
      await setDoc(flightRef, { status }, { merge: true });
    }
  };

  const addFlight = async (flightData: Omit<Flight, 'id' | 'totalSeats' | 'seats'>) => {
    const flightId = Math.random().toString(36).substr(2, 9);
    
    // Generate initial seat data for 24 seats (3 rows, 2-4-2: A, C, D, E, F, G, H, K)
    const SEAT_COLUMNS = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'K'];
    const ROWS = 3;
    const initialSeats = [];
    for (let r = 1; r <= ROWS; r++) {
      for (const c of SEAT_COLUMNS) {
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

  const deleteFlight = async (flightId: string) => {
    if (!isFirebaseConfigured) {
      deleteMockFlight(flightId);
      return;
    }

    if (db) {
      await deleteDoc(doc(db, 'flights', flightId));
    }
  };

  const deletePassedFlights = async (dateStr?: string) => {
    if (!isFirebaseConfigured) {
      return deletePassedMockFlights(dateStr);
    }
    if (db) {
      const now = new Date();
      const targetFlights = flights.filter(f => {
        if (dateStr && f.departureDate !== dateStr) return false;
        return isFlightPassed(f, now);
      });
      for (const f of targetFlights) {
        await deleteDoc(doc(db, 'flights', f.id));
      }
      return targetFlights.length;
    }
    return 0;
  };

  const markPassedFlightsDeparted = async (dateStr?: string) => {
    if (!isFirebaseConfigured) {
      return markPassedMockFlightsAsDeparted(dateStr);
    }
    if (db) {
      const now = new Date();
      const targetFlights = flights.filter(f => {
        if (dateStr && f.departureDate !== dateStr) return false;
        return isFlightPassed(f, now) && f.status !== 'Departed';
      });
      for (const f of targetFlights) {
        await setDoc(doc(db, 'flights', f.id), { status: 'Departed' }, { merge: true });
      }
      return targetFlights.length;
    }
    return 0;
  };

  const resetData = async () => {
    if (!isFirebaseConfigured) {
      resetMockToDefault();
    }
  };

  return {
    flights,
    tickets,
    issueTicket,
    deleteTicket,
    clearAllTickets,
    updateStatus,
    addFlight,
    deleteFlight,
    deletePassedFlights,
    markPassedFlightsDeparted,
    resetData,
    isFirebaseConfigured
  };
}
