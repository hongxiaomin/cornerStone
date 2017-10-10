$(function(){
	var columns=[{
	    	radio: true
	    }, {
	    	field: 'id',
	    	title: 'Event ID'
	   	}, {
	    	field: 'destinationTopic',
	    	title: 'DestinationTopic'
	   	}, {
	    	field: 'epgId',
	    	title: 'EPG ID'
	   	}, {
	    	field: 'sourceId',
	    	title: 'Source ID'
	   	}, {
	    	field: 'date',
	    	title: 'Date'
	   	},  {
	    	field: 'serilNo',
	    	title: 'Seril No'
	   	}, {
	    	field: 'operationId',
	    	title: 'OperationId'
	   	}, {
	    	field: 'executionId',
	    	title: 'Execution ID'
	   	}, {
	    	field: 'sourceTopic',
	    	title: 'Source Topic'
	   	}, {
	    	field: 'destinationId',
	    	title: 'Destination ID'
	   	}, 
	   	];
	
	var url=serverIP+'event';
 	var oTable = new TableInit();
 	queryParams = function (params) {
 		var num=(params.offset/params.limit)+1;
		var temp = {
		   	pageSize: params.limit,
		   	pageNumber: num,
			eventId: $(".eventId").val().trim(),
			destinationTopic: $(".destinationTopic").val().trim(),
			epgId: $(".epgId").val().trim(),
			sourceId: $(".sourceIdd").val().trim(),
			serilNo: $(".serilNo").val().trim(),
			opName: $(".operationId").val().trim(),
			executionId: $(".executionId").val().trim(),
			sourceTopic: $(".sourceTopic").val().trim(),
			destinationId: $(".destinationId").val().trim(),
			startTime: $(".startTime").val().trim(),
			endTime: $(".endTime").val().trim()
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