/**
 * @author DGPJ
 * @Fecha 20130831
 * @Fecha 20130930
 */
var id_usuario = window.localStorage.id_usr;
//var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728);

function descargar()
{
	cargando = true;
		$("#loading").addClass("cargando");
		console.log('http://'+localStorage.url_servidor+'/SIG/servicios/acueducto/acu_actualizar_parametros.php?id_usuario='+id_usuario);
		$.ajax({
			url:'http://'+localStorage.url_servidor+'/SIG/servicios/acueducto/acu_actualizar_parametros.php?id_usuario='+id_usuario,
			dataType: 'json',
			success: function(data){
				if (data[0].encontrado == "true"){
						arr_ListaTabla = new Array();
						arr_tabla = new Array();
						var ttal_reg = 0;
						
					 	for(var json in data){ 						
						 	json++; 							//Omite el registro 'encontrado'
						    for(var i in data[json]){			//Por cada  Tabla
								var ValTabla="";				
								var columnas="";			
						    	for(var j in data[json][i]){ 	//Por cada reg	//alert(j+':'+data[json][i][j]);
						    		if(j==0){
						    			columnas = data[json][i][j];
						    		}else
						    		{
						    			var col_valores="";
						    			
						    			for(var k in data[json][i][j]){ //Codifica cada dato para su inserción
											if (col_valores==""){
								        		col_valores = '"'+data[json][i][j][k]+'"';
								        	}else col_valores = col_valores+',"'+data[json][i][j][k].replace(/&quot;/g, '\\"')+'"';
						    			}	//console.log(col_valores);
										arr_tabla[ttal_reg] = [];
										arr_tabla[ttal_reg][0] = i;
										arr_tabla[ttal_reg][1] = columnas;
										arr_tabla[ttal_reg][2] = col_valores;
										ttal_reg++;
						    		}
						    	}
								
								if (i != "" && i != null) {
									var numm  = json-1;								//alert('MMM: '+numm);
									arr_ListaTabla[json-1] = [];
									arr_ListaTabla[json-1][0] = i;					//alert('Reg: '+json-1+': '+arr_ListaTabla[json-1][0]);
									arr_ListaTabla[json-1][1] = columnas;			//alert('Reg: '+json-1+': '+arr_ListaTabla[json-1][1]);
								}
							} 
						}

						TablaGuardar();
				}else{
					$("#loading").removeClass("cargando");
					alerta("GeoData","No hay Actualizaciones pendientes","Ok","#");
				}
			},
			error: function (error) {
					$("#loading").removeClass("cargando");
					alerta("GeoData","No hay conexión en el servidor Principal","Ok","principal.html");
            }
		});
}

function descargar_cartografia()
{
	cargando = true;
		$("#loading").addClass("cargando");
		$.ajax({
			url:'http://'+localStorage.url_servidor+'/SIG/servicios/acueducto/acu_actualizar_cartografia.php',
			dataType: 'json',
			success: function(data){
				if (data[0].encontrado == "true"){
						arr_ListaTabla = new Array();
						arr_tabla = new Array();
						var ttal_reg = 0;
						
					 	for(var json in data){ 						
						 	json++; 							//Omite el registro 'encontrado'
						    for(var i in data[json]){			//Por cada  Tabla

								var ValTabla="";				
								var columnas="";			
						    	for(var j in data[json][i]){ 	//Por cada reg	//alert(j+':'+data[json][i][j]);
						    		if(j==0){
						    			columnas = data[json][i][j];
						    		}else
						    		{
						    			//LOCALSTORAGE
						    			/*try
  										{
						    					window.localStorage.setItem(data[json][i][j][0],"data:image/jpeg;base64,"+data[json][i][j][1]);
						    			}
										catch(err)
										  {
											$.mobile.loading( 'hide' );
											alerta("GeoData","El espacio ha sido completado en su totalidad","Ok","principal.html");
											return false;
										  }*/
										  
						    			
						    			var col_valores="";
						    			
						    			for(var k in data[json][i][j]){ //Codifica cada dato para su inserción 
						    				//alert(k);
											if (col_valores==""){
								        		col_valores = '"'+data[json][i][j][k]+'"';
								        	}else{
								        		/* HEXADECIMAL
								        		 if(k==4){

													col_valores = col_valores+','+data[json][i][j][k];
	
								        		}else col_valores = col_valores+',"'+data[json][i][j][k]+'"';
								        		*/ 
								        		col_valores = col_valores+',"'+data[json][i][j][k]+'"';
								        	}
						    			}

										arr_tabla[ttal_reg] = [];
										arr_tabla[ttal_reg][0] = i;
										arr_tabla[ttal_reg][1] = columnas;
										arr_tabla[ttal_reg][2] = col_valores;
										ttal_reg++;
										
						    		}
						    	}
								
								//alert(i);
								
								if (i != "" && i != null) {
									var numm  = json-1;								//alert('MMM: '+numm);
									arr_ListaTabla[json-1] = [];
									arr_ListaTabla[json-1][0] = i;					//alert('Reg: '+json-1+': '+arr_ListaTabla[json-1][0]);
									arr_ListaTabla[json-1][1] = columnas;			//alert('Reg: '+json-1+': '+arr_ListaTabla[json-1][1]);
								}
							} 
						}
						//LOCALSTORAGE $.mobile.loading( 'hide' );
						//LOCALSTORAGE alerta("GeoData","Actualización exitosa","Ok","principal.html");
						TablaGuardar_cartografia();
				}else{
					$("#loading").removeClass("loading");
					alerta("GeoData","No hay Actualizaciones pendientes","Ok","#");
				}
			},
			error: function (error) {
					$("#loading").removeClass("loading");
					alerta("GeoData","No hay conexión en el servidor Principal","Ok","principal.html");

            }
		});
}

