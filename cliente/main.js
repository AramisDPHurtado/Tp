const api = "http://localhost:7000/api";

document.querySelector("#cursos").addEventListener("change", cargarMaterias);
document.querySelector("#cursos").addEventListener("change", cargarAlumnos);


cargarCursos();

function cargarCursos(){
    fetch(api + "/cursos")
    .then(res=>res.json())
    .then(data=>{
        const sel = document.querySelector("#cursos");
        sel.innerHTML = "";
        data.forEach(c=>{
            const op = document.createElement("option");
            op.value = c.id;
            op.textContent = `${c.curso}°${c.division} ${c.esp}`;
            sel.appendChild(op);
        });
    });
}

function cargarMaterias(){
    let id = document.querySelector("#cursos").value;
    fetch(api + "/materias/" + id)
    .then(res=>res.json())
    .then(data=>{
        const sel = document.querySelector("#materias");
        sel.innerHTML = "";
        data.forEach(m=>{
            const op = document.createElement("option");
            op.value = m.id;
            op.textContent = m.nombre;
            sel.appendChild(op);
        });
    });
}

function cargarAlumnos(){
    let id = document.querySelector("#cursos").value;
    fetch(api + "/alumnos/" + id)
    .then(res=>res.json())
    .then(data=>{
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        data.forEach(a=>{
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${a.nombres}</td>
                <td>${a.apellidos}</td>
                <td>${a.dni}</td>
            `;
            const td = document.createElement("td");
            ["P","A","T","AP","RA"].forEach(t=>{
                const btn = document.createElement("button");
                btn.textContent = t;
                btn.onclick = ()=> registrarAsistencia(t, a.id);
                td.appendChild(btn);
            });
            tr.appendChild(td);
            tbody.appendChild(tr);
        });
    });
}

function registrarAsistencia(tipo, alumno){
    const materia = document.querySelector("#materias").value;

    fetch(api + "/asistencias",{
        method:"POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({tipo, alumno, materia})
    })
    .then(res=>res.json())
    .then(msg=> alert(msg.msg));
}

