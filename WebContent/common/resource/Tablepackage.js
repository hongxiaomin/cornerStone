$(function(){
	$('.Close').click(function(event){
		handleCancelClick();			
	})
})
var pro=window.location.protocol,host=window.location.hostname;
window.serverUrl='';
window.deployObj={
	"appName":'',
	"appId":'',
	"appDescription":'',
	"appState":0,
	"appStatus":'',
}

window.serverUrl=window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
window.serverIP=window.serverUrl+'/api/';
console.log(window.serverIP);
var TableInit = function () {
	var oTableInit = new Object();
	oTableInit.Init = function (columns,url,queryParams,sortName,ele,order) {
		var $table=ele||$('#tb_table');
  		$table.bootstrapTable({
	   		url:url,
	   		method: 'get',
	   		toolbar: '#toolbar',
		    striped: true,
		    cache: false,
		    pagination: true,
		    sortable: true,
		    sortOrder: order||"asc",
		    sortName:sortName,
		    queryParams: queryParams,
		    sidePagination: "server",
		    pageNumber:1,
		    pageSize: 10, 
		    pageList: [5,10, 25, 50, 100],
		    search: false,
		    strictSearch: true,
		    showColumns: true,
		    showRefresh: true,
		    minimumCountColumns: 1,
		    clickToSelect: true,
//		    height: 600,
		    uniqueId: "ID",
		    showToggle:false,
		    cardView: false,
		    detailView: false,
		    columns:columns,
			onLoadSuccess: function (){ 
				var tableHeight=$('#tb_table').height();
				if(tableHeight>500){
					$('.fixed-table-container').height(450);
				}else if(tableHeight<200){
					$('.fixed-table-container').height(380);
				}
	        	$("#searchBtn").button('reset'); 
	  		},
	  		onLoadError:function(status,res){
	  			console.log(res);
	  			console.log(status);
	  			if(status==401){
	  				if(JSON.parse(res.responseText).code==4003||JSON.parse(res.responseText).code==4001){
	  					window.location.href=window.serverUrl+'/login.html';
	  				}
	  			}
	  		}
	  	
  		});
	};
	return oTableInit;
}; 
var ButtonInit = function () {
	var oInit = new Object();
	var postdata = {};
	oInit.Init = function () {};
	return oInit;
};
var deleteTable=function(url,func){
	var ajaxObj=null;
	ajaxObj=$.ajax({
		type:"delete",
		url:url,
		async:true,
		success:function(data){
			var datas=JSON.parse(data),
				messages=datas.message;
			if(datas.code==0){
				if(func&&typeof(func)=='function'){
					if(messages.indexOf("Add task success")>=0){
						func();
					}else{
						swal("Good~", "Remove Success" + " !", "success");
						$("#tb_table").bootstrapTable('refresh');
					}
				}else{					
					swal("Good~", "Delete Success" + " !", "success");
					$("#tb_table").bootstrapTable('refresh');
				}
			}else if(datas.code==-1){
				swal("Wrong!", JSON.parse(data).message +" !", "error")
			}
			
		},
		error:function(data){
			data=JSON.parse(data.responseText);
			swal("Wrong!", data.message +" !", "error")
		}
	});
	return ajaxObj;
}; 
var addTable=function(url){
	$.ajax({
		type:"post",
		url:url,
		async:true,
		dataType:'text',
//		data:postMessage,
		success:function(data){
			$('.modal').hide();
			$('.modal-backdrop.in').hide();
			$("#tb_table").bootstrapTable('refresh');
			swal("Good job!",JSON.parse(data).message +" !", "success")
			$('.modal-body input').val('');
		},
		error:function(data){
			swal("Wrong!", JSON.parse(data).message +" !", "error")
		}
	});
}
var updateTable=function(url){
	$.ajax({
		type:"put",
		url:url,
		async:true,
		dataType:'text',
//		data:postMessage,
		success:function(data){
			$('.modal').hide();
			$('.modal-backdrop.in').hide();
			$("#tb_table").bootstrapTable('refresh');
			swal("Good job!",JSON.parse(data).message +" !", "success")
			$('.modal-body input').val('');
		},
		error:function(data){
			swal("Wrong!", JSON.parse(data).message +" !", "error")
		}
	});
}
function handleCancelClick(){
	$('.modal-body input').val('');
}

//Test data type
function isClass(obj) {
	if(obj === null) {
		return 'Null';
	} else if(obj === 'undefined') {
		return 'Undefined';
	}
	return Object.prototype.toString.call(obj).slice(8, -1);
};

