/**
 * @author DGPJ 20130902
 */
var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 );
var id,id_interval;
var vertical;
var esquema;
var geojsonTubos;

function indicativo(num){
	if(num.length<10){
		num='031'+num;
	}
	return num;
}

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
	$("#num_forms").html(0);
	localStorage.num_forms = 0;
	tx.executeSql('select vertical,esquema from p_verticales order by vertical', [], ConsultaItemsCarga,errorCB);
}
// RESPUESTA DE LA CONSULTA LAS VERTICALES EN EL MOVIL
function ConsultaItemsCarga(tx, results) {
	var len = results.rows.length;	//console.log(len);
	if(len == 0){
		alerta("Persei","Debe descargar la configuracíon del servidor","Ok","descargar.html");
	}else{
		for (j = 0; j < len; j++){
			var sql = 'select distinct num_medidor,ctacto,direccion,nombre1,nombre2,apellido1,apellido2,telefono,uso,min,max,r.id_envio '+
			' from '+results.rows.item(j).esquema+'usuario_estadisticas e '+
			'	left join '+results.rows.item(j).esquema+'t_rtas_formulario r on (e.num_medidor = r.respuesta and r.id_item =  "2") '+
			'order by r.id_envio,order_lectura';
					console.log(sql);
			tx.executeSql(sql, [], ConsultaItemsCargaAsignResp,errorCB);
	   	}
	}
}
function ConsultaItemsCargaAsignResp(tx, resultsV) {
	var lon = resultsV.rows.length;	console.log(lon);
	if(lon > 0) $("#items").html('');
	for (i = 0; i < lon; i++){
		var num_medidor = resultsV.rows.item(i).num_medidor;	console.log(num_medidor);
		var id_enviOld = resultsV.rows.item(i).id_envio;
		var ctacto = resultsV.rows.item(i).ctacto;
		var direccion = resultsV.rows.item(i).direccion;
		var nombre1 = resultsV.rows.item(i).nombre1;
		var apellido1 = resultsV.rows.item(i).apellido1;
		var telefono = resultsV.rows.item(i).telefono;
		var min = resultsV.rows.item(i).min;
		var max = resultsV.rows.item(i).max;
		var uso = resultsV.rows.item(i).uso;
	
		var htmlTitulo="";
		var estilo="primary";
		var idUsuario=num_medidor+'|'+min+'|'+max+'|'+direccion;
		if(id_enviOld!=null){
			htmlTitulo = ' - ('+id_enviOld+')';
			estilo="success";
			idUsuario="";
		}else{ //SI ES AUTOMATICO INGRESA DE UNA
			if(localStorage.siguiente == "SI"){	//console.log("PUM!!!");
				localStorage.siguiente = "";
				localStorage.lc_med = num_medidor;
			    localStorage.lc_min = min;
			    localStorage.lc_max = max;
			    localStorage.lc_dir = direccion;
				setTimeout(function(){ window.location = "formulario.html"; }, 70);
			}
		}

		$("#items").append('<div class="panel panel-'+estilo+'" id="'+idUsuario+'">'+
			'<div class="panel-heading" style="font-size: 16px;">Medidor: '+num_medidor+htmlTitulo+'</div>'+
			    '<div class="panel-body" style="font-size: 12px;">'+
					'<ul class="list-group">'+
						'Dirección:&nbsp;<label>'+direccion+'</label>&nbsp;'+
/*						'Cuenta:&nbsp;<label>'+ctacto+'</label>&nbsp;'+
						'Nombre:&nbsp;<label>'+nombre1+' '+apellido1+'</label>&nbsp;'+
						'Tel.:&nbsp;<a href="tel:'+indicativo(telefono)+'">'+telefono+'</a>'+ */
						'Uso:&nbsp;<label>'+uso+'</label>&nbsp;'+
					'</ul>'+
			    '</div>'+
			'</div>'
		);
		$('div[id*='+num_medidor+']').click(function(e){
			var mId = $(this).attr('id');	//console.log(mId);
		    var n=mId.split("|");			//console.log(n[0]);	console.log(n[1]);	console.log(n[2]);
		    localStorage.lc_med = n[0];
		    localStorage.lc_min = n[1];
		    localStorage.lc_max = n[2];
		    localStorage.lc_dir = n[3];

		    setTimeout(function(){ window.location = "formulario.html"; }, 70);
		});

		$("#refNotificacion").hide();	
   	}
}

$(document).ready(function(){
	$("#notificacion").hide();
	// CARGAR Listado de usuarios de lectura
	db.transaction(ConsultaItems); 
});
