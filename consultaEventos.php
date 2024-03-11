<?php

error_reporting(E_ERROR | E_PARSE);

session_start();

function calendarEvents($action = 'GET', $eventId = '')
{
    $accessToken = $_SESSION['access_token'];

    // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário

    if (isset($_POST['eventId'])) {
        $eventId = '/' . $_POST['eventId'];
    } else {
        $eventId = '';
    }

    $graphApiEndpoint = 'https://graph.microsoft.com/v1.0/me/calendar/events' . $eventId;

    $ch = curl_init();

    // Configura a solicitação para a API do Microsoft Graph
    curl_setopt($ch, CURLOPT_URL, $graphApiEndpoint);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Authorization: Bearer ' . $accessToken
    ));

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Desativa a verificação do host SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Desativa a verificação do peer SSL

    if (isset($_POST['eventId'])) {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
        //curl_setopt($ch, CURLOPT_POST, ['eventId' => $_POST['eventId']]);
    } else {
        curl_setopt($ch, CURLOPT_POST, false);
    }

    // Executa a solicitação para obter os eventos do calendário do usuário

    $responseEvents = json_decode(curl_exec($ch));

    // Verifica se ocorreu algum erro durante a solicitação cURL
    if (curl_errno($ch)) {
        echo 'Erro ao obter eventos do Office 365: ' . curl_error($ch);
    } else {
        return $responseEvents;
    }
}

$responseEvents = calendarEvents();

if (!isset($_POST['eventId'])) {

    $arrayItens = [];

    foreach ($responseEvents->value as $itemCalendar) {
        $item = new stdClass();
        $item->start = $itemCalendar->start->dateTime;
        $item->end = $itemCalendar->end->dateTime;
        $item->title = $itemCalendar->subject;
        $item->author = $itemCalendar->organizer->emailAddress->name;

        $item->extendedProps = new stdClass();

        if ($itemCalendar->isOnlineMeeting == true) {
            $item->extendedProps->type = true;
        } else {
            $item->extendedProps->type = false;
        }

        $item->extendedProps->url = $itemCalendar->onlineMeeting->joinUrl;

        $item->extendedProps->bodyPreview = $itemCalendar->bodyPreview;

        $item->extendedProps->id = $itemCalendar->id;

        $arrayItens[] = $item;
    }

    echo (json_encode($arrayItens));
} else {
    var_dump($responseEvents);
}
