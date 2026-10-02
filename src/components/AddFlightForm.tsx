import React, { useState } from 'react';
import { Plane, Plus, Trash2, Check } from 'lucide-react';
import { useStore } from '../lib/useStore';
import { getTodayDateStr, getTomorrowDateStr } from '../lib/mockStore';

interface AddFlightFormProps {
  onSuccess: () => void;
}

interface BulkFlightItem {
  id: string;
  flightNumber: string;
  destination: string;
  departureTime: string;
  gate: string;
}

export default function AddFlightForm({ onSuccess }: AddFlightFormProps) {
  const { addFlight, addFlights } = useStore();
  const [mode, setMode] = useState<'bulk' | 'single'>('bulk');

  // Single mode state
  const [singleFlightNumber, setSingleFlightNumber] = useState('');
  const [singleDestination, setSingleDestination] = useState('');
  const [singleDepartureDate, setSingleDepartureDate] = useState(getTodayDateStr());
  const [singleDepartureTime, setSingleDepartureTime] = useState('');
  const [singleGate, setSingleGate] = useState('');

  // Bulk mode state
  const [bulkDate, setBulkDate] = useState(getTodayDateStr());
  const [bulkRows, setBulkRows] = useState<BulkFlightItem[]>([
    { id: '1', flightNumber: '', destination: '', departureTime: '', gate: '' },
    { id: '2', flightNumber: '', destination: '', departureTime: '', gate: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  // Handle Single flight submit
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFlightNumber || !singleDestination || !singleDepartureDate || !singleDepartureTime || !singleGate) return;
    
    setIsSubmitting(true);
    try {
      await addFlight({
        flightNumber: singleFlightNumber.toUpperCase().trim(),
        destination: singleDestination.trim(),
        departureDate: singleDepartureDate,
        departureTime: singleDepartureTime,
        gate: singleGate.toUpperCase().trim(),
        status: 'Scheduled',
      });
      
      setSingleFlightNumber('');
      setSingleDestination('');
      setSingleDepartureTime('');
      setSingleGate('');
      showFeedback('1便の登録が完了しました。');
      onSuccess();
    } catch (error) {
      console.error("Failed to add flight", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add an empty row in bulk mode
  const handleAddRow = () => {
    setBulkRows([
      ...bulkRows,
      {
        id: Math.random().toString(36).substr(2, 9),
        flightNumber: '',
        destination: '',
        departureTime: '',
        gate: ''
      }
    ]);
  };

  // Update a row in bulk mode
  const handleUpdateRow = (id: string, field: keyof BulkFlightItem, val: string) => {
    setBulkRows(bulkRows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: val };
      }
      return row;
    }));
  };

  // Delete a row in bulk mode
  const handleDeleteRow = (id: string) => {
    setBulkRows(bulkRows.filter(row => row.id !== id));
  };

  // Submit bulk flights
  const handleBulkSubmit = async () => {
    // Validate rows
    const validRows = bulkRows.filter(r => 
      r.flightNumber.trim() && 
      r.destination.trim() && 
      r.departureTime.trim() && 
      r.gate.trim()
    );

    if (validRows.length === 0) {
      alert('有効なフライト情報を最低1便入力してください（便名・行先・時刻・搭乗口が必要です）。');
      return;
    }

    setIsSubmitting(true);
    try {
      const flightPayloads = validRows.map(r => ({
        flightNumber: r.flightNumber.toUpperCase().trim(),
        destination: r.destination.trim(),
        departureDate: bulkDate,
        departureTime: r.departureTime.trim(),
        gate: r.gate.toUpperCase().trim(),
        status: 'Scheduled' as const,
      }));

      await addFlights(flightPayloads);
      showFeedback(`${validRows.length}便の一括登録が完了しました。`);
      // Reset bulk rows to two fresh blank rows
      setBulkRows([
        { id: Math.random().toString(36).substr(2, 9), flightNumber: '', destination: '', departureTime: '', gate: '' },
        { id: Math.random().toString(36).substr(2, 9), flightNumber: '', destination: '', departureTime: '', gate: '' },
      ]);
      onSuccess();
    } catch (e) {
      console.error(e);
      alert('フライトの一括登録中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5 shadow-xs">
      
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center space-x-2">
          <Plane className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-900">
            フライト登録
          </h2>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 self-start sm:self-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              mode === 'bulk'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            複数便を一括追加
          </button>
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              mode === 'single'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            個別入力 (1便)
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* MODE 1: BULK ADD (複数便一括追加) */}
      {mode === 'bulk' ? (
        <div className="space-y-4">
          
          {/* Top Bar: Target Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700">登録対象日:</span>
              <button
                type="button"
                onClick={() => setBulkDate(todayStr)}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                  bulkDate === todayStr 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                本日 ({todayStr})
              </button>
              <button
                type="button"
                onClick={() => setBulkDate(tomorrowStr)}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                  bulkDate === tomorrowStr 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                明日 ({tomorrowStr})
              </button>
              <input
                type="date"
                value={bulkDate}
                onChange={(e) => {
                  if (e.target.value) setBulkDate(e.target.value);
                }}
                className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-slate-800 font-mono"
              />
            </div>

            <div className="text-slate-500 text-[11px]">
              入力中の便数: <strong className="text-slate-800 font-mono font-bold">{bulkRows.length}</strong>便
            </div>

          </div>

          {/* Bulk Rows Table */}
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-slate-600 text-[11px] font-bold">
                <tr>
                  <th className="px-3 py-2 text-center w-12">#</th>
                  <th className="px-3 py-2 text-left">便名</th>
                  <th className="px-3 py-2 text-left">行先</th>
                  <th className="px-3 py-2 text-left w-36">出発時刻</th>
                  <th className="px-3 py-2 text-left w-28">搭乗口</th>
                  <th className="px-3 py-2 text-center w-12">削除</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {bulkRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={row.flightNumber}
                        onChange={(e) => handleUpdateRow(row.id, 'flightNumber', e.target.value.toUpperCase())}
                        placeholder="例: STA-101"
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900 uppercase placeholder:text-slate-400"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={row.destination}
                        onChange={(e) => handleUpdateRow(row.id, 'destination', e.target.value)}
                        placeholder="例: 大阪（伊丹）"
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-slate-900 placeholder:text-slate-400"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="time"
                        value={row.departureTime}
                        onChange={(e) => handleUpdateRow(row.id, 'departureTime', e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={row.gate}
                        onChange={(e) => handleUpdateRow(row.id, 'gate', e.target.value.toUpperCase())}
                        placeholder="例: A1"
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900 uppercase placeholder:text-slate-400"
                      />
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="この行を削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {bulkRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      フライトがありません。「＋ 行を追加」を押してフライトを入力してください。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center space-x-1.5 text-xs text-slate-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>行を追加</span>
              </button>

              {bulkRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBulkRows([])}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 cursor-pointer"
                >
                  すべてクリア
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={isSubmitting || bulkRows.length === 0}
              onClick={handleBulkSubmit}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 py-2 px-6 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '登録中...' : `${bulkRows.length}便を一括登録する`}</span>
            </button>
          </div>

        </div>
      ) : (
        /* MODE 2: SINGLE FLIGHT (1便ずつ個別入力) */
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">便名</label>
              <input 
                type="text" 
                required
                value={singleFlightNumber}
                onChange={(e) => setSingleFlightNumber(e.target.value)}
                placeholder="例: STA-101"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900 uppercase placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">行先</label>
              <input 
                type="text" 
                required
                value={singleDestination}
                onChange={(e) => setSingleDestination(e.target.value)}
                placeholder="例: 大阪（伊丹）"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">出発日</label>
              <input 
                type="date" 
                required
                value={singleDepartureDate}
                onChange={(e) => setSingleDepartureDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">出発時刻</label>
              <input 
                type="time" 
                required
                value={singleDepartureTime}
                onChange={(e) => setSingleDepartureTime(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">搭乗口</label>
              <input 
                type="text" 
                required
                value={singleGate}
                onChange={(e) => setSingleGate(e.target.value)}
                placeholder="例: A1"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900 uppercase placeholder:text-slate-400"
              />
            </div>

          </div>
          
          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting || !singleFlightNumber || !singleDestination || !singleDepartureDate || !singleDepartureTime || !singleGate}
              className="flex items-center space-x-1.5 py-2 px-5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              <span>{isSubmitting ? '登録中...' : 'フライトを登録する'}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
