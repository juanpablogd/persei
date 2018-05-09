// API key for http://openlayers.org. Please get your own at
// http://bingmapsportal.com/ and use that instead.
var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";

// initialize map when page ready
var map;
var center=[-8044897.06720, 1312988.0889];
var zonin=12;
var controlsdraw;


var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");
//var re=[2445.9849047851562, 1222.9924523925781, 611.4962261962891,305.74811309814453,152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627,0.5971642833948135];

if (typeof OpenLayers === "object") {
function openlayerize(url) {
    return url.replace(/({.})/g, function(v) {
        return "$" + v.toLowerCase();
    });
}

/*    // based on http://www.bostongis.com/PrinterFriendly.aspx?content_name=using_custom_osm_tiles
OpenLayers.Layer.Stamen = OpenLayers.Class(OpenLayers.Layer.OSM, {
    initialize: function(name, options) {
        var provider = getProvider(name),
            url = provider.url,
            subdomains = provider.subdomains,
            hosts = [];
        if (url.indexOf("{S}") > -1) {
            for (var i = 0; i < subdomains.length; i++) {
                hosts.push(openlayerize(url.replace("{S}", subdomains[i])));
            }
        } else {
            hosts.push(openlayerize(url));
        }
        options = OpenLayers.Util.extend({
            "numZoomLevels":        provider.maxZoom,
            "buffer":               0,
            "transitionEffect":     "resize",
            // see: <http://dev.openlayers.org/apidocs/files/OpenLayers/Layer/OSM-js.html#OpenLayers.Layer.OSM.tileOptions>
            // and: <http://dev.openlayers.org/apidocs/files/OpenLayers/Tile/Image-js.html#OpenLayers.Tile.Image.crossOriginKeyword>
            "tileOptions": {
                "crossOriginKeyword": null
            }
        }, options);
        return OpenLayers.Layer.OSM.prototype.initialize.call(this, name, hosts, options);
    }
});  */



}
function inicializarmapa() {
	

	//OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
	OpenLayers.Util.onImageLoadErrorColor = 'transparent';
// pink tile avoidance
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
    // make OL compute scale according to WMS spec
    OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;


    
    var vector = new OpenLayers.Layer.Vector("Posicion", {});

	
	var geolocate = new OpenLayers.Control.Geolocate({
        id: 'locate-control',
        geolocationOptions:  {
        	maximumAge:0, 
        	timeout:5000, 
        	enableHighAccuracy: true//true
        }
    });
    geolocate.watch = true;
    var firstGeolocation = true;
	var mousePositionCtrl = new OpenLayers.Control.MousePosition({
        prefix: '<a target="_blank" ' +
            'href="http://spatialreference.org/ref/epsg/4326/">' +
            'EPSG:4326</a> Coordenadas: '
        }
    );
	var navegar=new OpenLayers.Control.TouchNavigation({
		id: 'navegar-control',
		dragPanOptions: {
			enableKinetic: false
		}
	});
	
	var zoombox= new OpenLayers.Control.ZoomBox({
	id: 'zoombox-control',
	alwaysZoom:true});
	
	var nav = new OpenLayers.Control.NavigationHistory(
	{id: 'nav-control'}
	);
	 // style the sketch fancy
            var sketchSymbolizers = {
                "Point": {
                    pointRadius: 14,
                    graphicName: "circle",
                    fillColor: "#00FFFF",
                    strokeWidth: 3,
                    strokeColor: "#00FFFF",
                },
                "Line": {
                    strokeWidth: 3,
                    strokeOpacity: 1,
                    strokeColor: "#00FFFF",
                    strokeDashstyle: "solid"
                },
                "Polygon": {
                    strokeWidth: 4,
                    strokeColor: "#00FFFF",
                    strokeDashstyle: "solid",
                    fillColor: "#00FFFF",
                    fillOpacity: 0.3
                }
            };
			var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
            renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

			
			var style = new OpenLayers.Style();
            style.addRules([
                new OpenLayers.Rule({symbolizer: sketchSymbolizers})
            ]);
            
			var styleMap = new OpenLayers.StyleMap({
					"default": style
					
			});


             
			var measureControls = {
                line: new OpenLayers.Control.Measure(
                    OpenLayers.Handler.Path, {
						id: 'med_dist-control',
                        persist: true,
                        handlerOptions: {
                            layerOptions: {
                                renderers: renderer,
                                styleMap: styleMap
                            }
                        }
                    }
                ),
                polygon: new OpenLayers.Control.Measure(
                    OpenLayers.Handler.Polygon, {
                        id: 'med_area-control',
						persist: true,
                        handlerOptions: {
                            layerOptions: {
                                renderers: renderer,
                                styleMap: styleMap
                            }
                        }
                    }
                )
            };
            function handleMeasurements(event) {
				var geometry = event.geometry;
				var units = event.  units;
				var order = event.order;
				var measure = event.measure;
				var out = "";
				if(order == 1) {
					out +=  measure.toFixed(3) + " " + units+ "<sup> </" + "sup>";;
				} else {
					out +=  measure.toFixed(3) + " " + units + "<sup>2</" + "sup>";
				}
				$("#distancia_text").html(out);
				//$( "#Medicion" ).popup( "open" );
				
			}

             
	
	  var  info = new OpenLayers.Control.WMSGetFeatureInfo({
			id:'info-control',
            url: 'http://192.168.1.145:9080/geoserver/prueba/wms', 
            title: 'Identify features by clicking',
            queryVisible: true,
            eventListeners: {
                getfeatureinfo: function(event) {
				 createPopupForm(event);/*
                    map.addPopup(new OpenLayers.Popup.FramedCloud(
                        "chicken", 
                        map.getLonLatFromPixel(event.xy),
                        null,
                        createPopupForm(event),
                        null,
                        true
                    ));*/
                }
            }
        });
	function createPopupForm(event){
	//alert('hola');
	selectedWms=event.text;
	$.mobile.changePage("#informacion", "pop"); 
	//new Messi(event.text);
	};
    
    
         
    
    
    map = new OpenLayers.Map({
        
		div: "map",
        theme: null,
        projection: sm,
		displayProjection: gg, 
        //resolutions: re,
		tranitionEffect:'resize',
		numZoomLevels:20,
		//maxExtent: bo,
		center: center,
        zoom: zonin,
        //zoom: 4,
        controls: [
            new OpenLayers.Control.Attribution(),
			navegar,
		//	mousePositionCtrl,
			//OverviewMap,
            geolocate,
			zoombox,
			info
        ],
        layers: [
            new OpenLayers.Layer.Google(
                "GmSatelite",
                {type: google.maps.MapTypeId.HYBRID, visibility: true},
                {singleTile: false, buffer: 0}
            ),
            new OpenLayers.Layer.Google(
                "GmCalles",
                { visibility: true},
                {singleTile: false, buffer: 0}
            ),
            new OpenLayers.Layer.OSM()
            
        
        ]   
        
             
    });
    //Adiciona las capas al mapa
	capas();
	map.addLayer(vector);
	var draw = new OpenLayers.Layer.Vector("dibujo", {
			        renderers: renderer,styleMap: styleMap
	});
	map.addLayer(draw);	 
	style = {      graphicName: 'circle',
                    strokeColor: "rgb(82,134,183)",
                    strokeWidth: 4,
                    fillOpacity: 0,
                    pointRadius: 10
                };
	controlsdraw= {
                point: new OpenLayers.Control.DrawFeature(draw,OpenLayers.Handler.Point, {handlerOptions:{style:style}}),
                line: new OpenLayers.Control.DrawFeature(draw,OpenLayers.Handler.Path, {handlerOptions:{style: style}}),
                polygon: new OpenLayers.Control.DrawFeature(draw,OpenLayers.Handler.Polygon, {handlerOptions:{style: style}})
     };   
	for(var key in controlsdraw) {
         map.addControl(controlsdraw[key]);
    }

	map.addLayer(vector);
	map.addControl(nav);
	
/*	//escritura de cache
   var cacheWrite = new OpenLayers.Control.CacheWrite({
        autoActivate: true,
        imageFormat: "image/jpeg",
        layers: [map.layers[0]]/*
        eventListeners: {
            cachefull: function() { status.innerHTML = "Cache full."; }
        }*/
  /*  });
    map.addControl(cacheWrite);  */ 
	
	//lectura de cache
	
	//console.log(map.layers[1]);
	var cacheRead = new OpenLayers.Control.CacheRead({
		autoActivate: true
	});
	
	
    map.addControl(cacheRead);
	cacheRead.activate();
	
	var control;
	
	for(var key in measureControls) {
		control = measureControls[key];
		control.events.on({
			"measure": handleMeasurements,
			"measurepartial": handleMeasurements
		});
		map.addControl(control);
	}
	
            
	style = {
               graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                
            };
    geolocate.events.register("locationupdated", this, function(e) {
    	console.log( e.position);
    	
        	vector.removeAllFeatures();
        	vector.addFeatures([
	            new OpenLayers.Feature.Vector(
	                e.point,
	                {},
	                {
	                    graphicName: 'cross',
	                    strokeColor: '#f00',
	                    strokeWidth: 2,
	                    fillOpacity: 0,
	                    pointRadius: 10
	                }
	            ),
	            new OpenLayers.Feature.Vector(
	                OpenLayers.Geometry.Polygon.createRegularPolygon(
	                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
	                    e.position.coords.accuracy / 2,
	                    50,
	                    0
	                ),
	                {},
	                style
	            )
	        ]);
        geolocate.watch = true;
        firstGeolocation = true;
        this.bind = true;
        geolocate.activate();
       
        map.zoomToExtent(vector.getDataExtent());
    });
    function featAdded(){
    	var layerdibujo =map.getLayersByName("dibujo");
    	if(layerdibujo[0].features.length>1){
    	   layerdibujo[0].removeFeatures(layerdibujo[0].features[0]);
    	}
    	//console.log(layerdibujo[0].features.length);
       
    }
    
    	
	 for(var key in controlsdraw) {
                var controldibujo = controlsdraw[key];
                if(localStorage.feature == key) {
                	controldibujo.featureAdded = featAdded;
                    controldibujo.activate();
                } else {
                    controldibujo.deactivate();
                }
     }
     
    //INICIALIZA EL GPS POR DEFECTO PARA QUE EL USUARIO PUEDA INGRESAR LA GEOMETRÍA 
	/*control = map.getControlsBy("id", "locate-control")[0];
   
    /*if (control.active) {
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
        
    }*/
	
};
