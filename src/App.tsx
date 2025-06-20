import {
  Loader2,
  ChevronLeft,
  Check,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import BookingConfirmation from "./components/BookingConfirm";
import Checkout from "./components/Checkout";
import EventDetail from "./components/EventDetail";
import Header from "./components/header";
import HomepageEventList from "./components/HomepageEventList";
import SeatBooking from "./components/SeatBooking";
import AtolliBookingPage from "./components/AtolliBookingPage";
import BookingStepper from "./components/BookingStepper";
import { BaariaEvent, GroupedEventProjection } from "./types";
import { useBooking, BookingProvider } from "./contexts/BookingContext";
import { fetchEventById, fetchEvents } from "./api";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
    const location = useLocation();
    const [step, setStep] = useState(0);

    useEffect(() => {
        const path = location.pathname;
        if (path === '/') {
            setStep(0);
        } else if (path.startsWith('/evento') || path.startsWith('/blocco-atolli')) {
            setStep(2);
        } else if (path.startsWith('/checkout')) {
            setStep(3);
        } else if (path.startsWith('/richiesta-inviata') || path.startsWith('/conferma-prenotazione')) {
            setStep(4);
        } else {
            setStep(0);
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 selection:bg-[#ebdaa8]/50">
            <Header />
            <main className="container mx-auto py-2 px-4 relative">
                {step > 1 && <BookingStepper currentStep={step} />}
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
                    <Route
                        path="/blocco-atolli"
                        element={<AtolliBookingContainer />}
                    />
                    <Route path="/checkout" element={<CheckoutContainer />} />
                    <Route path="/richiesta-inviata" element={<RequestSentPage />} />
                    <Route
                        path="/conferma-prenotazione"
                        element={<TokenConfirmationPage />}
                    />
                    <Route
                        path="*"
                        element={
                            <div className="text-center py-20">
                                <h1 className="text-4xl font-bold">404 - Not Found</h1>
                            </div>
                        }
                    />
                </Routes>
            </main>
            <footer className="text-center py-10 text-gray-500 border-t mt-16">
                <p>Baarìa Film Festival &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    )
}

const HomepageContainer: React.FC = () => {
  const [events, setEvents] = useState<BaariaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resetBookingState } = useBooking();

  useEffect(() => {
    resetBookingState();
    const load = async () => {
      try {
        setEvents(await fetchEvents());
      } catch (err) {
        setError("Errore caricamento eventi.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resetBookingState]);

  if (loading)
    return (
      <div className="text-center p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-16 w-16 text-gray-400" />
      </div>
    );
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  return <HomepageEventList events={events} />;
};

const EventDetailContainer: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const {
    selectedEvent,
    setSelectedEvent,
    setSelectedProjection,
    setSelectedEventGroup,
  } = useBooking();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      navigate("/");
      return;
    }
    const load = async () => {
      setLoading(true);
      if (selectedEvent && selectedEvent.id.toString() === eventId) {
        setLoading(false);
        return;
      }
      try {
        const eventData = await fetchEventById(eventId);
        if (eventData) {
          setSelectedEvent(eventData);
        } else {
          throw new Error("Evento non trovato.");
        }
      } catch (err) {
        setError("Errore caricamento evento.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId, selectedEvent, setSelectedEvent, navigate]);

  if (loading)
    return (
      <div className="text-center p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
      </div>
    );
  if (error || !selectedEvent)
    return (
      <div className="text-center p-8 text-red-600">
        {error || "Evento non trovato."}
      </div>
    );

  return (
    <EventDetail
      event={selectedEvent}
      onSelectProjection={(p) => {
        setSelectedProjection(p);
        setSelectedEventGroup(null);
        navigate(`/evento/${selectedEvent.id}/prenota/${p.showtime_key}`);
      }}
      onBack={() => navigate(-1)}
    />
  );
};

const AtolliBookingContainer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setSelectedEvent,
    setSelectedProjection,
    setBookingQuantity,
    setSelectedEventGroup,
  } = useBooking();

  const { events: eventGroup, locationName } = (location.state || {}) as {
    events: GroupedEventProjection[];
    locationName: string;
  };

  useEffect(() => {
    if (!eventGroup || eventGroup.length === 0) {
      navigate("/", { replace: true });
    }
  }, [eventGroup, navigate]);

  if (!eventGroup || eventGroup.length === 0) {
    return (
      <div className="text-center p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
      </div>
    );
  }

  const handleProceedToCheckout = (quantity: number) => {
    const representativeEvent = eventGroup[0].event;
    const representativeProjection = eventGroup[0].projection;

    setSelectedEvent(representativeEvent);
    setSelectedEventGroup(eventGroup);
    setSelectedProjection(representativeProjection);
    setBookingQuantity(quantity);
    navigate("/checkout");
  };

  return (
    <AtolliBookingPage
      eventGroup={eventGroup}
      locationName={locationName}
      onProceedToCheckout={handleProceedToCheckout}
      onBack={() => navigate(-1)}
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
    setBookingQuantity,
    setSelectedEvent,
    setSelectedProjection,
  } = useBooking();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!eventId || !showtimeKey) {
        navigate("/", { replace: true });
        return;
      }

      setLoading(true);
      let eventToUse = selectedEvent;

      if (!eventToUse || eventToUse.id.toString() !== eventId) {
        try {
          const eventData = await fetchEventById(eventId);
          if (eventData) {
            setSelectedEvent(eventData);
            eventToUse = eventData;
          } else {
            throw new Error("Evento non trovato.");
          }
        } catch (err) {
          setError("Impossibile caricare i dati dell'evento.");
          setLoading(false);
          return;
        }
      }

      if (eventToUse) {
        const projection = eventToUse.event_details?.programmazione.find(
          (p) => p.showtime_key === showtimeKey
        );

        if (projection) {
          if (
            !selectedProjection ||
            selectedProjection.showtime_key !== projection.showtime_key
          ) {
            setSelectedProjection(projection);
          }
        } else {
          navigate(`/evento/${eventId}`, { replace: true });
        }
      }
      setLoading(false);
    };

    loadData();
  }, [
    eventId,
    showtimeKey,
    selectedEvent,
    selectedProjection,
    navigate,
    setSelectedEvent,
    setSelectedProjection,
  ]);

  if (loading || !selectedEvent || !selectedProjection)
    return (
      <div className="text-center p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
      </div>
    );

  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center gap-2"
      >
        <ChevronLeft className="h-5 w-5" /> Torna ai Dettagli
      </button>
      <div className="bg-white p-6 rounded-lg mb-8 shadow-md border">
        <h3
          className="text-2xl font-bold text-gray-900"
          dangerouslySetInnerHTML={{
            __html: decodeHtml(selectedEvent.event_details.title),
          }}
        ></h3>
        <p className="text-lg text-gray-600">{`${selectedProjection.data_formattata} - ${selectedProjection.orario}`}</p>
      </div>
      <SeatBooking
        movieId={selectedEvent.id}
        showtime={selectedProjection.showtime_key}
        projection={selectedProjection}
        onProceedToCheckout={(q) => {
          setBookingQuantity(q);
          navigate("/checkout");
        }}
      />
    </>
  );
};

const CheckoutContainer: React.FC = () => {
  const {
    selectedEvent,
    selectedProjection,
    bookingQuantity,
    setCheckoutEmail,
  } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedEvent || !selectedProjection || bookingQuantity === 0) {
      navigate("/", { replace: true });
    }
  }, [selectedEvent, selectedProjection, bookingQuantity, navigate]);

  if (!selectedEvent || !selectedProjection || bookingQuantity === 0)
    return (
      <div className="text-center p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
      </div>
    );

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center gap-2"
      >
        <ChevronLeft className="h-5 w-5" /> Torna Indietro
      </button>
      <Checkout
        eventData={selectedEvent}
        projectionData={selectedProjection}
        quantity={bookingQuantity}
        onCheckoutSuccess={(email) => {
          setCheckoutEmail(email);
          navigate("/richiesta-inviata");
        }}
      />
    </>
  );
};

