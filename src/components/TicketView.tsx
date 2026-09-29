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
  Calendar
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

  // Fallback from URL query parameters (enables standalone mobile view when scanned from other devices!)
  const fallbackFlightNumber = searchParams.get('flight') || 'FA-101';
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
    totalSeats: 24
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

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; desc: string }> = {
    'Scheduled': { label: '定刻通り', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', desc: '定刻どおりの出発を予定しています' },
    'Boarding': { label: '搭乗中', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', desc: 'ただいま搭乗案内中です。搭乗口へお越しください' },
    'Departed': { label: '出発済', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', desc: 'この便はすでに出発いたしました' },
    'Delayed': { label: '遅延', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', desc: '出発が遅れております。最新の案内をご確認ください' }
  };

  const currentStatus = statusConfig[flight.status] || statusConfig['Scheduled'];

  const issuedDate = new Date(ticket.issuedAt);
  const formattedTime = issuedDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      
      {/* Top Navigation */}
      <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>出発案内へ</span>
          </Link>
          <div className="flex items-center space-x-2">
            <PlaneTakeoff className="w-5 h-5 text-sky-400" />
            <span className="font-bold tracking-wider text-sm text-white">SHIBAURA TECH AIRWAYS</span>
          </div>
          <button 
            onClick={handleCopyUrl}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="搭乗券リンクをコピー"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">

        {/* Highlight Banner with departure date/time, flight, seat, and passenger name */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-5 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between text-sky-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <div className="flex items-center space-x-1.5">
              <Bookmark className="w-4 h-4" />
              <span>デジタル搭乗券 • BOARDING PASS</span>
            </div>
            <div className="flex items-center space-x-1 font-mono text-white bg-white/20 px-2 py-0.5 rounded">
              <Calendar className="w-3 h-3 text-sky-200" />
              <span>{flight.departureDate}</span>
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="text-sky-300 font-mono">{flight.flightNumber} 便</span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-lg font-bold">{ticket.seat} 席</span>
            <span className="text-xl font-bold">{ticket.passengerName} 様</span>
          </h1>
          <p className="text-sky-100 text-xs mt-2 flex items-center gap-1.5 opacity-90">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
            この端末に保存されました。ブラウザを閉じても再表示できます。
          </p>
        </div>

        {/* Flight Status Live Pill */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${currentStatus.bg} ${currentStatus.border}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full animate-ping ${currentStatus.text.replace('text-', 'bg-')}`}></div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-base font-extrabold ${currentStatus.text}`}>{currentStatus.label}</span>
                <span className="text-xs text-slate-500 font-medium">（リアルタイム運航状況）</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{currentStatus.desc}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">GATE {flight.gate}</span>
        </div>

        {/* Main Boarding Pass Card */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none">
          
          {/* Airline Card Header */}
          <div className="bg-blue-950 text-white p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">Shibaura Tech Airways</span>
                <h2 className="text-2xl font-black tracking-tight mt-0.5">搭乗券 / BOARDING PASS</h2>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block font-mono">TICKET ID</span>
                <span className="font-mono text-sm font-bold text-sky-300">{ticket.id}</span>
              </div>
            </div>

            {/* Flight Route Display */}
            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">DEPARTURE</div>
                <div className="text-3xl font-black tracking-tight mt-1">東京</div>
                <div className="text-xs text-sky-300 font-medium">成田国際空港 (NRT)</div>
              </div>

              <div className="flex flex-col items-center px-4">
                <PlaneTakeoff className="w-7 h-7 text-sky-400" />
                <div className="w-20 border-t-2 border-dashed border-slate-600 my-1"></div>
                <span className="text-[11px] font-mono font-bold text-sky-200">{flight.flightNumber}</span>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">DESTINATION</div>
                <div className="text-3xl font-black tracking-tight mt-1">{flight.destination}</div>
                <div className="text-xs text-sky-300 font-medium">直行便 / DIRECT</div>
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="p-6 bg-slate-50 grid grid-cols-3 gap-4 border-b border-dashed border-slate-300 relative">
            <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-slate-900 rounded-full"></div>
            <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-slate-900 rounded-full"></div>

            <div className="text-center p-3 bg-white rounded-xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">出発時刻</span>
              <span className="text-3xl font-black font-mono text-slate-900 tracking-tight mt-1 block">
                {flight.departureTime}
              </span>
            </div>

            <div className="text-center p-3 bg-white rounded-xl shadow-xs border border-blue-200 bg-blue-50/40">
              <span className="text-xs font-bold text-blue-700 block">指定座席</span>
              <span className="text-3xl font-black font-mono text-blue-900 tracking-tight mt-1 block">
                {ticket.seat}
              </span>
            </div>

            <div className="text-center p-3 bg-white rounded-xl shadow-xs border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">搭乗口</span>
              <span className="text-3xl font-black font-mono text-slate-900 tracking-tight mt-1 block">
                {flight.gate}
              </span>
            </div>
          </div>

          {/* Passenger & Verification Code */}
          <div className="p-6 bg-white space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">PASSENGER NAME</span>
                <span className="text-2xl font-black uppercase tracking-wider text-slate-900 mt-0.5 block">
                  {ticket.passengerName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block uppercase">搭乗日 / DATE</span>
                <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                  {flight.departureDate}
                </span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 flex-shrink-0">
                <QRCodeSVG 
                  value={window.location.href} 
                  size={120} 
                  level="M" 
                  includeMargin={false}
                />
              </div>

              <div className="text-center sm:text-left space-y-1">
                <div className="text-sm font-extrabold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>認証QRコード（スマート搭乗）</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  搭乗ゲートでこちらのQRコードをご提示ください。スタッフが確認いたします。
                </p>
                <p className="text-[11px] font-mono text-slate-400 pt-1">
                  Issued: {formattedTime} • Valid for Event
                </p>
              </div>
            </div>
          </div>

          {/* Card Footer notice */}
          <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>搭乗日: {flight.departureDate} • 出発10分前までに搭乗口へお越しください。</span>
            <span className="font-semibold text-slate-700">SHIBAURA TECH AIRWAYS</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onClick={handleCopyUrl}
            className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 px-4 rounded-xl font-bold transition-all border border-slate-700 cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300">URLをコピーしました！</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 text-slate-300" />
                <span>搭乗券のURLをコピー</span>
              </>
            )}
          </button>

          <button 
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-md shadow-sky-950/40 cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            <span>印刷 / PDF保存</span>
          </button>
        </div>

        {/* Saved Tickets Section */}
        {savedTickets.length > 0 && (
          <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 mt-6">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-sky-400" />
              <span>この端末に保存されている搭乗券 ({savedTickets.length})</span>
            </h3>
            
            <div className="space-y-2">
              {savedTickets.map(st => (
                <div 
                  key={st.id}
                  onClick={() => navigate(`/pass/${st.id}?flight=${encodeURIComponent(st.flightNumber)}&dest=${encodeURIComponent(st.destination)}&date=${encodeURIComponent(st.departureDate)}&time=${encodeURIComponent(st.departureTime)}&gate=${encodeURIComponent(st.gate)}&seat=${encodeURIComponent(st.seat)}&name=${encodeURIComponent(st.name)}&status=${encodeURIComponent(st.status)}`)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    st.id === ticket.id 
                      ? 'bg-sky-900/30 border-sky-600/50 text-white' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs text-sky-300 font-semibold">{st.departureDate}</span>
                    <span className="font-mono font-bold text-sky-400 text-sm">{st.flightNumber}</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-mono font-semibold">{st.seat}席</span>
                    <span className="text-sm font-medium text-white">{st.name} 様</span>
                    <span className="text-xs text-slate-400 hidden sm:inline">（{st.destination}）</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {st.id === ticket.id && (
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full font-bold">
                        表示中
                      </span>
                    )}
                    <button 
                      onClick={(e) => handleDeleteSavedTicket(st.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1 text-xs transition-colors cursor-pointer"
                      title="端末保存から削除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link 
            to="/" 
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
          >
            ← 出発案内ボード（フライト一覧）に戻る
          </Link>
        </div>

      </main>
    </div>
  );
}
