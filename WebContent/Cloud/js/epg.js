var idLink='/';
//var isSave=false;
var myDiagram=null;
var oldModel='';
var MeuObj={//绘图涉及数据的作用域
	originalMeus:null,//能够读取的meu原始数据
	allMeu:null,//用于绘制流程图的meu数据
	urlMappingMeu:null,
	selectedLine:null,//当前选取的线
	inputParamList:null,//作为inputParameter的所有数据
	isExistedReturn:false,//验证当前的return值的唯一性
	removeParam:null,//inputParameter数据中被修改的数据需将之前的数据删除
	isEdit:false,//判断是否为编辑epg
	editData:null,//需要编辑的epg
};

var isInit=false;
$(function(){
	//epg Table 初始化
	var columns = [{
			radio: true
		},
		{
			field: 'name',
			title: 'Name',
			sortable:true
		},
		{
			field: 'meus',
			title: 'MEU',
			formatter: function(value, row, index) {
				var a = cloudEpgMeus(value, row, index);
				return a;
			}
		},
		{
			field: 'description',
			title: 'Description',
			formatter: function(value, row, index) {
				if(!value){
					value='-';
				}
				return value;
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
			for(var key in temp){
				if(!temp[key]){
					delete(temp[key]);
				}
			}
			return temp;
		};
		
		var oTable = new TableInit();
		oTable.Init(columns, serverIP+'cloud/epg', queryParams,'name');
});

$(function(){
	//Epg flowchart 操作
	var saveEpgObj={//用于提交create的epg数据
		"name":'',
		"description":'',
		"definition":'',
		"urlMappings":{
			"definition":""
		},
		"graphInfo":""
	};
	var epgObj={//用于描述流程图的xml的json对象
			"epg":{
				"@id":'',
				"@name":'',
				"meus":{},
				"events":{},
				"topic-meu-mappings":{},
			}
		};
	var urlMappingObj={
		isAdd:false,
		isEdit:false,
		editData:null,
		editIndex:-1,
		postUrlMapping:{
			"url-meu-mappings":{
				"url-meu-mapping":[
					
				]
			}
		}
	};
	var urlMappingColumns=[{
			checkbox: true
		},
		{
			field: '@url',
			title: 'URL',
		},
		{
			field: '@dest',
			title: 'MEU',
		},
		{
			field: '@operationId',
			title: 'Operation',
		},
		{
			field: '@method',
			title: 'Method',
		},{
			title: 'Edit',
			formatter:function(){
				return '<span class="glyphicon glyphicon-pencil text-primary url_mapping_edit" style="cursor:pointer;"></span>'
			}
		}];
	var urlMappingData=[];	
	//flowChart 的绘制
	function init(){
		var GO=go.GraphObject.make;//定义模板
		
		myDiagram=
			GO(go.Diagram,"myDiagramDiv",//引用div元素
				{
					initialContentAlignment: go.Spot.Center,
					allowDrop: true,
					allowCopy:false,
					allowClipboard:false,
					"LinkDrawn": showLinkLabel,
					"LinkRelinked": showLinkLabel,
					"animationManager.duration": 800,
					"undoManager.isEnabled": false,
					"toolManager.hoverDelay": 0,
					"toolManager.toolTipDuration":0
				}
		);

		var lightText='#000';
		
		myDiagram.nodeTemplateMap.add("",
			GO(go.Node, "Spot", nodeStyle(),
				{locationSpot: go.Spot.Center},
				new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
				
				GO(go.Panel, "Auto",
					{width: 'auto', height: 'auto'},
					GO(go.Shape, "Rectangle",
						{
							fill: GO(go.Brush, go.Brush.Linear, {
								0: "white",
								1: "#ccc"
							}),
							stroke: "#bbb",
							strokeWidth: 2,
						},
						new go.Binding("figure", "figure"),
						new go.Binding('location', 'loc', go.Point.Parse),  
						new go.Binding('width', 'width'),
						new go.Binding('height', 'height')
					),
					GO(go.TextBlock,
						{
							font: "bold 14pt helvetica, bold arial, sans-serif",
				            margin: 20,
						},
						new go.Binding("text").makeTwoWay()
					),
					 {                          
		            	toolTip:                         
			              GO(go.Adornment, "Auto",
			                GO(go.Shape, { fill: "#eee",stroke: "#bbb" }),
			                GO(go.Panel, "Vertical",
			                  GO(go.TextBlock, { margin:10,font:"200 12pt helvetica, bold arial, sans-serif",width:260},
			                    new go.Binding("text", "",gettip))      //	tiptext
			                )
			              )
			         }
				),
				makePort("T", go.Spot.Top, false, true),
				makePort("L", go.Spot.Left, true, true),
        		makePort("R", go.Spot.Right, true, true),
        		makePort("B", go.Spot.Bottom, true, false)
			)
		);
		
		myDiagram.nodeTemplateMap.add("Start",
			GO(go.Node, "Spot", nodeStyle(),
				GO(go.Panel, "Auto",
					GO(go.Shape, "Ellipse",
						{ 
							minSize: new go.Size(40, 40), 
							fill: GO(go.Brush, go.Brush.Linear, {
								0: "white",
								1: "#ccc"
							}),
							stroke: "#bbb"
						}
					),
					GO(go.TextBlock, "Start",
						{font: "bold 14pt Helvetica, Arial, sans-serif", stroke: lightText,margin: 8},
						new go.Binding("text")
					)
				),
				makePort("L", go.Spot.Left, true, false),
				makePort("R", go.Spot.Right, true, false),
				makePort("B", go.Spot.Bottom, true, false)
			)
		);
		
		myDiagram.nodeTemplateMap.add("End",
			GO(go.Node, "Spot", nodeStyle(),
				GO(go.Panel, "Auto",
					GO(go.Shape, "Ellipse",
						{ 
							minSize: new go.Size(40, 40), 
							fill: GO(go.Brush, go.Brush.Linear, {
								0: "white",
								1: "#ccc"
							}),
							stroke: "#bbb"
						}
					),
					GO(go.TextBlock, "End",
						{ font: "bold 14pt Helvetica, Arial, sans-serif", stroke: lightText,margin: 8 },
						new go.Binding("text")
					)
				),
				makePort("T", go.Spot.Top, false, true),
        		makePort("L", go.Spot.Left, false, true),
        		makePort("R", go.Spot.Right, false, true)
			)
		);
		
		myDiagram.linkTemplate=
			GO(go.Link,
				{
					routing: go.Link.AvoidsNodes,
					curve: go.Link.JumpOver,
					corner: 5, 
					toShortLength: 4,
					relinkableFrom: true,
					relinkableTo: true,
					resegmentable: true,
					reshapable: true,
					mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
					mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; }
				},
				GO(go.Shape,
					{
						isPanelMain: true, 
						strokeWidth: 8, 
						stroke: "transparent", 
						name: "HIGHLIGHT"
					}
				),
				GO(go.Shape,
					{
						isPanelMain: true, 
						stroke: "gray", 
						strokeWidth: 2
					}
				),
				GO(go.Shape,
					{
						toArrow: "standard", 
						stroke: null, 
						fill: "gray"
					}
				),
				GO(go.Panel, "Auto",
					{
						visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5
					},
					new go.Binding("visible", "visible").makeTwoWay(),
					GO(go.Shape, "RoundedRectangle",
						{
							fill: "#f8f8f8", 
							stroke: null
						}
					),
					GO(go.TextBlock, "reference",
						{
							textAlign: "center",
							font: "10pt helvetica, arial, sans-serif",
							stroke: "#333333",
							editable: false
						},
						new go.Binding("text").makeTwoWay()
					)
				),
				{
					"click":function(e,link){
						$('#myInfo table input').val('');
		        		$('#myInfo table select[name=mode] option[value=0]').prop('selected',true);
						$('#myInfo table select[name=operationId]').empty();
					  	$('#myInfo table .inputParam').html('');
					  	$('.returnInfo').remove();
					  	
					  	var fromNode=link.fromNode.data;
			  			var toNode=link.toNode.data;
			  			var visible=link.data.visible;
			  			
			  			if(visible){
			  				return;
			  			}
			  			
			  			if(fromNode.figure!=="Diamond"&&toNode.figure=="Diamond"){
					      	$('#myInfo table tr').css('display','none');
					      	$('#myInfo table tr').eq(0).css('display','table-row');
				      	}else if(fromNode.figure=="Diamond"&&toNode.figure=="Diamond"){
					      	 $('#infoDraggable').addClass('hidden');
				      	}else if(fromNode.figure=="Diamond"&&toNode.figure!=="Diamond"){
					      	$('#myInfo table tr').css('display','table-row');
					      	$('#myInfo table tr').eq(0).css('display','none');
				      	}else{
				      		$('#myInfo table tr').css('display','table-row');
				      	}
				      	
				      	var operationStr='<option value="0"></option>';
			  			var targetNodeId=link.data.to;
			  			if(MeuObj.originalMeus[targetNodeId]){
					      	var targetData=MeuObj.originalMeus[targetNodeId];
					      	var operations=targetData.operations;
					      	if(operations.length>0){
					      		for(var i=0;i<operations.length;i++){
					      			operationStr+='<option value="'+operations[i]["@id"]+'">'+operations[i]["@methodName"]+'('+operations[i]["@id"]+')</option>'
					      		}
					      	}
					    };
					    $('#myInfo table select[name=operationId]').html(operationStr);
					    $('#myInfo table select[name=operationId] option[value=0]').prop('selected',true);
					    MeuObj.selectedLine=link.data;
					    var mode=link.data.mode;
		        		var inputParam=link.data.inputParam;
		        		var operationId=link.data.operationId;
		        		var linkreturn=link.data["return"];
		        		var condition=link.data.condition;
		        		
		        		if(mode){
		        			$('#myInfo table select[name=mode] option[value='+mode+']').prop('selected',true);
		        		}
		        		if(inputParam){
		        			$('#myInfo table .inputParam').html(inputParam);
		        		}
		        		if(operationId){
		        			$('#myInfo table select[name=operationId] option[value="'+operationId+'"]').prop('selected',true);
		        		}
		        		if(linkreturn){
		        			$('#myInfo table input[name="return"]').val(linkreturn);
		        		}
		        		if(condition){
		        			$('#myInfo table input[name=condition]').val(condition);
		        		}
		        		
	        			$('#infoDraggable').removeClass('hidden').css({
				      		'position':'absolute',
				      		'top':"10px",
				      		"right":"10px"
				      	});
					}
				}
			);
		//LinkingTool和RelinkingTool使用的临时链接也是正交的	
		myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
		myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
			
		//当点击画布时，隐藏线的配置信息表	
		myDiagram.click=function(){
			$('#infoDraggable').addClass('hidden');
		};
		
		//当点击画布上的节点时，隐藏线的配置信息表
		myDiagram.addDiagramListener('ObjectSingleClicked',function(ev){
			var isShow=ev.subject.isPanelMain;
			if(!isShow){
				$('#infoDraggable').addClass('hidden');
			}
		});
		
		//当拖拽节点的时候隐藏线的配置信息表
		myDiagram.addDiagramListener('SelectionMoved',function(ev){
			var selectObj=ev.subject.Ea.value.data;
			if('key' in selectObj){
				$('#infoDraggable').addClass('hidden');
			}
		});
		
		// 删除节点和线
		myDiagram.addDiagramListener('SelectionDeleted',function(ev){
			var deleteData=ev.subject.Ea.value.data;
			if('key' in deleteData){
				var meuId=deleteData['key'];
				if(MeuObj.inputParamList){
					for(var key in MeuObj.inputParamList){
						if(MeuObj.inputParamList[key].from==meuId||MeuObj.inputParamList[key].to==meuId){
							delete(MeuObj.inputParamList[key]);
						}
					}
				};
				if(MeuObj.originalMeus!==null&&meuId in MeuObj.originalMeus){
					MeuObj.allMeu[meuId]=deepClone(MeuObj.originalMeus[meuId]);
					if(MeuObj.allMeu[meuId].license.availableNum===0){
						MeuObj.allMeu[meuId].license.availableNum=1;
					};
					delete(MeuObj.urlMappingMeu[meuId]);
					if(urlMappingData.length>0){
						for(var i=0;i<urlMappingData.length;i++){
							if(urlMappingData[i]["@dest"]==meuId){
								urlMappingData.splice(i,1);
								i--;
							}
						}
						$('#url_mapping_table').bootstrapTable("refreshOptions",{
							data:urlMappingData
						});
					}
				}
			}else{
				$('#infoDraggable').addClass('hidden');
				if(MeuObj.inputParamList){
					for(var key in MeuObj.inputParamList){
						if(MeuObj.inputParamList[key].from==deleteData.from&&MeuObj.inputParamList[key].to==deleteData.to){
							delete(MeuObj.inputParamList[key]);
							break;
						}
					}
				}
			}
		});
		
		//从左边的画布拖拽节点到右边的画布上，如果是meu，弹出meu列表
		myDiagram.addDiagramListener('ExternalObjectsDropped',function(ev){
			$('#infoDraggable').addClass('hidden');
			var origaData=ev.PA.Ea.value.data;
			if(origaData.text=='Meu'){
				getMeuList();
				myDiagram.remove(myDiagram.findNodeForKey(-2));
			}
		});
		
		//初始化页面左侧的“调色板”
		myPalette =
			GO(go.Palette, "myPaletteDiv",
				{
					"animationManager.duration": 800,
					nodeTemplateMap: myDiagram.nodeTemplateMap,
				}
			);
		
		myPalette.model=new go.GraphLinksModel([
			{ category: "Start", text: "Start" },
			{ text: "Meu",meuId:""},
			{ text: "", figure: "Diamond",width:40,height:40},
			{ category: "End", text: "End"},
		]);
		
		//点击meu节点的时候显示meu的列表
		myPalette.findNodeForKey(-2).click=function(e,node){
			getMeuList();
		};
		
		
		//init方法里面涉及的function
		//showLinkLabel绘制节点之间的线时设置一些属性
		function showLinkLabel(e){
			$('#infoDraggable').addClass('hidden');
			var label = e.subject.findObject("LABEL");
			var fromNode=e.subject.fromNode.data;//起始节点
			var toNode=e.subject.toNode.data;//目标节点
	        $('#myInfo table input').val('');
	        $('#myInfo table select[name=mode] option[value=0]').prop('selected',true);
		  	$('#myInfo table select[name=operationId]').empty();
		  	$('#myInfo table .inputParam').html('');
	      	$('.returnInfo').remove();
	      	if(fromNode.figure!=="Diamond"&&toNode.figure=="Diamond"){
	      		$('#myInfo table tr').css('display','none');
	      		$('#myInfo table tr').eq(0).css('display','table-row');
	      	}else if(fromNode.figure=="Diamond"&&toNode.figure=="Diamond"){
	      		$('#infoDraggable').addClass('hidden');
	      	}else if(fromNode.figure=="Diamond"&&toNode.figure!=="Diamond"){
	      		$('#myInfo table tr').css('display','table-row');
      			$('#myInfo table tr').eq(0).css('display','none');
	      	}else{
	      		$('#myInfo table tr').css('display','table-row');
	      	}
	      	
	      	var operationStr='<option value="0"></option>';
	      	var targetNodeId=toNode.key;
	      	var operations=[];
	      	if(MeuObj.originalMeus!==null){
	      		if(MeuObj.originalMeus[targetNodeId]){
	      			var targetData=MeuObj.originalMeus[targetNodeId];
	      			operations=targetData.operations;
	      			if(operations.length>0){
	      				for(var i=0;i<operations.length;i++){
	      					operationStr+='<option value="'+operations[i]["@id"]+'">'+operations[i]["@methodName"]+'('+operations[i]["@id"]+')</option>'
	      				}
	      			}
	      		}
	      	}
	      	
	      	$('#myInfo table select[name=operationId]').html(operationStr);
	      	$('#myInfo table select[name=operationId] option[value=0]').prop('selected',true);
	      	MeuObj.selectedLine=e.subject.data;
		    var mode=e.subject.data.mode;
    		var inputParam=e.subject.data.inputParam;
    		var operationId=e.subject.data.operationId;
    		var linkreturn=e.subject.data["return"];
    		var condition=e.subject.data.condition;
    		
    		if(mode){
    			$('#myInfo table select[name=mode] option[value='+mode+']').prop('selected',true);
    		}
    		if(inputParam){
    			$('#myInfo table .inputParam').html(inputParam);
    		}
    		if(operationId){
    			var notChange=false;
    			if(operations.length>0){
    				for(var j=0;j<operations.length;j++){
    					if(operations[j]["@id"]==operationId){
    						notChange=true;
    						$('#myInfo table select[name=operationId] option[value="'+operationId+'"]').prop('selected',true);
    					}
    				}
    			}
    			if(!notChange){
    				e.subject.data.operationId=0;
    			}
    		}
    		if(linkreturn){
    			var currentInput=MeuObj.inputParamList[linkreturn];
    			currentInput.from=e.subject.data.from;
    			currentInput.fromPort=e.subject.data.fromPort;
    			currentInput.to=e.subject.data.to;
    			currentInput.toPort=e.subject.data.toPort;
    			$('#myInfo table input[name="return"]').val(linkreturn);
    		}
    		if(condition){
    			$('#myInfo table input[name=condition]').val(condition);
    		}
			
			var isReference=false;
			if (label !== null){
	      		label.visible=false;
	      		$('#referenceInfo').addClass('hidden');
		      	if(MeuObj.originalMeus!==null){
			      	if(MeuObj.originalMeus[fromNode.key]&&MeuObj.originalMeus[toNode.key]){
			      		var referenceMeu=MeuObj.originalMeus[fromNode.key].definitionJson.meu;
			      		var declareMeu=MeuObj.originalMeus[toNode.key].definitionJson.meu.declare;
			      		if(referenceMeu["reference"]){
				      		var referenceData=referenceMeu["reference"].interface;
				      		if(declareMeu){
				      			var declareData=declareMeu.interface;
				      			for(var i=0;i<referenceData.length;i++){
					      			if(referenceData[i]==declareData){
					      				$('#referenceInfo').removeClass('hidden');
					      				isReference=true;
					      				$('.referenceY').off('click').on('click',function(){
					      					label.visible=true;
					      					$('#referenceInfo').addClass('hidden');
					      				});
					      				$('.referenceN').off('click').on('click',function(){
					      					label.visible=false;
					      					$('#referenceInfo').addClass('hidden');
					      					$('#infoDraggable').removeClass('hidden').css({
									      		'position':'absolute',
									      		'top':"10px",
									      		"right":"10px"
									      	});
					      				})
					      			}
					      		}
				      		}
				      	}
			      	}
		      	}
	        } 
	        if(!isReference){
	        	$('#infoDraggable').removeClass('hidden').css({
		      		'position':'absolute',
		      		'top':"10px",
		      		"right":"10px"
		      	});
	        }
		};
		
		//节点模板的辅助定义
		function nodeStyle(){
			return [
				new go.Binding("location","loc",go.Point.parse).makeTwoWay(go.Point.stringify),
				{
					locationSpot: go.Spot.Center,
					mouseEnter: function (e, obj) { showPorts(obj.part, true); },
					mouseLeave: function (e, obj) { showPorts(obj.part, false); }
				}
			]
		};
		
		
		//定义一个端口的功能
		function makePort(name,spot,output,input){
			return GO(go.Shape,"Circle",
				{
					fill: "transparent",
					stroke: null,
					desiredSize: new go.Size(8, 8),
					alignment: spot, 
					alignmentFocus: spot,
					portId: name,
					fromSpot: spot, 
					toSpot: spot,
					fromLinkable: output, 
					toLinkable: input,
					cursor: "pointer"
				}
			);
		};
		
		isInit=true;
	}
	
	
	//保存目前绘图界面的数据
	function save() {
	  	epgObj.epg.meus={};
	  	epgObj.epg.events={};
	  	epgObj.epg["topic-meu-mappings"]={};
		var jsonText = myDiagram.model.toJson();  
		saveEpgObj.graphInfo=jsonText;
		var jsonParse=eval("(" + jsonText + ")");
		
		var jsonMeus=jsonParse.nodeDataArray;
		var styleArr={};
		for(var i=0;i<jsonMeus.length;i++){
			var meuKey=jsonMeus[i].key;
			var meuFigure=jsonMeus[i].figure;
			var meuCategory=jsonMeus[i].category;
			if(MeuObj.originalMeus){
				if(meuKey in MeuObj.originalMeus){
					var currentMeu={};
					currentMeu["@id"]=MeuObj.originalMeus[meuKey].id;
					if(MeuObj.originalMeus[meuKey].type){
						currentMeu["@type"]=MeuObj.originalMeus[meuKey].type;
					}
					if(!epgObj.epg.meus.meu){
						epgObj.epg.meus.meu=[];
					}
					epgObj.epg.meus.meu.push(currentMeu);
					
					var topicMeuNode=MeuObj.originalMeus[meuKey];
					if(topicMeuNode.type=="virtual"||topicMeuNode.type=="dispatch"){
						var topicObj={};
						topicObj["@topic"]=topicMeuNode.id;
						topicObj["@meuId"]=topicMeuNode.id;
						topicObj["@operationId"]='';
						if(!epgObj.epg["topic-meu-mappings"]["topic-meu-mapping"]){
							epgObj.epg["topic-meu-mappings"]["topic-meu-mapping"]=[];
						}
						epgObj.epg["topic-meu-mappings"]["topic-meu-mapping"].push(topicObj);
					}else{
						if(topicMeuNode.operations.length>0){
							for(var m=0;m<topicMeuNode.operations.length;m++){
								var topicObj={};
								topicObj["@topic"]=topicMeuNode.id+'/'+topicMeuNode.operations[m]["@id"];
								topicObj["@meuId"]=topicMeuNode.id;
								topicObj["@operationId"]=topicMeuNode.operations[m]["@id"];
								if(!epgObj.epg["topic-meu-mappings"]["topic-meu-mapping"]){
									epgObj.epg["topic-meu-mappings"]["topic-meu-mapping"]=[];
								}
								epgObj.epg["topic-meu-mappings"]["topic-meu-mapping"].push(topicObj);
							}
						}
					}
					
				}else{
					if(meuFigure){
						styleArr[meuKey]=meuFigure;
					}else if(meuCategory){
						styleArr[meuKey]=meuCategory;
					}
					
				}
			}
			
		}
		
		var destDiaArr=[];//以菱形开始
	  	var sourceDiaArr=[];//以菱形结束
	  	var normalEventArr=[];//正常节点
	  	var sourceDestDiaArr=[];//以菱形开始并以菱形结束；
	  	var jsonEvents=jsonParse.linkDataArray;
		
		
		for(var j=0;j<jsonEvents.length;j++){
	    	var currentEvent=jsonEvents[j];
	    	var source=currentEvent.from;
	    	var dest=currentEvent.to;
	    	var visible=currentEvent.visible;
	    	if(visible){
	    		continue;
	    	}
	    	if(dest in styleArr&&styleArr[dest]=='Diamond'){
	    		if(source in MeuObj.originalMeus||(source in styleArr&&styleArr[source]!=='Diamond')){
	    			sourceDiaArr.push(currentEvent);
	    		}else if(source in styleArr&&styleArr[source]=='Diamond'){
	    			sourceDestDiaArr.push(currentEvent);
	    		}
	    		continue;
	    	}else if(source in styleArr&&styleArr[source]=='Diamond'){
	    		destDiaArr.push(currentEvent);
	    		continue;
	    	}else{
	    		normalEventArr.push(currentEvent);
	    	}
	    }
	
		for(var k=0;k<normalEventArr.length;k++){
			var currentEvent=normalEventArr[k];
			var source=currentEvent.from;
			var dest=currentEvent.to;
			var operationId=currentEvent.operationId;
			var mode=currentEvent.mode
			var inputParam=currentEvent.inputParam
			var condition=currentEvent.condition
			var currentReturn=currentEvent["return"];
			var currentEventObj={};
			currentEventObj["@id"]=getNonDuplicateID();;
			if(MeuObj.originalMeus){
				if(source in MeuObj.originalMeus){
					currentEventObj["@source"]=source;
				}else{
					if(source in styleArr&&styleArr[source]=='Start'){
						currentEventObj["@source"]='';
					}
				}
				
				if(dest in MeuObj.originalMeus){
					currentEventObj["@dest"]=dest;
				}else{
					if(dest in styleArr&&styleArr[dest]=='End'){
						currentEventObj["@dest"]='';
					}
				}
				
				if(operationId&&operationId!=="0"){
					currentEventObj["@operationId"]=operationId;
				}
				if(mode&&mode!=="0"){
					currentEventObj["@mode"]=mode;
				}
				if(inputParam){
					currentEventObj["@inputParam"]=inputParam;
				}
				if(condition){
					currentEventObj["@condition"]=condition.trim();
				}
				if(currentReturn){
					currentEventObj["@return"]=currentReturn.trim();
				}
				
			}else{
				if(source in styleArr&&styleArr[source]=='Start'){
					currentEventObj["@source"]='';
				}
				if(dest in styleArr&&styleArr[dest]=='Start'){
					currentEventObj["@dest"]='';
				}
				
			}
			if(!epgObj.epg.events.event){
				epgObj.epg.events.event=[];
			}
			epgObj.epg.events.event.push(currentEventObj);
			
		}
		
		
		var sourceDiaObj={};
		for(var x=0;x<sourceDiaArr.length;x++){
			var currentEvent=sourceDiaArr[x];
			var source=currentEvent.from;
			var dest=currentEvent.to;
			var mode=currentEvent.mode
			var currentEventObj={};
			currentEventObj["@id"]=getNonDuplicateID();
			if(MeuObj.originalMeus!==null){
				if(source in MeuObj.originalMeus){
					currentEventObj["@source"]=source;
				}else if(source in styleArr&&styleArr[source]=='Start'){
					currentEventObj["@source"]='';
				}
			}
			
			currentEventObj["dest"]=[];
			if(mode&&mode!=="0"){
				currentEventObj["@mode"]=mode;
			}
			sourceDiaObj[dest]=currentEventObj;
		}
		
		if(sourceDestDiaArr.length>0){
			var newSourceDest={};
			for(var z=0;z<sourceDestDiaArr.length;z++){
				var dest1=sourceDestDiaArr[z].to;
				for(var s=z+1;s<sourceDestDiaArr.length;s++){
					var source2=sourceDestDiaArr[s].from;
					if(source2==dest1){
						
					}
				}
				
			}
		}
		
		if(sourceDestDiaArr.length>0){
			for(var z=0;z<sourceDestDiaArr.length;z++){
				for(var t=z+1;t<sourceDestDiaArr.length;t++){
					if(sourceDestDiaArr[t].from==sourceDestDiaArr[z].to){
						sourceDestDiaArr[t].from=sourceDestDiaArr[z].from;
					}
				}
			}
		}
		
		
		for(var y=0;y<destDiaArr.length;y++){
			var currentEvent=destDiaArr[y];
			var source=currentEvent.from;
			var dest=currentEvent.to;
			var operationId=currentEvent.operationId;
			var inputParam=currentEvent.inputParam
			var condition=currentEvent.condition
			var currentReturn=currentEvent["return"];
			var currentEventObj={};
			
			if(MeuObj.originalMeus!==null){
				if(dest in MeuObj.originalMeus){
					currentEventObj["@id"]=dest;
				}else if(dest in styleArr&&styleArr[dest]=='End'){
					currentEventObj["@id"]='';
				}
			}
			
			if(operationId&&operationId!=="0"){
				currentEventObj["@operationId"]=operationId;
			}
			if(inputParam){
				currentEventObj["@inputParam"]=inputParam;
			}
			if(condition){
				currentEventObj["@condition"]=condition;
			}
			if(currentReturn){
				currentEventObj["@return"]=currentReturn;
			}
			
			if(sourceDestDiaArr.length>0){
				for(var k=0;k<sourceDestDiaArr.length;k++){
					if(sourceDestDiaArr[k].to==source){
						source=sourceDestDiaArr[k].from;
					}
				}
			}
			
			if(source in sourceDiaObj){
				sourceDiaObj[source].dest.push(currentEventObj);
			}
		}
		
		if(!epgObj.epg.events.event){
			epgObj.epg.events.event=[];
		}
		
		for(var key in sourceDiaObj){
			epgObj.epg.events.event.push(sourceDiaObj[key]);
		}
	    var xmlText=json2xml(epgObj);
	    xmlText='<?xml version="1.0" encoding="UTF-8"?>\n'+xmlText;
	   	var formatXml = vkbeautify.xml(xmlText);//格式化xml
	    document.getElementById("xmlText").value=formatXml; 
	    saveEpgObj.definition=formatXml;
	  }
		
		
		
		
	//epg 流程图的事件操作
	//进入createEpg弹出框
	$('#btn_create').click(function(){
		$('#createEpg textarea').val('');
		$('#createEpg p').addClass('hidden');
		$('#createEpg h4').text('Create Epg');
		$('#createEpg input[name=epgName]').val('').removeAttr('readonly');
		
	});
	
	//epg edit and delete btn available or not
	$('#tb_table').on('check.bs.table',function(e,row,$element){
		$('#btn_delete').removeClass('disabled');
		$('#btn_edit').removeClass('disabled');
	})
	//EPG Delete 
	$('#btn_delete').click(function(){
		var deleteData=$('#tb_table').bootstrapTable("getSelections")[0];
		if(!deleteData){
			return;
		}else{
			var id=deleteData.id;
			deleteAjaxResult('cloud/epg?id='+id,function(data){
				data=JSON.parse(data);
				if(data.code==0){
					swal("Good~", "Delete EPG Success !", "success");
					$('#tb_table').bootstrapTable('refresh');
					$('#btn_delete').addClass('disabled');
					$('#btn_edit').addClass('disabled');
				}else{
					swal("Error~", "Delete EPG Failed !", "error");
				}
			})
		}
	});
	//Epg Edit
	$('#btn_edit').click(function(){
		editData=$('#tb_table').bootstrapTable("getSelections")[0];
		MeuObj.editData=deepClone(editData);
		if(!editData){
			return;
		}else{
			MeuObj.isEdit=true;
			var name=editData.name;
			var description=editData.description;
			epgObj.epg["@name"]=name;
			epgObj.epg["@id"]=GenNonDuplicateID();
			saveEpgObj.name=name;
			saveEpgObj.description=description;
			if(!MeuObj.originalMeus){
				MeuObj.originalMeus={};
				getAjax(serverIP+'cloud/meu?type=0',function(data){
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
						MeuObj.originalMeus[id]=datas[i];
					}
					
				},function(data){
					console.log(data);
				});
			}
			
			MeuObj.allMeu=deepClone(MeuObj.originalMeus);
			
			$('#epgXml').text(name+'.xml');
			$('#epgTable').addClass('hidden');
			$('#epgFlowchart').removeClass('hidden');
			
			urlMappingData=[];
			$('.nav-tabs a:first').tab('show');
			if(!isInit){
				init();
			}
			
			var urlMappingXml=editData.urlMappings.definition;
			urlMappingXml=parseXMLObj(urlMappingXml);
			var urlMappingXmlJson=xml2json(urlMappingXml);
			var ownMus=editData.meus;
			var epgxml=editData.definition;
			epgxml=parseXMLObj(epgxml);
			var epgxmlJson=xml2json(epgxml);
			epgxmlJson="{"+epgxmlJson.substring(11);
			epgxmlJson=eval("(" + epgxmlJson + ")")
			urlMappingXmlJson="{"+urlMappingXmlJson.substring(11);
			urlMappingXmlJson=eval("(" + urlMappingXmlJson + ")")
			var diagramJson=JSON.parse(editData.graphInfo);
			if(!MeuObj.urlMappingMeu){
				MeuObj.urlMappingMeu={};
			}
			for(var n=0;n<ownMus.length;n++){
				var ownMeuId=ownMus[n].group+idLink+ownMus[n].name+idLink+ownMus[n].version;
				MeuObj.urlMappingMeu[ownMeuId]=MeuObj.allMeu[ownMeuId];
				delete(MeuObj.allMeu[ownMeuId]);
			}
			
			if(diagramJson){
				var diagramModel=diagramJson;
				diagramModel.linkFromPortIdProperty="fromPort";
				diagramModel.linkToPortIdProperty="toPort";
				MeuObj.inputParamList={};
				var InputParamOrign=diagramJson.linkDataArray;
				for(var i=0;i<InputParamOrign.length;i++){
					if(InputParamOrign[i]["return"]){
						if(typeof(InputParamOrign[i]["to"]=='string')){
							if(MeuObj.originalMeus){
								var returnTypeMeu=MeuObj.originalMeus[InputParamOrign[i]["to"]];
								var returnTypeOpera=returnTypeMeu.operations;
								for(var j=0;j<returnTypeOpera.length;j++){
									if(returnTypeOpera[j]["@id"]==InputParamOrign[i]["operationId"]){
										InputParamOrign[i]["returnType"]=returnTypeOpera[j]["@returnType"];
									}
								}
							}
						}
						MeuObj.inputParamList[InputParamOrign[i]["return"]]=deepClone(InputParamOrign[i]);
					}
				}
			}
			 myDiagram.model = go.Model.fromJson(diagramModel);
			 if(urlMappingXmlJson["url-meu-mappings"]){
			 	var urlMeuMapping= urlMappingXmlJson["url-meu-mappings"]["url-meu-mapping"];
				if(isClass(urlMeuMapping)==='Object'){
					urlMappingData=[urlMeuMapping];
				}else if(isClass(urlMeuMapping)==='Array'){
					urlMappingData=urlMeuMapping;
				}
			 }
			oldModel=myDiagram.model.toJson();
			$('#url_mapping_table').bootstrapTable("refreshOptions",{
				data:urlMappingData
			});
			
		}
		
	})
	
	//保存create epg的name与description
	$('#saveEpg').click(function(){
		var name=$('#createEpg input[name=epgName]').val().trim();
		var description=$('#createEpg textarea[name=description]').val().trim();
		if(!name){
			$('.name-info').removeClass('hidden');
		}
		if(name){
			epgObj.epg["@name"]=name;
			epgObj.epg["@id"]=GenNonDuplicateID();
			saveEpgObj.name=name;
			saveEpgObj.description=description;
			if(!MeuObj.originalMeus){
				MeuObj.originalMeus={};
				getAjax(serverIP+'cloud/meu?type=0',function(data){
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
//						datas[i].type=definitionJson.meu.type;
						MeuObj.originalMeus[id]=datas[i];
					}
					
				},function(data){
					console.log(data);
				});
			}
			
			MeuObj.allMeu=deepClone(MeuObj.originalMeus);
			
			$('#createEpg').modal('hide');
			$('#epgXml').text(name+'.xml');
			$('#epgTable').addClass('hidden');
			$('#epgFlowchart').removeClass('hidden');
			urlMappingData=[];
			$('.nav-tabs a:first').tab('show');
			if(!isInit){
				init();
			}
			oldModel="{ \"class\": \"go.GraphLinksModel\",\n  \"nodeDataArray\": [],\n  \"linkDataArray\": []}";
			$('#url_mapping_table').bootstrapTable("refreshOptions",{
				data:urlMappingData
			});
			
		}
	});
	//当 createEpg input[name=epgName] blur的时候校验
	$('#createEpg input[name=epgName]').blur(function(){
		var value=$(this).val().trim();
		if(value){
			$('.name-info').addClass('hidden');
		}else{
			$('.name-info').removeClass('hidden');
		}
	})
	
	//tab 切换
	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		e.stopPropagation();
	  if($(e.target).attr('id')=='epgXml'){
	  	save();
	  }else if($(e.target).attr('id')=='urltab'){
	  	var nodesParent=myDiagram.nodes.Nh;
	  	if(nodesParent){
	  		var nodes=myDiagram.nodes.Nh.kd;
	  		var isWeb=false;
	  		for(var node in nodes){
	  			var meuId=nodes[node].value.data.key;
	  			for(var meu in MeuObj.originalMeus){
	  				if(meuId==meu){
	  					var type=MeuObj.originalMeus[meu].type;
	  					if(type=='webApi'){
	  						isWeb=true;
	  					}
	  				}
	  			}
	  		}
	  		if(isWeb){
	  			$(e.target).parent('li').removeClass("disabled");
	  		}else{
	  			$(e.target).parent('li').addClass("disabled");
	  			e.preventDefault();
	  		}
	  	}else{
	  		$(e.target).parent('li').addClass("disabled");
	  		e.preventDefault();
	  	}
	  }
	});
	
	
	//EPG Save操作
	$('.epgFlowchartSave').click(function(){
		saveEpgChart();
	});
	
	
	//EPG Cancel 操作
	$('.epgFlowchartCancel').click(function(){
		cancelEpgchart();
	})
	
	//选择需要的meu
	$('#meuList table tbody').on('click','tr',function(){
		var selectedAll=true;
		var selected=$(this).children('td').eq(0).children('input').get(0).checked;
		var licenseNum=$(this).children('td').eq(4).text();
		if(licenseNum==0){
			swal("Here's a message", "The MEU license has run out !");
			return;
		}
		if(selected){
			$(this).children('td').eq(0).children('input').get(0).checked=false;
			$(this).removeClass('active')
		}else{
			$(this).children('td').eq(0).children('input').get(0).checked=true;
			$(this).addClass('active')
		}
		for(var i=0;i<$('#meuList tbody tr').length;i++){
			if(!$('#meuList tbody tr').eq(i).children('td').children('input').get(0).checked){
				selectedAll=false;
			}
		}
		if(selectedAll){
			$('#allselect').get(0).checked=true;
		}else{
			$('#allselect').get(0).checked=false;
		}
	})
	
	//点击meu前面的checkbook，对该行选中
	$('#meuList table tbody').on('click','input',function(ev){
		ev.stopPropagation();
		var selectedAll=true;
		var selected=$(this).get(0).checked;
		if(selected){
			var licenseNum=$(this).parents('tr').children('td').eq(4).text();
			if(licenseNum==0){
				$(this).get(0).checked=false;
				swal("Here's a message", "The Meu available license is null !");
				return;
			}
			$(this).parents('tr').addClass('active');
		}else{
			$(this).parents('tr').removeClass('active');
		}
		
		for(var i=0;i<$('#meuList tbody tr').length;i++){
			if(!$('#meuList tbody tr').eq(i).children('td').children('input').get(0).checked){
				selectedAll=false;
			}
		}
		if(selectedAll){
			$('#allselect').get(0).checked=true;
		}else{
			$('#allselect').get(0).checked=false;
		}
	})
	
	//选中所有的meu
	$('#allselect').click(function(){
		var checked=$(this).get(0).checked;
		for(var i=0;i<$('#meuList tbody tr').length;i++){
			if($('#meuList tbody tr').eq(i).children('td').eq(4).text()==0){
				$('#meuList tbody tr').eq(i).children('td').children('input').get(0).checked=false;
			}else{
				$('#meuList tbody tr').eq(i).children('td').children('input').get(0).checked=checked;
			}
		}
	})
	
	//meu列表页关闭
	$('#meuCancel').click(function(){
		$('#meuList').addClass('hidden');
	})
	
	$('#meuClose').click(function(){
		$('#meuList').addClass('hidden');
	})
	
	//关闭link属性信息弹框
	$('.linkBtn .lineCancel').click(function(){
		$('#infoDraggable').addClass('hidden');
	});
	
	//关闭inputParam弹框
	$('#inputParamCancel').click(function(){
		$('#inputParamList').addClass('hidden');
	})
	
	$('#inputParamClose').click(function(){
		$('#inputParamList').addClass('hidden');
	})
	
	//展示inputParam return值的下拉列表
	$('.paramMore').click(function(){
		$('.paramlist').slideToggle(300);
	})
	
	//选择return值
	$('.paramlist').on('click','li',function(){
		var value=$(this).text();
		var type=$(this).attr('data_type');
		$('.paraminput input[name=variable]').val(value);
		$('.paraminput input[name=type]').val(type);
		$('.paramlist').slideToggle(300);
	})
	
	//添加inputParameter值
	$('.paramAdd').click(function(){
		var variable=$('.paraminput input[name=variable]').val().trim();
		if(variable){
			var tr=$('<tr><td><input type="checkbox"/><input type="text" value="${'+variable+'}" /></td></tr>');
			tr.appendTo($('.valueTable tbody'));
			$('.paraminput input[name=variable]').val('');
			$('.paraminput input[name=type]').val('');
		}
	})
	
	//选择要操作的inputParameter值
	$('.valueTable table tbody').on('click','tr',function(){
		var selected=$(this).children('td').eq(0).children('input[type=checkbox]').get(0).checked;
		if(selected){
			$(this).children('td').eq(0).children('input[type=checkbox]').get(0).checked=false;
			$(this).removeClass('active')
		}else{
			$(this).children('td').eq(0).children('input').get(0).checked=true;
			$(this).addClass('active')
			var othertr=$(this).siblings();
			for(var i=0;i<othertr.length;i++){
				othertr.eq(i).children('td').eq(0).children('input[type=checkbox]').get(0).checked=false;
			}
			$(this).siblings().removeClass('active');
		}
	})
	
	//删除选中的inputParameter
	$('.paramRemove').click(function(){
		var trs=$('.valueTable table tbody tr');
		for(var i=0;i<trs.length;i++){
			if(trs.eq(i).children('td').eq(0).children('input[type=checkbox]').get(0).checked){
				trs.eq(i).remove();
				return;
			}
		}
	});
	
	//Up选中的inputParameter
	$('.paramUp').click(function(){
		var selectedT;
		var trs=$('.valueTable table tbody tr');
		var index=trs.length-1;
		for(var i=0;i<trs.length;i++){
			if(trs.eq(i).children('td').eq(0).children('input[type=checkbox]').get(0).checked){
				selectedT=trs.eq(i);
				if(i==0){
					return;
				}else{
					selectedT.insertBefore(trs.eq(i-1));
				}
				return;
			}
		}
		
	})
	
	//Down选中的inputParameter
	$('.paramDown').click(function(){
		var selectedT;
		var trs=$('.valueTable table tbody tr');
		var index=trs.length-1;
		for(var i=0;i<trs.length;i++){
			if(trs.eq(i).children('td').eq(0).children('input[type=checkbox]').get(0).checked){
				selectedT=trs.eq(i);
				if(i==trs.length-1){
					return;
				}else{
					selectedT.insertAfter(trs.eq(i+1));
				}
				return;
			}
		}
		
	})
	
	
	//提交inputParameter
	$('#inputParamSure').click(function(){
		var valueArr=[];
		var trs=$('.valueTable table tbody tr');
		for(var i=0;i<trs.length;i++){
			var text=trs.eq(i).children('td').eq(0).children('input[type=text]').val();
			valueArr.push(text);
		}
		var valueStr=valueArr.join(',');
		$('.inputParam').html(valueStr);
		$('#inputParamList').addClass('hidden');
	})
	
	//MyInfo弹框可拖拽
	$("#infoDraggable").draggable();
	
	//提交选中的meu
	$('#meuSure').click(function(){
    	for(var i=0;i<$('#meuList tbody tr').length;i++){
    		var checked=$('#meuList tbody tr').eq(i).children('td').eq(0).children('input').get(0).checked;
    		if(checked){
    			var meuName=$('#meuList tbody tr').eq(i).children('td').eq(1).text();
    			var meugroup=$('#meuList tbody tr').eq(i).children('td').eq(2).text();
    			var meuvertion=$('#meuList tbody tr').eq(i).children('td').eq(3).text();
    			var meuId=meugroup+idLink+meuName+idLink+meuvertion;
    			var meuTip={
    				"Group":meugroup,
    				"vertion":meuvertion
    			};
    			meuTip=JSON.stringify(meuTip);
    			var meuInfo={
    				"key":meuId,
    				"text":meuName,
    				"tiptext":meuTip
    			};
    			 myDiagram.model.addNodeData(meuInfo);
    			 //undo
    			 if(!MeuObj.urlMappingMeu){
    			 	MeuObj.urlMappingMeu={};
    			 }
    			 MeuObj.urlMappingMeu[meuId]=MeuObj.allMeu[meuId];
    			 
    			 delete(MeuObj.allMeu[meuId]);
    		}
    	}
    	 $('#meuList').addClass('hidden');
    });
    
    //提交线上的属性值
    $('.linkBtn .lineSure').click(function(){
    	if(MeuObj.isExistedReturn){
    		return;
    	}
		
		var mode=$('#myInfo table select[name=mode]').val();
		var operationId=$('#myInfo table select[name=operationId]').val();
		var condition=$('#myInfo table input[name=condition]').val().replace(/</g,'&lt;').replace(/>/g,'&gt;');
		var linkreturn=$('#myInfo table input[name="return"]').val();
		var inputParam=$('#myInfo table .inputParam').html();
		MeuObj.selectedLine.mode=mode;
		MeuObj.selectedLine.inputParam=inputParam;
		MeuObj.selectedLine.operationId=operationId;
		MeuObj.selectedLine["return"]=linkreturn;
		MeuObj.selectedLine.condition=condition;
		$('#infoDraggable').addClass('hidden');
		
		if(linkreturn){
			var inputParamObj=deepClone(MeuObj.selectedLine);
			var returnType='';
			if(operationId){
				var toId=inputParamObj.to;
    			if(MeuObj.originalMeus[toId]){
    				var operations=MeuObj.originalMeus[toId].operations;
    				for(var i=0;i<operations.length;i++){
    					if(operations[i]["@id"]==operationId){
    						returnType=operations[i]["@returnType"];
    					}
    				}
    			}
			}
			inputParamObj["returnType"]=returnType
			if(!MeuObj.inputParamList){
				MeuObj.inputParamList={};
			}
			if(MeuObj.removeParam){
				var allLinks=myDiagram.links.Nh.kd;
				for(var key in allLinks){
					var currentLink=allLinks[key].value.data;
					var currentInputParam=currentLink.inputParam;
					var currentInputParamArr=currentInputParam.split(',');
					if(currentInputParamArr.length>0){
						for(var k=0;k<currentInputParamArr.length;k++){
							if(currentInputParamArr[k].slice(2,-1)==MeuObj.removeParam){
								currentInputParamArr[k]='${'+linkreturn+'}';
							}else if(currentInputParamArr[k].split('[')[0].slice(2,-1)==MeuObj.removeParam){
								var start=MeuObj.removeParam.length+3;
								var paramLabel=currentInputParamArr[k].substring(start);
								currentInputParamArr[k]='${'+linkreturn+'}'+paramLabel;
							}
							
						}
						currentLink.inputParam=currentInputParamArr.join(',');
					}
				}
				
				delete(MeuObj.inputParamList[MeuObj.removeParam]);
			}
			MeuObj.inputParamList[linkreturn]=inputParamObj
		}
		
    });
    
    
    //弹出inputParameter弹框
    $('.inputParam').click(function(){
		$('#inputParamList').removeClass('hidden');
		$('.paraminput input').val('');
		$('.valueTable tbody').empty();
		if(MeuObj.inputParamList){
			$('.paramMore').removeClass('hidden');
			var liStr='';
			var selectedLineReturn=MeuObj.selectedLine["return"];
			for(var key in MeuObj.inputParamList){
				if(selectedLineReturn==key){
					continue
				}else{
					liStr+='<li data_type="'+MeuObj.inputParamList[key]["returnType"]+'">'+MeuObj.inputParamList[key]["return"]+'</li>';
				}
			}
			$('.paramlist').html(liStr);
		}
		var paramValues=$(this).html();
		if(paramValues){
			var paramArr=paramValues.split(',');
			if(paramArr.length>0){
				for(var j=0;j<paramArr.length;j++){
					var tr=$('<tr><td><input type="checkbox"/><input type="text" value="'+paramArr[j]+'" /></td></tr>');
					tr.appendTo($('.valueTable tbody'));
				}
			}
		}
	});
	
	//验证return值的唯一性
	$('#myInfo input[name="return"]').blur(function(){
		var fromId=MeuObj.selectedLine.from;
		var toId=MeuObj.selectedLine.to;
		var oldReturn=MeuObj.selectedLine["return"];
		var returnName=$(this).val();
		if(MeuObj.inputParamList){
			if(returnName in MeuObj.inputParamList){
				$('.returnInfo').remove();
				if(MeuObj.inputParamList[returnName].from==fromId&&MeuObj.inputParamList[returnName].to==toId){
					MeuObj.isExistedReturn=false;
					return;
				}else{
					$('<p class="text-danger returnInfo">'+returnName+' already exist</p>').insertAfter($(this));
					MeuObj.isExistedReturn=true;
				}
			}else{
				if(oldReturn){
					if(MeuObj.inputParamList[oldReturn].from==fromId&&MeuObj.inputParamList[oldReturn].to==toId){
						MeuObj.removeParam=oldReturn;
					}
				}
				MeuObj.isExistedReturn=false;
				$('.returnInfo').remove();;
			}
		}
	});
	
	
	//UrlMapping界面的操作
	$('#url_mapping_table').bootstrapTable({
		data:urlMappingData,
		toolbar:'#btn-toolbar',
		striped: true,
		pagination: false,
		showColumns: true,
		showRefresh: false,
		clickToSelect: true,
		showToggle:false,
	    cardView: false,
	    detailView: false,
	    columns:urlMappingColumns
	});
	
	//新增URLMapping
	$('.url_mapping_add').click(function(){
		$('.select_ul').slideUp();
		$('.url-mapping-item .meuId').empty();
		if(MeuObj.urlMappingMeu){
			var meuStr='';
			for(var key in MeuObj.urlMappingMeu){
				meuStr+='<li>'+key+'</li>';
			}
			$('.url-mapping-item .meuId').html(meuStr);
		}
		
		$('#url_mapping input').val('');
		$('#url_mapping').removeClass('hidden');
		urlMappingObj.isAdd=true;
		urlMappingObj.isEdit=false;
		$('#urlMappingSure').addClass('disabled');
	})
	
	//关闭URLMapping新增页面
	$('#urlClose').click(function(){
		$('#url_mapping').addClass('hidden');
	})
	
	$('#urlMappingCancel').click(function(){
		$('#url_mapping').addClass('hidden');
	})
	
	
	// add URLMapping
	$('#urlMappingSure').click(function(){
		var url=$('.url-mapping-item input[name=url]').val().trim();
		var meu=$('.url-mapping-item input[name=meuId]').val();
		var operation=$('.url-mapping-item input[name=operationId]').val().split('(')[0].trim();
		var method=$('.url-mapping-item input[name=method]').val();
		
		if(url&&meu&&meu&&method){
			$('#url_mapping').addClass('hidden');
			if(urlMappingObj.isAdd){
				urlMappingData.unshift({
					"@url":url,
					"@dest":meu,
					"@operationId":operation,
					"@method":method,
				});
			}else{
				urlMappingObj.editData["@url"]=url;
				urlMappingObj.editData["@dest"]=meu;
				urlMappingObj.editData["@operationId"]=operation;
				urlMappingObj.editData["@method"]=method;
				urlMappingData[urlMappingObj.editIndex]=urlMappingObj.editData;
			}
			
			$('#url_mapping_table').bootstrapTable("refreshOptions",{
				data:urlMappingData
			})
		}
	})
	
	//urlMapping add btn ok available or not
	$('#url_mapping input[name=url]').keyup(function(){
		var url=$(this).val().trim();
		var meu=$('.url-mapping-item input[name=meuId]').val();
		var method=$('.url-mapping-item input[name=method]').val();
		if(url&&meu&&meu&&method){
			$('#urlMappingSure').removeClass('disabled');
		}else{
			$('#urlMappingSure').addClass('disabled');
		}
	})
	
	
	//点击add UrlMapping 下拉列表
	$(".select_box").click(function(){
		$(this).children('.select_ul').slideToggle();
	})
	
	$(".select_box").on('click','.select_ul li',function(){
		var val=$(this).text();
		if($(this).parent().attr('id')=="url_meuId"){
			$('.url-mapping-item .operationId').empty();
			var operation=MeuObj.urlMappingMeu[val].operations;
			if(operation.length>0){
				var operationStr='';
				for(var i=0;i<operation.length;i++){
					operationStr+='<li>'+operation[i]["@id"]+'&nbsp;(&nbsp;'+operation[i]["@methodName"]+'&nbsp;)&nbsp;</li>';
				}
				$('.url-mapping-item .operationId').html(operationStr);
			}
			$('#url_mapping input[name=operationId').val('');
		}
		$(this).parents('.select_ul').siblings('input').val(val);
		
		var url=$('.url-mapping-item input[name=url]').val().trim();
		var meu=$('.url-mapping-item input[name=meuId]').val();
		var method=$('.url-mapping-item input[name=method]').val();
		if(url&&meu&&meu&&method){
			$('#urlMappingSure').removeClass('disabled');
		}else{
			$('#urlMappingSure').addClass('disabled');
		}
	})
	
	
	//删除URLMapping数据
	$('.url_mapping_remove').click(function(){
		var deleteData=$('#url_mapping_table').bootstrapTable("getSelections");
//		var deleteData=$('#url_mapping_table').bootstrapTable("getSelections")[0];
		if(deleteData.length==0){
			return;
		}
		var allData=$('#url_mapping_table').bootstrapTable("getData");
		for(var j=0;j<deleteData.length;j++){
			for(var i=0;i<allData.length;i++){
				var sameData=true;
				for(var key in deleteData[j]){
					if(allData[i][key]!==deleteData[j][key]){
						sameData=false;
					}
				}
				if(sameData){
					allData.splice(i,1);
					continue
				}
			}
		}
		
		$('#url_mapping_table').bootstrapTable("refreshOptions",{
			data:allData
		})
	});
	
	//选择编辑的URLMapping
	$('#url_mapping_table').on('click','tr',function(){
		var index=$(this).index();
		urlMappingObj.editIndex=index;
	})
	
	
	//编辑URLMapping
	$('#url_mapping_table').on('click','.url_mapping_edit',function(){
		var index=$(this).parents('tr').index();
		urlMappingObj.editData=$('#url_mapping_table').bootstrapTable("getData")[index];
		$('.select_ul').slideUp();
		if(!urlMappingObj.editData){
			return;
		}
		$('.url-mapping-item .meuId').empty();
		if(MeuObj.originalMeus){
			var meuStr='';
			for(var key in MeuObj.urlMappingMeu){
				meuStr+='<li>'+key+'</li>';
			}
			$('.url-mapping-item .meuId').html(meuStr);
		}
		$('#url_mapping input').val('');
		$('.url-mapping-item input[name=url]').val(urlMappingObj.editData["@url"]);
		$('.url-mapping-item input[name=operationId]').val(urlMappingObj.editData["@operationId"]);
		$('.url-mapping-item input[name=meuId]').val(urlMappingObj.editData["@dest"]);
		$('.url-mapping-item input[name=method]').val(urlMappingObj.editData["@method"]);
		$('#url_mapping').removeClass('hidden');
		$('.url-mapping-item .operationId').empty();
		var operation=MeuObj.urlMappingMeu[urlMappingObj.editData["@dest"]].operations;
		if(operation.length>0){
			var operationStr='';
			for(var i=0;i<operation.length;i++){
				if(operation[i]["@id"]==urlMappingObj.editData["@operationId"]){
					$('.url-mapping-item input[name=operationId]').val(operation[i]["@id"]+'('+operation[i]["@methodName"]+')');
				}
				operationStr+='<li>'+operation[i]["@id"]+'&nbsp;(&nbsp;'+operation[i]["@methodName"]+'&nbsp;)&nbsp;</li>';
			}
			$('.url-mapping-item .operationId').html(operationStr);
		}
		urlMappingObj.isAdd=false;
		urlMappingObj.isEdit=true;
		$('#urlMappingSure').removeClass('disabled');
	});
	
	
	$('#navParent li').off('mousedown').on('mousedown',function(ev){
		if(!myDiagram){
			return;
		}else{
			ev.stopPropagation();
			var newModel=myDiagram.model.toJson();
			if(oldModel!==newModel){
				flag=false;
				$('#saveReminder').modal('show');
			}else{
				flag=true;
			}
		}
	})
	
	$('.leaveEpgCancel').click(function(ev){
		$('#saveReminder').modal('hide');
		$('.modal-backdrop').remove();
		cancelEpgchart();
	})
	
	
	$('.leaveEpgSave').click(function(){
		$('#saveReminder').modal('hide');
		$('.modal-backdrop').remove();
		saveEpgChart();
	})
	
