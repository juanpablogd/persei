/**
 * @author SFK
 */
function alerta(titulo,contenido,btn_nombre,link){

var btn_link = "";
if(link == "#") btn_link = 'data-dismiss=\"modal\"';
 

 $("body").append('<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
    '<div class="modal-dialog">' +
		'<div class="modal-content">' +
			'<div class="modal-header">' +
				'<h4 class="modal-title" id="myModalLabel">'+titulo+'</h4>' +
			'</div>' +
			'<div class="modal-body">' +
			'<p>'+contenido+'</p>' +
			'</div>' +
			'<div class="modal-footer">' +
				'<a href="'+link+'" target="_top" id="btnYes" class="btn btn-primary btn-block" '+btn_link+'>'+btn_nombre+'</a>' +
			'</div>' +
		'</div>' +
	'</div>' +
'</div>');

$('#myModal').modal({
  backdrop: 'static',
  keyboard: false
});

}