import React from 'react';
import { Flight, Ticket } from '../lib/firebase';
import { Plane, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getTicketUrl } from '../lib/ticketUrl';

interface BoardingPassProps {
  ticket: Ticket;
  flight: Flight;
}

export default function BoardingPass({ ticket, flight }: BoardingPassProps) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  let formattedDate = flight.departureDate || '';
  if (!formattedDate) {
    const date = new Date(ticket.issuedAt);
    formattedDate = `${date.getFullYear()}年${months[date.getMonth()]}${date.getDate()}日`;
  }

  const formattedTime = flight.departureTime;
  const ticketUrl = getTicketUrl(ticket, flight);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-slate-900 font-sans p-8 sm:p-10 border border-gray-300 shadow-sm print:border-none print:shadow-none print:p-0">
      
      {/* Top Section */}
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 bg-slate-900 text-white flex items-center justify-center rounded-sm">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-2xl sm:text-3xl tracking-tight block">Shibaura Tech Airways</span>
            <span className="text-xs text-slate-500 block">国内線旅客サービス</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight block">搭乗券</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-5 mb-8">
        <div className="col-span-4 border-b border-gray-300 pb-2">
          <p className="text-xs text-slate-500">旅客氏名</p>
          <p className="text-2xl sm:text-3xl font-bold uppercase tracking-wide mt-1 text-slate-900">{ticket.passengerName} 様</p>
        </div>
        
        <div className="col-span-1 border-b border-gray-300 pb-2">
          <p className="text-xs text-slate-500">搭乗日</p>
          <p className="text-lg sm:text-xl font-bold font-mono mt-1 text-slate-900">{formattedDate}</p>
        </div>
        
        <div className="col-span-1 border-b border-gray-300 pb-2">
          <p className="text-xs text-slate-500">便名</p>
          <p className="text-lg sm:text-xl font-bold font-mono mt-1 text-slate-900">{flight.flightNumber}</p>
        </div>

        <div className="col-span-2 border-b border-gray-300 pb-2">
          <p className="text-xs text-slate-500">区間</p>
          <p className="text-lg sm:text-xl font-bold mt-1 text-slate-900">東京（成田）— {flight.destination}</p>
        </div>
      </div>

      {/* Primary Boarding Metrics (Time, Seat, Gate) */}
      <div className="flex justify-between items-center border border-gray-300 rounded-sm mb-6 bg-gray-50 p-5">
        <div className="text-center flex-1">
          <p className="text-xs font-bold text-slate-500">搭乗時刻</p>
          <p className="text-4xl sm:text-6xl font-bold font-mono tracking-tight text-slate-900 mt-1">{formattedTime}</p>
        </div>
        <div className="text-center flex-1 border-l border-r border-gray-300 px-4">
          <p className="text-xs font-bold text-slate-500">座席</p>
          <p className="text-4xl sm:text-6xl font-bold font-mono tracking-tight text-slate-900 mt-1">{ticket.seat}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs font-bold text-slate-500">搭乗口</p>
          <p className="text-4xl sm:text-6xl font-bold font-mono tracking-tight text-slate-900 mt-1">{flight.gate}</p>
        </div>
      </div>

      {/* Bottom Section: QR Verification */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-1">
        
        {/* Left: Mobile Pass QR */}
        <div className="flex items-center space-x-4 p-3 bg-gray-50 border border-gray-200 rounded-sm">
          <div className="bg-white p-1.5 border border-gray-300 rounded shadow-2xs flex-shrink-0">
            <QRCodeSVG 
              value={ticketUrl} 
              size={90} 
              level="M" 
              includeMargin={false}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span>スマートフォン用搭乗券</span>
            </div>
            <p className="text-xs font-mono font-medium text-slate-700">
              航空券番号: {ticket.id}
            </p>
            <p className="text-[11px] text-slate-500 leading-tight">
              スマートフォンのカメラで読み取ると、<br />
              デジタル搭乗券としても表示いただけます。
            </p>
          </div>
        </div>
        
        {/* Right: Notes */}
        <div className="text-left sm:text-right space-y-1">
          <p className="text-base sm:text-lg font-bold text-slate-900">
            出発時刻の10分前までに搭乗口へお越しください。
          </p>
          <p className="text-xs text-slate-500">
            Shibaura Tech Airways • 便名 {flight.flightNumber}
          </p>
        </div>

      </div>

    </div>
  );
}
