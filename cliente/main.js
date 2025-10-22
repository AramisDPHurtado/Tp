const url = ''
cargarAlumnos()
function cargarAlumnos(){

    fetch(url)
    .then(res => res.json())
    .then(data =>{
    let body = document.querySelector("tbody");
    tbody.innerHTML= '';
     for (let student of data) {
    let tr = document.createElement('tr');

    }})
}

