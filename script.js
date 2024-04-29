"use strict";

class utilitariosCalendario {

  addTitleAuthor(event) {
    var iniciais = event.extendedProps.eventAuthor.split(' ').map(name => name.charAt(0).toUpperCase()).join('');

    $('.iniciaisAuthor').html(iniciais);
  }

  addHtmlParticipantes(event) {
    var divParticipantes = '';
    var divParticipantesOpcional = '';
    var divAttendees = '';
    var i = 0;
    var tituloObrigatorio = '';
    var tituloOpcional = '';
    var status = '';

    $('.divParticipantes').html('');

    for (i = 0; i < event.extendedProps.attendees.length; i++) {
      if (event.extendedProps.attendees[i].status.response == 'accepted') {
        status = '<span class="fw-semibold d-block pt-1 eventAccepted">Aceita</span>';
      } else if (event.extendedProps.attendees[i].status.response == 'declined') {
        status = '<span class="fw-semibold d-block pt-1 eventDeclined">Recusada</span>';
      } else {
        status = '<span class="text-gray-500 fw-semibold d-block pt-1">Não respondido</span>';
      }

      divAttendees = '<div data-bs-toggle="tooltip" title="' + event.extendedProps.attendees[i].emailAddress.address + '"class="d-flex flex-stack mb-3 divAteendesEvent">' +
        '<div class="divIniciais me-3 w-35px">' +
        '<div class="iniciaisParticipantes">' + event.extendedProps.attendees[i].emailAddress.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('') + '</div>' +
        '</div>' +
        '<div class="d-flex align-items-center flex-row-fluid flex-wrap">' +
        '<div class="flex-grow-1 me-2">' +
        '<a class="text-gray-700 fs-6 fw-bold attendeeName">' + this.truncateText(event.extendedProps.attendees[i].emailAddress.name, 28) + '</a>' +
        status +
        '</div>' +
        '</div>' +
        '<a class="text-hover-primary iconeCopiarParticipantes">' +
        '<i class="ki-outline ki-copy fs-3 text-gray-900"></i>' +
        '</a>' +
        '</div>';

      if (event.extendedProps.attendees[i].type == 'required') {
        divParticipantes += divAttendees;
        tituloObrigatorio = '<span class="tituloObrigatorio"><i class="fas fa-angle-down"></i> Obrigatório</span>';
      } else if (event.extendedProps.attendees[i].type == 'optional') {
        divParticipantesOpcional += divAttendees;
        tituloOpcional = '<span class="tituloOpcional"><i class="fas fa-angle-down"></i> Opcional</span>';
      }
    }

    if (i > 0) {
      var bodyDivParticipantes = '<div class="card-body pt-8">' +
        '<h3 class="card-title align-items-start flex-column mb-6">' +
        '<span class="fw-bold titleAuthorView">Participantes</span>' +
        '</h3>' +
        '<div class="divScrollParticipantes">' +
        '<div>' +
        tituloObrigatorio +
        '<div class="divScrollParticipantesObrigatorios">' +
        divParticipantes +
        '</div>' +
        '</div>' +
        '<div>' +
        tituloOpcional +
        '<div class="divScrollParticipantesOpcional">' +
        divParticipantesOpcional +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

      $('.divParticipantes').html(bodyDivParticipantes);
      $('[data-bs-toggle="tooltip"]').tooltip();
    }
  }

  addRandomColor() {
    var colors = ['#FF5733', '#33FF57', '#5733FF', '#FF33E6', '#33FFE6', '#E633FF', '#FFF233', '#33FFA2', '#F233FF', '#33A2FF'];

    colors = colors.filter(function (color) {
      var r = parseInt(color.substring(1, 3), 16);
      var g = parseInt(color.substring(3, 5), 16);
      var b = parseInt(color.substring(5, 7), 16);

      var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      return luminance < 0.7;
    });

    var divs = document.querySelectorAll('.divIniciais');

    divs.forEach(function (div) {
      var randomColor = colors[Math.floor(Math.random() * colors.length)];

      div.style.backgroundColor = randomColor;
    });
  }

  addHtmlButtonTeams(event) {
    var buttonTeams = '';

    if (event.extendedProps.type == true) {
      buttonTeams =
        '<button onclick="window.open(\'' + event.extendedProps.url + '\', \'_blank\')" class="btn btn-flex eventButtonTeams">' +
        '<img src="./img/iconeTeamsBranco.png" class="iconTeamsBranco">Ingressar na reunião</button>';
    }

    $('.eventButtonLocation').html(buttonTeams);
  }

