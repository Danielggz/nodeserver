var express = require('express'); //LIBRERÍA EXPRESS
var bodyParser = require('body-parser')
var fs = require('fs');
var mysql = require('mysql'); //LIBRERÍA MYSQL
var app = express(); 

// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(jsonParser);
app.use(urlencodedParser);

//<------CONECTAR CON BASE DE DATOS MYSQL--------> 

// NPM INSTALL MYSQL --SAVE (GUARDAR MYSQL EN PACKAGE.JSON)

//CONECTAR CON BASE DE DATOS
var connection = mysql.createConnection({
   host: 'localhost',
   user: 'master',
   password: 'abc123.',
   database: 'tareasdb',
   port: 3306 //Puerto por defecto
});
connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log('Conexion correcta. Conectado como master');
   }
});

//ARRAY GLOBAL DE TAREAS
var listaTareas = [];
//INICIO EXPRESS
app.use(express.static('www/tareas'));


//MÉTODO PARA COMPROBAR SI EXISTE EL FICHERO Y CARGARLO
fileExists("./www/tareas/BD/almacen.json", function(err, exists){
  if(err) {
    console.log(err);
  }
  if(exists) {
    var data = fs.readFileSync("./www/tareas/BD/almacen.json", 'UTF-8');
    listaTareas=JSON.parse(data);
  } 
});


//<-----------------------------TRATAMIENTO DE DATOS EN FICHERO DE TEXTO--------------------------------->



//EJECUTA LA LISTA DE TAREAS EN EL INDEX MEDIANTE EL FICHERO DE TEXTO
/*
app.get('/', function(req, res){
  
  fs.readFile('./www/tareas/indextareas.html', 'utf-8', function(err, text){
    text = text.replace("[sustituir]", cargarTareas(listaTareas) );

    res.send(text);
  });
  
  
});
*/


//MÉTODO GET PARA ELIMINAR TAREAS DEL FICHERO DE TEXTO
app.get('/eliminar/:id?', function(req, res){


  listaTareas.splice(req.query.id,1);
  actualizarFich();
  console.log('tarea eliminada');
  res.redirect('/');

});


//EDITAR EN FICHERO DE TEXTO MÉTODO GET
app.get('/editar/:id?', function(req, res){

var id = req.query.id;

fs.readFile('./www/tareas/indextareas.html', 'utf-8', function(err, text){
  var fila = cargarTareas(listaTareas);

  text = text.replace("[sustituir]", fila);
  text = text.replace('placeholder="Nombre de usuario"','value=' + listaTareas[id].nombre);
  text = text.replace('placeholder="nombre de la tarea"', 'value=' + listaTareas[id].tarea);
  text = text.replace('value="id_edit"', 'value=' + id);
  text = text.replace('action="/"', 'value="/editar"');

  res.send(text);
  });

});

//EDITAR MÉTODO POST EN FICHERO
app.post('/editar', function(req, res){

  var nombre = req.body.nombre || '';
  var tarea = req.body.tarea || '';
  var id = req.body.id || '';

  console.log('MOVIDA ID:' + id);

  for(var i=0; i<listaTareas.length;i++)
  {
    console.log(i);
    if(i == id)
    {
      listaTareas[i].nombre = nombre;
      listaTareas[i].tarea = tarea;

      console.log('MOVIDA nuevo dato: ' + listaTareas[i].nombre);
      console.log('nuevo dato: ' + listaTareas[i].tarea);
    }
  }

  
  //console.log(arraytareas);

  console.log('Guardando datos..');

  

  actualizarFich();
  
  console.log('nueva tarea guardada');

  res.redirect('/');

});

