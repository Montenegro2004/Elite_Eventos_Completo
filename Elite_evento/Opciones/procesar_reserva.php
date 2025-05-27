<?php
require 'Conexion.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $fecha = $_POST['fecha'] ?? '';
    $id_usuario = $_POST['usuario'] ?? '';
    $instituto = $_POST['instituto'] ?? '';
    $hora = $_POST['hora'] ?? '';
    $evento = $_POST['evento'] ?? '';
    $tematica = $_POST['tematica'] ?? '';
    $hacienda = $_POST['hacienda'] ?? '';
    $contacto = $_POST['contacto'] ?? '';
    $duracion = $_POST['duracion'] ?? '';
    $decoracion = $_POST['decoracion'] ?? null; // Cambiado: solo un valor 1-4
    $servicios = $_POST['servicios'] ?? [];

    $conn = getDBConnection();

    // Insertar reserva con FK_id_decoracion
    $sql = "INSERT INTO reserva (fecha_res, FK_id_user, instituto, Hora_inicio, tipo_evento, tematica, FK_id_Hacienda, pref_contacto, Duración, FK_id_decoracion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sisssssssi", $fecha, $id_usuario, $instituto, $hora, $evento, $tematica, $hacienda, $contacto, $duracion, $decoracion);

    if ($stmt->execute()) {
        $reserva_id = $stmt->insert_id;

        // Guardar servicios adicionales
        if (!empty($servicios)) {
            if (!is_array($servicios)) $servicios = [$servicios];
            foreach ($servicios as $id_serv) {
                $stmtServ = $conn->prepare("INSERT INTO reserva_servadi (FK_idReserva, FK_IdSerAdi) VALUES (?, ?)");
                $stmtServ->bind_param("ii", $reserva_id, $id_serv);
                $stmtServ->execute();
                $stmtServ->close();
            }
        }

        echo json_encode(["success" => true, "id_reserva" => $reserva_id]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
