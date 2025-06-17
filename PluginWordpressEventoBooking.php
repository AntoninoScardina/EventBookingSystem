<?php

/**
 * Plugin Name: Baarìa Film Festival - Sistema di Prenotazione Eventi
 * Plugin URI:  https://www.baariafilmfestival.com
 * Description: Gestisce le prenotazioni per gli eventi del Baarìa Film Festival, con CPT Proiezioni e campi ACF programmatici.
 * Version:     1.4.0
 * Author:      Il Tuo Nome Qui
 * Author URI:  https://www.tuosito.com
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: baaria-booking
 * Domain Path: /languages
 */

if (! defined('ABSPATH')) {
    exit;
}

define('BAARIA_REACT_APP_URL', 'https://www.baariafilmfestival.com/programma');
define('BAARIA_BOOKING_NAMESPACE', 'baaria/v1');
define('BAARIA_FROM_EMAIL', 'Baarìa Film Festival <noreply@baariafilmfestival.com>');

register_activation_hook(__FILE__, 'baaria_booking_activate_v6');
function baaria_booking_activate_v6()
{
    baaria_register_event_post_types_v6();
    flush_rewrite_rules();
}

register_deactivation_hook(__FILE__, 'baaria_booking_deactivate_v6');
function baaria_booking_deactivate_v6()
{
    flush_rewrite_rules();
}

add_action('init', 'baaria_register_event_post_types_v6');
function baaria_register_event_post_types_v6()
{
    register_post_type('movie', [
        'labels' => [
            'name' => 'Eventi Film',
            'singular_name' => 'Evento Film',
            'add_new_item' => 'Aggiungi Nuovo Evento Film',
            'edit_item' => 'Modifica Evento Film',
            'view_item' => 'Visualizza Evento Film',
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
            'add_new_item' => 'Aggiungi Nuova Proiezione',
            'edit_item' => 'Modifica Proiezione',
            'view_item' => 'Visualizza Proiezione',
        ],
        'public' => true,
        'publicly_queryable' => false,
        'show_ui' => true,
        'show_in_menu' => 'edit.php?post_type=movie',
        'show_in_rest' => true,
        'supports' => ['title', 'custom-fields'],
        'rewrite' => ['slug' => 'proiezioni'],
        'capability_type' => 'post',
        'hierarchical' => false,
        'has_archive' => false,
    ]);

    register_post_type('booking', [
        'labels' => ['name' => 'Prenotazioni', 'singular_name' => 'Prenotazione'],
        'public' => false,
        'publicly_queryable' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'query_var' => false,
        'rewrite' => false,
        'capability_type' => 'post',
        'has_archive' => false,
        'hierarchical' => false,
        'supports' => ['title', 'custom-fields'],
        'show_in_rest' => false,
    ]);
}

