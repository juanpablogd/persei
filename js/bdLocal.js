var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 58720256);
function errorCB(err) {
	// Esto se puede ir a un Log de Error dir�a el purista de la oficina, pero como este es un ejemplo pongo el MessageBox.Show :P
	if (err.code != "undefined" && err.message != "undefined"){
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);
	}
}
function successCB() { /*alert("Ok!"); */ }

function TBLusuario(tx) {//Si no existe crea la talba USUARIOS	//tx.executeSql('DELETE TABLE IF EXISTS "usuario"');
    tx.executeSql('CREATE TABLE IF NOT EXISTS usuario ("id" INTEGER PRIMARY KEY  NOT NULL  DEFAULT (null) ,"nombre" CHAR NOT NULL ,"usuario" CHAR NOT NULL ,"contrasegna" CHAR NOT NULL  DEFAULT (null) ,"activo" CHAR NOT NULL  DEFAULT (1),"conectado" CHAR NOT NULL  DEFAULT (1) )');
    tx.executeSql('CREATE TABLE IF NOT EXISTS posicion ("id" CHAR ,"usuario" CHAR ,"fecha" CHAR,"longitud" CHAR, "latitud" CHAR, "exactitud" CHAR )');
    db.transaction(TBLusuarioConsulta);
}

/* LOGUEADO EXITOSAMENTE*/
function TBLusuarioConsulta(tx) {
    tx.executeSql('SELECT * FROM usuario where id = "9999"', [], TBLusuarioConsultaGuarda);
}
/* LOGUEADO EXITOSAMENTE*/
function TBLusuarioConsultaGuarda(tx, results) {
	var len = results.rows.length;	//alert('Resultados: '+len);
    if(len==0){
		tx.executeSql('INSERT INTO usuario (id,nombre,usuario,contrasegna,activo,conectado) values ("9999","Usuario Maestro","maestro","maestro","S","2013-01-01")'); 
	}
}
/* LOGUEADO EXITOSAMENTE*/
function AlmacenaUsr(tx) {	//alert("Inicia AlmacenaUsr");
	db.transaction(TBLusuario); 					//Crea la tabla y usuario por defecto
	db.transaction(AlmacenaUsrConsulta);			//Consulta Usuario en la base de datos para trabajo Offline
}
/* LOGUEADO EXITOSAMENTE*/
function AlmacenaUsrConsulta(tx) {
	var id = localStorage.id_usr;					//alert('SELECT * FROM usuario  where id = "'+id+'"');
    tx.executeSql('SELECT * FROM usuario  where id = "'+id+'"', [], AlmacenaUsrConsultaGuarda);
}
/* LOGUEADO EXITOSAMENTE*/
function AlmacenaUsrConsultaGuarda(tx, results) {
	var len = results.rows.length;					//alert('Resultados: '+len);
	var usr = $("#login").val();
	var pas = $("#password").val();

	var id = localStorage.id_usr;  				
	var nombre = localStorage.nombre;
	var activo = localStorage.activo;	//alert(activo);
	if(activo=="S"){ //SI EL USUARIO ESTÁ ACTIVO EN EL SERVIDOR
		//Fecha de Ingreso al aplicativo	
		var now = new Date();
		var fecha_ingreso = now.getFullYear()+'-'+(1+now.getMonth())+'-'+now.getDate();
		
	    if(len==0){
	    	//alert("Insert");
			tx.executeSql('INSERT INTO usuario (id,nombre,usuario,contrasegna,activo,conectado) values ("'+id+'","'+nombre+'","'+usr+'","'+pas+'","S","'+fecha_ingreso+'")'); 
		}else 
		{	//alert("Update");
			tx.executeSql('UPDATE usuario set nombre = "'+nombre+'",usuario = "'+usr+'",contrasegna = "'+pas+'",conectado = "'+fecha_ingreso+'" where id = "'+id+'"');
		}
		window.location = "principal.html";	
	}else {	//SI EL USUARIO ESTÁ INACTIVO LO ELIMINA DE LA BASE DE DATOS LOCAL
		tx.executeSql('DELETE from usuario where id = "'+id+'"');
	}				
}

/* LOGUEADO LOCALMENTE EN EL MOVIL*/
function BuscaUsuario(tx) {
	db.transaction(TBLusuario, errorCB); 			//Crea la tabla Y EL USUARIO POR DEFECTO SI NO EXISTEN
	db.transaction(BuscaUsuarioConsulta);			//Consulta Usuario en la bse de datos
}
/* LOGUEADO LOCALMENTE EN EL MOVIL*/
function BuscaUsuarioConsulta(tx) {
	var usr = $("#login").val();
	var pas = $("#password").val();					//alert('SELECT * FROM usuario  where usuario = "'+usr+'" and contrasegna = "'+pas+'"');
    tx.executeSql('SELECT * FROM usuario  where usuario = "'+usr+'" and contrasegna = "'+pas+'"', [], MuestraItems);
}
/* LOGUEADO LOCALMENTE EN EL MOVIL*/
function MuestraItems(tx, results) {
    var len = results.rows.length;					//alert('Resultados: '+len);
    if(len==0){
    	$("#equivocado").text('Usuario o contraseña no valido!');
    }else{
		$("#equivocado").text('Ingreso exitoso,espere por favor...');
	 	var id = results.rows.item(0).id;			
	 	var nombre = results.rows.item(0).nombre;	
	 	localStorage.id_usr = id;	
	 	localStorage.nombre = nombre;				//alert( "nombre = " + localStorage.nombre);
		window.location = "principal.html";	
    }
}


/* CONSULTA SI YA INICIÓ SESIÓN EN EL MISMO DÍA*/
function BuscaUsuarioLogueado(tx) {
	db.transaction(TBLusuario);
	var now = new Date();
	var fecha_ingreso = now.getFullYear()+'-'+(1+now.getMonth())+'-'+now.getDate();
	
    tx.executeSql('SELECT * FROM usuario where conectado = "'+fecha_ingreso+'"', [], MuestraUsuarioLogueado);
}
/* LOGUEADO LOCALMENTE EN EL MOVIL*/
function MuestraUsuarioLogueado(tx, results) {
    var len = results.rows.length;        //alert('Resultados: '+len);
    if(len>0){
                $("#equivocado").text('Ingreso exitoso,espere por favor...');
                 var id = results.rows.item(0).id;
                 var nombre = results.rows.item(0).nombre;                                        //alert( "nombre = " + sessionStorage.getItem("nombre"));

                 localStorage.nombre=nombre;
                 localStorage.idcorredor=id;
                                 
                 window.location = "principal.html";        
    }
}