import React, { useState, useEffect, useMemo } from 'react';
import { GroupedEventProjection } from '../types';
import { fetchOccupiedSeats } from '../api';
import { ChevronLeft, Clock, Film, Loader2, MapPin, Ticket, AlertTriangle, Tag, Calendar } from 'lucide-react';

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

const AtolliBookingPage: React.FC<AtolliBookingPageProps> = ({ eventGroup, locationName, onProceedToCheckout, onBack }) => {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
    
    const representativeProjection = eventGroup[0].projection;
    const representativeEvent = eventGroup[0].event;
    const isBookingEnabled = representativeProjection.blocco_prenotabile;
    const totalDuration = eventGroup.reduce((sum, curr) => sum + (curr.event.event_details.durata_minuti || 0), 0);

    useEffect(() => {
        if (!isBookingEnabled) {
            setLoading(false);
            return;
        }
        setLoading(true);
        fetchOccupiedSeats(representativeEvent.id, representativeProjection.showtime_key)
            .then(data => setOccupiedSeats(data || []))
            .catch(() => {
                setError("Impossibile caricare la disponibilità dei posti.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [representativeEvent.id, representativeProjection.showtime_key, isBookingEnabled]);

    const availableSeatsCount = useMemo(() => {
        const totalSeatsApproximation = 200; 
        const unavailableCount = occupiedSeats.length + (representativeProjection.vip_seats?.length || 0) + (representativeProjection.disabled_seats?.length || 0);
        return totalSeatsApproximation - unavailableCount;
    }, [occupiedSeats, representativeProjection]);

    const maxQuantity = Math.min(4, availableSeatsCount);

    return (
        <div className="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg">
            <button onClick={onBack} className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md hover:bg-gray-100">
                <ChevronLeft className="h-5 w-5" /> Torna al Programma
            </button>

            <header className="border-b border-gray-200 pb-6 mb-8">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#b08d57] tracking-tight">
                    Programma Cortometraggi: ATOLLI
                </h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-gray-600">
                    <div className="flex items-center gap-2"><MapPin size={16} /><span>{locationName}</span></div>
                    <div className="flex items-center gap-2"><Clock size={16} /><span>Inizio ore: {representativeProjection.orario}</span></div>
                    <div className="flex items-center gap-2"><Film size={16} /><span>Durata totale: circa {totalDuration} min</span></div>
                </div>
            </header>

            <div className="space-y-6 mb-10">
                {eventGroup.map(({ event }) => {
                    const details = event.event_details;
                    return(
                    <div key={event.id} className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="w-full md:w-[150px] aspect-[2/3] bg-gray-200 rounded-md overflow-hidden self-start">
                           <img 
                                src={details.locandina_url || 'https://placehold.co/200x300/e2e8f0/475569?text=N/A'} 
                                alt={`Locandina di ${decodeHtml(details.title)}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900" dangerouslySetInnerHTML={{ __html: decodeHtml(details.title) }}></h3>
                            {details.regia && <p className="text-md text-gray-700 font-semibold mt-1">Regia: {details.regia}</p>}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 my-2">
                                {details.anno_produzione && <div className="flex items-center gap-1.5"><Calendar size={14}/><span>{details.anno_produzione}</span></div>}
                                {details.durata_minuti > 0 && <div className="flex items-center gap-1.5"><Clock size={14}/><span>{details.durata_minuti} min</span></div>}
                                {details.genere && <div className="flex items-center gap-1.5"><Tag size={14}/><span>{details.genere}</span></div>}
                            </div>
                            <p className="text-gray-600 leading-relaxed mt-3 text-sm">{details.sinossi || "Nessuna sinossi disponibile."}</p>
                        </div>
                    </div>
                )})}
            </div>

            <div className="bg-gray-800 text-white p-6 rounded-lg mt-8 bottom-4 shadow-2xl">
                <h2 className="text-2xl font-bold text-center mb-2 text-[#ebdaa8]">Prenota il tuo posto</h2>
                <p className="text-center text-gray-300 mb-6 text-sm">La prenotazione è valida per l'intero blocco di cortometraggi. I posti verranno assegnati all'ingresso.</p>
                
                {!isBookingEnabled ? (
                    <div className="text-center text-yellow-300 p-4 bg-yellow-800/30 rounded-md flex items-center justify-center gap-2">
                        <AlertTriangle size={20} />
                        <span>Le prenotazioni per questo blocco non sono al momento disponibili.</span>
                    </div>
                ) : loading ? (
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
                        <p className="text-xs text-gray-400">Massimo 4 posti per prenotazione. Disponibilità: {availableSeatsCount} posti.</p>
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
    );
};

export default AtolliBookingPage;