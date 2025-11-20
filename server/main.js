const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const morgan = require('morgan');

const app = express();
const PORT = 7000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'alumnos'
});

conn.connect();

app.get('/api/cursos', (req,res)=>{
    conn.query("SELECT * FROM cursos", (err,rs)=>{
        res.json(rs);
    });
});

app.get('/api/materias/:curso', (req,res)=>{
    conn.query(
        "SELECT * FROM materias WHERE curso = ?",
        [req.params.curso],
        (err,rs)=> res.json(rs)
    );
});

app.get('/api/alumnos/:curso', (req,res)=>{
    conn.query("SELECT * FROM alumnos WHERE curso = ?",[req.params.curso],
     (err,rs)=> res.json(rs)
    );
});


app.post('/api/alumnos', (req,res)=>{
    const { nombres, apellidos, dni, curso } = req.body;

    const q = "INSERT INTO alumnos (nombres, apellidos, dni, curso) VALUES (?,?,?,?)";

    conn.query(q, [nombres, apellidos, dni, curso], (err, result)=>{
        if(err){
            console.log("Error al insertar alumno:", err);
            return res.status(500).json({msg:"Error al guardar alumno"});
        }
        res.json({msg:"Alumno agregado correctamente", id: result.insertId});
    });
});

app.post('/api/asistencias', (req,res)=>{
    const {tipo, alumno, materia} = req.body;
    const q = "INSERT INTO asistencias (presencia, alumno, materia) VALUES (?,?,?)";
    conn.query(q, [tipo, alumno, materia] ,()=>{
        res.json({msg:"Asistencia guardada"});
    });
});

app.get('/api/asistencias/:fecha', (req,res)=>{
    conn.query(
        "SELECT * FROM asistencias WHERE DATE(fecha)=?",
        [req.params.fecha],
        (err,rs)=> res.json(rs)
    );
});


app.listen(PORT, ()=> console.log("API lista en 7000"));
