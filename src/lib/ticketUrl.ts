import { Ticket, Flight } from './firebase';

export interface TicketPayload {
  id: string;
  name: string;
  seat: string;
  issuedAt: number;
  flightNumber: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  gate: string;
  status: Flight['status'];
  flightId?: string;
}

export function getTicketUrl(ticket: Ticket, flight?: Flight | null): string {
  const origin = window.location.origin;
  // Ensure appropriate trailing slash before hash for GitHub Pages and subpaths
  const pathname = window.location.pathname.endsWith('/') 
    ? window.location.pathname 
    : `${window.location.pathname}/`;

  const params = new URLSearchParams();
  params.set('id', ticket.id);
  params.set('name', ticket.passengerName);
  params.set('seat', ticket.seat);
  params.set('issued', String(ticket.issuedAt));

  if (flight) {
    params.set('flight', flight.flightNumber);
    params.set('dest', flight.destination);
    params.set('date', flight.departureDate);
    params.set('time', flight.departureTime);
    params.set('gate', flight.gate);
    params.set('status', flight.status);
    params.set('fid', flight.id);
  }

  return `${origin}${pathname}#/pass/${ticket.id}?${params.toString()}`;
}

export function saveLocalTicket(ticket: Ticket, flight?: Flight | null) {
  try {
    const key = 'shibaura_tech_airways_saved_tickets_v3';
    const existingStr = localStorage.getItem(key);
    let list: TicketPayload[] = existingStr ? JSON.parse(existingStr) : [];
    
    const payload: TicketPayload = {
      id: ticket.id,
      name: ticket.passengerName,
      seat: ticket.seat,
      issuedAt: ticket.issuedAt,
      flightNumber: flight?.flightNumber || 'FLIGHT',
      destination: flight?.destination || 'DESTINATION',
      departureDate: flight?.departureDate || '',
      departureTime: flight?.departureTime || '--:--',
      gate: flight?.gate || '-',
      status: flight?.status || 'Scheduled',
      flightId: flight?.id || ticket.flightId
    };

    // Filter out if already exists
    list = list.filter(t => t.id !== ticket.id);
    list.unshift(payload);
    // Keep max 20
    if (list.length > 20) list = list.slice(0, 20);
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save ticket locally', e);
  }
}

export function getLocalTickets(): TicketPayload[] {
  try {
    const key = 'shibaura_tech_airways_saved_tickets_v3';
    const existingStr = localStorage.getItem(key);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch (e) {
    return [];
  }
}

export function removeLocalTicket(ticketId: string) {
  try {
    const key = 'shibaura_tech_airways_saved_tickets_v3';
    const existingStr = localStorage.getItem(key);
    if (!existingStr) return;
    const list: TicketPayload[] = JSON.parse(existingStr);
    const updated = list.filter(t => t.id !== ticketId);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove ticket locally', e);
  }
}
