<?php
if (!defined('ABSPATH')) {
    exit;
}

define('BAARIA_REACT_APP_URL', 'https://www.baariafilmfestival.com/programma');
define('BAARIA_BOOKING_NAMESPACE', 'baaria/v1');
define('BAARIA_FROM_EMAIL', 'Baarìa Film Festival <noreply@baariafilmfestival.com>');

register_activation_hook(__FILE__, 'baaria_booking_activate_v9');
function baaria_booking_activate_v9()
{
    baaria_register_event_post_types_v9();
    flush_rewrite_rules();
}

register_deactivation_hook(__FILE__, 'baaria_booking_deactivate_v9');
function baaria_booking_deactivate_v9()
{
    flush_rewrite_rules();
}

add_action('init', 'baaria_register_event_post_types_v9');
function baaria_register_event_post_types_v9()
{
    register_post_type('movie', [
        'labels' => [
            'name' => 'Eventi Film',
            'singular_name' => 'Evento Film',
        ],
        'public' => true,
        'publicly_queryable' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
        'menu_icon' => 'dashicons-tickets-alt',
        'rewrite' => ['slug' => 'eventi-film'],
    ]);

    register_post_type('proiezione', [
        'labels' => [
            'name' => 'Proiezioni',
            'singular_name' => 'Proiezione',
        ],
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

add_action('acf/init', 'baaria_acf_add_local_field_groups_v9');
function baaria_acf_add_local_field_groups_v9()
{
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group(array(
        'key' => 'group_event_movie_details_v9',
        'title' => 'Dettagli Evento Film (Baarìa)',
        'fields' => array(
            array('key' => 'field_event_location_principale_v9', 'label' => 'Location Principale', 'name' => 'location_principale', 'type' => 'text', 'required' => 1),
            array('key' => 'field_event_categoria_v9', 'label' => 'Categoria Evento', 'name' => 'categoria_evento', 'type' => 'text', 'required' => 1),
            array('key' => 'field_event_desc_breve_v9', 'label' => 'Descrizione Breve (sottotitolo)', 'name' => 'descrizione_breve', 'type' => 'text'),
            array('key' => 'field_event_sinossi_v9', 'label' => 'Sinossi', 'name' => 'sinossi_film', 'type' => 'textarea'),
            array('key' => 'field_event_trailer_file_v9', 'label' => 'Carica Trailer Video', 'name' => 'trailer_file', 'type' => 'file', 'return_format' => 'id'),
            array('key' => 'field_event_cast_v9', 'label' => 'Cast Principale', 'name' => 'cast_film', 'type' => 'textarea'),
            array('key' => 'field_event_durata_v9', 'label' => 'Durata (in minuti)', 'name' => 'durata_film', 'type' => 'number'),
            array('key' => 'field_event_regia_v9', 'label' => 'Regia', 'name' => 'regia_film', 'type' => 'text'),
            array('key' => 'field_event_anno_v9', 'label' => 'Anno di Produzione', 'name' => 'anno_produzione', 'type' => 'number'),
            array('key' => 'field_event_tipo_v9', 'label' => 'Tipo Film/Evento', 'name' => 'tipo_lungometraggio', 'type' => 'select', 'choices' => ['' => 'Nessuno', 'lungometraggio' => 'Lungometraggio', 'cortometraggio' => 'Cortometraggio', 'documentario' => 'Documentario', 'animazione' => 'Animazione', 'incontro' => 'Incontro/Masterclass', 'altro' => 'Altro'], 'allow_null' => 1, 'ui' => 1),
            array('key' => 'field_event_galleria_v9', 'label' => 'Galleria Immagini', 'name' => 'galleria_film', 'type' => 'gallery', 'return_format' => 'array'),
            array('key' => 'field_event_montaggio_v9', 'label' => 'Montaggio', 'name' => 'montaggio_film', 'type' => 'text'),
            array('key' => 'field_event_fotografia_v9', 'label' => 'Fotografia', 'name' => 'fotografia_film', 'type' => 'text'),
            array('key' => 'field_event_musica_v9', 'label' => 'Musica', 'name' => 'musica_film', 'type' => 'text'),
            array('key' => 'field_event_genere_v9', 'label' => 'Genere/i', 'name' => 'genere_film', 'type' => 'text'),
            array('key' => 'field_event_loc_produzione_v9', 'label' => 'Location di Produzione', 'name' => 'location_produzione', 'type' => 'text'),
            array('key' => 'field_event_sceneggiatura_v9', 'label' => 'Sceneggiatura', 'name' => 'sceneggiatura_film', 'type' => 'text'),
            array('key' => 'field_event_coproduzione_v9', 'label' => 'Coproduzione', 'name' => 'coproduzione_film', 'type' => 'text'),
            array('key' => 'field_event_casa_produzione_v9', 'label' => 'Casa di Produzione', 'name' => 'casa_produzione', 'type' => 'text'),
            array('key' => 'field_event_paese_produzione_v9', 'label' => 'Paese di Produzione', 'name' => 'paese_produzione', 'type' => 'text'),
        ),
        'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'movie'))),
    ));

    acf_add_local_field_group(array(
        'key' => 'group_proiezione_details_v9',
        'title' => 'Dettagli Proiezione (Baarìa)',
        'fields' => array(
            array('key' => 'field_proiezione_evento_film_v9', 'label' => 'Evento/i Film Associato/i', 'name' => 'evento_film_associato', 'type' => 'post_object', 'post_type' => array('movie'), 'allow_null' => 0, 'multiple' => 1, 'return_format' => 'id', 'ui' => 1, 'required' => 1, 'instructions' => 'Seleziona l\'evento o gli eventi (per blocchi) associati a questa proiezione. L\'ordine di selezione sarà rispettato.'),
            array('key' => 'field_proiezione_data_v9', 'label' => 'Data Proiezione', 'name' => 'data_proiezione', 'type' => 'date_picker', 'display_format' => 'd/m/Y', 'return_format' => 'Ymd', 'required' => 1),
            array('key' => 'field_proiezione_orario_v9', 'label' => 'Orario Proiezione', 'name' => 'orario_proiezione', 'type' => 'time_picker', 'display_format' => 'H:i', 'return_format' => 'H:i', 'required' => 1),
            array('key' => 'field_proiezione_location_type_v9', 'label' => 'Layout Sala', 'name' => 'location_type', 'type' => 'select', 'choices' => ['cinema_capitol' => 'Cinema Capitol', 'villa_cattolica' => 'Villa Cattolica'], 'default_value' => 'cinema_capitol', 'required' => 1, 'ui' => 1),
            array('key' => 'field_proiezione_enable_bookings_v9', 'label' => 'Gestione Prenotazioni', 'name' => 'proiezione_enable_bookings', 'type' => 'true_false', 'message' => 'Abilita prenotazioni per questa specifica proiezione', 'ui' => 1, 'ui_on_text' => 'Aperte', 'ui_off_text' => 'Chiuse', 'default_value' => 1),
            array('key' => 'field_proiezione_booking_not_required_v9', 'label' => 'Prenotazione Non Necessaria', 'name' => 'proiezione_booking_not_required', 'type' => 'true_false', 'message' => 'Spunta se per questa proiezione non è richiesta la prenotazione (es. ingresso libero)', 'ui' => 1, 'ui_on_text' => 'Non Richiesta', 'ui_off_text' => 'Richiesta', 'default_value' => 0),
            array('key' => 'field_proiezione_booking_disabled_message_v9', 'label' => 'Messaggio Prenotazioni Chiuse (Opzionale)', 'name' => 'proiezione_booking_disabled_message', 'type' => 'text', 'default_value' => 'Le prenotazioni per questa proiezione sono terminate o non ancora disponibili.'),
            array('key' => 'field_proiezione_blocco_prenotabile_v9', 'label' => 'Blocco di Eventi (Prenotazione Unica)', 'name' => 'blocco_prenotabile', 'type' => 'true_false', 'instructions' => 'Attiva se questa proiezione contiene un blocco di più eventi (es. cortometraggi).', 'ui' => 1, 'default_value' => 0),
            array('key' => 'field_proiezione_vip_seats_v9', 'label' => 'Posti VIP/Riservati', 'name' => 'vip_seats', 'type' => 'textarea', 'instructions' => 'Posti riservati, separati da virgola (es. A1,A2).'),
            array('key' => 'field_proiezione_disabled_seats_v9', 'label' => 'Posti Disabilitati', 'name' => 'disabled_seats', 'type' => 'textarea', 'instructions' => 'Posti non disponibili, separati da virgola (es. C5,D8).'),
            array('key' => 'field_proiezione_nome_location_v9', 'label' => 'Nome Location (Sovrascrive)', 'name' => 'nome_location_proiezione', 'type' => 'text'),
            array('key' => 'field_proiezione_indirizzo_location_v9', 'label' => 'Indirizzo Location', 'name' => 'indirizzo_location_proiezione', 'type' => 'textarea', 'rows' => 2),
            array('key' => 'field_proiezione_citta_location_v9', 'label' => 'Città Location', 'name' => 'citta_location_proiezione', 'type' => 'text'),
            array('key' => 'field_proiezione_note_v9', 'label' => 'Note Aggiuntive (opzionale)', 'name' => 'note_aggiuntive_proiezione', 'type' => 'text'),
        ),
        'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'proiezione'))),
    ));
}

add_action('rest_api_init', 'baaria_register_custom_rest_fields_v9');
function baaria_register_custom_rest_fields_v9()
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
                    $booking_status_message = $booking_not_required ? 'Ingresso libero, prenotazione non necessaria.' : (!$enable_bookings ? (get_field('proiezione_booking_disabled_message', $proiezione_id) ?: 'Le prenotazioni sono terminate.') : 'Prenotazione disponibile.');

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
                        'showtime_key' => $post_id . '_' . $proiezione_id,
                        'location_type' => get_field('location_type', $proiezione_id) ?: 'cinema_capitol',
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

add_action('rest_api_init', 'baaria_register_booking_api_routes_v9');
function baaria_register_booking_api_routes_v9()
{
    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/booking-with-pdf', ['methods'  => 'POST', 'callback' => 'baaria_handle_booking_with_pdf_request_v9', 'permission_callback' => '__return_true']);
    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/confirm-booking-with-pdf', ['methods'  => 'POST', 'callback' => 'baaria_handle_confirm_booking_with_pdf_request_v9', 'permission_callback' => '__return_true']);
    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/occupied-seats', ['methods'  => 'GET', 'callback' => 'baaria_get_occupied_seats_request_v9', 'permission_callback' => '__return_true']);
    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/check-token', ['methods'  => 'GET', 'callback' => 'baaria_check_confirmation_token_request_v9', 'permission_callback' => '__return_true']);
}

function baaria_handle_booking_with_pdf_request_v9(WP_REST_Request $request)
{
    $name = sanitize_text_field($request->get_param('name'));
    $email = sanitize_email($request->get_param('email'));
    $phone = sanitize_text_field($request->get_param('phone'));
    $movie_id = intval($request->get_param('movie_id'));
    $proiezione_id = intval($request->get_param('proiezione_id'));
    $quantity = intval($request->get_param('quantity'));

    if (empty($name) || !is_email($email) || empty($movie_id) || empty($proiezione_id) || $quantity <= 0) {
        return new WP_REST_Response(['success' => false, 'message' => 'Dati mancanti o non validi.'], 400);
    }
    if ($quantity > 4) {
        return new WP_REST_Response(['success' => false, 'message' => 'È possibile prenotare un massimo di 4 posti.'], 400);
    }

    if (get_field('proiezione_booking_not_required', $proiezione_id) || !get_field('proiezione_enable_bookings', $proiezione_id)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Prenotazioni non attive per questa proiezione.'], 403);
    }

    $showtime_key = $movie_id . '_' . $proiezione_id;
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

    $booking_id = wp_insert_post(['post_title' => "Prenotazione per $name - " . get_the_title($movie_id), 'post_status' => 'pending', 'post_type' => 'booking']);
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
    $subject = "Conferma la tua prenotazione per " . get_the_title($movie_id);
    $body = baaria_get_email_html_template_v9($name, get_the_title($movie_id), $location_name, $showtime_desc, $quantity, $link, false);
    
    if (wp_mail($email, $subject, $body, ['Content-Type: text/html; charset=UTF-8', 'From: ' . BAARIA_FROM_EMAIL])) {
        return new WP_REST_Response(['success' => true, 'message' => 'Email di conferma inviata.'], 200);
    }
    
    wp_delete_post($booking_id, true);
    return new WP_REST_Response(['success' => false, 'message' => 'Errore invio email.'], 500);
}

function baaria_handle_confirm_booking_with_pdf_request_v9(WP_REST_Request $request) {
    // ... Implementation for confirming booking ...
}

function baaria_get_occupied_seats_request_v9(WP_REST_Request $request) {
    // ... Implementation for getting occupied seats ...
}

function baaria_check_confirmation_token_request_v9(WP_REST_Request $request) {
    // ... Implementation for checking token ...
}

function baaria_get_email_html_template_v9($name, $movie_title, $location_name, $showtime_desc, $quantity, $confirmation_link, $is_final_confirmation) {
    // ... Implementation for email template ...
}

function baaria_get_seat_layout($location_type = 'cinema_capitol') {
    // ... Implementation ...
}