add_action('acf/init', 'baaria_acf_add_local_field_groups_v7');
function baaria_acf_add_local_field_groups_v7()
{
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group(array(
        'key' => 'group_event_movie_details_v7',
        'title' => 'Dettagli Evento Film (Baarìa)',
        'fields' => array(
            // NUOVO CAMPO: LOCATION PRINCIPALE
            array(
                'key' => 'field_event_location_principale_v7',
                'label' => 'Location Principale',
                'name' => 'location_principale',
                'type' => 'text',
                'instructions' => 'La location principale dell\'evento (es. CINEMA CAPITOL, PALAZZO BUTERA). Usato per raggruppamento.',
                'required' => 1,
            ),
            // NUOVO CAMPO: CATEGORIA EVENTO
            array(
                'key' => 'field_event_categoria_v7',
                'label' => 'Categoria Evento',
                'name' => 'categoria_evento',
                'type' => 'text',
                'instructions' => 'La categoria dell\'evento (es. ARCIPELAGHI, ATOLLI, Eventi Collaterali). Usato per raggruppamento.',
                'required' => 1,
            ),
            array(
                'key' => 'field_event_desc_breve_v7',
                'label' => 'Descrizione Breve (sottotitolo)',
                'name' => 'descrizione_breve',
                'type' => 'text',
                'instructions' => 'Un breve sottotitolo o descrizione mostrata nella lista eventi (es. Anteprima Siciliana – opera prima).',
            ),
            array('key' => 'field_event_sinossi_v7', 'label' => 'Sinossi', 'name' => 'sinossi_film', 'type' => 'textarea'),
            array('key' => 'field_event_trailer_file_v7', 'label' => 'Carica Trailer Video', 'name' => 'trailer_file', 'type' => 'file', 'return_format' => 'id', 'mime_types' => 'mp4,mov,avi'),
            array('key' => 'field_event_cast_v7', 'label' => 'Cast Principale', 'name' => 'cast_film', 'type' => 'textarea'),
            array('key' => 'field_event_durata_v7', 'label' => 'Durata (in minuti)', 'name' => 'durata_film', 'type' => 'number', 'append' => 'minuti'),
            array('key' => 'field_event_regia_v7', 'label' => 'Regia', 'name' => 'regia_film', 'type' => 'text'),
            array('key' => 'field_event_anno_v7', 'label' => 'Anno di Produzione', 'name' => 'anno_produzione', 'type' => 'number', 'min' => 1880, 'max' => intval(date('Y')) + 5),
            array('key' => 'field_event_tipo_v7', 'label' => 'Tipo Film/Evento', 'name' => 'tipo_lungometraggio', 'type' => 'select',
                'choices' => ['' => 'Seleziona tipo...', 'lungometraggio' => 'Lungometraggio', 'cortometraggio' => 'Cortometraggio', 'documentario' => 'Documentario', 'animazione' => 'Animazione', 'incontro' => 'Incontro/Masterclass', 'altro' => 'Altro'],
                'allow_null' => 1, 'ui' => 1,
            ),
            array('key' => 'field_event_galleria_v7', 'label' => 'Galleria Immagini', 'name' => 'galleria_film', 'type' => 'gallery', 'return_format' => 'array'),
            array('key' => 'field_event_montaggio_v7', 'label' => 'Montaggio', 'name' => 'montaggio_film', 'type' => 'text'),
            array('key' => 'field_event_fotografia_v7', 'label' => 'Fotografia', 'name' => 'fotografia_film', 'type' => 'text'),
            array('key' => 'field_event_musica_v7', 'label' => 'Musica', 'name' => 'musica_film', 'type' => 'text'),
            array('key' => 'field_event_genere_v7', 'label' => 'Genere/i', 'name' => 'genere_film', 'type' => 'text', 'instructions' => 'Separare con virgola'),
            array('key' => 'field_event_loc_produzione_v7', 'label' => 'Location di Produzione (Origine)', 'name' => 'location_produzione', 'type' => 'text'),
            array('key' => 'field_event_sceneggiatura_v7', 'label' => 'Sceneggiatura', 'name' => 'sceneggiatura_film', 'type' => 'text'),
            array('key' => 'field_event_coproduzione_v7', 'label' => 'Coproduzione', 'name' => 'coproduzione_film', 'type' => 'text'),
            array('key' => 'field_event_casa_produzione_v7', 'label' => 'Casa di Produzione', 'name' => 'casa_produzione', 'type' => 'text'),
            array('key' => 'field_event_paese_produzione_v7', 'label' => 'Paese di Produzione', 'name' => 'paese_produzione', 'type' => 'text'),
            array('key' => 'field_enable_bookings_v7', 'label' => 'Gestione Prenotazioni', 'name' => 'enable_bookings', 'type' => 'true_false', 'message' => 'Abilita prenotazioni per questo evento', 'ui' => 1, 'ui_on_text' => 'Aperte', 'ui_off_text' => 'Chiuse', 'default_value' => 1),
            array('key' => 'field_booking_not_required_v7', 'label' => 'Prenotazione Non Necessaria', 'name' => 'booking_not_required', 'type' => 'true_false', 'message' => 'Spunta se per questo evento non è richiesta la prenotazione (es. ingresso libero)', 'ui' => 1, 'ui_on_text' => 'Non Richiesta', 'ui_off_text' => 'Richiesta', 'default_value' => 0),
            array('key' => 'field_booking_disabled_message_v7', 'label' => 'Messaggio Prenotazioni Chiuse (Opzionale)', 'name' => 'booking_disabled_message', 'type' => 'text', 'instructions' => 'Messaggio custom se le prenotazioni sono chiuse.', 'default_value' => 'Le prenotazioni sono terminate o non ancora disponibili.'),
        ),
        'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'movie'))),
        'menu_order' => 0, 'position' => 'normal', 'style' => 'default', 'label_placement' => 'top', 'instruction_placement' => 'label',
    ));
    acf_add_local_field_group(array(
        'key' => 'group_proiezione_details_v7', 'title' => 'Dettagli Proiezione (Baarìa)', 'fields' => array(
            array('key' => 'field_proiezione_evento_film_v7', 'label' => 'Evento Film Associato', 'name' => 'evento_film_associato', 'type' => 'post_object', 'post_type' => array('movie'), 'allow_null' => 0, 'multiple' => 0, 'return_format' => 'id', 'ui' => 1, 'required' => 1),
            array('key' => 'field_proiezione_data_v7', 'label' => 'Data Proiezione', 'name' => 'data_proiezione', 'type' => 'date_picker', 'display_format' => 'd/m/Y', 'return_format' => 'Ymd', 'required' => 1),
            array('key' => 'field_proiezione_orario_v7', 'label' => 'Orario Proiezione', 'name' => 'orario_proiezione', 'type' => 'time_picker', 'display_format' => 'H:i', 'return_format' => 'H:i', 'required' => 1),
            array('key' => 'field_proiezione_nome_location_v7', 'label' => 'Nome Location (Sovrascrive)', 'name' => 'nome_location_proiezione', 'type' => 'text', 'instructions' => 'Usa questo campo solo se la location della proiezione è diversa dalla Location Principale dell\'evento.'),
            array('key' => 'field_proiezione_indirizzo_location_v7', 'label' => 'Indirizzo Location', 'name' => 'indirizzo_location_proiezione', 'type' => 'textarea', 'rows' => 2),
            array('key' => 'field_proiezione_citta_location_v7', 'label' => 'Città Location', 'name' => 'citta_location_proiezione', 'type' => 'text'),
            array('key' => 'field_proiezione_note_v7', 'label' => 'Note Aggiuntive (opzionale)', 'name' => 'note_aggiuntive_proiezione', 'type' => 'text'),
        ),
        'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'proiezione'))),
        'menu_order' => 0, 'position' => 'normal', 'style' => 'default', 'label_placement' => 'top', 'instruction_placement' => 'label',
    ));
}


