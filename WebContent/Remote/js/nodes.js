$(function() {
	$(".newnode").css("display", "none");
	var columns = [{
			radio: true
		}, {
			field: 'id',
			title: 'Node ID'
		}, {
			field: 'hostname',
			title: 'HostName'
		}, {
			field: 'network.ip',
			title: 'IP'
		}, {
			field: 'kernel.os',
			title: 'OS'
		}, {
			field: 'status',
			title: 'Status',
			formatter: function(value, row, index) {
				var a = statusEvents(value, row, index);
				return a;
			}
		}, {
			field: 'operation',
			title: 'CPU Usage',
			formatter: function(value, row, index) {
				var b = cpuEvents(value, row, index);
				return b;
			}
		}, {
			field: 'operation',
			title: 'Memory Usage',
			formatter: function(value, row, index) {
				var c = memoryEvents(value, row, index);
				return c;
			}
		}, {
			field: 'operation',
			title: 'Disk Usage',
			formatter: function(value, row, index) {
				var d = diskEvents(value, row, index);
				return d;
			}
		}],
		url = serverIP + 'client',
		oTable = new TableInit(),
		oButtonInit = new ButtonInit(),
		reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;

	//search params
	queryParams = function(params) {
		var num = (params.offset / params.limit) + 1
		var temp = {
			pageSize: params.limit, //Paging corresponding parameters
			pageNumber: num, //Paging corresponding parameters
			id:$('#txt_search_id').val().trim(),
			hostname:$('#txt_search_hostname').val().trim(),
			ip:$('#txt_search_ip').val().trim(),
			status:$('#txt_search_status').val().trim(),
		};
		for(var key in temp){
			if(!temp[key]){
				delete(temp[key]);
			}
		}
		return temp;
	};

	//init Table
	oTable.Init(columns, url, queryParams);

	//search operation
	$("#btn_query").click(function() { //search and refresh				 
		$("#tb_table").bootstrapTable('refresh', {
			url: url
		});
	});

	//show client detail message
	$(document).off('click', '.nodeTable tbody tr').on("click", ".nodeTable tbody tr", showClientMsg); //tr click end

	//show add new node page
	$('.new').click(function() {
		$(".nodes").css("display", "none");
		$(".newnode").css("display", "block");
	});

	//show password
	(function() {
		var on = false;
		$('#seePassword').click(function() {
			$(this).toggleClass('glyphicon-eye-close');
			on = !on;
			if(on) {
				$('.password').attr('type', 'text');
			} else {
				$('.password').attr('type', 'password');
			}
		})
	})();

	//IP check
	$('.ip').blur(function() {
		var ip = $(this).val();
		if(ip == '') {
			$('.ip-prompt span').html('Please enter IP information');
			$('.ip-prompt').show();
			return;
		}
		if(!reg.test(ip) && ip !== '') {
			$('.ip-prompt span').html('IP format is not correct');
			$('.ip-prompt').show();
			return;
		} else {
			$('.ip-prompt').hide();
			return;
		}

	});

	//name check
	$('.name').keyup(function() {
		var name = $(this).val();
		if(name !== '') {
			$('.username-prompt').hide();
		}
	});

	//password check
	$('.password').keyup(function() {
		var password = $(this).val();
		if(password !== '') {
			$('.password-prompt').hide();
		}
	});

	//cancel node
	$('.cancel').click(function() {
		$(".newnode").css("display", "none");
		$(".nodes").css("display", "block");
	});

	//create new node
	$('#save').click(function() {
		var ip = $('.newinput .ip').val(),
			name = $('.newinput .name').val(),
			password = $('.newinput .password').val();
		if(ip == '') {
			$('.ip-prompt span').html('Please enter IP information');
			$('.ip-prompt').show();
			return;
		}
		if(!reg.test(ip) && ip !== '') {
			$('.ip-prompt span').html('IP format is not correct');
			$('.ip-prompt').show();
			return;
		}
		if(name == '') {
			$('.username-prompt').show();
			return;
		}
		if(password == '') {
			$('.password-prompt').show();
			return;
		}

		if((reg.test(ip)) && (name != "") && (password != "")) {
			$('#loadingbg').show();
			var time=new Date();
			var duration=2*60*1000;
			var ajaxObj=null;
			var nodeTimer=setInterval(function(){
				var currentTime=new Date();
				if(currentTime-time>=duration){
					$('#loadingbg').hide();
					clearInterval(nodeTimer);
					nodeTimer=null;
					if(ajaxObj){
						ajaxObj.abort();
					}
					swal("Error~","create node failed", "error");
				}
			},5000);
			ajaxObj=postResultpost('client?ip=' + ip + '&userName=' + name + '&password=' + password + '', function(data) {
				var datas = JSON.parse(data);
				if(datas.code == 0) {
					clearInterval(nodeTimer);
					nodeTimer=null;
					$('#loadingbg').hide();
					swal("Good~", datas.message + " !", "success");
					setTimeout(function() {
						$("#tb_table").bootstrapTable('refresh', {
							url: url
						});
						$('.newinput input').val('');
						$(".newnode").css("display", "none");
						$(".nodes").css("display", "block");
					}, 1000)
				} else {
					clearInterval(nodeTimer);
					nodeTimer=null;
					$('#loadingbg').hide();
					swal("Error~", datas.message, "error");
				}
			})
		}
	});

	//showNodes
	$('#environment-lists').on('click', function() {
		showRight('environment');
	});

	$('#nodes').on('click', function() {
		showRight('nodes');
	});
});

