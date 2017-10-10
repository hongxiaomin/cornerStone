$(function() {
	var columns = [{
		radio: true
	}, {
		field: 'executionId',
		title: 'Executed ID',
	}, {
		field: 'epgId',
		title: 'EPG ID',
	}, {
		field: 'date',
		title: 'Create Date'
	}, {
		field: 'status',
		title: 'Status'
	}];
	var url = serverIP + 'epg/executionrecord';
	//init Table
	var oTable = new TableInit();
	//search params
	queryParams = function(params) {
		var num=(params.offset/params.limit)+1;
		var temp = {
			pageSize: params.limit,
			pageNumber: num,
			epgId: $('.id').val().trim(),
			status:$('.status').val().trim()
		};
		return temp;
	};
	oTable.Init(columns, url, queryParams);
	
	$("#btn_query").click(function() { //search and refresh				 
		$("#tb_table").bootstrapTable('refresh', {
			url: url
		});
	});
	$(document).off('click','.executionTable tbody tr').on('click', '.executionTable tbody tr', function() {
		var data=$('#tb_table').bootstrapTable('getData');
		var index=$(this).index();
		var currentData=data[index];
		var epgId = currentData.epgId,
			executionID = currentData.executionId,
			status = currentData.status;
		localStorage.setItem("Status", status);
		$('.ng-EpgExeRecordDetail .panel-heading').html("Executed ID：" + executionID);
		parseMoniteXml(executionID,epgId);
		$('.ng-EpgExexution').hide();
		$('.ng-EpgExeRecordDetail').show();
	})
	
	$(document).on('click','.EXECUTION',function(){
		clearOutTimer(epgObj.timer);
		$('.ng-EpgExexution').show();
		$('.ng-EpgExeRecordDetail').hide();
	})
	$(document).on('click','.ToEpg',function(){
		clearOutTimer(epgObj.timer);
		showRight('epg');
		$('.EpgRecord').removeClass('homeActive').siblings('li').addClass('homeActive');
	})
})
