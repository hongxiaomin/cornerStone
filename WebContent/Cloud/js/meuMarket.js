var meuMarkets=null;
var idLink='/';
var renewTimer=null;
$(function(){
	getMeus('');
	showMeuItem(getMeus('type=0'),false);
	$('.nav_cloud a').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		var index=$(this).index();
		var currentData=[];
		if(index==0){
			currentData=getMeus('type=0');
			showMeuItem(currentData,false);
		}else if(index==1){
			currentData=getMeus('type=1');
			showMeuItem(currentData,false);
		}else{
			currentData=getMeus('');
			showMeuItem(currentData,true);
		}
		
	})
	
	$('.meu_box').on('click','.meu_item',function(){
		$(this).attr({
			"data-toggle": "modal",
			"data-target": "#meuDetail"
		});
		$(this).siblings().removeAttr('data-toggle').removeAttr('data-target');
		var id=$(this).attr('dataid');
		var meuData=meuMarkets[id];
		console.log(meuData);
		var auth=meuData.definitionJson.meu.author?meuData.definitionJson.meu.author:'';
		var createDate=meuData.definitionJson.meu.creationdate?meuData.definitionJson.meu.creationdate:'';
		var description=meuData.description?meuData.description:'';
		$('#meuDetail span[data_name="name"]').text(meuData.name);
		$('#meuDetail span[data_name="type"]').text(meuData.type);
		$('#meuDetail span[data_name="language"]').text(meuData.definitionJson.meu.language);
		$('#meuDetail span[data_name="author"]').text(auth);
		$('#meuDetail span[data_name="version"]').text(meuData.version);
		$('#meuDetail span[data_name="createDate"]').text(createDate);
		$('#meuDetail article').text(description);
		$('#meuXml .xmlContent').val(meuData.definition);
	});
	
	$('.meu_box').off('click','.purchase').on('click','.purchase',function(ev){
		ev.stopPropagation();
		$('#purchaseMeu').modal('show');
		var meuId=$(this).parents('.meu_item').attr('dataid');
		var meuData=meuMarkets[meuId];
		$('.purchase_box span[data_name="name"]').text(meuData.name);
		$('.purchase_box input[data_name=count]').val('');
		$('.use_time input[data_name=time]').val('');
		$('.select_num_box input').val('Hours');
		var language=meuData.definitionJson.meu.language?meuData.definitionJson.meu.language:'';
		var auth=meuData.definitionJson.meu.author?meuData.definitionJson.meu.author:'';
		var description=meuData.description?meuData.description:'';
		var tableStr  = '<tr>'+
							'<td>name</td>'+
							'<td>'+meuData.name+'</td>'+
						'</tr>'+
						'<tr>'+
							'<td>type</td>'+
							'<td>'+meuData.type+'</td>'+
						'</tr>'+
						'<tr>'+
							'<td>lanaguage</td>'+
							'<td>'+language+'</td>'+
						'</tr>'+
						'<tr>'+
							'<td>version</td>'+
							'<td>'+meuData.version+'</td>'+
						'</tr>'+
						'<tr>'+
							'<td>author</td>'+
							'<td>'+auth+'</td>'+
						'</tr>'+
						'<tr>'+
							'<td>description</td>'+
							'<td>'+description+'</td>'+
						'</tr>';
						
		$('.detail_box table tbody').html(tableStr);				
		
		$('.purchaseCancel').click(function(){
			$('#purchaseMeu').modal('hide');
		});
		
		
		$('.purchaseOk').off('click').on('click',function(){
			var purchaseCount=Number($('.purchase_box input[data_name=count]').val());
			var useageTime=Number($('.use_time input[data_name=time]').val());
			if(purchaseCount&&useageTime){
				var unit=$('.select_num_box input').val();
				console.log(unit);
				switch(unit){
					case "Days":useageTime=useageTime*24*60*60;
					break;
					case "Hours":useageTime=useageTime*60*60;
					break;
					case "Mins":useageTime=useageTime*60;
					break;
					default:useageTime
				}
				var postPurchaseData={
			    	"group": meuData.group,
				    "name": meuData.name,
					"version": meuData.version,
					"count": purchaseCount,
				    "time": useageTime
				};
				var postData=JSON.stringify([postPurchaseData]);
				console.log(postData);
				getResultPost('cloud/license/meu',postData,function(data){
					data=JSON.parse(data);
					console.log(data);
					if(data.code==0){
						swal("Good~", "Purchased Success" + " !", "success");
						$('#purchaseMeu').modal('hide');
						showMeuItem(getMeus(''),true);
					}else{
						swal("Error~", data.message+" !", "error");
					}
					
				})
			}
			
		});
		
	});
	
	var renewData=[];
	
	var renewColumns= [{
			checkbox: true,
			visible:false
		},
		{
			field: 'licenseId',
			title: 'LicenseId',
		},
		{
			field: 'group',
			title: 'Group',
		},
		{
			field: 'name',
			title: 'Name',
		},
		{
			field: 'version',
			title: 'Version',
		},
		{
			field: 'status',
			title: 'Status',
		},
		{
			field: 'appName',
			title: 'App Name',
		},
		{
			field: 'remainTime',
			title: 'Remain Time',
			formatter:function(value,row,index){
				var temp=formtTime(value);
				return temp;
			}
		},
		{
			field: 'purchaseDate',
			title: 'Purchase Date',
		},
		{
			field: 'licenseId',
			title: 'Usage Time',
			formatter: function(value, row, index) {
				var temp = dateDiv();
				return temp;
			},
			width:240
		}];
		
		$('#renewTable').bootstrapTable({
			data:renewData,
			toolbar:'#btn-toolbar',
			striped: true,
			pagination: false,
			showColumns: true,
			showRefresh: false,
			clickToSelect: true,
			showToggle:false,
		    cardView: false,
		    detailView: false,
		    clickToSelect: false,
		    columns:renewColumns,
		});
	
	$('.meu_box').off('click','.renew').on('click','.renew',function(ev){
		ev.stopPropagation();
		$('#ExpiredMeu').modal('show');
		var meuId=$(this).parents('.meu_item').attr('dataid');
		var meuIdArr=meuId.split(idLink);
		getMeuDetail(meuIdArr[0],meuIdArr[1],meuIdArr[2],renewData,'#renewTable');
		$('.renewSure').addClass('disabled');
	});
	
	
	

	$('.meu_box').on('click','.meu_expired',function(){
		$(this).attr({
			"data-toggle": "modal",
			"data-target": "#ExpiredMeu"
		});
		$(this).siblings().removeAttr('data-toggle').removeAttr('data-target');
	})
	
	$(document).off('click','.select_num_box').on('click','.select_num_box',function(ev){
		ev.stopPropagation();
		$(this).find('.date_style').slideToggle();
	});
	
	$(document).off('click','.date_style li').on('click','.date_style li',function(ev){
		var text=$(this).text();
		$(this).parent().siblings('input').val(text);
	});
	
	$('.renewCancl').click(function(){
		$('#ExpiredMeu').modal('hide');
		clearInterval(renewTimer);
		renewTimer=null;
	});
	
	$('.close').click(function(){
		clearInterval(renewTimer);
		renewTimer=null;
	})
	
	$('.modal').click(function(){
		clearInterval(renewTimer);
		renewTimer=null;
	})
	
	$('#renewTable').on('check.bs.table',function(e,row,$element){
		$('.renewSure').removeClass('disabled');
	})
	$('#renewTable').on('check-all.bs.table',function(e,row,$element){
		$('.renewSure').removeClass('disabled');
	})
	$('#renewTable').on('uncheck-all.bs.table',function(e,row,$element){
		$('.renewSure').addClass('disabled');
	})
	
	$('#renewTable').on('uncheck.bs.table',function(e,row,$element){
		var postData=$('#renewTable').bootstrapTable("getSelections");
		if(postData.length==0){
			$('.renewSure').addClass('disabled');
		}
	})
	
	$('#renewTable').off('keyup','.use_time input[type=number]').on('keyup','.use_time input[type=number]',function(ev){
		ev.stopPropagation();
		var index=$(this).parents('tr').index();
		var value=Number($(this).val());
		if(value>0){
			$('#renewTable').bootstrapTable("check",index);
		}else{
			$('#renewTable').bootstrapTable("uncheck",index);
		}
	});
	$('#renewTable').off('click','.use_time input[type=number]').on('click','.use_time input[type=number]',function(ev){
		console.log(123);
		ev.stopPropagation();
		var index=$(this).parents('tr').index();
		var value=Number($(this).val());
		if(value>0){
			$('#renewTable').bootstrapTable("check",index);
		}else{
			$('#renewTable').bootstrapTable("uncheck",index);
		}
	})
	
	$('.renewSure').click(function(){
		var postData=$('#renewTable').bootstrapTable("getSelections");
		var allData=$('#renewTable').bootstrapTable("getData");
		if(postData.length==0){
			return;
		}
		var renewData=[];
		for(var i=0;i<postData.length;i++){
			var licenseId=postData[i].licenseId;
			for(var j=0;j<allData.length;j++){
				if(allData[j].licenseId==licenseId){
					var renewItem={
						"id":licenseId,
						"time":0
					};
					var time=$('#renewTable tbody tr').eq(j).children().last().find('input[data_name="time"]').val();
					var unit=$('#renewTable tbody tr').eq(j).children().last().find('.select_num_box').children('input').val();
					console.log(time);
					console.log(unit);
					if(unit=="Days"){
						renewItem["time"]=time*(24*60*60);
					}else if(unit=="Hours"){
						renewItem["time"]=time*(60*60);
					}else if(unit=="Mins"){
						renewItem["time"]=time*60;
					}else{
						renewItem["time"]=Number(time);
					}
					renewData.push(renewItem);
					continue;
				}
			}
		}
		console.log(renewData);
		var renewRaw=JSON.stringify(renewData);
		ajaxPutReauest('cloud/license/meu',renewRaw,function(data){
			data=JSON.parse(data);
			if(data.code==0){
				swal("Good~", "Renew Success" + " !", "success");
				console.log(data);
				$('#ExpiredMeu').modal('hide');
				var currentNav=$('.nav_cloud .active').text();
				if(currentNav=='Purchased'){
					showMeuItem(getMeus('type=0'),false);
					getMeus('');
				}else if(currentNav=='Expired'){
					showMeuItem(getMeus('type=1'),false);
					getMeus('');
				}else{
					showMeuItem(getMeus(''),true);
				}
				
			}
		})
	});
	
	var meuDetailNum=[];
	var meuDetailColumns= [{
			field: 'licenseId',
			title: 'Index',
			formatter:function(value,row,index){
				return (index+1);
			}
		},
		{
			field: 'licenseId',
			title: 'LicenseId',
		},
		{
			field: 'group',
			title: 'Group',
		},
		{
			field: 'name',
			title: 'Name',
		},
		{
			field: 'version',
			title: 'Version',
		},
		{
			field: 'status',
			title: 'Status',
		},
		{
			field: 'appName',
			title: 'App Name',
		},
		{
			field: 'remainTime',
			title: 'Remain Time',
			formatter:function(value,row,index){
				var temp=formtTime(value);
				return temp;
			}
		},
		{
			field: 'purchaseDate',
			title: 'Purchase Date',
		},
		];
	$('#RenewDetailTable').bootstrapTable({
		data:meuDetailNum,
		toolbar:'#btn-toolbar',
		striped: true,
		pagination: false,
		showColumns: true,
		showRefresh: false,
		clickToSelect: true,
		showToggle:false,
	    cardView: false,
	    detailView: false,
	    clickToSelect: false,
	    columns:meuDetailColumns,
	});
	
	$('.meu_box').off('click','.instance_num').on('click','.instance_num',function(ev){
		clearInterval(renewTimer);
		renewTimer=null;
		ev.stopPropagation();
		$('#RenewDetail').modal('show');
		var meuId=$(this).parents('.meu_item').attr('dataid');
		var meuIdArr=meuId.split(idLink);
		getMeuDetail(meuIdArr[0],meuIdArr[1],meuIdArr[2],meuDetailNum,'#RenewDetailTable');
		renewTimer=setInterval(function(){
			getMeuDetail(meuIdArr[0],meuIdArr[1],meuIdArr[2],meuDetailNum,'#RenewDetailTable');
		},10000)
		
	})
	
})
function showMeuItem(currentData,isAll){
	$('.meu_box').empty();
	if(currentData.length>0){
		var textStr='';
		for(var i=0;i<currentData.length;i++){
			var availableNum='';
			var meuId=currentData[i].group+idLink+currentData[i].name+idLink+currentData[i].version;
			if(isAll){
				var isShowBtn1='';
				var isShowBtn2='hidden';
			}else{
				var isShowBtn1=currentData[i].license?'hidden':'';
				var isShowBtn2=currentData[i].license?'':'hidden';
				if(currentData[i].license){
					availableNum='<a title="instance number" class="instance_num">'+currentData[i].license.totalNum+'</a>';
				}
			}
			var description='';
			if(currentData[i].description){
				description=currentData[i].description;
			}
			textStr+='<div class="meu_item" dataId="'+meuId+'">'+
			availableNum+
			'<h4><p>'+currentData[i].name+'</p><p>'+currentData[i].group+'</p><p>'+currentData[i].version+'</p></h4>'+
			'<p>'+description+'</p>'+
			'<div class="meu_bot">'+
				'<span class="meu_price pull-left">'+
					'¥'+
					'<em>0.1</em>'+
					'&nbsp;/&nbsp;Hour'+
				'</span>'+
				'<span class="pull-right meu_price_btn">'+
					'<button class="btn btn-success purchase '+isShowBtn1+'">Purchase</button>'+
					'<button class="btn btn-primary renew '+isShowBtn2+'">Renew</button>'+
				'</span>'+
			'</div>'+
		'</div>';
		}
		$('.meu_box').html(textStr);
	}
};

