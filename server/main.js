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

conn.connect();

app.get('/api/cursos/', (req, res ) =>{
    let id = req.params.id;
    conn.query('SELECT id FROM cursos WHERE curso = ? AND division = ? AND esp = ? ',[id] ,(err, rs) => {
    //conn.query('SELECT * FROM cursos',[] ,(err, rs) => {
        res.status(200).json(rs);
    });
});

app.get('/api/materias',(req,res) => {
    const materia = req.params.materia;
    const q ='SELECT a.id, a.nombres, a.apellidos FROM alumnos a JOIN cursos c ON a.curso = c.id JOIN materias m ON m.curso =conn.id WHERE m.id =?'
    conn.query(q,[materia], (err, rs) => {
        res.status(200).json(rs);
      
    });
});

app.post('/api/asistencias', (req , res) => {
    const { asistencia, alumno, materia } = req.body;
    const data = [asistencia, alumno, materia];
    const q = 'INSERT INTO asistencias (asistencia, alumno, materias) VALUES (?,?,?)'
    conn.query( data, (err, rs) => {
        res.status(201).json({msg: 'Alta OK'});
    });
});

app.listen(PORT, () => {
  console.log('Server andando nomás en el puerto 7000');
});
