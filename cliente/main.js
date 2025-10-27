const url = ''
cargarLista()
function cargarLista(){

    fetch(url)
    .then(res => res.json())
    .then(data =>{
    let body = document.querySelector("tbody");
    tbody.innerHTML= '';
     for (let student of data) {
    let tr = document.createElement('tr');
    let aid = document.createElement('td');
    let nombre = document.createElement('td');
    let apellido = document.createElement('td');
    let {id,nombres ,apellidos } = alumno;
    aid.textContent=id;
    nombre.textContent = nombres;
    apellido.textContent = apellidos;
    tr.append(aid, nombre , apellido);
    let td = document.createElement('td');
    for(let text of btns) {
        let button = document.createElement('button');
        button.textContent = text;
        button.onclick =handleClick;
        td.append(button);
    }
    tr.append(td);
    tbody.append(tr);

    }})
}

