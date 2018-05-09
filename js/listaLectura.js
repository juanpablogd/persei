/**
 * @author DGPJ 20130902
 */
var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 );
var id,id_interval;
var vertical;
var esquema;
var geojsonTubos;

//CONTROL DE ERRORES
function errorCB(err) {
	if (err.code == undefined && err.message == undefined){
		alerta("GeoData","Descargue formularios pendientes!","Ok","descargar.html");
	}else
	{
		alerta("GeoData","Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message,"Ok","principal.html");
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
		alerta("GeoData","Debe descargar la configuracíon del servidor","Ok","descargar.html");
	}else{
		for (j = 0; j < len; j++){
			var sql = 'select distinct respuesta as num_medidor,fecha_asignacion,"'+results.rows.item(j).esquema+'" as esquema,id_categoria from '+results.rows.item(j).esquema+'t_asignacion_lugar a'+
				' inner join '+results.rows.item(j).esquema+'t_rtas_formulario r on (a.id_envio = r.id_envio and (r.id_item = "2"))'+
				' where (id_categoria = "1") order by a.rowid desc'; console.log(sql);
			tx.executeSql(sql, [], ConsultaItemsCargaAsignResp,errorCB);
	   	}
	}
}

function ConsultaItemsCargaAsignResp(tx, resultsV) {
	var lon = resultsV.rows.length;	//console.log(lon);
	if(lon > 0) $("#items").html('');
	for (i = 0; i < lon; i++){
		var idsig_pozo = resultsV.rows.item(i).idsig_pozo;		console.log(idsig_pozo);
		var fields = resultsV.rows.item(i).fecha_asignacion.split('-');
		var esquema = resultsV.rows.item(i).esquema;
		var id_categoriaEle = resultsV.rows.item(i).id_categoria;	
		var tipoElemento = "Pozo ";
		if(id_categoriaEle == "3") tipoElemento = "Sumidero "
		$("#items").append('<div class="panel panel-primary">'+
			    '<div class="panel-heading" style="font-size: 17px;">'+tipoElemento+' '+idsig_pozo+' - ('+fields[0]+'-'+fields[1]+'-'+fields[2]+' '+fields[3].toString().replace(/_/g, ':')+')</div>'+
			    '<div class="panel-body">'+
					'<ul id="'+idsig_pozo+'" class="list-group">'+
						'<li id="'+idsig_pozo+'|nuevo" class="list-group-item list-group-item-info" style="font-size: 15px;"><span class="badge">+</span>Adicionar Nuevo</li>'+
					'</ul>'+
			    '</div>'+
			'</div>'
		);
		$('ul[id*='+idsig_pozo+'] li').click(function(e){
			var mId = $(this).attr('id');	console.log(mId);
		    var n=mId.split("|");	console.log(n[0]);	console.log(n[1]);	console.log(n[2]);
		    localStorage.pz = n[0];
		    localStorage.li = n[1];
		    localStorage.pzli_id_envio = n[2];
		    localStorage.pzli_io = n[3];

		    setTimeout(function(){ window.location = "formulario.html"; }, 70);	
		});
		var sql18 = 'SELECT distinct "'+esquema+'" as esquema,"'+idsig_pozo+'" as idsig_pozo,cod_red_lo,r.id_envio,posicion FROM '+esquema+'pz_li pt'+
		' left join '+esquema+'t_rtas_formulario r on (pt.cod_red_lo = r.respuesta)'+
		' where cod_pozo = "'+idsig_pozo+'" order by posicion';	console.log(sql18);
		tx.executeSql(sql18, [], 
		(function(esquema){
		   return function(tx,resulta2){
		   		var lar = resulta2.rows.length;	console.log(lar);
		   		for (l = 0; l < lar; l++){
		   			var idEnvio = resulta2.rows.item(l).id_envio;
		   			var idsig_tubo = resulta2.rows.item(l).cod_red_lo;	//console.log(idsig_tubo);
		   			var idsigPozo = resulta2.rows.item(l).idsig_pozo;
		   			var io = resulta2.rows.item(l).posicion;
		   			var estilo = "danger";
		   			var fecha="";
		   			var flujo = "Entra T.";
		   			if(io == "0") flujo = "Sale T.";
		   			if(idEnvio != null){
		   				estilo = "success";
		   				var fields = idEnvio.split('-');
		   				fecha = fields[0]+'-'+fields[1]+'-'+fields[2]+' '+fields[3].toString().replace(/_/g, ':');
		   			}else{
		   				var dat = findGeojson("ids",idsig_tubo,geojsonTubos);	//console.log(dat.length);
		   				if(dat.length>0){	//Si lo encuentra
		   					fecha = arMateriales[dat[0].properties.mat]+'-'+arDiametros[dat[0].properties.dia];
		   				}
		   			}
		   			if(idsig_tubo != ""){	//Si tiene TUBO
			   			$("#"+idsigPozo).append(
			   				'<li id = "'+idsigPozo+'|'+idsig_tubo+'|'+idEnvio+'|'+io+'" class="list-group-item list-group-item-'+estilo+'" style="font-size: 18px;"><span class="badge">'+fecha+'</span>'+flujo+': '+idsig_tubo+'</li>'
			   			);
		   			}
		   			if((l+1)==lar){ console.log("Add Nuevo");
						$('ul[id*='+idsigPozo+'] li').click(function(e){
							var mId = $(this).attr('id');
						    console.log(mId);
						    var n=mId.split("|");	console.log(n[0]);	console.log(n[1]);	console.log(n[2]);
						    localStorage.pz = n[0];
						    localStorage.li = n[1];
						    localStorage.pzli_id_envio = n[2];
						    localStorage.pzli_io = n[3];

						    setTimeout(function(){ window.location = "formulario.html"; }, 70);	
						});
		   			}
		   		}	//console.log("Sale For");
		   };
		})(esquema),null);

		$("#refNotificacion").hide();
   	}
}

$(document).ready(function(){
	$("#notificacion").hide();
	// CARGAR Listado de usuarios de lectura
	db.transaction(ConsultaItems); 
});
