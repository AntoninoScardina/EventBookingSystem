import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { BaariaEvent, EventsByDate, ProgrammazioneItem } from '../types';
import { Clock, MapPin, Ticket, AlertTriangle, CheckCircle2, ArrowRight, CalendarOff } from 'lucide-react';

interface HomepageEventListProps {
  groupedEvents: EventsByDate;
  toBeAnnouncedEvents: BaariaEvent[];
}

const HomepageEventList: React.FC<HomepageEventListProps> = ({ groupedEvents, toBeAnnouncedEvents }) => {
  const navigate = useNavigate();
  const { setSelectedEvent } = useBooking();
  
  const handleSelectEvent = (event: BaariaEvent) => {
    setSelectedEvent(event);
    navigate(`/evento/${event.id}`);
  };

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => a.localeCompare(b));
  const hasProgrammedEvents = sortedDates.length > 0;
  const hasTBAEvents = toBeAnnouncedEvents.length > 0;

  if (!hasProgrammedEvents && !hasTBAEvents) {
    return <p className="text-center text-xl text-gray-400 py-10">Nessun evento in programma al momento.</p>;
  }

  const formatDateForDisplay = (dateKey: string): string => {
    try {
        const year = parseInt(dateKey.substring(0, 4), 10);
        const month = parseInt(dateKey.substring(4, 6), 10) -1;
        const day = parseInt(dateKey.substring(6, 8), 10);
        const dateObj = new Date(year, month, day);
        return dateObj.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return dateKey;
    }
  };

  const renderEventCard = (event: BaariaEvent, projection?: ProgrammazioneItem) => {
    const details = event.event_details;
    return (
        <article 
          key={`${event.id}-${projection?.proiezione_id || 'tba'}`} 
          className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition-shadow duration-300"
          onClick={() => handleSelectEvent(event)}
        >
          <img
            src={details.locandina_url || "https://placehold.co/300x200/3A3A3A/EAA949?text=Evento"}
            alt={`Locandina ${details.title}`}
            className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity"
          />
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-xl font-semibold text-gray-100 mb-1 group-hover:text-[#ebdaa8] transition-colors line-clamp-2">{details.title}</h3>
            
            {projection && (
              <div className="text-sm text-gray-400 mb-3 space-y-1">
                <p className="flex items-center"><Clock size={14} className="inline mr-1.5 text-gray-500" /> Ore: {projection.orario}</p>
                <p className="flex items-center"><MapPin size={14} className="inline mr-1.5 text-gray-500" /> {projection.location_nome}</p>
              </div>
            )}
            {!projection && (
                <div className="text-sm text-gray-400 mb-3 space-y-1 min-h-[40px]"> 
                  <p className="flex items-center"><CalendarOff size={14} className="inline mr-1.5 text-gray-500" /> Programmazione da definire</p>
                </div>
            )}

            <div className="text-xs mb-3 mt-auto pt-3 border-t border-gray-700/50 flex items-center gap-2">
              {details.booking_not_required ? (
                  <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              ) : details.bookings_enabled ? (
                  <Ticket size={16} className="text-blue-400 flex-shrink-0" />
              ) : (
                  <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
              )}
              <span className={`
                  ${details.booking_not_required ? 'text-green-400' :
                   details.bookings_enabled ? 'text-blue-400' : 'text-yellow-400'
                  } line-clamp-1`}>
                  {details.booking_status_message || 
                   (details.booking_not_required ? "Ingresso libero" : 
                    details.bookings_enabled ? "Prenotazione disponibile" : "Prenotazioni chiuse")
                  }
              </span>
            </div>

            <button 
              className="w-full mt-2 bg-transparent border border-[#ebdaa8] text-[#ebdaa8] px-4 py-2 rounded-md font-medium hover:bg-[#ebdaa8] hover:text-[#2d2d2d] transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
              onClick={(e) => { e.stopPropagation(); handleSelectEvent(event); }}
            >
              Vedi Dettagli <ArrowRight size={16}/>
            </button>
          </div>
        </article>
    );
  };

  return (
    <div className="space-y-12">
      {hasProgrammedEvents && sortedDates.map((dateKey) => (
        <section key={dateKey} className="bg-gray-800/60 p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-[#ebdaa8] mb-8 pb-3 border-b-2 border-gray-700/70">
            {formatDateForDisplay(dateKey)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedEvents[dateKey].map(({ event, projection }) => renderEventCard(event, projection))}
          </div>
        </section>
      ))}

      {hasTBAEvents && (
        <section className="bg-gray-800/60 p-6 rounded-xl shadow-lg backdrop-blur-sm mt-12">
          <h2 className="text-3xl font-bold text-[#c9b38b] mb-8 pb-3 border-b-2 border-gray-700/70">
            Programmazioni ancora da definire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {toBeAnnouncedEvents.map(event => renderEventCard(event))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomepageEventList;