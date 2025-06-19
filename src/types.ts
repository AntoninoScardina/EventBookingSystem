import { ReactNode } from "react";

export interface ProgrammazioneItem {
    proiezione_id: number;
    data_raw: string;
    data_formattata: string;
    orario: string;
    datetime_sort_key?: string;
    location_nome: string;
    location_indirizzo?: string;
    location_citta?: string;
    note?: string;
    showtime_key: string;
    showtime_desc: string;
    location_type: 'cinema_capitol' | 'villa_cattolica';
    vip_seats: string[];
    disabled_seats: string[];
}

export interface ImageGalleriaItem {
    url: string;
    alt?: string;
}

export interface EventDetails {
    id: number;
    title: string;
    sinossi: string | null;
    descrizione_completa: string | null;
    locandina_url: string | null;
    trailer_video_url?: string | null;
    cast: string | null;
    durata_minuti: number;
    regia: string | null;
    anno_produzione: number | null;
    tipo_film: string | null;
    galleria_immagini: ImageGalleriaItem[];
    montaggio: string | null;
    fotografia: string | null;
    musica: string | null;
    genere: string | null;
    location_produzione: string | null;
    sceneggiatura: string | null;
    coproduzione: string | null;
    casa_produzione: string | null;
    paese_produzione: string | null;
    programmazione: ProgrammazioneItem[];
    bookings_enabled: boolean;
    booking_not_required: boolean;
    booking_status_message: string;
    location_principale: string;
    categoria_evento: string;
    descrizione_breve: ReactNode;
}

export interface BaariaEvent {
    id: number;
    slug?: string;
    title: {
        rendered: string;
    };
    event_details: EventDetails;
    genere: ReactNode;
    durata_minuti: number;
}

export interface Booking {
    id?: number;
    name: string;
    email: string;
    phone: string;
    movie_id: number;
    movie_name?: string;
    proiezione_id: number;
    location_name?: string;
    location_address?: string;
    showtime?: string;
    showtime_key: string;
    seats: string[];
}

export interface Location {
  id: string | number;
  name: string;
  address: string;
  city: string;
  image: string;
  phone?: string;
  email?: string;
}

export interface GroupedEventProjection {
  event: BaariaEvent;
  projection: ProgrammazioneItem;
}

export interface EventsByDate {
  [dateKey: string]: GroupedEventProjection[];
}

export interface ProcessedHomepageData {
  byDate: EventsByDate;
  toBeAnnounced: BaariaEvent[];
}