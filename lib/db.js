// lib/db.js
import mysql from "mysql2";

const connection = mysql.createConnection({
  host: "localhost", // O la IP de tu servidor MySQL
  user: "root",
  password: "", // Sustituye por tu contraseña de MySQL
  database: "prueba_db",
});

connection.connect((err) => {
  if (err) {
    console.error("Error de conexión:", err.stack);
    return;
  }
  console.log("Conexión exitosa a la base de datos");
});

export default connection;
