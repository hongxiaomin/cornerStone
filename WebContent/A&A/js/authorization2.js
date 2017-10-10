$(function(){
	(function(){
		var userUrl ='user/all',roleUrl='',resourceUrl='resource/all',operationUrl='operation/all',permissionUrl='permission/all';
		console.log(userUrl);
		var userObj={};//user data
		var roleObj={};//role data
		var permissionObj={};//授予权限 data
		var resourceId=null;
		var res2opeMap=[];
		getResultGet(userUrl,function(data){//获取当前登录用户名下的用户
			$('#userlist').empty();
			data=JSON.parse(data);
			userObj={};
			if(data.code==0){
				var datas=data.rows;
				if(datas.length==0){
					$('.userIcon').hide();
				}else{
					$('.userIcon').show();
					for(var i=0;i<datas.length;i++){
						userObj[datas[i]["name"]]=datas[i];
						var li=$('<li>'+datas[i]["name"]+'</li>');
						li.appendTo($('#userlist'));
					}
				}
			}
		});
		
		//假role data
		var roleData={
				  "code": 0,
				  "message": "role’s permission",
				  "returnTotal": 2,
				  "rows":[{
							"id": 1,
							"role": "superadmin",
							"permissions": [
												{
													"resource": "app1",
													"operation": "update"
												},{
													"resource": "app1",
													"operation": "delete"
												}, {
													"resource": "app1",
													"operation": "view"
												}, {
													"resource": "app1",
													"operation": "create"
												}
											] 
						},{
							"id": 2,
							"role": "appadmin",
							"permissions": [
												{
													"resource": "app1",
													"operation": "update"
												},{
													"resource": "app1",
													"operation": "delete"
												}, 
												{
													"resource": "app1",
													"operation": "view"
												},
												{
													"resource": "app1",
													"operation": "create"
												}
											] 
					  },{
							"id": 3,
							"role": "appuser",
							"permissions": [
												{
													"resource": "app1",
													"operation": "update"
												},{
													"resource": "app1",
													"operation": "delete"
												}, 
												{
													"resource": "app1",
													"operation": "view"
												},
												{
													"resource": "app1",
													"operation": "create"
												}
											] 
					  }]
				};

		
//		getResultGet(roleUrl,function(data){//获取角色数据
//			data=JSON.parse(data);
//			console.log(data);
			data=roleData;
//			console.log(data);
			if(data.code==0){
				var datas=data.rows;
//				console.log(datas);
				roleObj={};
				$('#rolelist').empty();
				if(datas.length==0){
					$('.roleIcon').hide();
				}else{
					$('.roleIcon').show();
					for(var j=0;j<datas.length;j++){
						
						roleObj[datas[j]["role"]]=datas[j];
						var li=$('<li>'+datas[j]["role"]+'</li>');
						li.appendTo($('#rolelist'));
					}
				}
				
			}
			
//		})
		
		function zTreeOnClick(event,treeId,treeNode){
			resourceId = treeNode.id;
			var treeObj=$.fn.zTree.getZTreeObj('treeNav');
			var nodes=treeObj.getNodes();
			function gettarget(nodes,boolean){//获取目标节点的方法
				for(var m=0;m<nodes.length;m++){
					if(nodes[m].id==resourceId){
						treeObj.checkNode(nodes[m],boolean,true);
						continue;
					}
					if("children" in nodes[m]){
						gettarget(nodes[m].children,boolean);
					}
					
				}
			};
			gettarget(nodes,true);
			
			var checkedPermissions=[];
			if(!permissionObj[resourceId]){
				permissionObj[resourceId]=[];
			}else{
				checkedPermissions=permissionObj[resourceId];
			}
			$("input[name = 'checkPermission']").attr("checked",false);//全选
			$("#opertionDiv").show();
			console.log(checkedPermissions);
			if(checkedPermissions.length>0){
				for(var i=0;i<checkedPermissions.length;i++){
					for(var j=0;j<$("input[name = 'checkPermission']").length;j++){
						if(checkedPermissions[i]==$("input[name = 'checkPermission']").eq(j).attr('value')){
							$("input[name = 'checkPermission']").eq(j).get(0).checked=true;
						}
					}
				}
			}
			
		}
		
		function zTreeOnCheck(event, treeId, treeNode) {
			console.log(treeNode);
			resourceId = treeNode.id;
			var checked=treeNode.checked;
			var checkedPermissions=[];
//			arrTemp = [];
			if(checked){
				if(!permissionObj[resourceId]){
					console.log(resourceId)
					permissionObj[resourceId]=[];
				}else{
					checkedPermissions=permissionObj[resourceId];
				}
				$("input[name = 'checkPermission']").attr("checked",false);//全选
				$("#opertionDiv").show();
				console.log(permissionObj);
				return;
			}else{
				delete(permissionObj[resourceId]);
				$("input[name = 'checkPermission']").attr("checked",false);//全选
				$("#opertionDiv").hide();
				console.log(permissionObj);
				return;
			}
			
			
		};
		
		var setting={//设置节点树的初始值
			check:{
				enable:true,
				chkboxType: { "Y": "p", "N": "s" }
			},
			data:{
				simpleData:{
					enable:true
				}
			},
			callback: {
				onClick: zTreeOnClick,
				onCheck:zTreeOnCheck
				
			}
		};
		
//		console.log(nodesData);
	var nodesData=[];//节点树的节点集合
		getResultGet(resourceUrl,function(data){
			data=JSON.parse(data);
			if(data.code==0){
				var nodesData=[];
				var datas=data.rows;
				for(var i=0;i<datas.length;i++){
					var nodeObj={};
					nodeObj.id=datas[i].id;
					if(datas[i].id==1){
						nodeObj.open=true;
					}
					nodeObj.pId=datas[i].parentId;
					if(!datas[i].instanceName){
						nodeObj.name=datas[i].resourceType;
					}else{
						nodeObj.name=datas[i].resourceType+'-'+datas[i].instanceName;
					}
					nodesData.push(nodeObj);
				}
				var zNodes=nodesData;
				$(document).ready(function(){
					$.fn.zTree.init($("#treeNav"), setting, zNodes);//设置权限节点树
				});
			}
		});
		
		
		getResultGet(operationUrl,function(data){
			operationData = JSON.parse(data).rows;
			var len = operationData.length;
			var htmlcode = '';
			for (var i=0;i<len;i++) {
				var operationId = operationData[i].id;
				
				htmlcode += '<p><input type="checkbox" class="checkboxType" value="'+operationId+'" name="checkPermission" />'+operationData[i].name+'</p>' ;
			}
			$("#opertionContent").html(htmlcode);
		});
		
		$(".checkboxType").on('click',function(e){
			var tempArr=permissionObj[resourceId];
			var id = $(e.target).attr('value');
			var status = $.inArray(id, tempArr);
			console.log(status);
			if(status==-1){
				tempArr.push(id);
			}else{
				tempArr.splice(status,1);
			}
			console.log(tempArr);
			console.log(permissionObj);
		})
		
		$('#permissionSure').on('click',function(){
			var name=$('.input-box input[name=username]').val();
			if(!name){
				$('.userInfo').removeClass('hide');
			}
			
			var role=$('.input-box input[name=role]').val();
			if(!role){
				$('.roleInfo').removeClass('hide');
			}
			if(!name||!role){
				return false;
			}
			var userId=userObj[name].id;//目标用户的id
			var roleId=roleObj[role].id;
			
			console.log(permissionObj);
			
			var requstBody={
				"userId":userId,
				"roleId":roleId,
				"mapping":[]
			};
			for(var key in permissionObj){
				for(var i=0;i<permissionObj[key].length;i++){
					var itemObj={};
					itemObj.resourceId=key;
					itemObj.operationId=permissionObj[key][i];
					requstBody.mapping.push(itemObj);
				}
			}
			console.log(JSON.stringify(requstBody));
			requstBody=JSON.stringify(requstBody);
			
			var saveperUrl='permission/authorization';
			getResultPost(saveperUrl,requstBody,function(data){
				data=JSON.parse(data);
				console.log(data);
				if(data.code==0){
					swal("Good~", data.message + " !", "success");
					permissionObj={};
					$('.input-box input').val('');
					$("input[name = 'checkPermission']").attr("checked",false);//全选
					var treeObj=$.fn.zTree.getZTreeObj('treeNav');
					var nodes=treeObj.getNodes();//获取节点树的所有节点
					function setCheckNode(nodes){//获取目标节点的方法
						for(var m=0;m<nodes.length;m++){
							treeObj.checkNode(nodes[m],false,true);
							if("children" in nodes[m]){
								setCheckNode(nodes[m].children);
							}
						}
					};
					setCheckNode(nodes);
					$('#opertionDiv').hide();
				}else{
					swal("Error~", data.message + " !", "error");
					permissionObj={};
				}
			});
		})
		
		
		$('.input-box').on('click',function(){
			$(this).children('.input-list').slideToggle(300);
			$(this).children('span').toggleClass('glyphicon-triangle-top');
		});
		
		$(document).on('click','.input-list li',function(){
			var text=$(this).html();
			$(this).parent().siblings('input').val(text);//选择目标用户与目标角色
			$(this).parents('.input-box').siblings('p').addClass('hide');
		});
		
		
//		$(document).on('click','#rolelist li',function(){
//			var text=$(this).html();
//			var rolePermissions=roleObj[text].permissions;//获取到目标角色的所有权限
//			
//			for(var i=0;i<nodesData.length;i++){
//				var test=false;//定义一个变量，判断该角色是否具有某个权限
//				for(var j=0;j<rolePermissions.length;j++){
//					var roleName=rolePermissions[j].resource+'-'+rolePermissions[j].operation;
//					if(roleName==nodesData[i].name){
//						test=true;//具有权限的情况下，值为true，否则为false
//					}
//				}
//				
//				var treeObj=$.fn.zTree.getZTreeObj('treeNav');
//				var nodes=treeObj.getNodes();//获取节点树的所有节点
//				var nodeId=nodesData[i].id;//角色不允许的权限id
//				
//				function gettarget(nodes,boolean){//获取目标节点的方法
//					for(var m=0;m<nodes.length;m++){
//						if(nodes[m].id==nodeId){
////							treeObj.setChkDisabled(nodes[m],boolean);
//							continue;
//						}
//						if("children" in nodes[m]){
////							console.log(nodes[m].children)
//							gettarget(nodes[m].children,boolean);
//						}
//						
//					}
//				};
//				
//				if(!test){
//					gettarget(nodes,true);
//				}else{
//					gettarget(nodes,false);
//				}
//			}
//		});
		
//		$(document).on('click','#userlist li',function(){
//			var name=$(this).html();
////			console.log(name);
//			var userPerUrl='permission?username='+name+'';
//			getResultGet(userPerUrl,function(data){
////				console.log(data);
//				if(data.code==0){
//					var datas=data.rows;
//					if(datas.length==0){
//						return ;
//					}else{
//						for(var i=0;i<nodesData.length;i++){
//							var test=false;
//							for(var j=0;j<datas.length;j++){
//								if(nodesData[i].name==(datas[j].resource+'-'+datas[j].operation)){
//									test=true;
//								}
//							}
//							var treeObj=$.fn.zTree.getZTreeObj('treeNav');
//							var nodes=treeObj.getNodes();//获取节点树的所有节点
//							var nodeId=nodesData[i].id;//角色不允许的权限id
//							
//							function gettarget(nodes,boolean){//获取目标节点的方法
//								for(var m=0;m<nodes.length;m++){
//									if(nodes[m].id==nodeId){
//										treeObj.checkNode(nodes[m],boolean,true);
//										continue;
//									}
//									if("children" in nodes[m]){
////										console.log(nodes[m].children)
//										gettarget(nodes[m].children,boolean);
//									}
//									
//								}
//							};
//							
//							if(!test){
//								gettarget(nodes,false);
//							}else{
//								gettarget(nodes,true);
//							}
//							
//						}
//						
//					}
//				}
//			})
//			
//		})
		
	})();
})
