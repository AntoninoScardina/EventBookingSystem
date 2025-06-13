import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Users, CreditCard, ChevronLeft, Check, Film as FilmIconLucide, Info, Home } from 'lucide-react';
import { BookingProvider, useBooking } from './contexts/BookingContext';
import HomepageEventList from './components/HomepageEventList';
import EventDetail from './components/EventDetail';
import SeatBooking from './components/SeatBooking';
import Checkout from './components/Checkout';
import BookingConfirmation from './components/BookingConfirm';
import Header from './components/header';
import { BaariaEvent, ProgrammazioneItem, EventsByDate, ProcessedHomepageData } from './types';
import { fetchEvents } from './api';


const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const processEventsForHomepage = (events: BaariaEvent[]): ProcessedHomepageData => {
  const byDate: EventsByDate = {};
  const toBeAnnounced: BaariaEvent[] = [];
  events.forEach(event => {
    if (event.event_details && event.event_details.programmazione && event.event_details.programmazione.length > 0) {
      event.event_details.programmazione.forEach(projection => {
        const dateKey = projection.data_raw;
        if (!byDate[dateKey]) {
          byDate[dateKey] = [];
        }
        byDate[dateKey].push({
          event: event,
          projection: projection,
        });
      });
    } else {
      toBeAnnounced.push(event);
    }
  });
  // Ordina gli eventi per data e ora
  for (const dateKey in byDate) {
    byDate[dateKey].sort((a, b) => {
      const timeA = a.projection.orario.replace(':', '');
      const timeB = b.projection.orario.replace(':', '');
      if (timeA.localeCompare(timeB) === 0) {
        return (a.event.title?.rendered || a.event.event_details.title).localeCompare(b.event.title?.rendered || b.event.event_details.title);
      }
      return timeA.localeCompare(timeB);
    });
  }
  toBeAnnounced.sort((a,b) => (a.title?.rendered || a.event_details.title).localeCompare(b.title?.rendered || b.event_details.title));
  return { byDate, toBeAnnounced };
};

const HomepageContainer: React.FC = () => {
  const [homepageEventsByDate, setHomepageEventsByDate] = useState<EventsByDate>({});
  const [eventsToBeAnnounced, setEventsToBeAnnounced] = useState<BaariaEvent[]>([]);
  // const [allEvents, setAllEvents] = useState<BaariaEvent[]>([]); // Non sembra essere usato direttamente qui
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resetBookingState } = useBooking();

  useEffect(() => {
    resetBookingState();
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const eventsData = await fetchEvents();
        // setAllEvents(eventsData); // Non sembra necessario se non usato altrove in questo componente
        const processedData = processEventsForHomepage(eventsData);
        setHomepageEventsByDate(processedData.byDate);
        setEventsToBeAnnounced(processedData.toBeAnnounced);
        setError(null);
      } catch (err) {
        setError("Errore nel caricamento degli eventi. Riprova più tardi.");
        console.error("Errore fetchEvents in HomepageContainer:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [resetBookingState]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"> {/* Aggiunto min-h per centrare meglio */}
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#ebdaa8]"></div>
        <p className="mt-6 text-xl text-gray-300">Caricamento programma...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center p-8 text-red-400 bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto"> {/* Aggiunto max-w e mx-auto */}
        <Info size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-xl mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[#ebdaa8] text-[#2d2d2d] font-semibold hover:bg-opacity-90 rounded-md shadow">
          Ricarica Pagina
        </button>
      </div>
    );
  }

  return (
    <HomepageEventList
      groupedEvents={homepageEventsByDate}
      toBeAnnouncedEvents={eventsToBeAnnounced}
    />
  );
};

const EventDetailContainer: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { selectedEvent, setSelectedEvent, setSelectedProjection } = useBooking();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState<BaariaEvent | null>(null);
  const [loading, setLoading] = useState(true); // Inizia come true se facciamo sempre un fetch o se selectedEvent può essere null all'inizio

  useEffect(() => {
    if (selectedEvent && selectedEvent.id.toString() === eventId) {
      setEventData(selectedEvent);
      setLoading(false); // Dati già disponibili
      return; 
    }

    // Altrimenti, fetch degli eventi.
    setLoading(true);
    fetchEvents()
      .then(allEvents => {
        const foundEvent = allEvents.find(e => e.id.toString() === eventId);
        if (foundEvent) {
          setSelectedEvent(foundEvent); // Aggiorna il contesto
          setEventData(foundEvent);     // Aggiorna lo stato locale
        } else {
          console.error(`Evento con ID ${eventId} non trovato dopo il fetch.`);
          setEventData(null); 
          navigate('/404-event-not-found', { replace: true }); // Naviga a una pagina di errore o alla home
        }
      })
      .catch(error => {
        console.error("Errore nel fetch degli eventi in EventDetailContainer:", error);
        setEventData(null); 
        // Potresti voler navigare a una pagina di errore generica qui
      })
      .finally(() => {
        setLoading(false);
      });
  }, [eventId, selectedEvent, setSelectedEvent, navigate]); 
  
  if (loading) { // Mostra il loader se loading è true, indipendentemente da eventData
     return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ebdaa8]"></div>
         <p className="mt-4 text-lg text-gray-300">Caricamento evento...</p>
       </div>
     );
  }

  if (!eventData) { // Se non sta caricando e eventData è ancora null, allora evento non trovato
    return (
        <div className="text-center p-8 text-gray-300 bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto">
            <Info size={48} className="mx-auto mb-4 text-yellow-500" />
            <p className="text-xl mb-4">Evento non trovato.</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-[#ebdaa8] text-[#2d2d2d] font-semibold hover:bg-opacity-90 rounded-md shadow">
                Torna alla Homepage
            </button>
        </div>
    );
  }


  const handleProjectionSelect = (projection: ProgrammazioneItem) => {
    setSelectedProjection(projection);
    navigate(`/evento/${eventData.id}/prenota/${projection.showtime_key}`);
  };

  const handleBack = () => navigate(-1); // Torna alla pagina precedente

  return <EventDetail event={eventData} onSelectProjection={handleProjectionSelect} onBack={handleBack} />;
};

