import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/useStore';
import { PlaneTakeoff, User, Ticket as TicketIcon } from 'lucide-react';
import { Ticket } from '../lib/firebase';
import BoardingPass from './BoardingPass';
import { useNavigate } from 'react-router-dom';

const COLUMNS = ['A', 'B', 'C', 'D'];
const ROWS = 6;

export default function GuestPortal() {
  const { flights, tickets, issueTicket } = useStore();
  const [selectedFlightId, setSelectedFlightId] = useState<string>('');
  const [passengerName, setPassengerName] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (flights.length > 0 && !selectedFlightId) {
      // 予約可能な（出発済みではない）フライトを初期選択
      const availableFlights = flights.filter(f => f.status !== 'Departed');
      if (availableFlights.length > 0) {
        setSelectedFlightId(availableFlights[0].id);
      } else {
        setSelectedFlightId(flights[0].id);
      }
    }
  }, [flights, selectedFlightId]);

  const handleIssue = async () => {
    if (!selectedFlightId || !passengerName.trim() || !selectedSeat) return;
    
    const ticket = await issueTicket(selectedFlightId, passengerName.trim(), selectedSeat);
    setIssuedTicket(ticket);
  };

  const selectedFlight = flights.find(f => f.id === selectedFlightId);
  const flightTickets = tickets.filter(t => t.flightId === selectedFlightId);
  const occupiedSeats = new Set(flightTickets.map(t => t.seat));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12">
      <div className="bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <PlaneTakeoff className="w-6 h-6 text-blue-600" />
            <span className="font-bold tracking-wide text-lg text-blue-900">Shibaura Tech Airways</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            出発案内へ戻る
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 print:hidden">
        
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">オンラインチェックイン</h1>
          <p className="text-gray-500 mt-2">ご希望のフライトと座席を選択し、搭乗券を発行してください。<br />送信されたデータは暗号化されます。利用されることはありません。</p>
        </header>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="space-y-8">
            {/* Step 1: Flight */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                フライト選択
              </h2>
              <select 
                value={selectedFlightId} 
                onChange={(e) => {
                  setSelectedFlightId(e.target.value);
                  setSelectedSeat('');
                }}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              >
                <option value="" disabled>フライトを選択してください</option>
                {flights.filter(f => f.status !== 'Departed').map(f => (
                  <option key={f.id} value={f.id}>{f.flightNumber} - {f.destination} ({f.departureTime})</option>
                ))}
              </select>
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
                                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-all focus:outline-none
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
                                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-all focus:outline-none
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
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                <TicketIcon className="w-6 h-6" />
                <span className="text-lg">搭乗券を発行する</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Preview Modal */}
      {issuedTicket && selectedFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-5xl overflow-auto max-h-[90vh] print:p-0 print:shadow-none print:overflow-visible">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 print:hidden">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">搭乗券の発行が完了しました！</h2>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  印刷 / 保存
                </button>
                <button 
                  onClick={() => {
                    setIssuedTicket(null);
                    setPassengerName('');
                    setSelectedSeat('');
                    navigate('/'); // ホームに戻る
                  }}
                  className="flex-1 sm:flex-none bg-gray-100 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  完了
                </button>
              </div>
            </div>
            
            <div className="print:block w-full flex justify-center">
              <BoardingPass ticket={issuedTicket} flight={selectedFlight} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
