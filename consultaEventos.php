<?php

error_reporting(E_ERROR | E_PARSE);
ini_set('display_error', true);

date_default_timezone_set('America/Sao_Paulo');

session_start();

function responseStatus($eventId, $response)
{
    $accessToken = $_SESSION['access_token'];

    $status = [
        'accepted' => 'accept',
        'declined' => 'decline',
        'tentativelyAccepted' => 'tentativelyAccept'
    ];

    // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
    $graphApiEndpoint = 'https://graph.microsoft.com/v1.0/me/events/' . $eventId . '/' . $status[$response];

    // Configura o cabeçalho da requisição
    $headers = [
        'Authorization: Bearer ' . $accessToken, 
        'Prefer: outlook.timezone = "America/Sao_Paulo"',
        'Content-type: application/json'
    ];

    $data = [
        'sendResponse' => true
    ];

    // Configura a solicitação para a API do Microsoft Graph
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $graphApiEndpoint);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Desativa a verificação do host SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Desativa a verificação do peer SSL

    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    // Executa a solicitação para obter os eventos do calendário do usuário
    $response = curl_exec($ch);

    // Verifica se ocorreu algum erro durante a solicitação cURL
    if (curl_errno($ch)) {
        echo 'Erro ao obter eventos do Office 365: ' . curl_error($ch);
    } else {
        return json_decode($response);
    }
}


function getUser()
{
    $accessToken = $_SESSION['access_token'];

    // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
    $graphApiEndpoint = 'https://graph.microsoft.com/v1.0/me';

    // Configura a solicitação para a API do Microsoft Graph
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $graphApiEndpoint);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'Prefer: outlook.timezone = "America/Sao_Paulo"']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Desativa a verificação do host SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Desativa a verificação do peer SSL

    curl_setopt($ch, CURLOPT_POST, false);

    // Executa a solicitação para obter os eventos do calendário do usuário
    $response = curl_exec($ch);

    // Verifica se ocorreu algum erro durante a solicitação cURL
    if (curl_errno($ch)) {
        echo 'Erro ao obter eventos do Office 365: ' . curl_error($ch);
    } else {
        return json_decode($response);
    }
}


function updateEventAttendees($eventId, $attendees){
    $accessToken = $_SESSION['access_token'];     
    // Endpoint da API do Microsoft Graph para atualizar o evento do calendário do usuário
    $graphApiEndpoint = 'https://graph.microsoft.com/v1.0/me/calendar/events/' . $eventId;     
    // Configura a solicitação para a API do Microsoft Graph
    $ch = curl_init();     
    curl_setopt($ch, CURLOPT_URL, $graphApiEndpoint);     
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json', 'Prefer: outlook.timezone = "America/Sao_Paulo"']);     
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);     
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); 
    
    // Desativa a verificação do host SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
    // Desativa a verificação do peer SSL
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");     
    
    // Corpo da solicitação para atualizar o status de resposta dos participantes do evento
    $data = [         
        'attendees' => $attendees    
    ];     
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));     
    
    // Executa a solicitação para atualizar o status de resposta dos participantes do evento no calendário do Office 365
    $response = curl_exec($ch);     
    
    // Verifica se ocorreu algum erro durante a solicitação cURL
    if (curl_errno($ch)) {         
        return ['error' => 'Erro ao atualizar status de resposta dos participantes do evento: ' . curl_error($ch)];     
    } else {         
        return json_decode($response);     
    } 
}


function calendarEvents($action = 'GET', $eventId = '', $pageToken = null)
{
    $accessToken = $_SESSION['access_token'];

    // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
    $graphApiEndpoint = 'https://graph.microsoft.com/v1.0/me/calendar/events';

    if (!empty($eventId)) {
        $graphApiEndpoint .= '/' . $eventId;
    }

    // Configura os parâmetros de consulta para lidar com a paginação
    $queryParams = ['top' => 250]; // Define o número máximo de eventos por página

    if (!is_null($pageToken)) {
        $queryParams['$skiptoken'] = $pageToken; // Define o token de página para recuperar a próxima página de eventos
    }

    $graphApiEndpoint .= '?' . http_build_query($queryParams);

    $headers = [
        'Authorization: Bearer ' . $accessToken, 
        'Prefer: outlook.timezone = "America/Sao_Paulo"',
        'Content-type: application/json'
    ];

    // Configura a solicitação para a API do Microsoft Graph
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $graphApiEndpoint);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Desativa a verificação do host SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Desativa a verificação do peer SSL

    if ($action == 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
    } else if ($action == 'PATCH') {

        $responseUser = getUser();

        $data = [
            'attendees' => [                
                'status' => [
                    'response' => $_POST['response']
                ],
                'emailAddress' => [
                    'address' => $responseUser->{'mail'},
                    'name' => $responseUser->{'displayName'}
                ],
            ]
        ];

        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } else {
        curl_setopt($ch, CURLOPT_POST, false);
    }

    // Executa a solicitação para obter os eventos do calendário do usuário
    $response = curl_exec($ch);

    // Verifica se ocorreu algum erro durante a solicitação cURL
    if (curl_errno($ch)) {
        echo 'Erro ao obter eventos do Office 365: ' . curl_error($ch);
    } else {
        return json_decode($response);
    }
}

$action = filter_input('PATCH', 'action');

echo "ACTION: " . $action . "<br/>";

// Verifica se foi enviada uma solicitação de exclusão de evento
if (isset($_POST['eventId']) && $action == 'DELETE') {
    $eventId = $_POST['eventId'];
    $response = calendarEvents('DELETE', $eventId);

    echo json_encode($response);
} else if (isset($_GET['eventId']) && $action == 'RESPONSE') {
    $eventId = $_GET['eventId'];
    $response = responseStatus($eventId, $_GET['response']);
    echo json_encode($response);
} else {
    // Se não foi enviada uma solicitação de exclusão, retorna os eventos normais
    $responseEvents = calendarEvents();
    // Formata a resposta dos eventos para ser retornada ao cliente
    $arrayItens = [];

    foreach ($responseEvents->value as $itemCalendar) {
        $item = new stdClass();
        $item->start = $itemCalendar->start->dateTime;
        $item->end = $itemCalendar->end->dateTime;
        $item->title = $itemCalendar->subject;
        $item->eventAuthor = $itemCalendar->organizer->emailAddress->name;
        $item->eventAuthorAddress = $itemCalendar->organizer->emailAddress->address;

        $item->extendedProps = new stdClass();

        if ($itemCalendar->isOnlineMeeting == true) {
            $item->extendedProps->type = true;
        } else {
            $item->extendedProps->type = false;
        }

        $item->extendedProps->url = $itemCalendar->onlineMeeting->joinUrl;

        $item->extendedProps->body = $itemCalendar->body->content;

        $item->extendedProps->id = $itemCalendar->id;

        $item->extendedProps->isOrganizer = $itemCalendar->isOrganizer;

        $item->extendedProps->allDay = $itemCalendar->isAllDay;

        $item->extendedProps->location = $itemCalendar->locations;

        $item->extendedProps->attendees = [];

        if (isset($itemCalendar->attendees)) {
            $item->extendedProps->attendees =  $itemCalendar->attendees;
        }

        $arrayItens[] = $item;
    }

    echo json_encode($arrayItens);
}