const RequestSentPage: React.FC = () => {
  const { checkoutEmail, resetBookingState } = useBooking();
  const navigate = useNavigate();

  return (
    <div className="bg-white p-8 md:p-12 rounded-xl text-center max-w-md mx-auto shadow-xl border">
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
        Email di conferma inviata a: <br />{" "}
        <strong className="text-gray-800 block mt-1">
          {checkoutEmail || "Indirizzo non specificato"}
        </strong>
        .
      </p>
      <p className="mb-8 text-gray-500">
        Segui le istruzioni nella mail per completare la prenotazione. Il link
        scade in 10 minuti.
      </p>
      <button
        onClick={() => {
          resetBookingState();
          navigate("/");
        }}
        className="w-full px-6 py-3 bg-[#b08d57] text-white rounded-lg font-semibold hover:bg-opacity-90"
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
    const urlToken = new URLSearchParams(location.search).get("token");
    if (urlToken) {
      setBookingToken(urlToken);
      setToken(urlToken);
    } else {
      resetBookingState();
      navigate("/", { replace: true });
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [location.search, setBookingToken, navigate, resetBookingState]);

  if (!token)
    return (
      <div className="text-center p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-gray-400" />
      </div>
    );
  return <BookingConfirmation token={token} />;
};

function App() {
  return (
    <BookingProvider>
      <BrowserRouter basename={"/programma"}>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;