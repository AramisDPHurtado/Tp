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
    database: 'alumnos',
    timezone: '-03:00' 
});

conn.connect(err => {
    if (err) {
        console.error("Error conectando a la DB:", err);
        process.exit(1);
    } else {
        console.log("Conectado a MySQL.");
        conn.query("SET time_zone = '-03:00'", (tzErr) => {
            if (tzErr) console.warn("No se pudo setear time_zone en la sesión:", tzErr);
        });
    }
});

app.get('/api/cursos', (req,res)=>{
    conn.query("SELECT * FROM cursos", (err,rs)=>{
        if (err) return res.status(500).json({msg:"Error al obtener cursos"});
        res.json(rs);
    });
});

app.get('/api/materias/:curso', (req,res)=>{
    conn.query("SELECT * FROM materias WHERE curso = ?", [req.params.curso], (err,rs)=>{
        if (err) return res.status(500).json({msg:"Error al obtener materias"});
        res.json(rs);
    });
});

app.get('/api/alumnos/:curso', (req,res)=>{
    conn.query("SELECT * FROM alumnos WHERE curso = ?", [req.params.curso], (err,rs)=>{
        if (err) return res.status(500).json({msg:"Error al obtener alumnos"});
        res.json(rs);
    });
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
    conn.query(q, [tipo, alumno, materia], (err, result)=>{
        if (err) {
            console.error("Error guardando asistencia:", err);
            return res.status(500).json({msg: "Error al guardar asistencia"});
        }
        res.json({msg:"Asistencia guardada", id: result.insertId});
    });
});

app.get('/api/asistencias', (req, res) => {
    const { fecha, materia, curso } = req.query;

    let sql = `
        SELECT a.id, a.presencia, a.fecha,
               al.id AS alumno_id, al.nombres, al.apellidos, al.dni, al.curso AS curso_id,
               m.id AS materia_id, m.nombre AS materia_nombre
        FROM asistencias a
        JOIN alumnos al ON a.alumno = al.id
        JOIN materias m ON a.materia = m.id
    `;
    const params = [];
    const where = [];

    if (fecha) {
        where.push("DATE(a.fecha) = ?");
        params.push(fecha);
    }
    if (materia) {
        where.push("a.materia = ?");
        params.push(materia);
    }
    if (curso) {
        where.push("al.curso = ?");
        params.push(curso);
    }

    if (where.length) sql += " WHERE " + where.join(" AND ");

    sql += " ORDER BY a.fecha DESC, a.id DESC"; 

    conn.query(sql, params, (err, rows) => {
        if (err) {
            console.error("Error al obtener asistencias:", err);
            return res.status(500).json({ msg: "Error al obtener asistencias" });
        }
        res.json(rows);
    });
});

app.get('/api/asistencias/:fecha', (req,res)=>{

    const fecha = req.params.fecha;
    const sql = `
        SELECT a.id, a.presencia, a.fecha,
               al.id AS alumno_id, al.nombres, al.apellidos, al.dni, al.curso AS curso_id,
               m.id AS materia_id, m.nombre AS materia_nombre
        FROM asistencias a
        JOIN alumnos al ON a.alumno = al.id
        JOIN materias m ON a.materia = m.id
        WHERE DATE(a.fecha) = ?
        ORDER BY a.fecha DESC, a.id DESC
    `;
    conn.query(sql, [fecha], (err, rows) => {
        if (err) {
            console.error("Error al obtener asistencias por fecha:", err);
            return res.status(500).json({msg: "Error al obtener asistencias"});
        }
        res.json(rows);
    });
});

const ALLOWED = ['P','A','T','AP','RA'];

app.put('/api/asistencias/:id', (req, res) => {
    const { presencia } = req.body;
    const id = req.params.id;
    if (!presencia || !ALLOWED.includes(presencia)) {
        return res.status(400).json({ msg: "Valor de presencia inválido" });
    }
    const q = "UPDATE asistencias SET presencia = ? WHERE id = ?";
    conn.query(q, [presencia, id], (err, result) => {
        if (err) {
            console.error("Error actualizando asistencia:", err);
            return res.status(500).json({ msg: "Error al actualizar asistencia" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: "Registro no encontrado" });
        }
        res.json({ msg: "Asistencia actualizada" });
    });
});

app.delete('/api/asistencias/:id', (req, res) => {
    const id = req.params.id;
    const q = "DELETE FROM asistencias WHERE id = ?";
    conn.query(q, [id], (err, result) => {
        if (err) {
            console.error("Error eliminando asistencia:", err);
            return res.status(500).json({ msg: "Error al eliminar asistencia" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: "Registro no encontrado" });
        }
        res.json({ msg: "Asistencia eliminada" });
    });
});

app.listen(PORT, ()=> console.log("API lista en 7000"));