/*----------------LISTA INFORMACIÓN A CARGAR CUANDO INICIA EL APLICATIVO----------------*/
function Consulta(tx) {
	$("#estado_info").html("");
	tx.executeSql('SELECT esquema FROM p_verticales', [], ConsultaCarga);
}
function ConsultaCarga(tx, results) {
	var len = results.rows.length;		
	for (i = 0; i < len; i++){
		var esquema = results.rows.item(i).esquema;
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_fotos', [], ConsultaFotos);
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_video', [], ConsultaVideos);
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_asignacion_lugar where estado = "C"', [], ConsultaAsignacion);
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_rtas_formulario ', [], ConsultaResp);
   };
}

//CONSULTA DE FOTOS PENDIENTES PARA CARGAR
function ConsultaFotos(tx, results) {
//	console.log('Reg: '+results.rows.item(0).nreg);
	if(results.rows.item(0).nreg != 0){
		//$("#estado_info").html('<span class="glyphicon glyphicon-cloud-upload"></span>&nbsp;Información pendiente por cargar&nbsp;<span class="glyphicon glyphicon-cloud-upload"></span>');
		$("#btn_si").hide();
		$("#txt_pregunta").hide();
		alerta("GeoData","Debe Enviar la información Pendiente antes de Descargar","Ok","cargar.html");
		
	}
}

//CONSULTA DE VIDEOS PENDIENTES PARA CARGAR
function ConsultaVideos(tx, results) {
	if(results.rows.item(0).nreg > 0){
		//$("#estado_info").html('<span class="glyphicon glyphicon-cloud-upload"></span>&nbsp;Información pendiente por cargar&nbsp;<span class="glyphicon glyphicon-cloud-upload"></span>');
		$("#btn_si").hide();
		$("#txt_pregunta").hide();
		alerta("GeoData","Debe Enviar la información Pendiente antes de Descargar","Ok","cargar.html");
	}
}
//CONSULTA ASIGNACIÓN
function ConsultaAsignacion(tx, results) {
	if(results.rows.item(0).nreg > 0){
		//$("#estado_info").html('<span class="glyphicon glyphicon-cloud-upload"></span>&nbsp;Información pendiente por cargar&nbsp;<span class="glyphicon glyphicon-cloud-upload"></span>');
		$("#btn_si").hide();
		$("#txt_pregunta").hide();
		alerta("GeoData","Debe Enviar la información Pendiente antes de Descargar","Ok","cargar.html");
	}
}
//CONSULTA ASIGNACIÓN
function ConsultaResp(tx, results) {
	if(results.rows.item(0).nreg > 0){
		//$("#estado_info").html('<span class="glyphicon glyphicon-cloud-upload"></span>&nbsp;Información pendiente por cargar&nbsp;<span class="glyphicon glyphicon-cloud-upload"></span>');
		$("#btn_si").hide();
		$("#txt_pregunta").hide();
		alerta("GeoData","Debe Enviar la información Pendiente antes de Descargar","Ok","cargar.html");
	}
}

$( document ).ready(function() {
    $("#btn_si").click(function( event ) {
    	$("#btn_si").remove();
    	$("#btn_no").remove();
 		descargar();
	});
    $("#btn_no").click(function( event ) {
 		window.location = "principal.html";
	});
	
    $("#btn_si_carto").click(function( event ) {
    	$("#btn_si_carto").remove();
    	$("#btn_no_carto").remove();
 		descargar_cartografia();
	});
    $("#btn_no_carto").click(function( event ) {
 		window.location = "principal.html";
	});
	
	$("#num_forms").html(localStorage.num_forms);

	//verifica si hay datos pendientes por envío
	db.transaction(Consulta);
	
	
 });