function getMeus(type){
	var purchasedMeu=[];
	getAjax(serverIP+'cloud/meu?'+type,function(data){
		data=JSON.parse(data);
		if(data.code==0){
			purchasedMeu=data.rows;
			console.log(type);
			if(!type){
				meuMarkets={};
				var datas=data.rows;
				for(var i=0;i<datas.length;i++){
					var id=datas[i].group+idLink+datas[i].name+idLink+datas[i].version;
					var definitionObj=parseXMLObj(datas[i].definition);
					var definitionJson=xml2json(definitionObj);
					definitionJson="{"+definitionJson.substring(11);
					definitionJson=eval("(" + definitionJson + ")")
					datas[i].definitionJson=definitionJson;
					meuMarkets[id]=deepClone(datas[i]);
				}
			}
		}
	},function(data){
		console.log(data);
	})
	return purchasedMeu;
};


function dateDiv(){
	var divStr='<div class="use_time">'+
					'<input type="number" min="0" data_name="time"/>'+
					'<div class="select_num_box pull-right">'+
						'<input type="text" readonly="readonly" value="Hours"/>'+
						'<span class="caret"></span>'+
						'<ul class="date_style">'+
							'<li>Days</li>'+
							'<li>Hours</li>'+
							'<li>Mins</li>'+
							'<li>Secs</li>'+
						'</ul>'+
					'</div>'+
				'</div>';
	return divStr;
}

