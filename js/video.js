// Called when capture operation is finished

var optionsvideo = { limit: 10, duration: 60 }; //No se está aplicando

function elimina_Video(num){
	num = 0;
	if($("#v"+num).attr('src') != "" && $("#v"+num).attr('src') != undefined){
		var str = $("#v"+num).attr('src'); //LLAMA LA URL DEL VIDEO 
		$("#v"+num).attr('src')=="";		//LIMPIA EL CUADRO DE VIDEO
		if (localStorage.getItem('Videos')!=""){
				var arr_tmp_Videos = JSON.parse(localStorage.getItem('Videos'));
				var index = 0;
				//BUSCA LA IMAGEN SELECCIONADA
					$.each(arr_tmp_Videos, function(i, item) {		
					    var arr_str = arr_tmp_Videos[i]; 			console.log(str+" = "+arr_str);
					    if(str==arr_str){
					    	return false;
					    }
					    index++;
					});
				//alert(index);
				if (index > -1) {
				    arr_tmp_Videos.splice(index, 1);
				}
				localStorage.setItem('Videos', JSON.stringify(arr_tmp_Videos));
				arr_tmp_Videos.length=0;
		}
	}
	
	
	$("#bloquev" + num).remove();
}

function captureSuccess(mediaFiles) {
	
    var arr_tmp_videos = new Array();				//CREA NUEVO ARRAY PARA LoS Videos			console.log(localStorage.getItem('Videos'));
    if(localStorage.getItem('Videos') == null ){localStorage.Videos = "";}
    else if(localStorage.Videos != "")  { var arr_tmp_videos = JSON.parse(localStorage.getItem('Videos'));}
	
    var i, len;			//alert(mediaFiles.length);

    for (i = 0, len = mediaFiles.length; i < len; i += 1) {		//alert("Nombre"+mediaFiles[i].name);	alert("Path"+mediaFiles[i].fullPath);

    	arr_tmp_videos.push(mediaFiles[i].fullPath); 	//guarda URL del video en array
	    localStorage.setItem('Videos', JSON.stringify(arr_tmp_videos));				//console.log(localStorage.Videos);			//videos[i] = mediaFiles[i].fullPath + "@" + mediaFiles[i].name;

		$("#lista_videos").append(
			'<div id="bloquev'+i+'" align="center" class="thumbnail"> Video:' + mediaFiles[i].name + '<br>' +
				'<video controls width="70%">' +
				  '<source id="v' + i + '"  src="' + mediaFiles[i].fullPath + '" type="video/mp4">' +
				  'Video no soportado para reproducción' +
				'</video><br>' +
				'<button type="button" onclick="elimina_Video('+i+');" id="btn_elimina_v'+i+'" class="btn btn-danger"> '+ 
				' <span class="glyphicon glyphicon-chevron-up"></span> Eliminar Video <span class="glyphicon glyphicon-remove"></span></button>'+
			'</div>');
		$("#lista_videos").show();
    }
    activaTab('tab3_video');
    arr_tmp_videos.length=0;
}

// Called if something bad happens.
//
function captureError(error) {
    var msg = 'Error al capturar Video: ' + error.code;
    navigator.notification.alert(msg, null, 'Uh oh!');
}

// A button will call this function
//
//function captureVideo() {
/*	
    var arr_tmp_videos = new Array();				//CREA NUEVO ARRAY PARA LoS Videos			console.log(localStorage.getItem('Videos'));
    if(localStorage.getItem('Videos') == null ){localStorage.Videos = "";}
    else if(localStorage.Videos != "")  { var arr_tmp_videos = JSON.parse(localStorage.getItem('Videos'));}
    	arr_tmp_videos.push("img/VID_20140829_222026.mp4"); 	//guarda URL del video en array
	    localStorage.setItem('Videos', JSON.stringify(arr_tmp_videos));				//console.log(localStorage.Videos);			//videos[i] = mediaFiles[i].fullPath + "@" + mediaFiles[i].name;
	
		$("#lista_videos").append(
			'<div id="bloquev0" align="center"> Video: Hola Mundo cruel<br>' +
				'<video controls>' +
				  '<source id="v0" src="img/VID_20140829_222026.mp4" type="video/mp4">' +
				  'Video no soportado para reproducción' +
				'</video><br>' +
				'<button type="button" onclick="elimina_Video(bloquev0);" id="btn_elimina_v0" class="btn btn-danger"> '+ 
				'<span class="glyphicon glyphicon-chevron-up"></span> Eliminar Video <span class="glyphicon glyphicon-remove"></span></button>'+
			'</div>');	*/

    // Launch device video recording application,
    // allowing user to capture up to 1 video clips
    
//}