//status
function statusEvents(value, row, index) {
	var status = row.status,
		temp = '';
	if(status == "available") {
		temp = '<img src="../../common/img/green.png" class="img-rounded" >';
	} else {
		temp = '<img src="../../common/img/gray.png" class="img-rounded" >';
	}
	return temp;
};

//cpu Usage
function cpuEvents(value, row, index) {
	var cpuUsage = row.cpu.cpuUsage;
	var temp = '<div class="progress progress-striped active"><div class="progress-bar progress-bar-success" style="width:' + cpuUsage + '"><span style="color:#444c5d">' + cpuUsage + '</span></div></div>';
	return temp;
};

//Memory Usage
function memoryEvents(value, row, index) {
	var memoryTotal = row.memory.memoryTotal,
		memoryUsed = row.memory.memoryUsed,
		memoryUsage = row.memory.memoryUsage;
	var temp = '<div class="progress progress-striped active"><div class="progress-bar progress-bar-success" style="width:' + memoryUsage + '"><span style="color:#444c5d">' + memoryUsed + 'GB(' + memoryTotal + 'GB)</span></div></div>';
	return temp;
};

//Disk Usage
function diskEvents(value, row, index) {
	var diskTotal = row.fileSystem.diskTotal,
		diskUsed = row.fileSystem.diskUsed,
		diskUsage = row.fileSystem.diskUsage;
	var temp = '<div class="progress progress-striped active"><div class="progress-bar progress-bar-success" style="width:' + diskUsage + '"><span style="color:#444c5d">' + diskUsed + 'GB(' + diskTotal + 'GB)</span></div></div>';
	return temp;
};

