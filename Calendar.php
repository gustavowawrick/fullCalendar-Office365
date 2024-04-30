<?php

class Calendar{

    private $graphApiEndpointEvents = 'https://graph.microsoft.com/v1.0/me/calendar/events';
    private $graphApiEndpointEventsResponse = 'https://graph.microsoft.com/v1.0/me/events/%s/%s';
    private $accessToken;

    public function __construct($accessToken)
    {
        $this->setAccessToken($accessToken);

        $action = isset($_REQUEST['action']) ? $_REQUEST['action']: '';

        if ($action == 'LIST'){
            $this->RenderFullCalendar();
        }

        if ($action == 'DELETE'){
            $this->DeleteEvent($_POST['eventId']);
        }

        if ($action == 'RESPONSE'){
            $this->ResponseStatus($_POST['eventId'],$_POST['response']);
        }
    }

    public function setAccessToken($accessToken){
        $this->accessToken = $accessToken;
    }

    public function getAccessToken(){
        return $this->accessToken;
    }

    public function GetEvents($eventId = '', $pageToken = null){
        $accessToken = $this->getAccessToken();

        // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
        $graphApiEndpoint = $this->graphApiEndpointEvents;

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
        curl_setopt($ch, CURLOPT_POST, false);

        // Executa a solicitação para obter os eventos do calendário do usuário
        $response = curl_exec($ch);

        // Verifica se ocorreu algum erro durante a solicitação cURL
        if (curl_errno($ch)) {
            throw 'Erro ao obter eventos do Office 365: ' . curl_error($ch);
        } else {
            return json_decode($response);
        }
    }

    public function DeleteEvent($eventId){
        $accessToken = $this->getAccessToken();

        // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
        $graphApiEndpoint = $this->graphApiEndpointEvents;
        $graphApiEndpoint .= '/' . $eventId;

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
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");

        // Executa a solicitação para obter os eventos do calendário do usuário
        $response = curl_exec($ch);

        // Verifica se ocorreu algum erro durante a solicitação cURL
        if (curl_errno($ch)) {
            throw 'Erro ao remover eventos do Office 365: ' . curl_error($ch);
        } else {
            return json_decode($response);
        }
    }

    public function ResponseStatus($eventId, $response){
        $accessToken = $this->getAccessToken();

        $status = [
            'accepted' => 'accept',
            'declined' => 'decline',
            'tentativelyAccepted' => 'tentativelyAccept'
        ];

        // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
        $graphApiEndpoint = sprintf($this->graphApiEndpointEventsResponse,$eventId, $status[$response]);

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

        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        // Executa a solicitação para obter os eventos do calendário do usuário
        $response = curl_exec($ch);

        // Verifica se ocorreu algum erro durante a solicitação cURL
        if (curl_errno($ch)) {
            throw 'Erro ao responder eventos do Office 365: ' . curl_error($ch);
        } else {
            return json_decode($response);
        }
    }

    public function FormatEventsFullCalendar($responseEvents){
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
    
        return $arrayItens;
    }

    public function RenderFullCalendar(){
        $events = $this->GetEvents();
        echo json_encode($this->FormatEventsFullCalendar($events));
    }

}