add_action('rest_api_init', 'baaria_register_custom_rest_fields_v7');
function baaria_register_custom_rest_fields_v7()
{
    if (!function_exists('get_field')) return;

    register_rest_field('movie', 'event_details', [
        'get_callback' => function ($post_array) {
            $post_id = $post_array['id'];
            $trailer_file_id = get_field('trailer_file', $post_id);
            $trailer_url = $trailer_file_id ? wp_get_attachment_url($trailer_file_id) : '';

            $enable_bookings = get_field('enable_bookings', $post_id);
            $booking_not_required = get_field('booking_not_required', $post_id);
            $booking_disabled_message_custom = get_field('booking_disabled_message', $post_id);

            $booking_status_message = '';
            if ($booking_not_required) {
                $booking_status_message = 'Ingresso libero, prenotazione non necessaria.';
            } elseif (!$enable_bookings) {
                $booking_status_message = $booking_disabled_message_custom ?: 'Le prenotazioni sono terminate o non ancora disponibili.';
            } else {
                $booking_status_message = 'Prenotazione disponibile.';
            }

            $event_data = [
                'id' => $post_id,
                'title' => get_the_title($post_id),
                // CAMPI AGGIUNTI ALL'API
                'location_principale' => get_field('location_principale', $post_id) ?: 'Sede da definire',
                'categoria_evento' => get_field('categoria_evento', $post_id) ?: 'Generale',
                'descrizione_breve' => get_field('descrizione_breve', $post_id) ?: '',
                
                'sinossi' => get_field('sinossi_film', $post_id) ?: '',
                'descrizione_completa' => apply_filters('the_content', get_post_field('post_content', $post_id)),
                'locandina_url' => get_the_post_thumbnail_url($post_id, 'full') ?: null,
                'trailer_video_url' => $trailer_url,
                'cast' => get_field('cast_film', $post_id) ?: '',
                'durata_minuti' => get_field('durata_film', $post_id) ? intval(get_field('durata_film', $post_id)) : 0,
                'regia' => get_field('regia_film', $post_id) ?: '',
                'anno_produzione' => get_field('anno_produzione', $post_id) ? intval(get_field('anno_produzione', $post_id)) : null,
                'tipo_film' => get_field('tipo_lungometraggio', $post_id) ?: '',
                'galleria_immagini' => [],
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
                'bookings_enabled' => (bool) $enable_bookings,
                'booking_not_required' => (bool) $booking_not_required,
                'booking_status_message' => $booking_status_message,
            ];

            $galleria = get_field('galleria_film', $post_id);
            if (!empty($galleria) && is_array($galleria)) {
                foreach ($galleria as $image) {
                     if (is_array($image) && isset($image['url'])) {
                         $event_data['galleria_immagini'][] = ['url' => $image['url'], 'alt' => $image['alt'] ?: ''];
                     }
                }
            }
            
            $args_proiezioni = ['post_type' => 'proiezione', 'posts_per_page' => -1, 'meta_query' => [['key' => 'evento_film_associato', 'value' => $post_id, 'compare' => '=']], 'orderby' => ['meta_value_num' => 'ASC', 'meta_value' => 'ASC'], 'meta_key' => 'data_proiezione'];
            $proiezioni_query = new WP_Query($args_proiezioni);
            
            if ($proiezioni_query->have_posts()) {
                while ($proiezioni_query->have_posts()) {
                    $proiezioni_query->the_post();
                    $proiezione_id = get_the_ID();
                    $data_raw = get_field('data_proiezione', $proiezione_id);
                    $orario_raw = get_field('orario_proiezione', $proiezione_id);
                    $data_formattata = '';
                    if ($data_raw) {
                        $date_obj = DateTime::createFromFormat('Ymd', $data_raw);
                        if ($date_obj) {
                            $data_formattata = date_i18n(get_option('date_format'), $date_obj->getTimestamp());
                        }
                    }

                    // Se la location della proiezione è specificata, usa quella. Altrimenti, usa la location principale dell'evento.
                    $location_override = get_field('nome_location_proiezione', $proiezione_id);
                    $location_finale = !empty($location_override) ? $location_override : $event_data['location_principale'];

                    $event_data['programmazione'][] = [
                        'proiezione_id' => $proiezione_id,
                        'data_raw' => $data_raw,
                        'data_formattata' => $data_formattata,
                        'orario' => $orario_raw,
                        'datetime_sort_key' => $data_raw . str_replace(':', '', $orario_raw),
                        'location_nome' => $location_finale,
                        'location_indirizzo' => get_field('indirizzo_location_proiezione', $proiezione_id) ?: '',
                        'location_citta' => get_field('citta_location_proiezione', $proiezione_id) ?: '',
                        'note' => get_field('note_aggiuntive_proiezione', $proiezione_id) ?: '',
                        'showtime_key' => $post_id . '_' . $proiezione_id,
                    ];
                }
                wp_reset_postdata();
                usort($event_data['programmazione'], function ($a, $b) {
                    return strcmp($a['datetime_sort_key'], $b['datetime_sort_key']);
                });
            }
            return $event_data;
        }
    ]);
}


