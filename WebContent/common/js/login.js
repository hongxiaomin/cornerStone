$(function(){
	var pro=window.location.protocol,host=window.location.hostname;
	window.serverUrl='';
	window.serverUrl=window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
    window.serverIP=window.serverUrl+'/api/';
    
    
    function jumpToHome(){
		console.log('jumpToHome');
		var JSESSIONID=getCookie('JSESSIONID');
		var oldJSESSIONID=localStorage.getItem('JSESSIONID');
		if(JSESSIONID&&JSESSIONID==oldJSESSIONID){
			window.location.href="/main/html/home.html";
		}
	};

	jumpToHome();
    
    var remeberName=localStorage.getItem('username');
    console.log(remeberName);
    if(!!remeberName){
    	$('.user').val(remeberName);
    	$('#remeberName').get(0).checked=true;
    };
    
	$('.logining').on('click',function(){
		var userName=$('.user').val(),
			passWord=$('.password').val();
//		new user login url
		var url=serverIP+'user/login';
		var loginParam={
			"username":userName,
			"password":passWord
		};
		loginParam=JSON.stringify(loginParam)
		console.log(url);
		if(!!userName&&!!passWord){
			console.log($('#remeberName').get(0).checked);
			if($('#remeberName').get(0).checked){
				localStorage.setItem('username',userName);
			}else{
				localStorage.removeItem('username');
			}
			
			$.ajax({
				type:"post",
				url:url,
				data :loginParam,
				contentType:'raw',
				async:true,
				success:function(data){
					data=JSON.parse(data);
					if(data.code==0){
						var JSESSIONID=getCookie('JSESSIONID');
						localStorage.setItem('JSESSIONID',JSESSIONID);
						putStorage('href',"../../Cloud/html/meuMarket.html");
						putStorage('menu','CloudMeu');
						localStorage.setItem('user',userName);
						window.location.href="/main/html/home.html";
					}else{
						$('.message').html(datas.message).show();
					}
				},
				error:function(data){
					data=JSON.parse(data.responseText);
					console.log(data.message);
					$('.message').html('User not existed Or The user name and password do not match').show();
				}
			});
		}
	});	
	
	$(document).keyup(function(ev){
		if(ev.keyCode==13){
			$('.logining').trigger('click');
		}
	})
})
