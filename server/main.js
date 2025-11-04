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

app.get('/api/cursos' , (req, res ) =>{
    const curso = req.params.curso;
    //conn.query('SELECT * FROM materias WHERE curso= ?',[curso] ,(err, rs) => {
    conn.query('SELECT * FROM materias',(err, rs) => {
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