add_action('rest_api_init', 'baaria_register_booking_api_routes_v6');
function baaria_register_booking_api_routes_v6()
{
    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/booking-with-pdf', [
        'methods'  => 'POST',
        'callback' => 'baaria_handle_booking_with_pdf_request_v6',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/confirm-booking-with-pdf', [
        'methods'  => 'POST',
        'callback' => 'baaria_handle_confirm_booking_with_pdf_request_v6',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/occupied-seats', [
        'methods'  => 'GET',
        'callback' => 'baaria_get_occupied_seats_request_v6',
        'permission_callback' => '__return_true',
        'args' => [
            'movie_id' => [
                'required' => true,
                'validate_callback' => 'rest_is_integer'
            ],
            'showtime_key' => [
                'required' => true,
                'sanitize_callback' => 'sanitize_text_field'
            ],
        ],
    ]);

    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/check-token', [
        'methods'  => 'GET',
        'callback' => 'baaria_check_confirmation_token_request_v6',
        'permission_callback' => '__return_true',
        'args' => ['token' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field']],
    ]);

    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/delete-booking', [
        'methods'  => 'POST',
        'callback' => 'baaria_handle_delete_booking_request_v6',
        'permission_callback' => function () {
            return current_user_can('manage_options');
        },
        'args' => ['id' => ['required' => true, 'validate_callback' => 'is_numeric']],
    ]);

    register_rest_route(BAARIA_BOOKING_NAMESPACE, '/get-bookings', [
        'methods'  => 'GET',
        'callback' => 'baaria_get_all_bookings_request_v6',
        'permission_callback' => function () {
            return current_user_can('manage_options');
        },
    ]);
}

function baaria_handle_booking_with_pdf_request_v6(WP_REST_Request $request)
{
    $name = sanitize_text_field($request->get_param('name'));
    $email = sanitize_email($request->get_param('email'));
    $phone = sanitize_text_field($request->get_param('phone'));
    $movie_id = intval($request->get_param('movie_id'));
    $proiezione_id = intval($request->get_param('proiezione_id'));
    $seats_param = $request->get_param('seats');
    $seats = is_array($seats_param) ? array_map('sanitize_text_field', $seats_param) : [];

    if (empty($name) || !is_email($email) || empty($movie_id) || empty($proiezione_id) || empty($seats)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Dati mancanti o non validi per la prenotazione.'], 400);
    }

    $enable_bookings = get_field('enable_bookings', $movie_id);
    $booking_not_required = get_field('booking_not_required', $movie_id);

    if (!$enable_bookings && !$booking_not_required) {
        $custom_message = get_field('booking_disabled_message', $movie_id);
        $message = $custom_message ?: 'Le prenotazioni per questo evento sono attualmente chiuse.';
        return new WP_REST_Response(['success' => false, 'message' => $message], 403);
    }
    if ($booking_not_required) {
        return new WP_REST_Response(['success' => false, 'message' => 'Per questo evento non è necessaria la prenotazione.'], 400);
    }


    $proiezione_post = get_post($proiezione_id);
    if (!$proiezione_post || $proiezione_post->post_type !== 'proiezione') {
        return new WP_REST_Response(['success' => false, 'message' => 'ID Proiezione non valido.'], 400);
    }
    $evento_associato_id = get_field('evento_film_associato', $proiezione_id);
    if ($evento_associato_id != $movie_id) {
        return new WP_REST_Response(['success' => false, 'message' => 'Proiezione non associata correttamente all\'evento.'], 400);
    }

    $data_raw = get_field('data_proiezione', $proiezione_id);
    $orario_raw = get_field('orario_proiezione', $proiezione_id);
    $nome_loc_raw = get_field('nome_location_proiezione', $proiezione_id) ?: 'N/D';
    $data_formattata = '';
    if ($data_raw) {
        $date_obj = DateTime::createFromFormat('Ymd', $data_raw);
        if ($date_obj) $data_formattata = date_i18n(get_option('date_format'), $date_obj->getTimestamp());
    }
    $showtime_desc = $data_formattata . ' - ' . $orario_raw . ' @ ' . $nome_loc_raw;
    $showtime_key = $movie_id . '_' . $proiezione_id;


    $expiration_time = time() + (10 * 60);
    $confirmation_token = wp_generate_password(32, false);

    $booking_id = wp_insert_post([
        'post_title'  => "Prenotazione per $name - Evento ID $movie_id - Proiezione: $showtime_desc",
        'post_status' => 'pending',
        'post_type'   => 'booking',
    ]);

    if (is_wp_error($booking_id)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Errore nella creazione della prenotazione.'], 500);
    }

    update_post_meta($booking_id, '_customer_name', $name);
    update_post_meta($booking_id, '_customer_email', $email);
    update_post_meta($booking_id, '_customer_phone', $phone);
    update_post_meta($booking_id, '_movie_id', $movie_id);
    update_post_meta($booking_id, '_proiezione_id', $proiezione_id);
    update_post_meta($booking_id, '_showtime_description', $showtime_desc);
    update_post_meta($booking_id, '_showtime_key', $showtime_key);
    update_post_meta($booking_id, '_seats', $seats);
    update_post_meta($booking_id, '_confirmation_token', $confirmation_token);
    update_post_meta($booking_id, '_token_expiration', $expiration_time);

    $confirmation_link = BAARIA_REACT_APP_URL . "/conferma-prenotazione?token=$confirmation_token";
    $movie_title = get_the_title($movie_id);

    $subject = "Conferma la tua prenotazione per $movie_title";
    $message_html = baaria_get_email_html_template_v6($name, $movie_title, $nome_loc_raw, $showtime_desc, $seats, $confirmation_link, false);
    $headers = ['Content-Type: text/html; charset=UTF-8', 'From: ' . BAARIA_FROM_EMAIL];

    $mail_sent = wp_mail($email, $subject, $message_html, $headers);

    if ($mail_sent) {
        return new WP_REST_Response(['success' => true, 'message' => 'Email di conferma inviata. Controlla la tua casella di posta (anche spam) e clicca sul link per confermare la prenotazione.'], 200);
    } else {
        wp_delete_post($booking_id, true);
        return new WP_REST_Response(['success' => false, 'message' => 'Errore nell\'invio dell\'email di conferma.'], 500);
    }
}

