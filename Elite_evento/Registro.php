<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "eliteeventos"; // Asegúrate que coincide con tu BD

// Crear conexión
$conn = new mysqli($servername, $username, $password, $database);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Error de conexión: ' . $conn->connect_error]));
}

// Procesar el formulario
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener y sanitizar datos
    $nombre = $conn->real_escape_string($_POST["nombre"]);
    $apellidos = $conn->real_escape_string($_POST["apellidos"]);
    $email = $conn->real_escape_string($_POST["email"]);
    $telefono = $conn->real_escape_string($_POST["telefono"]);
    $password = password_hash($_POST["password"], PASSWORD_DEFAULT);

    // Insertar datos
    $sql = "INSERT INTO usuarios (nombre, apellido, correo, telefono, contraseña) 
            VALUES ('$nombre', '$apellidos', '$email', '$telefono', '$password')";

    if ($conn->query($sql) === TRUE) {
        // Registro exitoso - Redirección con JavaScript
        echo '<script>
                localStorage.setItem("registroExitoso", "true");
                window.location.href = "sesion.html";
              </script>';
        exit();
    } else {
        // Mostrar error en formato JSON para mejor manejo
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Error al registrar: ' . $conn->error
        ]);
        exit();
    }
}

$conn->close();
?>