import React, { useEffect, useState } from "react";
import { Info, Loader2, Armchair } from "lucide-react"; // <-- Aggiunta Armchair
import { fetchOccupiedSeats } from "../api";

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
const SeatBooking: React.FC<SeatBookingProps> = ({
  selectedSeats,
  onSelectSeats,
  onProceedToCheckout,
  movieId,
  showtime,
}) => {
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (movieId && showtime) {
      setLoading(true);
      setError(null);
      fetchOccupiedSeats(movieId, showtime)
        .then(setOccupiedSeats)
        .catch(() => setError("Errore nel caricamento dei posti occupati."))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setOccupiedSeats([]);
    }
  }, [movieId, showtime]);

  const handleSeatClick = (seat: string) => {
    if (occupiedSeats.includes(seat)) return;
    const newSelectedSeats = selectedSeats.includes(seat)
      ? selectedSeats.filter((s) => s !== seat)
      : [...selectedSeats, seat];
    onSelectSeats(newSelectedSeats);
  };

  const getSeatStatus = (seat: string) => {
    if (occupiedSeats.includes(seat)) return "occupied";
    if (selectedSeats.includes(seat)) return "selected";
    return "available";
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="w-full mx-auto p-2 sm:p-4 bg-gray-900 text-white rounded-lg">
      {/* Legenda ridisegnata con le nuove icone */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center mb-3">
          <Info className="h-5 w-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold">Legenda Posti</h3>
        </div>
        <div className="flex flex-wrap justify-around items-center text-center text-sm text-gray-300 gap-4">
          <div className="flex items-center gap-2">
            <Armchair className="w-6 h-6 text-gray-500" />
            <span>Disponibile</span>
          </div>
          <div className="flex items-center gap-2">
            <Armchair className="w-6 h-6 text-[#ebdaa8]" />
            <span>Selezionato</span>
          </div>
          <div className="flex items-center gap-2">
            <Armchair className="w-6 h-6 text-red-800/60" />
            <span>Occupato</span>
          </div>
        </div>
      </div>

      {/* Contenitore per Pan & Zoom su mobile */}
      <div className="overflow-auto cursor-grab active:cursor-grabbing">
        <div className="inline-block min-w-full p-4">
          <div className="w-full h-8 bg-gray-700 mx-auto mb-8 rounded-t-full flex items-center justify-center shadow-lg shadow-black/30">
            <p className="text-gray-300 font-bold tracking-[0.3em]">SCHERMO</p>
          </div>

          <div
            className="flex flex-col items-center gap-1.5"
            role="group"
            aria-label="Mappa dei posti"
          >
            {rows.map((row) => (
              <div
                key={row}
                className="flex items-center justify-center gap-1 sm:gap-1.5"
              >
                <div className="w-8 text-center font-bold text-gray-400 text-xs">
                  {row}
                </div>
                {totalCols.map((col) => {
                  const rowSeats = seatLayout[row];
                  const seatExists = rowSeats?.includes(col);

                  if (!seatExists) {
                    return (
                      <div
                        key={`${row}-${col}`}
                        className="w-6 h-6 sm:w-7 sm:h-7"
                      ></div>
                    );
                  }

                  const seatNumber = rowSeats.indexOf(col) + 1;
                  const seatId = `${row}${seatNumber}`;

                  return (
                    <Seat
                      key={seatId}
                      seatId={seatId}
                      status={getSeatStatus(seatId)}
                      onClick={() => handleSeatClick(seatId)}
                    />
                  );
                })}
                <div className="w-8 text-center font-bold text-gray-400 text-xs">
                  {row}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg mt-8 sticky bottom-4 shadow-2xl max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-3">Riepilogo Selezione</h3>
          <div>
            <p className="text-gray-300 mb-2">
              Posti Selezionati:{" "}
              <span className="font-bold text-white">
                {selectedSeats.join(", ")}
              </span>
            </p>
            <p className="text-gray-300 mb-4">
              Totale Posti:{" "}
              <span className="font-bold text-white">
                {selectedSeats.length}
              </span>
            </p>
            <button
              className="w-full py-3 bg-[#ebdaa8] hover:bg-opacity-90 text-[#2d2d2d] rounded-md font-bold transition-colors duration-200 text-lg"
              onClick={onProceedToCheckout}
            >
              Continua con {selectedSeats.length}{" "}
              {selectedSeats.length === 1 ? "Posto" : "Posti"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatBooking;
