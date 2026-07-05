import React from 'react';
import { Flight, Ticket } from '../lib/firebase';
import { PlaneTakeoff } from 'lucide-react';

interface BoardingPassProps {
  ticket: Ticket;
  flight: Flight;
}

export default function BoardingPass({ ticket, flight }: BoardingPassProps) {
  const date = new Date(ticket.issuedAt);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}${months[date.getMonth()]}`;

  const formattedTime = flight.departureTime.replace(':', '');

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-black font-sans p-10 border border-gray-300 shadow-xl print:border-none print:shadow-none print:p-0">
      {/* Top Section */}
      <div className="flex justify-between items-center border-b-4 border-black pb-6 mb-6">
        <div className="flex items-center space-x-4">
          {/* Logo Placeholder */}
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-sm">
            <PlaneTakeoff className="w-10 h-10" />
          </div>
          <span className="font-bold text-4xl tracking-widest">FESTIVAL AIRLINES</span>
        </div>
        <div className="text-5xl font-black uppercase tracking-tighter">
          Boarding Pass
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-6 mb-8">
        <div className="col-span-4 border-b-2 border-black pb-2">
          <p className="text-sm font-bold">お名前／NAME</p>
          <p className="text-4xl font-black uppercase tracking-widest mt-1">{ticket.passengerName}</p>
        </div>
        
        <div className="col-span-1 border-b-2 border-black pb-2">
          <p className="text-sm font-bold">搭乗日／DATE</p>
          <p className="text-3xl font-bold mt-1">{formattedDate}</p>
        </div>
        
        <div className="col-span-1 border-b-2 border-black pb-2">
          <p className="text-sm font-bold">搭乗便／FLIGHT</p>
          <p className="text-3xl font-bold font-mono mt-1">{flight.flightNumber}</p>
        </div>

        <div className="col-span-2 border-b-2 border-black pb-2">
          <p className="text-sm font-bold">搭乗区間／DEST</p>
          <p className="text-3xl font-bold uppercase mt-1">東京（成田）－ {flight.destination}</p>
        </div>
      </div>

      {/* Huge Text Section */}
      <div className="flex justify-between items-center border-b-4 border-black pb-8 mb-8">
        <div className="text-center flex-1">
          <p className="text-lg font-bold mb-2">搭乗時刻／BDG.Time</p>
          <p className="text-8xl font-black font-mono tracking-tighter">{formattedTime}</p>
        </div>
        <div className="text-center flex-1 border-l-4 border-r-4 border-black px-4">
          <p className="text-lg font-bold mb-2">座席／Seat</p>
          <p className="text-8xl font-black font-mono tracking-tighter">{ticket.seat}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-lg font-bold mb-2">搭乗口／Gate</p>
          <p className="text-8xl font-black font-mono tracking-tighter">{flight.gate}</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between items-end">
        {/* Left: Barcode (Dummy Vertical Barcode with thick lines) */}
        <div className="flex h-24 space-x-[2px]">
          <div className="w-6 h-full bg-black"></div>
          <div className="w-1 h-full bg-black"></div>
          <div className="w-2 h-full bg-black"></div>
          <div className="w-1 h-full bg-black"></div>
          <div className="w-6 h-full bg-black"></div>
          <div className="w-1 h-full bg-black"></div>
          <div className="w-2 h-full bg-black"></div>
          <div className="w-1 h-full bg-black"></div>
          <div className="w-3 h-full bg-black"></div>
          <div className="w-1 h-full bg-black"></div>
          <div className="w-1 h-full bg-black"></div>
          <div className="w-2 h-full bg-black"></div>
          <div className="w-1 h-full bg-black"></div>
          <div className="w-4 h-full bg-black"></div>
          <div className="w-1 h-full bg-black"></div>
          <div className="w-1 h-full bg-black"></div>
          <div className="w-3 h-full bg-black"></div>
        </div>
        
        {/* Right: Notes */}
        <div className="text-right">
          <p className="text-2xl font-bold">搭乗時刻までにお越し下さい。</p>
          <p className="text-xl font-bold mt-1 text-gray-800">Please be at gate by boarding time.</p>
        </div>
      </div>
    </div>
  );
}
