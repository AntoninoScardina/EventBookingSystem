import { createContext, ReactNode, useState, useCallback, useMemo, useContext } from "react";
import { BaariaEvent, ProgrammazioneItem, GroupedEventProjection } from "../types";

interface BookingContextType {
    selectedEvent: BaariaEvent | null;
    setSelectedEvent: (event: BaariaEvent | null) => void;
    selectedEventGroup: GroupedEventProjection[] | null;
    setSelectedEventGroup: (group: GroupedEventProjection[] | null) => void;
    selectedProjection: ProgrammazioneItem | null;
    setSelectedProjection: (projection: ProgrammazioneItem | null) => void;
    bookingQuantity: number;
    setBookingQuantity: (quantity: number) => void;
    checkoutEmail: string | null;
    setCheckoutEmail: (email: string | null) => void;
    bookingToken: string | null;
    setBookingToken: (token: string | null) => void;
    resetBookingState: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedEvent, setSelectedEvent] = useState<BaariaEvent | null>(null);
    const [selectedEventGroup, setSelectedEventGroup] = useState<GroupedEventProjection[] | null>(null);
    const [selectedProjection, setSelectedProjection] = useState<ProgrammazioneItem | null>(null);
    const [bookingQuantity, setBookingQuantity] = useState(1);
    const [checkoutEmail, setCheckoutEmail] = useState<string | null>(null);
    const [bookingToken, setBookingToken] = useState<string | null>(null);

    const resetBookingState = useCallback(() => {
        setSelectedEvent(null);
        setSelectedEventGroup(null);
        setSelectedProjection(null);
        setBookingQuantity(1);
        setCheckoutEmail(null);
        setBookingToken(null);
    }, []);

    const contextValue = useMemo(() => ({
        selectedEvent,
        setSelectedEvent,
        selectedEventGroup,
        setSelectedEventGroup,
        selectedProjection,
        setSelectedProjection,
        bookingQuantity,
        setBookingQuantity,
        checkoutEmail,
        setCheckoutEmail,
        bookingToken,
        setBookingToken,
        resetBookingState,
    }), [selectedEvent, selectedEventGroup, selectedProjection, bookingQuantity, checkoutEmail, bookingToken, resetBookingState]);

    return (
        <BookingContext.Provider value={contextValue}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = (): BookingContextType => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};