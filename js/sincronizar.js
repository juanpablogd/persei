/**
 * @author juan.garzon 2013-JUN-20
 * @Mod juan.garzon 2013-JUL-20		
 */
var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 );
var datos_pendientes;
var ttal_fotos;
var ttal_videos;
var ttal_formularios;
var ttal_respuestas;
var refreshIntervalId;

function errorCB_items(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>No hay Items para sincronizar.<br>");
	}else
	{
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);		
	}
}
function errorCB_Fotos(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>Error al buscar las fotografias<br>");
	}else
	{ 
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);
	}
	
}
function errorCB_Videos(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>Error al buscar los Videos<br>");
	}else
	{ 
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);
	}
	
}
function errorCB_Asignacion(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>Error al buscar los cuestionarios<br>");
	}else
	{ 
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);		
	}
}
function errorCB_Respuestas(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>Error al buscar las Respuestas<br>");
	}else
	{ 
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);		
	}
}

function ConsultaSincronizar(tx) {
	tx.executeSql('SELECT esquema FROM p_verticales order by esquema asc', [], ConsultaSincronizarCarga,errorCB_items);
}
function ConsultaSincronizarCarga(tx, results) {
	var ttal_ver = results.rows.length;	 //alert(len);
	for (cv = 0; cv < ttal_ver; cv++){
		var esquema = results.rows.item(cv).esquema;
		   tx.executeSql('SELECT "'+esquema+'" as esquema,id,id_feature,feature,id_encuestador,id_categoria,estado,id_usuario_asign,fecha_asignacion,fecha_ejecucion,latitud_envio,longitud_envio,exactitud,id_envio,geotabla,tipo_ingreso FROM '+esquema+'t_asignacion_lugar where estado = "C"', [], 
		   (function(esquema){
		       return function(tx,results){
		           ConsultaSincronizarAsignacion(tx,results,esquema);
		       };
		   })(esquema),errorCB_Asignacion);
   };

}


function ConsultaSincronizarAsignacion(tx, results, esquema) {
	var lon = results.rows.length;									//alert(lon);//$("#resultado").before("<br>Cuestionarios encontrados: "+len+".<br>");
	if(lon==0){
		tx.executeSql('SELECT "'+esquema+'" as esquema,id_asignacion,id_item,respuesta,id_envio FROM '+esquema+'t_rtas_formulario', [],
			   (function(esquema){
			       return function(tx,results){
			           ConsultaSincronizarRespuestas(tx,results,esquema);
			       };
			   })(esquema),errorCB_Respuestas);
	}else{
		for (i = 0; i < lon; i++){
			var parametros = new Object();
			var cod_envio = results.rows.item(i).id_envio;
			parametros['esquema'] = results.rows.item(i).esquema;
			parametros['tabla'] = 't_asignacion_lugar';
			parametros['id'] = results.rows.item(i).id;
			parametros['id_feature'] = results.rows.item(i).id_feature;
			parametros['feature'] = results.rows.item(i).feature;
			parametros['id_encuestador'] = results.rows.item(i).id_encuestador;
			parametros['id_categoria'] = results.rows.item(i).id_categoria;
			parametros['estado'] = results.rows.item(i).estado;
			parametros['id_usuario_asign'] = results.rows.item(i).id_usuario_asign;
			parametros['fecha_asignacion'] = results.rows.item(i).fecha_asignacion;
			parametros['fecha_ejecucion'] = results.rows.item(i).fecha_ejecucion;
			parametros['latitud_envio'] = results.rows.item(i).latitud_envio;
			parametros['longitud_envio'] = results.rows.item(i).longitud_envio;
			parametros['exactitud'] = results.rows.item(i).exactitud;
			parametros['id_envio'] = cod_envio;
			parametros['geotabla'] = results.rows.item(i).geotabla;
			parametros['tipo_ingreso'] = results.rows.item(i).tipo_ingreso;
			$("#resultado").html("<br>Formularios restantes: "+(lon-i)+".<br>");
			$("#resultado").trigger("create");
			$.ajax({
				data:  parametros,
				url:'http://'+localStorage.url_servidor+'/SIG/servicios/acueducto/acu_sincronizar.php',
				type:  'post',
				async: false,
				success: function(responsea){	//alert(responsea);
					db.transaction(function(tx) {
						var respa = responsea.trim();  
						var n=respa.split("@"); 
			          	tx.executeSql('DELETE from '+n[0]+'t_asignacion_lugar where id_envio = "'+n[1]+'"');
			        });
				},
				error: function (error) {
					console.log("Error en los cuestionarios");
					$("#resultado").text('Error en ingreso de Cuestionarios');
					alerta("GeoMovil","Error en el envío, verifique conectividad!","Ok","#");
			    }
			});
			if((i+1) == lon) { //alert("continue a rtas");
				tx.executeSql('SELECT "'+esquema+'" as esquema,id_asignacion,id_item,respuesta,id_envio FROM '+esquema+'t_rtas_formulario', [],
				   (function(esquema){
				       return function(tx,results){
				           ConsultaSincronizarRespuestas(tx,results,esquema);
				       };
				   })(esquema),errorCB_Respuestas);
			}
	   	}
	}
}

