import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../lib/useStore';
import { Ticket, Flight } from '../lib/firebase';
import { saveLocalTicket, getLocalTickets, removeLocalTicket, TicketPayload } from '../lib/ticketUrl';
import { getTodayDateStr } from '../lib/mockStore';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Plane, 
  Share2, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Bookmark
} from 'lucide-react';

export default function TicketView() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tickets, flights } = useStore();
  
  const [copied, setCopied] = useState(false);
  const [savedTickets, setSavedTickets] = useState<TicketPayload[]>([]);

  // Resolve Ticket and Flight data
  const storeTicket = tickets.find(t => t.id === ticketId);
  const storeFlight = storeTicket ? flights.find(f => f.id === storeTicket.flightId) : null;

  // Fallback from URL query parameters (enables standalone mobile view when scanned from other devices)
  const fallbackFlightNumber = searchParams.get('flight') || 'STA-101';
  const fallbackDestination = searchParams.get('dest') || '東京（成田）';
  const fallbackDepartureDate = searchParams.get('date') || getTodayDateStr();
  const fallbackDepartureTime = searchParams.get('time') || '12:00';
  const fallbackGate = searchParams.get('gate') || 'A1';
  const fallbackStatus = (searchParams.get('status') as Flight['status']) || 'Scheduled';
  const fallbackSeat = searchParams.get('seat') || '1A';
  const fallbackName = searchParams.get('name') || 'GUEST PASSENGER';
  const fallbackIssued = Number(searchParams.get('issued')) || Date.now();

  const ticket: Ticket = storeTicket || {
    id: ticketId || 'TKT-001',
    flightId: storeFlight?.id || searchParams.get('fid') || 'f1',
    passengerName: fallbackName,
    seat: fallbackSeat,
    issuedAt: fallbackIssued
  };

  const flight: Flight = storeFlight || {
    id: ticket.flightId,
    flightNumber: fallbackFlightNumber,
    destination: fallbackDestination,
    departureDate: fallbackDepartureDate,
    departureTime: fallbackDepartureTime,
    gate: fallbackGate,
    status: fallbackStatus,
    totalSeats: 21
  };

  // Save to local storage on load
  useEffect(() => {
    saveLocalTicket(ticket, flight);
    setSavedTickets(getLocalTickets());
  }, [ticket.id, flight.flightNumber, flight.departureDate, flight.status]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSavedTicket = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeLocalTicket(id);
    setSavedTickets(getLocalTickets());
  };

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    'Scheduled': { label: '定刻', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
    'Boarding': { label: '搭乗中', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Departed': { label: '出発済', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
    'Delayed': { label: '遅延', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
  };

  const currentStatus = statusConfig[flight.status] || statusConfig['Scheduled'];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-16">
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 transition-colors text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>出発案内</span>
          </Link>
          <div className="flex items-center space-x-1.5">
            <Plane className="w-4 h-4 text-slate-800" />
            <span className="font-bold text-xs text-slate-900">Shibaura Tech Airways</span>
          </div>
          <button 
            onClick={handleCopyUrl}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="搭乗券リンクを共有"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-4">

        {/* Boarding Pass Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          
          {/* Card Top: Brand & Route */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">
                搭乗券
              </span>
              <span className={`px-2 py-0.5 rounded font-bold text-xs border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}>
                {currentStatus.label}
              </span>
            </div>

            {/* Route graphic */}
            <div className="mt-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">出発地</span>
                <span className="text-xl font-bold tracking-tight text-slate-900 block mt-0.5">東京（成田）</span>
              </div>

              <div className="flex flex-col items-center px-4">
                <Plane className="w-4 h-4 text-slate-600" />
                <div className="w-14 border-t border-dashed border-gray-300 my-1"></div>
                <span className="text-xs font-mono font-bold text-slate-800">{flight.flightNumber}</span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">到着地</span>
                <span className="text-xl font-bold tracking-tight text-slate-900 block mt-0.5">{flight.destination}</span>
              </div>
            </div>

          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-3 border-b border-gray-100 bg-white divide-x divide-gray-100">
            <div className="p-4 text-center">
              <span className="text-[11px] text-slate-500 block">出発時刻</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
                {flight.departureTime}
              </span>
            </div>

            <div className="p-4 text-center bg-gray-50/50">
              <span className="text-[11px] font-bold text-slate-900 block">座席</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                {ticket.seat}
              </span>
            </div>

            <div className="p-4 text-center">
              <span className="text-[11px] text-slate-500 block">搭乗口</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                {flight.gate}
              </span>
            </div>
          </div>

          {/* Passenger Info & Date */}
          <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">搭乗者名</span>
              <span className="text-sm font-bold uppercase tracking-wide text-slate-900 mt-0.5 block">
                {ticket.passengerName} 様
              </span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[11px] text-slate-500 block">搭乗日</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                {flight.departureDate}
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-6 bg-gray-50/40 flex flex-col items-center text-center space-y-3">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
              <QRCodeSVG 
                value={window.location.href} 
                size={140} 
                level="M" 
                includeMargin={false}
              />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">
                搭乗口読取用 QRコード
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                航空券番号: {ticket.id}
              </p>
            </div>
          </div>

          {/* Card Footer notice */}
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>出発10分前までに搭乗口へお越しください</span>
            <span className="text-slate-600 font-medium">Shibaura Tech Airways</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button 
            onClick={handleCopyUrl}
            className="flex items-center justify-center space-x-1.5 bg-white hover:bg-gray-50 text-slate-800 py-3 px-3 rounded-xl text-xs font-bold transition-all border border-gray-300 cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>コピー完了</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>URLをコピー</span>
              </>
            )}
          </button>

          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>印刷 / 保存</span>
          </button>
        </div>

        {/* Saved Tickets Section */}
        {savedTickets.length > 1 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2.5 shadow-xs">
            <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Bookmark className="w-3.5 h-3.5 text-slate-600" />
              <span>この端末に保存済みの搭乗券 ({savedTickets.length})</span>
            </div>
            
            <div className="space-y-1.5">
              {savedTickets.map(st => (
                <div 
                  key={st.id}
                  onClick={() => navigate(`/pass/${st.id}?flight=${encodeURIComponent(st.flightNumber)}&dest=${encodeURIComponent(st.destination)}&date=${encodeURIComponent(st.departureDate)}&time=${encodeURIComponent(st.departureTime)}&gate=${encodeURIComponent(st.gate)}&seat=${encodeURIComponent(st.seat)}&name=${encodeURIComponent(st.name)}&status=${encodeURIComponent(st.status)}`)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    st.id === ticket.id 
                      ? 'bg-slate-50 border-slate-400 text-slate-900 font-medium' 
                      : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-[11px] font-mono">{st.departureDate}</span>
                    <span className="font-bold text-slate-900 font-mono">{st.flightNumber}</span>
                    <span className="text-slate-900 font-bold">{st.seat}席</span>
                    <span className="text-slate-700 truncate max-w-[90px]">{st.name} 様</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {st.id === ticket.id && (
                      <span className="text-[10px] text-slate-800 font-bold px-1.5 py-0.5 rounded bg-gray-200">
                        表示中
                      </span>
                    )}
                    <button 
                      onClick={(e) => handleDeleteSavedTicket(st.id, e)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="削除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