//object clone	
function deepClone(obj) {
	if(typeof(obj) !== 'object' || obj === null) {
		return obj;
	}
	var newObj = {};
	if(isClass(obj) === 'Object') {
		newObj = {};
	} else if(isClass(obj) === 'Array') {
		newObj = [];
	}
	for(var key in obj) {
		newObj[key] = deepClone(obj[key]);
	}
	return newObj;
};

//clearTimeout Timer
function clearInterTimer(timer){
	clearInterval(timer);
	timer=null;
};

//clearInterval Time
function clearOutTimer(timer){
	clearTimeout(timer);
	timer=null;
};

function loadPage(text,url){
	$('.children li').removeClass('homeActive');
	for(var i = 0; i < $('.nav-parent').length; i++) {
		if($('.nav-parent').eq(i).children('a').text() == text) {
			$('.nav-parent').eq(i).next().children('li').eq(0).addClass('homeActive');
			break;
		}
	}
	$('#rightPanel').load(url);
};

function GenNonDuplicateID(){
	var idStr=Date.now().toString(16);
	idStr+=Math.random().toString(16).substr(2);
	return 'Epg-'+idStr;
}

function getNonDuplicateID(){
	var idStr=Date.now().toString(16);
	idStr+=Math.random().toString(16).substr(2);
	return 'Event-'+idStr;
}

//json转化为xml
function json2xml(o, tab){
	var toXml = function(v, name, ind){
		var xml = ""; 
		if(v instanceof Array){
			for(var i=0, n=v.length; i<n; i++){
				xml += ind + toXml(v[i], name, ind+"\t");  
			}
		}else if(typeof(v) == "object"){
			var hasChild = false;
			xml += ind + "<" + name;
			for(var m in v){
				if(m.charAt(0) == "@"){
					xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";  
				}else{
					hasChild = true; 
				}
			}
			xml += hasChild ? ">\n" : "/>\n";
			if(hasChild){
				for(var m in v){
					if(m == "#text"){
						xml += v[m];
					}else if(m == "#cdata"){
						xml += "<![CDATA[" + v[m] + "]]>";
					}else if(m.charAt(0) != "@"){
						xml += toXml(v[m], m, ind+"\t"); 
					}
				}
				xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">\n";  
			}
		}else{
			xml += ind + "<" + name + ">\n" + v.toString() +  "</" + name + ">\n";  
		}
		return xml;
	};
	var xml="";
	for(var m in o){
		xml += toXml(o[m], m, "");
	}
	return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t/g, "");
}

//xml String 转化为 xml 对象
function parseXMLObj(data) {  
    var xml, tmp;  
    if (window.DOMParser) { // Standard   
        tmp = new DOMParser();  
        xml = tmp.parseFromString(data, "text/xml");  
        console.log('xml');
        console.log(xml);
    } else { // IE   
        xml = new ActiveXObject("Microsoft.XMLDOM");  
        xml.async = "false";  
        xml.loadXML(data);  
    }  
    tmp = xml.documentElement;  
    if (!tmp || !tmp.nodeName || tmp.nodeName === "parsererror") {  
        return null;  
    }  
    return xml;  
}  