function getMeuDetail(group,name,version,columnsData,tableId){
	columnsData=[];
	getAjax(serverIP+'cloud/meu?group='+group+'&name='+name+'&version='+version,function(data){
		data=JSON.parse(data);
		console.log(data);
		if(data.code==0){
			var datas=data.rows[0];
			var licenses=datas.license.licenseList;
			for(var i=0;i<licenses.length;i++){
				var renewObj=deepClone(licenses[i]);
				renewObj["group"]=datas.group;
				renewObj["name"]=datas.name;
				renewObj["version"]=datas.version;
				columnsData.push(renewObj);
			};

			$(tableId).bootstrapTable('refreshOptions',{
				data:columnsData,
			})
		}
	},function(data){
		console.log(data);
	})
};

function formtTime(value){
	var days=Math.floor(value/(60*60*24));
	value=value-days*(60*60*24);
	var hours=Math.floor(value/(60*60));
	value=value-hours*(60*60);
	var mins=Math.floor(value/60);
	value=value-mins*60;
	var secs=value;
	if(days>0){
		if(hours>0){
			if(mins>0){
				if(secs>0){
					return days+'&nbsp;day'+hours+'&nbsp;hours'+mins+'&nbsp;minutes'+secs+'&nbsp;seconds';
				}else{
					return days+'&nbsp;day'+hours+'&nbsp;hours'+mins+'&nbsp;minutes';
				}
			}else{
				if(secs>0){
					return days+'&nbsp;day'+hours+'&nbsp;hours'+secs+'&nbsp;seconds';
				}else{
					return days+'&nbsp;day'+hours+'&nbsp;hours';
				}
			}
		}else{
			if(mins>0){
				if(secs>0){
					return days+'&nbsp;day'+mins+'&nbsp;minutes'+secs+'&nbsp;seconds';
				}else{
					return days+'&nbsp;day'+mins+'&nbsp;minutes';
				}
			}else{
				if(secs>0){
					return days+'&nbsp;day'+secs+'&nbsp;seconds';
				}else{
					return days+'&nbsp;day';
				}
			}
		}
	}else{
		if(hours>0){
			if(mins>0){
				if(secs>0){
					return hours+'&nbsp;hours'+mins+'&nbsp;minutes'+secs+'&nbsp;seconds';
				}else{
					return hours+'&nbsp;hours'+mins+'&nbsp;minutes';
				}
			}else{
				if(secs>0){
					return hours+'&nbsp;hours'+secs+'&nbsp;seconds';
				}else{
					return hours+'&nbsp;hours';
				}
			}
		}else{
			if(mins>0){
				if(secs>0){
					return mins+'&nbsp;minutes'+secs+'&nbsp;seconds';
				}else{
					return mins+'&nbsp;minutes';
				}
			}else{
				if(secs>0){
					return secs+'&nbsp;seconds';
				}else{
					return '0&nbsp;seconds';
				}
			}
		}
	}
};

