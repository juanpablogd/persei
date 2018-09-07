/**
 * @author DGPJ 20130902
 */
var eaab_pagar={
	db: window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 ),
	id:'',
	id_interval:'',
	vertical:'',
	esquema:'',
	geojsonTubos:'',
	errorCB:function(err) {
		if (err.code == undefined && err.message == undefined){
			alerta("Persei","Descargue formularios pendientes!","Ok","descargar.html");
		}else
		{
			alerta("Persei","Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message,"Ok","principal.html");
		}
	},

	//CONSULTA LAS VERTICALES EN EL MOVIL
	ConsultaItems:function (tx) {	
		localStorage.num_forms = 0;
		tx.executeSql('select vertical,esquema from p_verticales order by vertical', [], eaab_pagar.ConsultaItemsCarga,eaab_pagar.errorCB);
	},
	// RESPUESTA DE LA CONSULTA LAS VERTICALES EN EL MOVIL
	ConsultaItemsCarga:function(tx, results) {
		var len = results.rows.length;	//console.log(len);
		if(len == 0){
			alerta("Persei","Debe descargar la configuracíon del servidor","Ok","descargar.html");
		}else{
			for (j = 0; j < len; j++){
				var sql = '';
				var where=' ';
				var where='where r.id_envio != "" ';

				sql = 'select distinct num_medidor,ctacto,direccion,nombre,telefono,uso,min,max,r.id_envio,l.respuesta  AS lectura '+
					'from '+results.rows.item(j).esquema+'usuarios_ruta e '+
					'left join '+results.rows.item(j).esquema+'t_rtas_formulario r on (e.num_medidor = r.respuesta and r.id_item =  "23") '+
					'left join '+results.rows.item(j).esquema+'t_rtas_formulario l on (r.id_envio = l.id_envio and l.id_item =  "136") '+
					where+
					'order by r.id_envio,CAST(order_lectura as integer)';
				tx.executeSql(sql, [], eaab_pagar.ConsultaItemsCargaAsignResp,eaab_pagar.errorCB);
		   	}
		}
	},
	ConsultaItemsCargaAsignResp:function(tx, resultsV) {
		var lon = resultsV.rows.length;	console.log(lon);
		for (i = 0; i < lon; i++){
			var num_medidor = resultsV.rows.item(i).num_medidor;	//console.log(num_medidor);
			console.log(resultsV.rows.item(i))	
	   	}
	},
   	main:function(){
   		eaab_pagar.db.transaction(eaab_pagar.ConsultaItems);
   	}
}
	eaab_pagar.main();		
