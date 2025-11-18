/*
async function llamarApi(puntoFinal,metodo,body){
    let opciones = {
        method: metodo,
        headers: {"Content-Type":"application/json"}
        }
        let res = await fetch("http://localhost:7000/api/"+puntoFinal,opciones);
        let data = res.json();
        return data;
        }
        */
    const url = "http://localhost:7000/api/cursos";
    cargarLista()
       
 function cargarLista(){

    let cursos = url
    let tbody = document.querySelector("tbody");
    tbody.innerHTML= '';
    for (let alumno of cursos) {
        let tr = document.createElement('tr');
        let aid = document.createElement('td');
        let nombre = document.createElement('td');
        let apellido = document.createElement('td');
        let {id,nombres ,apellidos } = alumno;
        aid.textContent=id;
        nombre.textContent = nombres;
        apellido.textContent = apellidos;
        tr.append(aid, nombre , apellido);
        const btns = ['P','A','T','AP','RA'];
        let td = document.createElement('td');
        for(let text of btns) {
            let button = document.createElement('button');
            button.textContent = text;
            button.onclick = handleClick;
            td.append(button);
        }
        tr.append(td);
        tbody.append(tr);

    }
}


 function cargarCursos() {
    let cursos = url
    fetch(cursos)
    .then(res => res.json())
    .then(data => {
        console.log(data);
        const select = document.querySelector('#cursos');
        select.innerHTML = '';
        for (let curso of cursos) {
            const option = document.createElement('option');
            const {anio,division,esp} = curso;
            option.value = curso.id;
            option.textContent = anio + esp + division;
            select.append(option); 
        }
    })
    .catch(err => alert (err.stack));
}

cargarCursos();

function cargarMaterias(e) {
    const cursoId = e.target.value;
    fetch('http://localhost:7000/api/materias/' + cursoId)
    .then(res => res.json())
    .then(data => {
        const select = document.querySelector ('#materias');
        select.innerHTML = '';
        for(let materia of data) {
            const option = document.createElement('option');
            option.textContent = materia.nombre;
            option.value = materia.id;
            select.append(option);
        }
    })
}

function handleClick(event) {
    let row = event.target.parentElement.parentElement;
    let idAlumno = row.children[0].textContent;
    let select = document.querySelector('#materias');
    let idMateria = select.value;
    let datos = {
        tipo: event.target.textContent,
        alumno:idAlumno,
        materia : idMateria
    };
    const options = {
        method:'POST',
        body: JSON.stringify(datos),
        headers :{'Content-Type': 'application/json' }

    };
    fetch('http://localhost:7000/api/asistencias')
    .then(res => res.json())
    .then(data => alert(data))
    .catch(err => alert(err.stack));
}