function ConsultaSincronizarRespuestas(tx, results, esquema) {
	var lon = results.rows.length;									//alert("Respuestas: "+lon);  //$("#resultado").before("<br>Cuestionarios encontrados: "+len+".<br>");
	if(lon==0){
	   tx.executeSql('SELECT "'+esquema+'" as esquema,id,url_foto,id_envio FROM '+esquema+'t_fotos', [], 
	   (function(esquema){
	       return function(tx,results){
	           ConsultaSincronizarFotos(tx,results,esquema);
	       };
	   })(esquema),errorCB_Fotos);
	}else{
		for (i = 0; i < lon; i++){
			var parametros = new Object();
			var cod_envio = results.rows.item(i).id_envio;
			parametros['esquema'] = results.rows.item(i).esquema;
			parametros['tabla'] = 't_rtas_formulario';
			parametros['id_asignacion'] = results.rows.item(i).id_asignacion;
			parametros['id_item'] = results.rows.item(i).id_item;
			parametros['respuesta'] = results.rows.item(i).respuesta;
			parametros['id_envio'] = results.rows.item(i).id_envio;
			$("#resultado").html("<br>Datos restantes: "+(ttal_respuestas-i)+".<br>");
			$("#resultado").trigger("create");
			$.ajax({
				data:  parametros,
				url:'http://'+localStorage.url_servidor+'/SIG/servicios/acueducto/acu_sincronizar.php',
				type:  'post',
				async: false,		//timeout: 30000,
				success: function(responser){	//alert(responser);
					db.transaction(function(tx) {
						var respr = responser.trim();		//alert(resp);
						var res=respr.split("@");			
			          	tx.executeSql('DELETE from '+res[0]+'t_rtas_formulario where id_envio = "'+res[1]+'" and id_item = "'+res[2]+'"');
					});
				},
				error: function (error) {
					$("#estado_envio").text('Verifique Conectividad');
			    }
			});
			if((i+1) == lon) {
				   tx.executeSql('SELECT "'+esquema+'" as esquema,id,url_foto,id_envio FROM '+esquema+'t_fotos', [], 
				   (function(esquema){
				       return function(tx,results){
				           ConsultaSincronizarFotos(tx,results,esquema);
				       };
				   })(esquema),errorCB_Fotos);
			}
	   	}
	}
}

