/**
 * @author DGPJ
 * @Fecha 20130831
 * @Fecha 20130930
 */
var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 );

var nombre = window.localStorage.nombre;
function LimpiarUsuario(tx) {
	tx.executeSql('UPDATE usuario set conectado = ""');
	window.location = "index.html";
}

$("#cerrar_sesion").click(function( event ) {
	localStorage.clear();
	db.transaction(LimpiarUsuario);
});
