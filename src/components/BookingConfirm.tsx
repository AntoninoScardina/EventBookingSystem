import { useState, useEffect } from "react";
import { Booking } from "../types";
import { Loader2 } from "lucide-react";

interface BookingConfirmationProps {
  token: string | null;
}

const BookingConfirmation: React.FC<{ token: string | null }> = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<Booking | null>(null);
    const [confirmationMessage, setConfirmationMessage] = useState("");

    useEffect(() => {
        if (token) {
            checkTokenAndDetails();
        } else {
            setError("Token di conferma mancante.");
            setLoading(false);
        }
    }, [token]);

    const checkTokenAndDetails = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await checkTokenValidity(token!);
            if (data.success && data.booking) setBookingDetails(data.booking);
            else setError(data.message || "Token non valido.");
        } catch (err) { setError("Errore di connessione."); } finally { setLoading(false); }
    };

    const handleConfirmBooking = async () => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            const { data } = await confirmBookingWithPdf(token);
            if (data.success) {
                setConfirmed(true);
                setConfirmationMessage(data.message || "Prenotazione confermata!");
            } else setError(data.message || "Errore durante la conferma.");
        } catch (err) { setError("Errore di connessione."); } finally { setLoading(false); }
    };

    if (loading && !bookingDetails && !error) return <div className="text-center p-8"><Loader2 className="animate-spin h-12 w-12 mx-auto text-[#ebdaa8]" /></div>
    if (error) return <div className="bg-gray-800 p-8 rounded-lg text-center text-red-400"><h3 className="text-xl font-bold mb-2">Errore</h3><p>{error}</p></div>;
    if (confirmed) return <div className="bg-gray-800 p-8 rounded-lg text-center text-green-400"><h3 className="text-xl font-bold mb-2">{confirmationMessage}</h3><p>Controlla la tua email per il biglietto.</p></div>;

    return (
        <div className="bg-gray-800 p-8 rounded-lg text-white">
            {bookingDetails ? (
                <>
                <h2 className="text-2xl font-bold text-center mb-6 text-[#ebdaa8]">Conferma la tua Prenotazione</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div><h3 className="text-xl font-semibold mb-2">Dettagli</h3><p><strong>Film:</strong> {bookingDetails.movie_name}</p><p><strong>Orario:</strong> {bookingDetails.showtime}</p><p><strong>Posti:</strong> {bookingDetails.seats.join(", ")}</p></div>
                    <div><h3 className="text-xl font-semibold mb-2">Contatto</h3><p><strong>Nome:</strong> {bookingDetails.name}</p><p><strong>Email:</strong> {bookingDetails.email}</p></div>
                </div>
                <div className="text-center">
                    {loading ? <Loader2 className="animate-spin h-10 w-10 mx-auto text-[#ebdaa8]" /> : <button onClick={handleConfirmBooking} className="px-8 py-3 bg-[#ebdaa8] text-[#2d2d2d] rounded-md font-bold hover:bg-opacity-90">Conferma Definitivamente</button>}
                </div>
                </>
            ) : <p className="text-center">Caricamento...</p>}
        </div>
    );
}

export default BookingConfirmation;

function checkTokenValidity(arg0: string): { data: any; } | PromiseLike<{ data: any; }> {
    throw new Error("Function not implemented.");
}
function confirmBookingWithPdf(token: string): { data: any; } | PromiseLike<{ data: any; }> {
    throw new Error("Function not implemented.");
}

