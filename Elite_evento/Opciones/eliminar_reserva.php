<?php
require 'Conexion.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? '';
if (!$id) {
    echo json_encode(['success' => false, 'error' => 'ID de reserva requerido']);
    exit;
}

$conn = getDBConnection();

// Eliminar servicios adicionales asociados
$conn->query("DELETE FROM reserva_servadi WHERE FK_idReserva = " . intval($id));
// Eliminar la reserva
$res = $conn->query("DELETE FROM reserva WHERE id_Reserva = " . intval($id));

if ($res) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}
$conn->close();
?>
