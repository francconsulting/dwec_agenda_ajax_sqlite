/**
 * Created by fmbv on 05/05/2017.
 */
/**
 * Llamada al metodo ajax para
 * hacer las peticiones y recuperar los datos
 * @param url   String con la url que se va a consultar
 * @param doneFuncion   String con la funcion callback a la que se llama despues hacer la peticion correcta
 * @param parametros    String con los datos que seran enviados al servidor
 * @param tipo          Metodo por el que seran enviado los datos (GET o POST)
 * @param tipoDato      Tipo de datos que seran recibidos del servidor (xml, html, json, text, script, jsonp)
 */
function callAjax(url,doneFuncion,parametros,tipo,tipoDato) {
    //console.log(parametros);
    parametros = parametros || "";  //si no hay parametros se pone por defecto una cadena vacia
    tipo = tipo || "POST";          //si no se indica el tipo se pone por defecto POST
    tipoDato = tipoDato || "json";  //si no se indica el tipo de datos por defecto se pone json
    $.ajax({
        url: url,
        type: tipo,
        dataType: tipoDato,
        data: parametros,       //parametros que se le pasan al hacer la peticion
        async: true, //[bool que indica sincronía/asincronia]
        beforeSend: function (result) {         //antes de enviar la peticion
            $("#procesando").html("Procesando, espere por favor...");       //mostramos un mensaje al usuario
            $("#procesando").clearQueue().fadeIn();     //mostramos el mensaje con efecto y eliminando de la cola los elementos no procesados aun
        },
        /*success:  function (result) {
           // $("#procesando").fadeOut(1000);     //cuando se realiza la peticion se oculta el mensaje con un efecto
        }*/
    })
        .done(function(result){  //cuando se ejecuta la peticion de forma correcta
            doneFuncion(result) //hacemos la llamada a la funcion calback pasada por parametros para utilizar los datos recuperados
            $("#procesando").fadeOut(1000, function(){
                $("#mensaje").addClass("ok").text("proceso realizado con exito").clearQueue().fadeIn("fast").fadeOut(3000); //mostrar mensaje de ok
            });

        })
        .fail(function(jqXHR){  //en caso de que la peticion sea erronea
            $("#mensaje").addClass("error").text("Se ha producido un error:" + jqXHR.status+" -> "+smgErr); //si hay algun error en la llamada muestra un mensaje
        })

       /* .always(function(jqXHR){  //completada la peticion
            $("#mensaje").addClass("error").html("Se ha producido un error:" + jqXHR.status+" -> "+smgErr); //si hay algun error en la llamada muestra un mensaje
        })*/
    ;
}



