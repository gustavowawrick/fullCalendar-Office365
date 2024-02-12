<?php

session_start();

$accessToken = $_SESSION['access_token'];

// Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
$graphApiEndpoint = 'https://graph.microsoft.com/v1.0/me/calendar/events';

$ch = curl_init();

// Configura a solicitação para a API do Microsoft Graph
curl_setopt($ch, CURLOPT_URL, $graphApiEndpoint);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer ' . $accessToken
));

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Desativa a verificação do host SSL
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Desativa a verificação do peer SSL

curl_setopt($ch, CURLOPT_POST, false);

// Executa a solicitação para obter os eventos do calendário do usuário
$responseEvents = curl_exec($ch);

// Verifica se ocorreu algum erro durante a solicitação cURL
if (curl_errno($ch)) {
    echo 'Erro ao obter eventos do Office 365: ' . curl_error($ch);
} else {
    // Redireciona para a página calendar.html com o token de acesso e os eventos codificados na URL
    echo ($responseEvents);
}
