<?php

class Calendar
{

    private const GRAPH_API_ENDPOINT_ME = 'https://graph.microsoft.com/v1.0/me';
    private const GRAPH_API_ENDPOINT_EVENTS = 'https://graph.microsoft.com/v1.0/me/calendar/events';
    private const GRAPH_API_ENDPOINT_EVENTS_RESPONSE = 'https://graph.microsoft.com/v1.0/me/events/%s/%s';
    private const MAX_PAGE_LOAD = 250;
    private $accessToken;

    public function __construct($accessToken)
    {
        $this->setAccessToken($accessToken);

        $action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

        switch ($action) {
            case 'LIST':
                $this->renderFullCalendar();
                break;
            case 'DELETE':
                $this->deleteEvent($_POST['eventId']);
                break;
            case 'RESPONSE':
                $this->responseStatus($_POST['eventId'], $_POST['response']);
                break;
        }
    }

    public function setAccessToken($accessToken)
    {
        $this->accessToken = $accessToken;
    }

    public function getAccessToken()
    {
        return $this->accessToken;
    }

    public function getEvents($eventId = '', $pageToken = null)
    {
        $accessToken = $this->getAccessToken();

        // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
        $graphApiEndpoint = self::GRAPH_API_ENDPOINT_EVENTS;

        if (!empty($eventId)) {
            $graphApiEndpoint .= '/' . $eventId;
        }

        // Configura os parâmetros de consulta para lidar com a paginação
        $queryParams = ['top' => self::MAX_PAGE_LOAD]; // Define o número máximo de eventos por página

        if (!is_null($pageToken)) {
            $queryParams['$skiptoken'] = $pageToken; // Define o token de página para recuperar a próxima página de eventos
        }

        $graphApiEndpoint .= '?' . http_build_query($queryParams);

        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Prefer: outlook.timezone = "America/Sao_Paulo"',
            'Content-type: application/json'
        ];

        return $this->executeCurl($graphApiEndpoint, $headers, "GET");
    }

    public function getUser(){
        $accessToken = $this->getAccessToken();

        // Endpoint da API do Microsoft Graph para obter os dados do usuário
        $graphApiEndpoint = self::GRAPH_API_ENDPOINT_ME;

        $headers = [
            'Authorization: Bearer ' . $accessToken, 
            'Prefer: outlook.timezone = "America/Sao_Paulo"',
            'Content-type: application/json'
        ];

        $user = $this->executeCurl($graphApiEndpoint, $headers, "GET");

        return $user;
    }

    public function deleteEvent($eventId){
        $accessToken = $this->getAccessToken();

        // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
        $graphApiEndpoint = self::GRAPH_API_ENDPOINT_EVENTS;
        $graphApiEndpoint .= '/' . $eventId;

        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Prefer: outlook.timezone = "America/Sao_Paulo"',
            'Content-type: application/json'
        ];

        return $this->executeCurl($graphApiEndpoint, $headers, "DELETE");
    }

    public function responseStatus($eventId, $response)
    {
        $accessToken = $this->getAccessToken();

        $status = [
            'accepted' => 'accept',
            'declined' => 'decline',
            'tentativelyAccepted' => 'tentativelyAccept'
        ];

        // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
        $graphApiEndpoint = sprintf(self::GRAPH_API_ENDPOINT_EVENTS_RESPONSE, $eventId, $status[$response]);

        // Configura o cabeçalho da requisição
        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Prefer: outlook.timezone = "America/Sao_Paulo"',
            'Content-type: application/json'
        ];

        $data = [
            'sendResponse' => true
        ];

        return $this->executeCurl($graphApiEndpoint, $headers, "POST", $data);
    }

    public function formatEventsFullCalendar($responseEvents)
    {
        // Formata a resposta dos eventos para ser retornada ao cliente
        $arrayItens = [];

        $emailAddress = $this->getUser()->mail;

        foreach ($responseEvents->value as $itemCalendar) {
            $item = new stdClass();
            $item->start = $itemCalendar->start->dateTime;
            $item->end = $itemCalendar->end->dateTime;
            $item->title = str_replace(' [In-person]', ' [Presencial]', $itemCalendar->subject);
            $item->eventAuthor = $itemCalendar->organizer->emailAddress->name;
            $item->eventAuthorAddress = $itemCalendar->organizer->emailAddress->address;
            $item->extendedProps = new stdClass();

            if ($itemCalendar->isOnlineMeeting == true) {
                $item->extendedProps->type = true;
            } else {
                $item->extendedProps->type = false;
            }

            $item->extendedProps->url = '';
            if (isset($itemCalendar->onlineMeeting) && isset($itemCalendar->onlineMeeting->joinUrl)) {
                $item->extendedProps->url = $itemCalendar->onlineMeeting->joinUrl;
            }
            $item->extendedProps->body = $itemCalendar->body->content;
            $item->extendedProps->id = $itemCalendar->id;
            $item->extendedProps->isOrganizer = $itemCalendar->isOrganizer;
            $item->extendedProps->allDay = $itemCalendar->isAllDay;
            $item->extendedProps->location = $itemCalendar->locations;
            $item->extendedProps->attendees = [];

            if (isset($itemCalendar->attendees)) {
                $item->extendedProps->attendees =  $itemCalendar->attendees;
            }

            $item->extendedProps->userMail = $emailAddress;
    
            $arrayItens[] = $item;
        }

        return $arrayItens;
    }

    public function renderFullCalendar()
    {
        $events = $this->getEvents();
        echo json_encode($this->formatEventsFullCalendar($events));
    }

    private function executeCurl($endpoint, $headers, $type, $data = [])
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $type);

        if (!empty($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } else {
            curl_setopt($ch, CURLOPT_POST, false);
        }

        // Executa a solicitação para o endpoint
        $response = curl_exec($ch);

        // Verifica se ocorreu algum erro durante a solicitação cURL
        if (curl_errno($ch)) {
            throw 'Erro eventos do Office 365: ' . curl_error($ch);
        } else {
            return json_decode($response);
        }
    }
}
