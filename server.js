// 1. Importar el framework Express
const { error } = require('console');
const express = require('express');
const fs = require("fs");
const { type } = require('os');
const methodOverride = require('method-override');

class Alumno {
    ci;
    nombre;
    apellido;
    nota1;
    nota2;
    nota3;
    nota4;

    constructor(ci, nombre, apellido, nota1, nota2, nota3, nota4){
        this.ci = ci;
        this.nombre = nombre;
        this.apellido = apellido;
        this.nota1 = nota1;
        this.nota2 = nota2;
        this.nota3 = nota3;
        this.nota4 = nota4;
    }
}

class Estudiantes {
    
    listaEstudiantes = [];
    JsonName = "";

    constructor(JsonName){
        this.JsonName = JsonName;
        if (fs.existsSync(JsonName)) {
            const dataBase = fs.readFileSync(JsonName, "utf8");
            const data = JSON.parse(dataBase).listaEstudiantes;
            this.listaEstudiantes = data.map(a => new Alumno(a.ci, a.nombre, a.apellido, a.nota1, a.nota2, a.nota3, a.nota4));
        }else{
            const dataBase = JSON.stringify({listaEstudiantes: []}, null, 2);
            fs.writeFileSync(JsonName, dataBase);
        }
    }


    existeAlumno(ci){
    return this.listaEstudiantes.some(alumno => alumno.ci == ci)
    }

    buscarAlumno(ci){
    return this.listaEstudiantes.find(alumno => alumno.ci == ci);
    }

    eliminarAlumno(ci)
    {
        let alumno = this.listaEstudiantes.findIndex(alumno=>alumno.ci===ci);
        if (alumno !== -1) {
            this.listaEstudiantes.splice(alumno, 1);
        }
    }

    registrarAlumno(ci, nombre, apellido){
        const nuevoAlumno = new Alumno(ci, nombre, apellido, 0, 0, 0, 0);
        this.listaEstudiantes.push(nuevoAlumno);
    }

    cerrarBD(){
        //guarda los datos de listaEstudiantes en esta clase al JSON
        const dataBase = JSON.stringify({listaEstudiantes: this.listaEstudiantes }, null, 2);
        fs.writeFileSync(this.JsonName, dataBase);
    }

}

// 2. Instanciar la aplicación (Crear el servidor)
const app = express();

// 3. Configurar Middleware para servir archivos estáticos (Fase 1 de la arquitectura)
// Esto le dice al servidor: "Si alguien pide un archivo HTML o CSS, búscalo en la carpeta 'public'"
app.use(express.static('public'));

// Middleware para leer los datos que vienen de un formulario HTML (req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Pre-configuración necesaria:
app.set('view engine', 'ejs');

// --- NUEVO: FORMULARIO ---

// 1. Ruta para MOSTRAR el formulario HTML
app.get('/registro', (req, res) => {
    res.render('formNuevo');
});

// 2. Ruta (Endpoint POST) para RECIBIR y guardar los datos
app.post('/guardarAlumno', (req, res) => {
    let BDEstudiantes = new Estudiantes("bd.json");
    
    let ci = req.body.ci;

    if(!ci || isNaN(Number(ci))){
        res.render('falloRegistro',  { ci: ci, nombre: "nombre", apellido: "apellido" });
    }
    else{
        ci = Number(ci);
        let nombre = req.body.nombre;
        let apellido = req.body.apellido;
        let nota1 = 0;
        let nota2 = 0;
        let nota3 = 0;
        let nota4 = 0; 
        
        if(BDEstudiantes.existeAlumno(ci)){
            res.render('fallo',  { error: "El Estudiante ya Existe en la Base de Datos" });
        }
        else{
            if (String(ci).length <= 9 && String(ci).length >= 7){
                BDEstudiantes.registrarAlumno(ci, nombre, apellido);
                res.render('exito', { exito: "Éxto al Registrar el Estudiante" });
            }
            else{
                res.render('fallo',  { error: "Cedúla Ingresada Inválida" });
            }
        }
    }
    
    BDEstudiantes.cerrarBD();
});


