var NomIdimage=null; //id de la imagen disponible 

var foto_calidad;
var foto_tamano;


if(localStorage.foto_calidad==""){
	foto_calidad = "100";
}else{
	foto_calidad = localStorage.foto_calidad;
}	//alert(foto_calidad);

if(localStorage.foto_tamano==""){
	foto_tamano = "640";
}else{
	foto_tamano = localStorage.foto_tamano;
}	//alert(foto_tamano);

function elimina_foto(num){
	if($("#ci"+num).attr('src') != "" && $("#ci"+num).attr('src') != undefined){
		var str = $("#ci"+num).attr('src'); //LLAMA LA URL DE LA IMAGEN 
		$("#ci"+num).attr('src')=="";		//LIMPIA EL CUADRO DE IMAGEN
		if (localStorage.getItem('Fotos')!=""){
				var arr_tmp_fotos = JSON.parse(localStorage.getItem('Fotos'));
				var index = 0;
				//BUSCA LA IMAGEN SELECCIONADA
					$.each(arr_tmp_fotos, function(i, item) {		//alert(data[i]);
					    var arr_str = arr_tmp_fotos[i].substring(arr_tmp_fotos[i].length-20,arr_tmp_fotos[i].length); //alert(str+" "+arr_str);
					    if(str==arr_str){
					    	return false;
					    }
					    index++;
					});
				//alert(index);
				if (index > -1) {
				    arr_tmp_fotos.splice(index, 1);
				}
				localStorage.setItem('Fotos', JSON.stringify(arr_tmp_fotos));
				arr_tmp_fotos.length=0;
		}
	}
	$("#bloque"+num).remove();
}

function onFail(message) {
	$("img").each(function() {
		if($(this).attr('src')=="" || $(this).attr('src')==null){
			$(this).remove();
		}
	});		
	//alert('Falla al capturar Foto'); //message
}
    


// api-camera
function onPhotoDataSuccess(imageData) {	//var imageData = "img/logo.png";
	//VERIFICA SI EXISTEN ELEMENTOS IMG, SI HAY VERIFICA SI HAY DISPONIBILIDAD PARA CAPTURA DE FOTOGRAFÍA
	var img_disponible = false;
	$("img").each(function() {
		if($(this).attr('src')=="" || $(this).attr('src')==null){
			NomIdimage=$(this).attr('id');
			img_disponible = true;
			return false; 											//Espacio Disponible
		}
	});
	//CREA NUEVO ARRAY PARA LAS FOTOS
    var arr_tmp_fotos = new Array();				//CREA NUEVO ARRAY PARA LAS FOTOS			console.log(localStorage.getItem('Fotos'));
    if(localStorage.getItem('Fotos') == null ){localStorage.Fotos = "";}
    else if(localStorage.Fotos != "")  { var arr_tmp_fotos = JSON.parse(localStorage.getItem('Fotos'));}
    arr_tmp_fotos.push(imageData); 
	localStorage.setItem('Fotos', JSON.stringify(arr_tmp_fotos));
																		
	//SI NO EXISTE CREA EL ELEMENTO IMG PARA ALMACENAR LA FOTO
	if(img_disponible==false){
		NomIdimage = "ci"+i_foto;				//alert('Calidad: '+foto_calidad+' FTW: ' + foto_tamano);
		$("#lista_fotos").append('<div class="inline thumbnail" id="bloque'+i_foto+'" align="center"><img class="img-responsive" id="'+NomIdimage+'" src="'+imageData+'" /><button onclick="elimina_foto('+i_foto+')" id="btn_elimina'+i_foto+'" class="btn btn-danger"><span class="glyphicon glyphicon-chevron-up"></span> Eliminar <span class="glyphicon glyphicon-remove"></span></button></div>');
		i_foto++;
	}						
	activaTab('tab2_foto');						
    $("#"+NomIdimage).show();		

    imageData = null; //lIMPIA LA VARIABLE DE LA IMAGEN
    arr_tmp_fotos.length=0;		//alert(localStorage.Fotos);
	return false;
}