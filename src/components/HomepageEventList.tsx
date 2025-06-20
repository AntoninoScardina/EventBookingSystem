import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../contexts/BookingContext";
import {
  BaariaEvent,
  ProgrammazioneItem,
  GroupedEventProjection,
} from "../types";
import {
  ArrowRight,
  Film,
  Clock,
  Ticket,
  CheckCircle2,
  Tag,
  CalendarDays,
  Download,
  ChevronDown,
  Layers,
} from "lucide-react";

interface FlattenedEvent {
  event: BaariaEvent;
  projection: ProgrammazioneItem;
  adjustedSortKey: string;
}

const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const getAdjustedSortKey = (key: string | undefined): string => {
  if (!key || key.length < 12) return key || "";
  const hour = parseInt(key.substring(8, 10), 10);

  if (hour < 5) {
    const baseDate = key.substring(0, 8);
    const originalHour = parseInt(key.substring(8, 10), 10);
    const minutePart = key.substring(10, 12);
    const adjustedHour = (originalHour + 24).toString().padStart(2, "0");
    return `${baseDate}${adjustedHour}${minutePart}`;
  }
  return key;
};

const formatDateForDisplay = (dateKey: string): string => {
  try {
    const year = parseInt(dateKey.substring(0, 4), 10);
    const month = parseInt(dateKey.substring(4, 6), 10) - 1;
    const day = parseInt(dateKey.substring(6, 8), 10);
    const dateObj = new Date(Date.UTC(year, month, day));
    const formatted = new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Europe/Rome",
    }).format(dateObj);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateKey;
  }
};

const formatDateForFilter = (dateKey: string): string => {
  try {
    const year = parseInt(dateKey.substring(0, 4), 10);
    const month = parseInt(dateKey.substring(4, 6), 10) - 1;
    const day = parseInt(dateKey.substring(6, 8), 10);
    const dateObj = new Date(Date.UTC(year, month, day));
    const formatted = new Intl.DateTimeFormat("it-IT", {
      weekday: "short",
      day: "numeric",
      timeZone: "Europe/Rome",
    }).format(dateObj);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateKey;
  }
};

