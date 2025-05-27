<?php
require 'Conexion.php';
header('Content-Type: application/json');

$idReserva = $_POST['idReserva'] ?? '';
$planPago = $_POST['planPago'] ?? '';
$metodoPago = $_POST['metodoPago'] ?? '';
$totalPagar = $_POST['totalPagar'] ?? '';
$valorHacienda = $_POST['valorHacienda'] ?? '';
$valorDecoracion = $_POST['valorDecoracion'] ?? '';
$valorServicios = $_POST['valorServicios'] ?? '';
$valorImpuestos = $_POST['valorImpuestos'] ?? '';
$valorTotal = $_POST['valorTotal'] ?? '';
$nombreTitular = $_POST['nombreTitular'] ?? '';
$numeroTarjeta = $_POST['numeroTarjeta'] ?? '';
$fechaExpiracion = $_POST['fechaExpiracion'] ?? '';
$cvv = $_POST['cvv'] ?? '';
$tipoDocumento = $_POST['tipoDocumento'] ?? '';
$pais = $_POST['pais'] ?? '';
$direccion1 = $_POST['direccion1'] ?? '';
$direccion2 = $_POST['direccion2'] ?? '';
$ciudad = $_POST['ciudad'] ?? '';
$departamento = $_POST['departamento'] ?? '';
$codigoPostal = $_POST['codigoPostal'] ?? '';
$numeroDocumento = $_POST['numeroDocumento'] ?? ''; // Si lo necesitas, agrega el campo en el formulario

if (!$idReserva) {
    echo json_encode(['success' => false, 'error' => 'Reserva no encontrada']);
    exit;
}

$conn = getDBConnection();

// Insertar en factura
$fecha_pago = date('Y-m-d');
$descuento = '';
if ($planPago === 'completo') {
    $descuento = '25%';
} elseif ($planPago === 'inicial') {
    $descuento = '15%';
}
$estado = 'Pendiente';

$stmt = $conn->prepare("INSERT INTO factura (fecha_pago, total, metodo_pago, plan_pago, descuento, estado, FK_id_reserva) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssi", $fecha_pago, $totalPagar, $metodoPago, $planPago, $descuento, $estado, $idReserva);

if ($stmt->execute()) {
    $idFactura = $stmt->insert_id;

    // Insertar en datos_pago
    $stmt2 = $conn->prepare("INSERT INTO datos_pago (FK_id_factura, nombre_titular, numero_tarjeta, fecha_exp, cvv, tipo_documento, numero_documento, pais, direccion_linea1, direccion_linea2, ciudad, departamento, codigo_postal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt2->bind_param(
        "issssssssssss",
        $idFactura,
        $nombreTitular,
        $numeroTarjeta,
        $fechaExpiracion,
        $cvv,
        $tipoDocumento,
        $numeroDocumento,
        $pais,
        $direccion1,
        $direccion2,
        $ciudad,
        $departamento,
        $codigoPostal
    );
    if ($stmt2->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt2->error]);
    }
    $stmt2->close();
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
$conn->close();
?>
