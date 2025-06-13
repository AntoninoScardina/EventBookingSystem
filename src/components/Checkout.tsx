import React, { useState } from "react";
import { MapPin, Film as FilmIcon, Clock, Users } from "lucide-react";
import { BaariaEvent, ProgrammazioneItem } from "../types"; // Assicurati che il percorso sia corretto
import { requestBookingWithPdf } from "../api"; // Assicurati che il percorso sia corretto

interface CheckoutProps {
  eventData: BaariaEvent;
  projectionData: ProgrammazioneItem;
  seats: string[];
  onCheckoutSuccess: (customerEmail: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({
  eventData,
  projectionData,
  seats,
  onCheckoutSuccess,
}) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    submit: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: "" });
    }
    setErrors({ ...errors, submit: "" });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", email: "", phone: "", submit: "" };
    if (!customerInfo.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
      valid = false;
    }
    if (!customerInfo.email.trim()) {
      newErrors.email = "L'email è obbligatoria";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = "Email non valida";
      valid = false;
    }
    if (!customerInfo.phone.trim()) {
      newErrors.phone = "Il telefono è obbligatorio";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setErrors({ ...errors, submit: "" });

      const bookingPayload = {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        movie_id: eventData.id, // Assumendo che BaariaEvent abbia una proprietà 'id'
        proiezione_id: projectionData.proiezione_id,
        location_nome: projectionData.location_nome,
        location_indirizzo: projectionData.location_indirizzo,
        // location_citta: projectionData.location_citta, // Se la invii al backend
        showtime_desc: projectionData.showtime_desc,
        showtime_key: projectionData.showtime_key,
        seats: seats,
      };

      try {
        const response = await requestBookingWithPdf(bookingPayload);
        if (response.data.success) {
          onCheckoutSuccess(customerInfo.email);
        } else {
          setErrors({ ...errors, submit: response.data.message || "Errore durante l'invio della prenotazione." });
        }
      } catch (error: any) {
        setErrors({ ...errors, submit: error.response?.data?.message || "Errore di connessione o durante l'invio." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 text-[#ebdaa8]">Riepilogo Prenotazione</h3>
          <div className="mb-4 space-y-3">
            <div className="flex items-start">
              <FilmIcon className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                {/* CORREZIONE 1: usa eventData.title.rendered */}
                <p className="font-medium text-gray-100">{eventData.title.rendered}</p>
                <p className="text-sm text-gray-400">
                  {/* CORREZIONE 2 & 3: Assicurati che genere e durata_minuti siano nel tipo BaariaEvent */}
                  {eventData.genere} | {Math.floor(eventData.durata_minuti / 60)}h {eventData.durata_minuti % 60}min
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-100">{projectionData.location_nome}</p>
                <p className="text-sm text-gray-400">{projectionData.location_indirizzo}, {projectionData.location_citta}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-100">{projectionData.data_formattata} - Ore: {projectionData.orario}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-100">Posti ({seats.length})</p>
                <p className="text-sm text-gray-400 break-all">{seats.join(", ")}</p>
              </div>
            </div>
          </div>
          <div className="text-lg font-semibold text-center mt-6 border-t border-gray-700 pt-4">
            <span className="text-gray-100">Evento gratuito</span>
          </div>
        </div>
      </div>
      <div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#ebdaa8]">Inserisci i tuoi dati</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-300">Nome completo</label>
              <input type="text" name="name" value={customerInfo.name} onChange={handleInputChange}
                className={`w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ebdaa8] ${errors.name ? "border border-red-500" : "border border-gray-600"}`}
                placeholder="Es. Mario Rossi" />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-300">Email</label>
              <input type="email" name="email" value={customerInfo.email} onChange={handleInputChange}
                className={`w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ebdaa8] ${errors.email ? "border border-red-500" : "border border-gray-600"}`}
                placeholder="Es. mario.rossi@email.com" />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-300">Telefono</label>
              <input type="tel" name="phone" value={customerInfo.phone} onChange={handleInputChange}
                className={`w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ebdaa8] ${errors.phone ? "border border-red-500" : "border border-gray-600"}`}
                placeholder="Es. 333 1234567" />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>
            {errors.submit && <p className="text-red-400 text-sm text-center py-2">{errors.submit}</p>}
            <button type="submit" disabled={isSubmitting}
              className={`w-full py-3 mt-2 bg-[#ebdaa8] text-[#2d2d2d] rounded-md font-bold hover:bg-opacity-90 transition-colors duration-200 text-lg ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}>
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#2d2d2d] mr-2"></div>
                  Invio in corso...
                </div>
              ) : ( "Richiedi Prenotazione" )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Checkout;