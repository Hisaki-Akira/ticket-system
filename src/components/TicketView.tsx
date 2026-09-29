import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../lib/useStore';
import { Ticket, Flight } from '../lib/firebase';
import { saveLocalTicket, getLocalTickets, removeLocalTicket, TicketPayload } from '../lib/ticketUrl';
import { getTodayDateStr } from '../lib/mockStore';
import { QRCodeSVG } from 'qrcode.react';
import { 
  PlaneTakeoff, 
  Share2, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Bookmark, 
  Calendar,
  Clock,
  MapPin
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

  const statusConfig: Record<string, { label: string; en: string; bg: string; text: string; border: string }> = {
    'Scheduled': { label: '定刻', en: 'ON TIME', bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/30' },
    'Boarding': { label: '搭乗中', en: 'BOARDING', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    'Departed': { label: '出発済', en: 'DEPARTED', bg: 'bg-slate-800/40', text: 'text-slate-500', border: 'border-slate-700' },
    'Delayed': { label: '遅延', en: 'DELAYED', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/40' }
  };

  const currentStatus = statusConfig[flight.status] || statusConfig['Scheduled'];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans pb-16 selection:bg-sky-500 selection:text-white">
      
      {/* Top Navigation */}
      <header className="bg-[#0F1626]/90 backdrop-blur border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>出発案内</span>
          </Link>
          <div className="flex items-center space-x-1.5">
            <PlaneTakeoff className="w-4 h-4 text-sky-400" />
            <span className="font-extrabold tracking-wider text-xs text-white">SHIBAURA TECH AIRWAYS</span>
          </div>
          <button 
            onClick={handleCopyUrl}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="搭乗券リンクを共有"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-4">

        {/* Boarding Pass Wallet Card */}
        <div className="bg-[#11192C] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          
          {/* Card Top: Brand & Route */}
          <div className="p-6 border-b border-slate-800/80 bg-[#0F1626]">
            
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono tracking-widest text-sky-400 font-bold uppercase">
                DIGITAL BOARDING PASS
              </span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}>
                {currentStatus.label} {currentStatus.en}
              </span>
            </div>

            {/* Route graphic */}
            <div className="mt-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">FROM</span>
                <span className="text-2xl font-black tracking-tight text-white block mt-0.5">東京</span>
                <span className="text-[11px] font-mono text-slate-400">成田 / NRT</span>
              </div>

              <div className="flex flex-col items-center px-4">
                <PlaneTakeoff className="w-5 h-5 text-sky-400" />
                <div className="w-16 border-t border-dashed border-slate-700 my-1"></div>
                <span className="text-[11px] font-mono font-bold text-sky-300">{flight.flightNumber}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">TO</span>
                <span className="text-2xl font-black tracking-tight text-white block mt-0.5">{flight.destination}</span>
                <span className="text-[11px] font-mono text-slate-400">直行便 / DIRECT</span>
              </div>
            </div>

          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-3 border-b border-slate-800/80 bg-[#11192C] divide-x divide-slate-800/80">
            <div className="p-4 text-center">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">DEPARTURE</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block tabular-nums">
                {flight.departureTime}
              </span>
            </div>

            <div className="p-4 text-center bg-sky-500/5">
              <span className="text-[10px] font-mono tracking-wider text-sky-300 uppercase block">SEAT</span>
              <span className="text-2xl font-black font-mono text-sky-400 mt-1 block">
                {ticket.seat}
              </span>
            </div>

            <div className="p-4 text-center">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">GATE</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {flight.gate}
              </span>
            </div>
          </div>

          {/* Passenger Info & Date */}
          <div className="p-5 border-b border-slate-800/80 bg-[#11192C] flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">PASSENGER NAME</span>
              <span className="text-base font-black uppercase tracking-wider text-white mt-0.5 block">
                {ticket.passengerName}
              </span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] tracking-wider text-slate-400 uppercase block">FLIGHT DATE</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5 block">
                {flight.departureDate}
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-6 bg-[#0E1524] flex flex-col items-center text-center space-y-3">
            <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-md">
              <QRCodeSVG 
                value={window.location.href} 
                size={140} 
                level="M" 
                includeMargin={false}
              />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-200">
                搭乗口読取用 QRコード
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                e-Ticket ID: {ticket.id}
              </p>
            </div>
          </div>

          {/* Card Footer notice */}
          <div className="bg-[#0B101C] px-5 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>出発10分前までに搭乗口へお越しください</span>
            <span className="font-mono text-slate-400">STA</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button 
            onClick={handleCopyUrl}
            className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 px-3 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>コピー完了</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>URLをコピー</span>
              </>
            )}
          </button>

          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-sky-950/40"
          >
            <Printer className="w-4 h-4" />
            <span>印刷 / PDF保存</span>
          </button>
        </div>

        {/* Saved Tickets Section */}
        {savedTickets.length > 1 && (
          <div className="bg-[#11192C] rounded-xl p-4 border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Bookmark className="w-3.5 h-3.5 text-sky-400" />
              <span>この端末に保存済みの搭乗券 ({savedTickets.length})</span>
            </div>
            
            <div className="space-y-1.5">
              {savedTickets.map(st => (
                <div 
                  key={st.id}
                  onClick={() => navigate(`/pass/${st.id}?flight=${encodeURIComponent(st.flightNumber)}&dest=${encodeURIComponent(st.destination)}&date=${encodeURIComponent(st.departureDate)}&time=${encodeURIComponent(st.departureTime)}&gate=${encodeURIComponent(st.gate)}&seat=${encodeURIComponent(st.seat)}&name=${encodeURIComponent(st.name)}&status=${encodeURIComponent(st.status)}`)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    st.id === ticket.id 
                      ? 'bg-sky-950/40 border-sky-600/50 text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-slate-400 text-[11px]">{st.departureDate}</span>
                    <span className="font-bold text-sky-400">{st.flightNumber}</span>
                    <span className="text-white font-bold">{st.seat}席</span>
                    <span className="font-sans text-slate-300 truncate max-w-[90px]">{st.name}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {st.id === ticket.id && (
                      <span className="text-[10px] text-sky-400 font-bold px-1.5 py-0.5 rounded bg-sky-500/10">
                        表示中
                      </span>
                    )}
                    <button 
                      onClick={(e) => handleDeleteSavedTicket(st.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
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
