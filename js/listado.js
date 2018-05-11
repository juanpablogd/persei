/**
 * @author DGPJ 20130902
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
function ConsultaItemsD(tx) {	
	tx.executeSql('select vertical,esquema from p_verticales order by vertical', [], ConsultaItemsDCarga,errorCB);
}
// RESPUESTA DE LA CONSULTA LAS VERTICALES EN EL MOVIL
function ConsultaItemsDCarga(tx, results) {
	var len = results.rows.length;
	if(len == 0){
		alerta("Persei","No hay Formularios asignados","Ok","descargar.html");
	}else{
		$("#items").html('');	
		for (i = 0; i < len; i++){
			var s = 'select distinct c.id,c.categoria,id_envio,"'+results.rows.item(i).esquema+'" as esquema,"'+results.rows.item(i).vertical+'" as vertical,foto_calidad,foto_tamano,geolocaliza_obligatorio,foto_obligatorio,video_obligatorio,geometria_obligatorio,tipo_geometria,foto_max from '+results.rows.item(i).esquema+'p_categorias c inner join '+results.rows.item(i).esquema+'t_asignacion_lugar a on c.id = a.id_categoria order by CAST(a.rowid as integer) desc';
			console.log(s);
			tx.executeSql(s, [], ConsultaItemsDCargaAsignResp,errorCB);
	   	}
	}
}

function ConsultaItemsDCargaAsignResp(tx, resultsV) {
	var lon = resultsV.rows.length;								//alert(lon);
	for (i = 0; i < lon; i++){
		var id_categoria = resultsV.rows.item(i).id;
		var categoria = resultsV.rows.item(i).categoria;
		var foto_calidad = resultsV.rows.item(i).foto_calidad;
		var foto_tamano = resultsV.rows.item(i).foto_tamano;
		var idEnvio = resultsV.rows.item(i).id_envio;
		var fields = idEnvio.split('-');
		var fecha = fields[0]+'-'+fields[1]+'-'+fields[2]+' '+fields[3].toString().replace(/_/g, ':');
		$("#items").append('<a href="#" class="list-group-item" id ="'+id_categoria+'@'+resultsV.rows.item(i).esquema+'@'+foto_calidad+'@'+foto_tamano+'@'+resultsV.rows.item(i).geolocaliza_obligatorio+'@'+resultsV.rows.item(i).foto_obligatorio+'@'+resultsV.rows.item(i).video_obligatorio+'@'+resultsV.rows.item(i).geometria_obligatorio+'@'+resultsV.rows.item(i).tipo_geometria+'@'+resultsV.rows.item(i).foto_max+'@'+idEnvio+'"><span class="glyphicon glyphicon-list-alt"></span>'+categoria+'-'+resultsV.rows.item(i).vertical+'<span class="badge">'+fecha+'</span></a>');

		//(0)idcategoria@(1)esquema@(2)foto_calidad@(3)foto_tamaño@(4)geObligatorio@(5)fotObligatorio@(6)videObligatorio@(7)GeometriaObligatorio@(8)tipo_Geometria	//Ej: 2@inventarios@100@1280@S@S@N@N@POLIGONO
   	}
   	

	//NO PUEDE IR ANTES  DEL REFRESH - Selecciona los elementos luego de ser cargados en tiempo de ejecucion    	
   	$("a[href*='#']").click(function() {
   		var str=$(this).attr("id");				//console.log($(this).text());
		var n=str.split("@");
	    localStorage.id_categoria = n[0];		//alert(localStorage.id_categoria);
	    localStorage.esquema = n[1];
	    localStorage.foto_calidad = n[2];
	    localStorage.foto_tamano = n[3];
	    localStorage.geolocaliza_obligatorio = n[4];
	    localStorage.foto_obligatorio = n[5];
	    localStorage.video_obligatorio = n[6];
	    localStorage.geometria_obligatorio = n[7];
	    localStorage.tipo_geometria = n[8];				console.log(localStorage.tipo_geometria);
	    localStorage.foto_max = n[9];					//console.log(localStorage.tipo_geometria);
	    localStorage.idEnvio = n[10];					console.log(localStorage.idEnvio);
	    
	    localStorage.nombre_form = $(this).text();
		localStorage.asignado = "f"; 		//False (No asignado)
		localStorage.feature="";
		localStorage.geometria="";
		//Si es formulario de TUBO
		setTimeout(function(){ window.location = "listadoDetalle.html"; }, 50);	

	});
	if(lon>0) $("#notificacion").hide();
	else $("#notificacion").show();
}

$(document).ready(function(){
	// CARGAR MENU DE LA BASE DE DATOS
	db.transaction(ConsultaItemsD); 
	
});