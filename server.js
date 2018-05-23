var express = require('express'); //LIBRERÍA EXPRESS
var bodyParser = require('body-parser')
var fs = require('fs');
var mysql = require('mysql'); //LIBRERÍA MYSQL
var app = express(); 


// NPM INSTALL MYSQL --SAVE (GUARDAR MYSQL EN PACKAGE.JSON)

//<------CONECTAR CON BASE DE DATOS MYSQL--------> 
connectBD('master', 'abc123.');

app.post('/login', function(req, res){
  //COMPROBAR EN BASE DE DATOS SI EXISTEN
});



// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(jsonParser);
app.use(urlencodedParser);


//AGREGAR TAREAS CON POST

app.post('/', function(req, res) {

  console.log('Peticion recibida');
  console.log("");
  console.log("");
  console.log("<----------------------NUEVOS DATOS RECIBIDOS------------------------->");
  console.log("");
  console.log("");

  var nombre = req.body.nombre || '';
  var tarea = req.body.tarea || '';

  console.log('nuevo dato: ' + nombre);
  console.log('nuevo dato: ' + tarea);

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
//EJECUTA LA LISTA DE TAREAS EN EL INDEX MEDIANTE LA BASE DE DATOS

app.get("/", function(req, res){
  fs.readFile('./www/tareas/indextareas.html', 'utf-8', function(err, text){

    res.send(text);
  });
});

app.get("/login", function(req, res){
  connection.query("SELECT * FROM tareas", function(error, result)
  {
    if(error)
    {
       throw error;
    }
    else
    {
      var registros = cargarTareasBD(result);
      
      fs.readFile('./www/tareas/webtareas.html', 'utf-8', function(err, text){
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
      
      fs.readFile('./www/tareas/webtareas.html', 'utf-8', function(err, text)
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

//INICIO EXPRESS
app.use(express.static('www/tareas'));

//<---------------------------------------------MÉTODOS--------------------------------------------------------->



//CONECTAR CON BASE DE DATOS

function connectBD(usuario, pass)
{
  var connection = mysql.createConnection({
    host: 'localhost',
    user: usuario,
    password: pass,
    database: 'tareasdb',
    port: 3306 //Puerto por defecto
  });
  connection.connect(function(error){
    if(error){
       throw error;
    }else{
       console.log('Conexion correcta. Conectado como' + usuario);
    }
  });
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

//EDITAR FILAS EN BASE DE DATOS
function editarFilaBD(newnom, newtar, newid)
{
  var nombre = newnom;
  var tarea = newtar;
  var id = newid;

  var updateBD = connection.query("UPDATE tareas SET nombre='" + nombre + "', tarea='" + tarea + "' WHERE ID=" + newid);
}

//<---------------------------------------------------------------------------------------------------------------->



//<-------------INICIAR SERVIDOR----------------->

var server = app.listen(3000, function () {
  console.log('Servidor web iniciado');
});