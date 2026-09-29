import { Flight, Ticket } from './firebase';

const STORAGE_KEY_FLIGHTS = 'festival_airline_mock_flights_v2';
const STORAGE_KEY_TICKETS = 'festival_airline_mock_tickets_v2';

export function getTodayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTomorrowDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const getDefaultFlights = (): Flight[] => {
  const today = getTodayDateStr();
  const tomorrow = getTomorrowDateStr();

  return [
    { id: 'f1', flightNumber: 'FA-101', destination: '東京（成田）', departureDate: today, departureTime: '10:00', status: 'Boarding', gate: 'A1', totalSeats: 24 },
    { id: 'f2', flightNumber: 'FA-202', destination: '大阪（伊丹）', departureDate: today, departureTime: '12:30', status: 'Scheduled', gate: 'B3', totalSeats: 24 },
    { id: 'f3', flightNumber: 'FA-303', destination: '札幌（新千歳）', departureDate: today, departureTime: '15:45', status: 'Scheduled', gate: 'C7', totalSeats: 24 },
    { id: 'f4', flightNumber: 'FA-505', destination: '沖縄（那覇）', departureDate: today, departureTime: '17:15', status: 'Scheduled', gate: 'D2', totalSeats: 24 },
    { id: 'f5', flightNumber: 'FA-601', destination: '福岡', departureDate: tomorrow, departureTime: '11:00', status: 'Scheduled', gate: 'A2', totalSeats: 24 },
  ];
};

function loadStoredFlights(): Flight[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FLIGHTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all loaded flights have valid departureDate
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(f => typeof f.departureDate === 'string')) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return getDefaultFlights();
}

function loadStoredTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export let mockFlights: Flight[] = loadStoredFlights();
export let mockTickets: Ticket[] = loadStoredTickets();

type Listener = () => void;
const listeners: Listener[] = [];

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY_FLIGHTS, JSON.stringify(mockFlights));
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(mockTickets));
  } catch (e) {
    console.error(e);
  }
};

export const addMockTicket = (ticket: Ticket) => {
  mockTickets.push(ticket);
  persist();
  notifyListeners();
};

export const deleteMockTicket = (ticketId: string) => {
  mockTickets = mockTickets.filter(t => t.id !== ticketId);
  persist();
  notifyListeners();
};

export const clearMockTickets = () => {
  mockTickets = [];
  persist();
  notifyListeners();
};

export const addMockFlight = (flight: Flight) => {
  mockFlights.push(flight);
  persist();
  notifyListeners();
};

export const deleteMockFlight = (flightId: string) => {
  mockFlights = mockFlights.filter(f => f.id !== flightId);
  mockTickets = mockTickets.filter(t => t.flightId !== flightId);
  persist();
  notifyListeners();
};

export const updateMockFlightStatus = (flightId: string, status: Flight['status']) => {
  const flight = mockFlights.find(f => f.id === flightId);
  if (flight) {
    flight.status = status;
    persist();
    notifyListeners();
  }
};

export const resetMockToDefault = () => {
  mockFlights = getDefaultFlights();
  mockTickets = [];
  persist();
  notifyListeners();
};

export const subscribeToMockData = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};
