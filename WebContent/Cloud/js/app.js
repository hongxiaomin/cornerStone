var allContainer={};
var allMeus={};
var hasContainerName=false;
var selectContainerName=null;
var relContainerMeu=null;
var editName=null;
var point=1;
var finishStep=false;//判断finish动作是已执行
var appId='';
var getProgressTimer = null,
	getTimeTimer = null,
	deployAjax=null,
	progressAjax=null,
	testRemoveNext=false;
var allEpg=null;
var allDetailMeu={};
var selectEpg={};
var allSelectedEpgMeus={};
var MeuConfigurationData={};
var MeuWebContent={};
var fileNum=0;
var editConfigurationFile=null;
var editConfigurationUpload=null;
var isUpdata=false;
var updateDate=null;
var idLink='/';
var isReinstall=false;
var unInstailgetProgressTimer=null;
var unInstailgetTimeTimer=null;
var geReinstalltProgressTimer=null;
var reInstailgetTimeTimer=null;
var unInstailProgressAjax=null;
var uninstallAjax=null;
var installProgressTimer=null;
var installTimeTimer=null;
var reinstallAjax=null;
var reinstallProgressAjax=null;
var installAjax=null;
var installProgressAjax=null;
$(function(){
	var columns = [{
			radio: true
		},
		{
			field: 'name',
			title: 'Name',
			sortable:true
		},
		{
			field: 'description',
			title: 'Description',
		},
		{
			field: 'epgs',
			title: 'EPG',
			formatter:function(value, row, index){
				var epgStr='';
				for(var i=0;i<value.length;i++){
					epgStr+='<p class="app_epg" data-id="'+value[i].id+'">'+value[i].name+'</p>'
				}
				return epgStr;
			}
			
		},
		{
			field: 'meus',
			title: 'MEU',
			formatter:function(value, row, index){
				var meuStr='';
				for(var i=0;i<value.length;i++){
					meuStr+='<p class="app_meu" data-id="'+value[i].id+'">'+value[i].name+'</p>'
				}
				return meuStr;
			}
		},
		{
			field: 'status',
			title: 'Status',
			formatter:function(value,row,index){
				var statusText='';
				if(value==1){
					statusText="<a class='errorLog'>Building</a>";
				}else if(value==2){
					statusText="<a class='errorLog'>Build Success</a>";
				}else if(value==-1){
					statusText="<a class='errorLog'>Build Failed</a>";
				}
				return statusText;
			},
			sortable:true
		},
		{
			field: 'localStatus',
			title: 'Action',
			formatter:function(value,row,index){
				var statusAction='';
				if(value==0){
					if(row.status==2){
						statusAction='<button class="btn btn-primary reInstailBtn">Reinstall</button><button class="btn btn-primary unInstailBtn">Uninstall</button>';
					}else{
						statusAction='<button class="btn btn-primary unInstailBtn">Uninstall</button>';
					}
					
				}else if(value==-1){
					if(row.status==2){
						statusAction='<button class="btn btn-primary instailBtn">Install</button>';
					}
				}
				return statusAction;
			}
		},
		];

	queryParams = function(params) {
		var offset=params.offset;
		var numbers=(offset/params.limit)+1;
		var temp = {
			pageSize: params.limit,
			pageNumber: numbers,
			sortName:params.sort,
			sortOrder:params.order
		};
		return temp;
	};
	
	var oTable = new TableInit();
	oTable.Init(columns,serverIP+'cloud/app', queryParams,'name');
})