function baaria_handle_confirm_booking_with_pdf_request_v6(WP_REST_Request $request)
{
    $token = sanitize_text_field($request->get_param('token'));

    if (empty($token)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Token mancante.'], 400);
    }

    $booking_id = baaria_get_booking_id_by_token($token, 'pending');
    if (!$booking_id) {
        $already_confirmed_id = baaria_get_booking_id_by_token($token, 'publish', true);
        if ($already_confirmed_id) {
            return new WP_REST_Response(['success' => true, 'message' => 'Prenotazione già confermata in precedenza.', 'already_confirmed' => true], 200);
        }
        return new WP_REST_Response(['success' => false, 'message' => 'Token non valido o già utilizzato.'], 400);
    }

    $expiration_time = get_post_meta($booking_id, '_token_expiration', true);
    if (time() > $expiration_time) {
        wp_delete_post($booking_id, true);
        return new WP_REST_Response(['success' => false, 'message' => 'Token scaduto. La prenotazione è stata cancellata. Si prega di effettuare una nuova prenotazione.'], 400);
    }

    $updated = wp_update_post(['ID' => $booking_id, 'post_status' => 'publish']);
    if (is_wp_error($updated) || $updated === 0) {
        return new WP_REST_Response(['success' => false, 'message' => 'Errore nella conferma della prenotazione.'], 500);
    }

    $movie_id = get_post_meta($booking_id, '_movie_id', true);
    $showtime_key = get_post_meta($booking_id, '_showtime_key', true);
    $seats = get_post_meta($booking_id, '_seats', true);
    baaria_update_occupied_seats_internal_v6($movie_id, $showtime_key, $seats);

    $pdf_path = baaria_generate_ticket_pdf_v6($booking_id);

    $name = get_post_meta($booking_id, '_customer_name', true);
    $email = get_post_meta($booking_id, '_customer_email', true);
    $movie_title = get_the_title($movie_id);

    $proiezione_id = get_post_meta($booking_id, '_proiezione_id', true);
    $location_name = $proiezione_id ? get_field('nome_location_proiezione', $proiezione_id) : 'N/D';
    $showtime_desc = get_post_meta($booking_id, '_showtime_description', true);

    $subject = "Prenotazione confermata per $movie_title";
    $message_html = baaria_get_email_html_template_v6($name, $movie_title, $location_name, $showtime_desc, $seats, null, true);
    $headers = ['Content-Type: text/html; charset=UTF-8', 'From: ' . BAARIA_FROM_EMAIL];
    $attachments = [];
    if (!empty($pdf_path) && file_exists($pdf_path)) {
        $attachments[] = $pdf_path;
    }

    wp_mail($email, $subject, $message_html, $headers, $attachments);

    if (!empty($pdf_path) && file_exists($pdf_path)) {
        unlink($pdf_path);
    }   

    delete_post_meta($booking_id, '_confirmation_token');
    delete_post_meta($booking_id, '_token_expiration');

    return new WP_REST_Response(['success' => true, 'message' => 'Prenotazione confermata con successo. Riceverai un\'email con il biglietto.'], 200);
}

function baaria_get_occupied_seats_request_v6(WP_REST_Request $request)
{
    $movie_id = intval($request->get_param('movie_id'));
    $showtime_key = sanitize_text_field($request->get_param('showtime_key'));

    if (empty($movie_id) || empty($showtime_key)) {
        return new WP_REST_Response(['error' => 'movie_id o showtime_key mancante'], 400);
    }
    $occupiedSeats = get_post_meta($movie_id, '_occupied_seats_' . $showtime_key, true) ?: [];
    return new WP_REST_Response(['occupiedSeats' => $occupiedSeats], 200);
}

