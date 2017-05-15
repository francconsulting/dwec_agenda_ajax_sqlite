<?php

/**
 * Created by PhpStorm.
 * User: fmbv
 * Date: 19/02/2017
 * Time: 13:57
 */
class Conn
{
   /* const HOST = "localhost";
    const USER = "root";
    const PASS = "";*/
    const DB ="tareas.db";
    //const DNS = "mysql:host=" . self::HOST . ";dbname=" . self::DB;


    /**
     * Conexion con la base de datos
     * @return null|PDO
     */
    public static function conex()
    {
        try {
            $conn = new PDO('sqlite:'.self::DB);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Can change to PDO::ERRMODE_SILENT
            $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); // For security!
          //  $conn->exec("insert into tareas ('sTarea','dtFin') values ('albert',20170501)");
        } catch (PDOException $e) {
            //$msgError= "Error = {$e->getCode()} <br/>mensaje = {$e->getMessage()}";
            // echo $msgError;
            $conn = null;

        }
        return $conn;
    }

    /**
     * Libera los recursos
     * @return null
     */
    public static function cerrar()
    {
        return null;
    }


    /**
     * Funcion para crear elemento en la base de datos
     * @param $conn conexion
     * @param $ssql instruncion sql a ejecutar
     * @return null
     */
    public static function crearElementoBd($conn, $ssql){
    try{
        $rst = $conn->prepare($ssql);
        $rst->execute();
    }catch (PDOException $e){
        $rst =null;
    //    die($msg = "<div class='msg error centrar'><strong>Se ha producido un error nº: </strong>{$e->getCode()} <br/> <strong>Descripción: </strong>{$e->getMessage()}</div>");
    }
    return $rst;
}

    /**
     * funcion para hacer el select
     * @param $conn Link de conexion
     * @param $ssql Instrucion sql a ejecutar
     * @param null $parametros condiciones del filtro
     * @param bool $asoc Si se usan parametros con sustitucion de nombre o con signos de ?
     *              cuando se usen consultas con ? debemos pasar el parametro $asoc como false
     * @return null o el objeto del recordset
     */
    public static function select($conn, $ssql, $parametros = null, $asoc = true)
    {
        $rst = $conn->prepare($ssql);
       // echo $ssql;
        if ($parametros) {
            $iCon = 1;
            foreach ($parametros as $k => $v) {
                if ($asoc) {
                    $rst->bindParam(":{$k}", $parametros[$k]); //para usar el parametro KEY ($k)
                } else {
                    $rst->bindParam($iCon, $parametros[$k]);
                    $iCon++;
                }
            }
        }

       $rst->execute();

       // if ($rst->rowCount()>0) {
            return $rst;
       // } else {
       //     return $rst = null;
       // }
    }


    /**
     * funcion para hacer el Insert
     * @param $conn Link de conexion
     * @param $tabla String con el nombre de la tabla donde insertar los valores
     * @param $parametros array con los campos y valores a insertar
     * @param bool $asoc Si se usan parametros con sustitucion de nombre o con signos de ?
     * @return null
     */
    public static function insert($conn, $tabla, $parametros, $asoc = true)
    {
        list($campos, $param) = call_user_func_array('self::prepararParam', array($parametros, $asoc));
        $ssql = "insert into {$tabla} (" . implode(',', $campos) . ") values ({$param})";
        // echo $ssql;
        try {
            $rst = $conn->prepare($ssql);
            $iCon = 1;
            foreach ($parametros as $k => $v) {
                if ($asoc) {
                    $rst->bindParam(":{$k}", $parametros[$k]); //para usar el parametro KEY ($k)
                } else {
                    $rst->bindParam($iCon, $parametros[$k]);
                    $iCon++;
                }
            }
            if ($rst->execute()) {
                // $msg = "Se han insertado " . $rst->rowCount() . " registros";
                // $rst = null; //liberar recursos
                $msg = null;
            }
        } catch (PDOException $e) {
            $rst = null;
            die($msg = "<strong>Se ha producido un error nº: </strong>{$e->getCode()} <br/> <strong>Descripción: </strong>{$e->getMessage()}");
        }
        return $rst;
    }


    /**
     * funcion para hacer el Borrado de registros
     * @param $conn Link de conexion
     * @param $tabla String con el nombre de la tabla donde insertar los valores
     * @param null $parametros array con los campos y valores  condiciones del filtro a borrar
     * @param bool $asoc Si se usan parametros con sustitucion de nombre o con signos de ?
     * @return null
     */
    public static function delete($conn, $tabla, $parametros = null, $asoc = true)
    {
        $ssql = "Delete from {$tabla} ";
        if ($parametros) {
            $ssql .= " where ";

            list($campos, $param) = call_user_func_array('self::prepararParam', array($parametros, $asoc));
            if (!$asoc) {
                $param = explode(",", $param);
            }


            for ($i = 0; $i < count($campos); $i++) {
                if (!$asoc) {
                    $ssql .= "{$campos[$i]} = {$param[$i]} and ";
                } else {
                    $ssql .= "{$campos[$i]} =  :$campos[$i] and ";
                }
            }
            $ssql = substr($ssql, 0, -4);
            //echo $ssql;
        }

        $iCon = 1;
        try {
            $rst = $conn->prepare($ssql);
            foreach ($parametros as $k => $v) {
                if ($asoc) {
                    $rst->bindParam(":{$k}", $parametros[$k]); //para usar el parametro KEY ($k)
                } else {
                    $rst->bindParam($iCon, $parametros[$k]);
                    $iCon++;
                }
            }
            if ($rst->execute()) {
                // $msg = "Se han borrado " . $rst->rowCount() . " registros";
                $msg = null;
            }
        } catch (PDOException $e) {
            $rst = null;
            die($msg = "<div class='msg error centrar'><strong>Se ha producido un error nº: </strong>{$e->getCode()} <br/> <strong>Descripción: </strong>{$e->getMessage()}</div>");
        }
        return $rst;
    }

    /**
     * funcion para hacer la Actualizacion de resitros
     * @param $conn Link de conexion
     * @param $tabla String con el nombre de la tabla donde insertar los valores
     * @param $parametros array con los campos y valores a actualizar
     * @param null $filtro array con la condiciones del filtro
     * @param bool $asoc Si se usan parametros con sustitucion de nombre o con signos de ?
     * @return null
     */
    public static function update($conn, $tabla, $parametros, $filtro = null, $asoc = true)
    {
        list($campos, $param) = call_user_func_array('self::prepararParam', array($parametros, $asoc));

        if (!$asoc) {
            $param = explode(",", $param);
        }

        $ssql = "Update {$tabla} Set ";
        for ($i = 0; $i < count($campos); $i++) {
            if (!$asoc) {
                $ssql .= "{$campos[$i]} = {$param[$i]},";
            } else {
                $ssql .= "{$campos[$i]} =  :$campos[$i],";
            }
        }
        $ssql = substr($ssql, 0, -1);
        if ($filtro) {
            list($filtroCamp, $filtroParam) = call_user_func_array('self::prepararParam', array($filtro, $asoc));
            if (!$asoc) {
                $filtroParam = explode(",", $filtroParam);
            }
            for ($i = 0; $i < count($filtroCamp); $i++) {
                if ($i == 0) {
                    $ssql .= " where ";
                }
                if (!$asoc) {
                    $ssql .= "{$filtroCamp[$i]} = {$filtroParam[$i]} and ";
                } else {
                    $ssql .= "{$filtroCamp[$i]} =  :$filtroCamp[$i]Filtro and ";
                }

            }
            $ssql = substr($ssql, 0, -4);
        }
        //echo $ssql;

        $iCon = 1;
        try {
            $rst = $conn->prepare($ssql);
            foreach ($parametros as $k => $v) {
                if ($asoc) {
                    $rst->bindParam(":{$k}", $parametros[$k]); //para usar el parametro KEY ($k)
                } else {
                    $rst->bindParam($iCon, $parametros[$k]);
                    $iCon++;
                }
            }
            foreach ($filtro as $k => $v) {
                if ($asoc) {
                    $rst->bindParam(":{$k}Filtro", $filtro[$k]); //para usar el parametro KEY ($k)
                } else {
                    $rst->bindParam($iCon, $filtro[$k]);
                    $iCon++;
                }
            }

            if ($rst->execute()) {
                //$msg = "Se han actualizado " . $rst->rowCount() . " registros";
                $msg = null;
            }
        } catch (PDOException $e) {
            $rst = null;
            die($msg = "<div class='msg error centrar'><strong>Se ha producido un error nº: </strong>{$e->getCode()} <br/> <strong>Descripción: </strong>{$e->getMessage()}</div>");
        }
        return $rst;
    }


    /**
     * Preparar los parametros para incrustarlos en el SQL
     * para poder insertar los valores en la BD
     * @param $array con los pares campos<>valor
     * @return array multidimensional con el nombre de los campos, valores y parametros
     */
    private static function prepararParam($array, $tipo = true)
    {
        $campos = array();
        // $datos = array();
        $parametros = "";
        foreach ($array as $key => $valor) {
            $campos[] = $key;
            //      $datos[]=$valor;
            if ($tipo) {
                $parametros .= ":{$key},";
            } else {
                $parametros .= "?,";
            }
        }
        $parametros = substr($parametros, 0, -1);
        return array($campos, $parametros);
    }

}

?>