  addTitleAndButtonLocation(event) {
    for (var i = 0; i < event.extendedProps.location.length; i++) {
      // Limpar o título original
      $('.eventLocation').eq(i).attr('data-bs-original-title', '');

      var title = '';

      // Verificar se existe o atributo address
      if (event.extendedProps.location[i].address) {
        title = event.extendedProps.location[i].address.street + ", " + event.extendedProps.location[i].address.city + " - " + event.extendedProps.location[i].address.state + ", " + event.extendedProps.location[i].address.countryOrRegion;
      } else if (title.length > 30) {
        title = objUtilitariosCalendario.truncateText(title, 30);
      } else {
        title = event.extendedProps.location[i].displayName;
      }

      $('.eventLocation').eq(i).attr('data-bs-original-title', title);
    }

    // Inicializar tooltips do Bootstrap
    $('[data-bs-toggle="tooltip"]').tooltip();
  }


  addTitleButtonCopyAuthor(event) {
    $('.divEventOrganizador').attr('data-bs-original-title', event.extendedProps.eventAuthorAddress);
    $('.divEventOrganizador').tooltip('dispose'); // Remove o tooltip antigo
    $('.divEventOrganizador').tooltip(); // Inicializa o novo tooltip
  }


  formatDate(date) {
    const localDate = new Date(date);
    return localDate.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  }

  truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    } else {
      return text;
    }
  }

  showButtonResponse(event) {
    $('.buttonResponse').hide();
    if (event.extendedProps.type == true && event.extendedProps.isOrganizer == false) {
      $('.buttonResponse').show();

      $('.buttonResponse select').on('select2:select', function (e) {
        $(this).next().find('.select2-selection__rendered').removeClass('eventReuniaoAceita eventReuniaoRecusada eventReuniaoProvisoria');

        if (e.params.data.id === 'accepted') {
          $(this).next().find('.select2-selection__rendered').addClass('eventReuniaoAceita').html('<i class="fas fa-check iconeReuniaoAceita"></i>Reunião Aceita');
        } else if (e.params.data.id === 'declined') {
          $(this).next().find('.select2-selection__rendered').addClass('eventReuniaoRecusada').html('<i class="fas fa-times iconeReuniaoRecusada"></i>Reunião Recusada');
        } else if (e.params.data.id === 'notAnswered') {
          $(this).next().find('.select2-selection__rendered').addClass('eventReuniaoProvisoria').html('<i class="fas fa-question iconeReuniaoProvisoria"></i>Provisório');
        }
      });
    }
  }

  hideButtonEdit(event) {
    $('#kt_modal_view_event_edit').show();
    if (event.extendedProps.isOrganizer == false) {
      $('#kt_modal_view_event_edit').hide();
    }
  }

  hideLocation(event) {
    $('.divLocalizacao').removeClass('d-none');
    if (event.extendedProps.location.length === 0) {
      $('.divLocalizacao').addClass('d-none');
    }
  }

  hideDescricao(event) {
    $('.divDescricao').removeClass('d-none');
    if (event.extendedProps.body == "") {
      $('.divDescricao').addClass('d-none');
    }
  }

  hideParticipantes(selector) {
    $(selector).on('click', function () {
      if ($(this).hasClass('tituloObrigatorio')) {
        $('.divScrollParticipantesObrigatorios').toggle();
      } else if ($(this).hasClass('tituloOpcional')) {
        $('.divScrollParticipantesOpcional').toggle();
      }

      var icon = $(this).find('i');
      if (icon.hasClass('fa-angle-down')) {
        icon.removeClass('fa-angle-down').addClass('fa-angle-right');
      } else {
        icon.removeClass('fa-angle-right').addClass('fa-angle-down');
      }
    });
  }

  copiarEmail(selector) {
    $(selector).on('click', function () {
      const email = $(this).parent().attr('data-bs-original-title');

      navigator.clipboard.writeText(email)
        .then(() => {
          $(this).find('i').removeClass('ki-outline ki-copy').addClass('ki-outline ki-check iconeCopiar');
          setTimeout(() => {
            $(this).find('i').removeClass('ki-outline ki-check').addClass('ki-outline ki-copy');
          }, 1800)
        })
    });
  }
}