//AGREGAR DATOS A LA LISTA DEL FICHERO
app.post('/', function(req, res) {

  console.log('Peticion recibida');
  console.log("");
  console.log("");
  console.log("<----------------------NUEVOS DATOS RECIBIDOS------------------------->");
  console.log("");
  console.log("");

  var nombre = req.body.nombre || '';
  var tarea = req.body.tarea || '';

  var nomb = nombre;
  var tar = tarea;
  

  listaTareas.push({nombre:nomb, tarea:tar});
  
  console.log('nuevo dato: ' + nombre);
  console.log('nuevo dato: ' + tarea);
  //console.log(arraytareas);

  console.log("");
  console.log("");
  console.log("<--------------------GUARDAR DATOS EN FICHERO----------------------->");
  console.log("");
  console.log("");
  console.log('Guardando datos en fichero..');

  actualizarFich();

  console.log('nueva tarea guardada en fichero');

  //INTRODUCIR DATOS EN MYSQL TAREASDB
  console.log("");
  console.log("");
  console.log("<-------------------------BASE DE DATOS---------------------------->");
  console.log("DATOS ACTUALIZADOS");
  console.log("");
  console.log("");
  console.log('Actualizando base de datos TAREASDB..');

  actualizarBD(nombre, tarea);
  
  res.redirect('/');
  
});

//<----------------------------------------------------------------------------------------------------------->



//<-----------------------------------TRATAMIENTO DE DATOS EN BASE DE DATOS----------------------------------->


//EJECUTA LA LISTA DE TAREAS EN EL INDEX MEDIANTE LA BASE DE DATOS

app.get("/", function(req, res){
  connection.query("SELECT * FROM tareas", function(error, result)
  {
    if(error)
    {
       throw error;
    }
    else
    {
      var registros = cargarTareasBD(result);
      
      fs.readFile('./www/tareas/indextareas.html', 'utf-8', function(err, text){
        text = text.replace("[sustituir]", registros);
    
        res.send(text);
      });
    }
  });
 
});


//ELIMINAR TAREAS CON BASE DE DATOS

app.get("/eliminarBD/:id?", function(req, res){

  var id = req.query.id;

  connection.query("DELETE FROM tareas WHERE id=" + id, function(error){
    if(error)
    {
      throw error;
    }
    else
    {
      console.log("tarea con id= " + id + " eliminada en BD");
      res.redirect('/');
    }
  });
});


//EDITAR TAREAS CON BASE DE DATOS
//GET
app.get("/editarBD/:id?", function(req, res)
{
  var id = req.query.id;

  connection.query("SELECT * FROM tareas", function(error, result)
  {
    if(error)
    {
       throw error;
    }
    else
    {
      var registros = cargarTareasBD(result);
      
      fs.readFile('./www/tareas/indextareas.html', 'utf-8', function(err, text)
      {
        var fila = registros;
        for(var i=0; i<result.length; i++)
        {
          if(result[i].id==id)
          {
            text = text.replace("[sustituir]", fila);
            text = text.replace('placeholder="Nombre de usuario"','value="' + result[i].nombre + '"');
            text = text.replace('placeholder="nombre de la tarea"', 'value="' + result[i].tarea + '"');
            text = text.replace('value="id_edit"', 'value=' + result[i].id);
            text = text.replace('action="/"', 'value="/editarBD"');
          }
        }
        
      
        res.send(text);
      });
    }
  });
  
});

//POST
app.post("/editarBD", function(req, res)
{
  var nombre = req.body.nombre || '';
  var tarea = req.body.tarea || '';
  var id = req.body.id || '';

  connection.query("SELECT * FROM tareas", function(error, result)
  {
    if(error)
    {
       throw error;
    }
    else
    {
      for(var i=0; i<result.length;i++)
      {
        if(result[i].id == id)
        {
          result[i].nombre = nombre;
          result[i].tarea = tarea;

          console.log('MOVIDA nuevo dato: ' + result[i].nombre);
          console.log('nuevo dato: ' + result[i].tarea);

          console.log('Guardando datos en BD..');
          editarFilaBD(result[i].nombre, result[i].tarea, result[i].id);
          console.log('Datos editados correctamente.');
          console.log(result[i]);

        }
      }
      
    }
  });

  
  
 

  res.redirect('/');
});

