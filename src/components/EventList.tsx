import React from 'react';
import { BaariaEvent, ProgrammazioneItem, EventDetails } from '../types'; // Aggiorna il percorso se necessario
import { CalendarDays, Clock, MapPin, ArrowRight, Film, AlertTriangle } from 'lucide-react';

interface EventListProps {
  events: BaariaEvent[];
  onSelectEvent: (event: BaariaEvent) => void;
}

// Funzione helper per ottenere la prossima proiezione disponibile da event_details
const getNextAvailableProjectionInfo = (eventDetails?: EventDetails): ProgrammazioneItem | null => {
  if (!eventDetails || !eventDetails.programmazione || eventDetails.programmazione.length === 0) {
    return null;
  }
  const now = new Date();
  const futureProjections = eventDetails.programmazione
    .filter(p => {
        try {
            // Assicurati che data_raw (YYYYMMDD) e orario (HH:mm) siano validi
            if (!p.data_raw || !p.orario) return false;
            const year = parseInt(p.data_raw.substring(0, 4), 10);
            const month = parseInt(p.data_raw.substring(4, 6), 10) -1; // Mese è 0-indexed
            const day = parseInt(p.data_raw.substring(6, 8), 10);
            const hours = parseInt(p.orario.substring(0, 2), 10);
            const minutes = parseInt(p.orario.substring(3, 5), 10);
            const projectionDateTime = new Date(year, month, day, hours, minutes);
            return projectionDateTime.getTime() >= now.getTime();
        } catch (e) { 
            console.error("Errore nel parsing della data/ora della proiezione:", p, e);
            return false; 
        }
    })
    .sort((a, b) => {
        // Usa datetime_sort_key se disponibile e corretto (YYYYMMDDHHMM)
        if (a.datetime_sort_key && b.datetime_sort_key) {
            return a.datetime_sort_key.localeCompare(b.datetime_sort_key);
        }
        // Fallback se datetime_sort_key non è presente o per robustezza
        try {
            const dateA = new Date(a.data_raw.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') + 'T' + a.orario + ':00');
            const dateB = new Date(b.data_raw.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') + 'T' + b.orario + ':00');
            return dateA.getTime() - dateB.getTime();
        } catch (e) { return 0;}
    });

  return futureProjections.length > 0 ? futureProjections[0] : null;
};

const EventList: React.FC<EventListProps> = ({ events, onSelectEvent }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="h-16 w-16 mx-auto text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400">Nessun evento in programma al momento.</h3>
        <p className="text-gray-500">Torna a trovarci presto per aggiornamenti!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {events.map((event) => {
        const eventDetails = event.event_details; // Accedi a event_details
        if (!eventDetails) { // Controllo di sicurezza se event_details non fosse presente
            return (
                <div key={event.id} className="bg-gray-800 rounded-xl p-5 text-center">
                    <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
                    <p className="text-red-400">Dati evento mancanti per ID: {event.id}</p>
                </div>
            );
        }
        const nextProjection = getNextAvailableProjectionInfo(eventDetails);
        const title = event.title?.rendered || eventDetails.title || "Evento Senza Titolo";

        return (
          <div
            key={event.id}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-[#ebdaa8]/40 transition-all duration-300 flex flex-col group cursor-pointer"
            onClick={() => onSelectEvent(event)} // Passa l'intero oggetto evento
            role="article"
            aria-labelledby={`event-title-${event.id}`}
          >
            <div className="relative h-72 w-full overflow-hidden">
              <img
                src={eventDetails.locandina_url || "https://placehold.co/400x600/3A3A3A/EAA949?text=Evento"}
                alt={`Locandina ${title}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => (e.currentTarget.src = "https://placehold.co/400x600/3A3A3A/EAA949?text=Locandina+Non+Disponibile")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
              {eventDetails.tipo_film && (
                 <span className="absolute top-3 right-3 bg-[#ebdaa8] text-[#2d2d2d] px-2.5 py-1 text-xs font-bold rounded-full shadow-md">
                    {eventDetails.tipo_film.charAt(0).toUpperCase() + eventDetails.tipo_film.slice(1)}
                 </span>
              )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <h3 id={`event-title-${event.id}`} className="text-2xl font-bold text-[#ebdaa8] mb-2 group-hover:text-white transition-colors duration-200 line-clamp-2">{title}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-3 flex-grow min-h-[60px]">{eventDetails.sinossi || "Nessuna sinossi breve disponibile."}</p>
              
              <div className="mt-auto space-y-2 text-sm border-t border-gray-700 pt-3">
                {nextProjection ? (
                  <>
                    <div className="flex items-center text-gray-300">
                      <CalendarDays className="h-4 w-4 mr-2 text-[#ebdaa8] flex-shrink-0" />
                      <span>{nextProjection.data_formattata}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="h-4 w-4 mr-2 text-[#ebdaa8] flex-shrink-0" />
                      <span>Ore: {nextProjection.orario}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-[#ebdaa8] flex-shrink-0" />
                      <span className="truncate">{nextProjection.location_nome}</span>
                    </div>
                  </>
                ) : eventDetails.programmazione && eventDetails.programmazione.length > 0 ? (
                   <p className="text-xs text-gray-500">Tutte le proiezioni per questo evento sono passate.</p>
                ) : (
                  <p className="text-xs text-gray-500">Programmazione non ancora disponibile.</p>
                )}
              </div>
              
              <button 
                aria-label={`Dettagli per ${title}`}
                className="mt-4 w-full bg-transparent border-2 border-[#ebdaa8] text-[#ebdaa8] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#ebdaa8] hover:text-[#2d2d2d] transition-all duration-300 flex items-center justify-center gap-2 text-base"
                onClick={(e) => { e.stopPropagation(); onSelectEvent(event); }} // Passa l'intero oggetto evento
              >
                Dettagli <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventList;
