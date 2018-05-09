function fixContentHeight() {
        var header = $("div[data-role='header']:visible"),
            content = $("div[data-role='content']:visible:visible"),
            viewHeight = $(window).height(),
            contentHeight = viewHeight - header.outerHeight();
			if(content.height()!= contentHeight){
		  	content.height(contentHeight);
		}
		if (window.map && window.map instanceof OpenLayers.Map) {
            map.updateSize();
        } else {
            // initialize map
            /*init(function(feature) { 
                selectedFeature = feature; 
                $.mobile.changePage("#popup", "pop"); 
            });*/
           	inicializarmapa();
            initLayerList();
        }
    }
function desactivarcontrol() {
		control = map.getControlsBy("id", "zoombox-control")[0];
		control.deactivate();
		
		control = map.getControlsBy("id", "navegar-control")[0];
		//control.deactivate();
		
		control = map.getControlsBy("id", "info-control")[0];
		control.deactivate();
		
		control = map.getControlsBy("id", "med_dist-control")[0];
		control.deactivate();
			
		control = map.getControlsBy("id", "med_area-control")[0];	
		control.deactivate();	
		control = map.getControlsBy("id", "locate-control")[0];
		control.deactivate();
		
		$("#zoombox").removeClass("ui-btn-active");
		$("#info").removeClass("ui-btn-active");			
		$("#navegar").removeClass("ui-btn-active");		
		$("#med_dist").removeClass("ui-btn-active");		
		$("#med_area").removeClass("ui-btn-active");
		
		$("#distancia_contenedor").hide(500,"linear");
		
}

function initLayerList() {
    $('#layerspage').page();
    $('<li>', {
            "data-role": "list-divider",
            text: "Capas Base",
            "data-theme":"a"
        })
        .appendTo('#layerslist');
    var baseLayers = map.getLayersBy("isBaseLayer", true);
    $.each(baseLayers, function() {
        addLayerToListBase(this);
    });

    $('<li>', {
            "data-role": "list-divider",
            text: "Capas Operacionales",
            id:"id_capas_ope",
            "data-theme":"a"
            
        })
        .appendTo('#layerslist');
        
    
    var colla_set = '<div data-role="collapsible-set" data-inset="false" data-iconpos="right" data-theme="b" data-content-theme="d" id="collapsible_layer">'+
          			'</div><!-- /collapsible-set -->';
      
    $('#layerslist').after(colla_set);
    $( "#collapsible_layer" ).trigger( "create" );
 
    var overlayLayers = map.getLayersBy("isBaseLayer", false);
    $.each(overlayLayers, function() {
    	addLayerToListBase(this);
    });

    $('#layerslist').listview('refresh');

    map.events.register("addlayer", this, function(e) {
    	
    	var namelayer=e.layer.name.split(":");
    	if(e.layer.name.substring(0,10)!="OpenLayers"){
    		
    			console.log(namelayer[0]);
        		if (!$('#coll_'+namelayer[0]).length ) {
		    		var collap='<div data-role="collapsible"  id="coll_'+namelayer[0]+'">'+
			          '<h3 class="text-transform:capitalize;">'+namelayer[0]+'</h3>'+
			          '<ul data-role="listview" id="li_'+namelayer[0]+'">'+
			           '</ul>'+              
			        '</div><!-- /collapsible -->';
			        $('#collapsible_layer').append(collap);
			        $("#collapsible_layer").trigger('create');  	
				}
				
        	addLayerToList(e.layer);
       }
       //$('#layerslist').listview('refresh');
    });
}


function addLayerToList(layer) {
	var namelayer=layer.name.split(":");
    	//console.log(layer.visibility);
    var item = $('<li>', {
            "data-icon": "check",
            "class": layer.visibility ? "checked" : ""
        })
        .append($('<a />', {
            text: namelayer[1]
        })
        .click(function() {
                $.mobile.changePage('#mappage');
                if (layer.isBaseLayer) {
                    layer.map.setBaseLayer(layer);
                } else {
                    layer.setVisibility(!layer.getVisibility());
                }
            })
        ).appendTo('#li_'+namelayer[0]);
    $('#li_'+namelayer[0]).listview('refresh');
	    layer.events.on({
	        'visibilitychanged': function() {
	            $(item).toggleClass('checked');
	    }
    });
}

function addLayerToListBase(layer) {
	console.log(layer.name);
	if(layer.name!="Posicion"&&layer.name!="ins_geojson"&&layer.name!="dibujo"){
    var item = $('<li>', {
            "data-icon": "check",
            "class": layer.visibility ? "checked" : ""
        })
        .append($('<a />', {
            text: layer.name
        })
        .click(function() {
                $.mobile.changePage('#mappage');
                if (layer.isBaseLayer) {
                    layer.map.setBaseLayer(layer);
                } else {
                    layer.setVisibility(!layer.getVisibility());
                }
            })
        )
        .appendTo('#layerslist');
    layer.events.on({
        'visibilitychanged': function() {
        	$(item).toggleClass('checked');
        }
    });
   }
}