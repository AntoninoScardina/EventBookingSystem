import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { fetchOccupiedSeats } from "../api";

interface SeatBookingProps {
  selectedSeats: string[];
  onSelectSeats: (seats: string[]) => void;
  onProceedToCheckout: () => void;
  movieId: number;
  showtime: string;
}

const Loader = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#ebdaa8]"></div>
    <p className="mt-4 text-lg">Caricamento posti...</p>
  </div>
);

const SeatBooking: React.FC<SeatBookingProps> = ({
  selectedSeats,
  onSelectSeats,
  onProceedToCheckout,
  movieId,
  showtime,
}) => {
  const fullCols = [1, 2, 3, 4, 5, 6, 7, 8, '', 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const lastRowCols = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  // const vRowCols = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]; // Non usato
  const rows = ["E", "F", "G", "H", "I", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"];
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (movieId && showtime) {
      setLoading(true);
      setError(null);
      fetchOccupiedSeats(movieId, showtime)
        .then((data) => {
          setOccupiedSeats(data);
        })
        .catch(() => {
          setError("Errore nel caricamento dei posti occupati.");
          setOccupiedSeats([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setOccupiedSeats([]);
    }
  }, [movieId, showtime]);

  const handleSeatClick = (seat: string) => {
    if (occupiedSeats.includes(seat) || seat === 'Q17') return;
    const newSelectedSeats = selectedSeats.includes(seat)
      ? selectedSeats.filter((s) => s !== seat)
      : [...selectedSeats, seat];
    onSelectSeats(newSelectedSeats);
  };

  const getSeatStatus = (seat: string) => {
    if (seat === 'Q17') return 'empty';
    if (occupiedSeats.includes(seat)) return "occupied";
    if (selectedSeats.includes(seat)) return "selected";
    return "available";
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <Info className="h-5 w-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold">Informazioni sui Posti</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center flex-col">
            <span className="text-gray-400 text-sm">Disponibile</span>
            <svg width="32" height="32" viewBox="0 0 24 24" className="text-[#ffffff] mt-1">
              <path d="M20,21H4c-1.1,0-2-0.9-2-2v-6c0-1.1,0.9-2,2-2h16c1.1,0,2,0.9,2,2v6C22,20.1,21.1,21,20,21z" fill="currentColor"></path>
              <path d="M18,11V9c0-3.3-2.7-6-6-6S6,5.7,6,9v2" fill="currentColor" stroke="#4A5568" strokeWidth="1"></path>
              <rect x="6" y="14" width="12" height="3" rx="1" fill="#2d2d2d"></rect>
            </svg>
          </div>
          <div className="flex items-center flex-col">
            <span className="text-[#ebdaa8] text-sm">Selezionato</span>
            <svg width="32" height="32" viewBox="0 0 24 24" className="text-[#ebdaa8] mt-1">
              <path d="M20,21H4c-1.1,0-2-0.9-2-2v-6c0-1.1,0.9-2,2-2h16c1.1,0,2,0.9,2,2v6C22,20.1,21.1,21,20,21z" fill="currentColor"></path>
              <path d="M18,11V9c0-3.3-2.7-6-6-6S6,5.7,6,9v2" fill="currentColor" stroke="#4A5568" strokeWidth="1"></path>
              <rect x="6" y="14" width="12" height="3" rx="1" fill="#2d2d2d"></rect>
            </svg>
          </div>
          <div className="flex items-center flex-col">
            <span className="text-red-500 text-sm">Occupato</span>
            <svg width="32" height="32" viewBox="0 0 24 24" className="text-red-500 mt-1">
              <path d="M20,21H4c-1.1,0-2-0.9-2-2v-6c0-1.1,0.9-2,2-2h16c1.1,0,2,0.9,2,2v6C22,20.1,21.1,21,20,21z" fill="currentColor"></path>
              <path d="M18,11V9c0-3.3-2.7-6-6-6S6,5.7,6,9v2" fill="currentColor" stroke="#4A5568" strokeWidth="1"></path>
              <rect x="6" y="14" width="12" height="3" rx="1" fill="#2d2d2d"></rect>
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-8 text-center">
        <div className="w-3/4 h-8 bg-gray-700 mx-auto mb-12 rounded-t-lg flex items-center justify-center">
          <p className="text-gray-400 text-sm">SCHERMO</p>
        </div>
        <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1.5 md:gap-2 mb-8 px-2">
          {fullCols.map((col, index) => ( <div key={`header-${index}`} className="text-xs text-gray-400">{col}</div> ))}
        </div>

        {rows.map((row) => (
          <div key={row} className={`grid gap-1.5 md:gap-2 mb-2 md:mb-4 px-2 ${row === 'V' ? 'grid-cols-[repeat(12,minmax(0,1fr))] justify-center ml-[calc(3*(100%/18))]' : 'grid-cols-[repeat(18,minmax(0,1fr))]'}`}>
            {(row === 'V' ? lastRowCols : fullCols).map((col) => {
              if (col === '') return <div key={`${row}-empty-${Math.random()}`} className=""></div>;
              const seat = `${row}${col}`;
              const status = getSeatStatus(seat);
              return (
                <div key={seat} className="flex flex-col items-center">
                  <button type="button" aria-label={`Posto ${seat}`}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center transition-all duration-150
                      ${status === "occupied" || status === "empty" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      ${status === "selected" ? "bg-[#ebdaa8]" : status === "occupied" ? "bg-red-700" : status === "available" ? "bg-gray-600 hover:bg-gray-500" : "bg-transparent"}`}
                    onClick={() => handleSeatClick(seat)}
                    disabled={status === "occupied" || status === "empty"}
                  >
                    {status !== "empty" && (
                       <svg width="100%" height="100%" viewBox="0 0 24 24" className={`${status === "selected" ? "text-gray-800" : "text-gray-300"}`}>
                         <path d="M20,21H4c-1.1,0-2-0.9-2-2v-6c0-1.1,0.9-2,2-2h16c1.1,0,2,0.9,2,2v6C22,20.1,21.1,21,20,21z" fill="currentColor"></path>
                         <path d="M18,11V9c0-3.3-2.7-6-6-6S6,5.7,6,9v2" fill="currentColor" stroke={status === "selected" ? "#ebdaa8" : "#4A5568"} strokeWidth="0.5"></path>
                         <rect x="6" y="14" width="12" height="3" rx="1" fill={status === "selected" ? "#2d2d2d" : "#374151"}></rect>
                       </svg>
                    )}
                  </button>
                  <span className={`text-xs mt-1 ${status === "selected" ? "text-[#ebdaa8]" : status === "empty" ? "text-transparent" : "text-white"}`}>
                    {status !== "empty" ? seat : '.'}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mt-8">
        <h3 className="text-lg font-semibold mb-4">Riepilogo Selezione</h3>
        {selectedSeats.length > 0 ? (
          <div>
            <div className="flex justify-between mb-4">
              <span>Posti selezionati:</span>
              <span>{selectedSeats.join(", ")} ({selectedSeats.length})</span>
            </div>
            <button
              className="w-full py-3 bg-[#ebdaa8] hover:bg-opacity-90 text-[#2d2d2d] rounded-md font-medium transition-colors duration-200"
              onClick={onProceedToCheckout}
            >
              Continua ({selectedSeats.length} {selectedSeats.length === 1 ? 'posto' : 'posti'})
            </button>
          </div>
        ) : (
          <p className="text-gray-400">Seleziona almeno un posto per continuare.</p>
        )}
      </div>
    </div>
  );
};
export default SeatBooking;