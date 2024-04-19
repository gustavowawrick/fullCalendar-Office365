"use strict";

// Class definition
var KTAppCalendar = function () {
  // Shared variables
  // Calendar variables
  var calendar;
  var data = {
    id: '',
    eventName: '',
    eventLocation: '',
    startDate: '',
    endDate: '',
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

  // View event variables
  var viewEventName;
  var viewAllDay;
  var viewEventLocation;
  var viewStartDate;
  var viewEndDate;
  var viewModal;
  var viewEditButton;
  var viewDeleteButton;

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
        formatArgs({
          id: arg.event.id,
          title: arg.event.title,
          location: arg.event.extendedProps.location,
          startStr: arg.event.startStr,
          endStr: arg.event.endStr,
          allDay: arg.event.allDay,
          type: arg.event.extendedProps.type
        });

        handleViewEvent();
      },
      dayMaxEvents: true,
      events: {
        url: 'consultaEventos.php',
        method: 'GET',
        extraParams: {},
      },
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
      startDateMod = moment(data.startDate).format('Do MMM, YYYY');
      endDateMod = moment(data.endDate).format('Do MMM, YYYY');
    } else {
      eventNameMod = '';
      startDateMod = moment(data.startDate).format('Do MMM, YYYY - h:mm a');
      endDateMod = moment(data.endDate).format('Do MMM, YYYY - h:mm a');
    }

    // Populate view data
    viewEventName.innerText = data.eventName;
    viewAllDay.innerText = eventNameMod;
    viewStartDate.innerText = startDateMod;
    viewEndDate.innerText = endDateMod;
    viewEventLocation.innerText = 'Reunião Microsoft Teams';

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
    data.eventLocation = res.location;
    data.startDate = res.startStr;
    data.endDate = res.endStr;
    data.allDay = res.allDay;
  }

  // Generate unique IDs for events
  const uid = () => {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }

  return {
    // Public Functions
    init: function () {
      // Define variables
      // Add event modal
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

      // View event modal
      const viewElement = document.getElementById('kt_modal_view_event');
      viewModal = new bootstrap.Modal(viewElement);
      viewEventName = viewElement.querySelector('[data-kt-calendar="event_name"]');
      viewAllDay = viewElement.querySelector('[data-kt-calendar="all_day"]');
      viewEventLocation = viewElement.querySelector('[data-kt-calendar="event_location"]');
      viewStartDate = viewElement.querySelector('[data-kt-calendar="event_start_date"]');
      viewEndDate = viewElement.querySelector('[data-kt-calendar="event_end_date"]');
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
