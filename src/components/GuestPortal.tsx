import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/useStore';
import { 
  Plane, 
  User, 
  Ticket as TicketIcon, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  ExternalLink,
  Bookmark,
  X,
  Calendar,
  ArrowLeft,
  Printer
} from 'lucide-react';
import { Ticket } from '../lib/firebase';
import BoardingPass from './BoardingPass';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getTicketUrl, saveLocalTicket, getLocalTickets, TicketPayload } from '../lib/ticketUrl';

const LEFT_COLUMNS = ['A', 'C'];
const CENTER_COLUMNS = ['D', 'E', 'G'];
const RIGHT_COLUMNS = ['H', 'K'];
const ROWS = 3;

export default function GuestPortal() {
  const { flights, tickets, issueTicket } = useStore();
  const [selectedFlightId, setSelectedFlightId] = useState<string>('');
  const [passengerName, setPassengerName] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [savedTickets, setSavedTickets] = useState<TicketPayload[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setSavedTickets(getLocalTickets());
  }, []);

  const availableFlights = flights
    .filter(f => f.status !== 'Departed')
    .sort((a, b) => {
      const cmpDate = a.departureDate.localeCompare(b.departureDate);
      if (cmpDate !== 0) return cmpDate;
      return a.departureTime.localeCompare(b.departureTime);
    });

  const filteredFlights = availableFlights.filter(f => {
    if (dateFilter === 'all') return true;
    return f.departureDate === dateFilter;
  });

  const availableDates = Array.from(new Set(availableFlights.map(f => f.departureDate)));

  useEffect(() => {
    if (filteredFlights.length > 0 && (!selectedFlightId || !filteredFlights.some(f => f.id === selectedFlightId))) {
      setSelectedFlightId(filteredFlights[0].id);
      setSelectedSeat('');
    }
  }, [filteredFlights, selectedFlightId]);

  const handleIssue = async () => {
    if (!selectedFlightId || !passengerName.trim() || !selectedSeat) return;
    
    const flight = flights.find(f => f.id === selectedFlightId);
    const ticket = await issueTicket(selectedFlightId, passengerName.trim(), selectedSeat);
    setIssuedTicket(ticket);
    saveLocalTicket(ticket, flight);
    setSavedTickets(getLocalTickets());
  };

  const selectedFlight = flights.find(f => f.id === selectedFlightId);
  const flightTickets = tickets.filter(t => t.flightId === selectedFlightId);
  const occupiedSeats = new Set(flightTickets.map(t => t.seat));

  const ticketUrl = issuedTicket && selectedFlight ? getTicketUrl(issuedTicket, selectedFlight) : '';

  const handleCopyLink = async () => {
    if (!ticketUrl) return;
    try {
      await navigator.clipboard.writeText(ticketUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-16 print:bg-white print:text-black">
      
      {/* Top Navbar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20 print:hidden shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>出発案内へ戻る</span>
          </button>

          <div className="flex items-center space-x-2">
            <Plane className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-sm text-slate-900">Shibaura Tech Airways</span>
          </div>

          <div>
            {savedTickets.length > 0 && (
              <button
                onClick={() => setShowSavedModal(true)}
                className="text-xs font-medium bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                <span>保存した搭乗券 ({savedTickets.length})</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 space-y-6 print:hidden">
        
        {/* Page Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">搭乗手続き (チェックイン)</h1>
          <p className="text-xs text-slate-500">
            ご搭乗便・お名前・座席をご指定の上、搭乗券を発行してください。
          </p>
        </div>

        {/* Check-in Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-7 shadow-xs">
          
          {/* Step 1: Flight Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                1. ご搭乗便の選択
              </label>

              {availableDates.length > 1 && (
                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>日程絞込:</span>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-white border border-gray-300 text-slate-700 text-xs rounded px-2 py-0.5"
                  >
                    <option value="all">全日程 ({availableFlights.length}便)</option>
                    {availableDates.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <select 
              value={selectedFlightId} 
              onChange={(e) => {
                setSelectedFlightId(e.target.value);
                setSelectedSeat('');
              }}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-slate-800 font-medium text-sm focus:outline-none focus:border-slate-900 transition-colors"
            >
              <option value="" disabled>フライトを選択してください</option>
              {filteredFlights.map(f => (
                <option key={f.id} value={f.id}>
                  【{f.departureDate} {f.departureTime}発】 {f.flightNumber}便 - {f.destination}行（搭乗口: {f.gate}）
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Passenger Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              2. ご搭乗者名
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input 
                type="text" 
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="例: YAMADA TARO"
                className="w-full pl-10 bg-white border border-gray-300 rounded-xl px-4 py-3 text-slate-800 uppercase text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Step 3: Seat Map (2-3-2 with 3 rows) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                3. 座席指定 (2-3-2列)
              </label>
              {selectedSeat && (
                <span className="text-xs font-mono font-bold text-slate-900">
                  選択中: {selectedSeat}席
                </span>
              )}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center">
              {selectedFlightId ? (
                <>
                  <div className="text-[11px] font-bold text-slate-500 mb-3">
                    ▲ 機首方向
                  </div>

                  {/* Seat Map Header: Window / Aisle Indicators */}
                  <div className="flex items-center space-x-2 sm:space-x-3 text-center text-[10px] text-slate-500 mb-2">
                    <div className="w-[72px] sm:w-[88px]">窓側 / A · C</div>
                    <div className="w-5">通路</div>
                    <div className="w-[108px] sm:w-[132px]">中央 / D · E · G</div>
                    <div className="w-5">通路</div>
                    <div className="w-[72px] sm:w-[88px]">窓側 / H · K</div>
                  </div>

                  {/* 3 Rows of 2-3-2 Seats */}
                  <div className="space-y-2.5">
                    {Array.from({ length: ROWS }).map((_, rowIdx) => {
                      const rowNum = rowIdx + 1;
                      return (
                        <div key={`row-${rowNum}`} className="flex items-center space-x-2 sm:space-x-3">
                          {/* Left Block (2 seats: A, C) */}
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                            {LEFT_COLUMNS.map((col) => {
                              const seatId = `${rowNum}${col}`;
                              const isOccupied = occupiedSeats.has(seatId);
                              const isSelected = selectedSeat === seatId;
                              return (
                                <button
                                  key={seatId}
                                  disabled={isOccupied}
                                  onClick={() => setSelectedSeat(seatId)}
                                  className={`w-9 sm:w-10 h-10 sm:h-11 rounded-lg font-mono text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                                    isOccupied 
                                      ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed' 
                                      : isSelected 
                                        ? 'bg-slate-900 text-white font-bold shadow-sm' 
                                        : 'bg-white hover:bg-gray-100 text-slate-800 border border-gray-300'
                                  }`}
                                >
                                  {isOccupied ? '×' : seatId}
                                </button>
                              );
                            })}
                          </div>

                          {/* Aisle 1 (Row Number) */}
                          <div className="w-5 text-center text-xs font-mono font-bold text-slate-500">
                            {rowNum}
                          </div>

                          {/* Center Block (3 seats: D, E, G) */}
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                            {CENTER_COLUMNS.map((col) => {
                              const seatId = `${rowNum}${col}`;
                              const isOccupied = occupiedSeats.has(seatId);
                              const isSelected = selectedSeat === seatId;
                              return (
                                <button
                                  key={seatId}
                                  disabled={isOccupied}
                                  onClick={() => setSelectedSeat(seatId)}
                                  className={`w-9 sm:w-10 h-10 sm:h-11 rounded-lg font-mono text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                                    isOccupied 
                                      ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed' 
                                      : isSelected 
                                        ? 'bg-slate-900 text-white font-bold shadow-sm' 
                                        : 'bg-white hover:bg-gray-100 text-slate-800 border border-gray-300'
                                  }`}
                                >
                                  {isOccupied ? '×' : seatId}
                                </button>
                              );
                            })}
                          </div>

                          {/* Aisle 2 (Row Number) */}
                          <div className="w-5 text-center text-xs font-mono font-bold text-slate-500">
                            {rowNum}
                          </div>

                          {/* Right Block (2 seats: H, K) */}
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                            {RIGHT_COLUMNS.map((col) => {
                              const seatId = `${rowNum}${col}`;
                              const isOccupied = occupiedSeats.has(seatId);
                              const isSelected = selectedSeat === seatId;
                              return (
                                <button
                                  key={seatId}
                                  disabled={isOccupied}
                                  onClick={() => setSelectedSeat(seatId)}
                                  className={`w-9 sm:w-10 h-10 sm:h-11 rounded-lg font-mono text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                                    isOccupied 
                                      ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed' 
                                      : isSelected 
                                        ? 'bg-slate-900 text-white font-bold shadow-sm' 
                                        : 'bg-white hover:bg-gray-100 text-slate-800 border border-gray-300'
                                  }`}
                                >
                                  {isOccupied ? '×' : seatId}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center space-x-6 mt-6 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5 bg-white border border-gray-300 rounded"></div>
                      <span>空席</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5 bg-slate-900 rounded"></div>
                      <span>選択中</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5 bg-gray-200 border border-gray-300 rounded flex items-center justify-center text-[9px] text-gray-500">×</div>
                      <span>指定済</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 text-xs py-8">
                  便を選択すると座席マップが表示されます
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleIssue}
            disabled={!selectedFlightId || !passengerName.trim() || !selectedSeat}
            className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            <TicketIcon className="w-4 h-4" />
            <span>搭乗券を発行する</span>
          </button>

        </div>

      </main>

      {/* Completion Modal */}
      {issuedTicket && selectedFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white text-slate-900 border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl print:p-0 print:border-none print:shadow-none">
            
            {/* Modal Actions Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-4 print:hidden">
              <div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">搭乗券を発行しました</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  スマートフォンのカメラでQRコードを読み取ると、搭乗券を保存・表示できます。
                </p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>印刷 / 保存</span>
                </button>
                <button 
                  onClick={() => {
                    setIssuedTicket(null);
                    setPassengerName('');
                    setSelectedSeat('');
                    navigate('/');
                  }}
                  className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  完了（出発案内へ）
                </button>
              </div>
            </div>

            {/* Smartphone QR Scan Banner */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 print:hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2.5 rounded-lg border border-gray-300 flex-shrink-0">
                  <QRCodeSVG 
                    value={ticketUrl} 
                    size={110} 
                    level="M" 
                    includeMargin={false}
                  />
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-center sm:justify-start gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>スマートフォン用搭乗券</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedFlight.departureDate} {selectedFlight.departureTime}発 • {selectedFlight.flightNumber}便 • {issuedTicket.seat}席 {issuedTicket.passengerName} 様
                  </h3>
                  <p className="text-xs text-slate-500">
                    QRコードをスキャンすると、この端末やスマートフォンに搭乗情報が保存されます。
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button 
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2 bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'URLをコピーしました' : 'URLをコピー'}</span>
                </button>
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>搭乗券画面を開く</span>
                </a>
              </div>
            </div>

            {/* Printable Pass Container */}
            <div className="print:block w-full flex justify-center">
              <BoardingPass ticket={issuedTicket} flight={selectedFlight} />
            </div>

          </div>
        </div>
      )}

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
              このブラウザで発行した搭乗券の履歴です。
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
