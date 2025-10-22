const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const morgan = require('morgan');



const app = express();

app.use(cors());
app.use(morgan('dev'));

const conn = mysql.createConnection({
    host:'localhost',
    database: 'Base_alumnos'
});

app.post

