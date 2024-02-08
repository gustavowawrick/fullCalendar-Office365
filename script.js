import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

document.addEventListener('DOMContentLoaded', function() {
  // Obtém o access token da URL
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');

  // Se o access token estiver presente, cria o calendário
  if (accessToken) {
    const calendarEl = document.getElementById('calendar');
    const calendar = new Calendar(calendarEl, {
      plugins: [ dayGridPlugin ],
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      // Função para carregar eventos do Office 365
      events: function(info, successCallback, failureCallback) {
        fetch('https://graph.microsoft.com/v1.0/me/calendar/events', {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        })
        .then(response => response.json())
        .then(data => {
          const events = data.value.map(event => ({
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

    calendar.render();
  } else {
    console.error('Access token não encontrado na URL');
  }
});
