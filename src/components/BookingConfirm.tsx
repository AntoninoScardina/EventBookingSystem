import { useState, useEffect } from "react";
import { Booking } from "../types";
import { WORDPRESS_API_URL_BAARIA_V1 } from "../api";

interface BookingConfirmationProps {
  token: string | null;
}

function BookingConfirmation({ token }: BookingConfirmationProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<Booking | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    if (token) {
      checkTokenAndDetails();
    } else {
      setError("Token di conferma mancante o non valido.");
      setLoading(false);
    }
  }, [token]);

  const checkTokenAndDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${WORDPRESS_API_URL_BAARIA_V1}/check-token?token=${token}`
      );
      const data = await response.json();

      if (data.success && data.booking) {
        setBookingDetails(data.booking);
      } else {
        setError(data.message || "Token non valido o scaduto.");
      }
    } catch (err) {
      setError("Errore di connessione durante la verifica del token.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!token) {
      setError("Token non valido per la conferma.");
      return;
    }
    setLoading(true);
    setError("");
    setConfirmationMessage("");

    try {
      const response = await fetch(
        `${WORDPRESS_API_URL_BAARIA_V1}/confirm-booking-with-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setConfirmed(true);
        setConfirmationMessage(data.message || "Prenotazione confermata con successo!");
      } else {
        setError(data.message || "Errore durante la conferma della prenotazione.");
      }
    } catch (err) {
      setError("Errore di connessione durante la conferma.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !bookingDetails && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#ebdaa8]"></div>
        <p className="mt-4 text-lg">Verifica del token in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-8 rounded-lg text-center">
        <div className="text-red-500 mb-4 text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>Errore</h3>
        </div>
        <p className="mb-6">{error}</p>
        <a href="/" className="px-6 py-3 bg-[#ebdaa8] text-[#2d2d2d] rounded-md font-medium hover:bg-opacity-90 transition-colors">
          Torna alla home
        </a>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="bg-gray-800 p-8 rounded-lg text-center">
        <div className="text-green-500 mb-4 text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3>{confirmationMessage || "Prenotazione confermata!"}</h3>
        </div>
        <p className="mb-6">
          Controlla la tua email per il biglietto e i dettagli.
        </p>
        <a href="/" className="px-6 py-3 bg-[#ebdaa8] text-[#2d2d2d] rounded-md font-medium hover:bg-opacity-90 transition-colors">
          Torna alla home
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg">
      {bookingDetails ? (
        <>
          <h2 className="text-2xl font-bold text-center mb-6 text-[#ebdaa8]">Conferma la tua Prenotazione</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Dettagli prenotazione</h3>
              <p className="mb-2"><strong>Film:</strong> {bookingDetails.movie_name}</p>
              <p className="mb-2"><strong>Location:</strong> {bookingDetails.location_name}</p>
              <p className="mb-2"><strong>Orario:</strong> {bookingDetails.showtime}</p>
              <p className="mb-2"><strong>Posti:</strong> {Array.isArray(bookingDetails.seats) ? bookingDetails.seats.join(", ") : ""}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Informazioni di contatto</h3>
              <p className="mb-2"><strong>Nome:</strong> {bookingDetails.name}</p>
              <p className="mb-2"><strong>Email:</strong> {bookingDetails.email}</p>
              <p className="mb-2"><strong>Telefono:</strong> {bookingDetails.phone}</p>
            </div>
          </div>
          <div className="text-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#ebdaa8] mb-4"></div>
                <p className="text-lg">Conferma in corso...</p>
              </div>
            ) : (
              <button
                onClick={handleConfirmBooking}
                className="px-8 py-3 bg-[#ebdaa8] text-[#2d2d2d] rounded-md font-medium hover:bg-opacity-90 transition-colors text-lg"
              >
                Conferma Definitivamente
              </button>
            )}
          </div>
        </>
      ) : (
         <p className="text-center text-lg">Caricamento dettagli prenotazione...</p>
      )}
    </div>
  );
}
export default BookingConfirmation;