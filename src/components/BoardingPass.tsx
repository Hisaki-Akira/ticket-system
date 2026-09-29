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
  
  let formattedDate = flight.departureDate || '';
  if (!formattedDate) {
    const date = new Date(ticket.issuedAt);
    formattedDate = `${date.getDate().toString().padStart(2, '0')}${months[date.getMonth()]}`;
  }

  const formattedTime = flight.departureTime.replace(':', '');
  const ticketUrl = getTicketUrl(ticket, flight);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-slate-950 font-sans p-8 sm:p-10 border border-slate-300 shadow-2xl print:border-none print:shadow-none print:p-0">
      
      {/* Top Section */}
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-slate-950 text-white flex items-center justify-center rounded-sm">
            <PlaneTakeoff className="w-7 h-7" />
          </div>
          <div>
            <span className="font-extrabold text-2xl sm:text-3xl tracking-widest block font-mono">SHIBAURA TECH AIRWAYS</span>
            <span className="text-[11px] font-mono tracking-widest text-slate-600 block">SHIBAURA FLIGHT OPERATIONS</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl sm:text-4xl font-black uppercase tracking-tighter block font-mono">BOARDING PASS</span>
          <span className="text-xs font-mono text-slate-500">国内線搭乗券</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-5 mb-8">
        <div className="col-span-4 border-b border-slate-900 pb-2">
          <p className="text-[11px] font-mono font-bold text-slate-500 uppercase">旅客氏名 / NAME OF PASSENGER</p>
          <p className="text-2xl sm:text-3xl font-black uppercase tracking-widest mt-1 text-slate-950">{ticket.passengerName}</p>
        </div>
        
        <div className="col-span-1 border-b border-slate-900 pb-2">
          <p className="text-[11px] font-mono font-bold text-slate-500 uppercase">搭乗日 / DATE</p>
          <p className="text-xl sm:text-2xl font-bold font-mono mt-1 text-slate-900">{formattedDate}</p>
        </div>
        
        <div className="col-span-1 border-b border-slate-900 pb-2">
          <p className="text-[11px] font-mono font-bold text-slate-500 uppercase">便名 / FLIGHT</p>
          <p className="text-xl sm:text-2xl font-bold font-mono mt-1 text-slate-900">{flight.flightNumber}</p>
        </div>

        <div className="col-span-2 border-b border-slate-900 pb-2">
          <p className="text-[11px] font-mono font-bold text-slate-500 uppercase">区間 / ROUTE</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-slate-900">東京（成田）— {flight.destination}</p>
        </div>
      </div>

      {/* Primary Boarding Metrics (Time, Seat, Gate) */}
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-6 bg-slate-50 p-4 rounded-sm">
        <div className="text-center flex-1">
          <p className="text-xs font-bold font-mono text-slate-500 uppercase">搭乗時刻 / BDG.TIME</p>
          <p className="text-5xl sm:text-7xl font-black font-mono tracking-tighter text-slate-950 mt-1">{formattedTime}</p>
        </div>
        <div className="text-center flex-1 border-l-2 border-r-2 border-slate-300 px-4">
          <p className="text-xs font-bold font-mono text-slate-500 uppercase">座席 / SEAT</p>
          <p className="text-5xl sm:text-7xl font-black font-mono tracking-tighter text-sky-950 mt-1">{ticket.seat}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs font-bold font-mono text-slate-500 uppercase">搭乗口 / GATE</p>
          <p className="text-5xl sm:text-7xl font-black font-mono tracking-tighter text-slate-950 mt-1">{flight.gate}</p>
        </div>
      </div>

      {/* Bottom Section: QR Verification + Clean Notes */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-1">
        
        {/* Left: Mobile Pass QR */}
        <div className="flex items-center space-x-4 p-3 bg-slate-50 border border-slate-300 rounded-sm">
          <div className="bg-white p-1.5 border border-slate-300 rounded shadow-xs flex-shrink-0">
            <QRCodeSVG 
              value={ticketUrl} 
              size={90} 
              level="M" 
              includeMargin={false}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
              <QrCode className="w-3.5 h-3.5" />
              <span>MOBILE BOARDING PASS</span>
            </div>
            <p className="text-xs font-mono font-bold text-slate-700">
              e-TKT: {ticket.id}
            </p>
            <p className="text-[11px] text-slate-500 leading-tight">
              スマートフォンでスキャンすると、<br />
              デジタル搭乗券としてご利用いただけます。
            </p>
          </div>
        </div>
        
        {/* Right: Notes */}
        <div className="text-left sm:text-right space-y-1">
          <p className="text-base sm:text-lg font-bold text-slate-900">
            出発時刻の10分前までに搭乗口へお越しください。
          </p>
          <p className="text-xs font-mono text-slate-500">
            Please be at the boarding gate at least 10 minutes prior to departure.
          </p>
          <p className="text-[11px] font-mono text-slate-400 pt-1">
            SHIBAURA TECH AIRWAYS • VALID FOR FLIGHT {flight.flightNumber}
          </p>
        </div>

      </div>

    </div>
  );
}
