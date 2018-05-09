/**
 */
var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 );
function LimpiarUsuario(tx) {
	tx.executeSql('UPDATE usuario set conectado = ""');
	window.location = "index.html";
}

if (localStorage.id_usr == "" || localStorage.id_usr === undefined) 
{
	db.transaction(LimpiarUsuario);
}