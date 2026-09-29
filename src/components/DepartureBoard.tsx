import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/useStore';
import { Plane, Clock, Ticket as TicketIcon, Bookmark, X, Shield, Calendar, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getLocalTickets, TicketPayload } from '../lib/ticketUrl';
import { getTodayDateStr, getTomorrowDateStr } from '../lib/mockStore';

export default function DepartureBoard() {
  const { flights, tickets, isFirebaseConfigured } = useStore();
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Boarding': return 'text-green-700 bg-green-50 border-green-200';
      case 'Departed': return 'text-gray-500 bg-gray-50 border-gray-200';
      case 'Delayed': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  const statusMap: Record<string, string> = {
    'Scheduled': '定刻',
    'Boarding': '搭乗中',
    'Departed': '出発済',
    'Delayed': '遅延'
  };

  // Filter ONLY flights for the selected date (その日のものしか表示しない)
  const dayFlights = flights.filter(f => f.departureDate === selectedDate);

  // Format date display
  const formatDateJapanese = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const dayOfWeek = days[dateObj.getDay()];
      return `${Number(m)}月${Number(d)}日（${dayOfWeek}）`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-12">
      {/* Corporate Header */}
      <div className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-white p-2 rounded-lg">
              <Plane className="w-8 h-8 text-blue-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">出発案内</h1>
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mt-1">
                SHIBAURA TECH AIRWAYS • 第1ターミナル
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2 text-2xl font-bold font-mono tracking-wider">
              <Clock className="w-5 h-5 text-blue-300" />
              <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
            <p className="text-blue-200 text-sm mt-1">
              本日: {formatDateJapanese(todayStr)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Actions Bar & Date Selector */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          {/* Date Selector Tabs */}
          <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 px-3 text-xs font-bold text-gray-500 uppercase">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>表示日:</span>
            </div>
            
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                selectedDate === todayStr 
                  ? 'bg-blue-900 text-white shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              本日 ({formatDateJapanese(todayStr)})
            </button>

            <button
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                selectedDate === tomorrowStr 
                  ? 'bg-blue-900 text-white shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              明日 ({formatDateJapanese(tomorrowStr)})
            </button>

            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
              <span className="text-xs text-gray-500">日付指定:</span>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {savedTickets.length > 0 && (
              <button 
                onClick={() => setShowSavedModal(true)}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-sky-50 text-sky-800 border-2 border-sky-300 px-4 py-2.5 rounded-xl font-bold shadow-xs transition-colors cursor-pointer text-sm"
              >
                <Bookmark className="w-4 h-4 text-sky-600" />
                <span>私の搭乗券 ({savedTickets.length})</span>
              </button>
            )}

            <Link 
              to="/guest"
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors text-center text-sm"
            >
              <TicketIcon className="w-4 h-4" />
              <span>搭乗券予約・発行</span>
            </Link>
          </div>
        </div>

        {/* Board Title Banner */}
        <div className="flex justify-between items-center bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
            <h2 className="text-lg font-bold text-gray-900">
              {formatDateJapanese(selectedDate)} の出発便一覧
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {dayFlights.length} 便運航
            </span>
          </div>

          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
            >
              本日の運行情報に戻る
            </button>
          )}
        </div>

        {/* Board */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 bg-gray-50 text-gray-500 px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
            <div className="col-span-2">時刻</div>
            <div className="col-span-3">行先</div>
            <div className="col-span-2">便名</div>
            <div className="col-span-1 text-center">搭乗口</div>
            <div className="col-span-2 text-center">搭乗率</div>
            <div className="col-span-2 text-right">状況</div>
          </div>

          {/* Table Rows (Filtered by selected day only!) */}
          <div className="divide-y divide-gray-100">
            {[...dayFlights]
              .sort((a, b) => {
                if (a.status === 'Departed' && b.status !== 'Departed') return 1;
                if (a.status !== 'Departed' && b.status === 'Departed') return -1;
                return a.departureTime.localeCompare(b.departureTime);
              })
              .map(flight => {
              const flightTickets = tickets.filter(t => t.flightId === flight.id);
              const loadPercentage = flight.totalSeats > 0 ? Math.round((flightTickets.length / flight.totalSeats) * 100) : 0;
              
              return (
                <div key={flight.id} className="flex flex-col md:grid md:grid-cols-12 gap-0 md:gap-4 px-6 py-5 md:items-center hover:bg-gray-50 transition-colors">
                  
                  {/* Time & Status (Mobile Top Row) */}
                  <div className="flex justify-between items-center md:contents">
                    <div className="md:col-span-2 text-2xl md:text-xl font-bold text-gray-900 font-mono md:order-1">
                      {flight.departureTime}
                    </div>
                    <div className="md:col-span-2 flex md:justify-end md:order-6">
                      <span className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wide border ${getStatusStyle(flight.status)}`}>
                        {statusMap[flight.status] || flight.status}
                      </span>
                    </div>
                  </div>

                  {/* Destination & Flight Number */}
                  <div className="flex flex-col md:contents mt-2 md:mt-0">
                    <div className="md:col-span-3 text-xl font-bold text-gray-900 uppercase md:order-2">
                      {flight.destination}
                    </div>
                    <div className="md:col-span-2 text-sm md:text-lg text-gray-600 font-mono md:order-3">
                      {flight.flightNumber}
                    </div>
                  </div>

                  {/* Gate & Load */}
                  <div className="flex justify-between items-center mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-100 md:border-none md:contents">
                    <div className="flex items-center space-x-2 md:space-x-0 md:col-span-1 md:block md:text-center text-lg md:text-xl font-bold text-blue-900 md:order-4">
                      <span className="text-sm text-gray-500 font-normal md:hidden">搭乗口:</span>
                      <span>{flight.gate}</span>
                    </div>
                    
                    <div className="md:col-span-2 flex flex-col justify-center space-y-1.5 px-0 md:px-2 w-1/2 md:w-auto md:order-5">
                      <div className="flex justify-between text-xs text-gray-500 font-medium">
                        <span>{flightTickets.length} / {flight.totalSeats}席</span>
                        <span>{loadPercentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${loadPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
            
            {dayFlights.length === 0 && (
              <div className="p-12 text-center text-gray-500 space-y-3">
                <Plane className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-base font-medium">
                  {formatDateJapanese(selectedDate)} に運航が予定されている便はありません。
                </p>
                <p className="text-xs text-gray-400">
                  他の日付を選択するか、管理ポータルからフライトを登録してください。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & Admin link */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-xs text-gray-500 gap-3">
          <p>
            ※ 出発案内は指定した日付の便のみを表示します。予約・発券は事前予約を含め全日程可能です。
          </p>
          <div className="flex items-center space-x-4">
            {!isFirebaseConfigured && (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                ⚠ シミュレーション環境
              </span>
            )}
            <Link 
              to="/admin" 
              className="text-gray-400 hover:text-gray-700 flex items-center space-x-1 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>運行管理者ポータル</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Saved Tickets Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-lg text-gray-900">この端末に保存された搭乗券</h3>
              </div>
              <button 
                onClick={() => setShowSavedModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              ブラウザを閉じても、発行した搭乗券はここに保持されています。クリックするといつでも搭乗券を開けます。
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {savedTickets.map(st => (
                <div 
                  key={st.id}
                  onClick={() => {
                    setShowSavedModal(false);
                    navigate(`/pass/${st.id}?flight=${encodeURIComponent(st.flightNumber)}&dest=${encodeURIComponent(st.destination)}&date=${encodeURIComponent(st.departureDate)}&time=${encodeURIComponent(st.departureTime)}&gate=${encodeURIComponent(st.gate)}&seat=${encodeURIComponent(st.seat)}&name=${encodeURIComponent(st.name)}&status=${encodeURIComponent(st.status)}`);
                  }}
                  className="p-3.5 bg-gray-50 hover:bg-sky-50 border border-gray-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sky-700">{st.flightNumber}</span>
                      <span className="bg-gray-200 text-gray-800 text-xs font-mono px-2 py-0.5 rounded font-bold">{st.seat}席</span>
                      <span className="font-bold text-gray-900">{st.name} 様</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {st.departureDate ? `${st.departureDate} ` : ''}{st.departureTime}発 • {st.destination} (搭乗口: {st.gate})
                    </p>
                  </div>
                  <span className="text-xs font-bold text-sky-600 bg-white border border-sky-200 px-2.5 py-1 rounded-lg">
                    開く →
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowSavedModal(false)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
