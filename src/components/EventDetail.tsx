import React from "react";
import { BaariaEvent, ProgrammazioneItem, EventDetails } from "../types";
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Image as ImageIcon,
  Info,
  ChevronLeft,
  Ticket,
  Users as UsersIcon,
  Edit3,
  Globe,
  Building,
  Landmark,
  Film as FilmIcon,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface EventDetailProps {
  event: BaariaEvent;
  onSelectProjection: (projection: ProgrammazioneItem) => void;
  onBack: () => void;
}

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null | boolean;
  icon?: React.ElementType;
  isHtml?: boolean;
}> = ({ label, value, icon: Icon, isHtml }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start py-2">
      {Icon && (
        <Icon size={18} className="mr-3 mt-1 text-[#ebdaa8] flex-shrink-0" />
      )}
      <div>
        <span className="font-semibold text-gray-200">{label}: </span>
        {isHtml && typeof value === "string" ? (
          <span
            className="text-gray-300"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <span className="text-gray-300">
            {typeof value === "boolean" ? (value ? "Sì" : "No") : value}
          </span>
        )}
      </div>
    </div>
  );
};

const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const EventDetail: React.FC<EventDetailProps> = ({
  event,
  onSelectProjection,
  onBack,
}) => {
  const details: EventDetails | undefined = event.event_details;

  if (!details) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-xl text-gray-300">
          Dettagli dell'evento non disponibili.
        </p>
        <button
          onClick={onBack}
          className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center gap-2 transition-colors duration-200 shadow hover:shadow-lg mx-auto"
        >
          <ChevronLeft className="h-5 w-5" /> Torna Indietro
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center gap-2 transition-colors duration-200 shadow hover:shadow-lg"
      >
        <ChevronLeft className="h-5 w-5" /> Torna Indietro
      </button>

      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/5 xl:w-1/3">
            <img
              src={
                details.locandina_url ||
                "https://placehold.co/400x600/3A3A3A/EAA949?text=Evento"
              }
              alt={`Locandina ${details.title}`}
              className="w-full h-auto object-contain md:object-cover md:max-h-[700px]"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://placehold.co/400x600/3A3A3A/EAA949?text=Locandina+Non+Disponibile")
              }
            />
          </div>
          <div className="p-6 md:p-8 md:w-3/5 xl:w-2/3">
            <h1
              className="text-4xl lg:text-5xl font-extrabold text-[#ebdaa8] mb-3 tracking-tight"
              dangerouslySetInnerHTML={{ __html: decodeHtml(details.title) }}
            ></h1>
            <div className="flex flex-wrap gap-x-3 gap-y-2 mb-5">
              {details.genere && (
                <span className="bg-gray-700 px-3 py-1.5 rounded-full text-xs font-medium text-gray-200 shadow">
                  {details.genere}
                </span>
              )}
              {details.tipo_film && (
                <span className="bg-gray-700 px-3 py-1.5 rounded-full text-xs font-medium text-gray-200 shadow">
                  {details.tipo_film}
                </span>
              )}
              {details.durata_minuti > 0 && (
                <span className="bg-gray-700 px-3 py-1.5 rounded-full text-xs font-medium text-gray-200 flex items-center shadow">
                  <Clock size={14} className="mr-1.5" />{" "}
                  {Math.floor(details.durata_minuti / 60)}h{" "}
                  {details.durata_minuti % 60}min
                </span>
              )}
              {details.anno_produzione && (
                <span className="bg-gray-700 px-3 py-1.5 rounded-full text-xs font-medium text-gray-200 shadow">
                  Anno: {details.anno_produzione}
                </span>
              )}
            </div>

            <div className="prose prose-lg prose-invert max-w-none text-gray-300 mb-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-2 border-b border-gray-700 pb-2">
                Sinossi
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {details.sinossi || "Nessuna sinossi disponibile."}
              </p>
              {details.descrizione_completa &&
                details.descrizione_completa.replace(/<[^>]*>/g, "").trim() !==
                  (details.sinossi || "").replace(/<[^>]*>/g, "").trim() && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-2 border-b border-gray-700 pb-2">
                      Descrizione Completa
                    </h3>
                    <div
                      className="text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: details.descrizione_completa,
                      }}
                    />
                  </>
                )}
            </div>

            {details.trailer_video_url && (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-100 mb-3 border-b border-gray-700 pb-2 flex items-center">
                  <Video size={22} className="mr-2 text-[#ebdaa8]" />
                  Trailer
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  <video
                    controls
                    width="100%"
                    src={details.trailer_video_url}
                    className="w-full h-full bg-black"
                  >
                    Il tuo browser non supporta il tag video. Puoi scaricare il
                    video{" "}
                    <a
                      href={details.trailer_video_url}
                      download
                      className="underline"
                    >
                      qui
                    </a>
                    .
                  </video>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-gray-700/50">
          <h3 className="text-2xl font-semibold text-gray-100 mb-4 flex items-center">
            <Info size={24} className="mr-2 text-[#ebdaa8]" />
            Crediti e Dettagli Tecnici
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-gray-300">
            <DetailItem label="Regia" value={details.regia} icon={FilmIcon} />
            <DetailItem label="Cast" value={details.cast} icon={UsersIcon} />
            <DetailItem
              label="Sceneggiatura"
              value={details.sceneggiatura}
              icon={Edit3}
            />
            <DetailItem
              label="Fotografia"
              value={details.fotografia}
              icon={ImageIcon}
            />
            <DetailItem
              label="Montaggio"
              value={details.montaggio}
              icon={Info}
            />
            <DetailItem label="Musica" value={details.musica} icon={Info} />
            <DetailItem
              label="Casa di Produzione"
              value={details.casa_produzione}
              icon={Building}
            />
            {details.coproduzione && (
              <DetailItem
                label="Coproduzione"
                value={details.coproduzione}
                icon={Building}
              />
            )}
            <DetailItem
              label="Paese di Produzione"
              value={details.paese_produzione}
              icon={Globe}
            />
            {details.location_produzione && (
              <DetailItem
                label="Location di Produzione"
                value={details.location_produzione}
                icon={Landmark}
              />
            )}
          </div>
        </div>

        {details.galleria_immagini && details.galleria_immagini.length > 0 && (
          <div className="p-6 md:p-8 border-t border-gray-700/50">
            <h3 className="text-2xl font-semibold text-gray-100 mb-4 flex items-center">
              <ImageIcon size={24} className="mr-2 text-[#ebdaa8]" />
              Galleria Fotografica
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {details.galleria_immagini.map((image, index) => (
                <a
                  key={index}
                  href={image.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden aspect-w-1 aspect-h-1 hover:opacity-80 transition-opacity shadow-md"
                >
                  <img
                    src={image.url}
                    alt={
                      image.alt || `Immagine ${index + 1} per ${details.title}`
                    }
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/200x200/3A3A3A/EAA949?text=IMG")
                    }
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 md:p-8 border-t border-gray-700/50">
          <h3 className="text-2xl font-semibold text-gray-100 mb-5 flex items-center">
            <CalendarDays size={24} className="mr-2 text-[#ebdaa8]" />
            Programmazione e Prenotazioni
          </h3>

          {details.booking_status_message && (
            <div
              className={`mb-4 p-4 border rounded-md flex items-center gap-3 shadow
                ${
                  details.booking_not_required
                    ? "bg-blue-800/30 border-blue-700 text-blue-300"
                    : !details.bookings_enabled
                    ? "bg-yellow-800/30 border-yellow-700 text-yellow-300"
                    : "bg-green-800/30 border-green-700 text-green-300"
                }`}
            >
              {details.booking_not_required ? (
                <CheckCircle2 size={20} />
              ) : !details.bookings_enabled ? (
                <AlertTriangle size={20} />
              ) : (
                <Ticket size={20} />
              )}
              <p>{details.booking_status_message}</p>
            </div>
          )}

          {details.programmazione && details.programmazione.length > 0 ? (
            <div className="space-y-4">
              {details.programmazione.map((prog) => (
                <div
                  key={prog.showtime_key}
                  className="bg-gray-700/70 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex-grow">
                    <p className="font-semibold text-lg text-gray-100">
                      {prog.data_formattata} - Ore {prog.orario}
                    </p>
                    <p className="text-gray-300 flex items-center text-sm">
                      <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                      {prog.location_nome}
                      {prog.location_citta ? `, ${prog.location_citta}` : ""}
                    </p>
                    {prog.location_indirizzo && (
                      <p className="text-xs text-gray-400 ml-5">
                        {prog.location_indirizzo}
                      </p>
                    )}
                    {prog.note && (
                      <p className="text-xs text-gray-400 mt-1 italic ml-5">
                        Note: {prog.note}
                      </p>
                    )}
                  </div>

                  {details.bookings_enabled &&
                    !details.booking_not_required && (
                      <button
                        onClick={() => onSelectProjection(prog)}
                        className="w-full sm:w-auto mt-3 sm:mt-0 px-5 py-2.5 bg-[#ebdaa8] text-[#2d2d2d] rounded-md font-semibold hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center gap-2 text-sm shadow hover:shadow-lg"
                        aria-label={`Prenota posti per ${details.title} il ${prog.data_formattata} alle ${prog.orario}`}
                      >
                        <Ticket size={16} /> Prenota Posti
                      </button>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">
              Nessuna proiezione attualmente programmata per questo evento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