const HomepageEventList: React.FC<{ events: BaariaEvent[] }> = ({ events }) => {
  const navigate = useNavigate();
  const { setSelectedEvent } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const groupedByDate = useMemo(() => {
    const flattened: FlattenedEvent[] = events
      .flatMap(
        (event) =>
          event.event_details?.programmazione?.map((projection) => ({
            event,
            projection,
            adjustedSortKey: getAdjustedSortKey(
              projection.datetime_sort_key ||
                `${projection.data_raw}${
                  projection.orario?.replace(":", "") || "0000"
                }`
            ),
          })) || []
      )
      .sort((a, b) => a.adjustedSortKey.localeCompare(b.adjustedSortKey));

    return flattened.reduce((acc, item) => {
      const date = item.projection.data_raw?.trim() || "Data non definita";
      const location =
        item.projection.location_nome?.trim() || "Sede non definita";
      const category =
        item.event.event_details.categoria_evento?.trim().toUpperCase() ||
        "SENZA CATEGORIA";

      if (!acc[date]) acc[date] = {};
      if (!acc[date][location]) acc[date][location] = {};
      if (!acc[date][location][category]) acc[date][location][category] = [];

      acc[date][location][category].push(item);
      return acc;
    }, {} as { [date: string]: { [location: string]: { [category: string]: FlattenedEvent[] } } });
  }, [events]);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    a.localeCompare(b)
  );
  const filteredDates = selectedDate
    ? sortedDates.filter((d) => d === selectedDate)
    : sortedDates;

  if (events.length === 0) {
    return (
      <p className="text-center text-xl text-gray-500 py-10">
        Nessun evento in programma al momento.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-2 font-f">
        Programma del <br></br>Baarìa Film Festival
      </h2>
      <p className="text-center text-base text-gray-600 italic -mt-4 mb-2 max-w-2xl mx-auto px-4">
        Il programma potrebbe subire variazioni.
      </p>

      {sortedDates.length > 1 && (
        <div className="sticky top-0 bg-white bg-opacity-90 backdrop-blur-sm z-10 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full md:hidden">
                <div className="relative">
                  <select
                    id="date-filter-mobile"
                    value={selectedDate || "all"}
                    onChange={(e) =>
                      setSelectedDate(
                        e.target.value === "all" ? null : e.target.value
                      )
                    }
                    className="w-full appearance-none bg-gray-200 border-transparent rounded-full px-4 py-2 text-gray-800 font-semibold focus:ring-2 focus:ring-gray-800 focus:outline-none"
                  >
                    <option value="all">Tutti i giorni</option>
                    {sortedDates.map((date) => (
                      <option key={date} value={date}>
                        {formatDateForDisplay(date)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => setSelectedDate(null)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${
                    selectedDate === null
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <CalendarDays size={16} /> Tutti
                </button>
                {sortedDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                      selectedDate === date
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {formatDateForFilter(date)}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-auto flex-shrink-0">
                <a
                  href="/documenti/programma-ufficiale.pdf"
                  download
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-[#b08d57] text-white rounded-full font-semibold hover:bg-opacity-90 transition-colors duration-200 text-sm"
                >
                  <Download size={16} /> <span>Scarica programma</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredDates.length > 0 ? (
        <div className="space-y-12">
          {filteredDates.map((date) => {
            const locationsForDate = groupedByDate[date];
            const sortedLocations = Object.keys(locationsForDate).sort();

            return (
              <div key={date}>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-8 pb-4 border-b-2 border-gray-200 px-4">
                  {formatDateForDisplay(date)}
                </h2>
                <div className="space-y-10">
                  {sortedLocations.map((location) => {
                    const categoriesForLocation = locationsForDate[location];
                    const sortedCategories = Object.keys(
                      categoriesForLocation
                    ).sort();

                    return (
                      <section key={location}>
                        <h3 className="text-2xl lg:text-3xl font-bold text-[#b08d57] mb-5 px-4">
                          {location}
                        </h3>
                        <div className="bg-white p-2 sm:p-4 rounded-lg shadow-md border border-gray-200">
                          <ul className="divide-y divide-gray-200">
                            {sortedCategories.flatMap((category) => {
                              const eventsInCategory =
                                categoriesForLocation[category];
                              const groupedByProjection =
                                eventsInCategory.reduce((acc, item) => {
                                  const projId = item.projection.proiezione_id;
                                  if (!acc[projId]) acc[projId] = [];
                                  acc[projId].push(item);
                                  return acc;
                                }, {} as { [projId: string]: FlattenedEvent[] });
                              
                              const categoryHeader = (
                                <li className="pt-4 pb-2 px-3" key={category}>
                                    <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-3">
                                        <Film className="lucide lucide-film text-[#b08d57]" />
                                        {category}
                                    </h4>
                                </li>
                              );

                              const eventItems = Object.values(groupedByProjection).flatMap(
                                (group, index) => {
                                  const isBlock =
                                    group.length > 1 &&
                                    group[0].projection.blocco_prenotabile;

                                  if (isBlock) {
                                    const firstItem = group[0];
                                    const projection =
                                      firstItem.projection;
                                    const totalDuration = group.reduce(
                                      (sum, curr) =>
                                        sum +
                                        (curr.event.event_details
                                          .durata_minuti || 0),
                                      0
                                    );
                                    const eventGroupForNav: GroupedEventProjection[] =
                                      group.map((item) => ({
                                        event: item.event,
                                        projection: item.projection,
                                      }));

                                    return (
                                        <li key={`group-${projection.proiezione_id}-${index}`} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                                            <div className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4"><Clock size={18} className="text-gray-500"/><span>{projection.orario}</span></div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-1 pl-5 border-l-2 border-gray-200 space-y-4">
                                                    {group.map(({ event }) => (
                                                        <div key={event.id}>
                                                            <h6 className="font-semibold text-base text-gray-800" dangerouslySetInnerHTML={{ __html: decodeHtml(event.event_details.title) }}></h6>
                                                            <p className="text-sm text-gray-600">{event.event_details.regia ? `Regia: ${event.event_details.regia}` : ''} {event.event_details.durata_minuti ? `(${event.event_details.durata_minuti} min)` : ''}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="md:col-span-2 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                    {group.map(({event}) => (
                                                        <div key={event.id} className="w-full aspect-[2/3] bg-gray-200 rounded-md overflow-hidden shadow-sm">
                                                            <img src={event.event_details.locandina_url || 'https://placehold.co/200x300/e2e8f0/475569?text=N/A'} alt={`Locandina di ${event.event_details.title}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/200x300/e2e8f0/475569?text=N/A')}/>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {projection.booking_not_required && <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full"><CheckCircle2 size={14}/><span>Ingresso Libero</span></div>}
                                                    {projection.bookings_enabled && !projection.booking_not_required && <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full"><Ticket size={14}/><span>Prenotazione Unica Richiesta</span></div>}
                                                    {totalDuration > 0 && <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded-full"><Clock size={12} /> <span>Durata Tot. {totalDuration} min</span></div>}
                                                </div>
                                                <button onClick={() => navigate('/blocco-atolli', { state: { events: eventGroupForNav, locationName: location } })} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-gray-800 text-white rounded-md font-semibold hover:bg-black transition-all duration-200 text-sm">
                                                    <span>Dettagli e Prenotazione</span><ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                  }

                                  return group.map(
                                    ({ event, projection }) => {
                                      const { event_details } = event;
                                      return (
                                        <li key={`${event.id}-${projection.proiezione_id}`} className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] items-start gap-4 p-4 hover:bg-gray-50 transition-colors duration-200">
                                            <div className="w-full aspect-[2/3] bg-gray-200 rounded-md overflow-hidden shadow-sm">
                                                <img src={event_details.locandina_url || "https://placehold.co/200x300/e2e8f0/475569?text=N/A"} alt={`Locandina di ${event_details.title}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/200x300/e2e8f0/475569?text=N/A")}/>
                                            </div>
                                            <div className="flex flex-col h-full">
                                                <div className="flex-grow">
                                                <div className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-2"><Clock size={18} className="text-gray-500"/><span>{projection.orario}</span></div>
                                                    <h5 className="font-semibold text-lg text-gray-900 uppercase" dangerouslySetInnerHTML={{ __html: decodeHtml(event_details.title) }}></h5>
                                                    {(event_details.regia || event_details.descrizione_breve) && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        <span>
                                                            {event_details.regia && (<span>Regia: <strong>{event_details.regia}</strong></span>)}
                                                            {event_details.regia && event_details.descrizione_breve && (<span className="mx-2">·</span>)}
                                                            {event_details.descrizione_breve && (<span>{event_details.descrizione_breve}</span>)}
                                                        </span>
                                                    </div>
                                                    )}
                                                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                                                        {projection.booking_not_required && <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full"><CheckCircle2 size={14}/><span>Ingresso Libero</span></div>}
                                                        {projection.bookings_enabled && !projection.booking_not_required && <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full"><Ticket size={14}/><span>Prenotazione Richiesta</span></div>}
                                                        {event_details.genere && <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full"><Tag size={12}/><span>{event_details.genere}</span></div>}
                                                        {event_details.durata_minuti > 0 && <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded-full"><Clock size={12}/><span>{event_details.durata_minuti} min</span></div>}
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex-shrink-0">
                                                    <button onClick={() => { setSelectedEvent(event); navigate(`/evento/${event.id}`);}} className="flex items-center justify-center gap-2 w-full md:w-auto md:self-end px-4 py-2 bg-gray-800 text-white rounded-md font-semibold hover:bg-black transition-all duration-200 text-sm">
                                                    <span>Dettagli e Prenotazione</span><ArrowRight size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                      );
                                    }
                                  );
                                }
                              );

                              return [categoryHeader, ...eventItems];
                            })}
                          </ul>
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 px-4">
          <h3 className="text-2xl font-bold text-gray-800">
            Nessun evento trovato
          </h3>
          <p className="text-gray-500 mt-2">
            Non ci sono eventi in programma per il giorno selezionato.
          </p>
          <button
            onClick={() => setSelectedDate(null)}
            className="mt-6 px-5 py-2 bg-gray-800 text-white rounded-md font-semibold hover:bg-black transition-all"
          >
            Mostra tutti i giorni
          </button>
        </div>
      )}
    </div>
  );
};

export default HomepageEventList;