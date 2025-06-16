import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Users,
  CreditCard,
  ChevronLeft,
  Check,
  Film as FilmIconLucide,
  Info,
  Home,
  Loader2,
  AlertTriangle,
  Clapperboard,
} from "lucide-react";
import { BookingProvider, useBooking } from "./contexts/BookingContext";
import HomepageEventList from "./components/HomepageEventList";
import EventDetail from "./components/EventDetail";
import SeatBooking from "./components/SeatBooking";
import Checkout from "./components/Checkout";
import BookingConfirmation from "./components/BookingConfirm";
import Header from "./components/header";
import { BaariaEvent, ProgrammazioneItem } from "./types";
import { fetchEvents, fetchEventById } from "./api";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const HomepageContainer: React.FC = () => {
  const [events, setEvents] = useState<BaariaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resetBookingState } = useBooking();

  useEffect(() => {
    resetBookingState();
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const eventsData = await fetchEvents();
        setEvents(eventsData);
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin h-20 w-20 text-gray-400" />
        <p className="mt-6 text-xl text-gray-600">Caricamento programma...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center p-8 text-red-700 bg-red-50 border border-red-200 rounded-lg shadow-xl max-w-md mx-auto">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-xl mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-gray-800 text-white font-semibold hover:bg-black rounded-md shadow"
        >
          Ricarica Pagina
        </button>
      </div>
    );
  }

  return <HomepageEventList events={events} />;
};

const EventDetailContainer: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { selectedEvent, setSelectedEvent, setSelectedProjection } =
    useBooking();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (selectedEvent && selectedEvent.id.toString() === eventId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const eventData = await fetchEventById(eventId!);
        if (eventData) {
          setSelectedEvent(eventData);
        } else {
          throw new Error(`Evento con ID ${eventId} non trovato.`);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Errore nel caricamento dell'evento"
        );
      } finally {
        setLoading(false);
      }
    };
    if (eventId) {
      loadEvent();
    }
  }, [eventId, selectedEvent, setSelectedEvent]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg text-gray-500">Caricamento evento...</p>
      </div>
    );
  }

  if (error || !selectedEvent) {
    return (
      <div className="text-center p-8 text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg shadow-xl max-w-md mx-auto">
        <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
        <p className="text-xl mb-4">{error || "Evento non trovato."}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-gray-800 text-white font-semibold hover:bg-black rounded-md shadow"
        >
          Torna alla Homepage
        </button>
      </div>
    );
  }

  const handleProjectionSelect = (projection: ProgrammazioneItem) => {
    setSelectedProjection(projection);
    navigate(`/evento/${selectedEvent.id}/prenota/${projection.showtime_key}`);
  };

  const handleBack = () => navigate(-1);

  return (
    <EventDetail
      event={selectedEvent}
      onSelectProjection={handleProjectionSelect}
      onBack={handleBack}
    />
  );
};