//SINCRONIZAR FOTOS Y VÏDEOS
function ConsultaSincronizarFotos(tx, results, esquema) {
	var len = results.rows.length;	//alert(len);
	if(len==0){
		salir(esquema);
	}else{	//SELECT "'+esquema+'" as esquema,id,url_foto,id_envio FROM '+esquema+'t_fotos

		for (i = 0; i < len; i++){
			var url_imagen = results.rows.item(i).url_foto;		console.log(url_imagen);
			var name = url_imagen.replace(/^.*[\\\/]/, '');		//console.log(name);
						
			var options_foto = new FileUploadOptions();
			options_foto.fileName=name;
			options_foto.chunkedMode = false;
			options_foto.headers = {Connection: "close"}; 
			options_foto.mimeType="image/jpeg";
				
				var params_foto = new Object();
				params_foto.esquema = results.rows.item(i).esquema; //alert("Esquema: "+results.rows.item(i).esquema);
				params_foto.cod_envio = results.rows.item(i).id_envio;
				params_foto.rowid = results.rows.item(i).id;
				params_foto.url_imagen = url_imagen;
				params_foto.consecutivo = i;

			options_foto.params = params_foto;
			
			function fileExists(url_imagen){
				console.log("File exist: "+url_imagen);
				//ENVIA EL FOTO	
				var ft = new FileTransfer();
				ft.onprogress = function(progressEvent) {
					if (progressEvent.lengthComputable) {
						var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
						$("#resultado").html("<br>Cargando: <strong>"+perc + "% </strong><br>"); 
					} 
					if(perc >= 99) $("#resultado").html('');
				};
				ft.upload(url_imagen,
					"http://"+localStorage.url_servidor+"/SIG/servicios/acueducto/acu_sincronizar_imagen.php",
					function(result) {  //$("#resultado").html("Response = " + result.response.toString());
						//RESPUESTA DEL SERVIDOR
						var respf = result.response.toString(); respf = respf.trim();	console.log("R servidor: "+respf);
						var n=respf.split("@");

						//Elimina archivo de la BD
						function eliminafotodb(tx) {	//console.log("Elimina archivo de la BD"); 
							  console.log('DELETE from '+n[0]+'t_fotos where id_envio = "'+n[1]+'" and id = "'+n[2]+'"');
							tx.executeSql('DELETE from '+n[0]+'t_fotos where id_envio = "'+n[1]+'" and id = "'+n[2]+'"');
							//tx.executeSql('DELETE from publicinventario_fotos where id_envio = "'+n[0]+'" and rowid = "'+n[1]+'"');
						}
						function sqlfallo(){}
						function pictureRemoved(){ console.log("Foto ELiminada Ok"); }
						function notRemoved(){ $("#resultado").html("<br> No se puede Eliminar el archivo, limpie el cache manualmente<br>"); }
						function no(error) { console.log(JSON.stringify(error)); }
						
						function eliminar(callback){
							db.transaction(eliminafotodb,sqlfallo,
								function ()  {	//CUANDO ELIMINA DE LA BASE DE DATOS, ELIMINA DEL DISPOSITIVO
									callback(n[3],n[4]);
								}
							);
							
						}
						//ELIMINA DE LA BASE DE DATOS y DEL DISPOSITIVO
						eliminar(eliminaFisico);
						
						// Elimina archivo FISICO
						function eliminaFisico(ruta,consecutivo)
						{	console.log("F(x) eliminaFisico("+ruta+")");	//console.log(LocalFileSystem.TEMPORARY);
							window.resolveLocalFileSystemURL(ruta, function(file) {
									file.remove(pictureRemoved, notRemoved);
								  }, no);	//console.log(len);
							if((parseInt(consecutivo)+1)==len){
								salir(esquema);
							}
						};
					},
					function(error) {
						$("#resultado").html('Error cargando archivo, verifique conectividad: ' +error.code);
						//alert("An error has occurred: source = " + error.source + error.code);
						//alert("An error has occurred: target = " + error.target); 
							//CONTINUA CON LOS NUEVOS ELEMENTOS REGISTRADOS EN EL SISTEMA
							//	if((i+1) == len) { //alert("continue a rtas");	salir();	}
					},options_foto
				);
			}
			function fileDoesNotExist(){
				console.log("file does not exist");
				if((i+1)==len){
					salir(esquema);
				}
			}
			//Verifica si hay archivo
			window.resolveLocalFileSystemURL(url_imagen, fileExists(url_imagen), fileDoesNotExist);
	   	}		
	}
}

function salir (esquema){
	db.transaction(function(tx) {
		tx.executeSql('SELECT esquema FROM p_verticales order by esquema desc limit 1', [],
						(function(esquema){
								       return function(tx,results){
								           SalirResp(tx,results,esquema);
								       };
								   })(esquema),errorCB_Respuestas);
	});
}

