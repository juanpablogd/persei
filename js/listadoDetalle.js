/**
 * @author DGPJ 201803
 */
var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 );
var id,id_interval;
var vertical;
var esquema;

//CONTROL DE ERRORES
function errorCB(err) {
	if (err.code == undefined && err.message == undefined){
		alerta("Persei","Descargue formularios pendientes!","Ok","descargar.html");
	}else
	{
		alerta("Persei","Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message,"Ok","principal.html");
	}
}

//CONSULTA LAS VERTICALES EN EL MOVIL
function ConsultaItems(tx) {
	$("#notificacion").show();
	$("#listado_cargue").show();
	var sql18 = 'SELECT descripcion_item,respuesta FROM '+localStorage.esquema+'t_rtas_formulario rt'+
			' inner join '+localStorage.esquema+'p_items_formulario rs on rt.id_item = rs.id_item '+
			' where id_envio = "'+localStorage.idEnvio+'" order by CAST(rt.rowid as integer)';	//console.log(sql18);
	tx.executeSql(sql18, [], 
	   	function(tx,resulta2){
			var lon = resulta2.rows.length;								//alert(lon);
			for (l = 0; l < lon; l++){
				var respuesta = resulta2.rows.item(l).respuesta;
				var descripcion_item = resulta2.rows.item(l).descripcion_item;
				$("#registro_tabla").append('<tr><td>'+descripcion_item+'</td><td>'+respuesta+'</td></tr>');
			}
		},null);

}


$(document).ready(function(){
	$("#notificacion").hide();
	$("#btn_no").click(function( event ) {
 		window.location = "listado.html";
	});
	$("#btn_si").click(function( event ) {
        bootbox.hideAll();
		bootbox.dialog({
		  message: " ¿Está seguro que ELIMINAR este registro?",
		  title: "<span class=\"glyphicon glyphicon-warning-sign rojo \"></span> Persei - ELiminar",
		  buttons: {
		    success: {
		      label: "Si",
		      className: "btn-danger",
		      callback: function() {
		      		$("#btn_si").hide();
		      		$("#btn_no").hide();
					db.transaction(function (tx) { tx.executeSql('DELETE FROM '+ localStorage.esquema + 't_video where id_envio = "'+localStorage.idEnvio+'"')});
					db.transaction(function (tx) {tx.executeSql('DELETE FROM '+ localStorage.esquema + 't_fotos where id_envio = "'+localStorage.idEnvio+'"')});
					db.transaction(function (tx) {tx.executeSql('DELETE FROM '+ localStorage.esquema + 't_rtas_formulario where id_envio = "'+localStorage.idEnvio+'"')});
					db.transaction(function (tx) {tx.executeSql('DELETE FROM '+ localStorage.esquema + 't_asignacion_lugar where id_envio = "'+localStorage.idEnvio+'"')});
					setTimeout(function(){ window.location = "listado.html"; }, 800);
		      }
		    },
		    main: {
		      label: "No",
		      className: "btn-primary",
		      callback: function() {
		        
		      }
		    }
		  }
		});
	});
	// CARGAR MENU DE LA BASE DE DATOS
	db.transaction(ConsultaItems); 
});