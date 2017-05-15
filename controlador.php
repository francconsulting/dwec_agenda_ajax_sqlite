<?php
/**
 * Created by PhpStorm.
 * User: fmbv
 * Date: 16/02/2017
 * Time: 19:55
 */

require_once("./src/Conn.class.php");   //include para la conexion a la base de datos

$conn = Conn::conex(); //Establecimiento de la conexion a la base de datos
//var_dump($conn);

//instruccion sql para crear la tabla
$ssql = ("CREATE TABLE tbTareas (
			 id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
			 titulo TEXT NOT NULL,
			 cuerpo TEXT NOT NULL,
			 fecha NUMERIC DEFAULT 1,
			 estado TEXT NOT NULL
				)");

$tabla = Conn::crearElementoBd($conn, $ssql); //ejecucion de la creacion de la tabla


if (isset($_POST['accion'])) {
    $accion = $_POST['accion'];


    //insertar datos en la tabla
    if ($accion == "insertar") {
        $parametros = [                         //parametros en un array con los valores a insertar
            'titulo' => $_POST['titulo'],
            'cuerpo' => $_POST['cuerpo'],
            'fecha'  => $_POST['fecha'],
            'estado' => $_POST['estado']
        ];

        $Rs = Conn::insert($conn, "tbTareas", $parametros);  //ejecucion de la instruccion insert
    }

    //actualizacion de datos
    if ($accion == "actualizar") {
        $parametros = [                         //parametros en un array con los valores a actualizar
            'titulo' => $_POST['titulo'],
            'cuerpo' => $_POST['cuerpo'],
            'fecha'  => $_POST['fecha'],
            'estado' => $_POST['estado']
        ];
        $filtro = ["id" => $_POST['id']];    //filtro en la instruccion sql para actualizar el registro coincidente con el ID
        $Rs = Conn::update($conn, "tbTareas", $parametros, $filtro); //ejecucion de la instrucccion update
    }


    //borrado de datos
    if ($accion == "del") {
        $filtro = ["id" => $_POST['id']];    //filtro en la instruccion sql para borrar el registro coincidente con el ID
        $Rs = Conn::delete($conn, "tbTareas", $filtro); //ejecucion de la instrucccion delete
    }
}

    //Instrucciones de seleccion
if (isset($_POST['accion']) && $accion == "ver") { //recuperacion de datos de un ID concreto
    $filtro = ["id" => $_POST['id']];    //parametros para condicion where del sql
    $ssql = "SELECT id, titulo, cuerpo, fecha, estado FROM tbTareas where id = :id";
    $Rs = Conn::select($conn, $ssql, $filtro); //ejecucion de consulta para recuperar el usuario
} else {
    $filtro = ["estado" => $_POST['estado']];    //parametro para la condicion del where del sql
    $ssql = "SELECT id, titulo, cuerpo, fecha, estado FROM tbTareas  where estado = :estado ";
    $Rs = Conn::select($conn, $ssql, $filtro);  //ejecucion de consulta para recuperar todos los registros con el mismo estado
}

//sleep(1);
header('Content-type: application/json');
print (json_encode($Rs->fetchAll(PDO::FETCH_ASSOC)));

$Rs = Conn::cerrar(); //liberar recursos de recorset
$conn = Conn::cerrar(); //cerrar conexion a bd
?>
