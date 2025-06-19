import React, { useState, useEffect, useMemo } from 'react';
import { BaariaEvent, GroupedEventProjection } from '../types';
import { fetchOccupiedSeats } from '../api';
import { ChevronLeft, Clock, Film, Loader2, MapPin, Ticket, X } from 'lucide-react';

interface AtolliBookingPageProps {
    eventGroup: GroupedEventProjection[];
    locationName: string;
    onProceedToCheckout: (quantity: number) => void;
    onBack: () => void;
}

const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

// Componente Modale per i dettagli del singolo corto
const DetailModal: React.FC<{ event: BaariaEvent, onClose: () => void }> = ({ event, onClose }) => {
    const details = event.event_details;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-[#ebdaa8]" dangerouslySetInnerHTML={{ __html: decodeHtml(details.title) }}></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={28} /></button>
                </div>
                <div className="p-6">
                    {details.regia && <p className="mb-1 text-lg text-white">Regia: <strong>{details.regia}</strong></p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mb-4">
                        {details.anno_produzione && <span>Anno: {details.anno_produzione}</span>}
                        {details.durata_minuti > 0 && <span>Durata: {details.durata_minuti} min</span>}
                        {details.genere && <span>Genere: {details.genere}</span>}
                    </div>
                    <h4 className="font-semibold text-lg mt-4 mb-2 text-gray-200">Sinossi</h4>
                    <p className="text-gray-300 leading-relaxed">{details.sinossi || "Nessuna sinossi disponibile."}</p>
                    {details.cast && (
                        <>
                            <h4 className="font-semibold text-lg mt-4 mb-2 text-gray-200">Cast</h4>
                            <p className="text-gray-300">{details.cast}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


const AtolliBookingPage: React.FC<AtolliBookingPageProps> = ({ eventGroup, locationName, onProceedToCheckout, onBack }) => {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
    const [modalEvent, setModalEvent] = useState<BaariaEvent | null>(null); // Stato per il modale

    const representativeProjection = eventGroup[0].projection;
    const representativeEvent = eventGroup[0].event;
    const totalDuration = eventGroup.reduce((sum, curr) => sum + (curr.event.event_details.durata_minuti || 0), 0);

    useEffect(() => {
        setLoading(true);
        fetchOccupiedSeats(representativeEvent.id, representativeProjection.showtime_key)
            .then(data => {
                setOccupiedSeats(data || []);
            })
            .catch(() => {
                setError("Impossibile caricare la disponibilità dei posti.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [representativeEvent.id, representativeProjection.showtime_key]);

    const availableSeatsCount = useMemo(() => {
        const totalSeatsApproximation = 200; 
        const unavailableCount = occupiedSeats.length + representativeProjection.vip_seats.length + representativeProjection.disabled_seats.length;
        return totalSeatsApproximation - unavailableCount;
    }, [occupiedSeats, representativeProjection]);

    const maxQuantity = Math.min(4, availableSeatsCount);

    return (
        <>
            {modalEvent && <DetailModal event={modalEvent} onClose={() => setModalEvent(null)} />}
            
            <div className="bg-gray-800 text-white p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl">
                <button onClick={onBack} className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center gap-2 transition-colors duration-200 shadow hover:shadow-lg">
                    <ChevronLeft className="h-5 w-5" /> Torna al Programma
                </button>

                <div className="border-b border-gray-700 pb-4 mb-6">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-[#ebdaa8] tracking-tight">
                        Programma Cortometraggi: ATOLLI
                    </h1>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-gray-300">
                        <div className="flex items-center gap-2"><MapPin size={16} /><span>{locationName}</span></div>
                        <div className="flex items-center gap-2"><Clock size={16} /><span>Inizio ore: {representativeProjection.orario}</span></div>
                        <div className="flex items-center gap-2"><Film size={16} /><span>Durata totale: {totalDuration} min</span></div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-white">Film in Programma</h2>
                <div className="flex overflow-x-auto gap-6 pb-4 mb-8">
                    {eventGroup.map(({ event }) => (
                        <div key={event.id} className="flex-shrink-0 w-48 bg-gray-700 rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-200" onClick={() => setModalEvent(event)}>
                            <img 
                                src={event.event_details.locandina_url || 'https://placehold.co/200x300/e2e8f0/475569?text=N/A'} 
                                alt={`Locandina di ${event.event_details.title}`} 
                                className="w-full h-64 object-cover"
                            />
                            <div className="p-3">
                                <h3 className="font-bold text-base text-white truncate" title={decodeHtml(event.event_details.title)} dangerouslySetInnerHTML={{ __html: decodeHtml(event.event_details.title) }}></h3>
                                <p className="text-sm text-gray-400">{event.event_details.regia || 'Regia non disponibile'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-700/50 p-6 rounded-lg mt-8">
                    <h2 className="text-2xl font-bold text-center mb-4 text-[#ebdaa8]">Prenota il tuo posto</h2>
                    <p className="text-center text-gray-300 mb-6">Seleziona il numero di posti. La prenotazione è valida per l'intero blocco di cortometraggi. I posti verranno assegnati all'ingresso.</p>
                    
                    {loading ? (
                         <div className="text-center p-4"> <Loader2 className="animate-spin h-8 w-8 mx-auto text-[#ebdaa8]" /> </div>
                    ) : error ? (
                        <div className="text-center text-red-400 p-4">{error}</div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                             <div className="flex items-center gap-4">
                                <label htmlFor="quantity-select" className="text-lg font-medium">Numero di posti:</label>
                                <input
                                    id="quantity-select"
                                    type="number"
                                    min="1"
                                    max={maxQuantity > 0 ? maxQuantity : 1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                                    className="w-24 p-3 bg-gray-900 text-white rounded-md text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#ebdaa8]"
                                />
                            </div>
                            <button 
                                onClick={() => onProceedToCheckout(quantity)}
                                disabled={maxQuantity <= 0}
                                className="w-full max-w-sm mt-4 py-3 bg-[#ebdaa8] text-[#2d2d2d] rounded-md font-bold hover:bg-opacity-90 transition-all duration-200 text-lg disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Ticket size={20}/>
                                {maxQuantity > 0 ? `Procedi con ${quantity} ${quantity === 1 ? 'posto' : 'posti'}` : 'Posti Esauriti'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AtolliBookingPage;