import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/useStore';
import { 
  PlaneTakeoff, 
  User, 
  LogOut, 
  Ticket as TicketIcon, 
  AlertCircle, 
  LayoutGrid, 
  Users, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  ExternalLink,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { Ticket } from '../lib/firebase';
import BoardingPass from './BoardingPass';
import AddFlightForm from './AddFlightForm';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getTicketUrl, saveLocalTicket } from '../lib/ticketUrl';

const COLUMNS = ['A', 'B', 'C', 'D'];
const ROWS = 6;

interface StaffTicketingProps {
  onLogout: () => void;
}

export default function StaffTicketing({ onLogout }: StaffTicketingProps) {
  const { 
    flights, 
    tickets, 
    issueTicket, 
    deleteTicket, 
    clearAllTickets, 
    updateStatus, 
    deleteFlight,
    resetData,
    isFirebaseConfigured 
  } = useStore();

  const [selectedFlightId, setSelectedFlightId] = useState<string>('');
  const [passengerName, setPassengerName] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);
  const [previewFlight, setPreviewFlight] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'issue' | 'manage' | 'passengers'>('issue');
  const [copied, setCopied] = useState<boolean>(false);
  const [filterFlightId, setFilterFlightId] = useState<string>('all');
  const [filterManageDate, setFilterManageDate] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  // Sort flights by date then time
  const sortedFlights = [...flights].sort((a, b) => {
    const cmpDate = a.departureDate.localeCompare(b.departureDate);
    if (cmpDate !== 0) return cmpDate;
    return a.departureTime.localeCompare(b.departureTime);
  });

  const availableDates = Array.from(new Set(flights.map(f => f.departureDate)));

  useEffect(() => {
    if (sortedFlights.length > 0 && !selectedFlightId) {
      setSelectedFlightId(sortedFlights[0].id);
    }
  }, [sortedFlights, selectedFlightId]);

  const handleIssue = async () => {
    if (!selectedFlightId || !passengerName.trim() || !selectedSeat) return;
    
    const flight = flights.find(f => f.id === selectedFlightId);
    const ticket = await issueTicket(selectedFlightId, passengerName.trim(), selectedSeat);
    setIssuedTicket(ticket);
    setPreviewFlight(flight || null);
    if (flight) {
      saveLocalTicket(ticket, flight);
    }
  };

  const handleShowExistingTicket = (t: Ticket) => {
    const flight = flights.find(f => f.id === t.flightId);
    if (flight) {
      setPreviewFlight(flight);
      setIssuedTicket(t);
    }
  };

  const handleDeleteTicket = async (ticketId: string, name: string) => {
    if (window.confirm(`「${name}」様の予約チケットを削除しますか？`)) {
      await deleteTicket(ticketId);
    }
  };

  const handleClearAllTickets = async () => {
    if (window.confirm('【確認】現在作成されているすべてのダミー予約・チケットデータを一括削除しますか？この操作は取り消せません。')) {
      await clearAllTickets();
      alert('すべての予約チケットを消去しました。');
    }
  };

  const handleDeleteFlight = async (flightId: string, flightNumber: string) => {
    if (window.confirm(`便名「${flightNumber}」を削除しますか？関連する予約も消去されます。`)) {
      await deleteFlight(flightId);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('日時付きの初期サンプルデータにリセットしますか？（現在のテストデータは消去されます）')) {
      await resetData();
      alert('初期データにリセットしました。');
    }
  };

  const handleSignOut = () => {
    onLogout();
    navigate('/login');
  };

  const selectedFlight = flights.find(f => f.id === selectedFlightId);
  const flightTickets = tickets.filter(t => t.flightId === selectedFlightId);
  const occupiedSeats = new Set(flightTickets.map(t => t.seat));

  const modalTicketUrl = issuedTicket && (previewFlight || selectedFlight) 
    ? getTicketUrl(issuedTicket, previewFlight || selectedFlight) 
    : '';

  const handleCopyModalUrl = async () => {
    if (!modalTicketUrl) return;
    try {
      await navigator.clipboard.writeText(modalTicketUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered tickets for the passenger list
  const filteredTickets = tickets.filter(t => {
    const matchesFlight = filterFlightId === 'all' || t.flightId === filterFlightId;
    const matchesSearch = !searchTerm.trim() || 
      t.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.seat.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFlight && matchesSearch;
  });

  // Filter flights in management tab
  const displayedManageFlights = sortedFlights.filter(f => {
    if (filterManageDate === 'all') return true;
    return f.departureDate === filterManageDate;
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-12">
      <div className="bg-blue-900 text-white shadow-md print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PlaneTakeoff className="w-6 h-6 text-blue-300" />
            <span className="font-semibold tracking-wide text-lg">運行管理ポータル</span>
          </div>
          <div className="flex items-center space-x-6">
            {!isFirebaseConfigured && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 rounded-full text-xs font-medium flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>シミュレーション（ローカル保存）</span>
              </span>
            )}
            <button 
              onClick={handleSignOut}
              className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2 text-sm font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 print:hidden">
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('issue')}
              className={`${
                activeTab === 'issue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 cursor-pointer`}
            >
              <TicketIcon className="w-4 h-4" />
              <span>チケット発券</span>
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 cursor-pointer`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>フライト管理（日時別）</span>
            </button>
            <button
              onClick={() => setActiveTab('passengers')}
              className={`${
                activeTab === 'passengers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 cursor-pointer`}
            >
              <Users className="w-4 h-4" />
              <span>予約者リスト ({tickets.length})</span>
            </button>
          </nav>
        </div>

        {activeTab === 'issue' ? (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">発券システム（全日程対応）</h1>
              <p className="text-gray-500 text-sm mt-1">
                搭乗日・フライトと座席を選択し、搭乗券を発券してください。QRコードでスマホ連携可能です。
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Section */}
              <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">フライト選択（搭乗日・時刻）</label>
                  <select 
                    value={selectedFlightId} 
                    onChange={(e) => {
                      setSelectedFlightId(e.target.value);
                      setSelectedSeat('');
                    }}
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium"
                  >
                    {sortedFlights.map(f => (
                      <option key={f.id} value={f.id}>
                        【{f.departureDate} {f.departureTime}発】 {f.flightNumber} - {f.destination}
                      </option>
                    ))}
                  </select>

                  {selectedFlight && (
                    <div className="text-xs text-blue-800 bg-blue-50 p-2.5 rounded border border-blue-100 mt-1">
                      📅 <strong>{selectedFlight.departureDate} {selectedFlight.departureTime}発</strong> / 行先: {selectedFlight.destination}（搭乗口: {selectedFlight.gate}）
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">搭乗者氏名</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="e.g. TARO YAMADA"
                      className="w-full pl-10 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder:text-gray-400 placeholder:normal-case"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleIssue}
                    disabled={!selectedFlightId || !passengerName.trim() || !selectedSeat}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500 text-white font-medium py-2.5 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <TicketIcon className="w-5 h-5" />
                    <span>搭乗券を発券（QRコード生成）</span>
                  </button>
                </div>
              </div>

              {/* Seat Map Section */}
              <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                <h2 className="text-sm font-medium text-gray-700 self-start mb-6">座席選択マップ</h2>
                
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-200 rounded-b-xl border border-t-0 border-gray-300"></div>
                  
                  <div className="flex space-x-10 mt-2">
                    {/* Left Columns */}
                    <div className="grid grid-cols-2 gap-3">
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
                                className={`w-12 h-14 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-colors focus:outline-none cursor-pointer
                                  ${isOccupied ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed' : 
                                    isSelected ? 'bg-blue-900 text-white shadow-md' : 
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
                    <div className="w-6 flex flex-col items-center justify-between py-2">
                      {Array.from({ length: ROWS }).map((_, i) => (
                        <div key={`aisle-${i}`} className="text-xs text-gray-400 font-medium">{i + 1}</div>
                      ))}
                    </div>

                    {/* Right Columns */}
                    <div className="grid grid-cols-2 gap-3">
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
                                className={`w-12 h-14 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-colors focus:outline-none cursor-pointer
                                  ${isOccupied ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed' : 
                                    isSelected ? 'bg-blue-900 text-white shadow-md' : 
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
                </div>
                
                <div className="flex space-x-8 mt-8 text-sm text-gray-600">
                  <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div><span>空席</span></div>
                  <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-900 rounded-sm"></div><span>選択中</span></div>
                  <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm flex items-center justify-center text-[10px] text-gray-400 font-bold">×</div><span>満席</span></div>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'manage' ? (
          <div className="space-y-8">
            <AddFlightForm onSuccess={() => setActiveTab('issue')} />
            
            {/* Display flights list to change status */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">登録済みフライト一覧</h2>
                  <p className="text-xs text-gray-500">日付・時刻ごとの運行情報ステータス変更や便の削除が行えます。</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Date Filter */}
                  {availableDates.length > 0 && (
                    <div className="flex items-center space-x-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <select 
                        value={filterManageDate}
                        onChange={(e) => setFilterManageDate(e.target.value)}
                        className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-gray-800 font-medium"
                      >
                        <option value="all">全日程を表示 ({sortedFlights.length}便)</option>
                        {availableDates.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!isFirebaseConfigured && (
                    <button
                      onClick={handleResetData}
                      className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>初期データに戻す</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出発日</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時刻</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">便名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">行先</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">搭乗口</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状況</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayedManageFlights.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 font-mono">
                          {f.departureDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">
                          {f.departureTime}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-900 font-mono">
                          {f.flightNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{f.destination}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{f.gate}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                             ${f.status === 'Boarding' ? 'bg-green-100 text-green-800' : 
                               f.status === 'Delayed' ? 'bg-red-100 text-red-800' : 
                               f.status === 'Departed' ? 'bg-gray-100 text-gray-800' : 
                               'bg-blue-100 text-blue-800'}`}>
                             {f.status}
                           </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 flex items-center space-x-3">
                          <select 
                            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={f.status}
                            onChange={(e) => updateStatus(f.id, e.target.value as any)}
                          >
                            <option value="Scheduled">定刻</option>
                            <option value="Boarding">搭乗中</option>
                            <option value="Departed">出発済</option>
                            <option value="Delayed">遅延</option>
                          </select>
                          <button 
                            onClick={() => handleDeleteFlight(f.id, f.flightNumber)}
                            className="text-gray-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                            title="この便を削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {displayedManageFlights.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                          該当するフライトはありません。上部のフォームから新規登録してください。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">予約者リスト・搭乗券管理</h1>
                <p className="text-gray-500 text-sm mt-1">フライトごとの予約者を確認、搭乗券の再表示・QR再確認、予約取消が可能です。</p>
              </div>

              {/* Clear All Dummy Data Button */}
              {tickets.length > 0 && (
                <button
                  onClick={handleClearAllTickets}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>ダミー予約を一括削除 ({tickets.length}件)</span>
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">フライト絞り込み</label>
                  <select 
                    value={filterFlightId} 
                    onChange={(e) => setFilterFlightId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="all">全便の予約者を表示 ({tickets.length}件)</option>
                    {sortedFlights.map(f => {
                      const count = tickets.filter(t => t.flightId === f.id).length;
                      return (
                        <option key={f.id} value={f.id}>
                          【{f.departureDate} {f.departureTime}】 {f.flightNumber} - {f.destination} ({count}名)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">氏名・座席で検索</label>
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="氏名や座席番号を入力..."
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Tickets Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">搭乗日時</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">便名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">座席</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">搭乗者氏名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">発券日時</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">搭乗券 / 操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTickets.length > 0 ? (
                      [...filteredTickets]
                        .sort((a, b) => b.issuedAt - a.issuedAt)
                        .map((t) => {
                          const fl = flights.find(f => f.id === t.flightId);
                          return (
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-700">
                                {fl ? `${fl.departureDate} ${fl.departureTime}` : '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-900 font-mono">
                                {fl?.flightNumber || '不明便'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">
                                <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{t.seat}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                {t.passengerName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                {new Date(t.issuedAt).toLocaleString('ja-JP')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-2">
                                <button
                                  onClick={() => handleShowExistingTicket(t)}
                                  className="inline-flex items-center space-x-1 text-xs bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                                  title="QRコード・搭乗券を表示"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>搭乗券 / QR</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTicket(t.id, t.passengerName)}
                                  className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="予約を削除"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>削除</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                          {tickets.length === 0 ? '現在、予約されたチケットはありません。' : '条件に合致する予約者は見つかりませんでした。'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Preview Modal */}
      {issuedTicket && (previewFlight || selectedFlight) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-5xl overflow-auto max-h-[92vh] print:p-0 print:shadow-none print:overflow-visible">
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 print:hidden border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">搭乗券の発行・確認</h2>
                <p className="text-sm text-gray-500 mt-0.5">来場者のスマートフォンでQRコードを読み取っていただくか、印刷してお渡しください。</p>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none bg-blue-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm text-sm cursor-pointer"
                >
                  チケットを印刷
                </button>
                <button 
                  onClick={() => {
                    setIssuedTicket(null);
                    setPreviewFlight(null);
                    setPassengerName('');
                    setSelectedSeat('');
                  }}
                  className="flex-1 sm:flex-none bg-gray-100 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </div>

            {/* Smartphone QR Code Scan Section */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-white p-3 rounded-xl border border-sky-200 shadow-md flex-shrink-0">
                  <QRCodeSVG 
                    value={modalTicketUrl} 
                    size={140} 
                    level="M" 
                    includeMargin={false}
                  />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded-full shadow-xs">
                    <Smartphone className="w-3.5 h-3.5" />
                    来場者向け スマホQRコード読み取り
                  </div>
                  <h3 className="text-xl font-black text-gray-900">
                    {(previewFlight || selectedFlight)?.departureDate} {(previewFlight || selectedFlight)?.departureTime}発 • {(previewFlight || selectedFlight)?.flightNumber}便 • {issuedTicket.seat}席 {issuedTicket.passengerName} 様
                  </h3>
                  <p className="text-sm text-gray-600 max-w-lg leading-relaxed">
                    来場者のスマホカメラで上記QRコードを読み取っていただくと、便情報・座席・運航状況がスマホ上に保存され、後からでもいつでも確認できます。
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 w-full md:w-auto">
                <button 
                  onClick={handleCopyModalUrl}
                  className="w-full px-5 py-2.5 bg-white border border-gray-300 text-gray-800 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-gray-500" />}
                  <span>{copied ? 'URLをコピーしました！' : '搭乗券URLをコピー'}</span>
                </button>
                <a
                  href={modalTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>別タブで搭乗券を開く</span>
                </a>
              </div>
            </div>
            
            <div className="print:block w-full flex justify-center">
              <BoardingPass ticket={issuedTicket} flight={previewFlight || selectedFlight!} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
