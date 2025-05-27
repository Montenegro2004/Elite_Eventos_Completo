document.addEventListener('DOMContentLoaded', function() {
  // =============================================
  // Variables globales y configuración inicial
  // =============================================
  let currentDate = new Date();
  let selectedDate = null;
  let selectedDecoration = null;
  let selectedServices = [];
  let selectedHacienda = null;

  // Elementos del DOM para el calendario
  const calendarDays = document.getElementById('calendar-days');
  const currentMonthYear = document.getElementById('current-month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');

  // Elementos del DOM para decoración y servicios
  const decorationCards = document.querySelectorAll('.decoration-card');
  const serviceCards = document.querySelectorAll('.service-card');
  const summaryItems = document.querySelector('.summary-items');
  const summaryTotal = document.querySelector('.summary-total span:last-child');
  const btnContinue = document.querySelector('.btn-continue');

  // Mapeos para IDs de base de datos
  const decorationIds = {
    "Temático y Personalizado": 1,
    "Glamuroso y Extravagante": 2,
    "Clásico y Elegante": 3,
    "Rústico y Natural": 4
  };

  const decorationPrices = {
    1: 2500000,
    2: 1800000,
    3: 1700000,
    4: 1700000
  };

  const serviceIds = {
    "Fotografía y Video Profesional": 1,
    "DJ y Música en Vivo": 2,
    "Catering y Banquete": 3,
    "Transporte para Invitados": 4,
    "Kit de Recuerdos": 5
  };

  // Valores según la base de datos (500000 para todos)
  const servicePrices = {
    1: 500000,
    2: 500000,
    3: 500000,
    4: 500000,
    5: 500000
  };

  // =============================================
  // 1. Calendario
  // =============================================
  function renderCalendar() {
    calendarDays.innerHTML = '';
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    currentMonthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const today = new Date();

    // Días del mes anterior (grisados)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = document.createElement('div');
      day.className = 'day disabled';
      day.textContent = prevMonthLastDay - i;
      calendarDays.appendChild(day);
    }

    // Días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = document.createElement('div');
      day.className = 'day';
      day.textContent = i;

      // Verificar si es el día actual
      if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        day.classList.add('today');
      }

      // Verificar si la fecha es anterior al día actual
      const dayDate = new Date(year, month, i);
      if (dayDate < today) {
        day.classList.add('disabled');
      } else {
        // Solo agregar eventos de click a días futuros
        day.addEventListener('click', () => selectDate(day, year, month, i));
      }

      calendarDays.appendChild(day);
    }

    // Días del siguiente mes para completar la cuadrícula
    const totalCells = calendarDays.children.length;
    const remaining = 42 - totalCells;
    for (let i = 1; i <= remaining; i++) {
      const day = document.createElement('div');
      day.className = 'day disabled';
      day.textContent = i;
      calendarDays.appendChild(day);
    }
  }

  function selectDate(dayElement, year, month, day) {
    document.querySelectorAll('.day').forEach(d => {
      d.classList.remove('selected');
      d.classList.remove('selected-date');
    });
    
    dayElement.classList.add('selected');
    dayElement.classList.add('selected-date');
    selectedDate = new Date(year, month, day);
  }

  function formatDateForMySQL(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // =============================================
  // 2. Navegación entre pasos del formulario
  // =============================================
  function setupFormNavigation() {
    function updateProgress() {
      const steps = document.querySelectorAll('.step');
      const activeStep = document.querySelector('.step.active');
      const activeIndex = Array.from(steps).indexOf(activeStep);
      const progress = ((activeIndex + 1) / steps.length) * 100;
      document.querySelector('.progress-fill').style.width = `${progress}%`;
    }

    // Botones Siguiente
    document.querySelectorAll('.btn-next').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const currentSection = this.closest('.planning-section');
        const currentStepId = currentSection.id;
        
        // Validaciones antes de avanzar
        if (currentStepId === 'step1' && !selectedDate) {
          alert('Por favor selecciona una fecha para tu evento');
          return;
        }
        
        if (currentStepId === 'step2') {
          const requiredFields = ['nombre', 'apellido', 'telefono', 'correo'];
          for (const field of requiredFields) {
            const input = document.getElementById(field);
            if (!input || !input.value.trim()) {
              alert(`Por favor completa el campo: ${input.placeholder || field}`);
              input.focus();
              return;
            }
          }
          
          // Validar email
          const email = document.getElementById('correo').value;
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Por favor ingresa un correo electrónico válido (ejemplo: usuario@dominio.com)');
            return;
          }
        }

        // Ocultar sección actual y mostrar siguiente
        currentSection.style.display = 'none';
        const nextSection = currentSection.nextElementSibling;
        if (nextSection) {
          nextSection.style.display = 'block';
          
          // Actualizar indicador de progreso
          const activeStep = document.querySelector('.step.active');
          if (activeStep.nextElementSibling) {
            activeStep.classList.remove('active');
            activeStep.nextElementSibling.classList.add('active');
            updateProgress();
          }
        }
      });
    });

    // Botones Anterior
    document.querySelectorAll('.btn-prev').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const currentSection = this.closest('.planning-section');
        currentSection.style.display = 'none';
        const prevSection = currentSection.previousElementSibling;
        if (prevSection) {
          prevSection.style.display = 'block';
          
          // Actualizar indicador de progreso
          const activeStep = document.querySelector('.step.active');
          if (activeStep.previousElementSibling) {
            activeStep.classList.remove('active');
            activeStep.previousElementSibling.classList.add('active');
            updateProgress();
          }
        }
      });
    });
  }

  // =============================================
  // 3. Selección de hacienda
  // =============================================
  function setupHaciendaSelection() {
    document.querySelectorAll('.hacienda-card').forEach(card => {
      card.addEventListener('click', function() {
        document.querySelectorAll('.hacienda-card').forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
          c.querySelector('.select-overlay').style.opacity = '0';
        });

        this.classList.add('selected');
        this.setAttribute('aria-checked', 'true');
        this.querySelector('.select-overlay').style.opacity = '1';
        selectedHacienda = this.getAttribute('data-value');
        // Solo asignar si el input existe
        const haciendaInput = document.getElementById('FK_id_hacienda');
        if (haciendaInput) {
          haciendaInput.value = selectedHacienda;
        }
      });

      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  // =============================================
  // 4. Selección de decoración y servicios
  // =============================================
  function setupDecorationAndServices() {
    // Decoración (solo una puede estar seleccionada)
    decorationCards.forEach(card => {
      card.addEventListener('click', function(e) {
        decorationCards.forEach(c => {
          c.classList.remove('selected');
          c.querySelector('.btn-select').textContent = 'Seleccionar';
        });
        this.classList.add('selected');
        const btn = this.querySelector('.btn-select');
        btn.textContent = 'Seleccionado';
        // Obtener el id de la decoración desde el atributo data-value (no por nombre)
        const id = parseInt(this.getAttribute('data-value'), 10);
        const name = this.querySelector('h3').textContent.trim();
        const priceText = this.querySelector('.price-tag').textContent.replace(/[$,.]/g, '');
        // Si quieres usar el precio de la base de datos, usa decorationPrices[id], pero aquí se toma del HTML
        const price = decorationPrices[id] || parseInt(priceText, 10);
        selectedDecoration = { id, name, price };
        updateSummary();
      });
    });

    // Servicios (pueden ser varios)
    serviceCards.forEach(card => {
      const btn = card.querySelector('.btn-add');
      const name = card.querySelector('h3').textContent.trim();
      const id = serviceIds[name];
      const price = servicePrices[id];
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const idx = selectedServices.findIndex(s => s.id === id);
        if (idx === -1) {
          selectedServices.push({ id, name, price });
          btn.classList.add('added');
          btn.innerHTML = 'Añadido <i class="fas fa-check"></i>';
        } else {
          selectedServices.splice(idx, 1);
          btn.classList.remove('added');
          btn.innerHTML = 'Añadir <i class="fas fa-plus"></i>';
        }
        updateSummary();
      });
    });
  }

  // =============================================
  // 5. Actualización del resumen
  // =============================================
  function updateSummary() {
    let html = '';
    let total = 0;

    // Decoración
    if (selectedDecoration) {
      html += `
        <div class="summary-item">
          <span><b>Decoración:</b> ${selectedDecoration.name}</span>
          <span>$${selectedDecoration.price.toLocaleString()}</span>
        </div>
      `;
      total += selectedDecoration.price;
    }

    // Servicios
    if (selectedServices.length > 0) {
      selectedServices.forEach(service => {
        html += `
          <div class="summary-item">
            <span>${service.name}</span>
            <span>$${service.price.toLocaleString()}</span>
          </div>
        `;
        total += service.price;
      });
    }

    if (!selectedDecoration && selectedServices.length === 0) {
      html = `<p>No has seleccionado servicios ni decoración aún</p>`;
    }

    summaryItems.innerHTML = html;
    summaryTotal.textContent = `$${total.toLocaleString()}`;
  }

  // =============================================
  // 6. Botón continuar a factura
  // =============================================
  if (btnContinue) {
    btnContinue.addEventListener('click', async function(e) {
      e.preventDefault();

      // Validaciones básicas
      if (!selectedDate) {
        alert('Por favor selecciona una fecha para tu evento');
        return;
      }
      const requiredFields = ['nombre', 'apellido', 'telefono', 'correo'];
      for (const field of requiredFields) {
        const input = document.getElementById(field);
        if (!input || !input.value.trim()) {
          alert(`Por favor completa el campo: ${input.placeholder || field}`);
          input && input.focus();
          return;
        }
      }
      const email = document.getElementById('correo').value;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Por favor ingresa un correo electrónico válido (ejemplo: usuario@dominio.com)');
        return;
      }
      const haciendaInput = document.getElementById('FK_id_hacienda');
      if (!haciendaInput || !haciendaInput.value) {
        alert('Por favor selecciona una hacienda');
        return;
      }
      if (!selectedDecoration) {
        alert('Por favor selecciona una decoración antes de continuar.');
        return;
      }

      // Deshabilitar botón y mostrar spinner
      btnContinue.disabled = true;
      const originalText = btnContinue.innerHTML;
      btnContinue.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

      try {
        // 1. Buscar usuario por correo
        let id_usuario = null;
        const correo = document.getElementById('correo').value.trim();
        // ...existing code for getting user...

        let userResp = await fetch('buscar_cliente.php?correo=' + encodeURIComponent(correo));
        let userData = await userResp.json();
        if (userData && userData.id_usuario) {
          id_usuario = userData.id_usuario;
        } else {
          throw new Error('Usuario no encontrado. Debe estar registrado.');
        }

        // 2. Enviar reserva
        const formData = new FormData();
        formData.append('fecha', formatDateForMySQL(selectedDate));
        formData.append('usuario', id_usuario);
        formData.append('instituto', document.getElementById('instituto')?.value || '');

        // Formatear hora con AM/PM
        let horaRaw = document.getElementById('Hora_inicio')?.value || '';
        let horaFormateada = '';
        if (horaRaw) {
          const [h, m] = horaRaw.split(':');
          let hour = parseInt(h, 10);
          let ampm = 'AM';
          if (hour >= 12) {
            ampm = 'PM';
            if (hour > 12) hour -= 12;
          }
          if (hour === 0) hour = 12;
          horaFormateada = `${hour}:${m} ${ampm}`;
        }
        formData.append('hora', horaFormateada);

        formData.append('evento', document.getElementById('tipo_evento')?.value || '');
        formData.append('tematica', document.getElementById('tematica')?.value || '');
        formData.append('hacienda', document.getElementById('FK_id_hacienda')?.value || '');
        formData.append('contacto', document.getElementById('pref_contacto')?.value || '');

        // Duración con la palabra "hora(s)"
        let duracionRaw = document.getElementById('duracion')?.value || '';
        let duracionFormateada = '';
        if (duracionRaw === 'full-day') {
          duracionFormateada = '2 días completos';
        } else if (duracionRaw) {
          duracionFormateada = `${duracionRaw} horas`;
        }
        formData.append('duracion', duracionFormateada);

        // Decoración: enviar el id (1-4) como 'decoracion'
        formData.append('decoracion', selectedDecoration.id);

        // Servicios adicionales (como arrays)
        selectedServices.forEach(service => {
          formData.append('servicios[]', service.id);
        });

        let reservaResp = await fetch('procesar_reserva.php', {
          method: 'POST',
          body: formData
        });
        let reservaData = await reservaResp.text();

        // Guardar total en localStorage para la factura
        const total = (selectedDecoration?.price || 0) + selectedServices.reduce((sum, s) => sum + s.price, 0);
        localStorage.setItem('eventTotal', total);
        localStorage.setItem('eventDecoration', selectedDecoration ? JSON.stringify(selectedDecoration) : '');
        localStorage.setItem('eventServices', JSON.stringify(selectedServices));

        window.location.href = '../Factura_pago/Factura.html';
      } catch (error) {
        alert(error.message || 'Hubo un error al guardar la reserva');
      } finally {
        btnContinue.disabled = false;
        btnContinue.innerHTML = originalText;
      }
    });
  }

  // =============================================
  // 7. Inicialización
  // =============================================
  function init() {
    renderCalendar();
    setupFormNavigation();
    setupHaciendaSelection();
    setupDecorationAndServices();
    updateSummary();

    prevMonthBtn?.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
    nextMonthBtn?.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  init();
});