//<------------------------------------------------------------------------------------------------------------->


//<---------------------------------------------MÉTODOS--------------------------------------------------------->


//CARGAR LA LISTA DE TAREAS EN EL INDEX
function cargarTareas(tareas) {

  var lista = "";
  for (var indice in tareas) {
    
    var fila = "<tr> <td>[id]</td> <td>[nombre]</td> <td>[tarea]</td> <td><a href='/eliminar?id= " + indice + "' class='button'> Eliminar tarea </a> </button></td> <td><a href='/editar?id=" + indice + "'> Editar tarea </a> </td></tr>";

      fila = fila.replace("[id]", indice);
      //fila = fila.split("[id]").join(indice);
      fila = fila.replace("[nombre]", tareas[indice].nombre);
      fila = fila.replace("[tarea]", tareas[indice].tarea);

      lista += fila;
  }

  
  return lista;
}

//CARGAR LA LISTA DE TAREAS PERO UTILIZANDO LA BASE DE DATOS
function cargarTareasBD(arrayDB) 
{

  var lista = "";
  for (var indice in arrayDB) {
    
    var fila = "<tr> <td>[id]</td> <td>[nombre]</td> <td>[tarea]</td> <td><a href='/eliminarBD?id= " + arrayDB[indice].id + "' class='button'> Eliminar tarea </a> </button></td> <td><a href='/editarBD?id=" + arrayDB[indice].id + "'> Editar tarea </a> </td></tr>";

      fila = fila.replace("[id]", arrayDB[indice].id);
      //fila = fila.split("[id]").join(indice);
      fila = fila.replace("[nombre]", arrayDB[indice].nombre);
      fila = fila.replace("[tarea]", arrayDB[indice].tarea);

      lista += fila;
  }

  
  return lista;
}


//DEVOLVER DATOS EN BD
/*
function DataBD()
{
  connection.query("SELECT * FROM tareas", function(error, result)
  {
    if(error)
    {
       throw error;
    }
    else
    {
      var registros = cargarTareasBD(result);
      return registros;
    }
 });
}
*/

//actualizar FICHERO DE DATOS
function actualizarFich()
{
  fs.writeFile('./www/tareas/BD/almacen.json', JSON.stringify(listaTareas), function(err){
    if (err) 
    {
      return console.log(err);
    }
  });
}

//AGREGAR DATOS A BASE DE DATOS
function actualizarBD(newnom, newtar)
{
  
  var nombre = newnom;
  var tarea = newtar;

  console.log("nombre: " + nombre);
  console.log("tarea: " + tarea);
  var insertBD = connection.query("INSERT INTO tareas VALUES(null, '"+ nombre +"','"+ tarea +"')");

  console.log("");
  console.log("NUEVO DATO EN BD: ");

  var selectDB = connection.query("SELECT nombre, tarea from tareas where nombre='" + nombre + "' and tarea='" + tarea + "'", function(err, result)
  {
    if (err) throw err;
    console.log(result);
  });


}

function editarFilaBD(newnom, newtar, newid)
{
  var nombre = newnom;
  var tarea = newtar;
  var id = newid;

  var updateBD = connection.query("UPDATE tareas SET nombre='" + nombre + "', tarea='" + tarea + "' WHERE ID=" + newid);
}

//<---------------------------------------------------------------------------------------------------------------->

//COMPROBAR SI FICHERO EXISTE
function fileExists(file, cb) {
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return cb(null, false);
      } else { // en caso de otro error
        return cb(err);
      }
    }
    // devolvemos el resultado de `isFile`.
    return cb(null, stats.isFile());
  });
}





//<-------------INICIAR SERVIDOR----------------->

var server = app.listen(3000, function () {
  console.log('Servidor web iniciado');
});

//FIN CONEXIÓN CON MYSQL
//connection.end();