$(function(){
	var setting={
			data:{
				simpleData:{
					enable:true
				},
				key:{
					title:"fullName"
				}
			},
			callback: {
				onClick: zTreeOnClick
			}
		};
	function zTreeOnClick(event, treeId, treeNode){
		$('.configura_file').remove();
		$('.configura_upload').addClass("hidden");
		if(treeNode.type=='upload'){
			$('.configura_upload input[type=file]').remove();
			$('.configura_upload').removeClass('hidden');
			var webId=treeNode.tId;
			var parentId=treeNode.parentTId;
			var treeObj = $.fn.zTree.getZTreeObj("configurationTree");
			var parentNode=treeObj.getNodeByTId(parentId);
			if(webId in MeuWebContent){
				if("fileName" in MeuWebContent[webId]){
					var fileInput=$('<input type="file" class="upload_file" name='+MeuWebContent[webId].fileName+'/>');
					$('.configura_upload .upload_text').val(MeuWebContent[webId].fileValue);
				}else{
					fileNum=fileNum+1;
					var fileInput=$('<input type="file" class="upload_file" name="file'+fileNum+'"/>');
					$('.configura_upload .upload_text').val('');
				}
				fileInput.appendTo($('.configura_upload'));
			}else{
				fileNum=fileNum+1;
				MeuWebContent[webId]={
					"parentName":parentNode.name,
					"name":treeNode.name
				};
				var fileInput=$('<input type="file" class="upload_file" name="file'+fileNum+'"/>');
				fileInput.appendTo($('.configura_upload'));
				$('.configura_upload .upload_text').val('');
			}
			editConfigurationUpload=MeuWebContent[webId];
			
		}else if(treeNode.type=='file'){
			var fileId=treeNode.tId;
			var parentId=treeNode.parentTId;
			var treeObj = $.fn.zTree.getZTreeObj("configurationTree");
			var parentNode=treeObj.getNodeByTId(parentId);
			if(fileId in MeuConfigurationData){
				if("content" in MeuConfigurationData[fileId]){
					var textArea=$('<textarea class="configura_file"></textarea>');
					textArea.val(MeuConfigurationData[fileId].content);
				}else{
					var textArea=$('<textarea class="configura_file"></textarea>');
					textArea.val(treeNode.content);
				}
			}else{
				MeuConfigurationData[fileId]={
					"parentName":parentNode.name,
					"name":treeNode.name
				};
				var textArea=$('<textarea class="configura_file"></textarea>');
				textArea.val(treeNode.content);
			}
			textArea.insertBefore($('.configura_upload'));
			editConfigurationFile=MeuConfigurationData[fileId];
			
		}
	};
	$(document).ready(function(){
		$.fn.zTree.init($("#configurationTree"), setting,[]);//设置权限节点树
	});
	
	//编辑配置文件
	$('.configura_detail').on('change','.configura_file',function(){
		var value=$(this).val();
		editConfigurationFile.content=value;
		editConfigurationFile.isChange=true;
	});
	
	//选择上传的文件
	$('.configura_upload').on('change','.upload_file',function(){
		var fileKey=$(this).attr('name');
		editConfigurationUpload.fileName=fileKey;
		$('#createAppForm input[name='+fileKey+']').remove();
		var sameFile=$(this).clone(true).css('opacity',1).appendTo($('#createAppForm'));
		$('.configura_upload .upload_text').val(this.files[0].name);
		editConfigurationUpload.fileValue=this.files[0].name;
		editConfigurationUpload.isChange=true;
	})
	
	
	
//create appp
	$('#btn_create').click(function(){
		$('#appTable').addClass('hidden')
		$('#createApp').removeClass('hidden');
		$('.epg_list_content').empty();
		$('.saveApp').addClass('disabled');
		if(!allEpg){
			getAllEpg();
			getAllDetailMeu();
		}
		var epgStr='';
		for(var key in allEpg){
			epgStr+='<li><input type="checkbox" id="'+key+'" /><label for="'+key+'">'+allEpg[key].name+'</label></li>';
		}
		$('.epg_list_content').html(epgStr)
	});
	
	//selectEpg
	$('.epg_list_content').off('click','li').on('click','li',function(ev){
		ev.stopPropagation();
		selectEpg={};
		for(var i=0;i<$('.epg_list_content li').length;i++){
			if($('.epg_list_content li').eq(i).find('input[type=checkbox]').get(0).checked){
				var epgId=$('.epg_list_content li').eq(i).find('input[type=checkbox]').attr('id');
				selectEpg[epgId]=deepClone(allEpg[epgId]);
			}
		}
		allSelectedEpgMeus={};
		for(var key in selectEpg){
			var currentMeus=selectEpg[key].meus;
			if(currentMeus&&currentMeus.length>0){
				for(var k=0;k<currentMeus.length;k++){
					var meuId=currentMeus[k].group+idLink+currentMeus[k].name+idLink+currentMeus[k].version;
					allSelectedEpgMeus[meuId]=currentMeus[k];
				}
			}
		}
		
		var newTreeNodes=[];
		for(var meu in allSelectedEpgMeus){
			var meuNode={
				"name":meu,
				"open":true,
				"isParent":true,
				"children":[],
			};
			if(allDetailMeu[meu]&&allDetailMeu[meu].type==='webApi'){
				var webContent={
									"name":'WebContent',
									"icon":"../../common/img/upload.png",
									"type":"upload"
							};
				meuNode.children.push(webContent);
			}
			if(!allSelectedEpgMeus[meu]["configuration"]){
				getAjax(serverIP+'cloud/meu/configuration?group='+allSelectedEpgMeus[meu].group+'&name='+allSelectedEpgMeus[meu].name+'&version='+allSelectedEpgMeus[meu].version,function(data){
					data=JSON.parse(data);
					var datas=data.rows;
					if(datas.length>0){
						var currentConfiguration={};
						for(var i=0;i<datas.length;i++){
							currentConfiguration[datas[i].fileName]=datas[i];
						}
						allSelectedEpgMeus[meu]["configuration"]=currentConfiguration;
					}else{
						allSelectedEpgMeus[meu]["configuration"]=null;
					}
					
				},function(data){
				})
			}
			if(allSelectedEpgMeus[meu]["configuration"]){
				for(var meuFile in allSelectedEpgMeus[meu]["configuration"]){
					var childNode={
						"name":meuFile,
						"icon":"../../common/img/file.png",
						"type":"file",
						"content":allSelectedEpgMeus[meu]["configuration"][meuFile].content
					};
					meuNode.children.push(childNode);
				}
			}
			newTreeNodes.push(meuNode);
		}
		$(document).ready(function(){
			$.fn.zTree.init($("#configurationTree"), setting,newTreeNodes);//设置权限节点树
		});
		$('#createAppForm input[type=file]').remove();
		$('.configura_upload').addClass('hidden');
		$('.configura_upload .upload_file').remove();
		$('.configura_file').remove();
		MeuConfigurationData={};
		MeuWebContent={};
		fileNum=0;
		editConfigurationFile=null;
		editConfigurationUpload=null;
		var appName=$('.basic_info input[name="name"]').val().trim();
		var epgLen=selectEpgLen();
		if(appName&&epgLen){
			$('.saveApp').removeClass('disabled');
		}else{
			$('.saveApp').addClass('disabled');
		}
	});
	
	//关闭app页面
	$('.cancelApp').click(function(){
		initCreate();
	});
	
	//提交app
	$('.saveApp').click(function(){
		var appName=$('.basic_info input[name=name]').val().trim();
		var appdescription=$('.basic_info input[name=description]').val();
		var epgArr=[];
		for(var key in selectEpg){
			epgArr.push(key);
		}
		var configurations=[];
		var configurationsObj={};
		for(var property in MeuConfigurationData){
			if(MeuConfigurationData[property]["isChange"]){
				var meuName=MeuConfigurationData[property].parentName;
				var propertyName=MeuConfigurationData[property].name;
				var content=MeuConfigurationData[property].content;
				meuArr=meuName.split(idLink);
				if(meuName in configurationsObj){
					configurationsObj[meuName].configuration.push({
						"fileName":propertyName,
						"content":content
					});
				}else{
					configurationsObj[meuName]={
						"group":meuArr[0],
						"name":meuArr[1],
						"version":meuArr[2],
						"configuration":[
							{
								"fileName":propertyName,
								"content":content
							}
						]
					}
				}
			}
		}
		for(var meu in configurationsObj){
			configurations.push(configurationsObj[meu]);
		}
		
		var uploadFile=[];
		for(var upload in MeuWebContent){
			if(MeuWebContent[upload]["isChange"]){
				var meuName=MeuWebContent[upload].parentName;
				var targetDirectory=MeuWebContent[upload].name;
				var file=MeuWebContent[upload].fileName;
				meuArr=meuName.split(idLink);
				uploadFile.push({
					"group":meuArr[0],
					"name":meuArr[1],
					"version":meuArr[2],
					"targetDirectory":targetDirectory,
					"file":file
				});
			}
		}
		
		if(appName&&epgArr.length>0){
			var appInfo={
				"name":appName,
				"description":appdescription,
				"epgs":epgArr,
				"configurations":configurations,
				"uploadFile":uploadFile
			}
			console.log(appInfo);
			$('#loadingbg').show();
			if(isUpdata){
				appInfo.id=updateDate.id;
				$('#createAppForm input[name=appInfo]').val(JSON.stringify(appInfo));
					$('#createAppForm').ajaxSubmit({
					type: "put",
					dataType: "text",
					url: serverIP + 'cloud/app',
					success:function(data){
						data=JSON.parse(data);
						if(data.code==0){
							$('#loadingbg').hide();
							swal("Good~", "Update App Success !", "success");
							initCreate();
						}else{
							$('#loadingbg').hide();
						    swal("Error~", ""+data.message+" !", "error");
						}
					},error:function(data){
						$('#loadingbg').hide();
						swal("Error~", "Update App Failed !", "error");
					}
				})
			}else{
				$('#createAppForm input[name=appInfo]').val(JSON.stringify(appInfo));
				$('#createAppForm').ajaxSubmit({
					type: "post",
					dataType: "text",
					url: serverIP + 'cloud/app',
					success:function(data){
						data=JSON.parse(data);
						if(data.code==0){
							$('#loadingbg').hide();
							swal("Good~", "Create App Success !", "success");
							initCreate();
						}else{
							$('#loadingbg').hide();
						    swal("Error~", "Create App Failed !", "error");
						}
					},error:function(data){
						$('#loadingbg').hide();
						swal("Error~", "Create App Failed !", "error");
					}
				})
			}
			
		}
		
	});
	//create app button OK is available or not
	$('#createApp input[name=name]').keyup(function(){
		var appName=$(this).val().trim();
		var epgLen=selectEpgLen();
		if(appName&&epgLen){
			$('.saveApp').removeClass('disabled');
		}else{
			$('.saveApp').addClass('disabled');
		}
	})
	
	
	function selectEpgLen(){
		var epgArr=[];
		for(var key in selectEpg){
			epgArr.push(key);
		}
		return epgArr.length;
	}
	
	//删除app
	$('#btn_delete').click(function(){
		var deleteData=$('#tb_table').bootstrapTable("getSelections")[0];
		if(deleteData){
			if(deleteData.status==1){
				return;
			}
			var id=deleteData.id;
			deleteAjaxResult('cloud/app?id='+id,function(data){
				data=JSON.parse(data);
				if(data.code==0){
					swal("Good~", "Delete App Success !", "success");
					$('#tb_table').bootstrapTable('refresh');
					$('#btn_delete').addClass('disabled');
					$('#btn_update').addClass('disabled');
				}else{
					swal("Error~", data.message+'!', "error");
				}
			})
		}
	});
	
	//显示build Error的log信息
	$('#tb_table').on('click','.errorLog',function(){
		var selectData=$('#tb_table').bootstrapTable("getSelections")[0];
		getResultGet('cloud/app/buildlog?&id='+selectData.id,function(data){
			data=JSON.parse(data);
			if(data.code==0){
				$('.errorLog').removeAttr('data-toggle','data-target');
				$(this).attr({
					'data-toggle':"modal", 
					'data-target':"#errorLog"
				});
				var message=data.rows.message;
				$('.logContent').text(message);
				$('#errorLog').modal('show');
			}else{
				$('#errorLog').modal('hide');
				swal("Error~", ""+data.message+"!", "error");
			}
		})
	});
	
	$('#tb_table').on('check.bs.table',function(e,row,$element){
		if(row.status==1){
			$('#btn_delete').addClass('disabled');
			$('#btn_update').addClass('disabled');
		}else{
			if(row.localStatus==0){
				$('#btn_delete').addClass('disabled');
			}else{
				$('#btn_delete').removeClass('disabled');
			}
			$('#btn_update').removeClass('disabled');
		}
	})
	
	//Update App
	$('#btn_update').click(function(){
		var deleteData=$('#tb_table').bootstrapTable("getSelections")[0];
		if(deleteData){
			if(deleteData.status==1){
				return;
			}
			isUpdata=true;
			updateDate=deleteData;
			$('#appTable').addClass('hidden')
			$('#createApp').removeClass('hidden');
			$('.basic_info input[name=name]').val(updateDate.name);
			$('.basic_info input[name=description]').val(updateDate.description);
			$('.epg_list_content').empty();
			if(!allEpg){
				getAllEpg();
				getAllDetailMeu();
			}
			var updateEpgs=updateDate.epgs;
			var updateMeus=[];
			for(var k=0;k<updateEpgs.length;k++){
				selectEpg[updateEpgs[k].id]=updateEpgs[k];
				updateMeus=updateMeus.concat(allEpg[updateEpgs[k].id]["meus"]);
			}
			var epgStr='';
			for(var key in allEpg){
				var isChecked=false;
				if(key in selectEpg){
					isChecked=true;
				}
				if(isChecked){
					epgStr+='<li><input type="checkbox" id="'+key+'" checked="checked" /><label for="'+key+'">'+allEpg[key].name+'</label></li>';
				}else{
					epgStr+='<li><input type="checkbox" id="'+key+'" /><label for="'+key+'">'+allEpg[key].name+'</label></li>';
				}
			}
			$('.epg_list_content').html(epgStr)
			
			allSelectedEpgMeus={};
			for(var n=0;n<updateMeus.length;n++){
				var meuId=updateMeus[n].group+idLink+updateMeus[n].name+idLink+updateMeus[n].version;
				allSelectedEpgMeus[meuId]=updateMeus[n];
			}
			
			var newTreeNodes=[];
			for(var meu in allSelectedEpgMeus){
				var meuNode={
					"name":meu,
					"open":true,
					"isParent":true,
					"children":[],
				};
				if(allDetailMeu[meu].type==='webApi'){
					var webContent={
										"name":'WebContent',
										"icon":"../../common/img/upload.png",
										"type":"upload"
								};
					meuNode.children.push(webContent);
				}else if(allDetailMeu[meu].type==='bpmn'){
					var bpmn={
								"name":'bpmn',
								"icon":"../../common/img/upload.png",
								"type":"upload"
							};
					meuNode.children.push(bpmn);
				}
				if(!allSelectedEpgMeus[meu]["configuration"]){
					getAjax(serverIP+'cloud/meu/configuration?group='+allSelectedEpgMeus[meu].group+'&name='+allSelectedEpgMeus[meu].name+'&version='+allSelectedEpgMeus[meu].version,function(data){
						data=JSON.parse(data);
						var datas=data.rows;
						if(datas.length>0){
							var currentConfiguration={};
							for(var i=0;i<datas.length;i++){
								currentConfiguration[datas[i].fileName]=datas[i];
							}
							allSelectedEpgMeus[meu]["configuration"]=currentConfiguration;
						}else{
							allSelectedEpgMeus[meu]["configuration"]=null;
						}
						
					},function(data){
					})
				}
				if(allSelectedEpgMeus[meu]["configuration"]){
					for(var meuFile in allSelectedEpgMeus[meu]["configuration"]){
						var childNode={
							"name":meuFile,
							"icon":"../../common/img/file.png",
							"type":"file",
							"content":allSelectedEpgMeus[meu]["configuration"][meuFile].content
						};
						meuNode.children.push(childNode);
					}
				}
				newTreeNodes.push(meuNode);
			}
			$(document).ready(function(){
				$.fn.zTree.init($("#configurationTree"), setting,newTreeNodes);//设置权限节点树
			});
			$('.saveApp').removeClass('disabled');
		}
	})
	
	//退出create App时数据初始化
	function initCreate(){
		$('#createApp').addClass('hidden');
		$('#appTable').removeClass('hidden');
		$('#tb_table').bootstrapTable('refresh');
		$('#createAppForm input[type=file]').remove();
		$('.configura_upload').addClass('hidden');
		$('.configura_upload .upload_file').remove();
		$('.configura_file').remove();
		$('.basic_info input[name=name]').val('');
		$('.basic_info input[name=description]').val('');
		selectEpg={};
		allSelectedEpgMeus={};
		MeuConfigurationData={};
		MeuWebContent={};
		fileNum=0;
		editConfigurationFile=null;
		editConfigurationUpload=null;
		isUpdata=false;
		$(document).ready(function(){
			$.fn.zTree.init($("#configurationTree"), setting,[]);//设置权限节点树
		});
		$('#btn_delete').addClass('disabled');
		$('#btn_update').addClass('disabled');
	}
	
	function getAllEpg(){
		getAjax(serverIP+'cloud/epg',function(data){
			data=JSON.parse(data);
			allEpg={};
			var datas=data.rows;
			for(var i=0;i<datas.length;i++){
				allEpg[datas[i].id]=datas[i];
			}
		});
	}
	
	function getAllDetailMeu(){
		getAjax(serverIP+'cloud/meu',function(data){
			data=JSON.parse(data);
			var datas=data.rows;
			for(var i=0;i<datas.length;i++){
				var id=datas[i].group+idLink+datas[i].name+idLink+datas[i].version;
				var definitionObj=parseXMLObj(datas[i].definition);
				var definitionJson=xml2json(definitionObj);
				definitionJson="{"+definitionJson.substring(11);
				definitionJson=eval("(" + definitionJson + ")")
				datas[i].definitionJson=definitionJson;
				if(definitionJson.meu.operations){
					if(isClass(definitionJson.meu.operations.operation)==='Object'){
						datas[i].operations=[definitionJson.meu.operations.operation];
					}else if(isClass(definitionJson.meu.operations.operation)==='Array'){
						datas[i].operations=definitionJson.meu.operations.operation;
					}
				}else{
					datas[i].operations=[];
				}
				datas[i].id=id;
				datas[i].type=definitionJson.meu.type;
				allDetailMeu[id]=datas[i];
			}
		});
	}
	
	
});

