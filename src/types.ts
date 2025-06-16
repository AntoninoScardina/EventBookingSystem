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
}

export interface ImageGalleriaItem {
  url: string;
  alt?: string;
  title?: string;
  sizes?: any;
}

export interface EventDetails {
  ospite: string | null;
  descrizione_breve: ReactNode;
  categoria_evento: string;
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
}

export interface BaariaEvent {
  genere: ReactNode;
  durata_minuti: number;
  id: number;
  slug?: string;
  title: {
    rendered: string;
  };
  event_details: EventDetails;
  nextProjectionDate?: Date | null;
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
