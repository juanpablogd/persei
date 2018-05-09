var myLatitud;
var myLongitud;
var myPrecision;
var watchID = null;
var options = { timeout: 20*1000, enableHighAccuracy: true };

function convertTimestamp(timestamp) {
  var d = new Date(timestamp),   // Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2),         // Add leading 0.
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),     // Add leading 0.
        ampm = 'AM',
        time;
            
    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh == 0) {
        h = 12;
    }
    
    // ie: 2013-02-18, 8:35 AM  
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
        
    return time;
}

var geoexitoso = function(pos) {
	myLatitud = pos.coords.latitude;
	myLongitud = pos.coords.longitude;
	myPrecision = pos.coords.accuracy;
	speed = pos.coords.speed; 		if(speed == null) speed = "";
	heading = pos.coords.heading;	if(heading == null) heading = "";		 	//text = "<div>Latitude: " + myLatitud + "<br/>" + "Longitude: " + myLongitud + "<br/>" + "Accuracy: " + myPrecision + " m<br/>" + "</div>";
    altitude = pos.coords.altitude;   if(altitude == null) altitude = "";
    altitudeAccuracy = pos.coords.altitudeAccuracy;   if(altitudeAccuracy == null) altitudeAccuracy = "";
	 timestamp = convertTimestamp(pos.timestamp);	//timestamp = timestamp.format("yyyy-mm-dd HH:mm:ss"); console.log(convertTimestamp(pos.timestamp));
	 text = '<table class="table table-striped"><tr><td>Latitud:</td><td>' + myLatitud + '</td></tr><tr><td>Longitud:</td><td>' + myLongitud + '</td></tr><tr><td>Precisión (mts):</td><td>' + myPrecision + '</td></tr><tr><td>Altura (mts):</td><td>' + altitude + '</td></tr><tr><td>Precisión Altura:</td><td>' + altitudeAccuracy + '</td></tr><tr><td>Velocidad:</td><td>' + speed + '</td></tr><tr><td>Dirección:</td><td>' + heading + '</td></tr><tr><td>Hora:</td><td>' + timestamp + '</td></tr></table>';
	 document.getElementById('cur_position').innerHTML = text;
	 document.getElementById('search_cur_position').innerHTML = '<span class="glyphicon glyphicon-map-marker"></span> Actualizado!...';
	 //$("#id_tab4_geom").html('<span class="glyphicon glyphicon-map-marker verde"></span> Ubicación');
	 $("#id_tab4_geom").removeClass("btn-danger");
	 $("#id_tab4_geom").addClass("btn-info");
};

var failw = function(error) {
	if (myLatitud===undefined || myLatitud=="undefined"){myLatitud="";}
	if (myLongitud===undefined || myLongitud=="undefined"){myLongitud="";}
	if (myPrecision===undefined || myPrecision=="undefined"){myPrecision="";}
	
    document.getElementById('search_cur_position').innerHTML = '<span class="glyphicon glyphicon-search"></span> Esperando...';
	watchID = navigator.geolocation.getCurrentPosition(geoexitoso, null,  options);
	if(myLatitud == "" || myLongitud == ""){
		$("#id_tab4_geom").removeClass("btn-info");
		$("#id_tab4_geom").addClass("btn-danger");
		//$("#id_tab4_geom").html('<span class="glyphicon glyphicon-map-marker rojo"></span>');
	}
};

var getCurrentPosition = function() {
    document.getElementById('search_cur_position').innerHTML = '<span class="glyphicon glyphicon-search"></span> Ubicando...';	//$("#id_tab4_geom").html('<span class="glyphicon glyphicon-search"></span> Ubicación');
	watchID = navigator.geolocation.watchPosition(geoexitoso, failw, options);
};

getCurrentPosition();
//setInterval(function(){ getCurrentPosition(); },20000);

 /*
     * Date Format 1.2.3
     * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
     * MIT license
     *
     * Includes enhancements by Scott Trenda <scott.trenda.net>
     * and Kris Kowal <cixar.com/~kris.kowal/>
     *
     * Accepts a date, a mask, or a date and a mask.
     * Returns a formatted version of the given date.
     * The date defaults to the current date/time.
     * The mask defaults to dateFormat.masks.default.
     */

    var dateFormat = function () {
        var    token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };
    
        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {
            var dF = dateFormat;
    
            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }
    
            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) throw SyntaxError("invalid date");
    
            mask = String(dF.masks[mask] || mask || dF.masks["default"]);
    
            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }
    
            var    _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? "a"  : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A"  : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };
    
            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();
    
    // Some common format strings
    dateFormat.masks = {
        "default":      "ddd mmm dd yyyy HH:MM:ss",
        shortDate:      "m/d/yy",
        mediumDate:     "mmm d, yyyy",
        longDate:       "mmmm d, yyyy",
        fullDate:       "dddd, mmmm d, yyyy",
        shortTime:      "h:MM TT",
        mediumTime:     "h:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };
    
    // Internationalization strings
    dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };
    
    // For convenience...
    Date.prototype.format = function (mask, utc) {
        return dateFormat(this, mask, utc);
    };