//	跳转meu 页面
	$('.cloudMeu').click(function(ev){
		if(!myDiagram){
			return;
		}else{
			ev.stopPropagation();
			var newModel=myDiagram.model.toJson();
			if(oldModel!==newModel){
				flag=false;
				$('#saveReminder').modal('show');
			}else{
				flag=true;
				showRight('CloudMeu');
				menuActive($('.CloudMeu'));
			}
		}
	})
	
	function saveEpgChart(){
		$('#loadingbg').show();
		save();
		var postUrl=urlMappingObj.postUrlMapping;
		if(urlMappingData.length>0){
			postUrl["url-meu-mappings"]["url-meu-mapping"]=[];
			var urlArr=postUrl["url-meu-mappings"]["url-meu-mapping"];
			for(var i=0;i<urlMappingData.length;i++){
				var urlMappingItem={};
				if(urlMappingData[i]["@url"]){
					urlMappingItem["@url"]=urlMappingData[i]["@url"];
				}
				if(urlMappingData[i]["@dest"]){
					urlMappingItem["@dest"]=urlMappingData[i]["@dest"];
				}
				if(urlMappingData[i]["@operationId"]){
					urlMappingItem["@operationId"]=urlMappingData[i]["@operationId"];
				}
				if(urlMappingData[i]["@method"]){
					urlMappingItem["@method"]=urlMappingData[i]["@method"];
				}
				urlArr.push(urlMappingItem);
			}
			var urlMappingXml=json2xml(postUrl);
			urlMappingXml='<?xml version="1.0" encoding="UTF-8"?>\n'+urlMappingXml;
			var formatXml = vkbeautify.xml(urlMappingXml);//格式化xml
			saveEpgObj.urlMappings.definition=formatXml;
		}else{
			saveEpgObj.urlMappings.definition=null;
		}
		
		
		if(MeuObj.isEdit){
			saveEpgObj.id=MeuObj.editData.id;
			var saveEpgStr=JSON.stringify(saveEpgObj);
			ajaxPutReauest('cloud/epg',saveEpgStr,function(data){
				data=JSON.parse(data);
				if(data.code==0){
					$('#loadingbg').hide();
					swal("Good~", "Edit EPG Success !", "success");
					$('#epgTable').removeClass('hidden');
					$('#epgFlowchart').addClass('hidden');
					saveEpgObj={//用于提交create的epg数据
						"name":'',
						"description":'',
						"definition":'',
						"urlMappings":{
							"definition":""
						}
					};
					epgObj={//用于描述流程图的xml的json对象
						"epg":{
							"@id":'',
							"@name":'',
							"meus":{},
							"events":{},
							"topic-meu-mappings":{},
						}
					};
					urlMappingObj={
						isAdd:false,
						isEdit:false,
						editData:null,
						editIndex:-1,
						postUrlMapping:{
							"url-meu-mappings":{
								"url-meu-mapping":[
									
								]
							}
						}
					};
					
					MeuObj.selectedLine=null;
					MeuObj.inputParamList=null;
					MeuObj.isExistedReturn=null;
					MeuObj.removeParam=null;
					MeuObj.isEdit=false;
					MeuObj.editData=null;
					MeuObj.urlMappingMeu=null;
					
					myDiagram.clear();
					myPalette.clearSelection();
					$('#infoDraggable').addClass('hidden');
					$('#tb_table').bootstrapTable('refresh');
					$('#btn_delete').addClass('disabled');
					$('#btn_edit').addClass('disabled');
				}else{
					$('#loadingbg').hide();
					swal("Error~", "Create EPG Failed !", "error");
					
				}
				oldModel="{ \"class\": \"go.GraphLinksModel\",\n  \"linkFromPortIdProperty\": \"fromPort\",\n  \"linkToPortIdProperty\": \"toPort\",\n  \"nodeDataArray\": [],\n  \"linkDataArray\": []}";
			})
		}else{
			var saveEpgStr=JSON.stringify(saveEpgObj);
			getResultPost('cloud/epg',saveEpgStr,function(data){
				data=JSON.parse(data);
				if(data.code==0){
					$('#loadingbg').hide();
					swal("Good~", "Create EPG Success !", "success");
					$('#epgTable').removeClass('hidden');
					$('#epgFlowchart').addClass('hidden');
					saveEpgObj={//用于提交create的epg数据
						"name":'',
						"description":'',
						"definition":'',
						"urlMappings":{
							"definition":""
						}
					};
					epgObj={//用于描述流程图的xml的json对象
						"epg":{
							"@id":'',
							"@name":'',
							"meus":{},
							"events":{},
							"topic-meu-mappings":{},
						}
					};
					urlMappingObj={
						isAdd:false,
						isEdit:false,
						editData:null,
						editIndex:-1,
						postUrlMapping:{
							"url-meu-mappings":{
								"url-meu-mapping":[
									
								]
							}
						}
					};
					
					MeuObj.selectedLine=null;
					MeuObj.inputParamList=null;
					MeuObj.isExistedReturn=null;
					MeuObj.removeParam=null;
					MeuObj.isEdit=false;
					MeuObj.editData=null;
					MeuObj.urlMappingMeu=null;
					
					myDiagram.clear();
					myPalette.clearSelection();
					$('#infoDraggable').addClass('hidden');
					$('#tb_table').bootstrapTable('refresh');
				}else{
					$('#loadingbg').hide();
					swal("Error~", "Create EPG Failed !", "error");
				}
				oldModel="{ \"class\": \"go.GraphLinksModel\",\n  \"nodeDataArray\": [],\n  \"linkDataArray\": []}";
			})
		}
	}
	
	
	function cancelEpgchart(){
		if(MeuObj.isEdit){
			oldModel="{ \"class\": \"go.GraphLinksModel\",\n  \"linkFromPortIdProperty\": \"fromPort\",\n  \"linkToPortIdProperty\": \"toPort\",\n  \"nodeDataArray\": [],\n  \"linkDataArray\": []}";
		}else{
			oldModel="{ \"class\": \"go.GraphLinksModel\",\n  \"nodeDataArray\": [],\n  \"linkDataArray\": []}";
		}
		$('#epgTable').removeClass('hidden');
		$('#epgFlowchart').addClass('hidden');
		$('#infoDraggable').addClass('hidden');
		saveEpgObj={//用于提交create的epg数据
			"name":'',
			"description":'',
			"definition":'',
			"urlMappings":{
				"definition":""
			}
		};
		epgObj={//用于描述流程图的xml的json对象
			"epg":{
				"@id":'',
				"@name":'',
				"meus":{},
				"events":{},
				"topic-meu-mappings":{},
			}
		};
		urlMappingObj={
			isAdd:false,
			isEdit:false,
			editData:null,
			editIndex:-1,
			postUrlMapping:{
				"url-meu-mappings":{
					"url-meu-mapping":[
						
					]
				}
			}
		};
		
		MeuObj.selectedLine=null;
		MeuObj.inputParamList=null;
		MeuObj.isExistedReturn=null;
		MeuObj.removeParam=null;
		MeuObj.isEdit=false;
		MeuObj.editData=null;
		MeuObj.urlMappingMeu=null;
		myDiagram.clear();
		myPalette.clearSelection();
	}
	
	
	
})


