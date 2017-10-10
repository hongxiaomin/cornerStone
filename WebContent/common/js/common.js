$(function(){
	$('.newPassword').blur(function(){
		$(this).parent().siblings('.warnMsg').html('').hide();
		var newPasswordValue=$('.newPassword').val();
		if(newPasswordValue.length>=6&&newPasswordValue.length<=15){
			var str = isLetterAndNum(newPasswordValue);
			if(!str){
				$(this).parent().siblings('.warnMsg').show().html('new password for 6-15 combinations of Numbers and letters!')
				this.focus();
			};
		}else{
			$(this).parent().siblings('.warnMsg').show().html('new password for 6-15 combinations of Numbers and letters！')
			this.focus();
		};
	})
	$('.surePassword').blur(function(){
		$(this).parent().siblings('.warnMsg').html('').hide();
		var newPasswordValue=$('.surePassword').val();
		if(newPasswordValue.length>=6&&newPasswordValue.length<=15){
			var str = isLetterAndNum(newPasswordValue);
			if(!str){
				$(this).parent().siblings('.warnMsg').show().html('Confirm password for 6-15 combinations of Numbers and letters!')
				this.focus();
			};
		}else{
			$(this).parent().siblings('.warnMsg').show().html('Confirm password for 6-15 combinations of Numbers and letters！')
			this.focus();
		};
	})
	$('.save').click(function(){
		$('.updatePassword .warnMsg').hide();
		var pass = checkFormNull('.updatePassword .password-modal');
		if(pass){
			var beginPsw = $('.updatePassword p:eq(0) input').val(),
				newPsw = $('.updatePassword p:eq(1) input').val(),
				surePsw = $('.updatePassword p:eq(2) input').val();	
			if(newPsw === surePsw){
				var name=getStorage("userName");
				var url=serverIP+'user?oldpassword='+beginPsw+'&password='+newPsw+'&name='+name+'';
				updateTable(url);
			}else{
				$('.updatePassword .warnMsg').html('Please send the new password and confirm password').show();			
			}
		}
	})
	$(document).on("click",".show-label",function(){
		var title = $('.show-label label').html();
		if(title == "hide-option"){
			$('.selecter').slideUp("slow");
			$('.show-label label').html("show-option");
			$('.show-label span').attr('class','glyphicon glyphicon-chevron-down');
		}else{
			$('.selecter').slideDown("slow");
			$('.show-label label').html("hide-option");
			$('.show-label span').attr('class','glyphicon glyphicon-chevron-up');
		}
	})
})
function isLetterAndNum(str){ //num and letter
    var reg=/^[A-Za-z0-9]*$/;
    return reg.test(str); 
}
function checkFormNull(className) { //Validation is not empty
	pass = true;
	$(className).find("label:contains('*')").next('input[type=password]').each(function(){
		if($(this).val() == '') {
			text = $(this).prev().text()+"is Required~";
			this.focus();
			$(className).find('.warnMsg').show().html(text);
			pass = false;
			return false;//jump each
		};
	});
	return pass;
}

//存储cookies
var putStorage = function(key, value) {
	window.sessionStorage.setItem(key, value);
}
var getStorage = function(key) {
	return window.sessionStorage.getItem(key);
}

var removeStorage=function(key){
	window.sessionStorage.removeItem(key);
}

//setCookie
function setCookie(name,value){
	var Days=30;
	var exp=new Date();
	exp.setTime(exp.getTime()+Days*24*60*60*1000);
	document.cookie=name+'='+escape(value)+';expires='+exp.toGMTString();
}

//getCookie
function getCookie(name){
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg)){
		return unescape(arr[2]);
	}else{
		return null;
	}
}

//delete cookie
function delCookie(name){
	var exp=new Date();
	exp.setTime(exp.getTime()-1);
	var cval=getCookie(name);
	if(cval!=null){
		document.cookie=name + "="+cval+";expires="+exp.toGMTString();
	}
}


