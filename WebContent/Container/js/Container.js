$(function(){
	var columns=[{
	    	radio: true
	    }, 
	    {
	    	field: 'id',
	    	title: 'Container ID',
	    	sortable:true,
	   	}, 
	   	{
	    	field: 'name',
	    	title: 'Name',
	    	sortable:true,
	   	},
	   	{
	    	field: 'status',
	    	title: 'Status',
	    	formatter:function(value,row,index){
	    		var temp=getStatus(value);
	    		return temp;
	    	},
	    	sortable:true,
	   	},
	   	{
	    	field: 'node',
	    	title: 'Node',
	    	sortable:true,
	   	}
	   	];
	var url=serverIP+'container';
	//init Table
	var oTableContainer = new TableInit();
	//search params
	var containerQueryParams = function (params) {
		var num=(params.offset/params.limit)+1;
		console.log(params.sort);
		console.log(params.order);
		var temp = {
		   	pageSize: params.limit, //Paging corresponding parameters
	   		pageNumber: num, //Paging corresponding parameters
			containerId: $(".id").val().trim(),
			name: $(".name").val().trim(),
			status:Number($('#txt_search_status').find('option:selected').val()),
			node:$('.node').val().trim(),
			sortName:params.sort,
			sortOrder:params.order
		};
		for(var key in temp){
			if(key==='status'){
				if(temp[key]===-2){
					delete(temp[key]);
				}
			}else{
				if(!temp[key]){
					delete(temp[key]);
				}
			}
		}
		return temp;
	};
	oTableContainer.Init(columns,url,containerQueryParams,'id',$('#container_tb_table'));
	
	//button click
	$("#btn_query_container").click(function(){//search and refresh				 
		$("#container_tb_table").bootstrapTable('refresh', {url: url});  
	});
	
	
	var columnsMeu=[
		{
			radio: true
		},
		{
	    	field: 'id',
	    	title: 'ID',
	    	sortable:true,
	   	},
	   	{
	    	field: 'name',
	    	title: 'Name',
	    	sortable:true,
	   	},
   		{
	    	field: 'type',
	    	title: 'Type',
	    	sortable:true,
	   	},
	   	{
	    	field: 'language',
	    	title: 'Language',
	    	sortable:true,
	   	},
	];
	
	var columnsEvent=[
		{
			radio: true
		},
		{
	    	field: 'date',
	    	title: 'Time',
	    	sortable:true,
	    	formatter:function(value,row,index){
	    		if(!value){
	    			value='-';
	    		}
	    		return '<div class="executionDetail">'+value+'</div>'
	    	}
	   	},
	   	{
	    	field: 'epgId',
	    	title: 'EPG ID',
	    	sortable:true,
	    	formatter:function(value,row,index){
	    		if(!value){
	    			value='-';
	    		}
	    		return '<div class="executionDetail">'+value+'</div>'
	    	}
	   	},
   		{
	    	field: 'executionId',
	    	title: 'Execution ID',
	    	sortable:true,
	    	formatter:function(value,row,index){
	    		if(!value){
	    			value='-';
	    		}
	    		return '<div class="executionDetail">'+value+'</div>'
	    	}
	   	},
	   	{
	    	field: 'destinationTopic',
	    	title: 'Destination Topic',
	    	sortable:true,
	    	formatter:function(value,row,index){
	    		if(!value){
	    			value='-';
	    		}
	    		return '<div class="executionDetail">'+value+'</div>'
	    	}
	   	},
	   	{
	    	field: 'destinationId',
	    	title: 'Destination ID',
	    	sortable:true,
	    	formatter:function(value,row,index){
	    		if(!value){
	    			value='-';
	    		}
	    		return '<div class="executionDetail">'+value+'</div>'
	    	}
	   	},
	   	{
	    	field: 'operationId',
	    	title: 'Operation ID',
	    	sortable:true,
	    	formatter:function(value,row,index){
	    		if(!value){
	    			value='-';
	    		}
	    		return '<div class="executionDetail">'+value+'</div>'
	    	}
	   	},
	   	{
	    	field: 'sourceId',
	    	title: 'Source ID',
	    	sortable:true,
	    	formatter:function(value,row,index){
	    		if(!value){
	    			value='-';
	    		}
	    		return '<div class="executionDetail">'+value+'</div>'
	    	}
	   	},
	];
	
	var columnsException=[
		{
			radio: true
		},
		{
	    	field: 'occurredTime',
	    	title: 'Occurred Time',
	    	sortable:true,
	   	},
		{
	    	field: 'id',
	    	title: 'ID',
	    	sortable:true,
	   	},
   		{
	    	field: 'meuId',
	    	title: 'Meu ID',
	    	sortable:true,
	   	},
	   	{
	    	field: 'executeId',
	    	title: 'Execute ID',
	    	sortable:true,
	   	},
	   	{
	    	field: 'shortMsg',
	    	title: 'Short Msg',
	    	sortable:true,
	    	formatter:function(value,row,index){
	    		if(!value){
	    			value='-';
	    		}
	    		return '<p class="msg">'+value+'</p>'
	    	}
	   	},
	   
	];
	
	$(document).off('click','#container_tb_table tbody tr').on('click','#container_tb_table tbody tr',function(){
		var containerData=$('#container_tb_table').bootstrapTable('getData');
		if(containerData.length!==0){
			var currentData=containerData[$(this).index()];
			$('.container_status').text(getStatus(currentData["status"]));
			$('.container_id').text(currentData["id"])
			$('.container_name').text(currentData["name"])
			$('.container_node').text(currentData["node"])
			var meuListUrl=serverIP+'container/detail/meuList';
			var eventListUrl=serverIP+'container/detail/eventList';
			var exceptionListUrl=serverIP+'container/detail/exceptionList';
			var oTableMeu = new TableInit();
			var oTableEvent = new TableInit();
			var oTableException = new TableInit();
			//search params
			var meuQueryParams = function (params) {
				var num=(params.offset/params.limit)+1;
				var temp = {
				   	pageSize: params.limit, //Paging corresponding parameters
			   		pageNumber: num, //Paging corresponding parameters
					containerId:currentData["id"],
					sortName:params.sort,
					sortOrder:params.order
				};
				for(var key in temp){
					if(!temp[key]){
						delete(temp[key]);
					}
				}
				return temp;
			};
			var eventQueryParams = function (params) {
				var num=(params.offset/params.limit)+1;
				var temp = {
				   	pageSize: params.limit, //Paging corresponding parameters
			   		pageNumber: num, //Paging corresponding parameters
					containerId:currentData["id"],
					sortName:params.sort,
					sortOrder:params.order
				};
				for(var key in temp){
					if(!temp[key]){
						delete(temp[key]);
					}
				}
				return temp;
			};
			var exceptionQueryParams = function (params) {
				var num=(params.offset/params.limit)+1;
				var temp = {
				   	pageSize: params.limit, //Paging corresponding parameters
			   		pageNumber: num, //Paging corresponding parameters
					containerId:currentData["id"],
					sortName:params.sort,
					sortOrder:params.order
				};
				for(var key in temp){
					if(!temp[key]){
						delete(temp[key]);
					}
				}
				return temp;
			};
			oTableMeu.Init(columnsMeu,meuListUrl,meuQueryParams,'id',$('#meuTable'));
			oTableEvent.Init(columnsEvent,eventListUrl,eventQueryParams,'date',$('#eventTable'),'desc');
			oTableException.Init(columnsException,exceptionListUrl,exceptionQueryParams,'occurredTime',$('#exceptionTable'),'desc');
			
			$('#container_list').addClass('hide');
			$('#detail').removeClass('hide');
		}
	})
	
	$('.container_list').on('click',function(){
		$('#meuTable').bootstrapTable('destroy');
		$('#eventTable').bootstrapTable('destroy');
		$('#exceptionTable').bootstrapTable('destroy');
		$('#container_list').removeClass('hide');
		$('#detail').addClass('hide');
	})
	
	$(document).off('mouseenter','#eventTable tbody tr .executionDetail').on('mouseenter', '#eventTable tbody tr .executionDetail', function(ev) { //show meuDetail
			var currentIndex=$(this).parents('tr').index();
			var AllData=$('#eventTable').bootstrapTable('getData');
			var NowData=AllData[currentIndex];
			if(!NowData){
				return false;
			}
			if(!NowData.containerId||!NowData.executionId||!NowData.serilNo){
				return false;
			}
			
			var datas=null;
			
			getResultGet1('container/detail/eventList/invokeDetail?containerId='+NowData.containerId+'&executionId='+NowData.executionId+'&instanceId='+NowData.serilNo+'',function(data){
				$('.EventContent').empty();
				data = JSON.parse(data).rows;
				var hasId=false;
				for(var key in data){
					hasId=true;
					console.log(123);
				}
				
				if(hasId){
					datas=data;
				}
				
			});
		
			if(!datas){
				return false;
			}
			
			$('.popover').remove();
			
			$(this).popover({
				html: true,
				title: 'Execution Detail',
				placement:'bottom',
				delay:{
					show:200,
					hide:800,
				},
				content:function(){
					var addEventData = '<div class="EventContent"><div><label>ID:</label><span>' + datas.id + '</span></div><div><label>MEU ID:</label><span>' + datas.meuId + '</span></div><div><label>Operation ID:</label><span>' + datas.operationId + '</span></div><div><label>Execution Time:</label><span>' + datas.executionTime + ' (MS)</span></div><div><label>Invoke Time Stamp:</label><span>' + datas.invokeTimestamp + '</span></div><div><label>Input:</label><span>' + datas.input + '</span></div><div><label>Output:</label><span>' + datas.output + '</span></div></div>';
					return addEventData;
				}
			}).on('shown.bs.popover', function(event) {
				var that = this;
				$(this).parent().find('div.popover').on('mouseenter', function() {
					$(that).attr('in', true);
				}).on('mouseleave', function(event) {
					event.preventDefault();
					$(that).removeAttr('in');
					$(that).popover('hide');
					
				});
			}).on('hide.bs.popover', function(event) {
				if($(this).attr('in')) {
					event.preventDefault();
				}
			}).popover('show');
		});
		
		$(document).off("mouseleave",'#eventTable tbody tr td').on("mouseleave",'#eventTable tbody tr td',function(){
			$('div.popover').removeAttr('in');
			$('div.popover').popover('hide');
		});
		
		
		$(document).off('mouseenter','#exceptionTable tbody tr .msg').on('mouseenter', '#exceptionTable tbody tr .msg', function(ev) { //show meuDetail
			var currentIndex=$(this).parents('tr').index();
			var AllData=$('#exceptionTable').bootstrapTable('getData');
			var NowData=AllData[currentIndex];
			
			if(!NowData){
				return false;
			}
			$('.popover').remove();
			
			$(this).popover({
				html: true,
				title: 'Exception Msg',
				placement:'left',
				delay:{
					show:200,
					hide:500,
				},
				content:function(){
					return '<div class="EventContent"><div><label>Msg :</label><span>'+NowData.msg+'<span></div></div>';
				}
			}).on('shown.bs.popover', function(event) {
				var that = this;
				$(this).parent().find('div.popover').on('mouseenter', function() {
					$(that).attr('in', true);
				}).on('mouseleave', function(event) {
					event.preventDefault();
					$(that).removeAttr('in');
					$(that).popover('hide');
					
				});
			}).on('hide.bs.popover', function(event) {
				if($(this).attr('in')) {
					event.preventDefault();
				}
			}).popover('show');
		});
		
		$(document).off("mouseleave",'#exceptionTable tbody tr .msg').on("mouseleave",'#exceptionTable tbody tr .msg',function(){
			$('div.popover').removeAttr('in');
			$('div.popover').popover('hide');
		});
	
	
})	
				 	 		 
function getStatus(value){
	switch(value){
		case 1:return 'REGISTERING';
		break;
		case 2:return 'STARTING';
		break;
		case 3:return 'HA_PENDING';
		break;
		case 4:return 'NORMAL';
		break;
		case -1:return 'ERROR';
		break;
		default:return 'ABNORMAL';
	}
}
function getMeu(value){
	var epgArr=JSON.parse(value);
	if(epgArr.length>0){
		var epgStr='';
		for(var i=0;i<epgArr.length;i++){
			epgStr+='<p>'+epgArr[i]+'</p>';
		}
		return epgStr;
	}
}
