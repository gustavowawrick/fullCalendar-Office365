<?php

// Define as credenciais do aplicativo Office 365
require_once "config.php";

// Redireciona o usuário para a página de login do Office 365
// O header() é usado para redirecionar o usuário para a URL especificada
// A URL inclui os parâmetros necessários para iniciar o processo de autenticação OAuth 2.0
header('Location: https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=' . $clientId . '&redirect_uri=' . urlencode($redirectUri) . '&scope=Calendars.Read&response_type=code');
// A função exit() é chamada para garantir que o script seja encerrado após o redirecionamento
exit();