//初始化表格里meu的展示
function cloudEpgMeus(value, row, index){
	var allmeus=value;
	var meuStr='';
	if(allmeus&&allmeus.length>0){
		for(var i=0;i<allmeus.length;i++){
			meuStr+='<p>'+allmeus[i].group+idLink+allmeus[i].name+idLink+allmeus[i].version+'</p>';
		}
	}else{
		meuStr='-'
	}
	return meuStr;
}

//当鼠标在节点上方时，使节点上的所有端口都可见
function showPorts(node, show){
	var diagram = node.diagram;
	if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
	node.ports.each(function(port){
		port.stroke = (show ? "white" : null);
	})
};

//获取meu列表
function getMeuList(){
	$('#meuList').removeClass('hidden');
	$('#meuList .meu-table tbody').empty();
	if(MeuObj.originalMeus){
		for(var key in MeuObj.allMeu){
			var licenseNum=0;
			if(MeuObj.allMeu[key].license){
				licenseNum=MeuObj.allMeu[key].license.availableNum;
			}
			
			var tr=$('<tr><td><input type="checkbox" /></td><td>'+MeuObj.allMeu[key].name+'</td><td>'+MeuObj.allMeu[key].group+'</td><td>'+MeuObj.allMeu[key].version+'</td><td>'+licenseNum+'</td></tr>')
			tr.appendTo($('#meuList .meu-table tbody'));
		}
	}
};

function gettip(getNode){
	return getNode.tiptext.replace(/",/g,'"\n').replace(/:/g,' ： ').replace(/{/g,'').replace(/}/,'').replace(/\\"/g,'"').replace(/;/g,'"\n\n').replace(/"""/g,'"').replace(/""/g,'"').replace(/}/g,'');	
};