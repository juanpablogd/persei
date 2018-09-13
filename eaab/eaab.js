/**
 * @author DGPJ 20130902
 */
var eaab_pagar={
	db: window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 ),
	id:'',
	num_medidor:'',
	vertical:'',
	esquema:'',
	resultado:'',
	errorCB:function(err) {
		if (err.code == undefined && err.message == undefined){
			alerta("Persei","Descargue formularios pendientes!","Ok","descargar.html");
		}else
		{
			alerta("Persei","Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message,"Ok","principal.html");
		}
	},
	savebase64AsPDF:function (folderpath,filename,content,contentType){
	    // Convert the base64 string in a Blob
	    var DataBlob = eaab_pagar.b64toBlob(content,contentType);
	    
	    console.log("Starting to write the file :3");
	    
	    window.resolveLocalFileSystemURL(folderpath, function(dir) {
	        console.log("Access to the directory granted succesfully");
			dir.getFile(filename, {create:true}, function(file) {
	            console.log("File created succesfully.");
	            file.createWriter(function(fileWriter) {
	                console.log("Writing content to file");
	                fileWriter.write(DataBlob); console.log(folderpath+filename);

					cordova.plugins.fileOpener2.open(
					    folderpath+filename, // You can also use a Cordova-style file uri: cdvfile://localhost/persistent/Download/starwars.pdf
					    'application/pdf', 
					    { 
					        error : function(e) { 
					            console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
					        },
					        success : function () {
					            console.log('file opened successfully'); 				
					        }
					    }
					);

	            }, function(){
	                console.log('Unable to save file in path '+ folderpath);
	            });
			});
	    });
	},
	b64toBlob:function(b64Data, contentType, sliceSize) {
	        contentType = contentType || '';
	        sliceSize = sliceSize || 512;

	        var byteCharacters = atob(b64Data);
	        var byteArrays = [];

	        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
	            var slice = byteCharacters.slice(offset, offset + sliceSize);

	            var byteNumbers = new Array(slice.length);
	            for (var i = 0; i < slice.length; i++) {
	                byteNumbers[i] = slice.charCodeAt(i);
	            }

	            var byteArray = new Uint8Array(byteNumbers);

	            byteArrays.push(byteArray);
	        }

	      var blob = new Blob(byteArrays, {type: contentType});
	      return blob;
	},
	//CONSULTA LAS VERTICALES EN EL MOVIL
	ConsultaItems:function (tx) {	
		localStorage.num_forms = 0;
		tx.executeSql('select vertical,esquema from p_verticales order by vertical', [], eaab_pagar.ConsultaItemsCarga,eaab_pagar.errorCB);
	},
	// RESPUESTA DE LA CONSULTA LAS VERTICALES EN EL MOVIL
	ConsultaItemsCarga:function(tx, results) {
		var len = results.rows.length;	//console.log(len);
		if(len == 0){
			alerta("Persei","Debe descargar la configuracíon del servidor","Ok","descargar.html");
		}else{
			for (j = 0; j < len; j++){
				var sql = '';
				var where=' ';
				var where='where r.id_envio != "" ';
				if (eaab_pagar.num_medidor!=''){
					where=where+' and num_medidor="'+eaab_pagar.num_medidor+'"';
				}
				//'CREATE table lectura_data_pdf AS  '+
				sql = ' WITH lect AS ( select e.*, CAST(e.lectura_actual  AS REAL) AS  lectura_anterior,CAST(l.respuesta AS REAL)  AS lectura_ultima,  '+
					' (CAST(l.respuesta AS REAL)-CAST(e.lectura_actual AS REAL)) AS consumo,r.id_envio '+
			        ' from '+results.rows.item(j).esquema+'usuarios_ruta e '+
					' left join '+results.rows.item(j).esquema+'t_rtas_formulario r on (e.num_medidor = r.respuesta and r.id_item =  "23") '+
					' left join '+results.rows.item(j).esquema+'t_rtas_formulario l on (r.id_envio = l.id_envio and l.id_item =  "136") '+
					where+
					' ) '+
					' select num_medidor,ctacto,direccion,nombre,telefono,uso,min,max,id_envio, lectura_ultima,lectura_anterior, consumo, '+
					' CAST(cargo_fijo_acue AS REAL)  AS acue_cargo_fijo1, '+
					' ROUND(CAST(cargo_fijo_acue AS REAL))  AS acue_cargo_fijo2, '+
					' ROUND(CAST(cargo_fijo_acue AS REAL))*(CAST(subs_fijo_acue AS REAL))  AS acue_cargo_fijo3, '+
					' ROUND(CAST(cargo_fijo_acue AS REAL))*(1+CAST(subs_fijo_acue AS REAL))  AS acue_cargo_fijo4, '+
					' ROUND(CAST(cargo_fijo_acue AS REAL)*(1+CAST(subs_fijo_acue AS REAL)))  AS acue_cargo_fijo5, '+
					' CAST(cons_basico_acue AS REAL)  AS acue_cons_basico1, '+
					' CASE WHEN consumo>22 THEN ROUND((22*CAST(cons_basico_acue AS REAL))) ELSE  ROUND((consumo*CAST(cons_basico_acue AS REAL))) END  AS acue_cons_basico2, '+
					' CASE WHEN consumo>22 THEN ROUND((22*CAST(cons_basico_acue AS REAL)))*(CAST(subs_no_basico_acue AS REAL)) ELSE  ROUND((consumo*CAST(cons_basico_acue AS REAL)))*(CAST(subs_no_basico_acue AS REAL)) END  AS acue_cons_basico3, '+
					' CAST(cons_basico_acue AS REAL)*(1+CAST(subs_no_basico_acue AS REAL))   AS acue_cons_basico4, '+
					' CASE WHEN consumo>22 THEN ROUND((22*CAST(cons_basico_acue AS REAL))*(1+CAST(subs_no_basico_acue AS REAL))) ELSE  ROUND((consumo*CAST(cons_basico_acue AS REAL))*(1+CAST(subs_no_basico_acue AS REAL))) END  AS acue_cons_basico5, '+
					' CAST(cons_no_basico_acue AS REAL) AS acue_cons_nobasico1, '+					
					' CASE WHEN consumo>22 THEN ROUND(((consumo-22)*CAST(cons_no_basico_acue AS REAL))) ELSE 0 END  AS acue_cons_nobasico2, '+
					' 0 AS acue_cons_nobasico3, '+					
					' CAST(cons_no_basico_acue AS REAL) AS acue_cons_nobasico4, '+					
					' CASE WHEN consumo>22 THEN ROUND(((consumo-22)*CAST(cons_no_basico_acue AS REAL))) ELSE 0 END  AS acue_cons_nobasico5, '+
					
					' CAST(cargo_fijo_alc AS REAL)  AS alc_cargo_fijo1, '+
					' ROUND(CAST(cargo_fijo_alc AS REAL))  AS alc_cargo_fijo2, '+
					' ROUND(CAST(cargo_fijo_alc AS REAL))*(CAST(subs_fijo_alc AS REAL))  AS alc_cargo_fijo3, '+
					' ROUND(CAST(cargo_fijo_alc AS REAL))*(1+CAST(subs_fijo_alc AS REAL))  AS alc_cargo_fijo4, '+
					' ROUND(CAST(cargo_fijo_alc AS REAL)*(1+CAST(subs_fijo_alc AS REAL)))  AS alc_cargo_fijo5, '+
					' CAST(cons_basico_alc AS REAL)  AS alc_cons_basico1, '+
					' CASE WHEN consumo>22 THEN ROUND((22*CAST(cons_basico_alc AS REAL))) ELSE  ROUND((consumo*CAST(cons_basico_alc AS REAL))) END  AS alc_cons_basico2, '+
					' CASE WHEN consumo>22 THEN ROUND((22*CAST(cons_basico_alc AS REAL)))*(CAST(subs_no_basico_alc AS REAL)) ELSE  ROUND((consumo*CAST(cons_basico_alc AS REAL)))*(CAST(subs_no_basico_alc AS REAL)) END  AS alc_cons_basico3, '+
					' CAST(cons_basico_alc AS REAL)*(1+CAST(subs_no_basico_alc AS REAL))   AS alc_cons_basico4, '+
					' CASE WHEN consumo>22 THEN ROUND((22*CAST(cons_basico_alc AS REAL))*(1+CAST(subs_no_basico_alc AS REAL))) ELSE  ROUND((consumo*CAST(cons_basico_alc AS REAL))*(1+CAST(subs_no_basico_alc AS REAL))) END  AS alc_cons_basico5, '+
					' CAST(cons_no_basico_alc AS REAL) AS alc_cons_nobasico1, '+					
					' CASE WHEN consumo>22 THEN ROUND(((consumo-22)*CAST(cons_no_basico_alc AS REAL))) ELSE 0 END  AS alc_cons_nobasico2, '+
					' 0 AS alc_cons_nobasico3, '+					
					' CAST(cons_no_basico_alc AS REAL) AS alc_cons_nobasico4, '+					
					' CASE WHEN consumo>22 THEN ROUND(((consumo-22)*CAST(cons_no_basico_alc AS REAL))) ELSE 0 END  AS alc_cons_nobasico5, '+
					' CAST(subs_fijo_acue AS REAL) AS subs_fijo_acue, '+
					' CAST(subs_no_basico_acue AS REAL) AS subs_no_basico_acue, '+
					' CAST(subs_fijo_alc AS REAL) AS subs_fijo_alc, '+
					' CAST(subs_no_basico_alc AS REAL) AS subs_no_basico_alc '+
					' from lect; ';
				tx.executeSql(sql, [], eaab_pagar.ConsultaItemsCargaAsignResp,eaab_pagar.errorCB);
		   	}
		}
	},
	ConsultaItemsCargaAsignResp:function(tx, resultsV) {
		var lon = resultsV.rows.length;	//console.log(lon);
		for (i = 0; i < lon; i++){
			var num_medidor = resultsV.rows.item(i).num_medidor;	//console.log(num_medidor);
			eaab_pagar.resultado=resultsV.rows.item(i);	
			eaab_pagar.resultado.acue_subtotal1=eaab_pagar.resultado.acue_cargo_fijo2+eaab_pagar.resultado.acue_cons_basico2+eaab_pagar.resultado.acue_cons_nobasico2;
			eaab_pagar.resultado.acue_subtotal2=eaab_pagar.resultado.acue_cargo_fijo3+eaab_pagar.resultado.acue_cons_basico3+eaab_pagar.resultado.acue_cons_nobasico3;
			eaab_pagar.resultado.acue_subtotal3=eaab_pagar.resultado.acue_cargo_fijo5+eaab_pagar.resultado.acue_cons_basico5+eaab_pagar.resultado.acue_cons_nobasico5;
			eaab_pagar.resultado.alc_subtotal1=eaab_pagar.resultado.alc_cargo_fijo2+eaab_pagar.resultado.alc_cons_basico2+eaab_pagar.resultado.alc_cons_nobasico2;
			eaab_pagar.resultado.alc_subtotal2=eaab_pagar.resultado.alc_cargo_fijo3+eaab_pagar.resultado.alc_cons_basico3+eaab_pagar.resultado.alc_cons_nobasico3;
			eaab_pagar.resultado.alc_subtotal3=eaab_pagar.resultado.alc_cargo_fijo5+eaab_pagar.resultado.alc_cons_basico5+eaab_pagar.resultado.alc_cons_nobasico5;
			eaab_pagar.resultado.vlr_total=eaab_pagar.resultado.acue_subtotal3+eaab_pagar.resultado.alc_subtotal3;
			eaab_pagar.resultado.vlr_dia=Math.round(eaab_pagar.resultado.vlr_total/60);
			eaab_pagar.resultado.vlr_mes=Math.round(eaab_pagar.resultado.vlr_total/2);
	   	}	console.log(eaab_pagar.resultado);
	   	eaab_pagar.crearFactura();
	},
	crearFactura:function () {	console.log("CrearFactura");

		var doc = new jsPDF('p','mm','a6');
		
		var imgData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAk1BMVEX///8Xf8MAesEAecAAdr8Adb/3+/0LfML7/f7q8/kAfcIAc77y+fz4/P2Ww+IWhMXR5PJElc1yqNTX6fTh7/e/2u1Wm8+hyORtrdh9tNuu0unn8vlZndDC3O7U5/NbodIuisipzOaLu94+kssoiMcAbryQvN6ryOSAttxqrNdcpNOky+V+rte40+kskMyAr9iIv+A5ozMKAAAYi0lEQVR4nO1daXuisBYmCRCIyL4LstZRK879/7/u5gQXtNpWbXXufXg/zFQMmDfL2XISJGnEiBEjRowYMWLEiBEjRowYMWLEiP9dqNqra/Cr0Cs3LOr81dX4PaRJ6qWuooT+q2vyS/Bt+FezM9nqXl2X38AseK+qXOV/qckERa+uzk9jVoUtYgxZZWxPpWlMcPDqKv0oVNOaoCZelxRjIme5pK1ly3t1rX4QQUNqMQV5VzoEMZxIxlreGi+u1s/BlAtvvtipCKOgCJGlpJWy+9pq/RwSkhpLMnF3XWaUjFPsJNua/J8I1AjnRkEQXe8HpSkjRB2d/9/8X6jF+STVGj4waaLurngE8Y+VpIZy8dKq/Qy8dikVQIks9pf0LRAOuQGA5f+DcRqWUgoEET2QUTPOELGpJC3kcvbKyv0EOpKrIFkQsub7aypIU/TGB63hTuKbHzkzXY53/UfreTeMcil1wAex5nCxZziBaTmzyI3j1C4mhFKK5cnqn1CntmJLsWBI6sNFw2F7hlJEyrlh6PrMznvMdF03jGs+JLeNKKKUUUyp8k/4YOutpCEBdhik0qxFB4aSOZnwv9/eJpOJsgNqndCto+CjKuFah9KJWwVdEmb1v9CHuhVJs4nowoH9IrQFKnfd5Jsb1605YHYVobO1mCITDkyZs8iHNOdbjIjDm0r15vb8XyAo5TiXOhn44IHMfIcr9LLJphozf55XMXdE+ECkhJRuuqeSt5S3lC7NXcdCDJVFp158xjPRYVtKgQ82B1eFsuAa/1MYebRGCihOUi7AqfQSyhAxJS2RKcNK8zdx3rYvV6cL5AmGZGi7+JYQrd/wnaZ5YREuWXhvWhaliNF3bgjxMU76KIgey+vpL1X9m6ip6EOcDWdThKELv6kHfe5tYdYLK4xSSYr53Tjei1rbCV87HZdyLvlvcjZsaMOCQSrPr950DvvvFkSPTNa8nd6VU6mlrZyXTsY/k4g7T+ZJM5vC7l7fEjTV5+91HXn8Fo83DysP5owRSFJxu1X0g+g+Og9zSyiP73fhCRa8efAxhrV4i7nZZH5yw2/DRvTMsp459NTAuQkqNA8+dCE34UklBfSFAR+9JadKoTdJ6b0ehc27kJWHj8aWscbQtne2148gI9uhGNVB1HNlfa9FucAixHN4HO9SOZJs/EKV0Sk4PMgUtSuFY4jujpS6/P6B0zzjgpU2ktGkD1bzAfBxRNY6cNRmZiiDYmP0boLCKcH24bMvTF5b2rwyaBcRRNm2WBctt6SFq2/d7/TMyp7RHoIhn+lR+0K1r4N+Z9yGpju7xHogmO+jCwy5dZQrr3T4vXLHDSqDWf1IXYRF+4HhSpq/vU5f6EFnO3IfxsByGz8WH/XJ5T6cv73M3e+2k9JXqxCG6TZOH43/+uyU4QwcMxK9jqG+fCujO82zixCjVD5OZNCHiOZScImhYf6+SZ4QKw+t7ziC34RgSI5mqAFznNtH0Zv9sbBb/rqAzQlJ8wlXDz/miBsNH6b0aMyrIUV4LUmbt4/yq5v8+gqs0WBHCiYQhvipyKbmwkSkRxttQ8FLMZqP+tCnv2+s5grXxTOhK0iT/kwODdilCB9ttIiAlWqT7HzKeeVNDuh9WJGGSxmvAXnHTbcf6cZAeM9HS1dvY96hhbw4K6dvm9+3cvggFUuiqkmZiLG8/4ADoPXu81HWANeO4DNRajTFE7wNv8V/+7/eLRhbjCU/sByaiE48yXEwuE99OiK15ClJEDbaM5T8tSL8XmQ+PHTmQufT9thY2prIp0JFzcqnLC3nR4aSVjXC3iLNwxJ8KSLotNw/aFZQ1p4Q8hznOXZ4jujm+MlYMNGNxL2gm2+C0xu5xE3n2iyo+QzAJ/o2t4onuVK2RYthW/ouERzpo9b3zlehXIAxik/kjgTBuKdlk/ktLU/6S7NDwREj8yFVZVtHdwzM1GG4VC/I82xwrWHny7t8Oso7A+ARYe71T+l7Ul4OlH2FnGc6iitMP4SD1bQBZ5/ibf6A4a+avPUgbECsbNBlvoOeu2gaKIh9nHLTwIF4DZWz6oGxOs3NVVjE1aDH9EQunuzpGy2lyaUvgrVMQKxuq59o8UAMBn85KZ+/llhjxC62quYnJR+slLTRw6rZn8SS5q1QGb0g3OZz1+baupC3tLi4YIplPpgxpLXW+5LShwJc9yPhnXh1LVtPM0S4zLES+5HW99eUlstXBRP1kFLrug2j2UuEMSXMuXeEzUzeShQ9aiY9AN+iH1y3E2h5YskYy0rR3SoH/W5Rvk2ahV8r6weqeBcM46DPg+2XcSgjcBvQbVYW2d8bbKrvBYlj8b6vPRWMJ/bMTpx15tJ1/y66nZD0viMs/aogsFDPsrr6YlJOvSD660AOVVN3u6Kx8qz1Q9VOLMspXDcsFZmU0S1SUg3qsJVlGRKhmvUyCnLbtv09+N95ENUrB2GiTOQyS7pBQ3iUPEdTGOs2zn34LU2345bIN6qoqW+bq8bijtFEUSYTzFC5B2MU0t4Isspsmc5nZ9bQWv4i++iHoM2H5rS+JJhsbzf0Z3ZXRUkRbq1WFul8b2/UsppwnURVZ18eFpXy9+L138a8wVSO71XomqapO0z535+WXcmb12z4gwR9Upq/r41L8iKGkhFBrityOJpilUSd/StrJR7BrxmlgNwhlAlQigmxmuUvRMEWGL9wH5xWOYzgHlytM0KWD0r2D3PSaOh5RPi50LS5BwiqukAyQ6S5Wfionh10i2RVNI5jIdTCoI9rs7PBpAFPG/1Cve/CdGaWFOEbIu6q7kVx2LTcl4QhcATmY15GbVPUtkPxS3P3zuA7dLiI+ylUu4q5ddRTw0RWJshqnR7cMpgoMph6CvdC/6m9mmqBqfONTtTzVYkI5iKKUKt0ssQMbH8GGxV66Pps3plrBzJsWLv6HSl9H3xE2ZeCId+UChabKsp1FHzmc1QUMYQVElb/DsclxctPFbTagY6hhDh/q6+Ui+ZSGqqBSxX58TWRn4LNh90nnaKmnB9izDH97+iVjSJGhL9sCYlfuxXK20++KULydZfVz2AljoTf7RCj2w35WSIrzQvjGZJ2UIOaQ6+vnuQtZFtY0WEz5pd1PlgAWmeRB7ICH0awPQyhGF/dipAi6MBB5KOaxJ8JXsMsHKfYT1Z7K78wKlUfU0AjAvtHLyHlchHJJ4FyUymuC8mUTqy/i8VBHIE386qdxarzfvi7I6y5KBNUIMjM005bKlcTgFMGu6CG0B05fLLWsHfLl/rbsW1zhi5nEoCF+cEC88iVDuealRTnamdOlef6GeaE9o3ckWNdPGuYyTyA2AN2Psp8Wl55eIwvzLrF2zO3hxtLudwJt6VzvKyVTL7Y0L4i8vBOYZLy8tNniDofr6rdTyZDfgGtmBzmWzgMfWf049qpQEzQeZq73soXl+h4o5F796X8FKaFcvCT7HYY73uXEb1ot6k1N9dOIoP+lliXpaOGkfJKBc+xnBwFXXeyxcJnw+y7E1SI0GK+p6+mLcFXFj5z+nHOPhcpGWSwwk7LI6YwTK8Y33ahEOxW3kyfBQtHlq8aYhG+onOeBUjfPVZgfWprV1wrXLOvjMhBCi2bprRk2boab9U2lH7IuXwmpglG+CBdtG17+nXIO/G6NWZH660lt07yifOk8ke89HibDlNED0eWTWlz+rVN0ee50Zq2D3Tbq2M35seRYFiIvi5KyrHFTosOW9TUczXMZyL+nqg3nKOr1Q1WYHT5tQxzglOHkT+7j/4HQ2Nx1fo+QyAf9vlq5WDyzjnDT5eXfxk1ptOQ4v1OwfkHhtxAa7+z1jB1JgfzZyFnxy9ybhy8cHesSNNfUbpfYP/IMFe+x9Ak1l7n+NZkIH+r1zL0CU5AXu79BMFQCwZxF268fMdCtpWjaWDKzuAB0bMZGidRo5SQP9OGHdSFN+E2stocXUSvZcPVFK+uzTQNPM/zfV/XdVXtVYlXkuwQpCjJcN49m6EfNkPhz6dh51vokH05fSs1SXObfW3zhlJnoMsdhRBZViYTBVlW0zRFUWz+bhamg49uVo7p8CcW+KkMDQeT4RBysZUHGB0yaLUWzOcOF54xVXU7JvQ0dTlTyAlkAQiaHv3hBT7JdEy4vk186PXZbMaf+svmjSkjvBx8zqiV8350D6QdQSieICcMG8yb/zR12Y/MHeIjEq5Q8YGUVlA0tIISCFlB4j5kMvCnhpnruknNh3tVVYHdL0v9GHyLkffBZ9Whjd3SQVR0oUADTGOlX0KSv3PqSseGKdx6SbfDb4Gh1XJYTRg6B4TuHj8aATfJSQ9KesOaCOGBsOx63aDlbsNb3A2+Ec2eWWxou87kUxMBRmnaL9KoQ2g7PMboDEZL0UmV/ZY6azoUDHa512WG739v+TAhw6OluAI9jVkkZ1P5VxHIZ+EEG5J96MkGx+xqpukVeNBHg8+R/EKGNT5Lys/FOVAnGj0hNx6FUcusGQoLk5wydOl1F/PH4Z4MSAkMFtgHcSItTfLJaswFqCU7TeWK8SnDjDN8WuJ6dr7SsgUpfnrmY07IiTD6Cp01DBFIFxk+KV8PfozRZii75hh9YOjLl4Kb12EyehqeD08jkNOQUetpiVAxRcOJqG64U8EZnkTTdHlwrMw3wC3zkxiFZ6GTPXiGw75luv8M3mH3xHGWBRDW5UbpSSCXM2xvETULbrgO+7DjrTg02rhCIs87skW3GKLtvhfnXFM3kkNPQzNz3oe3DKqUj/NBi3jNWWTNZvT3t9sfwY1sbmk6nW8Y8whS2HLuj5/G5xN62zycNhSvDp9gR/jpqF0R/MT1Ca6O++1abVNasIWiA8+O0eOqr1TxafT+yQM+IuVNFNp9t3twKi8bOi/clbrtcQ/DLoRJDfl5ciGmZEoQDncKy+Bygzq3DSqNW22UFFFgBzWc0cbV33FM5Nbz9lEe4FdLFxxXc6+Gl3xgoTr37HzR4rPt199CzeAsVgHGqor7lDuKsyVpX5M7o+r6QEmrsczln9Vs+70/t1dJS7cU91l6bSVpMcFWbavaPHKUhzcT/xAqpFCoI5atO1Oh7YVbOO4yFVK0K9Abh+LU/84bB2Zp0TSNE6cPrBGpxkHJaLofBN7snzh6dgDjX6vQiBE/Bbvrbt6v9z8FzcVMving69n2Nzf3/RvQXHp2GsQXUJ2J/Pac/V0/g9sZhvTMI/3HMTL8gN9h6HXLOMziJB1uBZhX8cpZLffZZToXAAeZqIE42FkAflDH4Tqp7EF8WA/M2FkncPjgjiHsHj1mj/IP9v4w/mC5CtfxcVPtOUNegD8/juzvb185h11YYhUCE5k5O7taywskYwzX0Fpw5G4eO4SU4IDVfjuJUbdE3Cyz8JDOsChhkyy/10pmO4bu0PO1uaPd5+X4y1YUxTJ1Uo0/LUlKiNAmHDH8gB+LAvz59O7zN1IqziXldCAxu28+NREH0LD+cC8G11IF0QFDihSogN0Q4TLDYetcK4hmnoaE7W8mZYMuMOROimCYwib83c9QOZZmJekPfwXAtucc4WGBuyjmcCgSbWCRR7wHCFLMpv0Lcywnc/pj19Odq37ehzZkc9OS3ysKioC/7xBxOo8TOq04U+p6H1biTE/WZKEoSdazLTueyENqKYeWo8zhBbAocA/FGI7vN8UU8U1eS0hV7sTvbXLf8PMM9y8HuMgQviQL8PFmgYP7QF0ijjtxA36zvUD0E4Yz8UIsp/OMmV2Lhjab/uh9BjGGSQ1zEpGw83V9V+COBQ7VQtbxYELuzpOlpIsX5uwepnWCBbzc4gNDyCo8HPMNI5eTmEGrH1J+dRdfZwhtoexPFvL5CKLN3Js7sNoIa8KeAT/Nkl2/zaG/T1YevwnYJc+nz9TQZ14Q819ZiyztQfgk4Y8OLzKM8TC7VxxCrpv4pKmnxVVJY7RseK5gjizLmkvaUZaqK/78Y+pjBaPtzpiAXi2zxpIVOLWJM4SKD2KYxnw+9y4ytOBk3Crao4UZC1Sy43TRrspSIwDpNIiJ8J+Zq0N9OOPFBi/ZmcEJoPfkNGhdCHvLhLTqGYaQO3Be7OM8zFVxLPtxsyQImCRkaJjo9gnDiv/78TDPAUMbjjEfRJNrfFcGnJ4JgY2hgrAHkDNs2CDf8hOGPkbnoAVnOAwQfsLwD0EXlkAGDAN5rzZ7LO5iaDhC9Dl/q1yXNHjGGta7Pp6KeoGhDn1onQCtrzHEHxjC+7HKD4bKgKFYnz1juDkv/yVgDZSFXj9YdgxhHg5XxOA0BJiHzDmbh3A2fmroJ+CSZbgZatCH+MI8tAYRfQ0OXRgyhD0NytF7NmAc3LR2CdD5iGSHva47hhVvu8GybJ4VRWHAq5AOuXdqz5Drh8GaBBxBqoHCYcN18B3DDR4IoF6WwmnJg4wxg/9KGAwZ6i0dvj/BhvI3e45w+js7jEjRSms4+IpPqEN/bTEljZgUh/VtGGCcYQTy+9AUUbvdWnMbXih0PCso3Wl8GCuHVbkVFRMMjoY8niG2hKPpbMFwN8w1uOm4TQ+K45u9f2jHfdvqFdhMkGgJahqvxcOMQBxR2YnXc9EM6qj5S9Qz1LlGY21/6J5WcfMKN4awQ3AhvBTVW4MAA4awTwjH4ihbX7wlijOEk3ZpmcMImvox6187BAxpBgWnqgftb/Un2PgrqNSVPSmfwID6oNrTvTxyFKEx1rCrCsyp7aLq/qxBR5JE5eMZau5UXcU9B7Q7b9wEec42nW2nwlaHBfHcghc7sITfvGF4b5fCCyw4cX5xaQnDjDMUL3yiKPkDF8n+hScZ2xVMaimGt4CS4k+XLkoQGOiOmFYljj+2WgteHUZ2DKUA9RqECVOfCLETicwT2JfNLUSrZ6gJa1GYx2DKIKFjAqEZeTHIgbd2voWwf+EgT3DJmp4hNw/FRcJ9E+Df5wdGSn83kQt4Ee/+R2HmXD9R7TMkuH/NFKPEqkyZ9gnKebN/+xR38/rXjmox2Z03Srawh7k/R7yzCN0VJG3eD/e8PJS08oVMFWCoN4eLhS9TLBSdHu/elQE/v9twamxJ/0CYzQav3qFAe2fajb3ZElmm5YYLMM/duLsN6MGmYbKssLA+uOY5d5XhSsX7jhfcCfqo2EKCpeUe99FPq6xVZBllkSp1vKRoC63KEL/dKvhIdjebpJfLfh1acPv2mKCncg+DX6KtEKOemZ0XuB1Co+004iBVrld0wzV39XhlUG7a33/iuqnGvuTgieJ24+zi7qEnt/e/bKhXC4wY8a9CDx6K9s++f/fsobzkLxZGd+vrxu6/gf1nrJL7ljBDyNjtyiIrPb3lz+W2oWEJ29mH5KG1sHjEFXUL1N63brPSJKMtuKXyxgVw85/QYaGTq9tYkzwchmUwX/tQVt8K8RBB9rvjhA23afgPhRnUvrJCx5lLbhM6tTiPXZlYgdQxLm07KWhlxrWo7yiEmfYb//AWSol8ZRPqF7BDt5J8ULZpumcYrfvtkD6apf1eA37F7xn6/Gf0pS+ZS8eW0nLrS2Wn6VsD9MI2kObAO/NcH8j1DLXtklN3/Km+qn2US9oGjIo/Mbz5y3BtaQoWu4u6Dq191Ng5tXxujfohmoc09ZxJZJvYtb0ZKeW7tguvA7uZdq6k5rmnw/sIw1x1/Kj3dKJmK9SwH/pm3TOs+m8MR+c3pYXJHeaOa2ley9CuQslrui6sThimicEbEA6Q950UkvTm4KP8ARNzO3Pd+q8v3uhRZLQKYG9UTZdkIeVd5ykO18uTROoId3wXlp1ZdwxTm9Um67q1ZJgr1xB9mHeWudylYq17K3/BryBdMHwHhip3JMyaeV2hrirOEKjAXVbubdPU6eYDhkazMp21YOiFnSMYqjuG7cxNPYjn8z5MaqsQDBP6H7KcZojlsgPvYOkZ+qwx13d0olaYQVeVesufnLrqNpXsxneiLqj7GFciPLVZya/Etbo1NG1m2Xwo2tuqC5ZumqnGFgmGWvneBVFhwyiNoQ9VjQ9eVeM2T9AFTe74mh2aM6ua6uJdlXyU+ovG2FlGWsHMClmzsjUX8taw6DLImLeSNxFkznfyRooV7j9a+ObjxXzhyS1s3w0zbhZ5rlPkNlhLmiuGZyRMwQp60ljPw6JwZ3bhFGkOpua0SGuV23K5ZMRSLqy9OOetPK/9hb4qiszm/xRi2SOo66zYVGAXhqF4uVGQFW5tSGZWZPCsRZZlGxsqEG58yf8bOsVGN+qwAWMtz6LZGmrFJ8DNnSjcezChdskk3DjqDardv9Lx7yn32GCjlgZlxHVVfCH8u8Nd/RUNyqqSOA5yV3S/3WdnjO0+w6mR2u7/4ddq/7/a1wqiG1r/mJsZjhgxYsSIESNGjBgxYsSIESNGjBgxYsSIESNGjBgxYsSIESNGjBgxYsSIESNGjLiA/wLkU7geopY9ogAAAABJRU5ErkJggg==';
		
		//Variables Datos de Usuario
		var uNombre = '' + eaab_pagar.resultado.nombre;
		var uDireccion = '' + eaab_pagar.resultado.direccion;
		var uEstrato = '3';
		var uClaseUso = '' + eaab_pagar.resultado.uso;
		var uUndHa = '1';
		var uUndNoHab = '0';
		
		//Variables datos cuenta contrato
		var cNumCuenta = '' + eaab_pagar.resultado.ctacto;
		var cFactura = '' + eaab_pagar.resultado.ctacto;
		var cValor = '$ 152.827';
		var cPaguese = '3 DIAS DP LECT';
		var cFechaPago = 'MAY/15/2018';
		var cFechaSusp = 'MAY/30/2018';
		var cVigencia = '3';
		
		//Variables ruta lectura
		var cZona = '3';
		var cCiclo = 'G3';
		var cRuta = 'G33250';
		//Variables datos del medidor
		var mMarca = 'IBERCONTA';
		var mNumero = '' + eaab_pagar.resultado.num_medidor;
		var mTipo = 'VELO015C';
		var mDiamet = '1/2"';
		
		//Variables datos de Lectura
		var lUltima = '' + numeral(eaab_pagar.resultado.lectura_ultima).format('0,0');
		var lAnterior = '' + numeral(eaab_pagar.resultado.lectura_anterior).format('0,0');
		var lConsumo = '' + numeral(eaab_pagar.resultado.consumo).format('0,0');
		//periodo de lectura
		var pFecInic = '6/02/2018';
		var pFecFin = '6/04/2018';
		//Variables de periodos de lectura
		var pLect1 = 'OCT-DIC';
		var pLect2 = 'DIC-FEB';
		var pLect3 = 'FEB-ABR';
		var vLect1 = '8';
		var vLect2 = '12';
		var vLect3 = '15';
		var vLectAVG = '17';
		var imgGrafico = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOkAAABdCAYAAABAbEGAAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAO1SURBVHhe7d3tTRwxEIBhSqMKqqAJmqAJikC0QTOXTMRIjrXsrTGwc7vPI42SAD/zyvthH3cXoDSRQnEiheJECsWJFIoTKRQnUihOpFCcSP96e3u73N/f/zdQxekjfX9//xfly8vLx1cul8fHx8vDw8PHv2Bfq5G+vr7e3IyKOPuVc+lrsJfTR5qXuvFnenp6spJSxukjDRFlhPr8/PzvUjf+HpfBUIFIP2SoGStUIdK/IsxYQUNe/rrcpYrTR7p0/5mhtk98YS+rkZ5BrKARak+kVHH6SOP+M4JsHxQtfQ32cvpIQ/vQKEegVCFSKE6kUJxIoTiRQnEiheJE+ktiw0Q8Ne7lUbl2oCXSH9YfKO9FvO0JnPi3LYm0RPrDIszYHJEbJK7Js6ze05JWI13aG3vmmbE10lx5RUoS6cDM2Brp0oZ/zk2kAzNjS6T5ECl+FpJIB2bGlkhjBc1zrZBEOjAzrkWaH9sCPZEOzIy1SPMUDixZjZTv81mk+XVPc/mMSH9YBLg0uYFh6Xsx7k1JIoXiRArFiRSKEykUJ1IoTqRQnEhvSG56aM+fhjze1k//c9wmkd6Itfj8PtVjW410aWucmZ9RsbEhJs+aivRcRLrDfJVIz0mkO8xXXYu0ndgTzDGIdIf5qs8i7WW0Qj0Gke4wX7U10hD3sD6G5RhEusN81UikPivpOFYjpZbRldRxt2MQ6Q35LNJYMdtD43mQfEvM1CfSGxArYkTXTz4Yyijb8UkPxyFSKE6kUJxIoTiRQnEiheJEChPytVg7vf7p/Oh2TZHChP4ddf/7fGIfdez+SrmveuQd9mqkS1vajDnyzMp31mtGV1ORGtPMrGt7pvPXW8aKupVIjWlmRt6frq2SeX86QqTGNDMqV8ac9v4z5QfI5Yxu2RSpMc3MurZSbllteyI1ppnvcC3CLQ+XWquRAuNECkXEpWv/JDfvP1Nc/rZPcvMe9tsud4F1/UOhNtDQP1iKGQk0iBSKEykUJ1IoTqRQnEihOJEeVO5s6bepLT2NzBnZ9M3vEekBtSH2kS7JoEf3lPI7RHoweag4gosX7VsijRfu7UFlalmN9O7uzuw8M7ZEmi/bXerWJdLiM2NLpPH9tUPK7E+kxWfGlkhjFR3dpsbvEmnxmXEt0vb+lbpEWnxmXIt0y0rL/kRafGasRZivXeJPapv7X0Bpa5HGK5f4PvWJ9GDyPrOfNsh87eKB0W0QKRQnUihOpFCcSKE4kUJxIoXiRArFiRSKEymUdrn8AWEtfwbrDSK6AAAAAElFTkSuQmCC';
		
		
		//Variables de Datos de Acueducto
		var aCargoFij = '1';
		var aConsBas = '22';
		var aConsNoBas = '11';
		var aCargoNoRes = '';
		var aConsNoRes = '';
		
		var aCostoUnitCF = '' + numeral(eaab_pagar.resultado.acue_cargo_fijo1).format('$0,0.00');
		var aCostoUnitCB = '' + numeral(eaab_pagar.resultado.acue_cons_basico1).format('$0,0.00');
		var aCostoUnitCNB = '' + numeral(eaab_pagar.resultado.acue_cons_nobasico1).format('$0,0.00');
		var aCostoUnitCaNR = '';
		var aCostoUnitCoNR = '';
		
		var aCostoTotCF = '' + numeral(eaab_pagar.resultado.acue_cargo_fijo2).format('$0,0.00');
		var aCostoTotCB = '' + numeral(eaab_pagar.resultado.acue_cons_basico2).format('$0,0.00');
		var aCostoTotCNB = '' + numeral(eaab_pagar.resultado.acue_cons_nobasico2).format('$0,0.00');
		var aCostoTotCaNR = '';
		var aCostoTotCoNR = '';
		
		var aSubAportCF = '' + numeral(eaab_pagar.resultado.acue_cargo_fijo3).format('$0,0.00');
		var aSubAportCB = '' + numeral(eaab_pagar.resultado.acue_cons_basico3).format('$0,0.00');
		var aSubAportCNB = '' + numeral(eaab_pagar.resultado.acue_cons_nobasico3).format('$0,0.00');
		var aSubAportCaNR = '';
		var aSubAportCoNR = '';
		
		var aTarifaUnitCF = '' + numeral(eaab_pagar.resultado.acue_cargo_fijo4).format('$0,0.00');
		var aTarifaUnitCB = '' + numeral(eaab_pagar.resultado.acue_cons_basico4).format('$0,0.00');
		var aTarifaUnitCNB = '' + numeral(eaab_pagar.resultado.acue_cons_nobasico4).format('$0,0.00');
		var aTarifaUnitCaNR = '';
		var aTarifaUnitCoNR = '';
		
		var aValorTotCF = '' + numeral(eaab_pagar.resultado.acue_cargo_fijo5).format('$0,0.00');
		var aValorTotCB = '' + numeral(eaab_pagar.resultado.acue_cons_basico5).format('$0,0.00');
		var aValorTotCNB = '' + numeral(eaab_pagar.resultado.acue_cons_nobasico5).format('$0,0.00');
		var aValorTotCaNR = '';
		var aValorTotCoNR = '';
		
		var aSubTotCosto = '' + numeral(eaab_pagar.resultado.acue_subtotal1).format('$0,0.00');
		var aSubTotSubAp = '' + numeral(eaab_pagar.resultado.acue_subtotal2).format('$0,0.00');
		var aSubTotValor = '' + numeral(eaab_pagar.resultado.acue_subtotal3).format('$0,0.00');
		
		//Variables de datos de Alcantarillado
		var alCargoFij = '1';
		var alConsBas = '22';
		var alConsNoBas = '11';
		var alCargoNoRes = '';
		var alConsNoRes = '';
		
		var alCostoUnitCF = '' + numeral(eaab_pagar.resultado.alc_cargo_fijo1).format('$0,0.00');
		var alCostoUnitCB = '$  2.245,47';
		var alCostoUnitCNB = '$  2.641,72';
		var alCostoUnitCaNR = '';
		var alCostoUnitCoNR = '';
		
		var alCostoTotCF = '' + numeral(eaab_pagar.resultado.alc_cargo_fijo2).format('$0,0.00');
		var alCostoTotCB = '$ 49.400';
		var alCostoTotCNB = '$ 29.059';
		var alCostoTotCaNR = '';
		var alCostoTotCoNR = '';
		
		var alSubAportCF = '' + numeral(eaab_pagar.resultado.alc_cargo_fijo3).format('$0,0.00');
		var alSubAportCB = '-$ 7.410,00';
		var alSubAportCNB = '$        -';
		var alSubAportCaNR = '';
		var alSubAportCoNR = '';
		
		var alTarifaUnitCF = '' + numeral(eaab_pagar.resultado.alc_cargo_fijo4).format('$0,0.00');
		var alTarifaUnitCB = '$  1.908,64';
		var alTarifaUnitCNB = '$  2.641,73';
		var alTarifaUnitCaNR = '';
		var alTarifaUnitCoNR = '';
		
		var alValorTotCF = '' + numeral(eaab_pagar.resultado.alc_cargo_fijo5).format('$0,0.00');
		var alValorTotCB = '$ 41.990';
		var alValorTotCNB = '$ 29.059';
		var alValorTotCaNR = '';
		var alValorTotCoNR = '';
		
		var alSubTotCosto = '' + numeral(eaab_pagar.resultado.alc_subtotal1).format('$0,0.00');
		var alSubTotSubAp = '' + numeral(eaab_pagar.resultado.alc_subtotal2).format('$0,0.00');
		var alSubTotValor = '' + numeral(eaab_pagar.resultado.alc_subtotal3).format('$0,0.00');
		
		//Datos de otros cobros
		var cobrosTotal = '$       -';
		var cobrosSaldos = '$       -';
		var adeudaTotal = '$        -';
		
		//Valores de la factura
		var facturaTotal = '' + numeral(eaab_pagar.resultado.vlr_total).format('$0,0.00');
		var consumoMes = '' + numeral(eaab_pagar.resultado.vlr_mes).format('$0,0.00');
		var consumoDia = '' + numeral(eaab_pagar.resultado.vlr_dia).format('$0,0.00');
		
		//Valor factura Aseo
		var operadorAseo = 'AGUAS DE BOGOTA';
		var valorAseo = '$ 25.777';
		
		//Pie factura datos agua
		var imgAgua = 'data:image/png;base64,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';
		var numeroFacAgua = '(415)7707200485271(8020)31416528813(3900)152801';
		//Pie factura datos aseo
		var imgAseo = 'data:image/png;base64,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';
		var numeroFacAseo = '(415)7707200485271(8020)31416528813(3900)25777';
		
		//Logo de EEAB y marcos de la factura
		doc.addImage(imgData, 'PNG', 5, 5, 15, 15);
		doc.rect(5, 5, 15, 15);
		doc.rect(20, 5, 75, 15);
		doc.rect(5, 20, 50, 23);	
		doc.rect(55, 20, 40, 23);
		doc.rect(5, 43, 90, 17);	
		doc.rect(5, 60, 90, 40);
		doc.rect(5, 100, 90, 10);
		doc.rect(5, 110, 45, 10);
		doc.rect(50, 110, 45, 10);
		doc.rect(5, 120, 90, 5);
		doc.line(5, 135, 95, 135);
		
		
		//Datos de Usuario
		doc.setFontSize(6);
		doc.setFontType("normal");
		doc.text(22, 7, 'Datos del Usuario');
		doc.text(22, 16, 'ESTRATO:');
		doc.text(57, 16, 'CLASE DE USO:');
		doc.text(22, 19, 'UND. HABIT./FAM:');
		doc.text(57, 19, 'UND. NO HABIT:');
		doc.setFontType("bold");
		doc.text(22, 10, uNombre);
		doc.text(22, 13, uDireccion);
		doc.text(47, 16, uEstrato);
		doc.text(77, 16, uClaseUso);
		doc.text(47, 19, uUndHa);	
		doc.text(77, 19, uUndNoHab);
		
		
		//Datos de la Cuenta Contrato
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(10, 22, 'CUENTA CONTRATO');
		doc.text(7, 24, 'Número para cualquier consulta');
		doc.text(7, 27, 'Facturade Servicios públicos No.');
		doc.text(7, 29, 'Número para pagos');
		doc.text(7, 32, 'Valor Total a Pagar:');
		doc.text(7, 35, 'Páguese antes de:');
		doc.text(7, 38, 'Fecha de pago oportuno:');
		doc.text(7, 40, 'Fecha para evitar suspensión:');
		doc.text(7, 42, 'Vigencia:');
		doc.setFontType("bold");
		doc.setFontSize(6);
		doc.text(37, 23, cNumCuenta);
		doc.text(37, 28, cFactura);
		doc.text(37, 32, cValor);
		doc.setFontSize(5);
		doc.text(37, 35, cPaguese);
		doc.text(37, 38, cFechaPago);	
		doc.text(37, 40, cFechaSusp);
		doc.text(37, 42, cVigencia);

		
		//Ruta y Datos del Medidor
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(57, 23, 'ZONA:');
		doc.text(57, 25, 'CICLO:');
		doc.text(57, 28, 'RUTA:');
		doc.text(57, 31, 'Datos del medidor');
		doc.text(57, 33, 'MARCA:');
		doc.text(57, 36, 'NÚMERO:');
		doc.text(57, 39, 'TIPO:');
		doc.text(57, 42, 'DIÁMETRO:');
		doc.setFontType("bold");
		doc.text(77, 23, cZona);
		doc.text(77, 25, cCiclo);
		doc.text(77, 28, cRuta);
		doc.text(77, 33, mMarca);
		doc.text(77, 36, mNumero);	
		doc.text(77, 39, mTipo);
		doc.text(77, 42, mDiamet);


		//Datos de la Lectura
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(7, 46, 'ULTIMA LECTURA');
		doc.text(40, 46, 'LECTURA ANTERIOR');
		doc.text(78, 46, 'CONSUMO');
		doc.setFontSize(6);
		doc.setFontType("bold");
		doc.text(25, 46, lUltima);
		doc.text(60, 46, lAnterior);
		doc.text(90, 46, lConsumo);

		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(7, 50, pLect1);
		doc.text(7, 52, pLect2);
		doc.text(7, 54, pLect3);
		doc.text(7, 56, 'ULTIMO CONSUMO');
		doc.text(7, 58, 'PROMEDIO');
		doc.setFontType("bold");
		doc.text(25, 50, vLect1);
		doc.text(25, 52, vLect2);
		doc.text(25, 54, vLect3);
		doc.text(25, 56, lConsumo);
		doc.text(25, 58, vLectAVG);
		doc.addImage(imgGrafico, 'PNG', 33, 48, 30, 10);
		
		doc.setFontSize(6);
		doc.setFontType("bolditalic");
		doc.text(71, 52, 'Periodo Facturado');
		doc.setFontType("normal");
		doc.text(70, 55, pFecInic+' - '+pFecFin);

		
		//Detalle de la factura
		doc.setFontSize(5);
		doc.setFontType("bolditalic");
		doc.text(47, 63, 'Costo');
		doc.text(62, 63, '(-)Subs.');
		doc.text(74, 63, 'Tarifa');
		doc.text(11, 65, 'Descripción');
		doc.text(30, 65, 'Cantidad');
		doc.text(41, 65, 'Vr. Unit.');
		doc.text(51, 65, 'Vr. Tot.');
		doc.text(61, 65, '(+)Aporte');
		doc.text(73, 65, 'Vr. Unit.');
		doc.text(83, 65, 'Vr. a Pagar.');
		
		
		///////////////////////////////////////
		//Detalle de Acueducto
		/////////////////////////////////////
		
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(7, 68, 'Acueducto');
		doc.text(9, 70, 'Cargo Fijo Residencial');
		doc.text(9, 72, 'Cons. resid. básico');
		doc.text(9, 74, 'Cons. resid. NO básico');
		doc.text(9, 76, 'Cargo fijo NO resid.');
		doc.text(9, 78, 'Cons. NO resid. (m3)');
		doc.setFontType("bolditalic");
		doc.text(7, 81, 'Subtotal Acueducto (1)');
		
		//Cantidad
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(32, 70, aCargoFij);
		doc.text(32, 72, aConsBas);
		doc.text(32, 74, aConsNoBas);
		doc.text(32, 76, aCargoNoRes);
		doc.text(32, 78, aConsNoRes);
		
		//Costos Unitarios
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(39, 70, aCostoUnitCF);
		doc.text(39, 72, aCostoUnitCB);
		doc.text(39, 74, aCostoUnitCNB);
		doc.text(39, 76, aCostoUnitCaNR);
		doc.text(39, 78, aCostoUnitCoNR);
		
		//Costos totales
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(51, 70, aCostoTotCF);
		doc.text(51, 72, aCostoTotCB);
		doc.text(51, 74, aCostoTotCNB);
		doc.text(51, 76, aCostoTotCaNR);
		doc.text(51, 78, aCostoTotCoNR);
		doc.setFontType("bolditalic");
		doc.text(51, 81, aSubTotCosto);
		
		//subsidios o aportes
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(61, 70, aSubAportCF);
		doc.text(61, 72, aSubAportCB);
		doc.text(61, 74, aSubAportCNB);
		doc.text(61, 76, aSubAportCaNR);
		doc.text(61, 78, aSubAportCoNR);
		doc.setFontType("bolditalic");
		doc.text(61, 81, aSubTotSubAp);
		
		//Tarifa Unitaria
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(73, 70, aTarifaUnitCF);
		doc.text(73, 72, aTarifaUnitCB);
		doc.text(73, 74, aTarifaUnitCNB);
		doc.text(73, 76, aTarifaUnitCaNR);
		doc.text(73, 78, aTarifaUnitCoNR);

		//Valor Total
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(85, 70, aValorTotCF);
		doc.text(85, 72, aValorTotCB);
		doc.text(85, 74, aValorTotCNB);
		doc.text(85, 76, aValorTotCaNR);
		doc.text(85, 78, aValorTotCoNR);
		doc.setFontType("bolditalic");
		doc.text(85, 81, aSubTotValor);

		///////////////////////////////////////
		//Detalle de Alcantarillado
		/////////////////////////////////////
		
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(7, 84, 'Alcantarillado');
		doc.text(9, 86, 'Cargo Fijo Residencial');
		doc.text(9, 88, 'Cons. resid. básico');
		doc.text(9, 90, 'Cons. resid. NO básico');
		doc.text(9, 92, 'Cargo fijo NO resid.');
		doc.text(9, 94, 'Cons. NO resid. (m3)');
		doc.setFontType("bolditalic");
		doc.text(7, 97, 'Subtotal Alcantarillado (2)');
		
		//Cantidad
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(32, 86, alCargoFij);
		doc.text(32, 88, alConsBas);
		doc.text(32, 90, alConsNoBas);
		doc.text(32, 92, alCargoNoRes);
		doc.text(32, 94, alConsNoRes);
		
		//Costos Unitarios
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(39, 86, alCostoUnitCF);
		doc.text(39, 88, alCostoUnitCB);
		doc.text(39, 90, alCostoUnitCNB);
		doc.text(39, 92, alCostoUnitCaNR);
		doc.text(39, 94, alCostoUnitCoNR);
		
		//Costos Totales
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(51, 86, alCostoTotCF);
		doc.text(51, 88, alCostoTotCB);
		doc.text(51, 90, alCostoTotCNB);
		doc.text(51, 92, alCostoTotCaNR);
		doc.text(51, 94, alCostoTotCoNR);
		doc.setFontType("bolditalic");
		doc.text(51, 97, alSubTotCosto);
		
		//Subsidios o Aportes
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(61, 86, alSubAportCF);
		doc.text(61, 88, alSubAportCB);
		doc.text(61, 90, alSubAportCNB);
		doc.text(61, 92, alSubAportCaNR);
		doc.text(61, 94, alSubAportCoNR);
		doc.setFontType("bolditalic");
		doc.text(61, 97, alSubTotSubAp);
		
		//Tarifa unitaria
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(73, 86, alTarifaUnitCF);
		doc.text(73, 88, alTarifaUnitCB);
		doc.text(73, 90, alTarifaUnitCNB);
		doc.text(73, 92, alTarifaUnitCaNR);
		doc.text(73, 94, alTarifaUnitCoNR);
		
		//Valor Total
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(85, 86, alValorTotCF);
		doc.text(85, 88, alValorTotCB);
		doc.text(85, 90, alValorTotCNB);
		doc.text(85, 92, alValorTotCaNR);
		doc.text(85, 94, alValorTotCoNR);
		doc.setFontType("bolditalic");
		doc.text(85, 97, alSubTotValor);
		
		
		//Otros cobros
		doc.setFontSize(5);
		doc.setFontType("bolditalic");
		doc.text(15, 102, 'Otros Cobros');
		doc.text(35, 102, 'No.');
		doc.text(47, 102, 'Cuota');
		doc.text(60, 102, 'Interés');
		doc.text(73, 102, 'Total');
		doc.text(85, 102, 'Saldo');
		
		doc.setFontSize(5);
		doc.setFontType("bolditalic");
		doc.text(30, 109, 'Subtotal Otros Cobros (3)');
		doc.text(70, 109, cobrosTotal);
		doc.text(84, 109, cobrosSaldos);

		//Otros conceptos que adeuda
		doc.setFontSize(5);
		doc.setFontType("bolditalic");
		doc.text(7, 112, 'Otros conceptos que adeuda');
		doc.text(39, 112, 'Valor Total');
		doc.text(6, 119, 'Total otros conceptos que adeuda (4)');
		doc.text(39, 119, adeudaTotal);

		//Datos Totales de la Factura
		doc.setFontSize(5);
		doc.setFontType("normal");
		doc.text(51, 112, 'TOTAL  (1)  +  (2)  +  (3)  +  (4)');
		doc.setFontType("bold");
		doc.text(83, 112, facturaTotal);
		doc.setFontType("normal");
		doc.text(51, 116, 'Consumo Mes');
		doc.text(73, 116, 'Consumo Día');
		doc.setFontType("bold");
		doc.text(63, 116, consumoMes);
		doc.text(85, 116, consumoDia);
		
		//Datos de Factura de Aseo
		doc.setFontSize(5);
		doc.setFontType("bolditalic");
		doc.text(22, 122, 'Operador Aseo:');
		doc.text(20, 124, 'Valor a pagar Aseo:');
		doc.setFontType("normal");
		doc.text(65, 122, operadorAseo);
		doc.text(70, 124, valorAseo);
		
		//Numero y gráfico de agua y aseo
		doc.setFontSize(6);
		doc.setFontType("normal");
		doc.addImage(imgAgua, 'PNG', 10, 126, 80, 5);
		doc.text(24, 134, numeroFacAgua);
		doc.addImage(imgAseo, 'PNG', 10, 136, 80, 5);
		doc.text(24, 144, numeroFacAseo);
		
		if (typeof cordova !== 'undefined'){	//guardar
			var contentType = "application/pdf";
			var folderpath = cordova.file.externalDataDirectory;
			var filename = "factura.pdf";

			var uristring = doc.output('datauristring');
			var myBase64 = "";
			var n=uristring.split("base64,");			//console.log(n[0]);	console.log(n[1]);	console.log(n[2]);
	    	myBase64 = n[1];
			
			eaab_pagar.savebase64AsPDF(folderpath,filename,myBase64,contentType);

		}else{//console.log(doc.output('datauristring'));
		    doc.save('factura.pdf');
		}

	},
   	main:function(){
   		if (eaab_pagar.resultado.num_medidor == eaab_pagar.num_medidor){
   			eaab_pagar.crearFactura();
   		}else{
   			eaab_pagar.db.transaction(eaab_pagar.ConsultaItems);	
   		}
   		
   	}
}

