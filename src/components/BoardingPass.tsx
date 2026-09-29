import React from 'react';
import { Flight, Ticket } from '../lib/firebase';
import { PlaneTakeoff, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getTicketUrl } from '../lib/ticketUrl';

interface BoardingPassProps {
  ticket: Ticket;
  flight: Flight;
}

export default function BoardingPass({ ticket, flight }: BoardingPassProps) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  let formattedDate = '';
  if (flight.departureDate) {
    const parts = flight.departureDate.split('-');
    if (parts.length === 3) {
      const mIdx = Number(parts[1]) - 1;
      formattedDate = `${parts[2]}${months[mIdx] || ''}${parts[0].slice(2)}`;
    }
  }
  if (!formattedDate) {
    const date = new Date(ticket.issuedAt);
    formattedDate = `${date.getDate().toString().padStart(2, '0')}${months[date.getMonth()]}`;
  }

  const formattedTime = flight.departureTime.replace(':', '');
  const ticketUrl = getTicketUrl(ticket, flight);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-black font-sans p-8 sm:p-10 border border-gray-300 shadow-xl print:border-none print:shadow-none print:p-0">
      {/* Top Section */}
      <div className="flex justify-between items-center border-b-4 border-black pb-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-black text-white flex items-center justify-center rounded-sm">
            <PlaneTakeoff className="w-9 h-9" />
          </div>
          <div>
            <span className="font-bold text-3xl sm:text-4xl tracking-widest block">SHIBAURA TECH AIRWAYS</span>
            <span className="text-xs font-mono tracking-wider text-gray-600">SHIBAURA TECH FLIGHT SYSTEM</span>
          </div>
        </div>
        <div className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-right">
          Boarding Pass
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-6 mb-8">
        <div className="col-span-4 border-b-2 border-black pb-2">
          <p className="text-xs sm:text-sm font-bold text-gray-700">お名前／NAME</p>
          <p className="text-3xl sm:text-4xl font-black uppercase tracking-widest mt-1">{ticket.passengerName}</p>
        </div>
        
        <div className="col-span-1 border-b-2 border-black pb-2">
          <p className="text-xs sm:text-sm font-bold text-gray-700">搭乗日／DATE</p>
          <p className="text-2xl sm:text-3xl font-bold font-mono mt-1">{flight.departureDate || formattedDate}</p>
        </div>
        
        <div className="col-span-1 border-b-2 border-black pb-2">
          <p className="text-xs sm:text-sm font-bold text-gray-700">搭乗便／FLIGHT</p>
          <p className="text-2xl sm:text-3xl font-bold font-mono mt-1">{flight.flightNumber}</p>
        </div>

        <div className="col-span-2 border-b-2 border-black pb-2">
          <p className="text-xs sm:text-sm font-bold text-gray-700">搭乗区間／DEST</p>
          <p className="text-2xl sm:text-3xl font-bold uppercase mt-1">東京（成田）－ {flight.destination}</p>
        </div>
      </div>

      {/* Huge Text Section */}
      <div className="flex justify-between items-center border-b-4 border-black pb-8 mb-8">
        <div className="text-center flex-1">
          <p className="text-base sm:text-lg font-bold mb-2 text-gray-700">搭乗時刻／BDG.Time</p>
          <p className="text-6xl sm:text-8xl font-black font-mono tracking-tighter">{formattedTime}</p>
        </div>
        <div className="text-center flex-1 border-l-4 border-r-4 border-black px-2 sm:px-4">
          <p className="text-base sm:text-lg font-bold mb-2 text-gray-700">座席／Seat</p>
          <p className="text-6xl sm:text-8xl font-black font-mono tracking-tighter text-blue-900">{ticket.seat}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-base sm:text-lg font-bold mb-2 text-gray-700">搭乗口／Gate</p>
          <p className="text-6xl sm:text-8xl font-black font-mono tracking-tighter">{flight.gate}</p>
        </div>
      </div>

      {/* Bottom Section: Real QR Code + Airline Note */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2">
        {/* Left: Real QR Code with Ticket URL */}
        <div className="flex items-center space-x-4 p-3 bg-gray-50 border-2 border-black rounded-lg">
          <div className="bg-white p-2 border border-gray-300 rounded shadow-xs flex-shrink-0">
            <QRCodeSVG 
              value={ticketUrl} 
              size={100} 
              level="M" 
              includeMargin={false}
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-black">
              <QrCode className="w-3.5 h-3.5" />
              <span>モバイル搭乗券 / MOBILE PASS</span>
            </div>
            <p className="text-xs font-mono font-bold text-gray-700 mt-1">
              e-TKT: {ticket.id}
            </p>
            <p className="text-[11px] text-gray-600 mt-1 leading-snug">
              スマホのカメラでQRコードを読み取ると<br />
              便情報・搭乗状況が確認できます。
            </p>
          </div>
        </div>
        
        {/* Right: Notes */}
        <div className="text-left sm:text-right">
          <p className="text-xl sm:text-2xl font-black">搭乗時刻までにお越し下さい。</p>
          <p className="text-sm sm:text-base font-bold mt-1 text-gray-700">Please be at gate by boarding time.</p>
          <p className="text-xs text-gray-500 font-mono mt-2">
            SHIBAURA TECH AIRWAYS • FLIGHT DATE: {flight.departureDate || '2026'}
          </p>
        </div>
      </div>
    </div>
  );
}
