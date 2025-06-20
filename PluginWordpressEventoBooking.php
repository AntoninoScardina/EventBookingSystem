<?php
/**
 * Plugin Name: Baarìa Film Festival - Sistema di Prenotazione Eventi
 * Plugin URI:  https://www.baariafilmfestival.com
 * Description: Gestisce le prenotazioni per gli eventi del Baarìa Film Festival, con CPT Proiezioni e campi ACF programmatici.
 * Version:     1.5.2
 * Author:      Antonino Scardina
 * Author URI:  https://www.antoninoscardina.com
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: baaria-booking
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('BAARIA_REACT_APP_URL', 'https://www.baariafilmfestival.com/programma');
define('BAARIA_BOOKING_NAMESPACE', 'baaria/v1');
define('BAARIA_FROM_EMAIL', 'Baarìa Film Festival <noreply@baariafilmfestival.com>');

register_activation_hook(__FILE__, 'baaria_booking_activate_v10');
function baaria_booking_activate_v10()
{
    baaria_register_event_post_types_v10();
    flush_rewrite_rules();
}

register_deactivation_hook(__FILE__, 'baaria_booking_deactivate_v10');
function baaria_booking_deactivate_v10()
{
    flush_rewrite_rules();
}

add_action('init', 'baaria_register_event_post_types_v10');
function baaria_register_event_post_types_v10()
{
    register_post_type('movie', [
        'labels' => ['name' => 'Eventi Film', 'singular_name' => 'Evento Film'],
        'public' => true,
        'publicly_queryable' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
        'menu_icon' => 'dashicons-tickets-alt',
        'rewrite' => ['slug' => 'eventi-film'],
    ]);

    register_post_type('proiezione', [
        'labels' => ['name' => 'Proiezioni', 'singular_name' => 'Proiezione'],
        'public' => true,
        'publicly_queryable' => false,
        'show_ui' => true,
        'show_in_menu' => 'edit.php?post_type=movie',
        'show_in_rest' => true,
        'supports' => ['title', 'custom-fields'],
        'rewrite' => ['slug' => 'proiezioni'],
    ]);
    
    register_post_type('booking', [
        'labels' => ['name' => 'Prenotazioni', 'singular_name' => 'Prenotazione'],
        'public' => false,
        'publicly_queryable' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'supports' => ['title', 'custom-fields'],
    ]);
}

add_action('acf/init', 'baaria_acf_add_local_field_groups_v10');
function baaria_acf_add_local_field_groups_v10()
{
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group(array(
        'key' => 'group_event_movie_details_v10',
        'title' => 'Dettagli Evento Film (Baarìa)',
        'fields' => array(
            array('key' => 'field_event_location_principale_v10', 'label' => 'Location Principale', 'name' => 'location_principale', 'type' => 'text', 'required' => 1),
            array('key' => 'field_event_categoria_v10', 'label' => 'Categoria Evento', 'name' => 'categoria_evento', 'type' => 'text', 'required' => 1),
            array('key' => 'field_event_desc_breve_v10', 'label' => 'Descrizione Breve (sottotitolo)', 'name' => 'descrizione_breve', 'type' => 'text'),
            array('key' => 'field_event_sinossi_v10', 'label' => 'Sinossi', 'name' => 'sinossi_film', 'type' => 'textarea'),
            array('key' => 'field_event_trailer_file_v10', 'label' => 'Carica Trailer Video', 'name' => 'trailer_file', 'type' => 'file', 'return_format' => 'id'),
            array('key' => 'field_event_cast_v10', 'label' => 'Cast Principale', 'name' => 'cast_film', 'type' => 'textarea'),
            array('key' => 'field_event_durata_v10', 'label' => 'Durata (in minuti)', 'name' => 'durata_film', 'type' => 'number'),
            array('key' => 'field_event_regia_v10', 'label' => 'Regia', 'name' => 'regia_film', 'type' => 'text'),
            array('key' => 'field_event_anno_v10', 'label' => 'Anno di Produzione', 'name' => 'anno_produzione', 'type' => 'number'),
            array('key' => 'field_event_tipo_v10', 'label' => 'Tipo Film/Evento', 'name' => 'tipo_lungometraggio', 'type' => 'select', 'choices' => ['' => 'Nessuno', 'lungometraggio' => 'Lungometraggio', 'cortometraggio' => 'Cortometraggio', 'documentario' => 'Documentario', 'animazione' => 'Animazione', 'incontro' => 'Incontro/Masterclass', 'altro' => 'Altro'], 'allow_null' => 1, 'ui' => 1),
            array('key' => 'field_event_galleria_v10', 'label' => 'Galleria Immagini', 'name' => 'galleria_film', 'type' => 'gallery', 'return_format' => 'array'),
            array('key' => 'field_event_montaggio_v10', 'label' => 'Montaggio', 'name' => 'montaggio_film', 'type' => 'text'),
            array('key' => 'field_event_fotografia_v10', 'label' => 'Fotografia', 'name' => 'fotografia_film', 'type' => 'text'),
            array('key' => 'field_event_musica_v10', 'label' => 'Musica', 'name' => 'musica_film', 'type' => 'text'),
            array('key' => 'field_event_genere_v10', 'label' => 'Genere/i', 'name' => 'genere_film', 'type' => 'text'),
            array('key' => 'field_event_loc_produzione_v10', 'label' => 'Location di Produzione', 'name' => 'location_produzione', 'type' => 'text'),
            array('key' => 'field_event_sceneggiatura_v10', 'label' => 'Sceneggiatura', 'name' => 'sceneggiatura_film', 'type' => 'text'),
            array('key' => 'field_event_coproduzione_v10', 'label' => 'Coproduzione', 'name' => 'coproduzione_film', 'type' => 'text'),
            array('key' => 'field_event_casa_produzione_v10', 'label' => 'Casa di Produzione', 'name' => 'casa_produzione', 'type' => 'text'),
            array('key' => 'field_event_paese_produzione_v10', 'label' => 'Paese di Produzione', 'name' => 'paese_produzione', 'type' => 'text'),
        ),
        'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'movie'))),
    ));

    acf_add_local_field_group(array(
        'key' => 'group_proiezione_details_v10',
        'title' => 'Dettagli Proiezione (Baarìa)',
        'fields' => array(
            array('key' => 'field_proiezione_evento_film_v10', 'label' => 'Evento/i Film Associato/i', 'name' => 'evento_film_associato', 'type' => 'post_object', 'post_type' => array('movie'), 'allow_null' => 0, 'multiple' => 1, 'return_format' => 'id', 'ui' => 1, 'required' => 1, 'instructions' => 'Seleziona l\'evento o gli eventi (per blocchi) associati a questa proiezione. L\'ordine di selezione sarà rispettato.'),
            array('key' => 'field_proiezione_data_v10', 'label' => 'Data Proiezione', 'name' => 'data_proiezione', 'type' => 'date_picker', 'display_format' => 'd/m/Y', 'return_format' => 'Ymd', 'required' => 1),
            array('key' => 'field_proiezione_orario_v10', 'label' => 'Orario Proiezione', 'name' => 'orario_proiezione', 'type' => 'time_picker', 'display_format' => 'H:i', 'return_format' => 'H:i', 'required' => 1),
            array('key' => 'field_proiezione_location_type_v10', 'label' => 'Layout Sala', 'name' => 'location_type', 'type' => 'select', 'choices' => ['cinema_capitol' => 'Cinema Capitol', 'villa_cattolica' => 'Villa Cattolica'], 'default_value' => 'cinema_capitol', 'required' => 1, 'ui' => 1),
            array('key' => 'field_proiezione_enable_bookings_v10', 'label' => 'Gestione Prenotazioni', 'name' => 'proiezione_enable_bookings', 'type' => 'true_false', 'message' => 'Abilita prenotazioni per questa specifica proiezione', 'ui' => 1, 'ui_on_text' => 'Aperte', 'ui_off_text' => 'Chiuse', 'default_value' => 1),
            array('key' => 'field_proiezione_booking_not_required_v10', 'label' => 'Prenotazione Non Necessaria', 'name' => 'proiezione_booking_not_required', 'type' => 'true_false', 'message' => 'Spunta se per questa proiezione non è richiesta la prenotazione (es. ingresso libero)', 'ui' => 1, 'ui_on_text' => 'Non Richiesta', 'ui_off_text' => 'Richiesta', 'default_value' => 0),
            array('key' => 'field_proiezione_booking_disabled_message_v10', 'label' => 'Messaggio Prenotazioni Chiuse (Opzionale)', 'name' => 'proiezione_booking_disabled_message', 'type' => 'text', 'default_value' => 'Le prenotazioni per questo evento non sono ancora disponibili.'),
            array('key' => 'field_proiezione_blocco_prenotabile_v10', 'label' => 'Blocco di Eventi (Prenotazione Unica)', 'name' => 'blocco_prenotabile', 'type' => 'true_false', 'instructions' => 'Attiva se questa proiezione contiene un blocco di più eventi (es. cortometraggi).', 'ui' => 1, 'default_value' => 0),
            array('key' => 'field_proiezione_max_seats_v10', 'label' => 'Massimo Posti per Prenotazione', 'name' => 'max_seats_per_booking', 'type' => 'number', 'instructions' => 'Numero massimo di posti che un utente può prenotare. Lasciare vuoto per il default (4).', 'default_value' => 4, 'min' => 1),
            array('key' => 'field_proiezione_vip_seats_v10', 'label' => 'Posti VIP/Riservati', 'name' => 'vip_seats', 'type' => 'textarea', 'instructions' => 'Posti riservati, separati da virgola (es. A1,A2).'),
            array('key' => 'field_proiezione_disabled_seats_v10', 'label' => 'Posti Disabilitati', 'name' => 'disabled_seats', 'type' => 'textarea', 'instructions' => 'Posti non disponibili, separati da virgola (es. C5,D8).'),
            array('key' => 'field_proiezione_nome_location_v10', 'label' => 'Nome Location (Sovrascrive)', 'name' => 'nome_location_proiezione', 'type' => 'text'),
            array('key' => 'field_proiezione_indirizzo_location_v10', 'label' => 'Indirizzo Location', 'name' => 'indirizzo_location_proiezione', 'type' => 'textarea', 'rows' => 2),
            array('key' => 'field_proiezione_citta_location_v10', 'label' => 'Città Location', 'name' => 'citta_location_proiezione', 'type' => 'text'),
            array('key' => 'field_proiezione_note_v10', 'label' => 'Note Aggiuntive (opzionale)', 'name' => 'note_aggiuntive_proiezione', 'type' => 'text'),
        ),
        'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'proiezione'))),
    ));
}

add_action('rest_api_init', 'baaria_register_custom_rest_fields_v10');
function baaria_register_custom_rest_fields_v10()
{
    if (!function_exists('get_field')) return;

    register_rest_field('movie', 'event_details', [
        'get_callback' => function ($post_array) {
            $post_id = $post_array['id'];
            $event_data = [
                'id' => $post_id,
                'title' => get_the_title($post_id),
                'location_principale' => get_field('location_principale', $post_id) ?: 'Sede da definire',
                'categoria_evento' => get_field('categoria_evento', $post_id) ?: 'Generale',
                'descrizione_breve' => get_field('descrizione_breve', $post_id) ?: '',
                'sinossi' => get_field('sinossi_film', $post_id) ?: '',
                'descrizione_completa' => apply_filters('the_content', get_post_field('post_content', $post_id)),
                'locandina_url' => get_the_post_thumbnail_url($post_id, 'full') ?: null,
                'trailer_video_url' => ($trailer_id = get_field('trailer_file', $post_id)) ? wp_get_attachment_url($trailer_id) : '',
                'cast' => get_field('cast_film', $post_id) ?: '',
                'durata_minuti' => get_field('durata_film', $post_id) ? intval(get_field('durata_film', $post_id)) : 0,
                'regia' => get_field('regia_film', $post_id) ?: '',
                'anno_produzione' => get_field('anno_produzione', $post_id) ? intval(get_field('anno_produzione', $post_id)) : null,
                'tipo_film' => get_field('tipo_lungometraggio', $post_id) ?: '',
                'galleria_immagini' => array_map(function($img){ if (is_array($img)) return ['url' => $img['url'], 'alt' => $img['alt'] ?: '']; return null; }, get_field('galleria_film', $post_id) ?: []),
                'montaggio' => get_field('montaggio_film', $post_id) ?: '',
                'fotografia' => get_field('fotografia_film', $post_id) ?: '',
                'musica' => get_field('musica_film', $post_id) ?: '',
                'genere' => get_field('genere_film', $post_id) ?: '',
                'location_produzione' => get_field('location_produzione', $post_id) ?: '',
                'sceneggiatura' => get_field('sceneggiatura_film', $post_id) ?: '',
                'coproduzione' => get_field('coproduzione_film', $post_id) ?: '',
                'casa_produzione' => get_field('casa_produzione', $post_id) ?: '',
                'paese_produzione' => get_field('paese_produzione', $post_id) ?: '',
                'programmazione' => [],
            ];
            
            $proiezioni_query = new WP_Query([
                'post_type' => 'proiezione', 
                'posts_per_page' => -1, 
                'meta_query' => [['key' => 'evento_film_associato', 'value' => '"' . $post_id . '"', 'compare' => 'LIKE']],
                'orderby' => 'meta_value', 'meta_key' => 'data_proiezione', 'order' => 'ASC'
            ]);
            
            if ($proiezioni_query->have_posts()) {
                while ($proiezioni_query->have_posts()) {
                    $proiezioni_query->the_post();
                    $proiezione_id = get_the_ID();
                    $data_raw = get_field('data_proiezione', $proiezione_id);
                    $orario_raw = get_field('orario_proiezione', $proiezione_id);
                    $date_obj = $data_raw ? DateTime::createFromFormat('Ymd', $data_raw) : null;
                    
                    $location_override = get_field('nome_location_proiezione', $proiezione_id);
                    $location_finale = !empty($location_override) ? $location_override : $event_data['location_principale'];

                    $enable_bookings = get_field('proiezione_enable_bookings', $proiezione_id);
                    $booking_not_required = get_field('proiezione_booking_not_required', $proiezione_id);
                    $booking_status_message = $booking_not_required ? 'Ingresso libero, prenotazione non necessaria.' : (!$enable_bookings ? (get_field('proiezione_booking_disabled_message', $proiezione_id) ?: 'Le prenotazioni per questa proiezione sono terminate.') : 'Prenotazione disponibile.');

                    $associated_movie_ids = get_field('evento_film_associato', $proiezione_id);

                    $event_data['programmazione'][] = [
                        'proiezione_id' => $proiezione_id,
                        'data_raw' => $data_raw,
                        'data_formattata' => $date_obj ? date_i18n(get_option('date_format'), $date_obj->getTimestamp()) : '',
                        'orario' => $orario_raw,
                        'datetime_sort_key' => $data_raw . str_replace(':', '', $orario_raw),
                        'location_nome' => $location_finale,
                        'location_indirizzo' => get_field('indirizzo_location_proiezione', $proiezione_id) ?: '',
                        'location_citta' => get_field('citta_location_proiezione', $proiezione_id) ?: '',
                        'note' => get_field('note_aggiuntive_proiezione', $proiezione_id) ?: '',
                        'showtime_key' => 'proj_' . $proiezione_id,
                        'location_type' => get_field('location_type', $proiezione_id) ?: 'cinema_capitol',
                        'max_seats_per_booking' => (int)get_field('max_seats_per_booking', $proiezione_id) ?: 4,
                        'vip_seats' => array_map('trim', explode(',', get_field('vip_seats', $proiezione_id) ?: '')),
                        'disabled_seats' => array_map('trim', explode(',', get_field('disabled_seats', $proiezione_id) ?: '')),
                        'bookings_enabled' => (bool) $enable_bookings,
                        'booking_not_required' => (bool) $booking_not_required,
                        'booking_status_message' => $booking_status_message,
                        'blocco_prenotabile' => (bool) get_field('blocco_prenotabile', $proiezione_id),
                        'associated_movie_ids' => is_array($associated_movie_ids) ? array_map('intval', $associated_movie_ids) : [],
                    ];
                }
                wp_reset_postdata();
                usort($event_data['programmazione'], fn($a, $b) => strcmp($a['datetime_sort_key'], $b['datetime_sort_key']));
            }
            return $event_data;
        }
    ]);
}

add_action('rest_api_init', 'baaria_register_booking_api_routes_v10');
function baaria_register_booking_api_routes_v10()
{
    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/booking-with-pdf', ['methods'  => 'POST', 'callback' => 'baaria_handle_booking_with_pdf_request_v10', 'permission_callback' => '__return_true']);
    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/confirm-booking-with-pdf', ['methods'  => 'POST', 'callback' => 'baaria_handle_confirm_booking_with_pdf_request_v10', 'permission_callback' => '__return_true']);
    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/occupied-seats', ['methods'  => 'GET', 'callback' => 'baaria_get_occupied_seats_request_v10', 'permission_callback' => '__return_true']);
    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/check-token', ['methods'  => 'GET', 'callback' => 'baaria_check_confirmation_token_request_v10', 'permission_callback' => '__return_true']);
}

function baaria_handle_booking_with_pdf_request_v10(WP_REST_Request $request)
{
    $name = sanitize_text_field($request->get_param('name'));
    $email = sanitize_email($request->get_param('email'));
    $phone = sanitize_text_field($request->get_param('phone'));
    $proiezione_id = intval($request->get_param('proiezione_id'));
    $quantity = intval($request->get_param('quantity'));
    $max_seats = (int)get_field('max_seats_per_booking', $proiezione_id) ?: 4;

    if (empty($name) || !is_email($email) || empty($proiezione_id) || $quantity <= 0) {
        return new WP_REST_Response(['success' => false, 'message' => 'Dati mancanti o non validi.'], 400);
    }
    
    if ($quantity > $max_seats) {
        return new WP_REST_Response(['success' => false, 'message' => 'È possibile prenotare un massimo di ' . $max_seats . ' posti.'], 400);
    }

    if (get_field('proiezione_booking_not_required', $proiezione_id) || !get_field('proiezione_enable_bookings', $proiezione_id)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Prenotazioni non attive per questa proiezione.'], 403);
    }

    $showtime_key = 'proj_' . $proiezione_id;
    $occupied_seats_meta_key = '_occupied_seats_' . $showtime_key;
    $occupied_seats = get_post_meta($proiezione_id, $occupied_seats_meta_key, true) ?: [];

    $vip_seats = array_map('trim', explode(',', get_field('vip_seats', $proiezione_id) ?: ''));
    $disabled_seats = array_map('trim', explode(',', get_field('disabled_seats', $proiezione_id) ?: ''));
    $unavailable_seats = array_filter(array_unique(array_merge($occupied_seats, $vip_seats, $disabled_seats)));
    
    $layout = baaria_get_seat_layout(get_field('location_type', $proiezione_id));
    $total_seats_in_layout = array_sum(array_map('count', $layout));
    $available_seats_count = $total_seats_in_layout - count($unavailable_seats);

    if ($quantity > $available_seats_count) {
        return new WP_REST_Response(['success' => false, 'message' => 'Posti non sufficienti. Disponibili: ' . $available_seats_count], 400);
    }
    
    $associated_movies = get_field('evento_film_associato', $proiezione_id);
    $movie_id = is_array($associated_movies) ? $associated_movies[0] : $associated_movies;
    $movie_title = get_the_title($movie_id);

    $booking_id = wp_insert_post(['post_title' => "Prenotazione per $name - " . $movie_title, 'post_status' => 'pending', 'post_type' => 'booking']);
    if (is_wp_error($booking_id)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Errore creazione prenotazione.'], 500);
    }

    $token = wp_generate_password(32, false);
    $date_obj = ($dr = get_field('data_proiezione', $proiezione_id)) ? DateTime::createFromFormat('Ymd', $dr) : null;
    $showtime_desc = ($date_obj ? $date_obj->format('d/m/Y') : '') . ' - ' . get_field('orario_proiezione', $proiezione_id);

    update_post_meta($booking_id, '_customer_name', $name);
    update_post_meta($booking_id, '_customer_email', $email);
    update_post_meta($booking_id, '_customer_phone', $phone);
    update_post_meta($booking_id, '_movie_id', $movie_id);
    update_post_meta($booking_id, '_proiezione_id', $proiezione_id);
    update_post_meta($booking_id, '_showtime_key', $showtime_key);
    update_post_meta($booking_id, '_showtime_description', $showtime_desc);
    update_post_meta($booking_id, '_quantity', $quantity);
    update_post_meta($booking_id, '_confirmation_token', $token);
    update_post_meta($booking_id, '_token_expiration', time() + 600);
    
    $location_name = get_field('nome_location_proiezione', $proiezione_id) ?: get_field('location_principale', $movie_id);
    
    $link = BAARIA_REACT_APP_URL . "/conferma-prenotazione?token=$token";
    $subject = "Conferma la tua prenotazione per " . $movie_title;
    $body = baaria_get_email_html_template_v10($booking_id, $name, $movie_title, $location_name, $showtime_desc, $quantity, $link, false);
    
    if (wp_mail($email, $subject, $body, ['Content-Type: text/html; charset=UTF-8', 'From: ' . BAARIA_FROM_EMAIL])) {
        return new WP_REST_Response(['success' => true, 'message' => 'Email di conferma inviata.'], 200);
    }
    
    wp_delete_post($booking_id, true);
    return new WP_REST_Response(['success' => false, 'message' => 'Errore invio email.'], 500);
}

function baaria_handle_confirm_booking_with_pdf_request_v10(WP_REST_Request $request) {
    $token = sanitize_text_field($request->get_param('token'));
    if (empty($token)) return new WP_REST_Response(['success' => false, 'message' => 'Token mancante.'], 400);

    $booking_id = baaria_get_booking_id_by_token_v10($token, 'pending');
    if (!$booking_id) {
        if (baaria_get_booking_id_by_token_v10($token, 'publish', true)) {
            return new WP_REST_Response(['success' => true, 'message' => 'Prenotazione già confermata.', 'already_confirmed' => true], 200);
        }
        return new WP_REST_Response(['success' => false, 'message' => 'Token non valido.'], 400);
    }

    if (time() > get_post_meta($booking_id, '_token_expiration', true)) {
        wp_delete_post($booking_id, true);
        return new WP_REST_Response(['success' => false, 'message' => 'Token scaduto.'], 400);
    }

    $proiezione_id = get_post_meta($booking_id, '_proiezione_id', true);
    $quantity = get_post_meta($booking_id, '_quantity', true);
    
    $seats = baaria_assign_seats_v10($proiezione_id, $quantity);
    if (count($seats) < $quantity) {
        return new WP_REST_Response(['success' => false, 'message' => 'Posti non più disponibili.'], 400);
    }
    
    if (is_wp_error(wp_update_post(['ID' => $booking_id, 'post_status' => 'publish']))) {
        return new WP_REST_Response(['success' => false, 'message' => 'Errore conferma prenotazione.'], 500);
    }
    
    baaria_update_occupied_seats_internal_v10($proiezione_id, $seats);
    update_post_meta($booking_id, '_seats', $seats);

    $pdf_path = baaria_generate_ticket_pdf_v10($booking_id);
    
    $name = get_post_meta($booking_id, '_customer_name', true);
    $email = get_post_meta($booking_id, '_customer_email', true);
    $movie_id = get_post_meta($booking_id, '_movie_id', true);
    $movie_title = get_the_title($movie_id);
    $loc_name = get_field('nome_location_proiezione', $proiezione_id) ?: get_field('location_principale', $movie_id);
    $showtime = get_post_meta($booking_id, '_showtime_description', true);
    
    $subject = "Prenotazione confermata per $movie_title";
    $body = baaria_get_email_html_template_v10($booking_id, $name, $movie_title, $loc_name, $showtime, $quantity, null, true);
    
    wp_mail($email, $subject, $body, ['Content-Type: text/html; charset=UTF-8', 'From: ' . BAARIA_FROM_EMAIL], $pdf_path ? [$pdf_path] : []);

    if ($pdf_path && file_exists($pdf_path)) unlink($pdf_path);
    delete_post_meta($booking_id, '_confirmation_token');
    delete_post_meta($booking_id, '_token_expiration');

    return new WP_REST_Response(['success' => true, 'message' => 'Prenotazione confermata.'], 200);
}

function baaria_assign_seats_v10($proiezione_id, $quantity) {
    $showtime_key = 'proj_' . $proiezione_id;
    $occupied_seats_meta_key = '_occupied_seats_' . $showtime_key;
    $occupied_seats = get_post_meta($proiezione_id, $occupied_seats_meta_key, true) ?: [];

    $vip_seats = array_map('trim', explode(',', get_field('vip_seats', $proiezione_id) ?: ''));
    $disabled_seats = array_map('trim', explode(',', get_field('disabled_seats', $proiezione_id) ?: ''));
    $unavailable_seats = array_filter(array_unique(array_merge($occupied_seats, $vip_seats, $disabled_seats)));

    $layout = baaria_get_seat_layout(get_field('location_type', $proiezione_id));
    $assignment_order = baaria_get_seat_assignment_order(get_field('location_type', $proiezione_id));

    $assigned_seats = [];
    foreach ($assignment_order as $row) {
        if (isset($layout[$row])) {
            foreach ($layout[$row] as $seat_num) {
                $seat_id = $row . $seat_num;
                if (!in_array($seat_id, $unavailable_seats)) {
                    $assigned_seats[] = $seat_id;
                    if (count($assigned_seats) >= $quantity) break 2;
                }
            }
        }
    }
    return $assigned_seats;
}

function baaria_get_occupied_seats_request_v10(WP_REST_Request $request) {
    $proiezione_id = intval($request->get_param('proiezione_id'));
    if (!$proiezione_id) return new WP_REST_Response(['occupiedSeats' => []], 200);
    
    $showtime_key = 'proj_' . $proiezione_id;
    $occupied_seats_meta_key = '_occupied_seats_' . $showtime_key;
    $occupiedSeats = get_post_meta($proiezione_id, $occupied_seats_meta_key, true) ?: [];
    
    return new WP_REST_Response(['occupiedSeats' => $occupiedSeats], 200);
}

function baaria_check_confirmation_token_request_v10(WP_REST_Request $request) {
    $token = sanitize_text_field($request->get_param('token'));
    $booking_id = baaria_get_booking_id_by_token_v10($token, 'pending');

    if (!$booking_id) return new WP_REST_Response(['success' => false, 'message' => 'Token non valido o scaduto.'], 400);
    
    $movie_id = get_post_meta($booking_id, '_movie_id', true);
    $pro_id = get_post_meta($booking_id, '_proiezione_id', true);
    
    $details = [
        'id' => $booking_id,
        'name' => get_post_meta($booking_id, '_customer_name', true),
        'email' => get_post_meta($booking_id, '_customer_email', true),
        'phone' => get_post_meta($booking_id, '_customer_phone', true),
        'movie_id' => $movie_id,
        'movie_name' => get_the_title($movie_id),
        'proiezione_id' => $pro_id,
        'location_name' => get_field('nome_location_proiezione', $pro_id) ?: get_field('location_principale', $movie_id),
        'location_address' => get_field('indirizzo_location_proiezione', $pro_id),
        'showtime' => get_post_meta($booking_id, '_showtime_description', true),
        'quantity' => get_post_meta($booking_id, '_quantity', true),
        'seats' => []
    ];
    return new WP_REST_Response(['success' => true, 'booking' => $details], 200);
}

function baaria_get_booking_id_by_token_v10($token, $status = 'pending', $ignore_expiration = false) {
    $args = ['post_type' => 'booking', 'post_status' => $status, 'meta_query' => [['key' => '_confirmation_token', 'value' => $token]], 'posts_per_page' => 1, 'fields' => 'ids'];
    $query = new WP_Query($args);
    if ($query->have_posts()) {
        $booking_id = $query->posts[0];
        if ($ignore_expiration || $status !== 'pending') return $booking_id;
        if (time() <= get_post_meta($booking_id, '_token_expiration', true)) return $booking_id;
    }
    return null;
}

function baaria_update_occupied_seats_internal_v10($proiezione_id, $seats_to_add = [], $seats_to_remove = []) {
    if (empty($proiezione_id)) return false;
    $metaKey = '_occupied_seats_proj_' . $proiezione_id;
    $occupied = get_post_meta($proiezione_id, $metaKey, true) ?: [];
    if (!is_array($occupied)) $occupied = [];
    $occupied = array_merge($occupied, $seats_to_add);
    $occupied = array_diff($occupied, $seats_to_remove);
    return update_post_meta($proiezione_id, $metaKey, array_values(array_unique($occupied)));
}

function baaria_generate_ticket_pdf_v10($booking_id) {
    if (!class_exists('Dompdf\Dompdf')) {
        $autoload_path = plugin_dir_path(__FILE__) . 'dompdf/vendor/autoload.php';
        if (file_exists($autoload_path)) require_once $autoload_path;
        else return null;
    }
    if (!class_exists('Dompdf\Dompdf')) return null;

    $name = get_post_meta($booking_id, '_customer_name', true);
    $movie_id = get_post_meta($booking_id, '_movie_id', true);
    $proiezione_id = get_post_meta($booking_id, '_proiezione_id', true);
    $location_name = get_field('nome_location_proiezione', $proiezione_id) ?: get_field('location_principale', $movie_id);
    $location_address = get_field('indirizzo_location_proiezione', $proiezione_id) ?: '';
    $showtime_desc = get_post_meta($booking_id, '_showtime_description', true);
    
    $seats_array = get_post_meta($booking_id, '_seats', true) ?: [];
    $quantity = count($seats_array);
    $seats_string = implode(', ', $seats_array);
    $movie_title = get_the_title($movie_id);
    $booking_ref = "BFF-" . $booking_id . "-" . strtoupper(substr(md5($booking_id . $name), 0, 6));

    $html = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><style>body{font-family:"DejaVu Sans",sans-serif;color:#333;line-height:1.6;margin:0;padding:0;font-size:11pt}.ticket{width:90%;max-width:700px;margin:20px auto;padding:25px;border:2px solid #b08d57;border-radius:10px;background:#fff;box-shadow:0 0 15px rgba(0,0,0,.1)}.header{text-align:center;border-bottom:2px solid #b08d57;padding-bottom:15px;margin-bottom:20px}.header h1{color:#2d2d2d;font-size:22px;margin:0 0 5px}.header p{color:#555;font-size:14px;margin:0}.details{margin:20px 0}.detail-row{margin-bottom:10px;padding:8px 10px;background:#f8f5f0;border-radius:5px;border-left:3px solid #b08d57}.detail-label{color:#555;font-size:10pt;display:block;margin-bottom:2px}.detail-value{color:#2d2d2d;font-size:12pt;font-weight:bold}.qr-code{text-align:center;margin:20px 0 10px}.qr-code img{max-width:120px;height:auto}.footer{text-align:center;margin-top:25px;padding-top:15px;border-top:1px solid #eee;color:#777;font-size:9pt}.booking-ref{text-align:center;font-size:10pt;color:#444;margin-bottom:15px}</style></head><body><div class="ticket"><div class="header"><h1>Baarìa Film Festival</h1><p>Biglietto di Ingresso / Conferma Prenotazione</p></div><div class="booking-ref">Rif. Prenotazione: <strong>' . esc_html($booking_ref) . '</strong></div><div class="details"><div class="detail-row"><span class="detail-label">Nominativo</span><span class="detail-value">' . esc_html($name) . '</span></div><div class="detail-row"><span class="detail-label">Evento</span><span class="detail-value">' . esc_html($movie_title) . '</span></div><div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">' . esc_html($location_name) . ($location_address ? ' - ' . esc_html($location_address) : '') . '</span></div><div class="detail-row"><span class="detail-label">Data e Ora</span><span class="detail-value">' . esc_html($showtime_desc) . '</span></div><div class="detail-row"><span class="detail-label">Numero Posti</span><span class="detail-value">' . esc_html($quantity) . '</span></div><div class="detail-row"><span class="detail-label">Posti Assegnati</span><span class="detail-value">' . esc_html($seats_string) . '</span></div></div>';

    if (class_exists('\chillerlan\QRCode\QRCode')) {
        $qr_data = json_encode(['booking_id' => $booking_id, 'ref' => $booking_ref]);
        $qrcode_base64 = (new \chillerlan\QRCode\QRCode)->render($qr_data);
        if ($qrcode_base64) $html .= '<div class="qr-code"><img src="' . $qrcode_base64 . '" alt="QR Code"></div>';
    }

    $html .= '<div class="footer"><p>Presenta questo biglietto (digitale o stampato) all\'ingresso.</p><p>Baarìa Film Festival &copy; ' . date('Y') . '</p></div></div></body></html>';

    try {
        $dompdf = new Dompdf\Dompdf(['isHtml5ParserEnabled' => true, 'isRemoteEnabled' => true, 'defaultFont' => 'DejaVu Sans']);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $upload_dir = wp_upload_dir();
        $pdf_dir = $upload_dir['basedir'] . '/baaria-tickets/';
        if (!file_exists($pdf_dir)) wp_mkdir_p($pdf_dir);
        $pdf_path = $pdf_dir . 'ticket-bff-' . $booking_id . '.pdf';
        if (file_put_contents($pdf_path, $dompdf->output())) return $pdf_path;
    } catch (Exception $e) {
        error_log("Baarìa Booking - Dompdf Exception: " . $e->getMessage());
    }
    return null;
}

function baaria_get_email_html_template_v10($booking_id, $name, $movie_title, $location_name, $showtime_desc, $quantity, $confirmation_link, $is_final_confirmation)
{
    $greeting = "Ciao " . esc_html($name) . ",";
    $email_style = "body{font-family:Arial,sans-serif;line-height:1.6;color:#333333;background-color:#f4f4f4;margin:0;padding:0}.container{max-width:600px;margin:20px auto;padding:25px;background-color:#ffffff;border:1px solid #ddd;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,.1)}.header{text-align:center;padding-bottom:15px;border-bottom:1px solid #eee;margin-bottom:20px}.header h1{color:#b08d57;font-size:24px;margin:0}.content p{margin-bottom:15px;font-size:15px;color:#333333}.details-box{background:#f9f9f9;padding:15px;border-radius:5px;margin:20px 0;border-left:3px solid #b08d57}.details-box p{margin-bottom:8px;font-size:14px;color:#333333}.details-box strong{color:#000000}.button-link{display:inline-block;background-color:#b08d57;color:#ffffff!important;padding:12px 25px;text-decoration:none;border-radius:5px;font-weight:bold;text-align:center;font-size:16px}.button-container{text-align:center;margin:25px 0}.footer{text-align:center;margin-top:25px;font-size:12px;color:#777777}.footer a{color:#b08d57;text-decoration:none}";
    $intro_message = $is_final_confirmation ? "<p>La tua prenotazione per il Baarìa Film Festival è stata <strong>confermata con successo!</strong></p>" : "<p>Grazie per aver iniziato il processo di prenotazione. Manca solo un ultimo passo!</p>";
    $details_html = "<div class='details-box'><p><strong>Evento:</strong> " . esc_html($movie_title) . "</p><p><strong>Location:</strong> " . esc_html($location_name) . "</p><p><strong>Data e Ora:</strong> " . esc_html($showtime_desc) . "</p><p><strong>Numero Posti Prenotati:</strong> " . esc_html($quantity) . "</p>";
    
    if($is_final_confirmation) {
        $seats = get_post_meta($booking_id, '_seats', true) ?: [];
        $details_html .= "<p><strong>Posti Assegnati: " . implode(', ', $seats) . "</strong></p>";
    } else {
        $details_html .= "<p style='font-size:13px;'><strong>Nota:</strong> I posti specifici verranno assegnati dopo la conferma.</p>";
    }
    $details_html .= "</div>";
    
    $call_to_action = "";
    if (!$is_final_confirmation && $confirmation_link) {
        $call_to_action = "<p>Per finalizzare, clicca sul pulsante qui sotto entro <strong>10 minuti</strong>:</p><div class='button-container'><a href='" . esc_url($confirmation_link) . "' class='button-link'>Conferma la Prenotazione</a></div><p style='font-size:12px;text-align:center;'>Se non funziona, copia e incolla questo link nel browser:<br>" . esc_url($confirmation_link) . "</p>";
    } elseif ($is_final_confirmation) {
        $call_to_action = "<p>Trovi il biglietto PDF in allegato. Ricorda di presentarlo all'ingresso. Ti aspettiamo!</p>";
    }
    return "<html><head><title>Baarìa Film Festival</title><style>" . $email_style . "</style></head><body><div class='container'><div class='header'><h1>Baarìa Film Festival</h1></div><div class='content'><p>$greeting</p>$intro_message$details_html$call_to_action<p>Cordiali saluti,<br>Il Team del Baarìa Film Festival</p></div><div class='footer'><p>&copy; " . date('Y') . " Baarìa Film Festival. <a href='https://www.baariafilmfestival.com/'>Visita il sito</a></p></div></div></body></html>";
}

function baaria_get_seat_assignment_order($location_type = 'cinema_capitol') {
    $order = [
        'cinema_capitol' => ['O', 'N', 'M', 'L', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
        'villa_cattolica' => ['L', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']
    ];
    return $order[$location_type] ?? $order['cinema_capitol'];
}

function baaria_get_seat_layout($location_type = 'cinema_capitol') {
    $layouts = [
        'cinema_capitol' => [
            'O' => range(1, 16), 'N' => range(1, 16), 'M' => range(1, 15), 'L' => range(1, 16),
            'I' => range(1, 15), 'H' => range(1, 16), 'G' => range(1, 16), 'F' => range(1, 16),
            'E' => range(1, 16), 'D' => range(1, 16), 'C' => array_merge(range(1, 3), range(14, 16)),
            'B' => array_merge(range(1, 3), range(14, 16)), 'A' => [1, 2, 16]
        ],
        'villa_cattolica' => [
            'A' => range(1, 20), 'B' => range(1, 20), 'C' => range(1, 20), 'D' => range(1, 20),
            'E' => range(1, 20), 'F' => range(1, 20), 'G' => range(1, 20), 'H' => range(1, 20),
            'I' => range(1, 20), 'L' => range(1, 20)
        ]
    ];
    return $layouts[$location_type] ?? $layouts['cinema_capitol'];
}
