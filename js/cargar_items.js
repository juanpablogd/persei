/**
 * @author DGPJ 20130902
 * @Modifi DGPJ 20130917
 * @Modif. DGPJ 20140813
 */
/*VARIABLES GLOBALES*/
var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 );
var esquema = localStorage.esquema;				//Esquema
var id_categoria = localStorage.id_categoria;	//Id Categoria
var id_usr = localStorage.id_usr;				//Id Usuario
var asignado = localStorage.asignado;			//Asignado = t Nuevo = f
var id_asignacion = localStorage.id_asignado;	//SI Asignado = t. Entonces retorna el Id de Asignación
var geotabla = localStorage.geotabla;			//SI Asignado = t. Nombre de la tabla Geometrica
var id_feature = localStorage.id_feature;		//SI Asignado = t. Id de la tabla geometrica
var i_foto=0;
localStorage.id_unico ="";
var porceVarianza = 50;	//50 % de Variación!

/*VARIABLES LOCALES*/
var id_item_last;

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function txtOk(t){	console.log(t);
	if (t != "undefined" && t != undefined){
		t = t.trim();
		return t.replace(/'/g , "").replace(/"/g , "").replace(/\|/g , " ");
	}else{
		return t;
	}
}

function convertHTMLEntity(text){
    const span = document.createElement('span');

    return text
    .replace(/&[#A-Za-z0-9]+;/gi, (entity,position,text)=> {
        span.innerHTML = entity;
        return span.innerText;
    });
}

function contar_videos(){
	var v = 0;
	$("video").each(function() {
		if($(this).attr('src')!="")  v++;
	});
	return v;
}

function contar_fotos(){
	var n = 0;
	$("img[id^='ci']").each(function() {
		if($(this).attr('src')!="")  n++;
	});
	return n;
}

function msj_peligro(msj, tiempoSeg){
	tiempoSeg = (typeof tiempoSeg === 'undefined') ? '3000' : (tiempoSeg*1000);	//console.log(tiempoSeg);
	$.notify({  icon: 'glyphicon glyphicon-warning-sign',
				message:msj
			 }, { 
			type: "danger",
			allow_dismiss: false, 
			timer : 100,
			delay: tiempoSeg,
				animate: {
					enter: 'animated zoomInDown',
					exit: 'animated zoomOutUp'
				},
				placement: {
					from: "top",
					align: "center"
				}
			}
		);
}
function scanea(idTxt){
	cordova.plugins.barcodeScanner.scan(
	      function (result) {
	      	if (!result.cancelled){
	      		$("#"+idTxt+"").val(result.text);
	      		$("#"+idTxt+"").prop('disabled', true);
				//VALOR RESPUESTA
				localStorage.tmp_id_item_vr = result.text;
				// VALOR ID ITEM A MOSTRAR
				localStorage.tmp_id_item = idTxt;
				// CARGAR form_guardar DE LA BASE DE DATOS
				db.transaction(SeleccionItemsFiltrar);
	      	}else{
	      		$("#"+idTxt+"").prop('disabled', false);
	      	}
	      	
			console.log("We got a barcode\n" +
	                "Result: " + result.text + "\n" +
	                "Format: " + result.format + "\n" +
	                "Cancelled: " + result.cancelled);
	      }, 
	      function (error) {
	          console.log("Scanning failed: " + error);
	          $("#"+idTxt+"").prop('disabled', false);
	      },
	      {
	          preferFrontCamera : false, // iOS and Android
	          showFlipCameraButton : true, // iOS and Android
	          showTorchButton : true, // iOS and Android
	          torchOn: false, // Android, launch with the torch switched on (if available)
	          prompt : "Ubique el código dentro del cuadro", // Android
	          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
	      }
	   );
	
}

//si el elemento ya existe realiza la precarga
function cargaExistente(tx){	console.log("cargaExistente");
	   	/*	//TRAE EL VALOR DE REFERENCIA DEL GEOJSON	*/
   	var pzli_id_envio = localStorage.pzli_id_envio;	//console.log('TRAE EL VALOR DE REFERENCIA DEL GEOJSON');
   	if(pzli_id_envio != undefined && pzli_id_envio != null && pzli_id_envio != 'null' && pzli_id_envio != ''){
		//CARGA FOTOS
		var fotos = [];
		var sql18 = 'SELECT url_foto FROM '+localStorage.esquema+'t_fotos f '+
				' where id_envio = "'+pzli_id_envio+'" order by CAST(id as integer)';	console.log(sql18);
		tx.executeSql(sql18, [], 
		   	function(tx,resul){
		   		var ttal = resul.rows.length;	console.log("Ttal FOtos: "+ttal);
				for (var i = 0; i < ttal; i++) {
					fotos.push(resul.rows.item(i).url_foto);
				}
		   },null);

		//CARGA FORMULARIO	
		var sql18 = 'SELECT rt.id_item,respuesta,rs.id FROM '+localStorage.esquema+'t_rtas_formulario rt'+
				' left join '+localStorage.esquema+'p_rtas_seleccion rs on rt.id_item = rs.id_item and rt.respuesta = rs.valor'+
				' where id_envio = "'+pzli_id_envio+'" order by CAST(rt.rowid as integer)';	console.log(sql18);
		tx.executeSql(sql18, [], 
		   	function(tx,resulta2){
		   		var lar = resulta2.rows.length;	//console.log(lar);
		   		var l = 0;
		   		var repitePozo = false;
				function myLoop () {           //  create a loop function
				   setTimeout(function () {    //  call a 3s setTimeout when the loop is called
		   			
		   			var id_val = resulta2.rows.item(l).id;
		   			var id_item = resulta2.rows.item(l).id_item;
		   			var respuesta = resulta2.rows.item(l).respuesta;	
		   			//Validación SOLO PARA tubos cuando ENTRA/SALE pero ya tiene información Precargada
			    	if(((localStorage.pzli_io=="0" && respuesta == "SALE") || (localStorage.pzli_io=="1" && respuesta == "ENTRA")) && id_item == "104"){
			    		console.log("Cargar FOtos: "+fotos.length);
			    		for (var a = 0; a < fotos.length; a++) {
							onPhotoDataSuccess(fotos[a]);
						}
						repitePozo = true;
			    	}	console.log(id_item+" "+respuesta + " " +$("#"+id_item).attr( "type" ) + " "+ repitePozo );
		   			if($("#"+id_item).attr('type')=="select"){
		   				if(id_item == "104" && localStorage.esquema == "acueducto"){
		   					if(repitePozo) $("#"+id_item).val(respuesta+"@"+id_val).trigger("change");
		   				} else $("#"+id_item).val(respuesta+"@"+id_val).trigger("change");
		   			}else{
		   				if(id_item == "107" && localStorage.esquema == "acueducto"){
		   					if(repitePozo) $("#"+id_item).val(respuesta).trigger("change");
		   				} else $("#"+id_item).val(respuesta).trigger("change");
		   			}

				      l++;                     //  increment the counter
				      if (l < lar) {            //  if the counter < 10, call the loop function
				         myLoop();             //  ..  again which will trigger another 
				      }else{
				      	if(contar_fotos() > 0){
					      	setTimeout(function () {
					      		activaTab('tab1_form');
					      	}, 0.4*1000);
				      	}
				      }
				   }, 0.04*1000)
				}

				if(lar>0) myLoop ();

		   },null);
   	}
}

function SeleccionItemsResult(tx, results) {
	var len = results.rows.length;	//alert(len);
	for (i = 0; i < len; i++){
		var id_item = results.rows.item(i).id_item;
		console.log("Mostrar elemento: "+id_item);
		$("#l"+id_item+"").show();
		$("#"+id_item+"").show();
		$("#"+id_item+"").prop('required',true);
		$("#"+id_item+"").attr('visible','true');
		$("#f"+id_item+"").addClass('required');
    }
    if(len == 0){
    	db.transaction(SeleccionItemsOcultar);	
    }
}

function setValoresDefecto(objData){	//console.log(objData.length);
	if(objData.length>0){	console.log(objData[0].properties);
		if(objData[0].properties.id_cat==1){	//POZOS
			//DIRECCIÓN
			$("#1").val(objData[0].properties.dir);	//Dirección IDITEM = 1 para POZO
			//PROFUNDIDAD
	    	$("#lr94").text(objData[0].properties.pro);	//Profundidad IDITEM = 94 para POZO
	    	//TIPO SISTEMA
	    	nomDominio(esquema,'alc_dom_tiposistema',objData[0].properties.sis,"lr6");
	    	//SUBTIPO SISTEMA
	    	nomDominio(esquema,'subtipo_pozo',objData[0].properties.sub,"lr7");
    		//ESTADO RED
	    	nomDominio(esquema,'alc_dom_estadoenred',objData[0].properties.estr,"lr8");
    		//ESTADO FISICO
	    	nomDominio(esquema,'alc_dom_estadofisico',objData[0].properties.estf,"lr9");
    		//MATERIAL CONO
	    	nomDominio(esquema,'alc_dom_materiales',objData[0].properties.mat,"lr22");
	    }else if(objData[0].properties.id_cat==2){
	    	var pzli_id_envio = localStorage.pzli_id_envio;	//console.log(pzli_id_envio);
	    	if(pzli_id_envio == undefined || pzli_id_envio == null || pzli_id_envio == '' || pzli_id_envio == 'null'){
		    	//TIPO SISTEMA
		    	nomDominio(esquema,'alc_dom_tiposistema',objData[0].properties.sis,"lr34");
		    	//TIPO RED
		    	nomDominio(esquema,'alc_dom_tipotubored',objData[0].properties.tipr,"lr32");
		    	//TIPO RED
		    	nomDominio(esquema,'subtipo_tubo',objData[0].properties.sub,"lr33"," and id_tipo = '"+objData[0].properties.tipr+"' ");
		    	//MATERIAL
		    	nomDominio(esquema,'alc_dom_materiallinea',objData[0].properties.mat,"lr102");
	    		//ESTADO RED
		    	nomDominio(esquema,'alc_dom_estadoenred',objData[0].properties.estr,"lr8");

			    //PROFUNDIDAD INICIAL - FLUJO ENTRA
		    	$("#lr103").text(objData[0].properties.clvi);	//Profundidad IDITEM = 103 para TUBO
			    //PROFUNDIDAD INICIAL - FLUJO SALE
		    	$("#lr107").text(objData[0].properties.clvf);	//Profundidad IDITEM = 103 para TUBO
		    }
	    	//SI EL TUBO ENTRA O SALE
	    	if(localStorage.pzli_io=="0"){
	    		$("#lr104").text("SALE");
	    	}if(localStorage.pzli_io=="1"){
	    		$("#lr104").text("ENTRA");
	    	}
	    }else if(objData[0].properties.id_cat==3){
			//DIRECCIÓN
			$("#108").val(objData[0].properties.dir);	//Dirección IDITEM = 108 para Sumidero
	    	//TIPO SISTEMA
	    	nomDominio(esquema,'alc_dom_tiposistema',objData[0].properties.sis,"lr129");
    		//MATERIAL
	    	nomDominio(esquema,'alc_dom_materiales',objData[0].properties.mat,"lr47");
    		//ESTADO RED
	    	nomDominio(esquema,'alc_dom_estadoenred',objData[0].properties.estr,"lr48");
    		//SUBTIPO
	    	nomDominio(esquema,'subtipo_sumidero',objData[0].properties.sub,"lr46");
	    }else if(objData[0].properties.id_cat==4){
			//DIRECCIÓN
			$("#60").val(objData[0].properties.dir);	//Dirección IDITEM = 60 para hidrante
	    	//MATERIAL
	    	nomDominio(esquema,'acd_dom_materialLinea_4_1',objData[0].properties.mat,"lr110");
	    	//DIAMETRO
	    	nomDominio(esquema,'acd_dom_diametronominal_4_1',objData[0].properties.dia,"lr62");
    		//MATERIAL ESPACIO PUBLICO
	    	nomDominio(esquema,'acd_dom_matesppublico',objData[0].properties.espp,"lr65");
    		//ESTADO FÍSICO
	    	nomDominio(esquema,'acd_dom_estadofisicoh',objData[0].properties.estf,"lr64");
    		//MARCA
	    	nomDominio(esquema,'acd_dom_marcah',objData[0].properties.marc,"lr61");
	    }else if(objData[0].properties.id_cat==5){
			//DIRECCIÓN
			$("#79").val(objData[0].properties.dir);	//Dirección IDITEM = 60 para hidrante
		    //PROFUNDIDAD INICIAL - FLUJO SALE
	    	$("#lr85").text(objData[0].properties.prof);	//Profundidad IDITEM = 85 para valvula
	    	//MATERIAL
	    	nomDominio(esquema,'acd_dom_materialLinea_4_1',objData[0].properties.mat,"lr111");
	    	//DIAMETRO
	    	nomDominio(esquema,'acd_dom_diametronominal_4_1',objData[0].properties.dia,"lr112");
	    	//TIPO ESPACIO PUBLICO
	    	nomDominio(esquema,'acd_dom_tipoesppublico',objData[0].properties.espp,"lr89");
	    	//ESTADO FÍSICO ACCESORIO
	    	nomDominio(esquema,'acd_dom_estadofisicov',objData[0].properties.estf,"lr86");
	    	//ESTADO DE RED
	    	nomDominio(esquema,'acd_dom_estadored',objData[0].properties.estr,"lr133");
    		//MATERIAL ESPACIO PUBLICO
	    	nomDominio(esquema,'acd_dom_matesppublico',objData[0].properties.mate,"lr132");	    	
    		//TIPO
	    	nomDominio(esquema,'acd_dom_tipovalvula',objData[0].properties.tipv,"lr131");
    		//SUBTIPO
	    	nomDominio(esquema,'subtipo_valvula',objData[0].properties.sub,"lr80"," and id_tipo = '"+objData[0].properties.tipv+"' ");
	    	//FUNCIÖN VALVULA
	    	nomDominio(esquema,'acd_dom_tipovalvula_2_1',objData[0].properties.fun,"lr81");
	    }
	}
}

function cargaDefecto(nomCampo,idSig,geom) {	console.log(nomCampo+' '+idSig);	//'ids',val.idsig,geom
	var objData;
	if(typeof geom === 'undefined'){	console.log("No tiene geometría");	//SI NO TIENE GEOMETRÍA
		db.transaction( function(tx){
				tx.executeSql('SELECT row_to_json FROM '+localStorage.esquema+'geojson where id_cat = "'+localStorage.id_categoria+'"', [],
				function miResultado(tx, results) {
					var leng = results.rows.length;		//console.log(leng);
					if(leng > 0){
						geom = JSON.parse(results.rows.item(0).row_to_json); //console.log(geom.length);
						objData = findGeojson('ids',idSig,geom);
						setValoresDefecto(objData);
					}
				}
				,errorCB);
			}
	    );
	}else{	console.log("Si tiene geometría");	//SI TIENE GEOMETRÍA
		objData = findGeojson('ids',idSig,geom);
		setValoresDefecto(objData);
	}
}

function SeleccionItemsOcultar(tx) {	//console.log('select iadd.id_rta,iadd.id_item from '+esquema+'p_items_adicional iadd inner join '+esquema+'p_rtas_seleccion rtas on iadd.id_rta = rtas.id inner join '+esquema+'p_items_formulario item on item.id_item = rtas.id_item where id_categoria = "'+localStorage.id_categoria+'" and item.id_item = "'+localStorage.tmp_id_item+'" order by iadd.id_item desc');
	tx.executeSql('select iadd.id_rta,iadd.id_item from '+esquema+'p_items_adicional iadd inner join '+esquema+'p_rtas_seleccion rtas on iadd.id_rta = rtas.id inner join '+esquema+'p_items_formulario item on item.id_item = rtas.id_item where id_categoria = "'+localStorage.id_categoria+'" and item.id_item = "'+localStorage.tmp_id_item+'" order by iadd.id_item desc', [], SeleccionItemsOcultarResult,errorCB);
}
function SeleccionItemsOcultarResult(tx, results) {
	var len = results.rows.length;		console.log(len);
	for (i = 0; i < len; i++){
		var id_item = results.rows.item(i).id_item;
		var id_rta = results.rows.item(i).id_rta;	//console.log(localStorage.tmp_id_item + " Loop: " + id_rta);
		if(localStorage.tmp_id_rta == id_rta){		//console.log("Mostrar elemento: "+id_item);
			$("#"+id_item+"").prop('required',true);
			$("#"+id_item+"").attr('visible','true');
			$("#f"+id_item+"").addClass('required');
			$("#f"+id_item+"").show();
		}else{	//console.log("Ocultar elemento: "+id_item);
			$("#"+id_item+"").removeAttr('required');
			$("#"+id_item+"").attr('visible','false');
			$("#f"+id_item+"").removeClass('required');
			$("#f"+id_item+"").hide();	
		}
   	}
   	//si la novedad es cambio de medidor, pone el valor por defecto
   	if(localStorage.tmp_id_rta=="27"){
   		$("#18").val($("#2").val());
   	}
   	//SI reporta novedad, pone NO en los campos por default
   	if(localStorage.tmp_id_rta=="15"){	//console.log("Si hay novedad");
   		$("#7").val("No@10");
   		$("#9").val("No@22");
   		$("#11").val("No@24");
   		$("#12").val("No@26");
   		$("#17").val("No@28");
   	}
   	//SI ES ACUEDUCTO
   	if (localStorage.esquema == "lectura" && localStorage.nombre_form.toLowerCase().indexOf("eaab") >= 0){
   		if (localStorage.tmp_id_item == "135"){
   			$("#21").prop('required',false);
   			$("#f21").hide();	//confirmar Lectura
   			$("#138").prop('required',false);
   			$("#f138").hide();	//lectura mayor
   			$("#140").prop('required',false);
   			$("#f140").hide();	//lectura menor

   			var valPredio = $("#135").val();
   			if(valPredio.toLowerCase().indexOf("si") >= 0){
   				localStorage.foto_obligatorio = 0;
   				$("#tabFotos").hide();
				$("#add_foto").hide();
   			}else{
   				localStorage.foto_obligatorio = 1;
   				$("#tabFotos").show();
				$("#add_foto").show();
   			}
   		}
   	}
}
function SeleccionItemsFiltrar(tx) {	//console.log('select rs.id as id_add,rs.valor,rs.descripcion,id_item_hijo,vr_padre from '+esquema+'p_items_filtro itf left join '+esquema+'p_rtas_seleccion rs on itf.id_item_hijo = rs.id_item where id_item_padre = "'+localStorage.tmp_id_item+'" order by rs.descripcion');
 	tx.executeSql('select rs.id as id_add,rs.valor,rs.descripcion,id_item_hijo,vr_padre from '+esquema+'p_items_filtro itf left join '+esquema+'p_rtas_seleccion rs on itf.id_item_hijo = rs.id_item where id_item_padre = "'+localStorage.tmp_id_item+'" order by rs.descripcion', [], seleccionItemsFiltrarResult,errorCB);
}

function seleccionItemsFiltrarResult(tx, results) {
 	var len = results.rows.length;	//console.log(len);
 	var id_select;	
 	if(len > 0){
 		id_select = results.rows.item(0).id_item_hijo;
		var tipoElem = $('#'+id_select)[0].nodeName.toUpperCase();	console.log(tipoElem + ": " + id_select);
		if(tipoElem=="SELECT"){
	 		$('#'+id_select).find('option').remove().end();		
	 		$('#'+id_select).append('<option value="">---Seleccione---</option>');
		 	for (i = 0; i < len; i++){
		 		if(results.rows.item(i).vr_padre == localStorage.tmp_id_item_vr) $('#'+id_select).append('<option value="'+results.rows.item(i).valor+'@'+results.rows.item(i).id_add+'">'+results.rows.item(i).descripcion+'</option>');
		    }
		}else if(tipoElem=="SPAN"){
		    localStorage.id_select = id_select;
		    $('#'+id_select).html('');
			db.transaction(SeleccionItemsFiltrarNomb);
		}
 	}
 }

 function SeleccionItemsFiltrarNomb(tx) {	console.log('select rs.descripcion from '+esquema+'p_items_filtro itf left join '+esquema+'p_rtas_seleccion rs on itf.id_item_hijo = rs.id_item where id_item_padre = "'+localStorage.tmp_id_item+'" and vr_padre ="'+localStorage.tmp_id_item_vr+'" order by rs.descripcion');
  	tx.executeSql('select rs.descripcion from '+esquema+'p_items_filtro itf left join '+esquema+'p_rtas_seleccion rs on itf.id_item_hijo = rs.id_item where id_item_padre = "'+localStorage.tmp_id_item+'" and vr_padre ="'+localStorage.tmp_id_item_vr+'" order by rs.descripcion', [], SeleccionItemsFiltrarNombResult,errorCB);
 }
 function SeleccionItemsFiltrarNombResult(tx, results) {
    console.log(results.rows.length);
    if(results.rows.length > 0){
        $('#'+localStorage.id_select).html(results.rows.item(0).descripcion);
    }else $('#'+localStorage.id_select).html('No se encontró descripción!');
 }

function getval(sel) {	console.log("Id: "+sel.id);
	var res = sel.value.split("@");
	//VALOR RESPUESTA
	var tmp_id_item_vr = res[0];
	// VALOR ID RESPUESTA
	var tmp_id_rta = res[1];
	// VALOR ID ITEM A MOSTRAR
	var tmp_id_item = res[2];
	//Variable Global como localStorage
	localStorage.tmp_id_item = sel.id;
	localStorage.tmp_id_rta = tmp_id_rta;
	localStorage.tmp_id_item_vr = tmp_id_item_vr;
	console.log("ORIGEN  Id item: " + localStorage.tmp_id_item + " - Id rta: " + localStorage.tmp_id_rta + " - Vr: " + localStorage.tmp_id_item_vr);
	// CARGAR form_guardar DE LA BASE DE DATOS
	db.transaction(SeleccionItemsOcultar);
	// CARGAR form_guardar DE LA BASE DE DATOS
	db.transaction(SeleccionItemsFiltrar);
}

function loadFachada(idItem){
			/* CONSULTA GEOJON */
		function TBLfachadaConsulta(tx) {	console.log('SELECT b64 FROM '+localStorage.esquema+'p_img_fachada where direccion = "'+localStorage.lc_dir+'"');
		    tx.executeSql('SELECT b64 FROM '+localStorage.esquema+'p_img_fachada where direccion = "'+localStorage.lc_dir+'"', [], TBLfachadaConsultaConsulta);
		}
		/* LOGUEADO EXITOSAMENTE*/
		function TBLfachadaConsultaConsulta(tx, results) {
			var len = results.rows.length;	console.log('Resultados: '+len);
		    if(len>0){
		    	$("#"+idItem).attr("src",results.rows.item(0).b64);
			}
		}
		db.transaction(TBLfachadaConsulta);
}

 function calculaCercano(id_item){		//console.log(id_item);
 	if(myLatitud != "" && myLongitud != "" && myPrecision != "" ){
		var x= myLongitud;
		var y= myLatitud;
		if (typeof cordova == 'undefined'){	//DEBUG
			x =	-74.06298992003967;	//-74.064033700059;-74.06298992003967 
			y =	4.681044294803255;	//4.67869881213558;4.681044294803255
		}

		var campo='ids';
		var rango=myPrecision;

		/* CONSULTA GEOJON */
		function TBLusuarioConsulta(tx) {	//console.log('SELECT * FROM '+localStorage.esquema+'geojson where id_cat = "'+localStorage.id_categoria+'"');
		    tx.executeSql('SELECT * FROM '+localStorage.esquema+'geojson where id_cat = "'+localStorage.id_categoria+'"', [], TBLusuarioConsultaConsulta);
		}
		/* LOGUEADO EXITOSAMENTE*/
		function TBLusuarioConsultaConsulta(tx, results) {
			var len = results.rows.length;	console.log('Resultados: '+len);
		    if(len>0){
		    	$("#list"+id_item).html('');
		    	var geom = JSON.parse(results.rows.item(0).row_to_json);	//console.log(geom.length);
				var jsonOk = interception(x,y,geom,campo,rango);			//console.log(jsonOk.length);
				if(jsonOk.length == 0){
					msj_peligro("No hay elementos cercanos en un rango de "+(Math.round(rango * 100) / 100)+" metros.");
				}
		        $.each( jsonOk, function( key, val ) {	//console.log(key + ":" + val.idsig);
		        	if(key == 0) {
		        		$("#"+id_item).val(val.idsig);
		        		cargaDefecto('ids',val.idsig,geom);
		        	}
				    $("#list"+id_item).append(
			    		'<li class="list-group-item">'+
						    '<span class="badge">'+val.dist+'</span>'+val.idsig+
						'</li>'
				    	);
				    if (key > 3) return false;
				});
				$('ul[id*=list'+id_item+'] li').click(function(e){
					var datoIdsig = $(this).clone()    //clone the element
				    .children() //select all the children
				    .remove()   //remove all the children
				    .end()  //again go back to selected element
				    .text();
				    $("#"+id_item).val(datoIdsig);
				    cargaDefecto('ids',datoIdsig,geom);
				});
			}
		}
		db.transaction(TBLusuarioConsulta);

 	}else{
 		msj_peligro("Debe activar su ubicación GPS.");
 	}
 };
function validaLectura(min,max,id){	//alet("validaLectura");
	var estado = "ok";
	var valor = $("#"+id).val();
	var inLabel = $("#l"+id).text();
	var dig = numeral(valor).value();
	if(dig < min){	
		estado = "menor";
	}else if(dig > max){
		estado = "mayor";
	}
	if(estado == "menor" || estado == "mayor") msj_peligro(inLabel+"</br>El valor '"+valor+"' NO se encuentra en el rango esperado: 	"+ (Math.round(min * 1000) / 1000) + " - " + (Math.round(max * 1000) / 1000),10);
	if (localStorage.esquema == "lectura" && localStorage.nombre_form.toLowerCase().indexOf("lectura") >= 0){
		if(id=136){
			if(estado == "menor"){
				$("#21").prop('required',true);
				$("#f21").show();	//confirmar Lectura
				$("#140").prop('required',false);
				$("#f140").hide();
				$("#138").prop('required',true);
				$("#f138").show();
			}else if(estado == "mayor"){
				$("#21").prop('required',true);
				$("#f21").show();	//confirmar Lectura
				$("#140").prop('required',true);
				$("#f140").show();
				$("#138").prop('required',false);
				$("#f138").hide();
			}else{
				$("#21").prop('required',false);
				$("#f21").hide();	//confirmar Lectura
				$("#140").prop('required',false);
				$("#f140").hide();
				$("#138").prop('required',false);
				$("#f138").hide();
			}
		}
	}
	return estado;
}
/****************************************************************************************************************************************************************/
function errorCB(err) {
	// Esto se puede ir a un Log de Error dir�a el purista de la oficina, pero como este es un ejemplo pongo el MessageBox.Show :P
	if (err.code !== undefined && err.message !== undefined){
    	alerta("GeoMovil","Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message,"Ok","#");
   	}
}
/****************************************************************************************************************************************************************/
/**CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS**/ 
function ConsultaItems(tx) {
	  console.log('select it.id_item, it.descripcion_item, it.tipo_rta, it.obligatorio,rt.descripcion,rt.valor,rt.id id_add  from '+esquema+'p_items_formulario it left join '+esquema+'p_rtas_seleccion rt on it.id_item = rt.id_item and valor != "" where id_categoria="'+id_categoria+'" order by CAST(orden as integer),CAST(it.id_item as integer)');
	tx.executeSql('select it.id_item, it.descripcion_item, it.tipo_rta, it.obligatorio,rt.descripcion,rt.valor,rt.id id_add  from '+esquema+'p_items_formulario it left join '+esquema+'p_rtas_seleccion rt on it.id_item = rt.id_item and valor != "" where id_categoria="'+id_categoria+'" order by CAST(orden as integer),CAST(it.id_item as integer)', [], ConsultaItemsCarga,errorCB);
}
function ConsultaItemsCarga(tx, results) {
	var len = results.rows.length;	console.log(len);

	for (i = 0; i < len; i++){
		//Si encuentra formulario lo suma al contador de Formularios
		var num_actual = $("#num_preguntas").html();
		
		var rta = results.rows.item(i).tipo_rta;
		var id_item = results.rows.item(i).id_item;
		var descripcion_item = convertHTMLEntity(results.rows.item(i).descripcion_item); descripcion_item = descripcion_item.replace(/&lt;/g, "<"); descripcion_item = descripcion_item.replace(/&gt;/g, ">").toUpperCase().trim(); //console.log(descripcion_item);
		var obligatorio = ""; //console.log(results.rows.item(i).obligatorio.trim());
		if(results.rows.item(i).obligatorio.trim() == "S") {obligatorio = "required";}

		if (rta == "TEXTO" && id_item_last != id_item){
			if(descripcion_item == "IDSIG"){
				if (localStorage.nombre_form.toLowerCase().indexOf("tubo") >= 0){
					var soloLectura = "";
					var valorI = "";
					if(localStorage.li !="nuevo"){
						soloLectura = "readonly";
						valorI =localStorage.li;
						$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value="'+valorI+'" maxlength="255" '+obligatorio+' visible="true" '+soloLectura+' /></div>');
						cargaDefecto('ids',valorI);
					}else{
						$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'">'+
							'<label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label>'+
							'<div class="input-group">'+
								'<input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value=""  maxlength="255" '+obligatorio+' visible="true" style="font-size: 22px;"/>'+
								'<div class="input-group-btn">'+
									'<button onclick="calculaCercano('+id_item+');" class="btn btn-default"><i class="glyphicon glyphicon-search"></i></button>'+
								'</div>'+
							'</div>'+
							'<ul id="list'+id_item+'" class="list-group">'+'</ul>'+
						'</div>');
					} 
				}else{	//SI no es FOrmulario de TUBO
					$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'">'+
						'<label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label>'+
						'<div class="input-group">'+
							'<input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value=""  maxlength="255" '+obligatorio+' visible="true" style="font-size: 22px;"/>'+
							'<div class="input-group-btn">'+
								'<button onclick="calculaCercano('+id_item+');" class="btn btn-default"><i class="glyphicon glyphicon-search"></i></button>'+
							'</div>'+
						'</div>'+
						'<ul id="list'+id_item+'" class="list-group">'+'</ul>'+
					'</div>');
				}
			}else if (descripcion_item == "IDSIG_POZO"){
				var valorI =localStorage.pz;
				$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value="'+valorI+'" maxlength="255" '+obligatorio+' visible="true" readonly/></div>');
			}else if(descripcion_item == "IDSIG_POZO_CONTRARIO"){
				if(localStorage.li =="nuevo"){
					$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value=""  maxlength="255" '+obligatorio+' visible="true"/></div>');
				}
			}else if (descripcion_item == "NUMERO MEDIDOR"){
				var valorI =localStorage.lc_med;
				$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value="'+valorI+'" maxlength="255" '+obligatorio+' visible="true" readonly/></div>');
			}else
			{
				$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value=""  maxlength="255" '+obligatorio+' visible="true"/></div>');
			}
			
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "PARRAFO" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><textarea class="form-control" cols="40" rows="3"  name="'+id_item+'" id="'+id_item+'" value="" '+obligatorio+' visible="true"/></textarea></div>');	/* $('#'+id_item).textinput(); */
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "CANTIDAD" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'" style="color: white;"></label></label><input type="number" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value="" '+obligatorio+' onkeypress="if ((event.keyCode < 48 || event.keyCode > 57) && event.keyCode != 46) event.returnValue = false;" visible="true"/></div>');	/* $('#'+id_item).textinput(); */
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "CANTIDADOCULTO" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'" style="color: white;"></label></label><input type="password" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value="" '+obligatorio+' onkeypress="if ((event.keyCode < 48 || event.keyCode > 57) && event.keyCode != 46) event.returnValue = false;" visible="true"/></div>');	/* $('#'+id_item).textinput(); */
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "FECHA" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label" >'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><input type="text" class="form-control" tipo="fecha"  name="'+id_item+'" id="'+id_item+'" value="" '+obligatorio+' onkeypress="if ((event.keyCode < 48 || event.keyCode > 57)) event.returnValue = false;" visible="true"/></div>');
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "SELECCION") {
			if(id_item_last != id_item){
				$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="select control-label"" >'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><select type="select" class="form-control" name="'+id_item+'" id="'+id_item+'" '+obligatorio+' onchange="getval(this);" visible="true"><option value=""></option</select></div>');
				$("#num_preguntas").html(parseInt(num_actual) + 1);	
			}
			if(results.rows.item(i).valor != null) { $('#'+id_item).append('<option value="'+results.rows.item(i).valor+'@'+results.rows.item(i).id_add+'">'+results.rows.item(i).descripcion+'</option>'); }	
		}else if (rta == "LISTA") {
			if(id_item_last != id_item){
				$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="select control-label"" >'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><br></div>');
				$("#num_preguntas").html(parseInt(num_actual) + 1);	
			}
			if(results.rows.item(i).valor != null) { $('#f'+id_item).append('<input type="checkbox" name="'+id_item+'" id="'+id_item+'" value="'+results.rows.item(i).valor+'" visible="true"/> <label name="lr'+id_item+'" id="lr'+id_item+'">'+results.rows.item(i).descripcion+'</label><br>'); }	
		}else if (rta == "LECTOR" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+':&nbsp;<label name="lr'+id_item+'" id="lr'+id_item+'"></label></label><input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value="" '+obligatorio+' visible="true" disabled="true"/><button onclick="scanea('+id_item+')" id="btn_scanea'+id_item+'" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-chevron-up"></span> Escanear <span class="glyphicon glyphicon-qrcode"></span></button></div>');	/* $('#'+id_item).textinput(); */
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "INFO" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group "><span name="'+id_item+'" id="'+id_item+'" class="label label-info" style="font-size: 100%;display: block;">'+descripcion_item+'</span></div>');	/* $('#'+id_item).textinput(); */
			if (descripcion_item == "DIRECCION"){
				console.log("Llama imágen");
				$("#items").append('<div class="inline thumbnail" align="center"><img style="max-width: 138px;" class="img-responsive" id="imgf'+id_item+'" src="" /></div>');
				loadFachada('imgf'+id_item);
			}
		}
		if((i+1)==len){		//DESPUES DE CARGAR TODOS LOS REGISTROS
			// OCULTAR ITEMS
			db.transaction(OcultarItems);

			var checkExist = setInterval(function() {
			   if ($('#27').length) {
			      console.log("Exists!");
			      clearInterval(checkExist);
			      db.transaction(cargaExistente);
			   }
			}, 100);
		}
	
	id_item_last = id_item;
   	}
	/*	TERMINAR DE CARGAR LOS INPUTS */
	if (localStorage.esquema == "lectura" && localStorage.nombre_form.toLowerCase().indexOf("lectura") >= 0){
		//LECTURA
    	$("#lr4").text(parseFloat(localStorage.lc_min)+(localStorage.lc_max-localStorage.lc_min)/2);	//Profundidad IDITEM = 94 para POZO
    	$("#lr136").text(parseFloat(localStorage.lc_min)+(localStorage.lc_max-localStorage.lc_min)/2);	//Profundidad IDITEM = 94 para POZO
		//Pone valores x Defecto
		console.log("Trigger 1");
		$("#5").val("Si@13").trigger("change");
		$("#135").val("SI@638").trigger("change");
		$("#1").html("Dirección: "+localStorage.lc_dir);
		$("#22").html("Dirección: "+localStorage.lc_dir);
      	setTimeout(function () {	console.log("Trigger 2");
      		$("#6").val("NO@16").trigger("change");
	      	setTimeout(function () {	console.log("POne FOco");
	      		$("#4").focus();
	      		$("#136").focus();
	      	}, 90);
      	}, 260);
	}

    /* ADICIONA OPCIONES PARA LA FECHA */
    $("input[tipo='fecha']").datepicker({
		    format: "yyyy/mm/dd",
		    todayBtn: "linked",
		    language: "es",
		    multidate: false,
		    keyboardNavigation: false,
		    autoclose: true,
		    todayHighlight: true
	});
	$( "select" ).change(function () {
		//VALOR DEFECTO
		var inID = $(this).attr('id');
		var valDefecto = $("#lr"+inID).text().trim();	//Vr BD de input que pierde el FOCO
		if(valDefecto!=''){
			//LABEL DEL ITEM
			var inLabel = $("#l"+inID).text();	//Label del input que pierde el FOCO
			//VALOR SELECCIONADO
			var txtSelect = $("#"+inID+" option:selected").text();
			if(valDefecto.toUpperCase() != txtSelect.toUpperCase()){	console.log(valDefecto);
				msj_peligro(inLabel+"</br> Seleccionó un valor diferente: 	"+txtSelect,5)
			}
		}
	});
    //Compara si tiene valor por defecto
	$(':input').blur(function(){	console.log("BLur");
		var inVal = $(this).val().trim();	//console.log(inVal);//Valor del input que pierde el FOCO
		var inID = $(this).attr('id');		//ID del input que pierde el FOCO
		var inLabel = $("#l"+inID).text();	//Label del input que pierde el FOCO
		var valDefecto = $("#lr"+inID).text().trim();	//console.log(valDefecto);//Vr BD de input que pierde el FOCO
		var vaTipo = $(this).attr('type');	//console.log(vaTipo);

		if(inVal != ''){	
			if(vaTipo=="number"){
				if(!isNumber(inVal)){
					$(this).val('');
				}else{
					$(this).val(numeral(inVal).format('0.[000]'));
				}
			}else if(vaTipo=="text" && (inID =="2" || inID =="26") && inVal != ""){	//console.log("Calcula id escrito: "+inVal);
				cargaDefecto('ids',inVal);
			}
			if(valDefecto!=''){
				var digitado = inVal.split("@");
				if(vaTipo=="number"){ console.log(numeral(inVal).value());
					var min = 0;
					var max = 999;
			        if (localStorage.esquema == "lectura" && localStorage.nombre_form.toLowerCase().indexOf("lectura") >= 0){
						min = localStorage.lc_min;		//console.log(min);
						max = localStorage.lc_max;
						//si NO es Lectura Valida, porque la lectura se valida al guardar
						if (inID != 136) validaLectura(min,max,inID);
			        }else{
						min = numeral(valDefecto).value() * (porceVarianza/100);		//console.log(min);
						max = numeral(valDefecto).value() * (1+(porceVarianza/100));	//console.log(max);
						validaLectura(min,max,inID);
			        }
				}else if (vaTipo =="select"){
/*					var txtSelect = $("#"+inID+" option:selected").text();
					if(valDefecto.toUpperCase() != txtSelect.toUpperCase()){	console.log(valDefecto);
						msj_peligro(inLabel+"</br> Seleccionó un valor diferente: 	"+txtSelect,8)
					}	*/	
				}else{
					if(valDefecto.toUpperCase() != digitado[0].toUpperCase()){	console.log(valDefecto);
						msj_peligro(inLabel+"</br> Seleccionó un valor diferente: 	"+digitado[0],8)
					}					
				}

			}
		}
	});
}
/***FIN CARGAR ITEMS*************************************************************************************************************************************************************/

