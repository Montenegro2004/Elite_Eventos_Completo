document.addEventListener('DOMContentLoaded', function() {
  const busquedaForm = document.getElementById('busquedaReservaForm');
  const formPago = document.getElementById('formPago');
  // Resumen campos
  const resumenNombre = document.getElementById('resumenNombre');
  const resumenCorreo = document.getElementById('resumenCorreo');
  const resumenTelefono = document.getElementById('resumenTelefono');
  const valorHacienda = document.getElementById('valorHacienda');
  const valorDecoracion = document.getElementById('valorDecoracion');
  const valorServicios = document.getElementById('valorServicios');
  const valorImpuestos = document.getElementById('valorImpuestos');
  const valorTotal = document.getElementById('valorTotal');
  const totalPagar = document.getElementById('totalPagar');
  const planPago = document.getElementById('planPago');
  const idReserva = document.getElementById('idReserva');
  // Hidden fields para enviar a PHP
  const valorHaciendaHidden = document.getElementById('valorHaciendaHidden');
  const valorDecoracionHidden = document.getElementById('valorDecoracionHidden');
  const valorServiciosHidden = document.getElementById('valorServiciosHidden');
  const valorImpuestosHidden = document.getElementById('valorImpuestosHidden');
  const valorTotalHidden = document.getElementById('valorTotalHidden');
  // Método de pago
  const metodoPagoInput = document.getElementById('metodoPago');

  // Utilidad para formatear moneda
  function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  // Buscar reserva por nombre y rellenar datos
  if (busquedaForm) {
    busquedaForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const nombreCompleto = document.getElementById('nombreBusqueda').value.trim();
      if (!nombreCompleto) return;
      // Separar nombre y apellido por el primer espacio
      const partes = nombreCompleto.split(' ');
      const nombre = partes[0] || '';
      const apellido = partes.slice(1).join(' ') || '';
      if (!nombre || !apellido) {
        alert('Por favor ingrese nombre y apellido.');
        return;
      }

      try {
        // Cambia a buscar_reserva_pago.php para evitar conflictos
        const resp = await fetch('../Opciones/buscar_reserva_pago.php?nombre=' + encodeURIComponent(nombre) + '&apellido=' + encodeURIComponent(apellido));
        const data = await resp.json();
        if (!data.success) {
          alert(data.error || 'No se encontró la reserva.');
          formPago.style.display = 'none';
          return;
        }
        const r = data.reserva;
        // Mostrar el formulario de pago
        formPago.style.display = 'block';

        // Rellenar resumen de pedido y campos ocultos
        resumenNombre.textContent = r.nombre + ' ' + r.apellido;
        resumenCorreo.textContent = r.correo;
        resumenTelefono.textContent = r.telefono;
        valorHacienda.textContent = formatCurrency(r.hacienda_precio);
        valorDecoracion.textContent = formatCurrency(r.decoracion_precio);
        valorServicios.textContent = formatCurrency(r.servicios_precio);
        valorImpuestos.textContent = formatCurrency(r.impuestos);
        valorTotal.textContent = formatCurrency(r.total);

        // Hidden para enviar a PHP
        idReserva.value = r.id_Reserva;
        valorHaciendaHidden.value = r.hacienda_precio;
        valorDecoracionHidden.value = r.decoracion_precio;
        valorServiciosHidden.value = r.servicios_precio;
        valorImpuestosHidden.value = r.impuestos;
        valorTotalHidden.value = r.total;

        // Inicializar total a pagar
        totalPagar.value = formatCurrency(r.total);

        // Plan de pago
        planPago.onchange = function() {
          let total = r.total;
          if (planPago.value === 'completo') {
            // 25% descuento
            const descuento = total * 0.25;
            totalPagar.value = formatCurrency(total - descuento);
          } else if (planPago.value === 'inicial') {
            // 15% descuento
            const descuento = total * 0.15;
            totalPagar.value = formatCurrency(total - descuento);
          } else {
            totalPagar.value = formatCurrency(total);
          }
        };
      } catch (err) {
        alert('Error al buscar la reserva.');
        formPago.style.display = 'none';
      }
    });
  }

  // Interacción de los botones de pago
  const paymentButtons = document.querySelectorAll('.payment-options button');
  paymentButtons.forEach(button => {
    button.addEventListener('click', function() {
      paymentButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      metodoPagoInput.value = this.getAttribute('data-metodo');
    });
  });

  // Actualizar vista previa de tarjeta
  const cardNumber = document.getElementById('numeroTarjeta');
  const cardName = document.getElementById('nombreTitular');
  const cardExpiry = document.getElementById('fechaExpiracion');
  const cardPreviewNumber = document.querySelector('.card-number');
  const cardPreviewName = document.querySelector('.card-name');
  const cardPreviewExpiry = document.querySelector('.card-expiry');

  cardNumber.addEventListener('input', function() {
    cardPreviewNumber.textContent = this.value || '•••• •••• •••• 4242';
  });

  cardName.addEventListener('input', function() {
    cardPreviewName.textContent = this.value.toUpperCase() || 'NOMBRE TITULAR';
  });

  cardExpiry.addEventListener('input', function() {
    cardPreviewExpiry.textContent = this.value || 'MM/AA';
  });

  // Enviar formulario de pago por AJAX
  if (formPago) {
    formPago.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!document.getElementById('terminos').checked) {
        alert('Debe aceptar los términos y condiciones.');
        return;
      }
      const formData = new FormData(formPago);
      try {
        const resp = await fetch('../Opciones/guardar_pago.php', {
          method: 'POST',
          body: formData
        });
        const data = await resp.json();
        if (data.success) {
          alert('Pago registrado correctamente.');
          window.location.reload();
        } else {
          alert('Error al guardar el pago: ' + (data.error || ''));
        }
      } catch (err) {
        alert('Error al guardar el pago.');
      }
    });
  }
});