var objUtilitariosCalendario = new utilitariosCalendario();

// Class definition
var KTAppCalendar = function () {
  // Shared variables
  // Calendar variables
  var calendar;
  var data = {
    id: '',
    eventName: '',
    eventLocation: '',
    eventAuthor: '',
    eventAuthorAddress: '',
    eventUrl: '',
    eventBody: '',
    eventDescription: '',
    eventAttendeesName: '',
    eventAttendeesStatus: '',
    eventAttendeesType: '',
    startDate: '',
    endDate: '',
    isOrganizer: false,
    isOnlineMeeting: false,
    allDay: false
  };

  // Add event variables
  var eventName;
  var eventLocation;
  var startDatepicker;
  var startFlatpickr;
  var endDatepicker;
  var endFlatpickr;
  var startTimepicker;
  var startTimeFlatpickr;
  var endTimepicker
  var endTimeFlatpickr;
  var modal;
  var modalTitle;
  var form;
  var validator;
  var addButton;
  var submitButton;
  var cancelButton;
  var closeButton;

  var eventAuthor;
  var eventAuthorAddress;
  var eventUrl;
  var eventBody;
  var startDate;
  var isOrganizer;
  var isOnlineMeeting;

  // View event variables
  var viewEventName;
  var viewAllDay;
  var viewEventLocation;
  var viewStartDate;
  var viewEndDate;
  var viewModal;
  var viewEditButton;
  var viewDeleteButton;

  var viewEventAuthor;
  var viewEventAuthorAddress;
  var viewEventUrl;
  var viewEventBody;
  var viewIsOrganizer;
  var viewIsOnlineMeeting;
  var viewEventDescription;
  var viewEventAttendeesName;
  var viewEventAttendeesStatus;
  var viewEventAttendeesType;

  // Private functions
  var initCalendarApp = function () {
    // Define variables
    var calendarEl = document.getElementById('kt_calendar_app');
    var todayDate = moment().startOf('day');
    var YM = todayDate.format('YYYY-MM');
    var YESTERDAY = todayDate.clone().subtract(1, 'day').format('YYYY-MM-DD');
    var TODAY = todayDate.format('YYYY-MM-DD');
    var TOMORROW = todayDate.clone().add(1, 'day').format('YYYY-MM-DD');

    calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'pt-br',
      timeZone: 'UTC',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: 'narrow',
        hour12: false
      },
      initialDate: TODAY,
      navLinks: false,
      selectable: true,
      selectMirror: true,
      editable: false,
      allDaySlot: false,
      dayHeaderFormat: {
        weekday: 'long'
      },
      dayMaxEvents: true,
      events: {
        url: 'consultaEventos.php',
        method: 'GET',
        extraParams: {},
      },
      select: function (arg) {
        formatArgs(arg);
        handleNewEvent();
      },
      eventDidMount: function (arg) {
        let eventColor = '';
        let barra = document.createElement('div');
        let iconTeams = '<img src="./img/iconeTeams.png" class="iconTeams">';
        let iconNote = '<img src="./img/iconeNota.png" class="iconNote">';

        barra.className = 'barra-evento';

        //Verifica o tipo do evento e aplica uma Cor e um Ícone a ele
        if (arg.event.extendedProps.type === true) {
          eventColor = 'rgb(197, 203, 250)';
          barra.style.backgroundColor = 'rgb(103 120 255)';
          $(arg.el).find('.fc-daygrid-event-dot, .fc-list-event-dot').removeClass('fc-daygrid-event-dot fc-list-event-dot').append(iconTeams);
          $(arg.el).addClass('divTeams');
        } else {
          eventColor = 'rgb(144 209 255)';
          barra.style.backgroundColor = 'rgb(45 147 219)';
          $(arg.el).find('.fc-daygrid-event-dot, .fc-list-event-dot').removeClass('fc-daygrid-event-dot fc-list-event-dot').append(iconNote);
          $(arg.el).addClass('divNote');
        }

        arg.el.style.backgroundColor = eventColor;
        arg.el.insertBefore(barra, arg.el.firstChild);
      },
      eventClick: function (arg) {
        for (var i = 0; i < arg.event.extendedProps.attendees.length; i++) {
          var attendeeName = arg.event.extendedProps.attendees[i].emailAddress.name;
        }

        for (var i = 0; i < arg.event.extendedProps.location.length; i++) {
          var locationEvent = '';

          if (arg.event.extendedProps.location.length == 0) {
            locationEvent = arg.event.extendedProps.location[i].displayName;
          } else {
            locationEvent = objUtilitariosCalendario.truncateText(arg.event.extendedProps.location[i].displayName, 35);
          }
        }

        formatArgs({
          id: arg.event.extendedProps.id,
          title: arg.event.title,
          location: arg.event.extendedProps.location,
          description: arg.event.extendedProps.body,
          startStr: arg.event.start,
          endStr: arg.event.endStr,
          allDay: arg.event.extendedProps.allDay,
          type: arg.event.extendedProps.type,
          eventAttendeesName: attendeeName,
          eventAuthor: arg.event.extendedProps.eventAuthor,
          eventAuthorAddress: arg.event.extendedProps.eventAuthorAddress,
          eventLocation: locationEvent
        });

        console.log(arg);

        objUtilitariosCalendario.addTitleButtonCopyAuthor(arg.event);
        objUtilitariosCalendario.addTitleAndButtonLocation(arg.event);
        objUtilitariosCalendario.showButtonResponse(arg.event);
        objUtilitariosCalendario.hideButtonEdit(arg.event);
        objUtilitariosCalendario.hideLocation(arg.event);
        objUtilitariosCalendario.hideDescricao(arg.event);
        objUtilitariosCalendario.addHtmlParticipantes(arg.event);
        objUtilitariosCalendario.addHtmlButtonTeams(arg.event);
        objUtilitariosCalendario.addTitleAuthor(arg.event);
        objUtilitariosCalendario.addRandomColor();
        objUtilitariosCalendario.copiarEmail('.iconeCopiarOrganizador,.iconeCopiarParticipantes');
        objUtilitariosCalendario.hideParticipantes('.tituloObrigatorio,.tituloOpcional');
        handleViewEvent();
      }
    });

    calendar.render();
  }

  // Init validator
  const initValidator = () => {
    // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
    validator = FormValidation.formValidation(
      form,
      {
        fields: {
          'calendar_event_name': {
            validators: {
              notEmpty: {
                message: 'Event name is required'
              }
            }
          },
          'calendar_event_start_date': {
            validators: {
              notEmpty: {
                message: 'Start date is required'
              }
            }
          },
          'calendar_event_end_date': {
            validators: {
              notEmpty: {
                message: 'End date is required'
              }
            }
          }
        },

        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap: new FormValidation.plugins.Bootstrap5({
            rowSelector: '.fv-row',
            eleInvalidClass: '',
            eleValidClass: ''
          })
        }
      }
    );
  }

  // Initialize datepickers --- more info: https://flatpickr.js.org/
  const initDatepickers = () => {
    startFlatpickr = flatpickr(startDatepicker, {
      enableTime: false,
      dateFormat: "Y-m-d",
    });

    endFlatpickr = flatpickr(endDatepicker, {
      enableTime: false,
      dateFormat: "Y-m-d",
    });

    startTimeFlatpickr = flatpickr(startTimepicker, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
    });

    endTimeFlatpickr = flatpickr(endTimepicker, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
    });
  }

  // Handle add button
  const handleAddButton = () => {
    addButton.addEventListener('click', e => {
      // Reset form data
      data = {
        id: '',
        eventName: '',
        startDate: new Date(),
        endDate: new Date(),
        allDay: false
      };
      handleNewEvent();
    });
  }

  // Handle add new event
  const handleNewEvent = () => {
    // Update modal title
    modalTitle.innerText = "Adicionar um novo evento";

    modal.show();

    // Select datepicker wrapper elements
    const datepickerWrappers = form.querySelectorAll('[data-kt-calendar="datepicker"]');

    // Handle all day toggle
    const allDayToggle = form.querySelector('#kt_calendar_datepicker_allday');
    allDayToggle.addEventListener('click', e => {
      if (e.target.checked) {
        datepickerWrappers.forEach(dw => {
          dw.classList.add('d-none');
        });
      } else {
        endFlatpickr.setDate(data.startDate, true, 'Y-m-d');
        datepickerWrappers.forEach(dw => {
          dw.classList.remove('d-none');
        });
      }
    });

    populateForm(data);

    // Handle submit form
    submitButton.addEventListener('click', function (e) {
      // Prevent default button action
      e.preventDefault();

      // Validate form before submit
      if (validator) {
        validator.validate().then(function (status) {
          console.log('validated!');

          if (status == 'Valid') {
            // Show loading indication
            submitButton.setAttribute('data-kt-indicator', 'on');

            // Disable submit button whilst loading
            submitButton.disabled = true;

            // Simulate form submission
            setTimeout(function () {
              // Simulate form submission
              submitButton.removeAttribute('data-kt-indicator');

              // Show popup confirmation 
              Swal.fire({
                text: "Novo evento adicionado ao calendário!",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                  confirmButton: "btn btn-primary"
                }
              }).then(function (result) {
                if (result.isConfirmed) {
                  modal.hide();

                  // Enable submit button after loading
                  submitButton.disabled = false;

                  // Detect if is all day event
                  let allDayEvent = false;
                  if (allDayToggle.checked) { allDayEvent = true; }
                  if (startTimeFlatpickr.selectedDates.length === 0) { allDayEvent = true; }

                  // Merge date & time
                  var startDateTime = moment(startFlatpickr.selectedDates[0]).format();
                  var endDateTime = moment(endFlatpickr.selectedDates[endFlatpickr.selectedDates.length - 1]).format();
                  if (!allDayEvent) {
                    const startDate = moment(startFlatpickr.selectedDates[0]).format('YYYY-MM-DD');
                    const endDate = startDate;
                    const startTime = moment(startTimeFlatpickr.selectedDates[0]).format('HH:mm:ss');
                    const endTime = moment(endTimeFlatpickr.selectedDates[0]).format('HH:mm:ss');

                    startDateTime = startDate + 'T' + startTime;
                    endDateTime = endDate + 'T' + endTime;
                  }

                  // Add new event to calendar
                  calendar.addEvent({
                    id: uid(),
                    title: eventName.value,
                    location: eventLocation.value,
                    start: startDateTime,
                    end: endDateTime,
                    allDay: allDayEvent
                  });
                  calendar.render();

                  // Reset form for demo purposes only
                  form.reset();
                }
              });

              //form.submit(); // Submit form
            }, 2000);
          } else {
            // Show popup warning 
            Swal.fire({
              text: "Desculpe, parece que foram detectados alguns erros. Tente novamente.",
              icon: "error",
              buttonsStyling: false,
              confirmButtonText: "Ok",
              customClass: {
                confirmButton: "btn btn-primary"
              }
            });
          }
        });
      }
    });
  }

  // Handle edit event
  const handleEditEvent = () => {
    // Update modal title
    modalTitle.innerText = "Editar evento";

    modal.show();

    // Select datepicker wrapper elements
    const datepickerWrappers = form.querySelectorAll('[data-kt-calendar="datepicker"]');

    // Handle all day toggle
    const allDayToggle = form.querySelector('#kt_calendar_datepicker_allday');
    allDayToggle.addEventListener('click', e => {
      if (e.target.checked) {
        datepickerWrappers.forEach(dw => {
          dw.classList.add('d-none');
        });
      } else {
        endFlatpickr.setDate(data.startDate, true, 'Y-m-d');
        datepickerWrappers.forEach(dw => {
          dw.classList.remove('d-none');
        });
      }
    });

    populateForm(data);

    // Handle submit form
    submitButton.addEventListener('click', function (e) {
      // Prevent default button action
      e.preventDefault();

      // Validate form before submit
      if (validator) {
        validator.validate().then(function (status) {
          console.log('validated!');

          if (status == 'Valid') {
            // Show loading indication
            submitButton.setAttribute('data-kt-indicator', 'on');

            // Disable submit button whilst loading
            submitButton.disabled = true;

            // Simulate form submission
            setTimeout(function () {
              // Simulate form submission
              submitButton.removeAttribute('data-kt-indicator');

              // Show popup confirmation 
              Swal.fire({
                text: "Novo evento adicionado ao calendário!",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                  confirmButton: "btn btn-primary"
                }
              }).then(function (result) {
                if (result.isConfirmed) {
                  modal.hide();

                  // Enable submit button after loading
                  submitButton.disabled = false;

                  // Remove old event
                  calendar.getEventById(data.id).remove();

                  // Detect if is all day event
                  let allDayEvent = false;
                  if (allDayToggle.checked) { allDayEvent = true; }
                  if (startTimeFlatpickr.selectedDates.length === 0) { allDayEvent = true; }

                  // Merge date & time
                  var startDateTime = moment(startFlatpickr.selectedDates[0]).format();
                  var endDateTime = moment(endFlatpickr.selectedDates[endFlatpickr.selectedDates.length - 1]).format();
                  if (!allDayEvent) {
                    const startDate = moment(startFlatpickr.selectedDates[0]).format('YYYY-MM-DD');
                    const endDate = startDate;
                    const startTime = moment(startTimeFlatpickr.selectedDates[0]).format('HH:mm:ss');
                    const endTime = moment(endTimeFlatpickr.selectedDates[0]).format('HH:mm:ss');

                    startDateTime = startDate + 'T' + startTime;
                    endDateTime = endDate + 'T' + endTime;
                  }

                  // Add new event to calendar
                  calendar.addEvent({
                    id: uid(),
                    title: eventName.value,
                    location: eventLocation.value,
                    start: startDateTime,
                    end: endDateTime,
                    allDay: allDayEvent
                  });
                  calendar.render();

                  // Reset form for demo purposes only
                  form.reset();
                }
              });

              //form.submit(); // Submit form
            }, 2000);
          } else {
            // Show popup warning 
            Swal.fire({
              text: "Desculpe, parece que foram detectados alguns erros. Tente novamente.",
              icon: "error",
              buttonsStyling: false,
              confirmButtonText: "Ok",
              customClass: {
                confirmButton: "btn btn-primary"
              }
            });
          }
        });
      }
    });
  }

  // Handle view event
  const handleViewEvent = () => {
    viewModal.show();

    // Detect all day event
    var eventNameMod;
    var startDateMod;
    var endDateMod;

    // Generate labels
    if (data.allDay) {
      eventNameMod = 'Dia Inteiro';
      startDateMod = moment(data.startDate).format('DD/MM/YYYY');
      endDateMod = moment(data.endDate).format('DD/MM/YYYY');
    } else {
      eventNameMod = '';
      startDateMod = moment(data.startDate).format('DD/MM/YYYY - HH:mm');
      endDateMod = moment(data.endDate).format('DD/MM/YYYY - HH:mm');
    }

    // Populate view data
    viewEventName.innerText = data.eventName;
    viewAllDay.innerText = eventNameMod;
    viewStartDate.innerText = startDateMod;
    viewEndDate.innerText = endDateMod;
    viewEventDescription.innerHTML = data.eventDescription;
    viewEventLocation.innerText = data.eventLocation;
    viewEventAuthor.innerText = data.eventAuthor;
  }

  // Handle delete event
  const handleDeleteEvent = () => {
    viewDeleteButton.addEventListener('click', e => {
      e.preventDefault();

      Swal.fire({
        text: "Tem certeza de que deseja excluir este evento?",
        icon: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-active-light"
        }
      }).then(function (result) {
        if (result.value) {
          calendar.getEventById(data.id).remove();

          viewModal.hide(); // Hide modal				
        }
      });
    });
  }

  // Handle edit button
  const handleEditButton = () => {
    viewEditButton.addEventListener('click', e => {
      e.preventDefault();

      viewModal.hide();
      handleEditEvent();
    });
  }

  // Handle cancel button
  const handleCancelButton = () => {
    // Edit event modal cancel button
    cancelButton.addEventListener('click', function (e) {
      e.preventDefault();

      Swal.fire({
        text: "Tem certeza de que deseja cancelar?",
        icon: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-active-light"
        }
      }).then(function (result) {
        if (result.value) {
          form.reset(); // Reset form	
          modal.hide(); // Hide modal				
        }
      });
    });
  }

  // Handle close button
  const handleCloseButton = () => {
    // Edit event modal close button
    closeButton.addEventListener('click', function (e) {
      e.preventDefault();

      Swal.fire({
        text: "Tem certeza de que deseja cancelar?",
        icon: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-active-light"
        }
      }).then(function (result) {
        if (result.value) {
          form.reset(); // Reset form	
          modal.hide(); // Hide modal				
        }
      });
    });
  }

  // Handle view button
  const handleViewButton = () => {
    const viewButton = document.querySelector('#kt_calendar_event_view_button');
    viewButton.addEventListener('click', e => {
      e.preventDefault();

      hidePopovers();
      handleViewEvent();
    });
  }

  // Helper functions

  // Reset form validator on modal close
  const resetFormValidator = (element) => {
    // Target modal hidden event --- For more info: https://getbootstrap.com/docs/5.0/components/modal/#events
    element.addEventListener('hidden.bs.modal', e => {
      if (validator) {
        // Reset form validator. For more info: https://formvalidation.io/guide/api/reset-form
        validator.resetForm(true);
      }
    });
  }

  // Populate form 
  const populateForm = () => {
    eventName.value = data.eventName ? data.eventName : '';
    eventDescription.value = data.eventDescription ? data.eventDescription : '';
    eventLocation.value = data.eventLocation ? data.eventLocation : '';
    startFlatpickr.setDate(data.startDate, true, 'Y-m-d');
    // Handle null end dates
    const endDate = data.endDate ? data.endDate : moment(data.startDate).format();
    endFlatpickr.setDate(endDate, true, 'Y-m-d');

    const allDayToggle = form.querySelector('#kt_calendar_datepicker_allday');
    const datepickerWrappers = form.querySelectorAll('[data-kt-calendar="datepicker"]');
    if (data.allDay) {
      allDayToggle.checked = true;
      datepickerWrappers.forEach(dw => {
        dw.classList.add('d-none');
      });
    } else {
      startTimeFlatpickr.setDate(data.startDate, true, 'Y-m-d H:i');
      endTimeFlatpickr.setDate(data.endDate, true, 'Y-m-d H:i');
      endFlatpickr.setDate(data.startDate, true, 'Y-m-d');
      allDayToggle.checked = false;
      datepickerWrappers.forEach(dw => {
        dw.classList.remove('d-none');
      });
    }
  }

  // Format FullCalendar reponses
  const formatArgs = (res) => {
    data.id = res.id;
    data.eventName = res.title;
    data.eventLocation = res.eventLocation;
    data.eventDescription = res.description;
    data.startDate = res.startStr;
    data.endDate = res.endStr;
    data.allDay = res.allDay;
    data.eventAuthor = res.eventAuthor;
    data.eventAuthorAddress = res.eventAuthorAddress;
  }

  // Generate unique IDs for events
  const uid = () => {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }

  return {
    // Public Functions
    init: function () {
      // Define variables

      // Modal de Inserção de evento
      const element = document.getElementById('kt_modal_add_event');
      form = element.querySelector('#kt_modal_add_event_form');
      eventName = form.querySelector('[name="calendar_event_name"]');
      eventLocation = form.querySelector('[name="calendar_event_location"]');
      startDatepicker = form.querySelector('#kt_calendar_datepicker_start_date');
      endDatepicker = form.querySelector('#kt_calendar_datepicker_end_date');
      startTimepicker = form.querySelector('#kt_calendar_datepicker_start_time');
      endTimepicker = form.querySelector('#kt_calendar_datepicker_end_time');
      addButton = document.querySelector('[data-kt-calendar="add"]');
      submitButton = form.querySelector('#kt_modal_add_event_submit');
      cancelButton = form.querySelector('#kt_modal_add_event_cancel');
      closeButton = element.querySelector('#kt_modal_add_event_close');
      modalTitle = form.querySelector('[data-kt-calendar="title"]');
      modal = new bootstrap.Modal(element);

      // Modal de Visualização do evento
      const viewElement = document.getElementById('kt_modal_view_event');
      viewModal = new bootstrap.Modal(viewElement);
      viewEventName = viewElement.querySelector('[data-kt-calendar="event_name"]');
      viewAllDay = viewElement.querySelector('[data-kt-calendar="all_day"]');
      viewEventLocation = viewElement.querySelector('[data-kt-calendar="event_location"]');
      viewStartDate = viewElement.querySelector('[data-kt-calendar="event_start_date"]');
      viewEventDescription = viewElement.querySelector('[data-kt-calendar="event_description"]');
      viewEndDate = viewElement.querySelector('[data-kt-calendar="event_end_date"]');
      viewEventAuthor = viewElement.querySelector('[data-kt-calendar="event_author"]');
      viewEditButton = viewElement.querySelector('#kt_modal_view_event_edit');
      viewDeleteButton = viewElement.querySelector('#kt_modal_view_event_delete');

      initCalendarApp();
      initValidator();
      initDatepickers();
      handleEditButton();
      handleAddButton();
      handleDeleteEvent();
      handleCancelButton();
      handleCloseButton();
      resetFormValidator(element);
    }
  };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
  KTAppCalendar.init();
});