function SalirResp(tx, results, esquema) {
	var lon = results.rows.length; 					//alert(lon);
	var esquemaSql = results.rows.item(0).esquema; 	//alert(esquemaSql);
		
	if (esquemaSql ==esquema){
		$("#resultado").html('');							//alert('Cargue Exitoso');
		$("#btn_si").show();
		alerta("GeoMovil","Cargue de Información!","Ok","#");	//alerta("GeoMovil","Cargue exitoso","Ok","principal.html");
	}	
}

/*----------------LISTA INFORMACIÓN A CARGAR CUANDO INICIA EL APLICATIVO----------------*/

function Consulta(tx) {
	$("#registro_tabla").html("");
/*	$("#resultado").before('<br>Fotos Pendientes envío - '+results.rows.item(0).esquema+': '+ttal_fotos);
	$("#btn_si").show();
	$("#Lpregunta").html("Seguro que deseas cargar la Información?");*/
	tx.executeSql('SELECT esquema FROM p_verticales', [], ConsultaCarga,errorCB_items);
}
function ConsultaCarga(tx, results) {
	var len = results.rows.length;		
	//$("#resultado").before('Verticales encontradas :'+len);
	for (i = 0; i < len; i++){
		var esquema = results.rows.item(i).esquema;
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_fotos', [], ConsultaFotos,errorCB_Fotos);
		//tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_video', [], ConsultaVideos,errorCB_Videos);
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_asignacion_lugar where estado = "C"', [], ConsultaAsignacion,errorCB_Asignacion);
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_rtas_formulario ', [], ConsultaResp,errorCB_Asignacion);
   };
}

//CONSULTA DE FOTOS PENDIENTES PARA CARGAR
function ConsultaFotos(tx, results) {	//	console.log('Reg: '+results.rows.item(0).nreg);
	if(results.rows.item(0).nreg != 0){
		$("#listado_cargue").show();
		$("#registro_tabla").append('<tr><td>'+results.rows.item(0).esquema+' - Fotos</td><td>'+results.rows.item(0).nreg+'</td></tr>');
		$("#btn_si").show();
		$("#Lpregunta").html("<br>Seguro que deseas cargar la Información?");
	}
}

/*//CONSULTA DE VIDEOS PENDIENTES PARA CARGAR
function ConsultaVideos(tx, results) {
	if(results.rows.item(0).nreg > 0){
		$("#listado_cargue").show();
		$("#registro_tabla").append('<tr><td>'+results.rows.item(0).esquema+' - Videos</td><td>'+results.rows.item(0).nreg+'</td></tr>');
		$("#btn_si").show();
		$("#Lpregunta").html("<br>Seguro que deseas cargar la Información?");
	}
} */
//CONSULTA ASIGNACIÓN
function ConsultaAsignacion(tx, results) {
	if(results.rows.item(0).nreg > 0){
		$("#listado_cargue").show();
		$("#registro_tabla").append('<tr><td>'+results.rows.item(0).esquema+' - Encuestas</td><td>'+results.rows.item(0).nreg+'</td></tr>');
		$("#btn_si").show();
		$("#Lpregunta").html("<br>Seguro que deseas cargar la Información?");
	}
}
//CONSULTA ASIGNACIÓN
function ConsultaResp(tx, results) {
	if(results.rows.item(0).nreg > 0){
		$("#listado_cargue").show();
		$("#registro_tabla").append('<tr><td>'+results.rows.item(0).esquema+' - Respuestas</td><td>'+results.rows.item(0).nreg+'</td></tr>');
		$("#btn_si").show();
		$("#Lpregunta").html("<br>Seguro que deseas cargar la Información?");
	}
}


$(document).ready(function(){
	datos_pendientes=false;
	
	$("#btn_si").click(function(event) {
		
		$("#btn_si").hide();	//$("#btn_no").remove();
		$("#Lpregunta").remove();
		db.transaction(ConsultaSincronizar);
		
		 refreshIntervalId = setInterval(function(){
		 	console.log("Buscar pendientes");
		 	db.transaction(Consulta);
		}, 4*1000);
		
		//clearInterval(refreshIntervalId);
		
	});

	$("#btn_no").click(function( event ) {
 		window.location = "principal.html";
	});
	
	$("#btn_si").hide();
	db.transaction(Consulta);
	
	$("#num_forms").html(localStorage.num_forms);

	
});