//show clinet detail msg
function showClientMsg() {
	var dataAll=$('#tb_table').bootstrapTable('getData');
	if(dataAll.length==0){
		return false;
	}
	$('.modal-content-inner').empty();
	var index=$(this).index();
	var currentData=dataAll[index];
	var nodeid=currentData.id;
	var msgdiv = $("<div class='msgContent'></div>");
	$('.modal-content-inner').append(msgdiv);
	$('.nodeTable tbody tr').removeAttr("data-toggle").removeAttr("data-target");
	$(this).attr({
		"data-toggle": "modal",
		"data-target": "#nodeModal"
	});
		
	getResultGet('client?id=' + nodeid + '', function(data) {
		$('.msgContent').empty();
		var datas = JSON.parse(data).rows[0],
			div = "",
			lab = '',
			span = '';

		for(var j in datas) {
			if(typeof(datas[j]) == "object") {
				div = $("<div style='border:1px solid #9D9D9D;margin-bottom:5px;padding-left:5px;'></div>");
				if(j == 'kernel') {
					var divStr = "";
					divStr += '<p><label>OS:&nbsp</label><span>' + datas[j]["os"] + '</span></p><p><label>OS &nbsp; Release:&nbsp</label><span>' + datas[j]["osRelease"] + '</span></p><p><label>Platform:&nbsp</label><span>' + datas[j]["platform"] + '</span></p><p><label>Platform &nbsp; Version:&nbsp</label><span>' + datas[j]["platformVersion"] + '</span></p>';
					div.html(divStr);
					div.appendTo(msgdiv);
				}
				if(j == 'network') {
					var divStr = "";
					divStr += '<p><label>IP:&nbsp</label><span>' + datas[j]["ip"] + '</span></p><p><label>Mac:&nbsp</label><span>' + datas[j]["mac"] + '</span></p><p><label>IPv6 &nbsp; Address:&nbsp</label><span>' + datas[j]["ip6address"] + '</span></p>';
					div.html(divStr);
					div.appendTo(msgdiv);
				}
				if(j == 'cpu') {
					var divStr = "";
					divStr += '<p><label>CPU &nbsp; Cores:&nbsp</label><span>' + datas[j]["cpuCores"] + '</span></p><p><label>CPU &nbsp; Usage:&nbsp</label><span>' + datas[j]["cpuUsage"] + '</span></p>';
					div.html(divStr);
					div.appendTo(msgdiv);
				}
				if(j == 'memory') {
					var divStr = "";
					divStr += '<p><label>Memory &nbsp; Total:&nbsp</label><span>' + datas[j]["memoryTotal"] + '&nbsp;GB</span></p><p><label>Memory &nbsp; Used:&nbsp</label><span>' + datas[j]["memoryUsed"] + '&nbsp;GB</span></p><p><label>Memory &nbsp; Usage:&nbsp</label><span>' + datas[j]["memoryUsage"] + '</span></p>';
					div.html(divStr);
					div.appendTo(msgdiv);
				}
				if(j == 'fileSystem') {
					var divStr = "";
					divStr += '<p><label>Disk &nbsp; Total:&nbsp</label><span>' + datas[j]["diskTotal"] + '&nbsp;GB</span></p><p><label>Disk &nbsp; Used:&nbsp;</label><span>' + datas[j]["diskUsed"] + '&nbsp;GB</span></p><p><label>Disk &nbsp; Usage:&nbsp</label><span>' + datas[j]["diskUsage"] + '</span></p>';
					div.html(divStr);
					div.appendTo(msgdiv);
				}
			} else if(typeof(datas[j]) == "string") {
				if(j == "id") {
					lab = "<label>ID:&nbsp</label>";
					span = "<span>" + datas['id'] + "</span>";
					$("<p style='padding-left:5px;'>" + lab + span + "</p>").appendTo(msgdiv);
				}
				if(j == 'status') {
					lab = "<label>Status:&nbsp</label>";
					span = "<span>" + datas['status'] + "</span>";
					$("<p style='padding-left:5px;'>" + lab + span + "</p>").appendTo(msgdiv);
				}
				if(j == 'hostname') {
					lab = "<label>Name:&nbsp</label>";
					span = "<span>" + datas['hostname'] + "</span>";
					$("<p style='padding-left:5px;'>" + lab + span + "</p>").appendTo(msgdiv);
				}

			}
			$('#nodeModal').modal({
				keyboard: true,
				backdrop: "static"
			})
		}
	});
}