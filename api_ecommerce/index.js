import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import router from './router';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config();

// CONEXIÓN A LA BASE DE DATOS
mongoose.set('strictQuery', true); // Solución al DeprecationWarning de Mongoose
mongoose.Promise = global.Promise;

const dbUrL = "mongodb://127.0.0.1:27017/ecommerce_udemy";

mongoose.connect(dbUrL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("CONECTADO A LA BD EN EL PUERTO 27017"))
.catch(err => console.log("Error al conectar a la base de datos: ", err));

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(path.resolve(), 'public')));

// Rutas
app.use('/api/', router);

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.set('port', PORT);

// Iniciar el servidor
const server = app.listen(app.get('port'), () => {
    console.log(`EL SERVIDOR SE EJECUTÓ PERFECTAMENTE EN EL PUERTO ${PORT}`);
});

// Manejo de error de puerto en uso
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} está en uso, intenta usar otro puerto.`);
    } else {
        console.error('Error en el servidor:', err);
    }
});
