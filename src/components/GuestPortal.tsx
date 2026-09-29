import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/useStore';
import { 
  PlaneTakeoff, 
  User, 
  Ticket as TicketIcon, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  ExternalLink,
  Bookmark,
  X,
  Calendar
} from 'lucide-react';
import { Ticket } from '../lib/firebase';
import BoardingPass from './BoardingPass';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getTicketUrl, saveLocalTicket, getLocalTickets, TicketPayload } from '../lib/ticketUrl';

const COLUMNS = ['A', 'B', 'C', 'D'];
const ROWS = 6;

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

  // Extract unique available dates
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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12">
      <div className="bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <PlaneTakeoff className="w-6 h-6 text-blue-600" />
            <span className="font-bold tracking-wide text-lg text-blue-900">SHIBAURA TECH AIRWAYS</span>
          </div>
          <div className="flex items-center space-x-4">
            {savedTickets.length > 0 && (
              <button
                onClick={() => setShowSavedModal(true)}
                className="text-xs sm:text-sm font-medium bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-sky-600" />
                <span>保存済みの搭乗券 ({savedTickets.length})</span>
              </button>
            )}
            <button 
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
            >
              出発案内へ戻る
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 print:hidden">
        
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">オンラインチェックイン・搭乗券発行</h1>
          <p className="text-gray-500 mt-2">
            ご希望の日時・フライトと座席を選択し、搭乗券を発行してください。（全日程の便を事前予約・発券可能です）
          </p>
        </header>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="space-y-8">
            {/* Step 1: Flight */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                  フライト選択（日時指定）
                </h2>

                {/* Optional Date filter */}
                {availableDates.length > 1 && (
                  <div className="flex items-center space-x-2 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500">日付絞り込み:</span>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-800 font-medium"
                    >
                      <option value="all">全日程を表示 ({availableFlights.length}便)</option>
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
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              >
                <option value="" disabled>フライトを選択してください</option>
                {filteredFlights.map(f => (
                  <option key={f.id} value={f.id}>
                    【{f.departureDate} {f.departureTime}発】 {f.flightNumber}便 - {f.destination}行 (搭乗口:{f.gate})
                  </option>
                ))}
              </select>

              {selectedFlight && (
                <div className="mt-2 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center justify-between border border-blue-100">
                  <span>
                    📅 搭乗日時: <strong>{selectedFlight.departureDate} {selectedFlight.departureTime}発</strong> （{selectedFlight.destination}行）
                  </span>
                  <span>搭乗口: <strong>{selectedFlight.gate}</strong></span>
                </div>
              )}
            </div>

            {/* Step 2: Name */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                搭乗者情報
              </h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="お名前（例: TARO YAMADA）"
                  className="w-full pl-12 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors placeholder:text-gray-400 placeholder:normal-case"
                />
              </div>
            </div>

            {/* Step 3: Seat */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                座席選択
              </h2>
              
              <div className="bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-200 relative flex flex-col items-center">
                {selectedFlightId ? (
                  <>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-200 rounded-b-xl border border-t-0 border-gray-300"></div>
                    
                    <div className="flex space-x-6 sm:space-x-10 mt-2">
                      {/* Left Columns */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {Array.from({ length: ROWS }).map((_, rowIdx) => (
                          <React.Fragment key={`left-${rowIdx}`}>
                            {COLUMNS.slice(0, 2).map((col) => {
                              const seatId = `${rowIdx + 1}${col}`;
                              const isOccupied = occupiedSeats.has(seatId);
                              const isSelected = selectedSeat === seatId;
                              return (
                                <button
                                  key={seatId}
                                  disabled={isOccupied}
                                  onClick={() => setSelectedSeat(seatId)}
                                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-all focus:outline-none cursor-pointer
                                    ${isOccupied ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-60' : 
                                      isSelected ? 'bg-blue-600 text-white shadow-md transform scale-105' : 
                                      'bg-white text-gray-600 border border-gray-300 hover:border-blue-500 hover:text-blue-600'}`}
                                >
                                  {isOccupied ? '×' : seatId}
                                </button>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Aisle */}
                      <div className="w-4 sm:w-6 flex flex-col items-center justify-between py-2">
                        {Array.from({ length: ROWS }).map((_, i) => (
                          <div key={`aisle-${i}`} className="text-xs text-gray-400 font-medium">{i + 1}</div>
                        ))}
                      </div>

                      {/* Right Columns */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {Array.from({ length: ROWS }).map((_, rowIdx) => (
                          <React.Fragment key={`right-${rowIdx}`}>
                            {COLUMNS.slice(2, 4).map((col) => {
                              const seatId = `${rowIdx + 1}${col}`;
                              const isOccupied = occupiedSeats.has(seatId);
                              const isSelected = selectedSeat === seatId;
                              return (
                                <button
                                  key={seatId}
                                  disabled={isOccupied}
                                  onClick={() => setSelectedSeat(seatId)}
                                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-all focus:outline-none cursor-pointer
                                    ${isOccupied ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-60' : 
                                      isSelected ? 'bg-blue-600 text-white shadow-md transform scale-105' : 
                                      'bg-white text-gray-600 border border-gray-300 hover:border-blue-500 hover:text-blue-600'}`}
                                >
                                  {isOccupied ? '×' : seatId}
                                </button>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-6 sm:space-x-8 mt-8 text-sm text-gray-600">
                      <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div><span>空席</span></div>
                      <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-600 rounded-sm"></div><span>選択中</span></div>
                      <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm flex items-center justify-center text-[10px] text-gray-400 font-bold">×</div><span>満席</span></div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-12">
                    フライトを選択すると座席マップが表示されます
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={handleIssue}
                disabled={!selectedFlightId || !passengerName.trim() || !selectedSeat}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 cursor-pointer disabled:cursor-not-allowed"
              >
                <TicketIcon className="w-6 h-6" />
                <span className="text-lg">搭乗券を発行する（QRコード付）</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Preview Modal */}
      {issuedTicket && selectedFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-5xl overflow-auto max-h-[92vh] print:p-0 print:shadow-none print:overflow-visible">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 print:hidden border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">搭乗券の発行が完了しました！</h2>
                <p className="text-sm text-gray-500 mt-0.5">スマホでQRコードを読み取れば、後からでも便情報をご確認いただけます。</p>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm cursor-pointer"
                >
                  印刷 / PDF保存
                </button>
                <button 
                  onClick={() => {
                    setIssuedTicket(null);
                    setPassengerName('');
                    setSelectedSeat('');
                    navigate('/');
                  }}
                  className="flex-1 sm:flex-none bg-gray-100 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm cursor-pointer"
                >
                  完了（出発案内へ）
                </button>
              </div>
            </div>

            {/* Smartphone QR Code Callout */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-white p-3 rounded-xl border border-sky-200 shadow-md flex-shrink-0">
                  <QRCodeSVG 
                    value={ticketUrl} 
                    size={140} 
                    level="M" 
                    includeMargin={false}
                  />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded-full shadow-xs">
                    <Smartphone className="w-3.5 h-3.5" />
                    スマホで持ち歩く（QRスキャン）
                  </div>
                  <h3 className="text-xl font-black text-gray-900">
                    {selectedFlight.departureDate} {selectedFlight.departureTime}発 • {selectedFlight.flightNumber}便 • {issuedTicket.seat}席 {issuedTicket.passengerName} 様
                  </h3>
                  <p className="text-sm text-gray-600 max-w-lg leading-relaxed">
                    スマホカメラで上記QRコードをかざすと、この搭乗券サイトが開き、便の運行状況や座席情報が保存されます。タブを閉じても安心です！
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 w-full md:w-auto">
                <button 
                  onClick={handleCopyLink}
                  className="w-full px-5 py-2.5 bg-white border border-gray-300 text-gray-800 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-gray-500" />}
                  <span>{copied ? 'URLをコピーしました！' : '搭乗券URLをコピー'}</span>
                </button>
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>スマホ用画面を開く</span>
                </a>
              </div>
            </div>
            
            {/* Printable Boarding Pass */}
            <div className="print:block w-full flex justify-center">
              <BoardingPass ticket={issuedTicket} flight={selectedFlight} />
            </div>
          </div>
        </div>
      )}

      {/* Saved Tickets Drawer/Modal */}
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
              このブラウザで発行・表示した搭乗券の履歴です。クリックするといつでも再表示できます。
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