const SeatBookingContainer: React.FC = () => {
  const { eventId, showtimeKey } = useParams<{
    eventId: string;
    showtimeKey: string;
  }>();
  const {
    selectedEvent,
    selectedProjection,
    selectedSeats,
    setSelectedSeats,
    setSelectedProjection,
  } = useBooking();
  const navigate = useNavigate();
  const [showSeatWarning, setShowSeatWarning] = useState(false);

  useEffect(() => {
    if (!selectedEvent && eventId) {
      navigate(`/`, { replace: true });
      return;
    }

    if (
      selectedEvent &&
      (!selectedProjection || selectedProjection.showtime_key !== showtimeKey)
    ) {
      const projection = selectedEvent.event_details?.programmazione.find(
        (p) => p.showtime_key === showtimeKey
      );
      if (projection) {
        setSelectedProjection(projection);
      } else {
        navigate(`/evento/${eventId}`, { replace: true });
      }
    }
  }, [
    selectedEvent,
    selectedProjection,
    showtimeKey,
    eventId,
    setSelectedProjection,
    navigate,
  ]);

  if (!selectedEvent || !selectedProjection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg text-gray-500">
          Caricamento dati prenotazione...
        </p>
      </div>
    );
  }

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length > 0) {
      setShowSeatWarning(false);
      navigate("/checkout");
    } else {
      setShowSeatWarning(true);
    }
  };
  const handleBackToDetail = () => navigate(`/evento/${selectedEvent.id}`);

  return (
    <>
      <button
        onClick={handleBackToDetail}
        className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center gap-2 transition-colors duration-200 shadow-sm hover:bg-gray-50"
      >
        <ChevronLeft className="h-5 w-5" /> Torna ai Dettagli Evento
      </button>
      <div className="bg-white p-6 rounded-lg mb-8 shadow-md border border-gray-200">
        <h3
          className="text-2xl font-bold mb-1 text-gray-900"
          dangerouslySetInnerHTML={{
            __html: decodeHtml(selectedEvent.event_details.title),
          }}
        ></h3>
        <p className="text-lg text-gray-600 mb-1">{`${selectedProjection.data_formattata} - ${selectedProjection.orario}`}</p>
        <p className="text-sm text-gray-500">
          {selectedProjection.location_nome}
        </p>
      </div>

      {showSeatWarning && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6 text-center"
          role="alert"
        >
          <strong className="font-bold">Attenzione!</strong>
          <span className="block sm:inline">
            {" "}
            Devi selezionare almeno un posto per procedere.
          </span>
        </div>
      )}

      <SeatBooking
        selectedSeats={selectedSeats}
        onSelectSeats={(seats) => {
          setSelectedSeats(seats);
          if (seats.length > 0) setShowSeatWarning(false);
        }}
        onProceedToCheckout={handleProceedToCheckout}
        movieId={selectedEvent.id}
        showtime={selectedProjection.showtime_key}
      />
    </>
  );
};

const CheckoutContainer: React.FC = () => {
  const { selectedEvent, selectedProjection, selectedSeats, setCheckoutEmail } =
    useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedEvent || !selectedProjection || selectedSeats.length === 0) {
      const fallbackPath =
        selectedEvent && selectedProjection
          ? `/evento/${selectedEvent.id}/prenota/${selectedProjection.showtime_key}`
          : "/";
      navigate(fallbackPath, { replace: true });
    }
  }, [selectedEvent, selectedProjection, selectedSeats, navigate]);

  if (!selectedEvent || !selectedProjection || selectedSeats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg text-gray-500">Verifica dati checkout...</p>
      </div>
    );
  }

  const handleCheckoutSuccess = (customerEmail: string) => {
    setCheckoutEmail(customerEmail);
    navigate("/richiesta-inviata");
  };
  const handleBackToSeats = () =>
    navigate(
      `/evento/${selectedEvent.id}/prenota/${selectedProjection.showtime_key}`
    );

  return (
    <>
      <button
        onClick={handleBackToSeats}
        className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center gap-2"
      >
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
    navigate("/");
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-xl text-center max-w-md mx-auto shadow-xl border border-gray-200">
      <div className="mb-6">
        <Check
          className="h-20 w-20 mx-auto text-[#b08d57] bg-[#ebdaa8]/20 p-3 rounded-full"
          strokeWidth={3}
        />
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-4">
        Richiesta Inviata!
      </h3>
      <p className="mb-3 text-gray-600 text-lg">
        Abbiamo inviato un'email di conferma a: <br />{" "}
        <strong className="text-gray-800 block mt-1">
          {checkoutEmail || "Indirizzo non specificato"}
        </strong>
        .
      </p>
      <p className="mb-8 text-gray-500">
        Per completare la prenotazione, segui le istruzioni nella mail. Il link
        scadrà tra 10 minuti.
      </p>
      <button
        onClick={handleGoToHome}
        className="w-full px-6 py-3 bg-[#b08d57] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-lg shadow-md"
      >
        Torna alla Homepage
      </button>
    </div>
  );
};