const SeatBookingContainer: React.FC = () => {
    const { eventId, showtimeKey } = useParams<{ eventId: string, showtimeKey: string }>();
    const { selectedEvent, selectedProjection, selectedSeats, setSelectedSeats, setSelectedProjection } = useBooking();
    const navigate = useNavigate();
    const [showSeatWarning, setShowSeatWarning] = useState(false);


    useEffect(() => {
        if (selectedEvent && selectedEvent.event_details?.programmazione) {
            if (!selectedProjection || selectedProjection.showtime_key !== showtimeKey) {
                const projection = selectedEvent.event_details.programmazione.find(p => p.showtime_key === showtimeKey);
                if (projection) {
                    setSelectedProjection(projection);
                } else {
                    console.warn(`Proiezione con showtimeKey ${showtimeKey} non trovata per l'evento ${eventId}. Ritorno ai dettagli evento.`);
                    navigate(`/evento/${eventId}`, { replace: true });
                }
            }
        } else if (!selectedEvent && eventId) {
            console.warn(`Nessun evento selezionato per la prenotazione posti (ID evento: ${eventId}). Ritorno alla homepage.`);
            navigate('/', { replace: true });
        }
    }, [selectedEvent, selectedProjection, showtimeKey, eventId, setSelectedProjection, navigate]);

    if (!selectedEvent || !selectedProjection) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ebdaa8]"></div>
                <p className="mt-4 text-lg text-gray-300">Caricamento dati prenotazione... </p>
                <p className="mt-2 text-sm text-gray-400">Se il problema persiste, <button onClick={() => navigate('/')} className="underline text-[#ebdaa8] hover:text-white">torna alla homepage</button>.</p>
            </div>
        );
    }
    
    const handleProceedToCheckout = () => {
        if (selectedSeats.length > 0) {
            setShowSeatWarning(false);
            navigate('/checkout');
        } else {
            // alert("Devi selezionare almeno un posto per procedere."); // EVITARE ALERT
            setShowSeatWarning(true); // Mostra un messaggio di avviso nell'UI
            console.warn("Nessun posto selezionato. L'utente deve selezionare almeno un posto.");
        }
    };
    const handleBackToDetail = () => navigate(`/evento/${selectedEvent.id}`);

    return (
        <>
            <button onClick={handleBackToDetail} className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center gap-2 transition-colors duration-200 shadow hover:shadow-lg">
                <ChevronLeft className="h-5 w-5" /> Torna ai Dettagli Evento
            </button>
            <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-1 text-[#ebdaa8]">{selectedEvent.event_details.title}</h3>
                <p className="text-lg text-gray-300 mb-1">{selectedProjection.showtime_desc || `${selectedProjection.data_formattata} - ${selectedProjection.orario}`}</p>
                <p className="text-sm text-gray-400">{selectedProjection.location_indirizzo}, {selectedProjection.location_citta}</p>
            </div>

            {/* Messaggio di avviso per la selezione dei posti */}
            {showSeatWarning && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-md relative mb-6 text-center" role="alert">
                    <strong className="font-bold">Attenzione!</strong>
                    <span className="block sm:inline"> Devi selezionare almeno un posto per procedere.</span>
                </div>
            )}

            <SeatBooking
                selectedSeats={selectedSeats}
                onSelectSeats={(seats) => {
                    setSelectedSeats(seats);
                    if (seats.length > 0 && showSeatWarning) {
                        setShowSeatWarning(false); // Nascondi l'avviso se l'utente seleziona un posto
                    }
                }}
                onProceedToCheckout={handleProceedToCheckout}
                movieId={selectedEvent.id}
                showtime={selectedProjection.showtime_key}
            />
        </>
    );
};

