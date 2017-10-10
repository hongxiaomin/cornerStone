$(function() {
	(function(){
		var columns = [{
			radio: true,
			formatter: function(value, row, index) {
				var s = row.status;
				if(s=='Deploying'){
					return {disabled:true};
				}
			}
		},
		{
			field: 'id',
			title: 'ID',
			formatter: function(epg, row, index) {
				var s = operateEventsId(epg, row, index);
				return s;
			},
			sortable:true,
		}, 
		{
			field: 'name',
			title: 'Name',
			sortable:true,
		},
		{
			field: 'epg',
			title: 'EPG',
			formatter: function(epg, row, index) {
				var s = showEpg(epg,row,index);
				return s;
			},
		}, 
		{
			field: 'meu',
			title: 'MEU',
			formatter: function(meu, row, index) {
				var rowData=row.meu;
				var s = showMeu(meu, row, index);
				return s;
			},
		}, 
		{
			field: 'status',
			title: 'Status',
			sortable:true,
		}];
		var url = serverIP + 'app';
		//init Table
		var oTable = new TableInit();
		//search params
		queryParams = function(params) {
			var offset=params.offset;
			var numbers=(offset/params.limit)+1;
			var temp = {
				pageSize: params.limit,
				pageNumber: numbers,
				appId: $(".id").val().trim(),
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
		
		oTable.Init(columns, url, queryParams,'name');
		
		$("#btn_query").click(function() { //search and refresh				 
			$("#tb_table").bootstrapTable('refresh', {
				url: url
			});
		});
		
		//create app
		$('.create').click(function() {
			$('.list').removeClass('homeActive').siblings('li').addClass('homeActive');
		});
		
		
		$(document).off('mouseenter','.appEpg').on('mouseenter', '.appEpg', function(event) { //show chart
			event.preventDefault();
			var EpgID = $(this).children('.epg_id').html();
			var EpgName= $(this).children('.epg_name').html()
			$('.popover').remove();
			$(this).popover({
				html: true,
				title: title(EpgID+'('+EpgName+')'),
				content: function() {
					return content(EpgID);
				}
			}).on('shown.bs.popover', function(event) {
				var that = this;
				
				$(this).parent().find('div.popover').on('mouseenter', function() {
					$(that).attr('in', true);
				}).on('mouseleave', function() {
					$(that).removeAttr('in');
					$(that).popover('hide');
					
				});
			}).on('hide.bs.popover', function(event) {
				if($(this).attr('in')) {
					event.preventDefault();
				}
			}).popover('show');
		});
		
		$(document).off("mouseleave",'.appEpg').on("mouseleave",'.appEpg',function(event){
			event.preventDefault();
			$('div.popover').removeAttr('in');
			$('div.popover').popover('hide');
		});
		
		
		$(document).off('mouseenter','.appMeu').on('mouseenter', '.appMeu', function() { //show meuDetail
			var MeuID = $(this).children('.meu_id').html();
			$('.popover').remove();
			$(this).popover({
				html: true,
				title: meuTitle(MeuID),
				content:function(){
					getResultGet('meu?meuId=' + MeuID,function(data){
						$('.MeuContent').empty();
						data=JSON.parse(data);
						var datas = data.rows[0];
						if(datas) {
							var type='';
//							console.log(datas.type);
							if(!!datas.type){
								type=datas.type;
							}
							
							var epgIds=JSON.parse(datas.epgId);
							var epgIdStr='';
							if(epgIds.length>0){
								for(var i=0;i<epgIds.length;i++){
									epgIdStr+='<span>' + epgIds[i] + '</span>';
								}
							}
							var addmeuData = $('<div><label>MEU ID:</label><span>' + datas.id + '</span></div><div><label>MEU Name:</label><span>' + datas.name + '</span></div><div><label>EPG ID:</label>'+epgIdStr+'</div><div><label>Type:</label><span>' + type + '</span></div>' +
								'<div><label>MD5:</label><span>' + datas.md5 + '</span></div><div><label>Version:</label><span>' + datas.version + '</span></div>');
							$('.MeuContent').append(addmeuData);
						}
					})
					return MeuContent();
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
		
		$(document).off("mouseleave",'.appMeu').on("mouseleave",'.appMeu',function(){
			$('div.popover').removeAttr('in');
			$('div.popover').popover('hide');
		});
		
		$(document).off('click','.showDetail').on('click', '.showDetail', function() { //show epg page	
			var epgValue=$(this).html();
			
			var epgId = epgValue.split('(')[0];
			putStorage('epgDetailId',epgId);
			$('.homeActive').each(function() {
				$(this).removeClass('homeActive');
			});
			$('.menuEPG ').addClass('homeActive');
			showRight('EpgLists');
			menuActive($('.menuEPG'));
		});
		//click page heade Lists
		$(document).on('click','.APPLIST',function(){
			$('.ng-monitor').show();
			$('.ng-listDetail').hide();
		})
		
		//click appId show modal
		
		$(document).off('click','.appsId').on('click', '.appsId', function() { //show apps Detail
			var appsId = $(this).html();
			
			getResultGet('app?appId=' + appsId + '', function(data) {
				var datas = JSON.parse(data).rows[0];
//				console.log(datas);
				var epg = datas.epg,
					meu = datas.meu;
				var epgStr='',
					meuStr='';
				if(epg.length>0) {
					for(var i=0;i<epg.length;i++){
						epgStr+=epg[i].name+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
					}
				}
				if(meu.length>0) {
					for(var j=0;j<meu.length;j++){
						meuStr+=meu[j].name+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
					}
				}
				$('.listDetailInfo p:eq(0) span').html(datas.id);
				$('.listDetailInfo p:eq(1) span').html(datas.name);
				$('.listDetailInfo p:eq(2) span').html(datas.description);
				$('.listDetailInfo p:eq(3) span').html(epgStr);
				$('.listDetailInfo p:eq(4) span').html(meuStr);
				$('.listDetailInfo p:eq(5) span').html(datas.status);
			});
			
			var setting={
					data:{
						simpleData:{
							enable:true
						},
						key:{
							title:"fullName"
						}
					},
				};
			var configurationTreeNodes=[];
			
			getResultGet1('app/configurationrecord?appId=' + appsId + '', function(data) {
				data=JSON.parse(data);
				var meuLists=[];
				if(data.code==0){
					var datas=data.rows.rel;
					if(datas.length>0){
						for(var i=0;i<datas.length;i++){
							var currentData=datas[i];
							var clientNode={
								"name":currentData.clientId,
								"open":true,
								isParent:true,
								"children":[],
								"fullName":currentData.clientId
							};
							
							var allContainers=currentData.containers;
							for(var j=0;j<allContainers.length;j++){
								var containerName=allContainers[j].containerName;
								var fullName=deepClone(allContainers[j]);
								delete(fullName.meus);
								fullName=JSON.stringify(fullName);
								var containerNode={
									"name":containerName,
									"open":true,
									isParent:true,
									"children":[],
									"fullName":fullName
								};
								var allMeus=allContainers[j].meus;
								for(var k=0;k<allMeus.length;k++){
									meuLists.push(allMeus[k]);
									var meuDetail=JSON.stringify(allMeus[k]);
									var meuNode={
										"name":allMeus[k].meuName,
										"fullName":meuDetail
									};
									containerNode.children.push(meuNode);
								}
								clientNode.children.push(containerNode);
							}
							configurationTreeNodes.push(clientNode);
							
						}
						
					}
				}
				
//				console.log(meuLists);
				if(meuLists.length>0){
					var mappingTable=$('<table class="table table-border">');
					var thead=$('<thead>');
					var th='<tr><th width="240px">updateMeu</th><th>meuId</th><th>meuName</th><th>meuType</th><th width="200px">updateProgress</th></tr>';
					thead.append(th);
					mappingTable.append(thead);
					var mappingTableTbody=$('<tbody>');
					var tbodyContent="";
					for(var m=0;m<meuLists.length;m++){
						var meuId=meuLists[m].meuId,meuName=meuLists[m].meuName,meuType=meuLists[m].meuType;
						if(!meuId){
							meuId="";
						}
						if(!meuName){
							meuName="";
						}
						if(!meuType){
							meuType="-";
						}
						var td='<tr><td><form class="updateMeu" enctype="multipart/form-data"><button>Update</button><input type="text" class="updateText" readonly="readonly"><input type="file" name="meu" class="updateFile"/><input type="hidden" name="meuId" class="meuId" value="'+meuId+'"/></form></td><td>'+meuId+'</td><td>'+meuName+'</td><td>'+meuType+'</td><td></td></tr>';
						tbodyContent+=td;
					}
					mappingTableTbody.append(tbodyContent);
					mappingTable.append(mappingTableTbody);
					$('.updateMeus').html(mappingTable);
				}
			})
			
//			console.log(configurationTreeNodes);
			var treeObj=$.fn.zTree.getZTreeObj('#configurationTree');
			$(document).ready(function(){
				$.fn.zTree.init($("#configurationTree"), setting,configurationTreeNodes);//设置权限节点树
			});
			
			$('.ng-monitor').hide();
			$('.ng-listDetail').show()
		});
		
		//<div class="progress progress-striped progressbox"><div class="progress-bar progress-bar-success" style="width: ' + updatePro + '%"><span>' + updatePro + '%</span></div></div>
		$(document).off('change','.updateFile').on('change','.updateFile',function(ev){
			ev.preventDefault();
			var updateFile=$(this),
				updateBtn=$(this).siblings('button'),
				file=this.files[0],
				name=file.name,
				updateText=$(this).siblings('.updateText');
			updateText.val(name);
			var meuId=$(this).parents('tr').children()[1].innerText,
				progressBox=$(this).parents('tr').children().last(),
				updateUrl='deployment/meu',
				form=$(this).parent('.updateMeu');
			form.ajaxSubmit({
				type: "put",
				dataType: "text",
				url: serverIP + updateUrl,
				success: function(data) {
					var data = JSON.parse(data);
//					console.log(data);
					if(data.code==0){
						updateFile.remove();
						updateBtn.css('background','#ddd');
						var time = new Date().getTime();
						var ajaxTime = 2 * 60 * 1000;
						var updateProgressTimer=null;
						var updateGetTimer = setInterval(function() {//The number of timers used here is the cumulative time.
							var lastTime = new Date().getTime();
							if(lastTime - time >= ajaxTime) {
								clearOutTimer(updateProgressTimer);
								clearInterTimer(updateGetTimer);
								progressBox.html('<span class="text-danger">update failed!<span>')
								updateText.val('');
								$('<input type="file" name="meu" class="updateFile"/>').appendTo(form);
								updateBtn.css('background','#61619d');
								return;
							}
						}, 2000)
						var pro=0;
						var getProgress = function() {
							getResultGet('deployment/meu/progress?meuId=' + meuId, function(data) {
								var record = JSON.parse(data).rows;
								pro = record.progress;
								var progress='<div class="progress progress-striped progressbox"><div class="progress-bar progress-bar-success" style="width: ' + pro + '%"><span>' + pro + '%</span></div></div>';
								progressBox.html(progress);
								if(pro == 100) {
									clearInterTimer(updateGetTimer)
									clearOutTimer(updateProgressTimer);
									$('<input type="file" name="meu" class="updateFile"/>').appendTo(form);
									updateText.val('');
									setTimeout(function(){
										progressBox.html('<span class="text-danger">update Success!<span>')
									},500)
									updateBtn.css('background','#61619d');
								} else if(pro == -1) {
									$('<input type="file" name="meu" class="updateFile"/>').appendTo(form);
//									updateText.val('');
									updateBtn.css('background','#61619d');
									clearInterTimer(updateGetTimer)
									clearOutTimer(updateProgressTimer);
									setTimeout(function(){
										progressBox.html('<span class="text-danger">update failed!<span>')
									},500)
								} else {
									clearOutTimer(updateProgressTimer);
									updateProgressTimer=setTimeout(function() {//Enable the timer to progress the request, when the progress is not 100 or failed, please use the timer to execute a getProgress function
										getProgress();
									}, 1000)
								}
							})
						}
						getProgress();
					}else{
						updateFile.remove();
						$('<input type="file" name="meu" class="updateFile"/>').appendTo(form);
//						updateText.val('');
						updateBtn.css('background','#61619d');
						progressBox.html('<span class="text-danger">update failed!<span>');
					}
					
				},
				error: function(data) {
					updateFile.remove();
					$('<input type="file" name="meu" class="updateFile"/>').appendTo(form);
					updateBtn.css('background','#61619d');
					progressBox.html('<span class="text-danger">update failed!<span>');
				}
			});
			
		});
		
		$(document).on('click','.updateMeu button',function(ev){
			ev.preventDefault();
			ev.stopPropagation();
		})
		
		//delete app
		var getProgressTimer=null,
			getTimeTimer=null,
			deleteAjax=null,
			progressAjax=null;
			
		$('#btn_delete').click(function(){//delete
			var delAppId=$('.selected td:eq(1) .appsId').html();
			var url=serverIP+'app?appId='+delAppId;
			if(delAppId){
				deleteAjax=deleteTable(url,function(data){
					var time = new Date().getTime();
					var ajaxTime = 2 * 60 * 1000;
					getTimeTimer = setInterval(function() {//The number of timers used here is the cumulative time.
						var lastTime = new Date().getTime();
						if(lastTime - time >= ajaxTime) {
							clearOutTimer(getProgressTimer);
							clearInterTimer(getTimeTimer);
							
							swal("Error~", "Remove Failed !", "error");
							return;
						}
					}, 2000);
					function getProgress(){
						progressAjax=getResultGet('deployment/progress?appId=' + delAppId, function(data) {
							$('.appTable').hide();
							$('.appProgress').show();
//							console.log(data);
							data=JSON.parse(data);
							if(data.code==0){
								var record = data.rows;
//								console.log(record);
								var pro = record.progress;
								if(pro == 100) {
									$('#tips').css('right',0);
									swal("Good~", "Remove Success" + " !", "success");
									$("#tb_table").bootstrapTable('refresh');
									clearInterTimer(getTimeTimer)
									clearOutTimer(getProgressTimer);
								} else if(pro == -1) {
									swal("Error~", "Remove Failed !" + " !", "error");
									clearInterTimer(getTimeTimer)
									clearOutTimer(getProgressTimer);
								} else {
									clearOutTimer(getProgressTimer);
									getProgressTimer=setTimeout(function() {//Enable the timer to progress the request, when the progress is not 100 or failed, please use the timer to execute a getProgress function
										getProgress();
									}, 2000)
								}
								var tableTd = '';
								if(record == '') {
									tableTd += '<tr><td colspan="2">No matching records found</td></tr>';
								} else {
									tableTd += '<tr><td>' + delAppId + '</td><td><div class="progress progress-striped"><div class="progress-bar progress-bar-success" style="width: ' + pro + '%"><span>' + pro + '%</span></div></div></td></tr>'+
									'<tr><td colspan="2"><textarea class="deployInfo"  style="background:#fff;">'+record.message+'</textarea></td></tr>';
								}
								$(".appProgress table tbody").html(tableTd);
								$('.deployInfo').scrollTop($('.deployInfo').get(0).scrollHeight);
							}else{
								clearOutTimer(getProgressTimer);
								clearInterTimer(getTimeTimer);
								swal("Error~", "Remove Failed !", "error");
								return;
							}
						})
					};
					getProgress();					
				});
			}else{
				$(this).css("z-index",0);
				swal("Wait !", "Please select a row to delete !", "info")
			}
		});
		
		
		
		
//		$(document).off('click','.confirm').on('click','.confirm',function(){
//			$('#tips').css('right',-500);
//			$("#tb_table").bootstrapTable('refresh');			
//			if($('.appProgress').css('display')=="block"){
//				$('.appTable').show();
//				$('.appProgress').hide();
//				$('.appProgress table tbody').empty();
//			}			
//		})
		$('#btn_update').click(function(){
			$('.list').removeClass('homeActive').siblings('li').addClass('homeActive');
			var delAppId=$('.selected td:eq(1) .appsId').html();
			if(delAppId){
				getResultGet('app?appId='+delAppId+'',function(data){
					var datas=JSON.parse(data).rows[0];
					window.deployObj.appName=datas.name;
					window.deployObj.appId=delAppId;
					window.deployObj.appDescription=datas.description;
					window.deployObj.appState=1;
					window.deployObj.appStatus=datas.status;
					showRight('deploy');
				})
			}else{
				$(this).css("z-index",0);
				swal("Wait !", "Please select a row to update !", "info");
			}			
		});
		
		function clearTimer(){
			clearInterTimer(getTimeTimer);
			clearOutTimer(getProgressTimer);
		};
		
		function abortAjax(){
			if(deleteAjax){
				deleteAjax.abort();
				if(progressAjax){
					progressAjax.abort();
				}
			}
		};
			
		$('.nav-parent').on('click',function(){
			clearTimer();
			abortAjax();
		});
		
		$('.children li').on('click',function(){
			clearTimer();
			abortAjax();
		});
		
		$('.breadcrumb li').on('click',function(){
			clearTimer();
			abortAjax();
		});
		
	})();
})

function operateEventsId(value, row, index) { //epg add div
	var idRow = row.id;
	var temp = '<div class="appsId">' + idRow + '</div>';
	return temp;
}

function showEpg(value,row,index){
	var temp='';
	if(value.length>0){
		for(var i=0;i<value.length;i++){
			var name=value[i].name?value[i].name:'-';
			temp+='<div class="appEpg" data-toggle="popover" data-placement="right" data-trigger="enter"><p class="epg_id">' + value[i].id + '</p><p class="epg_name hide">'+name+'</p></div>';
		}
	}
	return temp;
}

function showMeu(value,row,index){
	var temp='';
	if(value.length>0){
		for(var i=0;i<value.length;i++){
			temp+='<div class="appMeu" data-toggle="popover" data-placement="left" data-trigger="enter"><p class="meu_name">' + value[i].name + '</p><p class="meu_id hide">'+value[i].id+'</p></div>';
		}
	}
	return temp;
}

function title(ID) {
	var titles = $('<a href="javascript:void(0)" class="showDetail">' + ID + '</a>')
	return titles;
};
function meuTitle(ID) {
	var titles = $('<span>' + ID + '</span>');
	return titles;
};

function content(EpgID) {
	setTimeout(function(){
		parseXml(EpgID);
	},200)
	var data=$('#diagramPopover').html();
	return data;
};

function MeuContent() {
	var meuData = $('<div class="MeuContent"></div>');
	return meuData;
};