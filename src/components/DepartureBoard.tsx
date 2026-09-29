import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/useStore';
import { Plane, Calendar, Bookmark, X, Shield, ArrowRight, Ticket as TicketIcon } from 'lucide-react';
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
          label: '搭乗中',
          className: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
        };
      case 'Departed':
        return {
          label: '出発済',
          className: 'text-gray-500 bg-gray-100 border border-gray-200'
        };
      case 'Delayed':
        return {
          label: '遅延',
          className: 'text-rose-700 bg-rose-50 border border-rose-200'
        };
      default:
        return {
          label: '定刻',
          className: 'text-slate-700 bg-slate-100 border border-slate-200'
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
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-16">
      
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block">
                Shibaura Tech Airways
              </span>
              <p className="text-xs text-slate-500">
                国内線 出発案内
              </p>
            </div>
          </div>

          {/* Current Time Display */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">現在時刻</span>
              <span className="text-2xl font-bold font-mono tracking-wider text-slate-900 tabular-nums">
                {time.toLocaleTimeString('ja-JP', { hour12: false })}
              </span>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* Action Controls & Date Selection */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          
          {/* Date Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-600 px-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>運航日</span>
            </span>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedDate === todayStr 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              本日 ({formatDateLabel(todayStr)})
            </button>

            <button
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedDate === tomorrowStr 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              明日 ({formatDateLabel(tomorrowStr)})
            </button>

            <div className="flex items-center pl-2 border-l border-gray-200">
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="bg-white border border-gray-300 rounded-md px-2 py-1 text-xs text-slate-700 font-mono focus:outline-none focus:border-slate-900 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2.5">
            {savedTickets.length > 0 && (
              <button 
                onClick={() => setShowSavedModal(true)}
                className="flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 px-3.5 py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                <span>保存した搭乗券 ({savedTickets.length})</span>
              </button>
            )}

            <Link 
              to="/guest"
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-xs tracking-wide transition-colors"
            >
              <TicketIcon className="w-3.5 h-3.5" />
              <span>搭乗手続き (チェックイン)</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* Flight Information Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-200 text-xs font-bold text-slate-600">
            <div className="col-span-2">出発時刻</div>
            <div className="col-span-3">行先</div>
            <div className="col-span-2">便名</div>
            <div className="col-span-1 text-center">搭乗口</div>
            <div className="col-span-2 text-center">空席状況</div>
            <div className="col-span-2 text-right">状況</div>
          </div>

          {/* Flight Rows */}
          <div className="divide-y divide-gray-100">
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
                    className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 md:items-center hover:bg-gray-50/80 transition-colors"
                  >
                    
                    {/* Time & Mobile Status Header */}
                    <div className="flex justify-between items-center md:contents">
                      <div className="md:col-span-2 font-mono font-bold text-xl text-slate-900 tracking-wide tabular-nums">
                        {flight.departureTime}
                      </div>

                      <div className="md:col-span-2 flex md:justify-end md:order-6">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="md:col-span-3 flex items-baseline md:order-2">
                      <span className="text-base font-bold text-slate-900">
                        {flight.destination}
                      </span>
                    </div>

                    {/* Flight Number */}
                    <div className="md:col-span-2 font-mono font-bold text-slate-700 text-sm md:text-base md:order-3">
                      {flight.flightNumber}
                    </div>

                    {/* Gate */}
                    <div className="flex items-center justify-between md:justify-center md:col-span-1 md:order-4 border-t border-gray-100 md:border-none pt-2 md:pt-0 mt-2 md:mt-0">
                      <span className="text-xs text-slate-500 md:hidden">搭乗口:</span>
                      <span className="font-mono font-bold text-base text-slate-800 bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200">
                        {flight.gate}
                      </span>
                    </div>

                    {/* Seats & Load bar */}
                    <div className="md:col-span-2 flex flex-col justify-center space-y-1.5 md:order-5">
                      <div className="flex justify-between text-xs font-mono text-slate-600">
                        <span>残席: <strong className="text-slate-900">{availableSeats}</strong> / {flight.totalSeats}</span>
                        <span>{loadPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-800 rounded-full transition-all duration-500"
                          style={{ width: `${loadPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                );
              })}
            
            {dayFlights.length === 0 && (
              <div className="p-16 text-center text-slate-500 space-y-2">
                <p className="text-sm font-medium text-slate-700">
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
            ※ 搭乗口および出発時刻は予告なく変更となる場合がございます。最新の空港アナウンスにご注意ください。
          </p>
          <Link 
            to="/admin" 
            className="text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 transition-colors font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>運航管理ログイン</span>
          </Link>
        </div>

      </main>

      {/* Saved Boarding Passes Drawer */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-base text-slate-900">保存済みの搭乗券</h3>
              </div>
              <button 
                onClick={() => setShowSavedModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
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
                  className="p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{st.flightNumber}</span>
                      <span className="bg-gray-200 text-slate-800 text-xs px-2 py-0.5 rounded font-mono font-bold">{st.seat}席</span>
                      <span className="font-bold text-slate-900">{st.name} 様</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {st.departureDate} {st.departureTime}発 • {st.destination} (搭乗口: {st.gate})
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-900 bg-white border border-gray-300 px-2.5 py-1 rounded-md">
                    表示
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowSavedModal(false)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
