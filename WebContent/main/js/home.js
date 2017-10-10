console.log(getCookie('JSESSIONID'));

var flag=true;

function jumpToLogin(){
	var JSESSIONID=getCookie('JSESSIONID');
	var oldJSESSIONID=localStorage.getItem('JSESSIONID');
	if(!JSESSIONID||JSESSIONID!=oldJSESSIONID){
		window.location.href=window.serverUrl+'/login.html';
	}
};

jumpToLogin();

$(function(){
	$('.children').hide();
	
	var userName=localStorage.getItem('user');
	$('#user').get(0).innerHTML=userName;
	
	$('.second-nav').click(function(){
		$(this).addClass('Active-nav').siblings().removeClass('Active-nav');
	})
	$(document).on("click",".Active-nav",function(){
		var title = $(this).children().children().eq(1).attr("class");
		if(title == "pull-right glyphicon glyphicon-plus"){
			$(this).next().slideDown(500);
			$(this).children().children().eq(1).attr('class','pull-right glyphicon glyphicon-minus');
		}else{
			$(this).next().slideUp(500);
			$(this).children().children().eq(1).attr('class','pull-right glyphicon glyphicon-plus');
		}
	})
	if(!sessionStorage.getItem('href')){
		putStorage('href',"../../Cloud/html/meuMarket.html");
		putStorage("menu","CloudMeu");
	}
	//Refresh after a page refresh before remains in the current page
	$('#rightPanel').load(sessionStorage.getItem('href'));
	var currentClass=getStorage('menu');
	menuActive($('.'+currentClass));
	
	$('.currentUserInfo').hover(function(){
		$('.userInfo').show();
	},function(){
		$('.userInfo').hide();
	})	
	
	
	//user logOut
	$('#loginout').click(function(){
		var url="user/logout";
		postResultpost(url,function(data){
			data=JSON.parse(data);
			if(data.code==0){
				localStorage.removeItem('JSESSIONID')
				window.location.href=window.serverUrl+'/login.html';
			}else{
				swal("Error~", data.message + " !", "error");
			}
		});
	});
	
	$('#navParent li').click(function(){
		var self=this;
		console.log(flag);
		if(flag){
			showContent.call(self);
		}else{
			return;
		}
	});
}) 


function showContent(){
	if($(this).hasClass('menuContainer')){
		showRight('container');
	}else if($(this).hasClass('menuEPG')){
		showRight('EpgLists');
	}else if($(this).hasClass('menuER')){
		showRight('EpgRecord');
	}else if($(this).hasClass('menuMEU')){
		showRight('meu');
	}else if($(this).hasClass('menuEvent')){
		showRight('event');
	}else if($(this).hasClass('menuUser')){
		showRight('user');
	}else if($(this).hasClass('menuNodes')){
		showRight('nodes');
	}else if($(this).hasClass('menulist')){
		showRight('apps');
	}else if($(this).hasClass('menuDeploy')){
		showRight('deploy');
	}else if($(this).hasClass('menuPermisssion')){
		showRight('permission');
	}else if($(this).hasClass('CloudMeu')){
		showRight('CloudMeu');
	}else if($(this).hasClass('CloudEpg')){
		showRight('CloudEpg');
	}else if($(this).hasClass('CloudApp')){
		showRight('CloudApp');
	}
	if($(this).hasClass('nav-parent')){
		$(this).addClass('homeActive').siblings().removeClass('homeActive');
		$(this).siblings('ul').children().removeClass('homeActive');
		$(this).next('ul').children().eq(0).addClass('homeActive');
	}else{
		$(this).addClass('homeActive').siblings().removeClass('homeActive').parent().prev().addClass('homeActive');
		$(this).parent().siblings('ul').children().removeClass('homeActive');
		$(this).parent().prev().siblings().removeClass('homeActive');
		$(this).parent().prev().addClass('homeActive');
	}
	
}

function showRight(id){
	if(id=="container"){
		putStorage('href',"../../Container/html/Container.html");
		putStorage("menu","menuContainer");
	}else if(id=="EpgLists"){
		putStorage('href',"../../Epg/html/Epg.html");
		putStorage("menu","menuEPG");
	}else if(id=="EpgRecord"){
		putStorage('href',"../../Epg/html/ExecutionRecord.html");
		putStorage("menu","menuER");
	}else if(id=="meu"){
		putStorage('href',"../../MEU/html/MEU.html");
		putStorage("menu","menuMEU");
	}else if(id=="event"){
		putStorage('href',"../../Event/html/Event.html");
		putStorage("menu","menuEvent");
	}else if(id=="user"){
		putStorage('href',"../../A&A/html/user.html");
		putStorage("menu","menuUser");
	}else if(id=="nodes"){
		putStorage('href',"../../Remote/html/nodes.html");
		putStorage("menu","menuNodes");
	}else if(id=="deploy"){
		putStorage('href',"../../Remote/html/Deploy.html");
		putStorage("menu","menuDeploy");
	}else if(id=="apps"){
		putStorage('href',"../../Remote/html/lists.html");
		putStorage("menu","menulist");
	}else if(id=="permission"){
		putStorage('href',"../../A&A/html/authorization.html");
		putStorage("menu","menuPermisssion");
	}else if(id=="CloudMeu"){
		putStorage('href',"../../Cloud/html/meuMarket.html");
		putStorage("menu","CloudMeu");
	}else if(id=="CloudEpg"){
		putStorage('href',"../../Cloud/html/epg.html");
		putStorage("menu","CloudEpg");
	}else if(id=="CloudApp"){
		putStorage('href',"../../Cloud/html/app.html");
		putStorage("menu","CloudApp");
	}
	
	$('#rightPanel').load(getStorage('href'));
}