function baaria_check_confirmation_token_request_v6(WP_REST_Request $request)
{
    $token = sanitize_text_field($request->get_param('token'));
    $booking_id = baaria_get_booking_id_by_token($token, 'pending');

    if (!$booking_id) {
        $already_confirmed_id = baaria_get_booking_id_by_token($token, 'publish', true);
        if ($already_confirmed_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Questa prenotazione è già stata confermata.', 'already_confirmed' => true], 400);
        }
        return new WP_REST_Response(['success' => false, 'message' => 'Token non valido o prenotazione non trovata.'], 400);
    }

    $expiration_time = get_post_meta($booking_id, '_token_expiration', true);
    if (time() > $expiration_time) {
        return new WP_REST_Response(['success' => false, 'message' => 'Token scaduto. Effettua una nuova prenotazione.'], 400);
    }

    $movie_id = get_post_meta($booking_id, '_movie_id', true);
    $proiezione_id = get_post_meta($booking_id, '_proiezione_id', true);

    $location_name = $proiezione_id ? get_field('nome_location_proiezione', $proiezione_id) : 'N/D';
    $location_address = $proiezione_id ? get_field('indirizzo_location_proiezione', $proiezione_id) : '';


    $booking_details = [
        'id' => $booking_id,
        'name' => get_post_meta($booking_id, '_customer_name', true),
        'email' => get_post_meta($booking_id, '_customer_email', true),
        'phone' => get_post_meta($booking_id, '_customer_phone', true),
        'movie_id' => $movie_id,
        'movie_name' => get_the_title($movie_id),
        'proiezione_id' => $proiezione_id,
        'location_name' => $location_name,
        'location_address' => $location_address,
        'showtime'      => get_post_meta($booking_id, '_showtime_description', true),
        'showtime_key' => get_post_meta($booking_id, '_showtime_key', true),
        'seats' => get_post_meta($booking_id, '_seats', true),
    ];
    return new WP_REST_Response(['success' => true, 'booking' => $booking_details], 200);
}

function baaria_handle_delete_booking_request_v6(WP_REST_Request $request)
{
    $booking_id = intval($request->get_param('id'));

    if (!$booking_id || get_post_type($booking_id) !== 'booking') {
        return new WP_REST_Response(['success' => false, 'message' => 'ID prenotazione non valido.'], 400);
    }

    $movie_id = get_post_meta($booking_id, '_movie_id', true);
    $showtime_key = get_post_meta($booking_id, '_showtime_key', true);
    $seats_to_remove = get_post_meta($booking_id, '_seats', true);
    $booking_status_before_delete = get_post_status($booking_id);


    $deleted = wp_delete_post($booking_id, true);

    if ($deleted) {
        if ($booking_status_before_delete === 'publish' && $movie_id && $showtime_key && is_array($seats_to_remove)) {
            baaria_update_occupied_seats_internal_v6($movie_id, $showtime_key, [], $seats_to_remove);
        }
        return new WP_REST_Response(['success' => true, 'message' => 'Prenotazione eliminata con successo.'], 200);
    } else {
        return new WP_REST_Response(['success' => false, 'message' => 'Errore durante l\'eliminazione della prenotazione.'], 500);
    }
}

function baaria_get_all_bookings_request_v6(WP_REST_Request $request)
{
    $args = [
        'post_type'   => 'booking',
        'post_status' => ['publish', 'pending'],
        'numberposts' => -1,
        'orderby'     => 'date',
        'order'       => 'DESC',
    ];
    $bookings_posts = get_posts($args);
    $data = [];

    foreach ($bookings_posts as $booking_post) {
        $booking_id = $booking_post->ID;
        $proiezione_id = get_post_meta($booking_id, '_proiezione_id', true);
        $location_name = $proiezione_id ? get_field('nome_location_proiezione', $proiezione_id) : 'N/D';

        $data[] = [
            'id'          => $booking_id,
            'name'        => get_post_meta($booking_id, '_customer_name', true),
            'email'       => get_post_meta($booking_id, '_customer_email', true),
            'phone'       => get_post_meta($booking_id, '_customer_phone', true),
            'movie_id'    => get_post_meta($booking_id, '_movie_id', true),
            'movie'       => get_the_title(get_post_meta($booking_id, '_movie_id', true)),
            'location_name' => $location_name,
            'showtime_desc' => get_post_meta($booking_id, '_showtime_description', true),
            'seats'       => get_post_meta($booking_id, '_seats', true),
            'booking_date' => get_the_date('Y-m-d H:i:s', $booking_id),
            'status' => get_post_status($booking_id),
            'token' => get_post_meta($booking_id, '_confirmation_token', true),
        ];
    }
    return new WP_REST_Response($data, 200);
}


function baaria_get_booking_id_by_token($token, $status = 'pending', $ignore_expiration = false)
{
    $args = [
        'post_type'  => 'booking',
        'post_status' => $status,
        'meta_query' => [
            ['key' => '_confirmation_token', 'value' => $token],
        ],
        'posts_per_page' => 1,
        'fields' => 'ids',
    ];
    $query = new WP_Query($args);

    if ($query->have_posts()) {
        $booking_id = $query->posts[0];
        if ($ignore_expiration || $status !== 'pending') {
            return $booking_id;
        }
        $expiration_time = get_post_meta($booking_id, '_token_expiration', true);
        if (time() <= $expiration_time) {
            return $booking_id;
        }
    }
    return null;
}

