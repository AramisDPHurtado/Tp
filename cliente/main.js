const api = "http://localhost:7000/api";

document.querySelector("#cursos").addEventListener("change", cargarMaterias);
document.querySelector("#cursos").addEventListener("change", cargarAlumnos);
document.querySelector("#btnFecha").addEventListener("click", cargarAsistenciasPorFecha);
document.addEventListener("DOMContentLoaded", () => {
    cargarCursos();
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
                btn.type = "button";
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
    .then(msg => {
        alert(msg.msg || "Asistencia guardada");
       
        cargarAsistenciasPorFecha();
    })
    .catch(err => {
        console.error(err);
        alert("Error al guardar la asistencia.");
    });
}


function formatTimeFromSQL(ts) {
    if (!ts) return "";
    let dateObj;
    if (ts.includes('T')) {
        dateObj = new Date(ts);
        if (isNaN(dateObj)) {
            const tryIso = ts.replace(' ', 'T');
            dateObj = new Date(tryIso);
        }
    } else if (ts.indexOf(' ') !== -1) {
      
        const iso = ts.replace(' ', 'T') + '-03:00';
        dateObj = new Date(iso);
    } else {
        dateObj = new Date(ts);
    }
    if (isNaN(dateObj)) return ts;
    try {
        return dateObj.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'America/Argentina/Buenos_Aires'
        });
    } catch (e) {
        return dateObj.toLocaleTimeString('es-AR', { hour12: false });
    }
}


function cargarAsistenciasPorFecha() {
    const cursoId = document.querySelector("#cursos").value;
    const materiaId = document.querySelector("#materias").value;
    const fecha = document.querySelector("#fecha").value; 

    const params = new URLSearchParams();
    if (fecha) params.set("fecha", fecha);
    if (materiaId) params.set("materia", materiaId);
    if (cursoId) params.set("curso", cursoId);

    const url = api + "/asistencias" + (params.toString() ? ("?" + params.toString()) : "");

    fetch(url)
    .then(res => res.json())
    .then(asistencias => {
        const tbody = document.querySelector("#tablaFecha tbody");
        tbody.innerHTML = "";

        if (!asistencias || asistencias.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="6">No hay registros.</td>`;
            tbody.appendChild(tr);
            return;
        }

        asistencias.forEach(row => {
            const tr = document.createElement("tr");

            const tdNombre = document.createElement("td");
            tdNombre.textContent = row.nombres || "";
            const tdApellido = document.createElement("td");
            tdApellido.textContent = row.apellidos || "";
            const tdDni = document.createElement("td");
            tdDni.textContent = row.dni || "";

            const tdPres = document.createElement("td");
            tdPres.textContent = row.presencia || "";

            const tdHora = document.createElement("td");
            tdHora.textContent = formatTimeFromSQL(row.fecha);

            const tdAcc = document.createElement("td");
            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.textContent = "Editar";
            btnEditar.addEventListener("click", () => editarAsistencia(row.id, row.presencia));

            const btnEliminar = document.createElement("button");
            btnEliminar.type = "button";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.addEventListener("click", () => eliminarAsistencia(row.id));

            tdAcc.appendChild(btnEditar);
            tdAcc.appendChild(document.createTextNode(" "));
            tdAcc.appendChild(btnEliminar);

            tr.appendChild(tdNombre);
            tr.appendChild(tdApellido);
            tr.appendChild(tdDni);
            tr.appendChild(tdPres);
            tr.appendChild(tdHora);
            tr.appendChild(tdAcc);

            tbody.appendChild(tr);
        });
    })
    .catch(err => {
        console.error("Error cargando asistencias:", err);
        alert("Ocurrió un error al cargar las asistencias.");
    });
}

function eliminarAsistencia(id) {
    if (!confirm("¿Seguro querés eliminar este registro de asistencia?")) return;
    fetch(api + "/asistencias/" + id, { method: "DELETE" })
    .then(res => res.json())
    .then(resp => {
        alert(resp.msg || "Registro eliminado");
        cargarAsistenciasPorFecha();
    })
    .catch(err => {
        console.error(err);
        alert("Ocurrió un error al eliminar.");
    });
}

function editarAsistencia(id, actual) {
    const permitido = ["P","A","T","AP","RA"];
    const nuevo = prompt(`Valor actual: ${actual}\nIngrese nueva presencia (${permitido.join(", ")}):`, actual);
    if (nuevo === null) return;
    const val = nuevo.trim().toUpperCase();
    if (!permitido.includes(val)) {
        alert("Valor inválido. Debe ser uno de: " + permitido.join(", "));
        return;
    }

    fetch(api + "/asistencias/" + id, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ presencia: val })
    })
    .then(res => res.json())
    .then(resp => {
        alert(resp.msg || "Registro actualizado");
        cargarAsistenciasPorFecha();
    })
    .catch(err => {
        console.error(err);
        alert("Ocurrió un error al editar.");
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
