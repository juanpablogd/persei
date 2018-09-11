/**
 * @author DGPJ 20130902
 */
var eaab_pagar={
	db: window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 ),
	id:'',
	num_medidor:'',
	id_interval:'',
	vertical:'',
	esquema:'',
	geojsonTubos:'',
	resultado:'',
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
				if (eaab_pagar.num_medidor!=''){
					where=where+' and num_medidor="'+eaab_pagar.num_medidor+'"';
				}
				//'CREATE table lectura_data_pdf AS  '+
				sql = ' WITH lect AS ( select e.*, CAST(e.lectura_actual  AS REAL) AS  lectura_anterior,CAST(l.respuesta AS REAL)  AS lectura_ultima,  '+
					' (CAST(l.respuesta AS REAL)-CAST(e.lectura_actual AS REAL)) AS consumo,r.id_envio '+
			        ' from '+results.rows.item(j).esquema+'usuarios_ruta e '+
					' left join '+results.rows.item(j).esquema+'t_rtas_formulario r on (e.num_medidor = r.respuesta and r.id_item =  "23") '+
					' left join '+results.rows.item(j).esquema+'t_rtas_formulario l on (r.id_envio = l.id_envio and l.id_item =  "136") '+
					where+
					' ) '+
					' select num_medidor,ctacto,direccion,nombre,telefono,uso,min,max,id_envio, lectura_ultima,lectura_anterior, consumo, '+
					' CAST(cargo_fijo_acue AS REAL)  AS acue_cargo_fijo, '+
					' CAST(cargo_fijo_acue AS REAL)  AS acue_cargo_fijo_ttl, '+
					' CAST(cargo_fijo_acue AS REAL)*(CAST(subs_fijo_acue AS REAL))  AS acue_cargo_fijo_ttl_sub, '+
					' CAST(cargo_fijo_acue AS REAL)*(1+CAST(subs_fijo_acue AS REAL))  AS acue_cargo_fijo_ttl_unisub, '+
					' CAST(cargo_fijo_acue AS REAL)*(1+CAST(subs_fijo_acue AS REAL))  AS acue_cargo_fijo_ttl_fin, '+
					' CAST(cons_basico_acue AS REAL)  AS acue_cons_basico, '+
					' CASE WHEN consumo>22 THEN (22*CAST(cons_basico_acue AS REAL)) ELSE  (consumo*CAST(cons_basico_acue AS REAL)) END  AS acue_cons_basico_ttl, '+
					' CAST(cons_basico_acue AS REAL)*(CAST(subs_no_basico_acue AS REAL))   AS acue_cons_basico_ttl_sub, '+
					' CAST(cons_basico_acue AS REAL)*(1+CAST(subs_no_basico_acue AS REAL))   AS acue_cons_basico_ttl_unisub, '+
					' CASE WHEN consumo>22 THEN (22*CAST(cons_basico_acue AS REAL))*(1+CAST(subs_no_basico_acue AS REAL)) ELSE  (consumo*CAST(cons_basico_acue AS REAL))*(1+CAST(subs_no_basico_acue AS REAL)) END  AS acue_cons_basico_ttl_fin, '+
					' CAST(cons_no_basico_acue AS REAL) AS acue_cons_nobasico, '+					
					' CASE WHEN consumo>22 THEN ((consumo-22)*CAST(cons_no_basico_acue AS REAL)) ELSE 0 END  AS acue_cons_nobasico_ttl, '+
					' CAST(cargo_fijo_alc AS REAL) AS alc_cargo_fijo, '+
					' CAST(cons_basico_alc AS REAL)  AS alc_cons_basico, '+
					' CAST(cons_no_basico_alc AS REAL) AS alc_cons_nobasico, '+
					' CAST(cargo_fijo_alc AS REAL)  AS alc_cargo_fijo_tl, '+
					' CASE WHEN consumo>22 THEN (22*CAST(cons_basico_alc AS REAL)) ELSE  (consumo*CAST(cons_basico_alc AS REAL)) END  AS alc_cons_basico_ttl, '+
					' CASE WHEN consumo>22 THEN ((consumo-22)*CAST(cons_no_basico_alc AS REAL)) ELSE 0 END  AS alc_cons_nobasico_ttl, '+
					' CAST(cargo_fijo_alc AS REAL)*(1+CAST(subs_fijo_alc AS REAL))  AS alc_cargo_fijo_tl_sub, '+
					' CAST(cons_basico_alc AS REAL)*(1+CAST(subs_no_basico_alc AS REAL)) AS alc_cons_basico_ttl_unisub, '+
					' CASE WHEN consumo>22 THEN (22*CAST(cons_basico_alc AS REAL))*(1+CAST(subs_no_basico_alc AS REAL)) ELSE  (consumo*CAST(cons_basico_alc AS REAL))*(1+CAST(subs_no_basico_alc AS REAL)) END  AS alc_cons_basico_ttl_sub, '+
					' CAST(subs_fijo_acue AS REAL) AS subs_fijo_acue, '+
					' CAST(subs_no_basico_acue AS REAL) AS subs_no_basico_acue, '+
					' CAST(subs_fijo_alc AS REAL) AS subs_fijo_alc, '+
					' CAST(subs_no_basico_alc AS REAL) AS subs_no_basico_alc '+
					' from lect; ';
				tx.executeSql(sql, [], eaab_pagar.ConsultaItemsCargaAsignResp,eaab_pagar.errorCB);
		   	}
		}
	},
	ConsultaItemsCargaAsignResp:function(tx, resultsV) {
		var lon = resultsV.rows.length;	console.log(lon);
		for (i = 0; i < lon; i++){
			var num_medidor = resultsV.rows.item(i).num_medidor;	//console.log(num_medidor);
			eaab_pagar.resultado=resultsV.rows.item(i);	
			console.log(eaab_pagar.resultado);
	   	}
	},
   	main:function(){
   		eaab_pagar.db.transaction(eaab_pagar.ConsultaItems);
   	}
}
eaab_pagar.num_medidor='08015IB111936';
eaab_pagar.main();		
eaab_pagar.resultado;
