<?php

session_start();

require_once "config.php";

// Obtém o código de autorização da URL, que é fornecido após o usuário autenticar-se no Office 365
$authorizationCode = $_GET['code'];

// Verifica se o código de autorização está presente na URL
if (isset($authorizationCode)) {
    // Dados a serem enviados para obter o token de acesso
    $postData = [
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'redirect_uri' => $redirectUri,
        'code' => $authorizationCode,
        'grant_type' => 'authorization_code'
    ];

    // Inicializa uma sessão cURL
    $ch = curl_init();

    // Configura as opções da sessão cURL para obter o token de acesso
    curl_setopt($ch, CURLOPT_URL, 'https://login.microsoftonline.com/common/oauth2/v2.0/token');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Desativa a verificação do host SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Desativa a verificação do peer SSL

    // Executa a solicitação e obtém a resposta
    $response = curl_exec($ch);

    // Verifica se ocorreu algum erro durante a solicitação cURL
    if (curl_errno($ch)) {
        echo 'Erro ao obter token de acesso: ' . curl_error($ch);
    } else {
        // Decodifica a resposta JSON para um array associativo
        $responseData = json_decode($response, true);

        // Verifica se a resposta contém um token de acesso válido
        if ($responseData && isset($responseData['access_token'])) {
            $accessToken = $responseData['access_token'];

            $_SESSION['access_token'] = $accessToken;

            // Endpoint da API do Microsoft Graph para obter os eventos do calendário do usuário
            // Redireciona para a página calendar.html com o token de acesso e os eventos codificados na URL
            header('Location: index.html');
            exit();
        } else {
            // Exibe uma mensagem de erro se não foi possível obter o token de acesso
            echo 'Erro ao obter token de acesso: Resposta inválida';
            // Adicione esta linha para depurar e verificar a resposta
            echo $response;
        }
    }

    // Fecha a sessão cURL
    curl_close($ch);
} else {
    // Exibe uma mensagem de erro se o código de autorização não estiver presente na URL
    echo 'Código de autorização não encontrado.';
    // Você pode redirecionar para uma página de erro aqui se desejar
}
