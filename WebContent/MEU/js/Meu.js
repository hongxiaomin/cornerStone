$(function(){
	var columns=[{
		radio: true
	},
	{
		field: 'id',
		title: 'MEU ID'
	}, 
	{
		field: 'epgId',
		title: 'EPG ID',
		formatter:function(value,row,index){
			var value=JSON.parse(value);
			var epgStr='';
			if(value.length>0){
				for(var i=0;i<value.length;i++){
					epgStr+='<div>'+value[i]+'</div>';
				}
			}
			return epgStr;
		}
	},
	{
		field: 'name',
		title: 'Name'
	}, 
	{
		field: 'type',
		title: 'Type',
		formatter:function(value,row,index){
			if(!value){
				return null;
			}else{
				return value;
			}
		}
	}, 
	{
		field: 'md5',
		title: 'MD5',
		formatter:function(value,row,index){
			if(!value){
				return null;
			}else{
				return value;
			}
		}
	}, 
	{
		field: 'version',
		title: 'Version',
		formatter:function(value,row,index){
			if(!value){
				return null;
			}else{
				return value;
			}
		}
	}, 
	{
		field: 'author',
		title: 'Author',
		formatter:function(value,row,index){
			if(!value){
				return null;
			}else{
				return value;
			}
		}
	}, 
	{
		field: 'signature',
		title: 'Signature',
		formatter:function(value,row,index){
			if(!value){
				return null;
			}else{
				return value;
			}
		}
	}, 
	{
		field: 'description',
		title: 'Description',
		formatter:function(value,row,index){
			if(!value){
				return null;
			}else{
				return value;
			}
		}
	}];
 	var url=serverIP+'meu';
 	var oTable = new TableInit();
	queryParams = function (params) {
		var offset=params.offset;
		var numbers=(offset/params.limit)+1;
		var temp = {
		   	pageSize: params.limit, //Paging corresponding parameters
		   	pageNumber: numbers, //Paging corresponding parameters
			meuId: $(".id").val().trim(), 
			epgId: $(".epgid").val().trim(),
			name: $(".name").val().trim(),
			type: $(".type").val().trim(),
			Md5: $(".md5").val().trim(),
			version: $(".version").val().trim(),
			author: $(".author").val().trim(),
			signature: $(".signature").val().trim(),
			description: $(".description").val().trim()
		};
		for(var key in temp){
			if(!temp[key]){
				delete(temp[key]);
			}
		}
		return temp;
	};
	oTable.Init(columns,url,queryParams);
	$("#btn_query").click(function(){//search and refresh				 
		$("#tb_table").bootstrapTable('refresh', {url: url});  
	});
})