//deloy app
$(function(){
	$("#wizard").steps({
		headerTag: "h3",
		bodyTag: "section",
		transitionEffect: "slideLeft"
	});
	
//点击install，显示deploy页面
	$('#tb_table').on('click','.instailBtn',function(){
		$('#deployApp').removeClass('hidden');
		$('#appTable').addClass('hidden');
		var index=$(this).parents('tr').index();
		var appData=$('#tb_table').bootstrapTable('getData')[index];
		appId=appData.id;
		getAjax(serverIP+'cloud/deployment/configuration?appId='+appId+'',function(data){
			var datas=JSON.parse(data);
			allMeus={};
			allContainer={};
			if(datas.code==0){
				var meus=datas.rows.meus;
				var containers=datas.rows.containers;
				
				for(var i=0;i<meus.length;i++){
					allMeus[meus[i].meuId]=meus[i];
				}
				for(var j=0;j<containers.length;j++){
					allContainer[containers[j].containerName]=containers[j];
				}
				
				showMeu();
				showContainer();
				removeNext();
			};
			
		},function(data){
		})
	})
	
	//reInstall
	$('#tb_table').on('click','.reInstailBtn',function(){
		$('#deployApp').removeClass('hidden');
		$('#appTable').addClass('hidden');
		var index=$(this).parents('tr').index();
		var appData=$('#tb_table').bootstrapTable('getData')[index];
		appId=appData.id;
		getAjax(serverIP+'cloud/deployment/configuration?appId='+appId+'',function(data){
			var datas=JSON.parse(data);
			allMeus={};
			allContainer={};
			if(datas.code==0){
				var meus=datas.rows.meus;
				var containers=datas.rows.containers;
				
				for(var i=0;i<meus.length;i++){
					allMeus[meus[i].meuId]=meus[i];
				}
				for(var j=0;j<containers.length;j++){
					allContainer[containers[j].containerName]=containers[j];
				}
				
				showMeu();
				showContainer();
				removeNext();
				isReinstall=true;
			};
			
		},function(data){
		})
	});
	
	//unInstall
	$('#tb_table').on('click','.unInstailBtn',function(){
		var index=$(this).parents('tr').index();
		var appData=$('#tb_table').bootstrapTable('getData')[index];
		appId=appData.id;
		uninstallAjax=deleteAjaxResult('cloud/deployment/app?appId='+appId,function(data){
			data=JSON.parse(data);
			if(data.code==0){
				var time = new Date().getTime();
				var ajaxTime = 2 * 60 * 1000;
				unInstailgetTimeTimer = setInterval(function() {//The number of timers used here is the cumulative time.
					var lastTime = new Date().getTime();
					if(lastTime - time >= ajaxTime) {
						clearOutTimer(unInstailgetProgressTimer);
						clearInterTimer(unInstailgetTimeTimer);
						
						swal("Error~", "Remove Failed !", "error");
						return;
					}
				}, 2000);
				function getProgress(){
					unInstailProgressAjax=getResultGet('cloud/deployment/progress?appId=' + appId, function(data) {
						$('#appTable').hide();
						$('.appProgress').show();
						data=JSON.parse(data);
						if(data.code==0){
							var record = data.rows;
							var pro = record.progress;
							if(pro == 100) {
								swal("Good~", "Uninstall Success" + " !", "success");
								$("#tb_table").bootstrapTable('refresh');
								clearInterTimer(unInstailgetTimeTimer)
								clearOutTimer(unInstailgetProgressTimer);
							} else if(pro == -1) {
								swal("Error~", record.message + " !", "error");
								clearInterTimer(unInstailgetTimeTimer)
								clearOutTimer(unInstailgetProgressTimer);
							} else {
								clearOutTimer(unInstailgetProgressTimer);
								unInstailgetProgressTimer=setTimeout(function() {//Enable the timer to progress the request, when the progress is not 100 or failed, please use the timer to execute a getProgress function
									getProgress();
								}, 2000)
							}
							var tableTd = '';
							if(record == '') {
								tableTd += '<tr><td colspan="2">No matching records found</td></tr>';
							} else {
								tableTd += '<tr><td>' + appId + '</td><td><div class="progress progress-striped"><div class="progress-bar progress-bar-success" style="width: ' + pro + '%"><span>' + pro + '%</span></div></div></td></tr>';
							}
							$(".appProgress table tbody").html(tableTd);
						}else{
							clearOutTimer(unInstailgetProgressTimer);
							clearInterTimer(unInstailgetTimeTimer);
							swal("Error~", data.message+'!', "error");
							$('#tb_table').bootstrapTable('refresh');
							return;
						}
					})
				};
				getProgress();	
			}else{
				swal("Error~", data.message+'!', "error");
				$('#tb_table').bootstrapTable('refresh');
			}
		})
	});
	
	$(document).off('click','.confirm').on('click','.confirm',function(){
		$("#tb_table").bootstrapTable('refresh');			
		if($('.appProgress').css('display')=="block"){
			$('#appTable').show();
			$('.appProgress').hide();
			$('.appProgress table tbody').empty();
		}			
	})
	
	//选择 MeuList 中的meu
	$('#meuListAll').on('click','li',function(){
		if($(this).children('div').children('input').get(0).checked){
			$('.transfer-operation .right').addClass('active');
		}
		var allMeus=$('#meuListAll input');
		var checkAllOne=true;
		var transferRight=true;
		for(var i=0;i<allMeus.length;i++){
			if(allMeus.eq(i).get(0).checked){
				transferRight=false;
			}
			if(!allMeus.eq(i).get(0).checked){
				checkAllOne=false;
			}
		}
		if(checkAllOne){
			$('#allcheck1').get(0).checked=true;
		}else{
			$('#allcheck1').get(0).checked=false;
		}
		if(transferRight){
			$('.transfer-operation .right').removeClass('active');
		}
	});
	//选择Container 中的meu
	$('#MeuDetail').on('click','li',function(){
		if($(this).children('div').children('input').get(0).checked){
			$('.transfer-operation .left').addClass('active');
		}
		var allMeus=$('#MeuDetail input');
		var checkAllTwo=true;
		var transferLeft=true;
		for(var i=0;i<allMeus.length;i++){
			if(allMeus.eq(i).get(0).checked){
				transferLeft=false;
			}
			if(!allMeus.eq(i).get(0).checked){
				checkAllTwo=false;
			}
		}
		if(checkAllTwo){
			$('#allcheck2').get(0).checked=true;
		}else{
			$('#allcheck2').get(0).checked=false;
		}
		if(transferLeft){
			$('.transfer-operation .left').removeClass('active');
		}
	});
	
	//选中meulist中所有的meu
	$('.allcheck1').click(function(){
		checkAll.call(this,$('#meuListAll input'),$('.transfer-operation .right'));
	})
	//选中Container中所有的meu
	$('.allcheck2').click(function(){
		checkAll.call(this,$('#MeuDetail input'),$('.transfer-operation .left'));
	})
	//左边的meu右移
	$('.transfer-operation .right').on('click',function(){
		var checkedLis=[];
		var currentContainer=allContainer[selectContainerName];
		for(var i=0;i<$('#meuListAll li').length;i++){
			var checkInput=$('#meuListAll li').eq(i).children('div').children('input').get(0);
			if(checkInput.checked){
				checkedLis.unshift($('#meuListAll li').eq(i));
			}
		}
		if(checkedLis.length>0){
			if(!currentContainer.meu){
				currentContainer.meu=[];
			}
			for(var j=0;j<checkedLis.length;j++){
				checkedLis[j].children('div').children('input').get(0).checked=false;
				checkedLis[j].prependTo($('#MeuDetail'));
				var meuId=checkedLis[j].attr('data-id');
				currentContainer.meu.push(allMeus[meuId]);
				delete(allMeus[meuId]);
			}
			for(var k=0;k<$('#MeuDetail li').length;k++){
				$('#MeuDetail li').eq(k).children('div').children('input').get(0).checked=false;
			}
			$(this).removeClass('active');
			$('.transfer-operation .left').removeClass('active');
			$('#allcheck1').get(0).checked=false;
			$('#allcheck2').get(0).checked=false;
		}
	})
	//右边的meu左移
	$('.transfer-operation .left').on('click',function(){
		var checkedLis=[];
		var currentContainer=allContainer[selectContainerName];
		var currentMeus=currentContainer.meu;
		for(var i=0;i<$('#MeuDetail li').length;i++){
			var checkInput=$('#MeuDetail li').eq(i).children('div').children('input').get(0);
			if(checkInput.checked){
				checkedLis.unshift($('#MeuDetail li').eq(i));
			}
		}
		if(checkedLis.length>0){
			for(var j=0;j<checkedLis.length;j++){
				checkedLis[j].prependTo($('#meuListAll'));
				var dataId=checkedLis[j].attr('data-id');
				for(var k=0;k<currentMeus.length;k++){
					if(currentMeus[k].meuId==dataId){
						allMeus[dataId]=currentMeus[k];
						currentMeus.splice(k,1);
						continue;
					}
				}
			}
			
			for(var k=0;k<$('#meuListAll li').length;k++){
				$('#meuListAll li').eq(k).children('div').children('input').get(0).checked=false;
			}
			$(this).removeClass('active');
			$('.transfer-operation .right').removeClass('active');
			$('#allcheck1').get(0).checked=false;
			$('#allcheck2').get(0).checked=false;
			
		}
	})
	
	//editContainer
	$('#editContainer').click(function(){
		var currentContainer=allContainer[selectContainerName];
		var containerName=currentContainer.containerName;
		var configuration=currentContainer.configuration;
		var maxTryCount='';
		var maxTryTiming='';
		if(configuration){
			if(configuration.maxTryCount){
				maxTryCount=configuration.maxTryCount;
			}
			if(configuration.maxTryTiming){
				maxTryTiming=configuration.maxTryTiming;
			}
			
		}
		$('#creatContainer input[name=containerName]').val(containerName);
		$('#creatContainer input[name=retryCount]').val(maxTryCount);
		$('#creatContainer input[name=waitTime]').val(maxTryTiming);
		editName=selectContainerName;
	})
	

	//保存Container
	$('#saveContainer').click(function(){
		var name=$('#creatContainer input[name=containerName]').val().trim();
		var maxTryCount=$('#creatContainer input[name=retryCount]').val();
		var maxTryTiming=$('#creatContainer input[name=waitTime]').val();
		
					
		if(!name||hasContainerName){
			if(!name){
				$('#nameInfo').removeClass('hide').html('The name parameter must exist');
			}
			return false;
		}else{
			if(name&&!hasContainerName){
				if(!editName){
					var containerObj={};
					containerObj.canEdit=true;
					containerObj.meu=[];
					containerObj.canAssign=true;
					containerObj.configuration={};
					containerObj.containerName=name;
					if(maxTryCount){
						containerObj.configuration.maxTryCount=maxTryCount;
					}
					if(maxTryTiming){
						containerObj.configuration.maxTryTiming=maxTryTiming;
					}
					allContainer[name]=containerObj;
				}else{
					var editContainer=allContainer[editName];
					editContainer.containerName=name;
					if(!editContainer.configuration){
						editContainer.configuration={};
					}
					if(maxTryCount){
						editContainer.configuration.maxTryCount=maxTryCount;
					}
					if(maxTryTiming){
						editContainer.configuration.maxTryTiming=maxTryTiming;
					}
					allContainer[name]=editContainer;
					delete(allContainer[editName]);
				}
				
			}
		}
		
		$('#creatContainer input').val('');
		$('#creatContainer input[name=retryCount]').val(5);
		$('#creatContainer input[name=waitTime]').val(30)
//		$(this).attr('data-dismiss','modal').trigger('click');
		$('#creatContainer').modal('hide');
		$('.transfer-operation').hide();
		selectContainerName=null;
		editName=null;
		$('#editContainer').hide();
		showContainer();
		showMeu();
	});
	
	//取消编辑Container
	$('#cancelContainer').click(function(){
		editName=null;
		$('#creatContainer input').val('');
		$('#creatContainer input[name=retryCount]').val(5);
		$('#creatContainer input[name=waitTime]').val(30)
	})
		
	//取消编辑Container
	$('.close').click(function(){
		editName=null;
		$('#creatContainer input').val('');
		$('#creatContainer input[name=retryCount]').val(5);
		$('#creatContainer input[name=waitTime]').val(30)
	})
	
	//显示Container选项
	$('.transfer-select').on('click',function(){
		$('.transfer-select span').toggleClass('glyphicon-triangle-top');
		$('.container_list').slideToggle();
	});
	
	//选择Container
	$('.container_list ').on('click','li',function(){
		$('#container').val($(this).html());
		var name=$(this).html();
		selectContainerName=name;
		var canEdit=allContainer[name].canEdit;
		
		if(canEdit){
			$('#editContainer').show();
		}else{
			$('#editContainer').hide();
		}
		showMeu(name);
		
	})
	
	//验证ContainerName的唯一性
	$('#creatContainer input[name=containerName]').blur(function(){
		var containerName=$(this).val().trim();
		if(!!containerName){
			var validationUrl='container/validation?name='+containerName+'';
			getResultGet1(validationUrl,function(data){
				data=JSON.parse(data);
				if(data.code==0){
					if(!data.rows.result){
						$('#nameInfo').removeClass('hide').html(data.message);
						hasContainerName=true;
					}else{
						var lis=$('.container_list li');
						for(var i=0;i<lis.length;i++){
							var text=lis.eq(i).text();
							if(text==containerName){
								$('#nameInfo').removeClass('hide').html('The name '+containerName+' is already exists');
								hasContainerName=true;
								return;
							}
						}
						$('#nameInfo').addClass('hide');
						hasContainerName=false;
					}
				}else{
					hasContainerName=true;
					$('#nameInfo').removeClass('hide').html(data.message);
					
				}
			})
		}
		
	});
	//绑定nextClick方法
	$("#wizard .actions li").eq(1).children('a').on('click', nextClick);

	//绑定PrevClick方法
	$('#wizard ul a[href=#previous]').on('click', prevClick);
	
	//绑定finishClick方法
	$('#wizard ul a[href=#finish]').on('click', finishClick);
	
		
	//清除定时器和ajax请求
		
	$('.nav-parent').on('click',function(){
		clearTimer();
		abortAjax();
	});
	
	$('.children li').on('click',function(){
		clearTimer();
		abortAjax();
	});
	
	//	跳转meu 页面
	$('.cloudMeu').click(function(){
		clearTimer();
		abortAjax();
		showRight('CloudMeu');
		menuActive($('.CloudMeu'));
//		$('.nav li').removeClass('homeActive');
//		$('.CloudMeu').addClass('homeActive');
//		if($('.CloudMeu').hasClass('second-nav')){
//			$('.CloudMeu').next().slideDown(500);
//			$('.CloudMeu').children().children().eq(1).attr('class','pull-right glyphicon glyphicon-minus');
//		}
//		$('.CloudMeu').parent('ul').slideDown(500);
	})
	
	function clearTimer(){
		clearInterTimer(reInstailgetTimeTimer);
		clearOutTimer(geReinstalltProgressTimer);
		clearOutTimer(installProgressTimer);
		clearInterTimer(installTimeTimer);
		clearOutTimer(unInstailgetProgressTimer);
		clearInterTimer(unInstailgetTimeTimer);
	};
	
	function abortAjax(){
		if(uninstallAjax){
			uninstallAjax.abort();
			if(unInstailProgressAjax){
				unInstailProgressAjax.abort();
			}
		}
		if(reinstallAjax){
			reinstallAjax.abort();
			if(reinstallProgressAjax){
				reinstallProgressAjax.abort();
			}
		}
		if(installAjax){
			installAjax.abort();
			if(installProgressAjax){
				installProgressAjax.abort();
			}
		}
	};
	
	//选中全部的方法
	function checkAll(ele,opera){
		var check=$(this).children('input').get(0).checked;
		for(var i=0;i<ele.length;i++){
			ele.eq(i).get(0).checked=check;
		}
		if(check){
			opera.addClass('active');
		}else{
			opera.removeClass('active');
		}
	}
	
	//显示meu列表
	function showMeu(name){
		$('#meuListAll').empty();
		$('#MeuDetail').empty();
		
		if(!name){
			$('.transfer-operation').hide();
		}else{
			var canAssign=allContainer[name].canAssign;
			if(canAssign){
				$('.transfer-operation').show();
			}else{
				$('.transfer-operation').hide();
			}
		}
		
		for(var key in allMeus){
			var meuName=allMeus[key].meuName?allMeus[key].meuName:'-';
			var li=$('<li data-id="'+key+'"><div><input type="checkbox"  id="'+key+'" value="'+key+'" /><label for="'+key+'">'+meuName+'</label></div></li>');
			li.appendTo($('#meuListAll'));
		}
		if(!!name){
			if('meu' in allContainer[name]){
				for(var i=0;i<allContainer[name].meu.length;i++){
					var li=$('<li data-id="'+(allContainer[name].meu[i].meuId)+'"><div><input type="checkbox"  id="'+(allContainer[name].meu[i].meuId)+'" value="'+(allContainer[name].meu[i].meuId)+'" /><label for="'+(allContainer[name].meu[i].meuId)+'">'+(allContainer[name].meu[i].meuName)+'</label></div></li>');
					li.appendTo($('#MeuDetail'));
					
				}
			}
		}
		$('#allcheck1').get(0).checked=false;
		$('#allcheck2').get(0).checked=false;
	};
			
	//显示Container列表
	function showContainer(){
		$('#container').val('');
		$('.container_list').empty();
		var data=[];
		for(var key in allContainer){
			data.push(allContainer[key]);
		}
		for(var i=0;i<data.length;i++){
			var li=$('<li data-edit="'+data[i].canEdit+'">'+data[i].containerName+'</li>');
			li.appendTo($('.container_list'));
		}
		
	}
	//移除next行为
	function removeNext() {
		$('#wizard').find(".actions a[href=#next]").attr("href", 'javascript:;');
	};
	
	function addNext() {
		var aLis = $("#wizard .actions a");
		for(var i = 0; i < aLis.length; i++) {
			if(aLis[i].innerHTML == "Next") {
				if($(aLis[i]).attr('href') !== '#next') {
					$(aLis[i]).attr('href', '#next');
					$("#wizard .actions a[href=#next]").off('click', nextClick).click();
					$("#wizard .actions li").eq(1).children('a').on('click', nextClick);
				}
				break;
			}
		}
	};
	
	function nextClick(){
		$('.steps li[role=tab]').addClass('disabled');
		var hasMeu=false;
		for(var key in allMeus){
			hasMeu=true;
		}
		if(!hasMeu){
			addNext();
//			console.log('第二部');
			var setting={};
			var containerNodes=[];
			var postContainerData=[];
//			console.log(allContainer)
			for(var key in allContainer){
				var containerNode={};
				var postData={};
				containerNode.name=allContainer[key].containerName;
				containerNode.open=true;
				containerNode.children=[];
				
				postData.containerName=allContainer[key].containerName;
				if(allContainer[key].configuration){
					postData.configuration=allContainer[key].configuration;
				}
				postData.meus=[];
				if(!allContainer[key].meu){
					allContainer[key].meu=[];
				}
				if(allContainer[key].meu.length==0){
					containerNode.isParent=true;
				}
				for(var m=0;m<allContainer[key].meu.length;m++){
					var childNode={};
					childNode.name=allContainer[key].meu[m].meuName;
					containerNode.children.push(childNode);
					postData.meus.push(allContainer[key].meu[m]);
				}
				containerNodes.push(containerNode);
				
				for(var key in postData){
					if(key=='meus'){
						if(postData.meus.length>0){
							postContainerData.push(postData);
						}
					}
				}
				
			}
			relContainerMeu=postContainerData;
			var treeObj=$.fn.zTree.getZTreeObj('treeContainer');
			$(document).ready(function(){
				$.fn.zTree.init($("#treeContainer"), setting,containerNodes);//设置权限节点树
			});
		}
		
	}
	
	function prevClick(){
		$('.steps li[role=tab]').addClass('disabled');
		finishStep=false;
		removeNext();
	}
	
	function removeOpre(oper, operClass, operDisable) {
		$('#wizard').find(".actions a[href=#" + oper + "]").parent('li').attr({
			"class": operClass,
			"aria-disabled": operDisable
		});
		$('#wizard').find(".actions a[href=#" + oper + "]").attr("href", 'javascript:;');
	}
	
	function addOpre(oper, operClass, operDisable) {
		addHref(oper);
		$('#wizard').find(".actions a[href=#" + oper + "]").parent('li').attr({
			"class": operClass,
			"aria-disabled": operDisable
		});
	}
	
	function finishClick(){
		if(finishStep){
			return false;
		}
		finishStep=true;
		var configData={
			id:appId,
			containers:relContainerMeu
		};
//		console.log(configData);
		configData=JSON.stringify(configData);
//		console.log(isReinstall);
		if(isReinstall){
			reinstallAjax=ajaxPutReauest('cloud/deployment/app',configData , function(data) {
				var datas = JSON.parse(data);
//				console.log(datas);
				if(datas.code == 0) {
					removeOpre("previous", "disabled", "true");
					removeOpre("finish", "disabled", "true");
					$('.actions a').css('cursor', 'text');
					$("#wizard .actions li").eq(0).children('a').off('click', prevClick);
					$("#wizard .actions li").eq(2).children('a').off('click', finishClick);
					$('.deploypageContent').hide();
					setTimeout(function(){
						$('#tips').css('right',-500);
					},5000);
					$('.totalpage').show(function() {
						var time = new Date().getTime();
						var ajaxTime = 5 * 60 * 1000;
						reInstailgetTimeTimer = setInterval(function() {//The number of timers used here is the cumulative time.
							var lastTime = new Date().getTime();
							if(lastTime - time >= ajaxTime) {
								clearOutTimer(geReinstalltProgressTimer);
								clearInterTimer(reInstailgetTimeTimer);
								swal("Error~", "Reinstall Failed" + " !", "error");
								return;
							}
						}, 5000)
						var getProgress = function() {
							reinstallProgressAjax=getResultGet('cloud/deployment/progress?appId=' + appId, function(data) {
								var data=JSON.parse(data);
//								console.log(data);
								if(data.code==0){
									var record = data.rows;
									var pro = record.progress;
									if(pro == 100) {
										swal("Good~", "Reinstall Success" + " !", "success");
										clearInterTimer(reInstailgetTimeTimer);
										clearOutTimer(geReinstalltProgressTimer);
									} else if(pro == -1) {
										swal("Error~",  "Reinstall Failed!", "error");
										clearInterTimer(reInstailgetTimeTimer);
										clearOutTimer(geReinstalltProgressTimer);
									} else {
										clearOutTimer(geReinstalltProgressTimer);
										geReinstalltProgressTimer=setTimeout(function() {//Enable the timer to progress the request, when the progress is not 100 or failed, please use the timer to execute a getProgress function
											getProgress();
										}, 2000)
									}
									var tableTd = '';
									if(record == '') {
										tableTd += '<tr><td colspan="2">No matching records found</td></tr>';
									} else {
										tableTd += '<tr><td>' + appId + '</td><td><div class="progress progress-striped"><div class="progress-bar progress-bar-success" style="width: ' + pro + '%"><span>' + pro + '%</span></div></div></td></tr>'+
										'<tr><td colspan="2"><textarea class="deployInfo"  style="background:#fff;">'+record.message+'</textarea></td></tr>';
									}
									$(".totaltable tbody").html(tableTd);
								}else{
//									isReinstall=false;
									swal("Error~", data.message+" !", "error");
								}
							})
						}
						getProgress();
	
					});
					
				} else {
					finishStep=false;
					swal("Error~", datas.message+" !", "error");
				}
			})
		}else{
			installAjax=getResultPost('cloud/deployment/app',configData , function(data) {
				var datas = JSON.parse(data);
				if(datas.code == 0) {
					removeOpre("previous", "disabled", "true");
					removeOpre("finish", "disabled", "true");
					$('.actions a').css('cursor', 'text');
					$("#wizard .actions li").eq(0).children('a').off('click', prevClick);
					$("#wizard .actions li").eq(2).children('a').off('click', finishClick);
					$('.deploypageContent').hide();
					setTimeout(function(){
						$('#tips').css('right',-500);
					},5000);
					$('.totalpage').show(function() {
						var time = new Date().getTime();
						var ajaxTime = 5 * 60 * 1000;
						installTimeTimer = setInterval(function() {//The number of timers used here is the cumulative time.
							var lastTime = new Date().getTime();
							if(lastTime - time >= ajaxTime) {
								clearOutTimer(installProgressTimer);
								clearInterTimer(installTimeTimer);
								swal("Error~", "Install Failed" + " !", "error");
								return;
							}
						}, 5000)
						var getProgress = function() {
							installProgressAjax=getResultGet('cloud/deployment/progress?appId=' + appId, function(data) {
								var data=JSON.parse(data);
								if(data.code==0){
									var record = data.rows;
									var pro = record.progress;
									if(pro == 100) {
										swal("Good~", "Install Success" + " !", "success");
										clearInterTimer(installTimeTimer);
										clearOutTimer(installProgressTimer);
									} else if(pro == -1) {
										swal("Error~",  "Install Faield !", "error");
										clearInterTimer(installTimeTimer);
										clearOutTimer(installProgressTimer);
									} else {
										clearOutTimer(installProgressTimer);
										installProgressTimer=setTimeout(function() {//Enable the timer to progress the request, when the progress is not 100 or failed, please use the timer to execute a getProgress function
											getProgress();
										}, 2000)
									}
									var tableTd = '';
									if(record == '') {
										tableTd += '<tr><td colspan="2">No matching records found</td></tr>';
									} else {
										tableTd += '<tr><td>' + appId + '</td><td><div class="progress progress-striped"><div class="progress-bar progress-bar-success" style="width: ' + pro + '%"><span>' + pro + '%</span></div></div></td></tr>'+
										'<tr><td colspan="2"><textarea class="deployInfo"  style="background:#fff;">'+record.message+'</textarea></td></tr>';
									}
									$(".totaltable tbody").html(tableTd);
									$('.deployInfo').scrollTop($('.deployInfo').get(0).scrollHeight);
								}else{
									swal("Error~", data.message+" !", "error");
								}
							})
						}
						getProgress();
	
					});
					
				} else {
					finishStep=false;
					swal("Error~", datas.message+" !", "error");
				}
			})
		}
	}

	
	
})