app.post('/busquedaAlumno', (req, res) => {
    let BDEstudiantes = new Estudiantes("bd.json");
    
    let ci = req.body.ci;

    if(!ci || isNaN(Number(ci))){
        res.render('fallo',  { error: "Cédula Ingresada Inválida" });
    }
    else{
        if(!BDEstudiantes.existeAlumno(ci)){
            res.render('fallo',  { error: "El Estudiante no Existe en la Base de Datos" });
        }
        else{
            let i = BDEstudiantes.buscarAlumno(ci);

            let nombre = i.nombre;
            let apellido = i.apellido;
            let nota1 = i.nota1;
            let nota2 = i.nota2;
            let nota3 = i.nota3;
            let nota4 = i.nota4;
        
            res.render('formModificar', { ci:ci, nombre: nombre, apellido: apellido, nota1: nota1, nota2: nota2, nota3: nota3, nota4: nota4})
        }

    }
});

app.put('/procesarAlumno', (req, res) => {
    let BDEstudiantes = new Estudiantes("bd.json");
    
    let ci = req.body.ci;
    let i = BDEstudiantes.buscarAlumno(ci);

    let nombre = req.body.nombre;
    let apellido = req.body.apellido;
    let nota1 = req.body.nota1;
    let nota2 = req.body.nota2;
    let nota3 = req.body.nota3;
    let nota4 = req.body.nota4; 

    if(!nota1 || isNaN(Number(nota1)) || !nota2 || isNaN(Number(nota2)) || !nota3 || isNaN(Number(nota3)) || !nota3 || isNaN(Number(nota3))){
        res.render('fallo',  { error: "Nota Ingresada Invalida" });
    }
    else{
        nota1 = Number(nota1);
        nota2 = Number(nota2);
        nota3 = Number(nota3);
        nota4 = Number(nota4);

        if(String(nota1).length <= 20 && String(nota1).length >= 0 || String(nota2).length <= 20 && String(nota2).length >= 0 || String(nota3).length <= 20 && String(nota3).length >= 0 || String(nota4).length <= 20 && String(nota4).length >= 0){
                i.ci = ci;
                i.nombre = nombre;
                i.apellido = apellido;
                i.nota1 = nota1;
                i.nota2 = nota2;
                i.nota3 = nota3
                i.nota4 = nota4;

                BDEstudiantes.cerrarBD();
                res.render('exito', { exito: "Éxto al Actualizar el Estudiante" });
        }
        else{
            BDEstudiantes.cerrarBD();
            res.render('fallo',  { error: "Nota Ingresada Invalida" });
        }
    }
    BDEstudiantes.cerrarBD();
});

app.delete('/procesarAlumno', (req, res) => {
    let BDEstudiantes = new Estudiantes("bd.json");

    const accion = req.body.accion;
    let ci = req.body.ci
    //console.log(ci)
    if(!ci || isNaN(Number(ci))){
        res.render('fallo',  { error: "Cédula Ingresada Inválida" });
    }
    else if(!BDEstudiantes.existeAlumno(ci)){
            res.render('fallo',  { error: "El Estudiante no Existe en la Base de Datos" });
        }
    else{
            ci = Number(ci);
            BDEstudiantes.eliminarAlumno(ci);
            BDEstudiantes.cerrarBD();
            res.render('exito', { exito: "Éxto al Eliminar el Estudiante" });
    }
    BDEstudiantes.cerrarBD();
});

app.get('/lista', (req, res) => {
    res.render('listaEstudiantes'); 
});

app.get('/api/estudiantes', (req, res) => {
    let BDEstudiantes = new Estudiantes("bd.json");
    res.json(BDEstudiantes.listaEstudiantes);
});

app.delete('/eliminarAlumno', (req, res) => {
    let BDEstudiantes = new Estudiantes("bd.json");
    let ci = Number(req.body.ci);
    BDEstudiantes.eliminarAlumno(ci);
    BDEstudiantes.cerrarBD();
    
    res.json({ ok: true, mensaje: "Alumno eliminado" });
});

// 6. Encender el servidor y ponerlo a escuchar en un puerto de red
const PUERTO = 3000;
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
