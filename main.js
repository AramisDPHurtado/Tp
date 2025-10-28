const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const morgan = require('morgan');

const PORT = process.env.PORT || 7000;

const app = express();

app.use(cors());
app.use(morgan('dev'));

const conn = mysql.createConnection({
    host:'localhost',
    user: 'root',
    database: 'alumnos'
});

app.post('/api/asistencias', (req , res) => {
    const { tipo, alumno, materia } = req.body;
    const data = [tipo, alumno, materia];
    const q = 'INSERT INTO registros (tipo, alumno, materias) VALUES (?,?,?)'
    conn.query( data, (err, rs) => {
        res.status(201).json({msg: 'Alta OK'});
    });
});

app.listen(PORT, () => {
  console.log('Server andando nomás en el puerto 7000');
});