const CheckoutContainer: React.FC = () => {
    const { selectedEvent, selectedProjection, selectedSeats, setCheckoutEmail } = useBooking();
    const navigate = useNavigate();

    useEffect(() => {
        if (!selectedEvent || !selectedProjection || selectedSeats.length === 0) {
            console.warn("Dati per il checkout mancanti. Reindirizzamento...");
            // Prova a tornare alla selezione posti se possibile, altrimenti alla home.
            const fallbackPath = selectedEvent && selectedProjection 
                ? `/evento/${selectedEvent.id}/prenota/${selectedProjection.showtime_key}` 
                : '/';
            navigate(fallbackPath, { replace: true });
        }
    }, [selectedEvent, selectedProjection, selectedSeats, navigate]);

    // Se i dati non sono ancora pronti (a causa del reindirizzamento asincrono), mostra un loader o null.
    if (!selectedEvent || !selectedProjection || selectedSeats.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ebdaa8]"></div>
                <p className="mt-4 text-lg text-gray-300">Verifica dati checkout...</p>
            </div>
        );
    }

    const handleCheckoutSuccess = (customerEmail: string) => {
        setCheckoutEmail(customerEmail);
        navigate('/richiesta-inviata');
    };
    const handleBackToSeats = () => navigate(`/evento/${selectedEvent.id}/prenota/${selectedProjection.showtime_key}`);

    return (
        <>
            <button onClick={handleBackToSeats} className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center gap-2 transition-colors duration-200 shadow hover:shadow-lg">
                <ChevronLeft className="h-5 w-5" /> Torna alla Selezione Posti
            </button>
            <Checkout
                eventData={selectedEvent}
                projectionData={selectedProjection}
                seats={selectedSeats}
                onCheckoutSuccess={handleCheckoutSuccess}
            />
        </>
    );
};

const RequestSentPage: React.FC = () => {
    const { checkoutEmail, resetBookingState } = useBooking();
    const navigate = useNavigate();

    const handleGoToHome = () => {
        resetBookingState();
        navigate('/');
    }

    return (
        <div className="bg-gray-800 p-8 md:p-12 rounded-xl text-center max-w-md mx-auto shadow-2xl">
            <div className="mb-6">
                <Check className="h-20 w-20 mx-auto text-[#ebdaa8] bg-green-500/20 p-3 rounded-full" strokeWidth={3}/>
            </div>
            <h3 className="text-3xl font-bold text-[#ebdaa8] mb-4">Richiesta Inviata!</h3>
            <p className="mb-3 text-gray-200 text-lg">
                Abbiamo inviato un'email di conferma a: <br/> <strong className="text-white block mt-1">{checkoutEmail || "Indirizzo non specificato"}</strong>.
            </p>
            <p className="mb-8 text-gray-300">
                Per completare la prenotazione, segui le istruzioni nella mail. Il link scadrà tra 10 minuti.
            </p>
            <button onClick={handleGoToHome} className="w-full px-6 py-3 bg-[#ebdaa8] text-[#2d2d2d] rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-lg shadow-md">
                Torna alla Homepage
            </button>
        </div>
    );
};

const TokenConfirmationPage: React.FC = () => {
    const { setBookingToken, resetBookingState, bookingToken } = useBooking(); // Aggiunto bookingToken per il check
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            setBookingToken(token);
        } else {
            console.warn("Token non trovato nei parametri URL. Reset e ritorno alla home.");
            resetBookingState(); // Resetta lo stato se il token non è valido o mancante
            navigate('/', { replace: true });
        }
        // Rimuovi i parametri dall'URL per pulizia, ma solo dopo aver processato il token
        window.history.replaceState({}, document.title, window.location.pathname); 
    }, [location.search, setBookingToken, navigate, resetBookingState]);


    if (!bookingToken) { // Controlla se bookingToken è stato impostato dal useEffect
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ebdaa8]"></div>
          <p className="mt-4 text-lg text-gray-300">Verifica token in corso...</p>
        </div>
      );
    }
    return <BookingConfirmation token={bookingToken} />; // Passa il token al componente
};

