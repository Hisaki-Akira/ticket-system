import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/useStore';
import { Plane, Clock, Ticket as TicketIcon, Bookmark, X, Shield, Calendar, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getLocalTickets, TicketPayload } from '../lib/ticketUrl';
import { getTodayDateStr, getTomorrowDateStr } from '../lib/mockStore';

export default function DepartureBoard() {
  const { flights, tickets } = useStore();
  const [time, setTime] = useState(new Date());
  const [savedTickets, setSavedTickets] = useState<TicketPayload[]>([]);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const navigate = useNavigate();

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSavedTickets(getLocalTickets());
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Boarding':
        return {
          jp: '搭乗中',
          en: 'BOARDING',
          className: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 animate-pulse'
        };
      case 'Departed':
        return {
          jp: '出発済',
          en: 'DEPARTED',
          className: 'text-slate-500 border-slate-700 bg-slate-800/40'
        };
      case 'Delayed':
        return {
          jp: '遅延',
          en: 'DELAYED',
          className: 'text-rose-400 border-rose-500/40 bg-rose-500/10'
        };
      default:
        return {
          jp: '定刻',
          en: 'ON TIME',
          className: 'text-sky-300 border-sky-500/30 bg-sky-500/10'
        };
    }
  };

  // Filter ONLY flights for the selected date
  const dayFlights = flights.filter(f => f.departureDate === selectedDate);

  const formatDateLabel = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const dayOfWeek = days[dateObj.getDay()];
      return `${Number(m)}月${Number(d)}日(${dayOfWeek})`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans pb-16 selection:bg-sky-500 selection:text-white">
      
      {/* Flight Information Display System Header */}
      <header className="border-b border-slate-800 bg-[#0F1626]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-950">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-wider text-white">SHIBAURA TECH AIRWAYS</span>
                <span className="text-[10px] font-mono tracking-widest text-sky-400 border border-sky-500/30 px-1.5 py-0.5 rounded">STA</span>
              </div>
              <p className="text-xs text-slate-400 tracking-wider">
                国内線 出発案内 <span className="text-slate-600">|</span> DEPARTURES
              </p>
            </div>
          </div>

          {/* Clock & Real-time Indicator */}
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs font-mono text-slate-400 tracking-wider">
                CURRENT TIME (JST)
              </div>
              <div className="text-2xl font-bold font-mono tracking-widest text-sky-400 tabular-nums">
                {time.toLocaleTimeString('ja-JP', { hour12: false })}
              </div>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* Control Strip: Date Tabs + Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#11192C] p-3 rounded-xl border border-slate-800">
          
          {/* Date Selector Segment */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>運航日</span>
            </span>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedDate === todayStr 
                  ? 'bg-sky-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              本日 ({formatDateLabel(todayStr)})
            </button>

            <button
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedDate === tomorrowStr 
                  ? 'bg-sky-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              明日 ({formatDateLabel(tomorrowStr)})
            </button>

            <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2.5">
            {savedTickets.length > 0 && (
              <button 
                onClick={() => setShowSavedModal(true)}
                className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-800 text-sky-300 border border-sky-500/30 px-3.5 py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                <span>保存した搭乗券 ({savedTickets.length})</span>
              </button>
            )}

            <Link 
              to="/guest"
              className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold text-xs tracking-wide transition-colors shadow-sm"
            >
              <TicketIcon className="w-3.5 h-3.5" />
              <span>搭乗手続き (チェックイン)</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* FIDS Table Container */}
        <div className="bg-[#11192C] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
          
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-[#0F1626] border-b border-slate-800 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            <div className="col-span-2">TIME / 出発</div>
            <div className="col-span-3">DESTINATION / 行先</div>
            <div className="col-span-2">FLIGHT / 便名</div>
            <div className="col-span-1 text-center">GATE / 搭乗口</div>
            <div className="col-span-2 text-center">SEATS / 空席</div>
            <div className="col-span-2 text-right">STATUS / 状況</div>
          </div>

          {/* Flight Rows */}
          <div className="divide-y divide-slate-800/80">
            {[...dayFlights]
              .sort((a, b) => {
                if (a.status === 'Departed' && b.status !== 'Departed') return 1;
                if (a.status !== 'Departed' && b.status === 'Departed') return -1;
                return a.departureTime.localeCompare(b.departureTime);
              })
              .map(flight => {
                const flightTickets = tickets.filter(t => t.flightId === flight.id);
                const availableSeats = Math.max(0, flight.totalSeats - flightTickets.length);
                const loadPercentage = flight.totalSeats > 0 ? Math.round((flightTickets.length / flight.totalSeats) * 100) : 0;
                const statusInfo = getStatusDisplay(flight.status);
                
                return (
                  <div 
                    key={flight.id} 
                    className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 md:items-center hover:bg-slate-800/30 transition-colors"
                  >
                    
                    {/* Time & Mobile Status Header */}
                    <div className="flex justify-between items-center md:contents">
                      <div className="md:col-span-2 font-mono font-bold text-2xl text-amber-300 md:text-xl tracking-wider tabular-nums">
                        {flight.departureTime}
                      </div>

                      <div className="md:col-span-2 flex md:justify-end md:order-6">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-wider border font-mono ${statusInfo.className}`}>
                          {statusInfo.jp} <span className="text-[10px] opacity-75">{statusInfo.en}</span>
                        </span>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="md:col-span-3 flex items-baseline space-x-2 md:order-2">
                      <span className="text-xl font-bold text-white tracking-wide">
                        {flight.destination}
                      </span>
                    </div>

                    {/* Flight Number */}
                    <div className="md:col-span-2 font-mono font-bold text-sky-400 text-base md:text-lg tracking-wider md:order-3">
                      {flight.flightNumber}
                    </div>

                    {/* Gate */}
                    <div className="flex items-center justify-between md:justify-center md:col-span-1 md:order-4 border-t border-slate-800/60 md:border-none pt-2 md:pt-0 mt-2 md:mt-0">
                      <span className="text-xs text-slate-400 md:hidden">搭乗口:</span>
                      <span className="font-mono font-bold text-lg text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                        {flight.gate}
                      </span>
                    </div>

                    {/* Seats & Load bar */}
                    <div className="md:col-span-2 flex flex-col justify-center space-y-1.5 md:order-5">
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>残席: <strong className="text-slate-200">{availableSeats}</strong> / {flight.totalSeats}</span>
                        <span>{loadPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${loadPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                );
              })}
            
            {dayFlights.length === 0 && (
              <div className="p-16 text-center text-slate-500 space-y-2">
                <p className="text-sm font-medium text-slate-400">
                  {formatDateLabel(selectedDate)} に運航予定のフライトはありません。
                </p>
                <p className="text-xs text-slate-500">
                  運航ダイヤの確認またはフライト追加は運航管理画面より行えます。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Airport Standard Notice & Admin Entry */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3 pt-2">
          <p>
            ※ 搭乗口および出発時刻は予告なく変更となる場合がございます。搭乗口へはお早めにお越しください。
          </p>
          <Link 
            to="/admin" 
            className="text-slate-500 hover:text-slate-300 flex items-center space-x-1.5 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>運航管理者ポータル</span>
          </Link>
        </div>

      </main>

      {/* Saved Boarding Passes Drawer */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#11192C] border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-base text-white">保存済みの搭乗券</h3>
              </div>
              <button 
                onClick={() => setShowSavedModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              このブラウザで発行した搭乗券です。選択すると搭乗券画面を表示します。
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {savedTickets.map(st => (
                <div 
                  key={st.id}
                  onClick={() => {
                    setShowSavedModal(false);
                    navigate(`/pass/${st.id}?flight=${encodeURIComponent(st.flightNumber)}&dest=${encodeURIComponent(st.destination)}&date=${encodeURIComponent(st.departureDate)}&time=${encodeURIComponent(st.departureTime)}&gate=${encodeURIComponent(st.gate)}&seat=${encodeURIComponent(st.seat)}&name=${encodeURIComponent(st.name)}&status=${encodeURIComponent(st.status)}`);
                  }}
                  className="p-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="font-bold text-sky-400">{st.flightNumber}</span>
                      <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-bold">{st.seat}席</span>
                      <span className="font-sans font-bold text-white">{st.name} 様</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {st.departureDate} {st.departureTime}発 • {st.destination} (搭乗口: {st.gate})
                    </p>
                  </div>
                  <span className="text-xs font-bold text-sky-400 border border-sky-500/30 px-2 py-1 rounded-md">
                    表示 →
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowSavedModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
