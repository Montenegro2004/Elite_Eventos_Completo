<?php
require 'Conexion.php';

header('Content-Type: application/json');

$correo = $_GET['correo'] ?? '';

$conn = getDBConnection();
$stmt = $conn->prepare("SELECT * FROM usuarios WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    echo json_encode($usuario);
} else {
    echo json_encode(["error" => "Usuario no encontrado"]);
}

$stmt->close();
$conn->close();
?>
