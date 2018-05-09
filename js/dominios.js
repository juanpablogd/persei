var nomDominio = function(esquema,tabla,code,item, opCondicion){
	if(opCondicion == undefined ) opCondicion = '';
	var q = 'select descripcion from '+esquema+tabla+' where code = "'+code+'" '+opCondicion+' limit 1';	//console.log(q);
	db.transaction( function(tx){
			tx.executeSql(q, [],
				function (tx, results) {
					var leng = results.rows.length;		//console.log(leng);
					if(leng > 0){
						$("#"+item).html(results.rows.item(0).descripcion);
					}
				}
			,errorCB);
		}
    );
}