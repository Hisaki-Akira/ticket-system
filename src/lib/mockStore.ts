import { Flight, Ticket } from './firebase';

const STORAGE_KEY_FLIGHTS = 'shibaura_tech_airways_flights_v5';
const STORAGE_KEY_TICKETS = 'shibaura_tech_airways_tickets_v5';

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

/**
 * フライトの予定出発日時が現在時刻を過ぎているかを判定
 */
export function isFlightPassed(flight: { departureDate: string; departureTime: string }, now: Date = new Date()): boolean {
  if (!flight.departureDate || !flight.departureTime) return false;
  try {
    const [year, month, day] = flight.departureDate.split('-').map(Number);
    const [hours, minutes] = flight.departureTime.split(':').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      return false;
    }
    const flightDateTime = new Date(year, month - 1, day, hours, minutes, 0);
    return now.getTime() >= flightDateTime.getTime();
  } catch {
    return false;
  }
}

/**
 * 実効的なフライト状況（予定時刻を過ぎている場合は「Departed(出発済)」として扱う）
 */
export function getEffectiveFlightStatus(flight: { departureDate: string; departureTime: string; status: string }, now: Date = new Date()): Flight['status'] {
  if (flight.status === 'Departed') return 'Departed';
  if (isFlightPassed(flight, now)) {
    return 'Departed';
  }
  return flight.status as Flight['status'];
}

const getDefaultFlights = (): Flight[] => {
  const today = getTodayDateStr();
  const tomorrow = getTomorrowDateStr();

  return [
    { id: 'f1', flightNumber: 'STA-101', destination: '東京（成田）', departureDate: today, departureTime: '10:00', status: 'Boarding', gate: 'A1', totalSeats: 21 },
    { id: 'f2', flightNumber: 'STA-202', destination: '大阪（伊丹）', departureDate: today, departureTime: '12:30', status: 'Scheduled', gate: 'B3', totalSeats: 21 },
    { id: 'f3', flightNumber: 'STA-303', destination: '札幌（新千歳）', departureDate: today, departureTime: '15:45', status: 'Scheduled', gate: 'C7', totalSeats: 21 },
    { id: 'f4', flightNumber: 'STA-505', destination: '沖縄（那覇）', departureDate: today, departureTime: '17:15', status: 'Scheduled', gate: 'D2', totalSeats: 21 },
    { id: 'f5', flightNumber: 'STA-707', destination: '広島', departureDate: today, departureTime: '20:30', status: 'Scheduled', gate: 'B1', totalSeats: 21 },
    { id: 'f6', flightNumber: 'STA-808', destination: '福岡', departureDate: today, departureTime: '21:45', status: 'Scheduled', gate: 'C2', totalSeats: 21 },
    { id: 'f7', flightNumber: 'STA-601', destination: '福岡', departureDate: tomorrow, departureTime: '11:00', status: 'Scheduled', gate: 'A2', totalSeats: 21 },
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

export const deletePassedMockFlights = (dateStr?: string) => {
  const now = new Date();
  const targetFlights = mockFlights.filter(f => {
    if (dateStr && f.departureDate !== dateStr) return false;
    return isFlightPassed(f, now);
  });
  const passedIds = new Set(targetFlights.map(f => f.id));
  mockFlights = mockFlights.filter(f => !passedIds.has(f.id));
  mockTickets = mockTickets.filter(t => !passedIds.has(t.flightId));
  persist();
  notifyListeners();
  return passedIds.size;
};

export const markPassedMockFlightsAsDeparted = (dateStr?: string) => {
  const now = new Date();
  let updatedCount = 0;
  mockFlights.forEach(f => {
    if (dateStr && f.departureDate !== dateStr) return;
    if (isFlightPassed(f, now) && f.status !== 'Departed') {
      f.status = 'Departed';
      updatedCount++;
    }
  });
  if (updatedCount > 0) {
    persist();
    notifyListeners();
  }
  return updatedCount;
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