//xml对象转化为 JSON
function xml2json(xml, tab) {  
   	var X = {  
      	toObj: function(xml) {  
     		var o = {};  
         	if (xml.nodeType==1) {   // element node ..  
            	if (xml.attributes.length)   // element with attributes  ..  
               	for (var i=0; i<xml.attributes.length; i++){
                  	o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();  
               	}
            	if (xml.firstChild) { // element has child nodes ..  
               		var textChild=0, cdataChild=0, hasElementChild=false;  
               		for (var n=xml.firstChild; n; n=n.nextSibling) {  
                  	if (n.nodeType==1) hasElementChild = true;  
                  	else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text  
                  	else if (n.nodeType==4) cdataChild++; // cdata section node  
               	}  
               	if (hasElementChild) {  
                  	if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..  
                     	X.removeWhite(xml);  
                     	for (var n=xml.firstChild; n; n=n.nextSibling) {  
                        	if (n.nodeType == 3)  // text node  
                           		o["#text"] = X.escape(n.nodeValue);  
                       	 	else if (n.nodeType == 4)  // cdata node  
                           		o["#cdata"] = X.escape(n.nodeValue);  
                        	else if (o[n.nodeName]) {  // multiple occurence of element ..  
                           		if (o[n.nodeName] instanceof Array)  
                              	o[n.nodeName][o[n.nodeName].length] = X.toObj(n);  
                           	else  
                              	o[n.nodeName] = [o[n.nodeName], X.toObj(n)];  
                        	}  
                       	 	else  // first occurence of element..  
                           		o[n.nodeName] = X.toObj(n);  
                     	}  
                  	}  
                  	else { // mixed content  
                     	if (!xml.attributes.length)  
                        	o = X.escape(X.innerXml(xml));  
                	 	else  
                        	o["#text"] = X.escape(X.innerXml(xml));  
                  	}  
               	}  
               	else if (textChild) { // pure text  
                  	if (!xml.attributes.length)  
                     	o = X.escape(X.innerXml(xml));  
                  	else  
                     	o["#text"] = X.escape(X.innerXml(xml));  
               	}  
               	else if (cdataChild) { // cdata  
                  	if (cdataChild > 1)  
                     	o = X.escape(X.innerXml(xml));  
                  	else  
                     	for (var n=xml.firstChild; n; n=n.nextSibling)  
                        	o["#cdata"] = X.escape(n.nodeValue);  
               	}  
        	}  
            if (!xml.attributes.length && !xml.firstChild) o = null;  
     	}  
     	else if (xml.nodeType==9) { // document.node  
        	o = X.toObj(xml.documentElement);  
     	}  
     	else  
//      	alert("unhandled node type: " + xml.nodeType);  
			console.log(xml.nodeType);
     		return o;  
      	},  
      	toJson: function(o, name, ind) {  
         	var json = name ? ("\""+name+"\"") : "";  
         	if (o instanceof Array) {  
            	for (var i=0,n=o.length; i<n; i++)  
               		o[i] = X.toJson(o[i], "", ind+"\t");  
            		json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";  
         	}  
         	else if (o == null)  
            	json += (name&&":") + "null";  
         	else if (typeof(o) == "object") {  
            	var arr = [];  
            	for (var m in o)  
               		arr[arr.length] = X.toJson(o[m], m, ind+"\t");  
            		json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";  
         	}  
         	else if (typeof(o) == "string")  
            	json += (name&&":") + "\"" + o.toString() + "\"";  
         	else  
            	json += (name&&":") + o.toString();  
         	return json;  
      	},  
      	innerXml: function(node) {  
         	var s = ""  
         	if ("innerHTML" in node)  
            s = node.innerHTML;  
         	else {  
            	var asXml = function(n) {  
               	var s = "";  
               	if (n.nodeType == 1) {  
             	 	s += "<" + n.nodeName;  
                  	for (var i=0; i<n.attributes.length;i++)  
                     	s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";  
              		if (n.firstChild) {  
                     	s += ">";  
                     	for (var c=n.firstChild; c; c=c.nextSibling)  
                        	s += asXml(c);  
                     	s += "</"+n.nodeName+">";  
                  	}  
                  	else  
                     	s += "/>";  
               	}  
               	else if (n.nodeType == 3)  
                  	s += n.nodeValue;  
               	else if (n.nodeType == 4)  
                  	s += "<![CDATA[" + n.nodeValue + "]]>";  
               	return s;  
            	};  
            	for (var c=node.firstChild; c; c=c.nextSibling)  
               		s += asXml(c);  
         	}  
         	return s;  
      	},  
      	escape: function(txt) {  
			return txt.replace(/[\\]/g, "\\\\")  
   					.replace(/[\"]/g, '\\"')  
           			.replace(/[\n]/g, '\\n')  
           			.replace(/[\r]/g, '\\r');  
      	},  
      	removeWhite: function(e) {  
         	e.normalize();  
         	for (var n = e.firstChild; n; ) {  
            	if (n.nodeType == 3) {  // text node  
               		if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node  
                  		var nxt = n.nextSibling;  
                  		e.removeChild(n);  
                  		n = nxt;  
               		}  
               		else  
                  		n = n.nextSibling;  
        		}  
        		else if (n.nodeType == 1) {  // element node  
           			X.removeWhite(n);  
               		n = n.nextSibling;  
            	}  
            	else                      // any other node  
               		n = n.nextSibling;  
         	}  
         	return e;  
      	}  
   	};  
   	if (xml.nodeType == 9) // document node  
      	xml = xml.documentElement;  
   	var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");  
   	return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";  
}; 

function menuActive(ele){
	$('.nav li').removeClass('homeActive');
	ele.addClass('homeActive');
	if(ele.hasClass('second-nav')){
		ele.next().slideDown(500);
		ele.children().children().eq(1).attr('class','pull-right glyphicon glyphicon-minus');
	}
	ele.parent('ul').slideDown(500);
}
