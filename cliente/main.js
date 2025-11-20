const api = "http://localhost:7000/api";

document.querySelector("#cursos").addEventListener("change", cargarMaterias);
document.querySelector("#cursos").addEventListener("change", cargarAlumnos);
document.querySelector("#btnFecha").addEventListener("click", cargarAsistenciasPorFecha);

cargarCursos();

function cargarCursos() {
    fetch(api + "/cursos")
    .then(res => res.json())
    .then(data => {
        const select = document.querySelector("#cursos");
        select.innerHTML = "";
        data.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = `${c.curso}°${c.division} ${c.esp}`;
            select.appendChild(option);
        });
        if (data.length > 0) {
            cargarMaterias();
            cargarAlumnos();
        }
    });
}

function cargarMaterias() {
    let id = document.querySelector("#cursos").value;
    fetch(api + "/materias/" + id)
    .then(res => res.json())
    .then(data => {
        const select = document.querySelector("#materias");
        select.innerHTML = "";
        data.forEach(m => {
            const option = document.createElement("option");
            option.value = m.id;
            option.textContent = m.nombre;
            select.appendChild(option);
        });
    });
}

function cargarAlumnos() {
    let id = document.querySelector("#cursos").value;
    fetch(api + "/alumnos/" + id)
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        data.forEach(a => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${a.nombres}</td>
                <td>${a.apellidos}</td>
                <td>${a.dni}</td>
            `;
            const td = document.createElement("td");
            ["P","A","T","AP","RA"].forEach(t => {
                const btn = document.createElement("button");
                btn.textContent = t;
                btn.onclick = () => registrarAsistencia(t, a.id);
                td.appendChild(btn);
            });
            tr.appendChild(td);
            tbody.appendChild(tr);
        });
    });
}

function registrarAsistencia(tipo, alumno) {
    const materia = document.querySelector("#materias").value;
    fetch(api + "/asistencias", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({tipo, alumno, materia})
    })
    .then(res => res.json())
    .then(msg => alert(msg.msg));
}

function cargarAsistenciasPorFecha() {
    const cursoId = document.querySelector("#cursos").value;
    const materiaId = document.querySelector("#materias").value;
    const fecha = document.querySelector("#fecha").value;

    if (!fecha) return;

    Promise.all([
        fetch(api + "/alumnos/" + cursoId).then(res => res.json()),
        fetch(api + "/asistencias/" + fecha).then(res => res.json())
    ]).then(([alumnos, asistencias]) => {
        const tbody = document.querySelector("#tablaFecha tbody");
        tbody.innerHTML = "";

        alumnos.forEach(a => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${a.nombres}</td>
                <td>${a.apellidos}</td>
                <td>${a.dni}</td>
            `;

            const td = document.createElement("td");
            const asistencia = asistencias.find(x => x.alumno === a.id && x.materia == materiaId);

            if (asistencia) {
                td.textContent = asistencia.presencia;
            } else {
                td.textContent = "—";
            }

            tr.appendChild(td);
            tbody.appendChild(tr);
        });
    });
}
