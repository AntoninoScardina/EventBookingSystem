import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { BaariaEvent, ProgrammazioneItem } from '../types';

interface BookingContextType {
  selectedEvent: BaariaEvent | null;
  setSelectedEvent: (event: BaariaEvent | null) => void;
  selectedProjection: ProgrammazioneItem | null;
  setSelectedProjection: (projection: ProgrammazioneItem | null) => void;
  selectedSeats: string[];
  setSelectedSeats: (seats: string[]) => void;
  checkoutEmail: string | null;
  setCheckoutEmail: (email: string | null) => void;
  bookingToken: string | null;
  setBookingToken: (token: string | null) => void;
  resetBookingState: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedEvent, setSelectedEvent] = useState<BaariaEvent | null>(null);
  const [selectedProjection, setSelectedProjection] = useState<ProgrammazioneItem | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [checkoutEmail, setCheckoutEmail] = useState<string | null>(null);
  const [bookingToken, setBookingToken] = useState<string | null>(null);

  const memoizedSetSelectedEvent = useCallback((event: BaariaEvent | null) => {
    setSelectedEvent(event);
  }, []);

  const memoizedSetSelectedProjection = useCallback((projection: ProgrammazioneItem | null) => {
    setSelectedProjection(projection);
  }, []);

  const memoizedSetSelectedSeats = useCallback((seats: string[]) => {
    setSelectedSeats(seats);
  }, []);

  const memoizedSetCheckoutEmail = useCallback((email: string | null) => {
    setCheckoutEmail(email);
  }, []);

  const memoizedSetBookingToken = useCallback((token: string | null) => {
    setBookingToken(token);
  }, []);

  const memoizedResetBookingState = useCallback(() => {
    setSelectedEvent(null);
    setSelectedProjection(null);
    setSelectedSeats([]);
    setCheckoutEmail(null);
    // setBookingToken(null); // Forse vuoi resettare anche il token qui? Dipende dalla logica.
  }, []);

  const contextValue = useMemo(() => ({
    selectedEvent,
    setSelectedEvent: memoizedSetSelectedEvent,
    selectedProjection,
    setSelectedProjection: memoizedSetSelectedProjection,
    selectedSeats,
    setSelectedSeats: memoizedSetSelectedSeats,
    checkoutEmail,
    setCheckoutEmail: memoizedSetCheckoutEmail,
    bookingToken,
    setBookingToken: memoizedSetBookingToken,
    resetBookingState: memoizedResetBookingState,
  }), [
    selectedEvent, memoizedSetSelectedEvent,
    selectedProjection, memoizedSetSelectedProjection,
    selectedSeats, memoizedSetSelectedSeats,
    checkoutEmail, memoizedSetCheckoutEmail,
    bookingToken, memoizedSetBookingToken,
    memoizedResetBookingState
  ]);

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