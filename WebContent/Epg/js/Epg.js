$(function(){
	var appEpgId=getStorage('epgDetailId');
	
	$(document).off('click','.meuDetail .code').on('click','.meuDetail .code',function(){//show epgDetail code	
		$(this).removeClass('buttonActive').siblings().addClass('buttonActive');
		$('.epgDetailCode').show();
		$('#sample').hide();
	});
	
	$(document).off('click','.meuDetail .figure').on('click','.meuDetail .figure',function(){//show epgDetail figure
		$(this).removeClass('buttonActive').siblings().addClass('buttonActive');
		$('#sample').show();
		$('.epgDetailCode').hide();		
	});
	
	$(document).off('click','.EPGLIST').on('click','.EPGLIST',function(){
		$('.ng-Epg').show();
		$('.ng-EpgDetail').hide();
	})
	
	$(document).on('click','.epgTable thead th',function(){
		return false;
	})
	
	$('.epgTable').off('click','tbody tr').on('click','tbody tr',function(){//epg and epgDetail change
		var currentEpgData=$('.epgTable').bootstrapTable('getSelections')[0];
		console.log(currentEpgData);
		var EpgName=currentEpgData.name,
			EpgID=currentEpgData.id;
		$('.ng-EpgDetail .panel-heading').html(EpgName);
		getResultGet('epg?epgId='+EpgID,function(data){
			data=JSON.parse(data).rows[0];
			if(data){
				var datas=data.epgDefinition;
				$('.epgDetailCode').text(datas);
			}
		});
		parseXml(EpgID);
		$('.ng-Epg').hide();
		$('.ng-EpgDetail').show();
	});
	
	
	if(!!appEpgId){
		$('.drawFlow').children().remove();
		$('.drawFlow').append('<div id="myDiagram"></div>');
		$('#myDiagram').css("border", "solid 1px gray");
		$('#myDiagram').css("height", "720");
		getResultGet('epg?epgId='+appEpgId,function(data){
			var datas=JSON.parse(data).rows[0];
			var text=datas.epgDefinition;
			var EpgName=datas.name;
			$('.epgDetailCode').text(text);
			$('.ng-EpgDetail .panel-heading').html(EpgName);
		});
		parseXml(appEpgId);
		$('.ng-Epg').hide();
		$('.ng-EpgDetail').show();
		removeStorage("epgDetailId");
		
		return;
	};
	
	var columns=[{
    	radio: true
    }, {
    	field: 'id',
    	title: 'ID'
   	}, {
    	field: 'name',
    	title: 'Name'
   	}];
	var url=serverIP+'epg';
 	//init Table
 	var oTable = new TableInit();
	//search params
	queryParams = function (params) {
		var num=(params.offset/params.limit)+1
		var temp = {
		   	pageSize: params.limit, 
	   		pageNumber: num, 
			epgId: $(".id").val().trim(),
			name: $(".name").val().trim()
		};
		return temp;
	};
 	oTable.Init(columns,url,queryParams);
	$("#btn_query").click(function(){//search and refresh				 
		$("#tb_table").bootstrapTable('refresh', {url: url});  
	});
	
})