function baaria_update_occupied_seats_internal_v6($movie_id, $showtime_key, $seats_to_add = [], $seats_to_remove = [])
{
    if (empty($movie_id) || empty($showtime_key)) return false;

    $occupiedSeatsMetaKey = '_occupied_seats_' . $showtime_key;
    $occupiedSeats = get_post_meta($movie_id, $occupiedSeatsMetaKey, true) ?: [];
    if (!is_array($occupiedSeats)) $occupiedSeats = [];

    if (!empty($seats_to_add) && is_array($seats_to_add)) {
        $occupiedSeats = array_merge($occupiedSeats, $seats_to_add);
    }
    if (!empty($seats_to_remove) && is_array($seats_to_remove)) {
        $occupiedSeats = array_diff($occupiedSeats, $seats_to_remove);
    }
    $occupiedSeats = array_values(array_unique($occupiedSeats));
    return update_post_meta($movie_id, $occupiedSeatsMetaKey, $occupiedSeats);
}

function baaria_generate_ticket_pdf_v6($booking_id)
{
    if (!class_exists('Dompdf\Dompdf')) {
        if (file_exists(plugin_dir_path(__FILE__) . 'dompdf/vendor/autoload.php')) {
            require_once plugin_dir_path(__FILE__) . 'dompdf/vendor/autoload.php';
        } else {
            error_log('Baarìa Booking: Dompdf library not found. Please run "composer install" in the plugin directory.');
            return null;
        }
    }
    if (!class_exists('Dompdf\Dompdf')) {
        error_log('Baarìa Booking: Dompdf class still not found after attempting to load autoload.php.');
        return null;
    }


    $name = get_post_meta($booking_id, '_customer_name', true);
    $movie_id = get_post_meta($booking_id, '_movie_id', true);
    $proiezione_id = get_post_meta($booking_id, '_proiezione_id', true);

    $location_name = $proiezione_id ? get_field('nome_location_proiezione', $proiezione_id) : 'N/D';
    $location_address = $proiezione_id ? get_field('indirizzo_location_proiezione', $proiezione_id) : '';
    $showtime_desc = get_post_meta($booking_id, '_showtime_description', true);
    $seats_array = get_post_meta($booking_id, '_seats', true);
    $seats = is_array($seats_array) ? implode(", ", $seats_array) : '';
    $movie_title = get_the_title($movie_id);
    $booking_ref = "BFF-" . $booking_id . "-" . strtoupper(substr(md5($booking_id . $name), 0, 6));


    $html = '
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style>
            body { font-family: "DejaVu Sans", sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; font-size: 11pt; }
            .ticket { width: 90%; max-width: 700px; margin: 20px auto; padding: 25px; border: 2px solid #b08d57; border-radius: 10px; background: #fff; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #b08d57; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { color: #2d2d2d; font-size: 22px; margin: 0 0 5px 0; font-weight: bold; }
            .header p { color: #555; font-size: 14px; margin: 0; }
            .details { margin: 20px 0; }
            .detail-row { margin-bottom: 10px; padding: 8px 10px; background: #f8f5f0; border-radius: 5px; border-left: 3px solid #b08d57;}
            .detail-label { color: #555; font-size: 10pt; display: block; margin-bottom: 2px; font-weight: normal; }
            .detail-value { color: #2d2d2d; font-size: 12pt; font-weight: bold; }
            .qr-code { text-align: center; margin-top: 20px; margin-bottom:10px; }
            .qr-code img { max-width: 120px; height: auto; }
            .footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; color: #777; font-size: 9pt; }
            .booking-ref { text-align:center; font-size: 10pt; color: #444; margin-bottom: 15px; }
        </style>
    </head>
    <body>
        <div class="ticket">
            <div class="header">
                <h1>Baarìa Film Festival</h1>
                <p>Biglietto di Ingresso / Conferma Prenotazione</p>
            </div>
            <div class="booking-ref">Rif. Prenotazione: <strong>' . esc_html($booking_ref) . '</strong></div>
            <div class="details">
                <div class="detail-row"><span class="detail-label">Nominativo</span><span class="detail-value">' . esc_html($name) . '</span></div>
                <div class="detail-row"><span class="detail-label">Evento</span><span class="detail-value">' . esc_html($movie_title) . '</span></div>
                <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">' . esc_html($location_name) . ($location_address ? ' - ' . esc_html($location_address) : '') . '</span></div>
                <div class="detail-row"><span class="detail-label">Data e Ora</span><span class="detail-value">' . esc_html($showtime_desc) . '</span></div>
                <div class="detail-row"><span class="detail-label">Posti Selezionati</span><span class="detail-value">' . esc_html($seats) . '</span></div>
            </div>';

    if (class_exists('\chillerlan\QRCode\QRCode') && class_exists('\chillerlan\QRCode\QROptions')) {
        try {
            $qr_data = json_encode(['booking_id' => $booking_id, 'ref' => $booking_ref, 'event' => $movie_title, 'name' => $name, 'seats' => $seats]);
            $qr_options = new \chillerlan\QRCode\QROptions([
                'version'    => 5,
                'outputType' => \chillerlan\QRCode\QRCode::OUTPUT_IMAGE_PNG,
                'eccLevel'   => \chillerlan\QRCode\QRCode::ECC_L,
                'imageBase64' => true,
            ]);
            $qrcode_base64 = (new \chillerlan\QRCode\QRCode($qr_options))->render($qr_data);
            if ($qrcode_base64) {
                $html .= '<div class="qr-code"><img src="' . $qrcode_base64 . '" alt="QR Code Prenotazione"></div>';
            }
        } catch (Exception $e) {
            error_log("QR Code generation failed: " . $e->getMessage());
        }
    } else {
        $html .= '<div class="qr-code" style="font-size:9pt; color:#888;">(QR Code non disponibile)</div>';
    }

    $html .= '
            <div class="footer">
                <p>Presenta questo biglietto (digitale o stampato) all\'ingresso della sala.</p>
                <p>Questo biglietto è personale e non cedibile. Eventuali modifiche o cancellazioni devono essere gestite tramite i canali ufficiali del festival.</p>
                <p>Baarìa Film Festival &copy; ' . date('Y') . ' - Tutti i diritti riservati.</p>
            </div>
        </div>
    </body>
    </html>';

    try {
        $dompdf = new Dompdf\Dompdf();
        $options = $dompdf->getOptions();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'DejaVu Sans');
        $dompdf->setOptions($options);

        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $upload_dir = wp_upload_dir();
        $pdf_dir = $upload_dir['basedir'] . '/baaria-tickets/';
        if (!file_exists($pdf_dir)) {
            wp_mkdir_p($pdf_dir);
        }
        $pdf_filename = 'ticket-bff-' . $booking_id . '-' . time() . '.pdf';
        $pdf_path = $pdf_dir . $pdf_filename;

        if (file_put_contents($pdf_path, $dompdf->output())) {
            return $pdf_path;
        } else {
            error_log("Baarìa Booking: Failed to write PDF to: " . $pdf_path);
            return null;
        }
    } catch (Exception $e) {
        error_log("Baarìa Booking - Dompdf Exception: " . $e->getMessage());
        return null;
    }
    return null;
}


function baaria_get_email_html_template_v6($name, $movie_title, $location_name, $showtime_desc, $seats_array, $confirmation_link, $is_final_confirmation)
{
    $seats = is_array($seats_array) ? implode(', ', $seats_array) : '';
    $greeting = "Ciao " . esc_html($name) . ",";

    $email_style = "
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 25px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 15px; border-bottom: 1px solid #eeeeee; margin-bottom: 20px; }
        .header h1 { color: #b08d57; font-size: 24px; margin:0; }
        .content p { margin-bottom: 15px; font-size: 15px; }
        .details-box { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #b08d57; }
        .details-box p { margin-bottom: 8px; font-size: 14px; }
        .details-box strong { color: #444444; }
        .button-link { display: inline-block; background-color: #b08d57; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; font-size: 16px; }
        .button-container { text-align: center; margin: 25px 0; }
        .footer { text-align: center; margin-top: 25px; font-size: 12px; color: #777777; }
        .footer a { color: #b08d57; text-decoration: none; }
    ";

    $intro_message = $is_final_confirmation ?
        "<p>La tua prenotazione per il Baarìa Film Festival è stata <strong>confermata con successo!</strong></p>" :
        "<p>Grazie per aver iniziato il processo di prenotazione per il Baarìa Film Festival. Manca solo un ultimo passo!</p>";

    $details_html = "
        <div class='details-box'>
            <p><strong>Evento:</strong> " . esc_html($movie_title) . "</p>
            <p><strong>Location:</strong> " . esc_html($location_name) . "</p>
            <p><strong>Orario:</strong> " . esc_html($showtime_desc) . "</p>
            <p><strong>Posti Selezionati:</strong> " . esc_html($seats) . "</p>
        </div>";

    $call_to_action = "";
    if (!$is_final_confirmation && $confirmation_link) {
        $call_to_action = "
            <p>Per finalizzare la tua prenotazione, ti preghiamo di cliccare sul pulsante qui sotto entro <strong>10 minuti</strong>:</p>
            <div class='button-container'>
                <a href='" . esc_url($confirmation_link) . "' class='button-link'>Conferma la Prenotazione</a>
            </div>
            <p style='font-size:12px; text-align:center;'>Se il pulsante non funziona, copia e incolla il seguente link nel tuo browser:<br>" . esc_url($confirmation_link) . "</p>
            <p>Se non hai richiesto questa prenotazione, puoi ignorare questa email.</p>";
    } elseif ($is_final_confirmation) {
        $call_to_action = "<p>Siamo lieti di averti con noi! Troverai in allegato a questa email il tuo biglietto in formato PDF (se la generazione è andata a buon fine).</p><p>Ricorda di presentare il biglietto (digitale o stampato) per l'accesso alla sala. Ti consigliamo di arrivare con un po' di anticipo.</p>";
    }

    return "
    <html>
    <head>
        <title>Baarìa Film Festival - Prenotazione</title>
        <style>" . $email_style . "</style>
    </head>
    <body>
        <div class='container'>
            <div class='header'><h1>Baarìa Film Festival</h1></div>
            <div class='content'>
                <p>$greeting</p>
                $intro_message
                $details_html
                $call_to_action
                <p>Se hai domande o necessiti di assistenza, non esitare a contattarci.</p>
                <p>Cordiali saluti,<br>Il Team del Baarìa Film Festival</p>
            </div>
            <div class='footer'>
                <p>&copy; " . date('Y') . " Baarìa Film Festival. Tutti i diritti riservati.</p>
                <p><a href='https://www.baariafilmfestival.com/'>Visita il nostro sito</a></p>
            </div>
        </div>
    </body>
    </html>";
}