const ProgressStepper: React.FC = () => {
    const location = useLocation();
    const { selectedEvent } = useBooking();

    const stepsConfig = [
        { path: "/", icon: Home, label: "Homepage" }, // Corrisponde a /programma/
        { path: `/evento/`, icon: FilmIconLucide, label: "Dettaglio" }, // Corrisponde a /programma/evento/
        { path: `/prenota/`, icon: Users, label: "Posti" }, // Corrisponde a /programma/evento/.../prenota/
        { path: "/checkout", icon: CreditCard, label: "Checkout" }, // Corrisponde a /programma/checkout
    ];
    
    let currentStepIndex = -1;
    const currentPath = location.pathname; // Questo è già relativo al basename

    if (currentPath === "/") currentStepIndex = 0;
    else if (currentPath.startsWith("/evento/") && !currentPath.includes("/prenota")) currentStepIndex = 1;
    else if (currentPath.includes("/prenota/")) currentStepIndex = 2; // Assicurati che il path per prenota sia univoco
    else if (currentPath === "/checkout") currentStepIndex = 3;
    
    // Non mostrare lo stepper per queste pagine
    if (currentPath === "/richiesta-inviata" || currentPath === "/conferma-prenotazione") {
        return null;
    }
    
    const getStepTitle = () => {
        if (currentStepIndex === 0) return "Programma del Baarìa Film Festival";
        if (currentStepIndex === 1 && selectedEvent) return "";
        if (currentStepIndex === 2) return "Seleziona Posti";
        if (currentStepIndex === 3) return "Dati Prenotazione";
        return "Baarìa Film Festival";
    }

    return (
        <div className="mb-10 mt-12">
            <div className="flex items-center mb-3 justify-center space-x-1 md:space-x-2 max-w-xl mx-auto">
                {stepsConfig.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const Icon = step.icon;
                    return (
                        <React.Fragment key={step.label}>
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full text-sm md:text-base flex items-center justify-center transition-all duration-300 font-medium shadow-md
                                ${isActive ? "bg-[#ebdaa8] text-[#2d2d2d] scale-110 ring-2 ring-offset-2 ring-offset-gray-800 ring-white" : isCompleted ? "bg-green-500 text-white" : "bg-gray-700 text-gray-400"}`}>
                                {isCompleted ? <Check size={20}/> : <Icon size={20}/>}
                            </div>
                            {index < stepsConfig.length - 1 && 
                                <div className={`h-1 flex-1 transition-all duration-500 rounded-full ${isCompleted || isActive ? "bg-[#ebdaa8]" : "bg-gray-700"}`}></div>
                            }
                        </React.Fragment>
                    );
                })}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-100 mt-10 tracking-tight">
                {getStepTitle()}
            </h2>
        </div>
    );
};

// Componente per la pagina 404
const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-[#ebdaa8]">404 - Pagina Non Trovata</h1>
      <p className="text-gray-300 mt-4 mb-8">La pagina che stai cercando potrebbe non esistere o essere stata spostata.</p>
      <button 
        onClick={() => navigate('/')} // Usa navigate('/') che rispetta il basename
        className="mt-8 px-6 py-3 bg-[#ebdaa8] text-[#2d2d2d] rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-lg shadow-md">
        Torna alla Homepage
      </button>
    </div>
  );
};


function App() {
  const basename = "/programma";

  return (
    <BookingProvider>
      <BrowserRouter basename={basename}>
        <ScrollToTop />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white selection:bg-[#ebdaa8] selection:text-[#2d2d2d]">
          <Header />
          <main className="container mx-auto py-8 px-4 relative">
            <ProgressStepper />
            <Routes>
              <Route path="/" element={<HomepageContainer />} />
              <Route path="/evento/:eventId" element={<EventDetailContainer />} />
              <Route path="/evento/:eventId/prenota/:showtimeKey" element={<SeatBookingContainer />} />
              <Route path="/checkout" element={<CheckoutContainer />} />
              <Route path="/richiesta-inviata" element={<RequestSentPage />} />
              <Route path="/conferma-prenotazione" element={<TokenConfirmationPage />} />
              {/* Pagina 404 personalizzata */}
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/404-event-not-found" element={
                <div className="text-center py-20">
                    <h1 className="text-4xl font-bold text-[#ebdaa8]">Evento Non Trovato</h1>
                    <p className="text-gray-300 mt-4 mb-8">L'evento che stai cercando non è disponibile.</p>
                    <button onClick={() => { const navigate = useNavigate(); navigate('/');}} className="mt-8 px-6 py-3 bg-[#ebdaa8] text-[#2d2d2d] rounded-lg font-semibold hover:bg-opacity-90">Torna alla Homepage</button>
                </div>
              } />
            </Routes>
          </main>
          <footer className="text-center py-10 text-gray-500 border-t border-gray-700/50 mt-16">
            Baarìa Film Festival &copy; {new Date().getFullYear()}
          </footer>
        </div>
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;