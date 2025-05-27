document.addEventListener('DOMContentLoaded', function() {
  const busquedaForm = document.getElementById('busquedaUsuarioForm');
  const facturaDetalle = document.getElementById('facturaDetalle');
  const btnPagar = document.getElementById('btnPagar');
  const btnActualizar = document.getElementById('btnActualizar');
  const btnEliminar = document.getElementById('btnEliminar');
  let reservaIdActual = null;

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
        facturaDetalle.innerHTML = `<div class="mensaje"><i class="fas fa-exclamation-triangle"></i> Por favor ingrese nombre y apellido.</div>`;
        return;
      }

      facturaDetalle.innerHTML = '<p>Buscando información...</p>';
      btnPagar.style.display = 'none';
      btnActualizar.style.display = 'none';
      btnEliminar.style.display = 'none';
      reservaIdActual = null;

      try {
        // Cambia el endpoint para buscar por nombre y apellido
        const resp = await fetch('../Opciones/resumen_factura.php?nombre=' + encodeURIComponent(nombre) + '&apellido=' + encodeURIComponent(apellido));
        const data = await resp.json();
        if (!data.success) {
          facturaDetalle.innerHTML = `<div class="mensaje"><i class="fas fa-exclamation-triangle"></i> ${data.error || 'No se encontró la reserva.'}</div>`;
          return;
        }
        // Mostrar resumen
        const r = data.reserva;
        reservaIdActual = r.id_Reserva;

        // Servicios adicionales contratados
        let serviciosHtml = '';
        if (r.servicios && r.servicios.length > 0) {
          serviciosHtml = r.servicios.map(s =>
            `<tr>
              <td>${s.nombre}</td>
              <td>$${parseInt(s.precio).toLocaleString()}</td>
            </tr>`
          ).join('');
        } else {
          serviciosHtml = `<tr><td colspan="2">Sin servicios adicionales</td></tr>`;
        }

        // Servicios incluidos en la hacienda
        let serviciosIncluidosHtml = '';
        if (r.servicios_incluidos && r.servicios_incluidos.length > 0) {
          serviciosIncluidosHtml = r.servicios_incluidos.map(s =>
            `<li>${s.nombre} <small style="color:#888;">${s.descripcion}</small></li>`
          ).join('');
        } else {
          serviciosIncluidosHtml = `<li>Sin servicios incluidos</li>`;
        }

        facturaDetalle.innerHTML = `
          <table style="width:100%;margin-bottom:1.5rem;">
            <tr><th>Cliente</th><td>${r.cliente}</td></tr>
            <tr><th>Correo</th><td>${r.correo}</td></tr>
            <tr><th>Teléfono</th><td>${r.telefono}</td></tr>
            <tr><th>Fecha del Evento</th><td>${r.fecha_res}</td></tr>
            <tr><th>Tipo de Evento</th><td>${r.tipo_evento}</td></tr>
            <tr><th>Temática</th><td>${r.tematica || '-'}</td></tr>
            <tr><th>Hora de Inicio</th><td>${r.Hora_inicio}</td></tr>
            <tr><th>Duración</th><td>${r.Duración}</td></tr>
            <tr><th>Hacienda</th><td>${r.hacienda_nombre}</td></tr>
            <tr><th>Capacidad Hacienda</th><td>${r.hacienda_capacidad}</td></tr>
            <tr><th>Ubicación Hacienda</th><td>${r.hacienda_direccion}</td></tr>
            <tr><th>Valor Hacienda</th><td>$${parseInt(r.hacienda_precio.replace(/,/g, '')).toLocaleString()}</td></tr>
            <tr><th>Decoración</th><td>${r.decoracion_nombre} <br><small>${r.decoracion_desc}</small></td></tr>
            <tr><th>Valor Decoración</th><td>$${parseInt(r.decoracion_precio.replace(/,/g, '')).toLocaleString()}</td></tr>
          </table>
          <h4>Servicios Incluidos en la Hacienda</h4>
          <ul style="margin-bottom:1.5rem;">
            ${serviciosIncluidosHtml}
          </ul>
          <h4>Servicios Adicionales Contratados</h4>
          <table style="width:100%;margin-bottom:1.5rem;">
            <tr><th>Servicio</th><th>Valor</th></tr>
            ${serviciosHtml}
          </table>
          <div style="text-align:right;font-size:1.2rem;font-weight:600;">
            Total: $${parseInt(r.total).toLocaleString()}
          </div>
        `;
        btnPagar.style.display = 'block';
        btnActualizar.style.display = 'inline-flex';
        btnEliminar.style.display = 'inline-flex';
      } catch (err) {
        facturaDetalle.innerHTML = `<div class="mensaje"><i class="fas fa-exclamation-triangle"></i> Error al buscar la reserva.</div>`;
        btnPagar.style.display = 'none';
        btnActualizar.style.display = 'none';
        btnEliminar.style.display = 'none';
      }
    });
  }

  // Eliminar reserva
  if (btnEliminar) {
    btnEliminar.addEventListener('click', async function() {
      if (!reservaIdActual) return;
      if (!confirm('¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.')) return;
      btnEliminar.disabled = true;
      try {
        const resp = await fetch('../Opciones/eliminar_reserva.php?id=' + encodeURIComponent(reservaIdActual), { method: 'POST' });
        const data = await resp.json();
        if (data.success) {
          facturaDetalle.innerHTML = `<div class="mensaje"><i class="fas fa-check-circle"></i> Reserva eliminada correctamente.</div>`;
          btnPagar.style.display = 'none';
          btnActualizar.style.display = 'none';
          btnEliminar.style.display = 'none';
        } else {
          facturaDetalle.innerHTML = `<div class="mensaje"><i class="fas fa-exclamation-triangle"></i> ${data.error || 'No se pudo eliminar la reserva.'}</div>`;
        }
      } catch (err) {
        facturaDetalle.innerHTML = `<div class="mensaje"><i class="fas fa-exclamation-triangle"></i> Error al eliminar la reserva.</div>`;
      }
      btnEliminar.disabled = false;
    });
  }

  // Actualizar reserva (solo ejemplo: redirige a un formulario de edición)
  if (btnActualizar) {
    btnActualizar.addEventListener('click', function() {
      if (!reservaIdActual) return;
      window.location.href = '../Opciones/editar_reserva.html?id=' + encodeURIComponent(reservaIdActual);
    });
  }
});

// ...existing code from your Factura.js and any <script> from Factura.html...