var opcionesCamara;
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("backbutton", this.salir, false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
		var devicePlatform = device.platform;   console.log(devicePlatform);
        if(devicePlatform == "iOS"){
            opcionesCamara = {   quality : 20                                 
                            ,destinationType : Camera.DestinationType.NATIVE_URI
                            ,sourceType : Camera.PictureSourceType.CAMERA
                            ,encodingType: Camera.EncodingType.JPEG
                            ,saveToPhotoAlbum:true
                            ,correctOrientation:true
                        };
        }else{
            opcionesCamara = {   quality : 26                                 
                            ,destinationType : Camera.DestinationType.FILE_URI
                            ,sourceType : Camera.PictureSourceType.CAMERA
                            ,encodingType: Camera.EncodingType.JPEG
                            ,saveToPhotoAlbum:true
                            ,correctOrientation:true
                        };
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
    salir: function() {
        bootbox.hideAll();
		bootbox.dialog({
		  message: " ¿Está seguro que desea salir sin guardar cambios?",
		  title: "<span class=\"glyphicon glyphicon-warning-sign rojo \"></span> GeoData - Guardar",
		  buttons: {
		    success: {
		      label: "Si",
		      className: "btn-success",
		      callback: function() {
					if(asignado=="t"){	//si es asignado
						window.location = "mapa/mobile-jq.html";
					}else{
                        if (localStorage.nombre_form.toLowerCase().indexOf("tubo") >= 0){
                            window.location = "listaTubos.html";
                        }else{
                            window.location = "principal.html";
                        }
						
					}
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
   }
};

app.initialize();