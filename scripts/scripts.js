/**
 * Created by fmbv on 05/05/2017.
 */
let param;
$(document).ready(function () {
    $("#accion").prepend($("<img>").attr("id", "imgAccion")
                                    .attr("src", "./img/new.png")
                                    .attr("title", "Añadir Tarea")); //añadir imagen para nueva tarea

    $("#accion").on("click", function () { //añadir funcionalidad en el onclick al div para rellenar nueva tarea
        $("#accion").hide();    //ocultar div nueva tarea
        $("#formulario").show();    //mostrar el formulario
        $("#hdaccion").val("insertar"); //rellenar input oculto con el valor insertar
        vaciarForm();     //limpiar el formulario por si tiene dados de una accion anterior
        act_desc(false);    //activar los campos del formulario para poder cumplimentarlos.
    });

    $("#btnCancelar").on("click", function () { //añadir funcionalidad al botón cancelar
        $("#formulario").hide();    //ocultar el formulario
        $("#accion").show();        //mostrar el div que permite agregar nueva tarea
        $("#hdaccion").val("");       //vaciar el input oculto
    });

    $("#btnGuardar").on("click", function () {  //añadir funcoinalidad en el onclick al boton guardar
        $("input, textArea").removeClass("invalidDescativo"); //quitar la clase de los input y textAreas
    });

    $("#frmCuerpo").on("submit", guardar);  //cuando se envia el formulario se llama a la funcion guardar
    recargar();  //cargar los datos obtenidos de la base de datos
    pestañas(0); //iniciar en la primera pestaña
    $("#sltEstado").on("change", function () { //Permite cambiar de pestaña cuando cambio el valor combobox
       // console.log($("#sltEstado option:selected").index());
        if ($("#sltEstado option:selected").index() != 0) { //cuando seleccionamos la opcion distinta a la primera cambia de pestaña
            pestañas($("#sltEstado option:selected").index() - 1); //mostrar la informacion de la pestaña seleccionada.
        }
    });


});


/**
 * Permite cambiar de pestaña y mostrar la informacion que hay
 * bajo cada una de ellas
 * @param activa Integer con el valor de la pestaña a mostrar
 */
function pestañas(activa) {
    $("#tabs").tabs();  //Creación de las pestañas usando la api JQueryUi
    $("#tabs").tabs("option", "active", activa);  //posicionar la pestaña
    if (activa < 0) {   //cuando la opcion seleccionada en el combo es 0 simulamos el boton cancelar
        $("#btnCancelar").trigger('click');
    }
}

/**
 * Permite guardar los registros en la base de datos
 * @param evt Evento capturado
 */
function guardar(evt) {
    $("input, textArea").removeClass("invalidDescativo"); //quitar la clase que inactiva los input
    evt.preventDefault();       //evitar el envio y recarga de la pagina
    param = {                   //parametros que se van a pasar en la llamada a  Ajax. Recogemos los valores de los input y textArea
        'id': $("#id").val(),
        'titulo': $("#titulo").val(),
        'cuerpo': $("#cuerpo").val(),
        'fecha': $("#dtFecha").val(),
        'estado': $("#sltEstado").val(),
        'accion': $("#hdaccion").val()
    };

    // console.log(param.titulo);
    callAjax("controlador.php", showTb, param); //Llamada a la funcion de Ajax.

    setTimeout(function () {
        recargar();         //mostrar los cambios producidos.
    }, 1000); //retraso de un segundo porque en ocasiones recarga antes de insertar y no ven los cambios

    vaciarForm();  //limpiar el formulario de datos

}

/**
 * Permite hacer la llamada a Ajax pera recoger los cambios y
 * mostrarlos en pantalla
 */
function recargar() {
    callAjax("controlador.php", function (result) { //recoger los datos de tareas pendientes
        showTb(result, "#tbPendiente")
    }, {'estado': 'pendiente'});
    callAjax("controlador.php", function (result) { //recoger los datos de tareas en progreso
        showTb(result, "#tbProgreso")
    }, {'estado': 'progreso'});
    callAjax("controlador.php", function (result) { //recoger los datos de tareas completas
        showTb(result, "#tbCompleta")
    }, {'estado': 'completa'});
}

/**
 * Mostrar en pantalla los datos recogidos de Ajax
 * @param result  Datos JSON obtenidos de la llamada a Ajax
 * @param id    String con identificador de la tabla a mostrar
 */
function showTb(result, id) {
  //  console.log(result[0].id);
  //  console.log(result.length);
    let clase;
    switch (id) {
        case '#tbPendiente' :
            clase = 'pendiente';
            break;
        case '#tbProgreso' :
            clase = 'proceso';
            break;
        case '#tbCompleta' :
            clase = 'completa';
            break;
    }
    $(id + " th").addClass(clase);  //añadir una clase a la cabecera de la tabla
    $(id + " tbody").html("");      //limpiar el cuerpo de la tabla
    if (result.length>0) {
        for (let row of result) {       //recorrer todos los elementos de JSON recibido
            $(id).append($("<tr>")      //añadir un TR
                    .append($("<td>").text(row.id))       //añadir TDs con los datos recogidos en objeto JSON
                    .append($("<td>").text(row.titulo))
                    .append($("<td>").text(row.cuerpo))
                    .append($("<td>").text(row.fecha))
                    .append($("<td>").text(row.estado))

                    //añadir al final las imagenes con su funcionalidad
                    .append($("<td>").append($("<img>").attr("id", "v" + row.id).attr("src", "./img/view.png").attr("title", "ver").addClass("icono")
                            .click(function (evt) { //cuando se pulse sobre la imagen
                                // console.log(evt.target.id);
                                ver(evt.target.id); //mostrar los datos en el formulario
                            })
                        )
                            .append($("<img>").attr("id", "e" + row.id).attr("src", "./img/edit.png").attr("title", "editar").addClass("icono"))
                            .click(function (evt) { //cuando se pulse sobre la imagen
                                //  console.log(evt.target.id);
                                ver(evt.target.id); //mostrar los datos en el formulario
                            })
                            .append($("<img>").attr("id", "d" + row.id).attr("src", "./img/trush.png").attr("title", "borrar").addClass("icono")
                                .click(function (evt) { //cuando se pulse sobre la imagen
                                    // console.log(evt.target.id);
                                    borrar(evt.target.id, row.estado); //borrar los datos
                                    //$("#btnCancelar").trigger('click');
                                })
                            )
                    )
            );
        }
    }else{
        $(id).append($("<tr>").append($("<td colspan='6'>").text("No hay datos que mostrar")
            .css({"text-align":"center","height":"70px","font-weight":"800"})))
    }
}

