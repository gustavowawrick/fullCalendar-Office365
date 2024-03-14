<?php

error_reporting(E_ERROR | E_PARSE);

date_default_timezone_set('America/Sao_Paulo');

session_start();

function calendarEvents($action = 'GET', $eventId = '', $pageToken = null)
{
    $accessToken = $_SESSION['access_token'];

    // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
    $graphApiEndpoint = 'https://graph.microsoft.com/v1.0/me/calendar/events';

    if (!empty($eventId)) {
        $graphApiEndpoint .= '/' . $eventId;
    }

    // Configura os parâmetros de consulta para lidar com a paginação
    $queryParams = ['top' => 50]; // Define o número máximo de eventos por página

    if (!is_null($pageToken)) {
        $queryParams['$skiptoken'] = $pageToken; // Define o token de página para recuperar a próxima página de eventos
    }

    $graphApiEndpoint .= '?' . http_build_query($queryParams);

    // Configura a solicitação para a API do Microsoft Graph
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $graphApiEndpoint);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken, 'Prefer: outlook.timezone = "America/Sao_Paulo"']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Desativa a verificação do host SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Desativa a verificação do peer SSL

    if ($action == 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
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

// Verifica se foi enviada uma solicitação de exclusão de evento
if (isset($_POST['eventId'])) {
    $eventId = $_POST['eventId'];
    // Chama a função para excluir o evento do calendário do Office 365
    $response = calendarEvents('DELETE', $eventId);
    // Retorna a resposta para o cliente
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

    echo json_encode($arrayItens);
}
