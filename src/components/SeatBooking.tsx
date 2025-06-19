import React, { useEffect, useState } from "react";
import { Info, Loader2, Armchair, Star, Users } from "lucide-react"; // <-- Aggiunta Armchair
import { fetchOccupiedSeats } from "../api";
import { ProgrammazioneItem } from "../types";

interface SeatBookingProps {
  selectedSeats: string[];
  onSelectSeats: (seats: string[]) => void;
  onProceedToCheckout: () => void;
  movieId: number;
  showtime: string;
}

// Layout dei posti (invariato)
const seatLayout: { [key: string]: number[] } = {
  O: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  N: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  M: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  L: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  I: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  H: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  G: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  F: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  E: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  D: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  C: [1, 2, 3, 14, 15, 16],
  B: [1, 2, 3, 14, 15, 16],
  A: [1, 2, 16],
};

const rows = ["O", "N", "M", "L", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
const totalCols = Array.from({ length: 16 }, (_, i) => i + 1);

// --- Componenti Ausiliari ---
const Loader = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <Loader2 className="animate-spin h-16 w-16 text-[#ebdaa8]" />
    <p className="mt-4 text-lg">Caricamento posti...</p>
  </div>
);

// NUOVO Componente per la singola Poltrona per pulire il codice
const Seat: React.FC<{
  status: "available" | "selected" | "occupied";
  onClick: () => void;
  seatId: string;
}> = ({ status, onClick, seatId }) => {
  const statusClasses = {
    available: "text-gray-500 hover:text-[#ebdaa8] cursor-pointer",
    selected: "text-[#ebdaa8] drop-shadow-[0_1px_3px_rgba(235,218,168,0.7)]",
    occupied: "text-red-800/60 cursor-not-allowed",
  };

  return (
    <button
      type="button"
      aria-label={`Posto ${seatId} - ${status}`}
      onClick={onClick}
      disabled={status === "occupied"}
      className="transition-transform duration-150 ease-in-out hover:scale-110 active:scale-100"
    >
      <Armchair
        className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${statusClasses[status]}`}
      />
    </button>
  );
};

// --- Componente Principale SeatBooking ---
const SeatBooking: React.FC<{ onProceedToCheckout: (quantity: number) => void; movieId: number; showtime: string; projection: ProgrammazioneItem; }> = ({ onProceedToCheckout, movieId, showtime, projection }) => {
    const [quantity, setQuantity] = useState(1);
    const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const seatLayouts: { [key: string]: { [key: string]: number[] } } = {
        cinema_capitol: {'O':range(1,16),'N':range(1,16),'M':range(1,15),'L':range(1,16),'I':range(1,15),'H':range(1,16),'G':range(1,16),'F':range(1,16),'E':range(1,16),'D':range(1,16),'C':[...range(1,3), ...range(14,16)],'B':[...range(1,3), ...range(14,16)],'A':[1,2,16]},
        villa_cattolica: Object.fromEntries(['A','B','C','D','E','F','G','H','I','L'].map(row => [row, range(1, 20)]))
    };
    function range(start:number, end:number) { return Array.from({length: (end - start) + 1}, (_, i) => start + i) }

    const Seat: React.FC<{ status: string; seatId: string }> = ({ status, seatId }) => {
        const config = { available:{c:"text-gray-500", I:Armchair}, occupied:{c:"text-red-800/60",I:Armchair}, vip:{c:"text-yellow-500",I:Star}, disabled:{c:"text-gray-700", I:Armchair}};
        const {c, I} = config[status as keyof typeof config] || config.disabled;
        return <I className={`w-5 h-5 sm:w-6 sm:h-6 ${c}`} aria-label={`Posto ${seatId} - ${status}`} />;
    };

    useEffect(() => {
        setLoading(true);
        fetchOccupiedSeats(movieId, showtime).then(setOccupiedSeats).catch(() => setError("Errore nel caricamento dei posti.")).finally(() => setLoading(false));
    }, [movieId, showtime]);

    const layout = seatLayouts[projection.location_type] || seatLayouts.cinema_capitol;
    const rows = Object.keys(layout).sort((a, b) => b.localeCompare(a));
    const maxCols = Math.max(0, ...Object.values(layout).map(r => Math.max(0, ...r)));
    const totalCols = Array.from({ length: maxCols }, (_, i) => i + 1);
    
    const getSeatStatus = (seat: string) => {
        if (occupiedSeats.includes(seat)) return "occupied";
        if (projection.vip_seats.includes(seat)) return "vip";
        if (projection.disabled_seats.includes(seat)) return "disabled";
        return "available";
    };

    if (loading) return <div className="text-center p-8"><Loader2 className="animate-spin h-12 w-12 mx-auto text-[#ebdaa8]" /></div>;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <div className="w-full mx-auto p-2 sm:p-4 bg-gray-900 text-white rounded-lg">
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center"><Users className="h-5 w-5 mr-2 text-[#ebdaa8]" />Seleziona numero posti</h3>
                        <input type="number" min="1" max="10" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full p-3 bg-gray-700 text-white rounded-md text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#ebdaa8]"/>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center"><Info className="h-5 w-5 mr-2 text-blue-400" />Legenda</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                            <div className="flex items-center gap-2"><Armchair className="w-6 h-6 text-gray-500" /><span>Disponibile</span></div>
                            <div className="flex items-center gap-2"><Armchair className="w-6 h-6 text-red-800/60" /><span>Occupato</span></div>
                            <div className="flex items-center gap-2"><Star className="w-6 h-6 text-yellow-500" /><span>VIP/Riservato</span></div>
                            <div className="flex items-center gap-2"><Armchair className="w-6 h-6 text-gray-700" /><span>Non disponibile</span></div>
                        </div>
                    </div>
                    <button onClick={() => onProceedToCheckout(quantity)} className="w-full py-3 bg-[#ebdaa8] hover:bg-opacity-90 text-[#2d2d2d] rounded-md font-bold transition-colors duration-200 text-lg">
                        Continua con {quantity} {quantity === 1 ? "Posto" : "Posti"}
                    </button>
                </div>

                <div className="overflow-auto cursor-grab active:cursor-grabbing bg-gray-800 p-4 rounded-lg">
                    <div className="inline-block min-w-full">
                        <div className="w-full h-8 bg-gray-700 mx-auto mb-6 rounded-t-full flex items-center justify-center shadow-lg"><p className="text-gray-300 font-bold tracking-[0.3em]">SCHERMO</p></div>
                        <div className="flex flex-col items-center gap-1" role="group">
                            {rows.map(row => (
                                <div key={row} className="flex items-center justify-center gap-0.5 sm:gap-1">
                                    <div className="w-8 text-center font-bold text-gray-400 text-xs">{row}</div>
                                    {totalCols.map(col => {
                                        const seatExists = layout[row]?.includes(col);
                                        if (!seatExists) return <div key={`${row}-${col}`} className="w-5 h-5 sm:w-6 sm:h-6" />;
                                        const seatId = `${row}${col}`;
                                        return <Seat key={seatId} seatId={seatId} status={getSeatStatus(seatId)} />;
                                    })}
                                    <div className="w-8 text-center font-bold text-gray-400 text-xs">{row}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatBooking;
