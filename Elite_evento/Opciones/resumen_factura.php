<?php
require 'Conexion.php';
header('Content-Type: application/json');

// Buscar por id de reserva (para editar)
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $conn = getDBConnection();
    $sql = "
    SELECT r.*, 
           u.nombre as cliente, u.apellido, u.correo, u.telefono,
           h.nombre as hacienda_nombre, h.capacidad as hacienda_capacidad, h.direccion as hacienda_direccion, h.precio as hacienda_precio,
           d.nombre as decoracion_nombre, d.descripcion as decoracion_desc, d.precio as decoracion_precio
    FROM reserva r
    JOIN usuarios u ON r.FK_id_user = u.id_usuario
    JOIN hacienda h ON r.FK_id_Hacienda = h.id_hacienda
    JOIN decoracion d ON r.FK_id_decoracion = d.id_decoracion
    WHERE r.id_Reserva = ?
    LIMIT 1
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        echo json_encode(['success' => true, 'reserva' => $row]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró la reserva.']);
    }
    $stmt->close();
    $conn->close();
    exit;
}

// Buscar por nombre y apellido (ambos obligatorios)
$nombre = $_GET['nombre'] ?? '';
$apellido = $_GET['apellido'] ?? '';
if (!$nombre || !$apellido) {
    echo json_encode(['success' => false, 'error' => 'Nombre y apellido requeridos']);
    exit;
}

$conn = getDBConnection();

// Normalizar espacios y mayúsculas/minúsculas para evitar errores de coincidencia
$nombre = trim($nombre);
$apellido = trim($apellido);

// Buscar la reserva más reciente por nombre y apellido exactos (ignorando mayúsculas/minúsculas y espacios extra)
$sql = "
SELECT 
    r.id_Reserva,
    u.nombre,
    u.apellido,
    u.correo,
    u.telefono,
    r.fecha_res,
    r.tipo_evento,
    r.tematica,
    r.Hora_inicio,
    r.Duración,
    h.precio AS hacienda_precio,
    d.precio AS decoracion_precio,
    r.FK_id_Hacienda,
    r.FK_id_decoracion,
    h.nombre as hacienda_nombre,
    h.capacidad as hacienda_capacidad,
    h.direccion as hacienda_direccion,
    d.nombre as decoracion_nombre,
    d.descripcion as decoracion_desc
FROM reserva r
JOIN usuarios u ON r.FK_id_user = u.id_usuario
JOIN hacienda h ON r.FK_id_Hacienda = h.id_hacienda
JOIN decoracion d ON r.FK_id_decoracion = d.id_decoracion
WHERE TRIM(LOWER(u.nombre)) = ? AND TRIM(LOWER(u.apellido)) = ?
ORDER BY r.id_Reserva DESC
LIMIT 1
";
$stmt = $conn->prepare($sql);
$nombreLower = mb_strtolower($nombre, 'UTF-8');
$apellidoLower = mb_strtolower($apellido, 'UTF-8');
$stmt->bind_param("ss", $nombreLower, $apellidoLower);
$stmt->execute();
$res = $stmt->get_result();
if ($row = $res->fetch_assoc()) {
    // Servicios adicionales contratados
    $sql2 = "SELECT sa.nombre, sa.precio FROM reserva_servadi rsa JOIN servicio_adi sa ON rsa.FK_IdSerAdi = sa.id_servAdi WHERE rsa.FK_idReserva = ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("i", $row['id_Reserva']);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    $servicios = [];
    $servicios_precio = 0;
    while ($s = $res2->fetch_assoc()) {
        $servicios[] = $s;
        $servicios_precio += intval(str_replace(',', '', $s['precio']));
    }
    $stmt2->close();

    // Servicios incluidos en la hacienda
    $sql3 = "SELECT si.nombre, si.descripcion FROM hacienda_serv hs JOIN servicioinclu si ON hs.FK_id_servinclu = si.id_servicio WHERE hs.FK_id_hacienda = ?";
    $stmt3 = $conn->prepare($sql3);
    $stmt3->bind_param("i", $row['FK_id_Hacienda']);
    $stmt3->execute();
    $res3 = $stmt3->get_result();
    $servicios_incluidos = [];
    while ($si = $res3->fetch_assoc()) {
        $servicios_incluidos[] = $si;
    }
    $stmt3->close();

    // Precios
    $hacienda_precio = intval(str_replace(',', '', $row['hacienda_precio']));
    $decoracion_precio = intval(str_replace(',', '', $row['decoracion_precio']));
    $impuestos = round(($hacienda_precio + $decoracion_precio + $servicios_precio) * 0.03);
    $total = $hacienda_precio + $decoracion_precio + $servicios_precio + $impuestos;

    echo json_encode([
        'success' => true,
        'reserva' => [
            'id_Reserva' => $row['id_Reserva'],
            'cliente' => $row['nombre'] . ' ' . $row['apellido'],
            'correo' => $row['correo'],
            'telefono' => $row['telefono'],
            'fecha_res' => $row['fecha_res'],
            'tipo_evento' => $row['tipo_evento'],
            'tematica' => $row['tematica'],
            'Hora_inicio' => $row['Hora_inicio'],
            'Duración' => $row['Duración'],
            'hacienda_nombre' => $row['hacienda_nombre'] ?? '',
            'hacienda_capacidad' => $row['hacienda_capacidad'] ?? '',
            'hacienda_direccion' => $row['hacienda_direccion'] ?? '',
            'hacienda_precio' => $row['hacienda_precio'],
            'decoracion_nombre' => $row['decoracion_nombre'] ?? '',
            'decoracion_desc' => $row['decoracion_desc'] ?? '',
            'decoracion_precio' => $row['decoracion_precio'],
            'servicios' => $servicios,
            'servicios_incluidos' => $servicios_incluidos,
            'impuestos' => $impuestos,
            'total' => $total
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'No se encontró la reserva para ese nombre y apellido.']);
}
$stmt->close();
$conn->close();
?>
