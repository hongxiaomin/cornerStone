$(function(){
	var permissionObj={
		"userUrl":'users?filterSelf=true',
		"userId":null,
		"parentId":null,
		"authorizationUrl":'authorization',
		"savePermission":{},
		"userAll":{},
		"nodesData":[],
		"clickNodeId":null,
		"addChildren":[],
	};
	//获取所有的用户
	
	function getAllUser(){
		$('#userlist').empty();
		$('.userIcon').hide();
			getResultGet(permissionObj.userUrl,function(data){
			data=JSON.parse(data);
			if(data.code==0){
				var datas=data.rows;
				if(datas.length>0){
					$('.userIcon').show();
					for(var i=0;i<datas.length;i++){
						permissionObj.userAll[datas[i]["name"]]=datas[i];
						var li=$('<li>'+datas[i]["name"]+'</li>');
						li.appendTo($('#userlist'));
					}
					console.log(permissionObj.userAll)
				}
			}
		});
	}
	getAllUser();

	
	//获取权限资源的第一级菜单
	$('.input-box').on('click',function(){
		$(this).children('#userlist').slideToggle(300);
		$(this).children('span').toggleClass('glyphicon-triangle-top');
	});
	
	
	$(document).off('click','#userlist li').on('click','#userlist li',function(){
		$('#opertionContent').html('');
		$('#opertionDiv').hide();
		var text=$(this).html();
		console.log(text)
		permissionObj.nodesData=[];
		permissionObj.savePermission={};
		$(this).parent().siblings('input').val(text);//选择目标用户与目标角色
		$(this).parents('.input-box').siblings('p').addClass('hide');
		permissionObj.userId=permissionObj.userAll[text].id;
		
		console.log(permissionObj.userId);
		var resourceUrl='resources?assignUserId='+permissionObj.userId;
		console.log(resourceUrl)
		getResultGet(resourceUrl,function(data){
			var data=JSON.parse(data);
			if(data.code==0){
				var datas=data.rows;
				console.log(datas);
				for(var i=0;i<datas.length;i++){
					var nodeData={};
					nodeData.id=datas[i].id;
					if(!datas[i].instanceName){
						nodeData.name=datas[i].resourceType;
					}else{
						nodeData.name=datas[i].resourceType+'-'+datas[i].instanceName;
					}
					nodeData.children=[
						{"name":'first node'}
					];
					nodeData.operations=datas[i].operations;
					nodeData.flag=false;
					permissionObj.nodesData.push(nodeData);
					permissionObj.savePermission[datas[i].id]=datas[i].operations;
				}
				console.log(permissionObj.savePermission);
				var treeObj=$.fn.zTree.getZTreeObj('treeNav');
				$(document).ready(function(){
					$.fn.zTree.init($("#treeNav"), setting, permissionObj.nodesData);//设置权限节点树
					$('#treeNav').show();
				});
			}
		})
		
	});

	
	function zTreeExpand(event,treeId,treeNode){
		var treeObj=$.fn.zTree.getZTreeObj('treeNav');
		permissionObj.parentId=treeNode.id;
		$('#opertionContent').html('');
		$('#opertionDiv').hide();
		if(treeNode.flag){
			return;
		}
		
		var resourceDetailUrl='resources?assignUserId='+permissionObj.userId+'&parentId='+permissionObj.parentId;
		console.log(resourceDetailUrl);
		getResultGet(resourceDetailUrl,function(data){
			treeObj.removeChildNodes(treeNode);
			var data=JSON.parse(data);
			if(data.code==0){
				var datas=data.rows;
				var childrenNodes=[];
				if(datas.length>0){
					for(var i=0;i<datas.length;i++){
						var childrenNode={};
						childrenNode.id=datas[i].id;
						if(!!datas[i].instanceName){
							childrenNode.name=datas[i].resourceType+'-'+datas[i].instanceName;
						}else{
							childrenNode.name=datas[i].resourceType;
						}
						childrenNode.children=[
							{"name":'first node'}
						];
						childrenNode.operations=datas[i].operations;
						childrenNodes.push(childrenNode);
						permissionObj.savePermission[datas[i].id]=datas[i].operations;
					}
					console.log(permissionObj.savePermission);
				}
				
				if(childrenNodes.length>0){
					treeObj.addNodes(treeNode,childrenNodes);
				}
			treeNode.flag=true;
			}
		})
	};
	
	function zTreeClick(event,treeId,treeNode){
		var id=treeNode.id;
		permissionObj.clickNodeId=treeNode.id;
		var currentOperations=[];
		currentOperations=permissionObj.savePermission[id];

		console.log(currentOperations);
		
		var htmlcode = '';
		for(var i=0;i<currentOperations.length;i++){
			var operationId=currentOperations[i].id;
			var checked=currentOperations[i].selected;
			if(checked){
				htmlcode+='<p><input type="checkbox" class="checkboxType" value="'+operationId+'" name="checkPermission" checked/>'+currentOperations[i].name+'</p>'
			}else{
				htmlcode+='<p><input type="checkbox" class="checkboxType" value="'+operationId+'" name="checkPermission" />'+currentOperations[i].name+'</p>'
			}
			
		}
		$("#opertionContent").html(htmlcode);
		$("#opertionDiv").show();
	};
	
	function zTreeOnCollapse(event,treeId,treeNode){
		$('#opertionContent').html('');
		$('#opertionDiv').hide();
	};
	
	var setting={//设置节点树的初始值
			data:{
				simpleData:{
					enable:true
				}
			},
			callback: {
				onExpand:zTreeExpand,
				onClick:zTreeClick,
				onCollapse:zTreeOnCollapse,
			}
		};
		
		var treeObj=$.fn.zTree.getZTreeObj('treeNav');
		$(document).ready(function(){
			$.fn.zTree.init($("#treeNav"), setting, permissionObj.nodesData);//设置权限节点树
		});
		
		
		$(document).on('click','.checkboxType',function(e){
			var nodeId=permissionObj.clickNodeId;
			var currentPermissions=permissionObj.savePermission[nodeId];
			var currentId=$(e.target).attr('value');
			console.log(currentPermissions)
			if(!!currentPermissions&&currentPermissions.length>0){
				for(var i=0;i<currentPermissions.length;i++){
					if(currentId==currentPermissions[i].id){
						currentPermissions[i].selected=!currentPermissions[i].selected;
					}
				}
			}
			
		});
		
		$('#permissionSure').on('click',function(){
			var name=$('.input-box input[name=username]').val();
			if(!name){
				$('.userInfo').removeClass('hide');
				return false;
			}
			
			$('#loadingbg').show();
			console.log(permissionObj.userId);
			
			var requestBody={
				"userId":permissionObj.userId,
				"mapping":[]
			};
			
			var currentSave=permissionObj.savePermission;
			console.log(currentSave);
			
			for(var key in currentSave){
				for(var i=0;i<currentSave[key].length;i++ ){
					if(currentSave[key][i].selected){
						var itemObj={};
						itemObj.resourceId=Number(key);
						itemObj.operationId=currentSave[key][i].id;
						requestBody.mapping.push(itemObj);
					}
					
				}
			}
			requestBody=JSON.stringify(requestBody)
			console.log(requestBody);
			
			
			getResultPost(permissionObj.authorizationUrl,requestBody,function(data){
				data=JSON.parse(data);
				console.log(data);
				if(data.code==0){
					permissionObj.userId=null;
					permissionObj.parentId=null;
					permissionObj.savePermission={};
					permissionObj.nodesData=[];
					permissionObj.clickNodeId=null;
					$('.input-box input').val('');
					$('#opertionContent').html('');
					$('#opertionDiv').hide();
					$('#loadingbg').hide();
					$('#treeNav').hide();
					swal("Good~", data.message + " !", "success");
				}else{
					$('#loadingbg').hide();
					swal("Error~", data.message + " !", "error");
				}
			});
			
		})
		
		$(document).on('click','#treeNav li',function(ev){
			ev.preventDefault();
			ev.stopPropagation();
			var h=$(this).offset().top;
			var w=$('#treeNav').width()+200;
			$('.permission-box-right').css({
				"left":w,
				"top":h/2-190
			})
		})
	
	
})
