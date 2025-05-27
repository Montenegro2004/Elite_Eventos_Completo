<?php
require 'Conexion.php';
header('Content-Type: application/json');

$nombre = $_GET['nombre'] ?? '';
$apellido = $_GET['apellido'] ?? '';
if (!$nombre || !$apellido) {
    echo json_encode(['success' => false, 'error' => 'Nombre y apellido requeridos']);
    exit;
}

$conn = getDBConnection();

// Buscar la reserva más reciente por nombre y apellido
$sql = "
SELECT 
    r.id_Reserva,
    u.nombre,
    u.apellido,
    u.correo,
    u.telefono,
    h.precio AS hacienda_precio,
    d.precio AS decoracion_precio
FROM reserva r
JOIN usuarios u ON r.FK_id_user = u.id_usuario
JOIN hacienda h ON r.FK_id_Hacienda = h.id_hacienda
JOIN decoracion d ON r.FK_id_decoracion = d.id_decoracion
WHERE u.nombre = ? AND u.apellido = ?
ORDER BY r.id_Reserva DESC
LIMIT 1
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $nombre, $apellido);
$stmt->execute();
$res = $stmt->get_result();
if ($row = $res->fetch_assoc()) {
    // Servicios adicionales
    $sql2 = "SELECT sa.precio FROM reserva_servadi rsa JOIN servicio_adi sa ON rsa.FK_IdSerAdi = sa.id_servAdi WHERE rsa.FK_idReserva = ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("i", $row['id_Reserva']);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    $servicios_precio = 0;
    while ($s = $res2->fetch_assoc()) {
        // Quitar comas y convertir a int
        $servicios_precio += intval(str_replace(',', '', $s['precio']));
    }
    $stmt2->close();

    // Precios
    $hacienda_precio = intval(str_replace(',', '', $row['hacienda_precio']));
    $decoracion_precio = intval(str_replace(',', '', $row['decoracion_precio']));
    $impuestos = round(($hacienda_precio + $decoracion_precio + $servicios_precio) * 0.03);
    $total = $hacienda_precio + $decoracion_precio + $servicios_precio + $impuestos;

    echo json_encode([
        'success' => true,
        'reserva' => [
            'id_Reserva' => $row['id_Reserva'],
            'nombre' => $row['nombre'],
            'apellido' => $row['apellido'],
            'correo' => $row['correo'],
            'telefono' => $row['telefono'],
            'hacienda_precio' => $hacienda_precio,
            'decoracion_precio' => $decoracion_precio,
            'servicios_precio' => $servicios_precio,
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
