import axios from "axios";
import { BaariaEvent, EventDetails, ProgrammazioneItem } from "./types";

const WORDPRESS_DOMAIN = 'https://www.baariafilmfestival.com';
const WORDPRESS_API_URL_WP_V2 = `${WORDPRESS_DOMAIN}/wp-json/wp/v2`;
const WORDPRESS_API_URL_BAARIA_V1 = `${WORDPRESS_DOMAIN}/wp-json/baaria/v1`;

const parseEventData = (eventPayload: any): BaariaEvent => {
    const details = eventPayload.event_details || {};
    const programmazione: ProgrammazioneItem[] = (details.programmazione || []).map((prog: any) => ({
        proiezione_id: prog.proiezione_id,
        data_raw: prog.data_raw,
        data_formattata: prog.data_formattata,
        orario: prog.orario,
        datetime_sort_key: prog.datetime_sort_key,
        location_nome: prog.location_nome,
        location_indirizzo: prog.location_indirizzo,
        location_citta: prog.location_citta,
        note: prog.note,
        showtime_key: prog.showtime_key,
        showtime_desc: prog.showtime_desc,
        location_type: prog.location_type || 'cinema_capitol',
        vip_seats: prog.vip_seats || [],
        disabled_seats: prog.disabled_seats || [],
    }));

    const eventDetailsData: EventDetails = {
        id: details.id || eventPayload.id,
        title: details.title || eventPayload.title?.rendered || 'Titolo Mancante',
        sinossi: details.sinossi || null,
        descrizione_completa: details.descrizione_completa || null,
        locandina_url: details.locandina_url || 'https://placehold.co/300x450/333333/EAA949?text=Poster',
        trailer_video_url: details.trailer_video_url || null,
        cast: details.cast || null,
        durata_minuti: details.durata_minuti || 0,
        regia: details.regia || null,
        anno_produzione: details.anno_produzione || null,
        tipo_film: details.tipo_film || null,
        galleria_immagini: details.galleria_immagini || [],
        montaggio: details.montaggio || null,
        fotografia: details.fotografia || null,
        musica: details.musica || null,
        genere: details.genere || null,
        location_produzione: details.location_produzione || null,
        sceneggiatura: details.sceneggiatura || null,
        coproduzione: details.coproduzione || null,
        casa_produzione: details.casa_produzione || null,
        paese_produzione: details.paese_produzione || null,
        programmazione: programmazione,
        bookings_enabled: details.bookings_enabled === undefined ? true : !!details.bookings_enabled,
        booking_not_required: !!details.booking_not_required,
        booking_status_message: details.booking_status_message || '',
        categoria_evento: details.categoria_evento || 'Generale',
        descrizione_breve: details.descrizione_breve || '',
        location_principale: details.location_principale || 'Sede da definire',
    };

    return {
        id: eventPayload.id,
        slug: eventPayload.slug,
        title: eventPayload.title,
        event_details: eventDetailsData,
        genere: details.genere || null,
        durata_minuti: details.durata_minuti || 0,
    };
};

export const fetchEvents = async (): Promise<BaariaEvent[]> => {
    const response = await axios.get<any[]>(`${WORDPRESS_API_URL_WP_V2}/movie?per_page=100&_fields=id,slug,title,event_details`);
    return response.data.map(parseEventData);
};

export const fetchEventById = async (id: string): Promise<BaariaEvent | null> => {
    if (!id) return null;
    const response = await axios.get<any>(`${WORDPRESS_API_URL_WP_V2}/movie/${id}?_fields=id,slug,title,event_details`);
    return response.data ? parseEventData(response.data) : null;
};

export const fetchOccupiedSeats = async (movieId: number, showtimeKey: string): Promise<string[]> => {
    const response = await axios.get<{ occupiedSeats: string[] }>(
        `${WORDPRESS_API_URL_BAARIA_V1}/occupied-seats?movie_id=${movieId}&showtime_key=${encodeURIComponent(showtimeKey)}`
    );
    return response.data?.occupiedSeats || [];
};

export const requestBookingWithPdf = async (bookingData: { name: string; email: string; phone: string; movie_id: number; proiezione_id: number; quantity: number; }) => {
    return axios.post(`${WORDPRESS_API_URL_BAARIA_V1}/booking-with-pdf`, bookingData);
};

export const checkTokenValidity = async (token: string) => {
    return axios.get(`${WORDPRESS_API_URL_BAARIA_V1}/check-token?token=${token}`);
};

export const confirmBookingWithPdf = async (token: string) => {
    return axios.post(`${WORDPRESS_API_URL_BAARIA_V1}/confirm-booking-with-pdf`, { token });
};