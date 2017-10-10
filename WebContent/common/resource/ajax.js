//post request(with body raw)
errorMsg=function(){
	window.location=window.serverUrl+'/login.html';
}
getResultPost=function(requestUrl,inFor,callback){
	var ajaxObj=null;
  	ajaxObj=$.ajax({
		type:"post",
		url:serverIP+requestUrl,
		data : inFor,
		contentType:'raw',
		async:true,
		success:function(data){
			callback(data);
		},
		error:function(data){
			var datas=JSON.parse(data.responseText);
			if(data.status==401){
				if(datas.code==4003||datas.code==4001){
					errorMsg();
				}
			}else{
				callback(data.responseText);
			}
			
		}
	});
	return ajaxObj;
};	

//post request(with body x-www-form-urlencoded)
postAjaxResult=function(requestUrl,inFor,callback){
	var ajaxObj=null;
  	ajaxObj=$.ajax({
		type:"post",
		url:serverIP+requestUrl,
		dataType:'json',
		data : inFor,
		contentType:'x-www-form-urlencoded',
		async:true,
		success:function(data){
			callback(data);
		},
		error:function(data){
			console.log(data);
			var datas=JSON.parse(data.responseText);
			if(data.status==401){
				if(datas.code==4003||datas.code==4001){
					errorMsg();
				}else{
					callback(data.responseText);
				}
			}else{
				callback(data.responseText);
			}
		}
	});
	return ajaxObj;
};
//post request(in query)
postResultpost=function(requestUrl,callback){
	var ajaxObj=null;
	ajaxObj=$.ajax({
		type:"post",
		url:serverIP+requestUrl,
		dataType:'text',
		async:true,
		success:function(data){
			callback(data);
		},
		error:function(data){
			console.log(data);
			var datas=JSON.parse(data.responseText);
			if(data.status==401){
				if(datas.code==4003||datas.code==4001){
					errorMsg();
				}else{
					callback(data.responseText);
				}
			}else{
				callback(data.responseText);
			}
		}
	});
	return ajaxObj;
};	
//get request
getResultGet=function(requestUrl,callback){
	var ajaxObj=null;
    ajaxObj=$.ajax({
		type:"get",
		url:serverIP+requestUrl,
		async:true,
		success:function(data){
			callback(data);
		},
		error:function(data){
			console.log(data);
			var datas=JSON.parse(data.responseText);
			if(data.status==401){
				if(datas.code==4003||datas.code==4001){
					errorMsg();
				}else{
					callback(data.responseText);
				}
			}else{
				callback(data.responseText);
			}
		}
	});
	return ajaxObj;
}
getResultGet1=function(requestUrl,callback){
	var ajaxObj=null;
  	ajaxObj=$.ajax({
		type:"get",
		url:serverIP+requestUrl,
		async:false,
		success:function(data){
			callback(data);
		},
		error:function(data){
			console.log(data);
			var datas=JSON.parse(data.responseText);
			if(data.status==401){
				if(datas.code==4003||datas.code==4001){
					errorMsg();
				}else{
					callback(data.responseText);
				}
			}else{
				callback(data.responseText);
			}

		}
	});
	return ajaxObj;
}
//put request
getResultPut=function(requestUrl,inFor,callback){
  	$.ajax({
		type:"put",
		url:serverIP+requestUrl,
		dataType:'text',
		data : inFor,
		async:true,
		success:function(data){
			callback(data);
		},
		error:function(data){
			console.log(data);
			var datas=JSON.parse(data.responseText);
			if(data.status==401){
				if(datas.code==4003||datas.code==4001){
					errorMsg();
				}else{
					callback(data.responseText);
				}
			}else{
				callback(data.responseText);
			}
		}
	});
}

ajaxPutReauest=function(requestUrl,inFor,callback){
	var ajaxObj=null;
  	ajaxObj=$.ajax({
		type:"put",
		url:serverIP+requestUrl,
		data : inFor,
		contentType:'raw',
		async:true,
		success:function(data){
			callback(data);
		},
		error:function(data){
			console.log(data);
			var datas=JSON.parse(data.responseText);
			if(data.status==401){
				if(datas.code==4003||datas.code==4001){
					errorMsg();
				}else{
					callback(data.responseText);
				}
			}else{
				callback(data.responseText);
			}
		}
	});
	return ajaxObj;
}
//putquery request
postResultPut=function(requestUrl,callback){
  	$.ajax({
		type:"put",
		url:serverIP+requestUrl,
		dataType:'text',
		async:true,
		success:function(data){
			callback(data);
		},
		error:function(data){
			console.log(data);
			var datas=JSON.parse(data.responseText);
			if(data.status==401){
				if(datas.code==4003||datas.code==4001){
					errorMsg();
				}else{
					callback(data.responseText);
				}
			}else{
				callback(data.responseText);
			}
		}
	});
}

//deletequery request
deleteAjaxResult=function(requestUrl,callback){
	$.ajax({
		type:"delete",
		url:serverIP+requestUrl,
		async:true,
		success:function(data){
			callback(data);
		},
		error:function(data){
			console.log(data);
			var datas=JSON.parse(data.responseText);
			if(data.status==401){
				if(datas.code==4003||datas.code==4001){
					errorMsg();
				}else{
					callback(data.responseText);
				}
			}else{
				callback(data.responseText);
			}
		}
	});
}

//获取数据ajax
function getAjax(url,sucFun,errFun){
	$.ajax({
		type:"get",
		url:url,
		async:false,
		success:function(data){
			sucFun(data);
		},
		error:function(data){
			errFun(data);
		}
	});
}
