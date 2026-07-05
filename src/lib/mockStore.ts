import { Flight, Ticket } from './firebase';

export const mockFlights: Flight[] = [
  { id: 'f1', flightNumber: 'SA-101', destination: 'NEO-TOKYO', departureTime: '10:00', status: 'Scheduled', gate: 'A1', totalSeats: 24 },
  { id: 'f2', flightNumber: 'SA-202', destination: 'CYBER-OSAKA', departureTime: '12:30', status: 'Boarding', gate: 'B3', totalSeats: 24 },
  { id: 'f3', flightNumber: 'SA-303', destination: 'LUNAR-BASE', departureTime: '15:45', status: 'Delayed', gate: 'C7', totalSeats: 24 },
];

export let mockTickets: Ticket[] = [];
type Listener = () => void;
const listeners: Listener[] = [];

export const addMockTicket = (ticket: Ticket) => {
  mockTickets.push(ticket);
  notifyListeners();
};

export const addMockFlight = (flight: Flight) => {
  mockFlights.push(flight);
  notifyListeners();
};

export const updateMockFlightStatus = (flightId: string, status: Flight['status']) => {
  const flight = mockFlights.find(f => f.id === flightId);
  if (flight) {
    flight.status = status;
    notifyListeners();
  }
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
