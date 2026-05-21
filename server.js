// 1. Importar el framework Express
const express = require('express');
const fs = require("fs")

function leerbd() {
    let textJson = fs.readFileSync("bd.json", "utf8")
    estudiantes = JSON.parse(textJson).estudiantes
    return estudiantes
}
function guardarbd() {
    let obj = JSON.stringify({ estudiantes: estudiantes, }, null, 2)
    fs.writeFileSync("bd.json", obj)
}

function existeAlumno(ci){
    return estudiantes.some(alumno => alumno.ci == ci)
}

function buscarAlumno(ci){
    return estudiantes.find(alumno => alumno.ci == ci);
}

function eliminarAlumno(ci)
    {
        let alumno = estudiantes.findIndex(alumno=>alumno.ci===ci);
        if (alumno !== -1) {
            estudiantes.splice(alumno, 1);
        }
    }

// 2. Instanciar la aplicación (Crear el servidor)
const app = express();
let estudiantes = [

]
// 3. Configurar Middleware para servir archivos estáticos (Fase 1 de la arquitectura)
// Esto le dice al servidor: "Si alguien pide un archivo HTML o CSS, búscalo en la carpeta 'public'"
app.use(express.static('public'));

// Middleware para leer los datos que vienen de un formulario HTML (req.body)
app.use(express.urlencoded({ extended: true }));
// 4. Crear una Ruta Básica (Método GET)

// 5. Ejemplo de SSR Profesional usando un Motor de Plantillas (EJS)
// Pre-configuración necesaria:
app.set('view engine', 'ejs');

// --- NUEVO: FORMULARIO ---

// 1. Ruta para MOSTRAR el formulario HTML
app.get('/nuevo-alumno', (req, res) => {
    res.render('formulario');
});

// 2. Ruta (Endpoint POST) para RECIBIR y guardar los datos
app.post('/guardar-alumno', (req, res) => {
    leerbd(); // Leemos la base de datos actual
    
    // Extraemos los datos que el usuario escribió en el formulario
    let ci = Number(req.body.ci);
    let nombre = req.body.nombre;
    let apellido = req.body.apellido;
    let nota1 = 0;
    let nota2 = 0;
    let nota3 = 0;
    let nota4 = 0;
    
    if(existeAlumno(ci)){
        res.render('falloRegistro',  { ci: ci, nombre: nombre, apellido:apellido });
    }
    else{
    // Guardamos en el arreglo y luego en el archivo JSON
    estudiantes.push({ ci: ci, nombre: nombre, apellido:apellido, nota1:nota1, nota2:nota2, nota3:nota3, nota4:nota4 });
    guardarbd();
    
    // Renderizamos la nueva vista de éxito
    res.render('exito', { ci: ci, nombre: nombre, apellido:apellido });
    }
});

app.get('/modificar-alumno', (req, res) => {
    res.render('formularioModificar');
});

app.post('/cambiar-alumno', (req, res) => {
    leerbd(); // Leemos la base de datos actual
    
    // Extraemos los datos que el usuario escribió en el formulario
    let ci = Number(req.body.ci);
    let nombre = req.body.nombre;
    let apellido = req.body.apellido;
    let nota1 = Number(req.body.nota1);
    let nota2 = Number(req.body.nota2);
    let nota3 = Number(req.body.nota3);
    let nota4 = Number(req.body.nota4);
    
    if(!existeAlumno(ci)){
        res.render('falloModificar',  { ci: ci, nombre: nombre, apellido:apellido });
    }
    else{
    let alumno = buscarAlumno(ci);
    // Guardamos en el arreglo y luego en el archivo JSON
    alumno.ci = ci;
    alumno.nombre = nombre;
    alumno.apellido = apellido;
    alumno.nota1 = nota1;
    alumno.nota2 = nota2;
    alumno.nota3 = nota3
    alumno.nota4 = nota4;
    guardarbd();
    
    // Renderizamos la nueva vista de éxito
    res.render('exito', { ci: ci, nombre: nombre, apellido:apellido });
    }
});

app.get('/eliminar-alumno', (req, res) => {
    res.render('formularioEliminar');
});

app.get('/modificar-alumno', (req, res) => {
    res.render('formularioModificar');
});

app.post('/borrar-alumno', (req, res) => {
    leerbd(); // Leemos la base de datos actual
    
    // Extraemos los datos que el usuario escribió en el formulario
    let ci = Number(req.body.ci);

    if(!existeAlumno(ci)){
        res.render('falloEliminar',  { ci: ci});
    }
    else{
    let alumno = buscarAlumno(ci);
    // Guardamos en el arreglo y luego en el archivo JSON
    let cedula = alumno.ci;
    let nombre = alumno.nombre;
    let apellido= alumno.apellido;

    eliminarAlumno(ci);
    guardarbd();
    
    // Renderizamos la nueva vista de éxito
    res.render('exitoEliminar', { ci: ci, nombre: nombre, apellido:apellido });
    }
});

app.get('/lista-alumnos', (req, res) => {
    let alumnos = leerbd();
    res.render('listaGeneral', { estudiantes: alumnos });
});

// 6. Encender el servidor y ponerlo a escuchar en un puerto de red
const PUERTO = 3000;
app.listen(PUERTO, () => {
    console.log(`Servidor de la UPTT corriendo en http://localhost:${PUERTO}`);
});