const TokenConfirmationPage: React.FC = () => {
  const { setBookingToken, resetBookingState } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setBookingToken(urlToken);
      setToken(urlToken);
    } else {
      resetBookingState();
      navigate("/", { replace: true });
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [location.search, setBookingToken, navigate, resetBookingState]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg text-gray-500">Verifica token in corso...</p>
      </div>
    );
  }
  return <BookingConfirmation token={token} />;
};

const ProgressStepper: React.FC = () => {
  const location = useLocation();
  const { selectedEvent } = useBooking();

  const stepsConfig = [
    { path: "/", icon: Home, label: "Programma Generale" },
    { path: `/evento/`, icon: FilmIconLucide, label: "Dettaglio" },
    { path: `/prenota/`, icon: Users, label: "Posti" },
    { path: "/checkout", icon: Clapperboard, label: "Checkout" },
  ];

  let currentStepIndex = -1;
  const currentPath = location.pathname;

  if (currentPath === "/") currentStepIndex = 0;
  else if (
    currentPath.startsWith("/evento/") &&
    !currentPath.includes("/prenota")
  )
    currentStepIndex = 1;
  else if (currentPath.includes("/prenota/")) currentStepIndex = 2;
  else if (currentPath === "/checkout") currentStepIndex = 3;

  if (["/richiesta-inviata", "/conferma-prenotazione"].includes(currentPath)) {
    return null;
  }

  const getStepTitle = () => {
    switch (currentStepIndex) {
      case 0:
        return "Programma Generale";
      case 1:
        return selectedEvent?.event_details.title || "Dettaglio Evento";
      case 2:
        return "Selezione Posti";
      case 3:
        return "Dati Prenotazione";
      default:
        return "Baarìa Film Festival";
    }
  };

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="mb-10 mt-4 sm:mt-2">
      <h2
        className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 tracking-tight"
        dangerouslySetInnerHTML={{ __html: decodeHtml(getStepTitle()) }}
      ></h2>
      <div className="flex items-center justify-center space-x-1 md:space-x-2 max-w-xl mx-auto">
        {stepsConfig.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 font-medium shadow-sm border-2
                                ${
                                  isActive
                                    ? "bg-[#ebdaa8] text-gray-900 border-[#b08d57] scale-110"
                                    : isCompleted
                                    ? "bg-gray-800 text-[#ebdaa8] border-gray-700"
                                    : "bg-white text-gray-400 border-gray-300"
                                }`}
              >
                <Icon size={20} />
              </div>
              {index < stepsConfig.length - 1 && (
                <div
                  className={`h-1 flex-1 transition-all duration-500 rounded-full ${
                    isCompleted ? "bg-gray-800" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-[#b08d57]">
        404 - Pagina Non Trovata
      </h1>
      <p className="text-gray-600 mt-4 mb-8">
        La pagina che stai cercando non esiste.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-8 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black transition-colors text-lg shadow-md"
      >
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
        <div className="min-h-screen bg-gray-100 text-gray-800 selection:bg-[#ebdaa8]/50 selection:text-gray-900">
          <Header />
          <main className="container mx-auto py-2 px-4 relative">
            <ProgressStepper />
            <Routes>
              <Route path="/" element={<HomepageContainer />} />
              <Route
                path="/evento/:eventId"
                element={<EventDetailContainer />}
              />
              <Route
                path="/evento/:eventId/prenota/:showtimeKey"
                element={<SeatBookingContainer />}
              />
              <Route path="/checkout" element={<CheckoutContainer />} />
              <Route path="/richiesta-inviata" element={<RequestSentPage />} />
              <Route
                path="/conferma-prenotazione"
                element={<TokenConfirmationPage />}
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="text-center py-10 text-gray-500 border-t border-gray-200 mt-16">
            <div className="mb-2">
              Baarìa Film Festival &copy; {new Date().getFullYear()} - Tutti i
              diritti riservati
            </div>
            <div className="text-sm">
              <a
                href="https://www.iubenda.com/privacy-policy/11258969/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 underline"
              >
                Privacy Policy
              </a>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;
