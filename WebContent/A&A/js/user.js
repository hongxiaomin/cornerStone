$(function(){
	(function(){
		var columns = [{
			radio: true
		},
		{
			field: 'id',
			title: 'ID',
			visible:false
		},
		{
			field: 'name',
			title: 'Name',
		},
		{
			field: 'role',
			title: 'Role'
		}];
		
//		查询所有的用户新API
		var url = serverIP + 'users';

		var oTable = new TableInit();
		queryParams = function(params) {
			var offset=params.offset;
			var numbers=(offset/params.limit)+1;
			var temp = {
				pageSize: params.limit,
				pageNumber: numbers,
				userName:$('#txt_search_username').val().trim(),
				role:$('#txt_search_role').val().trim()
			};
			for(var key in temp){
				if(!temp[key]){
					delete(temp[key]);
				}
			}
			return temp;
		};
		
		oTable.Init(columns, url, queryParams);
		
		
		$("#btn_query").click(function() { //search and refresh				 
			$("#tb_table").bootstrapTable('refresh', {
				url: url
			});
		});
		
		//获取用户角色数据
		var roleUrl='roles';
		getResultGet(roleUrl,function(data){
			data=JSON.parse(data);
			var datas=data.rows;
			$('.role-list').empty();
			var liStr='';
			if(datas.length>0){
				$('.userIcon').show();
				for(var i=0;i<datas.length;i++){
					liStr+='<li>'+datas[i]+'</li>';
				}
				$('.role-list').html(liStr);
			}else{
				$('.userIcon').hide();
			}
			
		});
		
		$('#btn_add').click(function(){
			$('#creatUser input').val('');
			$('#creatUser p').addClass('hide');
		});
		
		var saveUserTest=false,
			createUserAjax=null;
			
		$('#saveUser').off('click').on('click',function(){
			if(!!saveUserTest){
				return false;
			}
			$(this).removeAttr('data-dismiss');
			var name=$('#creatUser input[name=username]').val().trim();
			var userpassword=$('#creatUser input[name=userpassword]').val();
			var reviewpassword=$('#creatUser input[name=reviewpassword]').val();
			var role=$('#creatUser input[name=userrole]').val();
			if(name==''){
				$('#creatUser .name-info').removeClass('hide');
			}
			if(userpassword==''){
				$('#creatUser .password-info').removeClass('hide');
			}
			if(reviewpassword==''||reviewpassword!=userpassword){
				$('#creatUser .review-password').removeClass('hide');
			}
			if(role==''){
				$('#creatUser .roleInfo').removeClass('hide');
			}
			
			if(!name||!userpassword||!reviewpassword||reviewpassword!=userpassword||!role){
				return false;
			}
			
//			新的验证用户是否存在的url
			var duplicateUrl='user/isexisting?username='+name;
			
//			新的创建用户的url
			var requestUrl='user';
				saveUserTest=true;
			getResultGet(duplicateUrl,function(data){
				data=JSON.parse(data);
				console.log(data);
				if(data.code==0){
					if(data.rows.result=="true"){
						console.log(data.message);
						$('.name-info').html(data.message).removeClass('hide');
						return;
					}else{
						console.log('未创建');
						//创建新的用户
						var requestBody={
							"username":name,
							"password":userpassword,
							"role":role
						};
						requestBody=JSON.stringify(requestBody);
						createUserAjax=getResultPost(requestUrl,requestBody,function(data){
							data=JSON.parse(data);
							console.log(data);
							if(data.code==0){
								$('#creatUser input').val('');
								$('#creatUser').modal('hide');
								swal("Good~", data.message + " !", "success");
								$('#tb_table').bootstrapTable('refresh');
								saveUserTest=false;
								createUserAjax=null;
							}else if(data.code==-1){
								swal("Error~", data.message + " !", "error");
								saveUserTest=false;
								createUserAjax=null;
							}
						});

					}
				}else if(data.code==-1){
					swal("Error~", data.rows.result + " !", "error");
					saveUserTest=false;
				}
			})
			
		});
		
		$('#cancelCreate').on('click',function(){
			if(!!createUserAjax){
				createUserAjax.abort();
			}
		});
		
		$('#btn_delete').on('click',function(){
			var rowData=$('#tb_table').bootstrapTable('getSelections')[0];
			console.log(rowData);
//			新的删除user的url
			var deleteUrl='user?userId='+rowData.id;
			deleteAjaxResult(deleteUrl,function(data){
				var data=JSON.parse(data);
				if(data.code==0){
					swal("Good~", data.message + " !", "success");
					$('#tb_table').bootstrapTable('refresh');
				}else{
					swal("Error~", data.message + " !", "error");
				}
			})
			
		});
		
		$('#btn_update').on('click',function(){
			$('#updateUser input').val('');
			$('#updateUser p').addClass('hide');
			var rowData=$('#tb_table').bootstrapTable('getSelections')[0];
			console.log(rowData);
			if(!!rowData){
				$(this).attr('data-target','#updateUser');
				$('#updateUser input[name=username]').val(rowData['name']).attr('dataId',rowData['id']);
				$('#updateUser input[name=userrole]').val(rowData['role']);
			}else{
				$(this).removeAttr('data-target');
				swal("Error~", "Not selected user !", "error");
			}
		});
		var updateUserTest=false,
			updateUserAjax=null;
		$('#saveUpdateUser').on('click',function(){
			if(!!updateUserTest){
				return false;
			}
			var oldPassword=$('#updateUser input[name=oldpassword]').val();
			var updatePassword=$('#updateUser input[name=userpassword]').val();
			var updateReviewPassword=$('#updateUser input[name=reviewpassword]').val();
			var role=$('#updateUser input[name=userrole]').val();
			if(!oldPassword){
				console.log(1);
				$('#updateUser .oldpassword').removeClass('hide');
			}
			if(!updatePassword){
				console.log(2);
				$('#updateUser .password-info').removeClass('hide');
			}
			if(!updateReviewPassword||updateReviewPassword!=updatePassword){
				$('#updateUser .review-password').removeClass('hide');
			}
			if(role==''){
				$('#updateUser .roleInfo').removeClass('hide');
			}
			if(!oldPassword||!updatePassword||!updateReviewPassword||updateReviewPassword!=updatePassword||!role){
				return false;
			}
			var name=$('#updateUser input[name=username]').val();
			//更新用户信息新url
			var userId=$('#updateUser input[name=username]').attr('dataId');
			var requestUrl='user';
			var requestParam={
				"userId":userId,
				"oldPassword":oldPassword,
				"newPassword":updatePassword,
				"role":role
			};
			console.log(requestParam);
			requestParam=JSON.stringify(requestParam);
			updateUserTest=true;
			updateUserAjax=ajaxPutReauest(requestUrl,requestParam,function(data){
				data=JSON.parse(data);
				console.log(data);
				if(data.code==0){
					console.log('success');
					$('#updateUser input').val('');
					$('#updateUser').modal('hide');
					swal("Good~", data.message + " !", "success");
					$('#tb_table').bootstrapTable('refresh');
					updateUserTest=false;
					updateUserAjax=null;
				}else{
					console.log('err');
					swal("Error~", data.message + " !", "error");
					updateUserTest=false;
					updateUserAjax=null;
				}
			})
			
		});
		
		$('#cancelUpdate').on('click',function(){
			if(!!updateUserAjax){
				updateUserAjax.abort();
			}
		});
		
		$('.close span').click(function(){
			if(!!updateUserAjax){
				updateUserAjax.abort();
			}
			if(!!createUserAjax){
				createUserAjax.abort();
			}
			
		});
		
		
		$('#creatUser input[name=username]').on('keyup',function(){
			var reg=/^[\w_]+$/;
			var name=$(this).val().trim();
			console.log(name);
			if(name!=''){
				if(reg.test(name)){
					$('#creatUser .name-info').addClass('hide');
				}else{
					$('#creatUser .name-info').html('app name is made up of numbers or letters or _ !').removeClass('hide');
				}
			}
		});
		
		
		$('#creatUser input[name=username]').on('blur',function(){
			var name=$(this).val().trim();
			if(!name){
				$('#creatUser .name-info').html('Please enter a valid Username').removeClass('hide');
			}
		});
		$('#creatUser input[name=userpassword]').on('blur',function(){
			if($(this).val()!=''){
				$('#creatUser .password-info').addClass('hide');
			}else{
				$('#creatUser .password-info').removeClass('hide');
			}
		});
		
		$('#creatUser input[name=reviewpassword]').on('blur',function(){
			if($(this).val()==$('#creatUser input[name=userpassword]').val()){
				$('#creatUser .review-password').addClass('hide');
			}else{
				$('#creatUser .review-password').removeClass('hide');
			}
		});
		
		$('#updateUser input[name=userpassword]').on('blur',function(){
			if($(this).val()!=''){
				$('#updateUser .password-info').addClass('hide');
			}else{
				$('#updateUser .password-info').removeClass('hide');
			}
		});
		
		$('#updateUser input[name=oldpassword]').on('blur',function(){
			if($(this).val()!=''){
				$('#updateUser .oldpassword').addClass('hide');
			}else{
				$('#updateUser .oldpassword').removeClass('hide');
			}
		});
		
		$('#updateUser input[name=reviewpassword]').on('blur',function(){
			if($(this).val()==$('#updateUser input[name=userpassword]').val()){
				$('#updateUser .review-password').addClass('hide');
			}else{
				$('#updateUser .review-password').removeClass('hide');
			}
		});
		
		$('.input-box').on('click',function(){
			$(this).children('.input-list').slideToggle(300);
			$(this).children('span').toggleClass('glyphicon-triangle-top');
		});
		
		$(document).off('click','.role-list li').on('click','.role-list li',function(){
			var text=$(this).html();
			$(this).parent().siblings('input').val(text);//选择目标用户与目标角色
			$(this).parents('.input-box').siblings('p').addClass('hide');
		});
		
		$('.children li').on('click',function(){
			console.log(createUserAjax);
			console.log(updateUserAjax);
			if(!!createUserAjax){
				createUserAjax.abort();
			}
			if(!!updateUserAjax){
				updateUserAjax.abort();
			}
		});
		
		$('.breadcrumb li').on('click',function(){
			if(!!createUserAjax){
				createUserAjax.abort();
			}
			if(!!updateUserAjax){
				updateUserAjax.abort();
			}
		});
		
		
		
	})();
	
})
