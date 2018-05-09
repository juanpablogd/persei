// Start with the map page
window.location.replace(window.location.href.split("#")[0] + "#mappage");

var selectedFeature = null;
var selectedWms = null;

$(document).ready(function() {
	
	$("#distancia_contenedor").hide();
 
	$("#open_nav").hide();
	
	$("#navigation").delay(20000).hide(1000,"linear",function () {
		$("#open_nav").show(500,"linear");
	});
	
	$("#open_nav").click(function() {
		$("#open_nav").hide(500,"linear");
		$("#navigation").show(1000,"linear").delay(20000).hide(1000,"linear",function () {
			$("#open_nav").show(500,"linear");
		});
	});
	
	

    $(document).on("pageshow", "#mappage", fixContentHeight);
    $( window ).on( "throttledresize", fixContentHeight );

    // Map zoom  
    $("#plus").click(function(){
	
        map.zoomIn();
    });
    $("#minus").click(function(){
        map.zoomOut();
    });
	
	
	
    $("#nav_ant").click(function(){
		control = map.getControlsBy("id", "nav-control")[0];
		control.previousTrigger();        
    });
	 $("#nav_post").click(function(){
        control = map.getControlsBy("id", "nav-control")[0];
		control.nextTrigger();        
    });
	
	$("#total").click(function(){
	      map.setCenter(new OpenLayers.LonLat(center), zonin);     
    });
	
	
    $("#navegar").click(function(){
        desactivarcontrol();
		control = map.getControlsBy("id", "navegar-control")[0];
		control.activate();
		$("#navegar").addClass("ui-btn-active");		
	});
	$("#zoombox").click(function(){
		desactivarcontrol();
		control = map.getControlsBy("id", "zoombox-control")[0];
		control.activate();
		$("#zoombox").addClass("ui-btn-active");		
		
	});
	$("#info").click(function(){
		desactivarcontrol();
		control = map.getControlsBy("id", "info-control")[0];
		control.activate();
		$("#info").addClass("ui-btn-active");	
	
	});

	$("#med_dist").click(function(){
		
		
      	desactivarcontrol();
		$("#distancia_contenedor").show(500,"linear");
		control = map.getControlsBy("id", "med_dist-control")[0];
		control.activate();
		$("#med_dist").addClass("ui-btn-active");		
		
    });
	
	$("#med_area").click(function(){
		
        desactivarcontrol();
		$("#distancia_contenedor").show(500,"linear");
		control = map.getControlsBy("id", "med_area-control")[0];
		control.activate();
		$("#med_area").addClass("ui-btn-active");	
    });
	$("#link_listado").click(function(){
		window.open("../formulario.html","_parent");
	});
	$("#link_asignaciones").click(function(){
		window.open("../asignacion.html","_parent");
	});

    $("#locate").click(function(){
        control = map.getControlsBy("id", "locate-control")[0];
	    console.log(control.active);
	    if (control.active) {
	       // control.getCurrentLocation();
	        control.bind=false;
	        control.watch = false;
	        control.deactivate();
	    	desactivarcontrol();
	       // $("#locate").removeClass('ui-btn-active');
	    
	    } else {
	        	
	        control.activate();
	        control.bind=true;
	        control.watch = true;
	        
	    }

    });
    
    
    
    $('#popup').on('pageshow',function(event, ui){
        var li = "",attr;
        for(attr in selectedFeature.attributes){
            li += "<li><div style='width:40%;float:left'>" + attr + "</div><div style='width:60%;float:right'>" 
            + selectedFeature.attributes[attr] + "</div></li>";
        }
		//alert(li)
        $("ul#details-list").empty().append(li).listview("refresh");
    });
	
	$('#informacion').on('pageshow',function(event, ui){
	/*	alert(selectedWms);*/

     $('.Infcollap').empty().append(selectedWms).collapsibleset( "refresh" );
	// $('.Infolist').listview("refresh");
    });

	$( "#panelleft" ).on( "panelbeforeopen", function( event, ui ) {
        $('#query').bind('change', function(e){
            $('#search_results').empty();
            if ($('#query')[0].value === '') {
                return;
            }
            $.mobile.showPageLoadingMsg();

            // Prevent form send
            e.preventDefault();

            var searchUrl = 'http://open.mapquestapi.com/nominatim/v1/search?format=json';
            searchUrl += '&q=' + $('#query')[0].value;
            searchUrl += '&countrycodes=' + 'CO';
            $.getJSON(searchUrl, function(data) {
                $.each(data, function() {
                    var place = this;
                    var n=place.display_name.split(",");
                    $('<li>')
                        .hide()
                        .append($('<h2 />', {
                            text: n[0]
                        }))
                        .append($('<p />', {
                            html: '<b>' + n[1] + '</b> ' + n[2]
                        }))
                        .appendTo('#search_results')
                        .click(function() {
                        	//console.log(place.lon);
                            $.mobile.changePage('#mappage');
                            //var lonlat = new OpenLayers.LonLat(place.lon, place.lat);
                            var lonlat1 = new OpenLayers.LonLat(place.boundingbox[2], place.boundingbox[0]);
                            var lonlat2 = new OpenLayers.LonLat(place.boundingbox[3], place.boundingbox[1]);
                            
                            console.log(place.boundingbox[1]);
	 						/*var bounds=new OpenLayers.Bounds(place.boundingbox);
                            map.zoomToExtent(bounds);*/
                           	//boundingbox
                           	var bounds = new OpenLayers.Bounds();
							bounds.extend(lonlat1.transform(gg, sm));
							bounds.extend(lonlat2.transform(gg, sm));
							map.zoomToExtent(bounds);
                            //map.setCenter(lonlat.transform(gg, sm), 10);
                        })
                        .show();
                });
                $('#search_results').listview('refresh');
                $.mobile.hidePageLoadingMsg();
            });
        });
        // only listen to the first event triggered
        $(document).off('pageshow', '#searchpage');
    });

});

