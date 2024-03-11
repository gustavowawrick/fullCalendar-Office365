import { Calendar } from '@fullcalendar/core'; // Importa a classe Calendar do FullCalendar
import dayGridPlugin from '@fullcalendar/daygrid'; // Importa o plugin dayGrid do FullCalendar

document.addEventListener('DOMContentLoaded', function () {
  // Obtém o access token da URL
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');

  // Se o access token estiver presente, cria o calendário
  if (accessToken) {
    const calendarEl = document.getElementById('calendar');
    const calendar = new Calendar(calendarEl, { // Cria uma nova instância do calendário
      plugins: [dayGridPlugin],
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      // Função para carregar eventos do Office 365
      events: function (info, successCallback, failureCallback) {
        fetch('https://graph.microsoft.com/v1.0/me/calendar/events', { // Faz uma solicitação para obter os eventos do calendário do usuário no Office 365
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        })
          .then(response => response.json()) // Converte a resposta em formato JSON
          .then(data => {
            const events = data.value.map(event => ({ // Mapeia os eventos retornados para o formato esperado pelo FullCalendar
              title: event.subject,
              start: event.start.dateTime,
              end: event.end.dateTime
            }));
            successCallback(events);
          })
          .catch(error => {
            console.error('Erro ao carregar eventos:', error);
            failureCallback(error);
          });
      }
    });

    calendar.render(); // Renderiza o calendário na página
  } else {
    console.error('Access token não encontrado na URL');
  }
});