/****************************************************************************************************************************************************************/
/**OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO*****/ 
function OcultarItems(tx) { //console.log('SELECT iadd.id_item FROM '+esquema+'p_items_formulario itemfor inner join '+esquema+'p_items_adicional iadd on itemfor.id_item = iadd.id_item where id_categoria = "'+id_categoria+'" order by iadd.id_item desc');
	
	tx.executeSql('SELECT iadd.id_item FROM '+esquema+'p_items_formulario itemfor inner join '+esquema+'p_items_adicional iadd on itemfor.id_item = iadd.id_item where id_categoria = "'+id_categoria+'" order by iadd.id_item desc', [], OcultartemsResult,errorCB);
}
function OcultartemsResult(tx, results) {
	var len = results.rows.length;	//alert(len);
	for (i = 0; i < len; i++){
		var id_item = results.rows.item(i).id_item;
		$("#"+id_item+"").removeAttr('required');
		$("#f"+id_item+"").removeClass("required");
		$("#"+id_item+"").attr('visible','false');
		$("#f"+id_item+"").hide();
   	}
}
/***FIN OCULTAR ITEMS*************************************************************************************************************************************************************/

function activaTab(tab){
        $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    };

function comprobarCamposRequired(){		//console.log($("#21").is(':visible'));
	var correcto=true;
	if (myLatitud===undefined || myLatitud=="undefined"){myLatitud="";}
	if (myLongitud===undefined || myLongitud=="undefined"){myLongitud="";}
	if (myPrecision===undefined || myPrecision=="undefined"){myPrecision="";}

	if(localStorage.geometria_obligatorio == "S" && (localStorage.geometria == "" || localStorage.geometria === undefined) && correcto==true){
			correcto=false;
			msj_peligro("Debe ingresar una geometría tipo "+ localStorage.tipo_geometria);
			activaTab('tab4_geom');
	}

	if(correcto==true){
		var idLastchecked;
		var checked;
	   	$(':input').each(function () {	//console.log($(this).attr('id') + " - " + $(this).val() + " - " + $(this).attr("required"));
			if($(this).attr("required")){
				var valorCampo = $(this).val();		
				if(valorCampo == '' || valorCampo === ''){
					correcto=false;
					var currentId = $(this).attr('id');	//console.log(currentId);
					msj_peligro("Debe diligenciar correctamente: " +  $("#l"+currentId).text());
					activaTab('tab1_form');
					$("#"+currentId).focus();
					return false;
				}else{
					var vaTipo = $(this).attr('type');	//console.log("Tipo:"+vaTipo+". Es número:"+isNumber(valorCampo));
					var currentId = $(this).attr('id');	//console.log(currentId);
					if(vaTipo=="number" && !isNumber(valorCampo)){
						correcto=false;
						msj_peligro($("#l"+currentId).text()+" No valido: "+valorCampo);
						activaTab('tab1_form');
						$("#"+currentId).focus();
					}if(vaTipo=="checkbox"){
						correcto = false;
						$("input[id='"+currentId+"']").each(function() {	//console.log($(this).is(':checked'));
							if ($(this).is(':checked')) correcto=true;
						});	//console.log(correcto);
						if (!correcto){
							msj_peligro("Debe marcar una opción: " +  $("#l"+currentId).text());
							activaTab('tab1_form');
							return false;
						}
					}
				}
			}
	   });
	}
	//Valida si la lectura fue Confirmada
	if(correcto == true){
		if(localStorage.esquema == "lectura" && localStorage.nombre_form.toLowerCase().indexOf("lectura") >= 0) { 
			var resLectura = validaLectura(localStorage.lc_min,localStorage.lc_max,136);	console.log(resLectura);
			//136 es el ID de lectura de EAAB
			if(resLectura != "ok"){
				if($("#21").is(':visible')){
					if($("#21").val() != $("#136").val() && $("#21").val() != ""){
						msj_peligro("La lectura no coincide");
						correcto = false;
						$("#21").focus();
					}
				}
			}
		}
	}
	
	if(localStorage.geolocaliza_obligatorio == "S" && (myLatitud=="" || myLongitud=="") && correcto==true){
			correcto=false;
			alert("No hay coordenadas registradas, active el GPS y busque un lugar abierto");
	}
	
	if(correcto==true){	//localStorage.foto_obligatorio == "S" &&	contar_fotos
		//GUARDA FOTOS
		if (contar_fotos() < localStorage.foto_obligatorio){
			correcto=false;
			msj_peligro("Mínimo de fotos: " + localStorage.foto_obligatorio);
			//activaTab('tab2_foto');
		}
		//GUARDA FOTOS
		if (contar_fotos() > localStorage.foto_max){
			correcto=false;
			msj_peligro("Máximo de fotos: " + localStorage.foto_max);
			//activaTab('tab2_foto');
		}
	}
	if(correcto==true){	//console.log(contar_videos());	console.log(localStorage.foto_max);
		if (contar_videos() < localStorage.video_obligatorio){
			correcto=false;
			msj_peligro("Mínimo de Videos: "+localStorage.video_obligatorio);
			activaTab('tab3_video');
		}
	}	
	
	console.log(correcto);
	
	return correcto;
}
/**************************************************************************************************************************************************************************/
/**GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS**/
function GuardarItemsExe(tx) {	
	//activaTab('tab1_form');
	var now = new Date();
	var fecha_captura = now.getFullYear()+'-'+(1+now.getMonth())+'-'+now.getDate()+'-'+now.getHours()+'_'+now.getMinutes()+'_'+now.getSeconds();
	var id_unico = fecha_captura+'-'+id_usr;
	//VALIDACIÓN DE TUBOS EXCLUSIVAMENTE
	if(localStorage.esquema == "acueducto" && localStorage.id_categoria == 2 && localStorage.li == "nuevo"){
		var posicion = 1;
		var flujo = $("#104").val();	console.log(flujo);
		var arFlujo = flujo.split("@");
		if (arFlujo[0].trim() == "SALE") posicion  = 0;
		console.log('INSERT INTO acueductopz_li (cod_pozo,cod_red_lo,posicion) values ("'+localStorage.pz+'","'+$("#26").val()+'","'+posicion+'")');
		tx.executeSql('INSERT INTO acueductopz_li (cod_pozo,cod_red_lo,posicion) values ("'+localStorage.pz+'","'+$("#26").val()+'","'+posicion+'")');
	}

	//GUARDA Y ACTUALIZA LA TABLA ASIGNACION
	if(asignado=="t"){	//si es asignado
		tx.executeSql('UPDATE '+esquema+'t_asignacion_lugar set id_envio = "'+id_unico+'",fecha_ejecucion = "'+fecha_captura+'",latitud_envio="'+myLatitud+'",longitud_envio="'+myLongitud+'",exactitud="'+myPrecision+'",id_encuestador = "'+id_usr+'",estado="C",feature="'+localStorage.geometria+'" where id = "'+id_asignacion+'"');
	}else				//si es Nuevo
	{
		localStorage.id_unico = id_unico;		//alert('INSERT INTO '+esquema+'t_asignacion_lugar (id_encuestador,id_categoria,estado,id_usuario_asign,fecha_asignacion,fecha_ejecucion,latitud_envio,longitud_envio,exactitud,id_envio,tipo_ingreso,feature) values ("'+id_usr+'","'+id_categoria+'","C","'+id_usr+'","'+fecha_captura+'","'+fecha_captura+'","'+myLatitud+'","'+myLongitud+'","'+myPrecision+'","'+id_unico+'","N","'+localStorage.geometria+'")');
		tx.executeSql('INSERT INTO '+esquema+'t_asignacion_lugar (id_encuestador,id_categoria,estado,id_usuario_asign,fecha_asignacion,fecha_ejecucion,latitud_envio,longitud_envio,exactitud,id_envio,tipo_ingreso,feature) values ("'+id_usr+'","'+id_categoria+'","C","'+id_usr+'","'+fecha_captura+'","'+fecha_captura+'","'+myLatitud+'","'+myLongitud+'","'+myPrecision+'","'+id_unico+'","N","'+localStorage.geometria+'")');
	}
	//SELECCIONA LOS ELEMENTOS DEL FORMULARIO
	 $(':input').each(function () {
			var $this = $(this),id_item = $this.attr('name');
			if(id_item!==undefined && id_item!="" && id_item!="id_geometria" ){
				//LLAMA VALOR
				var cant_val = $(this).val();
				//SI ES TIPO SELECT QUITA EL ID DE OCULTAR O MOSTRAR
				var res = cant_val.split("@");
				// VALOR FINAL A GUARDAR
				var cant_val = res[0].trim(); 					console.log (id_item + " : " + cant_val + "Visible: " + $(this).attr('visible') + "Checked: " + $(this).attr('type'));

				if( ( $(this).attr('type') != 'checkbox' && $(this).attr('visible') == 'true' && cant_val != "") || ($(this).attr('type') == 'checkbox' && $(this).is(':checked')) ){
					if(asignado=="t"){	//si es asignado
						tx.executeSql('INSERT INTO '+esquema+'t_rtas_formulario (id_asignacion,id_item,respuesta,id_envio) values ("'+id_asignacion+'","'+id_item+'","'+cant_val+'","'+id_unico+'")');
					}else				//si es Nuevo registro no asignado
					{
						tx.executeSql('INSERT INTO '+esquema+'t_rtas_formulario (id_item,respuesta,id_envio) values ("'+id_item+'","'+txtOk(cant_val)+'","'+id_unico+'")');
						console.log('INSERT INTO '+esquema+'t_rtas_formulario (id_item,respuesta,id_envio) values ("'+id_item+'","'+txtOk(cant_val)+'","'+id_unico+'")');
					}
				}
           }
	 });
	//GUARDA FOTOS 
	if(localStorage.Fotos != null && localStorage.Fotos != "" && localStorage.Fotos !== undefined && localStorage.Fotos != "undefined"){
		var num_reg = 0;
		//CARGA FOTOS
		var data = JSON.parse(localStorage.getItem('Fotos'));
		$.each(data, function(i, item) {	//alert(data[i]);
			tx.executeSql('INSERT INTO '+esquema+'t_fotos (id,url_foto,id_envio) values ("'+num_reg+'","'+data[i]+'","'+id_unico+'")');
			num_reg++;
		});
		data.length=0;
		localStorage.Fotos = "";				
	}
	
	//GUARDA VIDEOS
	if(localStorage.Videos != null && localStorage.Videos != "" && localStorage.Videos !== undefined && localStorage.Videos != "undefined"){
		var num_reg = 0;
		//CARGA VIDEOS
		var data = JSON.parse(localStorage.getItem('Videos'));
		$.each(data, function(i, item) {	//alert(data[i]);
			tx.executeSql('INSERT INTO '+esquema+'t_video (id,url_video,id_envio) values ("'+num_reg+'","'+data[i]+'","'+id_unico+'")');
			num_reg++;
		});
		data.length=0;
		localStorage.Videos = "";				
	}

	localStorage.feature="";
	localStorage.geometria="";
	console.log("Almacenamiento Exitoso");
	setTimeout(function(){ 
		if(asignado=="t"){	//si es asignado
			alerta("Persei - Guardar","Información Guardada exitosamente","Ok","mapa/mobile-jq.html");
		}else{
	        if (localStorage.nombre_form.toLowerCase().indexOf("tubo") >= 0){
	            alerta("Persei - Guardar","Información Guardada exitosamente","Ok","listaTubos.html");
	        }else if (localStorage.esquema == "lectura" && localStorage.nombre_form.toLowerCase().indexOf("lectura") >= 0){
	        	localStorage.siguiente = "SI";
	            alerta("Persei - Guardar","Información Guardada exitosamente","Ok","listaLectura.html");
	        }else{
	            alerta("Persei - Guardar","Información Guardada exitosamente","Ok","principal.html");
	        }
		}
	}, 99);
}
/***FIN GUARDAR ITEMS***********************************************************************************************************************************************************************/
/****CONSULTA GENERAL********CONSULTA GENERAL********CONSULTA GENERAL********CONSULTA GENERAL********CONSULTA GENERAL****/
function ConsultaGeneral(tx) {
	tx.executeSql('select * from '+esquema+geotabla+' where id = "'+id_feature+'"', [], ConsultaGeneralResp);
}
function ConsultaGeneralResp(tx, resultsT) {
	var lon = resultsT.rows.length;						//alert(lon);
	for (i = 0; i < lon; i++){
		var row = resultsT.rows.item(i);
		var string;
		var num_col = 0;
		for (name in row)
		{
			if (num_col<3){
				if (typeof row[name] !== 'function')
				{
					if(num_col==0){
						string = row[name] + " | ";	
					}else
					{
						string = string + row[name] + " | ";
					}
				}
			}
			num_col++;
		}
		$("#titulo").append(string);
   	}
}
/************************************************************************************************************************/
/************************************************************************************************************************/
/************************************************************************************************************************/
$(document).ready(function(){

	$("#titulo").html('<strong><h4></h4>'+localStorage.nombre_form+'</strong>');

	//localStorage.feature = "add"; //Si es registro nuevo limpia la variable geometria
	if (localStorage.geometria != "" && localStorage.geometria !== undefined) {
		$("#Subtitulo").append("<br><label style='color:#81B944'>Geomertría correctamente cargada</label>");
	}
	console.log(localStorage.tipo_geometria);
	if(localStorage.tipo_geometria=="POLIGONO"){
		$('#id_geometria').append('<option value="polygon">Pol&iacute;gono</option>');
	}else if(localStorage.tipo_geometria=="PUNTO"){
		$('#id_geometria').append('<option value="point">Punto</option>');
	}else if(localStorage.tipo_geometria=="LINEA"){
		$('#id_geometria').append('<option value="line">L&iacute;nea</option>');
	}
	//REINICIA EL CONTADOR DE LAS PREGUNTAS
	$("#num_preguntas").html(0);
	
	// CARGAR ITEMS DE LA BASE DE DATOS
	db.transaction(ConsultaItems);
	
	$("[id*=guardar]").click(function() {
		//activaTab('tab1_form');
		if(comprobarCamposRequired()){
	   		db.transaction(GuardarItemsExe);
		}
	});
	$("[id*=salir]").click(function() {
		app.salir();
	});

	$("#id_geometria").change(function() {
		var v = $(this).val();
		if (v != null ){
			localStorage.feature = v;
			window.location = "mapa_geom/mobile-jq-geom.html";
		}
	});
	
	$('div[data-role="navbar"] a').click(function () {
	    $(this).addClass('ui-btn-active');
	    $('div.content_div').hide();
	    $('div#' + $(this).attr('data-href')).show();
	});
	
	$("#add_foto").click(function() {	//alert(contar_fotos());
		if (contar_fotos() == localStorage.foto_max){
			msj_peligro("Máximo de fotos permitidas: "+ localStorage.foto_max);
			return false;
		}
		if (typeof cordova !== 'undefined'){
			opcionesCamara.sourceType = Camera.PictureSourceType.CAMERA;
			navigator.camera.getPicture(onPhotoDataSuccess, onFail, opcionesCamara); 	
		}else{
			onPhotoDataSuccess("data:image/jpeg;base64,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");		
		}
		return false;
	});

	$("#add_fotoLibreria").click(function() {
		if(localStorage.foto_max == "N") localStorage.foto_max = 0;
		if (contar_fotos() == localStorage.foto_max){
			msj_peligro("Máximo de fotos permitidas: "+ localStorage.foto_max);
			return false;
		}
		if (typeof cordova !== 'undefined'){
			opcionesCamara.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
			navigator.camera.getPicture(onPhotoDataSuccess, onFail, opcionesCamara); 	
		}else{
			onPhotoDataSuccess("data:image/jpeg;base64,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");
		}
		return false;
	});

	$("#add_video").click(function() {	console.log(localStorage.video_obligatorio);
		if (contar_videos() == localStorage.video_obligatorio){
			msj_peligro("Máximo de Videos permitidos: "+ localStorage.video_obligatorio);
			return false;
		}
		
		navigator.device.capture.captureVideo(captureSuccess, captureError, {limit: 1});
		return false;
	});
	
	$('#adjuntar').hide();
	if(localStorage.geometria_obligatorio == "S"){
		activaTab("tab4_geom");
	}else if(localStorage.geometria_obligatorio == "0"){
		$("#Lid_geometria").hide();
		$("#id_geometria").hide();
	}
	if(localStorage.foto_obligatorio == "N") localStorage.foto_obligatorio = 0;
	if(localStorage.foto_obligatorio == "S") localStorage.foto_obligatorio = 1;
	if(localStorage.video_obligatorio == "N") localStorage.video_obligatorio = 0;
	if(localStorage.video_obligatorio == "S") localStorage.video_obligatorio = 1;
	
	//VALIDA SI CAPTURA FOTO
	if (localStorage.foto_obligatorio == 0){
		$("#tabFotos").hide();
		$("#add_foto").hide();
	}
	
	//VALIDA SI CAPTURA VIDEO  
	if (localStorage.video_obligatorio == 0){
		$("#tabVideos").hide();
	}

});