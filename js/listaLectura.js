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
			var sql = '';
			var InputBuscar=sessionStorage.getItem("InputBuscar");
			var where=' ';
			if($("#SlctFilterOK").val()==1){
				var where='where r.id_envio is null ';
			}else if($("#SlctFilterOK").val()==2){
				var where='where r.id_envio != "" ';
			}else if($("#SlctFilterOK").val()==3){
				var where='where 1=1 ';
			}

			
			if(InputBuscar=== null){
				console.log("no existe");
			}else{
				where=where+ " and  num_medidor like '%"+InputBuscar+"%'  or direccion like '%"+InputBuscar+"%'   or ctacto like '%"+InputBuscar+"%'";	
				//console.log(InputBuscar);
				//console.log("existe");
			}
			if (localStorage.nombre_form.toLowerCase().indexOf("eaab") >= 0){
				sql = 'select distinct num_medidor,ctacto,direccion,nombre,telefono,uso,min,max,r.id_envio '+
					' from '+results.rows.item(j).esquema+'usuarios_ruta e '+
					'	left join '+results.rows.item(j).esquema+'t_rtas_formulario r on (e.num_medidor = r.respuesta and r.id_item =  "23") '+
					where+
					'order by r.id_envio,CAST(order_lectura as integer)';
			} else {
				sql = 'select distinct num_medidor,ctacto,direccion,nombre1,nombre2,apellido1,apellido2,telefono,uso,min,max,r.id_envio '+
					' from '+results.rows.item(j).esquema+'usuario_estadisticas e '+
					'	left join '+results.rows.item(j).esquema+'t_rtas_formulario r on (e.num_medidor = r.respuesta and r.id_item =  "23") '+
					where+
					'order by r.id_envio,CAST(order_lectura as integer)';
			} console.log(sql);
			tx.executeSql(sql, [], ConsultaItemsCargaAsignResp,errorCB);
	   	}
	}
}
function ConsultaItemsCargaAsignResp(tx, resultsV) {
	var lon = resultsV.rows.length;	console.log(lon);
	if(lon > 0) $("#items").html('');
	for (i = 0; i < lon; i++){
		var num_medidor = resultsV.rows.item(i).num_medidor;	//console.log(num_medidor);
		var id_enviOld = resultsV.rows.item(i).id_envio;
		var ctacto = resultsV.rows.item(i).ctacto;
		var direccion = resultsV.rows.item(i).direccion;
		var nombre1 = resultsV.rows.item(i).nombre1;
		if(nombre1 == undefined) nombre1 = resultsV.rows.item(i).nombre;	//console.log(nombre1);
		var apellido1 = resultsV.rows.item(i).apellido1;
		var telefono = resultsV.rows.item(i).telefono;
		var min = resultsV.rows.item(i).min;
		var max = resultsV.rows.item(i).max;
		var uso = resultsV.rows.item(i).uso;
	
		var htmlTitulo="";
		var htmlPrint="";
		var estilo="primary";
		var idUsuario=num_medidor+'|'+min+'|'+max+'|'+direccion;
		var add='';
		if(id_enviOld!=null){
			htmlTitulo = '<i id="'+id_enviOld+'|'+num_medidor+'" class="fa fa-close pull-right"></i>';
			htmlPrint = '<i id="p'+id_enviOld+'" class="fa fa-print pull-right" style="font-size:32px"></i>'
			estilo="success";
			idUsuario="";
			add='Existe Usuario:&nbsp;<label id="eu_'+num_medidor+'"></label><br>lectura:&nbsp;<label id="le_'+num_medidor+'"></label><br>';
		}else{ //SI ES AUTOMATICO INGRESA DE UNA
			if(localStorage.siguiente == "SI"){	//console.log("PUM!!!");
				localStorage.siguiente = "";
				localStorage.lc_med = num_medidor;
			    localStorage.lc_min = min;
			    localStorage.lc_max = max;
			    localStorage.lc_dir = direccion;
				setTimeout(function(){ window.location = "formulario.html"; }, 70);
			}
		} //console.log(num_medidor)

		$("#items").append('<div class="notice notice-'+estilo+'" id="'+idUsuario+'">'+htmlTitulo+
				 		'<small>Dirección:&nbsp;<label>'+direccion+'</label></small><br>'+
				 		'<small>Medidor:<label> '+num_medidor+'</label></small><br>'+
			    		'<small>Uso:&nbsp;<label>'+uso+'</label></small><br>'+
						add+
						htmlPrint+
			'</div>'
		);
		if(id_enviOld!=null){
			var sql18 = 'SELECT distinct "'+num_medidor+'" as num_medidor,id_item,respuesta FROM '+
					' lecturat_rtas_formulario r'+
					' where (r.id_item = "4" or r.id_item = "5") and r.id_envio = "'+id_enviOld+'"';	console.log(sql18);
			tx.executeSql(sql18, [], 
			(function(esquema){
			   return function(tx,resulta2){
			   		var lar = resulta2.rows.length;	console.log(lar);
			   		for (l = 0; l < lar; l++){
			   			var num_medidor = resulta2.rows.item(l).num_medidor;
			   			var id_item = resulta2.rows.item(l).id_item;	//console.log(idsig_tubo);
			   			var respuesta = resulta2.rows.item(l).respuesta;

			   			if(id_item == "4"){	//Si tiene TUBO
				   			$("#le_"+num_medidor).html(respuesta);
			   			}else if(id_item == "5"){
			   				$("#eu_"+num_medidor).html(respuesta);
			   			}
			   		}	//console.log("Sale For");
			   };
			})(esquema),null);
		}

		$('div[id*="'+num_medidor+'"]').click(function(e){
			var mId = $(this).attr('id');	//console.log(mId);
		    var n=mId.split("|");			//console.log(n[0]);	console.log(n[1]);	console.log(n[2]);
		    localStorage.lc_med = n[0];
		    localStorage.lc_min = n[1];
		    localStorage.lc_max = n[2];
		    localStorage.lc_dir = n[3];

		    setTimeout(function(){ window.location = "formulario.html"; }, 70);
		});

		$('i[id^='+id_enviOld+']').click(function(e){
			var mId = $(this).attr('id');	console.log(mId);
		    var n=mId.split("|");			//console.log(n[0]);	console.log(n[1]);	console.log(n[2]);
		        bootbox.hideAll();
				bootbox.dialog({
				  message: " ¿Está seguro que desea ELIMINAR la lectura del medidor '"+n[1]+"'?",
				  title: "<span class=\"glyphicon glyphicon-warning-sign rojo \"></span> Persei - Guardar",
				  buttons: {
				    success: {
				      label: "Si",
				      className: "btn-success",
				      callback: function() {
						db.transaction(function (tx) {tx.executeSql('DELETE FROM '+ localStorage.esquema + 't_video where id_envio = "'+n[0]+'"')});
						db.transaction(function (tx) {tx.executeSql('DELETE FROM '+ localStorage.esquema + 't_fotos where id_envio = "'+n[0]+'"')});
						db.transaction(function (tx) {tx.executeSql('DELETE FROM '+ localStorage.esquema + 't_rtas_formulario where id_envio = "'+n[0]+'"')});
						db.transaction(function (tx) {tx.executeSql('DELETE FROM '+ localStorage.esquema + 't_asignacion_lugar where id_envio = "'+n[0]+'"')});
						setTimeout(function(){ $("#items").html('');db.transaction(ConsultaItems); }, 800);
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
		});	//console.log(id_enviOld);
		if(id_enviOld!=null){
			$('#p'+id_enviOld+'').click(function(e){
				var mId = $(this).attr('id');	console.log(mId);
			    var n=mId.split("|");			//console.log(n[0]);	console.log(n[1]);	console.log(n[2]);
			    localStorage.imprimeIdenvio = n[2];
			    //setTimeout(function(){ window.location = "imprimeLectura.html"; }, 70);
				bootbox.hideAll();
				bootbox.dialog({
				  message: " ¿Está seguro que desea IMPRIMIR la lectura?",
				  title: "<span class=\"glyphicon glyphicon-warning-sign rojo \"></span> Persei - Guardar",
				  buttons: {
				    success: {
				      label: "Si",
				      className: "btn-success",
				      callback: function() {

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
		}

		$("#refNotificacion").hide();	
   	}
}
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
$(document).ready(function(){
	$("#notificacion").hide();
	sessionStorage.removeItem("InputBuscar");
	// CARGAR Listado de usuarios de lectura
	db.transaction(ConsultaItems);
	$('#InputBuscar').on('keyup', function() {
		var valor=this.value;
		 delay(function(){
	      	if (valor.length > 3) {
	      	    $("#items").html('');
				sessionStorage.setItem("InputBuscar", valor);
		     	db.transaction(ConsultaItems);
		    }else{
		     	sessionStorage.removeItem("InputBuscar");
		     	db.transaction(ConsultaItems);
		    }
		    // console.log("ole papa");
    	}, 500 );
	});
	$('#SlctFilterOK').change(function() {
  		//sessionStorage.setItem("InputBuscar", $('#InputBuscar').val());
  		$("#items").html('');
		db.transaction(ConsultaItems);
	});
});
