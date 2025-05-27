<?php
session_start();
$servername = "localhost";
$username = "root";
$password = "";
$database = "eliteeventos";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $conn->real_escape_string($_POST["email"]);
    $password = $_POST["password"];

    // Buscar usuario en la base de datos
    $sql = "SELECT id_usuario, nombre, contraseña FROM usuarios WHERE correo = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Verificar contraseña
        if (password_verify($password, $row["contraseña"])) {
            // Inicio de sesión exitoso
            $_SESSION["usuario_id"] = $row["id_usuario"];
            $_SESSION["usuario_nombre"] = $row["nombre"];
            
            // Recordar usuario si marcó la casilla
            if (isset($_POST["remember"])) {
                setcookie("usuario_email", $email, time() + (86400 * 30), "/"); // 30 días
            }
            
            // Redirigir a Haciendas.html
            header("Location: Haciendas.html");
            exit();
        } else {
            // Contraseña incorrecta
            header("Location: sesion.html?error=" . urlencode("Contraseña incorrecta"));
            exit();
        }
    } else {
        // Usuario no encontrado
        header("Location: sesion.html?error=" . urlencode("Usuario no encontrado"));
        exit();
    }
}

$conn->close();
?>