/**
 * Borrar los datos de la base de datos
 * @param id    Integer con identificador del elemento a borrar de la base de datos
 * @param estado    String con el estado de la tarea
 */
function borrar(id, estado) {
    // console.log(this);
    param = {
        'id': id.substring(1),
        'accion': 'del',
        'estado': estado
    }
    callAjax("controlador.php", showTb, param);
    recargar();
}

/**
 * Mostrar, en el formulario, los datos seleccionados del listado
 * @param id Integer con el identificador del registro
 */
function ver(id) {
    let ident, titulo, fecha , estado, cuerpo;
    param = {
        'id': id.substring(1),
        'accion': 'ver'
    }
    if (id.substring(0, 1) == "v") { //cuando es visualizar
        $("#btnGuardar").hide();    //ocultar boton guardar
        act_desc(true);             //desactivar campos del formulario
    } else {
        $("#btnGuardar").show();            //cuando es modificar
        $("#hdaccion").val("actualizar");   //actualizamos el valor del campo oculto
        act_desc(false);                    //activar campos del formulario
    }


    if (id.substring(0, 1) != "d") {  //Cuando no estamos borrando mantenemos el formulario visible
        $("#formulario").show();
        $("#accion").hide();
    } else {                        //Cuando borramos ocultamos el formulario si esta visible
        $("#formulario").hide();
        $("#accion").show();
    }

    // callAjax("controlador.php", rellenarForm, param); //llamada para comletar el formulario por medio de acceso a datos
                                                        //dejamos de usarlo para optimizar recursos

    //completar el formulario recogiendo los valores de los td sin acceso a consulta a bd (evitamos una llamada la BD)
    ident =$("#"+id).parents("tr").find("td").eq(0).html();
    titulo =$("#"+id).parents("tr").find("td").eq(1).html();
    fecha =$("#"+id).parents("tr").find("td").eq(3).html();
    estado =$("#"+id).parents("tr").find("td").eq(4).html();
    cuerpo =$("#"+id).parents("tr").find("td").eq(2).html();
    $("#id").val(ident);
    $("#cuerpo").val(cuerpo);
    $("#titulo").val(titulo);
    $("#dtFecha").val(fecha);
    $("#sltEstado").val(estado);
}

/**
 * Permite activar o desactivar los campos del formulario
 * @param modo  Boolean
 */
function act_desc(modo) {
    //console.log(modo);
    if (modo) { //si es true
        $("input, textArea").addClass("inactivo");
    } else {
        $("input, textArea").removeClass("inactivo");
    }

    $("input").attr("readonly", modo);      //poner el estado del input en el modo indicado por parametro
    $("textArea").attr("readonly", modo);   //poner el estado del textArea en el modo indicado por parametro
    $("select").attr("disabled", modo);     //poner el estado del select en el modo indicado por parametro
   // console.log($("input").attr("readonly"));
}


/**
 * Funcion para limpiar el formulario
 * y dejar los campos vacios
 */
function vaciarForm() {
    //$("#btnCancelar").trigger("click");
    $("#id").val("");
    $("#cuerpo").val("");
    $("#titulo").val("");
    $("#dtFecha").val("");
    $("input, textArea").addClass("invalidDescativo");
    $("#sltEstado").val("").change();  //seleccionar el valor vacio
    $("#titulo").focus();   //poner el focus en el campo titulo
}


/**
 * FUNCION QUE NO SE ESTA USANDO PARA EVITAR UNA LLAMADA INECESARIA A LA BD.
 * EN PRINCIPIO SE EMPEZO A USAR PERO ENTENDEMOS QUE SIN ESTA LLAMADA OPTIMIZAMOS
 * EL TIEMPO DE RESPUESTA.
 * Cumplimentar los datos del formulario con los datos
 * recogidos despues de hacer una consulta
 * @param result JSON con los datos
 */
function rellenarForm(result) {
    //   console.log(result);
    result.forEach(function (indice) { //recorrer todos los indices del objeto result
        // console.log("indice "+indice+" " + indice.cuerpo + " " + Object.keys(indice));
        Object.keys(indice).forEach(function(clave){    //recorrer todos los keys
            //  console.log(indice[i]);
            $("#"+clave).val(indice[clave]);    //asignar dinamicamente a cada campo su valor
        })
    });

    /*  Otra alternativa a rellenar los input
     for (let row of result) {  //recorrer todas las filas del array que en este caso es siempre 1
     $("#id").val(row.id);
     $("#cuerpo").val(row.cuerpo);
     $("#titulo").val(row.titulo);
     $("#dtFecha").val(row.fecha);
     $("#sltEstado").val(row.estado);
     }*/

}