<?php
require 'Conexion.php';
header('Content-Type: application/json');

$id = $_POST['idReserva'] ?? '';
$fecha = $_POST['fecha_res'] ?? '';
$hora = $_POST['Hora_inicio'] ?? '';
$tipo = $_POST['tipo_evento'] ?? '';
$tematica = $_POST['tematica'] ?? '';
$duracion = $_POST['Duración'] ?? '';
$instituto = $_POST['instituto'] ?? '';
$pref_contacto = $_POST['pref_contacto'] ?? '';
$hacienda = $_POST['FK_id_Hacienda'] ?? '';
$decoracion = $_POST['FK_id_decoracion'] ?? '';

if (!$id) {
    echo json_encode(['success' => false, 'error' => 'ID de reserva requerido']);
    exit;
}

$conn = getDBConnection();
$stmt = $conn->prepare("UPDATE reserva SET fecha_res=?, Hora_inicio=?, tipo_evento=?, tematica=?, Duración=?, instituto=?, pref_contacto=?, FK_id_Hacienda=?, FK_id_decoracion=? WHERE id_Reserva=?");
$stmt->bind_param("sssssssiii", $fecha, $hora, $tipo, $tematica, $duracion, $instituto, $pref_contacto, $hacienda, $decoracion, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
$conn->close();
?>
