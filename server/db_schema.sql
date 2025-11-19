
DROP DATABASE IF EXISTS alumnos;

CREATE DATABASE alumnos;

USE alumnos;


CREATE TABLE IF NOT EXISTS cursos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curso INT,
    division INT,
    esp ENUM('Automotor','Ciclo Basico', 'Computacion'),
    aula INT
);

CREATE TABLE IF NOT EXISTS materias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    horas INT,
    profesor VARCHAR(50),
    contraturno BOOLEAN,
    nombre  VARCHAR(50),
    curso INT,
    FOREIGN KEY (curso) REFERENCES cursos(id)
);
CREATE TABLE IF NOT EXISTS alumnos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(50),
    apellidos VARCHAR(50),
    dni INT,
    curso INT,
    FOREIGN KEY (curso) REFERENCES cursos(id)
);
CREATE TABLE IF NOT EXISTS asistencias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    presencia ENUM ('P','A','T','AP','RA'),
    alumno INT,
    materia INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno) REFERENCES alumnos(id),
    FOREIGN KEY (materia) REFERENCES materias(id)

);


