const api = "http://localhost:7000/api";

document.querySelector("#cursos").addEventListener("change", cargarMaterias);
document.querySelector("#cursos").addEventListener("change", cargarAlumnos);
document.querySelector("#btnFecha").addEventListener("click", cargarAsistenciasPorFecha);
document.addEventListener("DOMContentLoaded", cargarCursos);

document.addEventListener("click", (e) => {
 
});


document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("#btnAgregarAlumno");
  if (btn) btn.addEventListener("click", agregarAlumno);
});

function cargarCursos() {
    fetch(api + "/cursos")
    .then(res => res.json())
    .then(data => {
        const select = document.querySelector("#cursos");
        const selectNuevo = document.querySelector("#cursoNuevo");
        select.innerHTML = "";
        if (selectNuevo) selectNuevo.innerHTML = "";

        data.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = `${c.curso}°${c.division} ${c.esp}`;
            select.appendChild(option);

            if (selectNuevo) {
                const option2 = document.createElement("option");
                option2.value = c.id;
                option2.textContent = `${c.curso}°${c.division} ${c.esp}`;
                selectNuevo.appendChild(option2);
            }
        });
        if (data.length > 0) {
            cargarMaterias();
            cargarAlumnos();
        }
    })
    .catch(err => console.error("Error cargando cursos:", err));
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

function agregarAlumno(e) {
    e?.preventDefault?.();
    const nombres = document.querySelector("#nombresNuevo").value.trim();
    const apellidos = document.querySelector("#apellidosNuevo").value.trim();
    const dniStr = document.querySelector("#dniNuevo").value.trim();
    const curso = document.querySelector("#cursoNuevo").value;

    if (!nombres || !apellidos || !dniStr || !curso) {
        alert("Completa todos los campos.");
        return;
    }

    const dni = parseInt(dniStr, 10);

    fetch(api + "/alumnos", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nombres, apellidos, dni, curso})
    })
    .then(res => res.json())
    .then(resp => {
        if (resp && resp.msg) alert(resp.msg);
        
        document.querySelector("#nombresNuevo").value = "";
        document.querySelector("#apellidosNuevo").value = "";
        document.querySelector("#dniNuevo").value = "";
       
        if (curso == document.querySelector("#cursos").value) {
            cargarAlumnos();
        }
    })
    .catch(err => {
        console.error(err);
        alert("Ocurrió un error al agregar el alumno.");
    });
}
