
var interception=function(x,y,geojson,campo,rango){ console.log(rango);
    var geome = [];
    if (rango===undefined) rango = 50;
	if(rango<50) rango = rango + 50;	//console.log(geojson);
	var point = turf.point([x,y]);
	var buffered = turf.buffer(point, rango, {units: 'meters'});

    var ptsWithin = turf.pointsWithinPolygon(geojson, buffered);
	turf.featureEach(ptsWithin, function (currentFeature, featureIndex) {
		var distance = turf.distance(point, currentFeature, {units: 'meters'});	//console.log(distance);
    	geome.push({idsig:currentFeature.properties[campo],dist:(Math.round(distance * 100) / 100)})
	});

    geome.sort(function(a, b){
        return a.dist - b.dist;
    });
    return geome;
};

var findGeojson=function(campo,valor,geojson){  //console.log(campo+' '+valor+ ' '+geojson);
    var geome = [];
    if(geojson!=undefined){
        turf.featureEach(geojson, function (currentFeature, featureIndex) {
            if(currentFeature.properties[campo]==valor){
             geome.push(currentFeature)   
            }
        });
    }
    return geome;
};