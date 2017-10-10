$(function() {
	/*****wizard*****/
	$("#wizard").steps({
		headerTag: "h3",
		bodyTag: "section",
		transitionEffect: "slideLeft"
	});

	(function() {
		var point = 0,
			nextarray = [],
			fillArr = [],
			fileObj = {
				"fileName": '',
				"fileResult": ''
			},
			msg = "",
			name = $('.createlist-p .name').val(),
			descript = $('.createlist-p .descript').val(),
			nextObj = {
				'name': name,
				'descript': descript
			},
			appName='',
			finishStep=false;//判断finish动作是已执行
			appId = "";
			var getProgressTimer = null,
			getTimeTimer = null,
			configurationAjax=null,
			deployAjax=null,
			progressAjax=null,
			testRemoveNext=false;
		var allContainer={};
		var allMeus={};
		var hasContainerName=false;
		var selectContainerName=null;
		var relContainerMeu=null;
		var editName=null;
			
			
		//appList page update,jump this step 
		if(window.deployObj.appState){
			appId=window.deployObj.appId;
			nextObj.name=window.deployObj.appName;
			nextObj.descript=window.deployObj.appDescription;
			nextarray[0]=deepClone(nextObj);
			$('.createlist-p .name').val(nextObj.name);
			$('.createlist-p .descript').val(nextObj.descript);
			$("#wizard .actions a[href=#next]").one().trigger('click');
			point=1;
		}

		//remove nextOperation
		function removeNext() {
			$('#wizard').find(".actions a[href=#next]").attr("href", 'javascript:;');
		};

		//add nextOperation
		function addNext(callback) {
			var aLis = $("#wizard .actions a");
			for(var i = 0; i < aLis.length; i++) {
				if(aLis[i].innerHTML == "Next") {
					if($(aLis[i]).attr('href') !== '#next') {
						$(aLis[i]).attr('href', '#next');
						point++;
						$("#wizard .actions a[href=#next]").off('click', nextClick).click();
						if(typeof(callback) == 'function') {
							callback();
						}
						$("#wizard .actions li").eq(1).children('a').on('click', nextClick);
					}
					break;
				}
			}
//			console.log('addNext'+point);
			if(point == 2) {
				showMeu();
				showContainer();
			}
		};

		//control wizard operation
		function addHref(operHref) {
			var aLis = $("#wizard .actions a");
			for(var i = 0; i < aLis.length; i++) {
				if(aLis[i].innerHTML == operHref.substring(0, 1).toUpperCase() + operHref.substring(1)) {
					$(aLis[i]).attr('href', '#' + operHref + '');
					break;
				}
			}
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

		
		function postForm(){
			$('#uploadForm1').ajaxSubmit({
				type: "post",
				dataType: "text",
				url: serverIP + 'app/package',
				success: function(data) {
					var datas = JSON.parse(data);
					if(datas.code == 0) {
						getResultGet('app/configuration?appId=' + appId + '', function(data) {
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
							};
							$('#loadingbg').hide();
							addNext(removeNext);
							fillArr[0] = deepClone(fileObj);
							return;
						})
					}else{
						swal("Error~", datas.message + " !", "error");
					}
				},
				error: function(data) {
					var datas=JSON.parse(data.responseText);
					if(datas.code == -1) {
						$('#loadingbg').hide();
						swal("Error~", datas.message + " !", "error");
					}
				}
			})
		};
		
		function putForm(){
			$("#uploadForm1").ajaxSubmit({
				type: "put",
				dataType: "text",
				url: serverIP + 'app/package?appId=' + appId + '&app=' + fileObj.fileName + '',
				success: function(data) {
					var datas = JSON.parse(data);
					if(datas.code == 0) {
						getResultGet('app/configuration?appId=' + appId + '', function(data) {
							allMeus={};
							allContainer={};
							var datas=JSON.parse(data);
							if(datas.code==0){
								var meus=datas.rows.meus;
								var containers=datas.rows.containers;
								for(var i=0;i<meus.length;i++){
									allMeus[meus[i].meuId]=meus[i];
								}
								for(var j=0;j<containers.length;j++){
									allContainer[containers[j].containerName]=containers[j];
								}
								$('#loadingbg').hide();
								addNext(removeNext);
								fillArr[0] = deepClone(fileObj);
								return;
								
							}else{
								$('#loadingbg').hide();
								swal("Error~", datas.message + " !", "error");
							}
							
						})
					} else if(data.code == -1) {
						$('#loadingbg').hide();
						swal("Error~", datas.message + " !", "error");
					}
				},
				error: function(data) {
					var datas=JSON.parse(data.responseText);
					$('#loadingbg').hide();
					swal("Error~", datas.message + " !", "error");
				}
			})
		}

		//click next operation
		var firstStep=false;//判断第一步是否已走
		
		function nextClick() {
			$('.steps li[role=tab]').addClass('disabled');
			if(point == 0) {
				if(nextObj['name'] !== ''&&nextObj['name']!==null) {
					if(firstStep){
						return;
					}
					firstStep=true;
					if(nextarray.length == 0) {
						postResultpost('app?name=' + nextObj['name'] + '&description=' + nextObj['descript'] + '', function(data) {
							var datas = JSON.parse(data);
							if(datas.code == 0) {
								var bb = datas.rows.id;
								appId=bb;
								nextarray[0] = deepClone(nextObj);
								addNext(removeNext);
								return;
							} else {
								swal("Error~", datas.message, "error");
							}
						})
					} else {
						if(nextObj['name'] !== nextarray[0]['name'] || nextObj['descript'] !== nextarray[0]['descript']) {
							postResultPut('app?id=' + appId + '&name=' + nextObj['name'] + '&description=' + nextObj['descript'] + '', function(data) {
								var datas = JSON.parse(data);
								if(datas.code == 0) {
									nextarray[0] = deepClone(nextObj);
									addNext(removeNext);
									return;
								} else if(datas.code == -1) {
									swal("Error~", datas.message + " !", "error");
								}
							})
						} else {
							addNext(removeNext);
							return;
						}
					}
				} else if(nextObj['name'] === ''){
					$(".msg").html(" Name can't be empty.");
				}
			}

			if(point == 1) {
				if(!!fileObj.fileName) {
					$('#loadingbg').show();
					$("#uploadForm1 .appId").val(appId);
					if(fillArr.length == 0) {
						if(window.deployObj.appState){
							if(window.deployObj.appStatus=='Initialized'){
								postForm();
							}else{
								putForm();
							}
						}else{
							postForm();
						}
						
					} else {
						if(fileObj.fileName !== fillArr[0].fileName || fileObj.fileResult !== fillArr[0].fileResult) {
							putForm();
						} else {
							$('#loadingbg').hide();
							addNext(removeNext);
							return;
						}
					}
				} else {
					$(".msg").html(" No file to select.");
				}
			}

			if(point == 2) {
				var hasMeu=false;
				for(var key in allMeus){
					hasMeu=true;
				}
				if(!hasMeu){
					addNext();
				}
			}
			if(point == 3) {
				var setting={};
				var containerNodes=[];
				var postContainerData=[];
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

		};


		//click prev operation
		function prevClick() {
			$('.steps li[role=tab]').addClass('disabled');
			if(point == 3) {
				finishStep=false;
				abortAjax();
				point = 2;
				removeNext();
				return;
			} else if(point == 2) {
				point = 1;
				return;
			} else if(point == 1) {
				point = 0;
				firstStep=false;
				removeNext();
				$(".msg").html("");
				return;
			}
		};
		
		function abortAjax(){
			if(configurationAjax){
				configurationAjax.abort();
				if(deployAjax){
					deployAjax.abort();
					if(progressAjax){
						progressAjax.abort();
					}
				}
			}
		};

		//click finish operation
		
		function finishClick() {
			if(finishStep){
				return false;
			}
			finishStep=true;
			var configData={
				appId:appId,
				containers:relContainerMeu
			};
			configData=JSON.stringify(configData);
			configurationAjax=getResultPost('app/configuration',configData , function(data) {
				if(!data){
					return false;
				}
				var datas = JSON.parse(data);
				if(datas.code == 0) {
					deployAjax=postResultpost('deployment/app?appId=' + appId, function(data) {
						var datas = JSON.parse(data);
						if(datas.code == 0) {
							removeOpre("previous", "disabled", "true");
							removeOpre("finish", "disabled", "true");
							$('.actions a').css('cursor', 'text');
							$("#wizard .actions li").eq(0).children('a').off('click', prevClick);
							$("#wizard .actions li").eq(2).children('a').off('click', finishClick);
							$('.deploypageContent').hide();
							$('#tips').css('right',0);
							setTimeout(function(){
								$('#tips').css('right',-500);
							},5000);
							$('.totalpage').show(function() {
								var time = new Date().getTime();
								var ajaxTime = 5 * 60 * 1000;
								
								getTimeTimer = setInterval(function() {//The number of timers used here is the cumulative time.
									var lastTime = new Date().getTime();
									if(lastTime - time >= ajaxTime) {
										clearOutTimer(getProgressTimer);
										clearInterTimer(getTimeTimer);
										swal("Error~", "Deploy Failed" + " !", "error");
										return;
									}
								}, 5000)
								var getProgress = function() {
									progressAjax=getResultGet('deployment/progress?appId=' + appId, function(data) {
										var data=JSON.parse(data);
										if(data.code==0){
											var record = data.rows;
											var pro = record.progress;
											if(pro == 100) {
												swal("Good~", "Deploy Success" + " !", "success");
												clearInterTimer(getTimeTimer);
												clearOutTimer(getProgressTimer);
											} else if(pro == -1) {
												swal("Error~", "Deploy Failed !", "error");
												clearInterTimer(getTimeTimer);
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
							swal("Error~", datas.message+" !", "error");
						}
					})
				} else {
					finishStep=false;
					swal("Error~", datas.message+" !", "error");
				}
			})
		};
		
		function clearTimer(){
			clearInterTimer(getTimeTimer);
			clearOutTimer(getProgressTimer);
		};
		
		function initDeploy(){
			window.deployObj.appState=0;
			window.deployObj.appName='';
			window.deployObj.appId='';
			window.deployObj.appDescription='';
		};
		
		//click every page clear Timer
		$('.nav-parent').on('click',function(){
			clearTimer();
			abortAjax();
			initDeploy();
		});
		$('.children li').on('click',function(){
			clearTimer();
			abortAjax();
			initDeploy();
		});
		$('.breadcrumb li').on('click',function(){
			clearTimer();
			abortAjax();
			initDeploy();
		});
		
		removeNext();
		
		
		$('.createlist-p input').keyup(function() {
			var reg=/^[\w_]+$/;
			name = $('.createlist-p .name').val().trim();
			descript = $('.createlist-p .descript').val().trim();
			if(!!name){
				if(reg.test(name)){
					nextObj['name'] = name;
					nextObj['descript'] = descript;
					$(".msg").html("");
				}else{
					nextObj['name'] = null;
					nextObj['descript'] = descript;
					$(".msg").html('app name is made up of numbers or letters or _ !');
					return false;
				}
			}else{
				nextObj['name'] =name ;
				nextObj['descript'] = descript;
			}
		});

		$('#uploadForm').click(function(){
			$(this).val('');
		});

		$('#uploadForm').change(function() {
			var file = this.files[0];
			if(!!file){
				var name = file.name;
				var lastDate=file.lastModified;
				fileObj.fileName = hex_md5(name);
				fileObj.fileResult=lastDate;
				if(name !== '') {
					$(".msg").html("");
					$('#browseText').val(name);
				}
			}else{
				fileObj.fileName='';
				fileObj.fileResult=0;
				$('#browseText').val('');
				return;
			}
		});
		
		$(document).on('click','.mapp-div tbody select',function(){
			$(this).css('background','#eee');
		})

		$("#wizard .actions li").eq(1).children('a').on('click', nextClick);

		$('#wizard ul a[href=#previous]').on('click', prevClick);

		$('#wizard ul a[href=#finish]').on('click', finishClick) /**finish click end**/

		
		//click page header nav
		$('#apps-lists').on('click', function(){
			initDeploy();
			loadPage('Apps',"../../Remote/html/lists.html")
			});
			
		
		$(document).on('click','#meuListAll li',function(){
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
		
		
		$('.allcheck1').click(function(){
			checkAll.call(this,$('#meuListAll input'),$('.transfer-operation .right'));
		})
		
		$('.allcheck2').click(function(){
			checkAll.call(this,$('#MeuDetail input'),$('.transfer-operation .left'));
		})
		
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
			$(this).attr('data-dismiss','modal').trigger('click');
			$('.transfer-operation').hide();
			selectContainerName=null;
			editName=null;
			$('#editContainer').hide();
			showContainer();
			showMeu();
		});
		
		$('#cancelContainer').click(function(){
			editName=null;
			$('#creatContainer input').val('');
			$('#creatContainer input[name=retryCount]').val(5);
			$('#creatContainer input[name=waitTime]').val(30)
		})
			
		$('.close').click(function(){
			editName=null;
			$('#creatContainer input').val('');
			$('#creatContainer input[name=retryCount]').val(5);
			$('#creatContainer input[name=waitTime]').val(30)
		})
		
		$('.transfer-select').on('click',function(){
			$('.transfer-select span').toggleClass('glyphicon-triangle-top');
			$('.container_list').slideToggle();
		});
		
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
			
		})
		
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
		
		
		
	})();
	
	

})