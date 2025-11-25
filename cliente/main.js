const api = "http://localhost:7000/api";

document.addEventListener("DOMContentLoaded", () => {
    cargarCursos();
    const btn = document.querySelector("#btnAgregarAlumno");
    if (btn) btn.addEventListener("click", agregarAlumno);
});

document.querySelector("#cursos")?.addEventListener("change", () => {
    cargarMaterias();
    cargarAlumnos();
});
document.querySelector("#btnFecha")?.addEventListener("click", cargarAsistenciasPorFecha);

function cargarCursos() {
    fetch(api + "/cursos")
    .then(res => res.json())
    .then(data => {
        const select = document.querySelector("#cursos");
        const selectNuevo = document.querySelector("#cursoNuevo");
        if (!select) return;
        select.innerHTML = "";
        if (selectNuevo) selectNuevo.innerHTML = "";

        data.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = `${c.curso}°${c.division} ${c.esp}`;
            select.append(option);

            if (selectNuevo) {
                const option2 = document.createElement("option");
                option2.value = c.id;
                option2.textContent = `${c.curso}°${c.division} ${c.esp}`;
                selectNuevo.append(option2);
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
    const selectCursos = document.querySelector("#cursos");
    if (!selectCursos) return;
    const id = selectCursos.value;
    fetch(api + "/materias/" + id)
    .then(res => res.json())
    .then(data => {
        const select = document.querySelector("#materias");
        if (!select) return;
        select.innerHTML = "";
        data.forEach(m => {
            const option = document.createElement("option");
            option.value = m.id;
            option.textContent = m.nombre;
            select.append(option);
        });
    })
    .catch(err => console.error("Error cargando materias:", err));
}

function formatTimeFromSQL(ts) {
    if (!ts) return "";
    let dateObj;
    if (typeof ts !== "string") {
        
        dateObj = new Date(ts);
    } else if (ts.includes('T')) {
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

async function fetchAsistenciasMap(fecha, materiaId, cursoId) {
    let url = api + "/asistencias";
    let params = [];

    if (fecha) params.push("fecha=" + fecha);
    if (materiaId) params.push("materia=" + materiaId);
    if (cursoId) params.push("curso=" + cursoId);

    if (params.length > 0) url += "?" + params.join("&");

    try {
        const res = await fetch(url);
        if (!res.ok) return new Map();

        const rows = await res.json();
        const mapa = new Map();

        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            mapa.set(r.alumno_id, {
                presencia: r.presencia,
                ingreso: r.ingreso,
                egreso: r.egreso
            });
        }

        return mapa;

    } catch (err) {
        console.error("Error fetchAsistenciasMap:", err);
        return new Map();
    }
}

async function cargarAlumnos() {
    let id = document.querySelector("#cursos").value;
    if (!id) return;

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth()+1).padStart(2,'0');
    const dd = String(hoy.getDate()).padStart(2,'0');
    const hoyStr = `${yyyy}-${mm}-${dd}`;

    const materiaId = document.querySelector("#materias")?.value;

    const asistMap = await fetchAsistenciasMap(hoyStr, materiaId, id);

    fetch(api + "/alumnos/" + id)
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector("tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        data.forEach(a => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${a.nombres}</td>
                <td>${a.apellidos}</td>
                <td>${a.dni}</td>
            `;
            const td = document.createElement("td");

            const regHoy = asistMap.get(a.id);

            const permitirRAOnly = regHoy && (regHoy.presencia === 'P' || regHoy.presencia === 'T') && !regHoy.egreso;
            const yaCerrado = regHoy && (regHoy.egreso || regHoy.presencia === 'RA' || regHoy.presencia === 'A');

            ["P","A","T","AP","RA"].forEach(t => {
                const btn = document.createElement("button");
                btn.textContent = t;
                btn.type = "button";
                if (!regHoy) {
                    btn.disabled = false;
                } else if (permitirRAOnly) {
                    btn.disabled = (t !== 'RA');
                } else if (yaCerrado) {
                    btn.disabled = true;
                } else {
                    btn.disabled = false;
                }

                btn.onclick = () => registrarAsistencia(t, a.id);
                td.append(btn);
            });

            tr.append(td);
            tbody.append(tr);
        });
    })
    .catch(err => {
        console.error("Error cargando alumnos:", err);
    });
}

function registrarAsistencia(tipo, alumno) {
    const materia = document.querySelector("#materias").value;
    fetch(api + "/asistencias", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({tipo, alumno, materia})
    })
    .then(async res => {
        const data = await res.json().catch(()=>({}));
        if (!res.ok) {
            alert(data.msg || "No se pudo guardar la asistencia.");
            cargarAlumnos();
            cargarAsistenciasPorFecha();
            return;
        }
        alert(data.msg || "Asistencia guardada");
        cargarAlumnos();
        cargarAsistenciasPorFecha();
    })
    .catch(err => {
        console.error(err);
        alert("Error al guardar la asistencia.");
    });
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
        if (!tbody) return;
        tbody.innerHTML = "";

        if (!asistencias || asistencias.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="7">No hay registros.</td>`;
            tbody.append(tr);
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

            const tdIngres = document.createElement("td");

            tdIngres.textContent = formatTimeFromSQL(row.ingreso || row.fecha);

            const tdEgres = document.createElement("td");
            tdEgres.textContent = formatTimeFromSQL(row.egreso);

            const tdAcc = document.createElement("td");
            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.textContent = "Editar";
            btnEditar.addEventListener("click", () => editarAsistencia(row.id, row.presencia));

            const btnEliminar = document.createElement("button");
            btnEliminar.type = "button";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.addEventListener("click", () => eliminarAsistencia(row.id));

            tdAcc.append(btnEditar, document.createTextNode(" "), btnEliminar);

            tr.append(tdNombre, tdApellido, tdDni, tdPres, tdIngres, tdEgres, tdAcc);

            tbody.append(tr);
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
        cargarAlumnos();
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
        cargarAlumnos();
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
