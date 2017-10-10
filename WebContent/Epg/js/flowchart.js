//var epgid="6491184251fd427895998c7a96066f6a";
//$(function(){
var epgObj={
	allMeus:null,
	diagramModel:null,
	workMeu:null,
	errorMeu:null,
	monitEvents:null,
	timer:null,
	executionId:null,
	epgId:null,
};
function getMeus(epgid){
	getResultGet1('meu?epgId='+epgid,function(data){
		data=JSON.parse(data);
		if(data.code==0){
			var datas=data.rows;
			epgObj.allMeus={};
			for(var i=0;i<datas.length;i++){
				epgObj.allMeus[datas[i]["id"]]=deepClone(datas[i]);
			}
		}
	})
};
function getXml(epgid){
	epgObj.diagramModel={};
	getResultGet1('epg?epgId='+epgid,function(data){
		data=JSON.parse(data);
		if(data.code==0){
			var datas=data.rows;
			if(datas.length>0){
				datas=datas[0];
				var epgDefinition=datas.epgDefinition;
				epgDefinition=epgDefinition.replace(/\\?&quot;/g,'');
				var definitionObj=parseXMLObj(epgDefinition);
				var definitionJson=xml2json(definitionObj);
				definitionJson="{"+definitionJson.substring(11);
				definitionJson=eval("(" + definitionJson + ")");
				var events=definitionJson["epg"]["events"]["event"];
				var meus=definitionJson["epg"]["meus"]["meu"];
				var nodeList=[];
				var linkList=[];
				var destContion=0;
				var endCount=0;
				var circleCount=0;
				var invoke='meu/invokeByEvent/';
				for(var i=0;i<meus.length;i++){
					var keyId=meus[i]["@id"];
					var node={
						"key":keyId,
						"text":epgObj.allMeus[keyId]?epgObj.allMeus[keyId]["name"]:""
					};
					nodeList.push(node);
					if(epgObj.allMeus[keyId]){
						if("reference" in epgObj.allMeus[keyId]){
							var referenceArr=epgObj.allMeus[keyId]["reference"];
//							console.log(referenceArr);
							for(var k=0;k<referenceArr.length;k++){
								if(referenceArr[k]["meuId"]){
									var referenceLink={
										"from":keyId,
										"to":referenceArr[k]["meuId"],
										"dash":[4,6],
										"width":3,
									}
									linkList.push(referenceLink)
									if(epgObj.monitEvents){
										for(var t=0;t<epgObj.monitEvents.length;t++){
											var currentMonitEvent=epgObj.monitEvents[t];
											if(currentMonitEvent["sourceId"]&&currentMonitEvent["destId"]){
												if(currentMonitEvent["sourceId"]==keyId&&currentMonitEvent["destId"]==referenceArr[k]["meuId"]){
													if(currentMonitEvent["sourceTopic"]&&currentMonitEvent["sourceTopic"].indexOf(invoke)>-1){
														var hasInvoke=false;
														for(var x=0;x<epgObj.monitEvents.length;x++){
															var anotherMonitEvent=epgObj.monitEvents[x];
															if(anotherMonitEvent["destTopic"]==currentMonitEvent["sourceTopic"]&&anotherMonitEvent["sourceId"]==currentMonitEvent["destId"]&&anotherMonitEvent["destId"]==currentMonitEvent["sourceId"]){
																referenceLink["color"]="green";
																hasInvoke=true;
																break;
															}
														}
														if(!hasInvoke){
															referenceLink["color"]="orange";
														}
													}else{
														referenceLink["color"]="green";
													}
												}
											}
										}
									}
								}
							}
						}
					}
					
				}
				
				
				for(var j=0;j<events.length;j++){
					var currentEvent=events[j];
					var linkObj={};
					if(!currentEvent["@source"]){
						nodeList.push({
							"key":"start",
							"text":"Start",
							"fig":"ellipse"
						});
						linkObj["from"]="start";
					}else{
						linkObj["from"]=currentEvent["@source"];
					}
					if(!currentEvent["@dest"]){
						if(!currentEvent["dest"]){
							if(!currentEvent["@condition"]){
								nodeList.push({
									"key":"End",
									"text":"End",
									"fig":"ellipse"
								});
								linkObj["to"]="End";
								if(epgObj.monitEvents){
									for(var t=0;t<epgObj.monitEvents.length;t++){
										var currentMonitEvent=epgObj.monitEvents[t];
										if(!currentMonitEvent["destId"]&&currentMonitEvent["sourceId"]==linkObj["from"]){
											linkObj["color"]="green";
										}
									}
								}
							}else{
								var hasSameEnd=false;
								for(var m=0;m<nodeList.length;m++){
									if(nodeList[m]["text"]=="End"&&nodeList[m]["condition"]==currentEvent["@condition"]){
//										linkObj["to"]=nodeList[m]["key"];
										hasSameEnd=true;
										break;
									}
								}
								
								if(!hasSameEnd){
									var endKey=++endCount+'End';
									nodeList.push({
										"key":endKey,
										"text":"End",
										"fig":"ellipse",
										"condition":currentEvent["@condition"]
									});
//									linkObj["to"]=endKey;
								}
								
							}
							
						}else{
							var diamond=++destContion+"diamond";
							nodeList.push({
								"key":diamond,
								"text":"",
								"fig":"diamond",
								"category":"nodeMap1"
							});
							linkObj["to"]=diamond;
							for(var k=0;k<currentEvent["dest"].length;k++){
								if(currentEvent["dest"][k]["@id"]){
									var hasNodeEnd=false;
									var haseventEnd=false;
									for(var n=0;n<nodeList.length;n++){
										if(nodeList[n]["text"]=="End"&&nodeList[n]["condition"]==currentEvent["dest"][k]["@condition"]){
											var circleKey=++circleCount+"circle";
											nodeList.push({
												"key":circleKey,
												"text":"",
												"fig":"circle",
												"category":"nodeMap1"
											});
											var linkdia={
												"from":diamond,
												"to":circleKey
											};
											var linkCirMeu={
												"from":circleKey,
												"to":currentEvent["dest"][k]["@id"]
											};
											var linkCirEnd={
												"from":circleKey,
												"to":nodeList[n]["key"]
											};
											
											linkList.push(linkdia);
											linkList.push(linkCirMeu);
											linkList.push(linkCirEnd);
											
											if(epgObj.monitEvents){
												for(var t=0;t<epgObj.monitEvents.length;t++){
													var currentMonitEvent=epgObj.monitEvents[t];
													if(currentMonitEvent["sourceId"]&&currentMonitEvent["destId"]){
														if(currentMonitEvent["sourceId"]==linkObj["from"]&&currentMonitEvent["destId"]==currentEvent["dest"][k]["@id"]){
															if(currentMonitEvent["sourceTopic"]&&currentMonitEvent["sourceTopic"].indexOf(invoke)>-1){
																var hasInvoke=false;
																for(var x=0;x<epgObj.monitEvents.length;x++){
																	var anotherMonitEvent=epgObj.monitEvents[x];
																	if(anotherMonitEvent["destTopic"]==currentMonitEvent["sourceTopic"]&&anotherMonitEvent["sourceId"]==currentMonitEvent["destId"]&&anotherMonitEvent["destId"]==currentMonitEvent["sourceId"]){
																		linkObj["color"]="green";
																		linkdia["color"]="green";
																		linkCirMeu["color"]="green";
																		linkCirEnd["color"]="green";
																		nodeList[n]["color"]="green";
																		hasInvoke=true;
																		break;
																	}
																}
																if(!hasInvoke){
																	linkObj["color"]="orange";
																	linkdia["color"]="orange";
																	linkCirMeu["color"]="orange";
																}
															}else{
																linkObj["color"]="green";
																linkdia["color"]="green";
																linkCirMeu["color"]="green";
																linkCirEnd["color"]="green";
																nodeList[n]["color"]="green";
															}
														}
													}
												}
											}
											
											hasNodeEnd=true;
											break;
										}
									}
									if(!hasNodeEnd){
										for(var t=0;t<events.length;t++){
											if(events[t]["@dest"]==""&&events[t]["@condition"]==currentEvent["dest"][k]["@condition"]){
//												console.log(222);
												var endKey=++endCount+'End';
												var circleKey=++circleCount+"circle";
												var conEnd={
													"key":endKey,
													"text":"End",
													"fig":"ellipse",
													"condition":events[t]["@condition"]
												};
												var linkdia={
													"from":diamond,
													"to":circleKey
												};
												var linkCirMeu={
													"from":circleKey,
													"to":currentEvent["dest"][k]["@id"]
												};
												var linkCirEnd={
													"from":circleKey,
													"to":endKey
												};
												var circleNode={
													"key":circleKey,
													"text":"",
													"fig":"circle",
													"category":"nodeMap1"
												};
												nodeList.push(conEnd);
												linkList.push(linkdia);
												linkList.push(linkCirMeu);
												linkList.push(linkCirEnd);
												nodeList.push(circleNode);
												if(epgObj.monitEvents){
													for(var t=0;t<epgObj.monitEvents.length;t++){
														var currentMonitEvent=epgObj.monitEvents[t];
														if(currentMonitEvent["sourceId"]&&currentMonitEvent["destId"]){
															if(currentMonitEvent["sourceId"]==linkObj["from"]&&currentMonitEvent["destId"]==currentEvent["dest"][k]["@id"]){
																if(currentMonitEvent["sourceTopic"]&&currentMonitEvent["sourceTopic"].indexOf(invoke)>-1){
																	var hasInvoke=false;
																	for(var x=0;x<epgObj.monitEvents.length;x++){
																		var anotherMonitEvent=epgObj.monitEvents[x];
																		if(anotherMonitEvent["destTopic"]==currentMonitEvent["sourceTopic"]&&anotherMonitEvent["sourceId"]==currentMonitEvent["destId"]&&anotherMonitEvent["destId"]==currentMonitEvent["sourceId"]){
																			linkdia["color"]="green";
																			linkCirMeu["color"]="green";
																			linkCirEnd["color"]="green";
																			linkObj["color"]="green";
																			conEnd["color"]="green";
																			hasInvoke=true;
																			break;
																		}
																	}
																	if(!hasInvoke){
																		linkdia["color"]="orange";
																		linkCirMeu["color"]="orange";
																		linkObj["color"]="orange";
																	}
																}else{
																	linkdia["color"]="green";
																	linkCirMeu["color"]="green";
																	linkCirEnd["color"]="green";
																	linkObj["color"]="green";
																	conEnd["color"]="green";
																}
																
															}
														}
													}
												}
									
												haseventEnd=true;
												break;
											}
										}
									}
									if(!hasNodeEnd&&!haseventEnd){
										var diaMeu={
											"from":diamond,
											"to":currentEvent["dest"][k]["@id"]
										};
										linkList.push(diaMeu);	
										if(epgObj.monitEvents){
											for(var t=0;t<epgObj.monitEvents.length;t++){
												var currentMonitEvent=epgObj.monitEvents[t];
												if(currentMonitEvent["sourceId"]&&currentMonitEvent["destId"]){
													if(currentMonitEvent["sourceId"]==linkObj["from"]&&currentMonitEvent["destId"]==currentEvent["dest"][k]["@id"]){
														if(currentMonitEvent["sourceTopic"]&&currentMonitEvent["sourceTopic"].indexOf(invoke)>-1){
															var hasInvoke=false;
															for(var x=0;x<epgObj.monitEvents.length;x++){
																var anotherMonitEvent=epgObj.monitEvents[x];
																if(anotherMonitEvent["destTopic"]==currentMonitEvent["sourceTopic"]&&anotherMonitEvent["sourceId"]==currentMonitEvent["destId"]&&anotherMonitEvent["destId"]==currentMonitEvent["sourceId"]){
																	diaMeu["color"]="green";
																	linkObj["color"]="green";
																	hasInvoke=true;
																	break;
																}
															}
															if(!hasInvoke){
																linkObj["color"]="orange";
																diaMeu["color"]="orange";
															}
														}else{
															diaMeu["color"]="green";
															linkObj["color"]="green";
														}
													}
												}
											}
										}
									}
								}else{
									var hasSameEnd=false;
									for(var m=0;m<nodeList.length;m++){
										if(nodeList[m]["text"]=="End"&&nodeList[m]["condition"]==currentEvent["dest"][k]["@condition"]){
											var linkEnd={
												"from":diamond,
												"to":nodeList[m]["key"]
											};
											linkList.push(linkEnd);
											if(epgObj.monitEvents){
												for(var t=0;t<epgObj.monitEvents.length;t++){
													var currentMonitEvent=epgObj.monitEvents[t];
													if(!currentMonitEvent["destId"]&&currentMonitEvent["sourceId"]){
														if(currentMonitEvent["sourceId"]==linkObj["from"]){
															linkEnd['color']="green";
															nodeList[m]["color"]="green";
														}
													}
												}
											}
											hasSameEnd=true;
											break;
										}
									}
									if(!hasSameEnd){
										var endKey=++endCount+'End';
										var nodeDestEnd={
											"key":endKey,
											"text":"End",
											"fig":"ellipse",
											"condition":currentEvent["dest"][k]["@condition"]
										};
										var linkDestEnd={
											"from":diamond,
											"to":endKey
										};
										nodeList.push(nodeDestEnd);
										linkList.push(linkDestEnd);
										if(epgObj.monitEvents){
											for(var t=0;t<epgObj.monitEvents.length;t++){
												var currentMonitEvent=epgObj.monitEvents[t];
												if(!currentMonitEvent["destId"]&&currentMonitEvent["sourceId"]){
													if(currentMonitEvent["sourceId"]==linkObj["from"]){
														linkDestEnd['color']="green";
														nodeDestEnd["color"]="green";
													}
												}
											}
										}
										
									}
								}
							}
						}
					}else{
						linkObj["to"]=currentEvent["@dest"];
					}
					linkList.push(linkObj);
					if(epgObj.monitEvents){
						for(var t=0;t<epgObj.monitEvents.length;t++){
							var currentMonitEvent=epgObj.monitEvents[t];
							if(!currentMonitEvent["sourceId"]&&currentMonitEvent["destId"]){
								if(linkObj["from"]=='start'&&currentMonitEvent["destId"]==linkObj["to"]){
									linkObj["color"]="green";
								}
							}else if(currentMonitEvent["sourceId"]&&currentMonitEvent["destId"]){
								if(currentMonitEvent["sourceId"]==linkObj["from"]&&currentMonitEvent["destId"]==linkObj["to"]){
									if(currentMonitEvent["sourceTopic"]&&currentMonitEvent["sourceTopic"].indexOf(invoke)>-1){
										var hasInvoke=false;
										for(var x=0;x<epgObj.monitEvents.length;x++){
											var anotherMonitEvent=epgObj.monitEvents[x];
											if(anotherMonitEvent["destTopic"]==currentMonitEvent["sourceTopic"]&&anotherMonitEvent["sourceId"]==currentMonitEvent["destId"]&&anotherMonitEvent["destId"]==currentMonitEvent["sourceId"]){
												linkObj["color"]="green";
												hasInvoke=true;
												break;
											}
										}
										if(!hasInvoke){
											linkObj["color"]="orange";
										}
									}else{
										linkObj["color"]="green";
									}
									
								}
							}
						}
					}
				}
//				epgObj.diagramModel.nodeKeyProperty="key";
				epgObj.diagramModel.nodeDataArray=nodeList;
				epgObj.diagramModel.linkDataArray=linkList;
				
			}
		}
	})
};

function init(){
	myDiagram.div=null;
	var $ = go.GraphObject.make;
	myDiagram =
		$(go.Diagram, "myDiagram", {
			initialAutoScale: go.Diagram.Uniform,
			contentAlignment: go.Spot.Center
		});
	myDiagram.layout =
		$(go.TreeLayout, {
			angle: 0,
			layerSpacing: 80,
		});
	myDiagram.nodeTemplate =
		$(go.Node, "Auto",
			$(go.Shape, "RoundedRectangle", {
					fill: $(go.Brush, go.Brush.Linear, {
						0: "white",
						1: "#ccc"
					}),
					stroke: "#bbb",
					strokeWidth: 2,
					figure: "Rectangle"
				},
				new go.Binding("figure", "fig"),
				new go.Binding('location', 'loc', go.Point.Parse),
				new go.Binding("size", "size"),
				new go.Binding("fill", "color")
			),
			$(go.TextBlock, {
					font: "bold 14pt helvetica, bold arial, sans-serif",
					margin: 20
				},
				new go.Binding("text", "text"))
		);
	myDiagram.nodeTemplateMap.add("nodeMap1",
		$(go.Node, "Auto",
			$(go.Shape, "RoundedRectangle", {
					fill: $(go.Brush, go.Brush.Linear, {
						0: "white",
						1: "#ccc"
					}),
					stroke: "#bbb",
					figure: "diamond"
				},
				new go.Binding("figure", "fig"),
				new go.Binding('location', 'loc', go.Point.Parse),
				new go.Binding("fill", "color")
			),
			$(go.TextBlock, {
					font: "bold 10pt helvetica, bold arial, sans-serif",
					margin: 8
				},
				new go.Binding("text", "text"))

		));
	myDiagram.linkTemplate =
		$(go.Link, {
				routing: go.Link.AvoidsNodes,
				corner: 0
			},
			new go.Binding("points").makeTwoWay(),
			$(go.Shape, {
				isPanelMain: true,
				stroke: "#bbb",
			},
         	new go.Binding("strokeDashArray", "dash"),
         	new go.Binding("strokeWidth", "width")
			),
			$(go.Shape, {
				toArrow: "standard",
				stroke: "#bbb" //if value is null --can not have shadows
			}),
			
			$(go.TextBlock, {
					textAlign: "center",
					segmentOffset: new go.Point(0, -10),
					font: "14pt helvetica, arial, sans-serif",
					stroke: "#ff0000",
					margin: 4
				},
				new go.Binding("text", "text")
			)
		);
		myDiagram.model = go.Model.fromJson(epgObj.diagramModel);
}

function getWorkMeus(executionId){
	epgObj.workMeu={};
	getResultGet1('epg/executionrecord/detail?executionId='+executionId,function(data){
//		console.log(data);
		data=JSON.parse(data);
		console.log(data);
		if(data.code==0){
			var datas=data.rows;
//			console.log('workMeu');
//			console.log(datas);
			for(var i=0;i<datas.length;i++){
				epgObj.workMeu[datas[i]["meuId"]]=deepClone(datas[i]);
			}
		}
	})
};

function getErrorMeus(executionId){
	epgObj.errorMeu={};
	getResultGet1('exception?executionId='+executionId,function(data){
		data=JSON.parse(data);
		console.log(data);
		if(data.code==0){
			var datas=data.rows;
			for(var i=0;i<datas.length;i++){
				epgObj.errorMeu[datas[i]["meuId"]]=deepClone(datas[i]);
			}
		}
	})
};

function getMonitDatas(executionId){
	epgObj.monitEvents=[];
	getResultGet1('event/monitor?executionId='+executionId,function(data){
		data=JSON.parse(data);
		if(data.code==0){
			epgObj.monitEvents=data.rows;
//			console.log('monitEvents');
//			console.log(epgObj.monitEvents);
		}
	})
}

function addColor(executionId){
	console.log(executionId);
	getWorkMeus(executionId);
	getErrorMeus(executionId);
	console.log(epgObj.diagramModel);
	var colorNodeList=epgObj.diagramModel.nodeDataArray;
	if(!colorNodeList){
		return;
	}
	for(var i=0;i<colorNodeList.length;i++){
		if(colorNodeList[i]["text"]=="Start"||colorNodeList[i]["text"]=="End"||colorNodeList[i]["fig"]=="diamond"||colorNodeList[i]["fig"]=="circle"){
			if(colorNodeList[i]["text"]=="Start"||colorNodeList[i]["text"]=="End"){
				if(epgObj.monitEvents.length>0){
					for(var k=0;k<epgObj.monitEvents.length;k++){
						if(!epgObj.monitEvents[k]["sourceId"]&&colorNodeList[i]["text"]=="Start"){
							colorNodeList[i]["color"]="green";
							break
						}
						if(!epgObj.monitEvents[k]["destId"]&&colorNodeList[i]["text"]=="End"&&!colorNodeList[i]["condition"]){
							colorNodeList[i]["color"]="green";
							break
						}
					}
				}
			}
			continue;
		}else{
			if(colorNodeList[i]["key"] in epgObj.workMeu&&!epgObj.errorMeu[colorNodeList[i]["key"]]){
				colorNodeList[i]["color"]="green";
				var workData=epgObj.workMeu[colorNodeList[i]["key"]];
				var nodeTip={
					"Container ID":workData.containerId,
					"MEU ID":workData.meuId,
					"Execution ID":workData.executeId,
					"Execution Time":workData.executionTime+'ms',
					"Operation ID":workData.operationId
				};
				var nodeTipStr=JSON.stringify(nodeTip);
				colorNodeList[i]["tiptext"]=nodeTipStr;
				colorNodeList[i]["category"]="nodeMap2";
			}else if(!epgObj.workMeu[colorNodeList[i]["key"]]&&colorNodeList[i]["key"] in epgObj.errorMeu){
				colorNodeList[i]["color"]="red";
				var ErrorData=epgObj.errorMeu[colorNodeList[i]["key"]];
				console.log('colorred',JSON.stringify(colorNodeList[i]));
				console.log(111);
				var nodeTip={
					"Container ID":ErrorData.containerId,
					"MEU ID":ErrorData.meuId,
					"Execution ID":ErrorData.executeId,
					"Msg":ErrorData.shortMsg
				};
				var nodeTipStr=JSON.stringify(nodeTip);
				colorNodeList[i]["tiptext"]=nodeTipStr;
				colorNodeList[i]["category"]="nodeMap3";
				console.log(colorNodeList[i]);
			}else if(colorNodeList[i]["key"] in epgObj.workMeu&&colorNodeList[i]["key"] in epgObj.errorMeu){
				colorNodeList[i]["color"]="orange";
				var workData=epgObj.workMeu[colorNodeList[i]["key"]];
				var ErrorData=epgObj.errorMeu[colorNodeList[i]["key"]];
				var nodeTip={
					"Container ID":workData.containerId,
					"MEU ID":workData.meuId,
					"Execution ID":workData.executeId,
					"Execution Time":workData.executionTime+'ms',
					"Operation ID":workData.operationId,
					"Msg":ErrorData.shortMsg
				};
				var nodeTipStr=JSON.stringify(nodeTip);
				colorNodeList[i]["tiptext"]=nodeTipStr;
				colorNodeList[i]["category"]="nodeMap2";
			}else if(epgObj.monitEvents.length>0){
				for(var k=0;k<epgObj.monitEvents.length;k++){
					if(epgObj.monitEvents[k]["sourceId"]==colorNodeList[i]["key"]){
						colorNodeList[i]["color"]="green";
						break
					}
				}
			}
		}
	}
	
};

function initMonit(){
	myDiagram.div=null;
	var $ = go.GraphObject.make;
	myDiagram =
		$(go.Diagram, "myDiagram",{
			initialAutoScale: go.Diagram.Uniform,
			"animationManager.isEnabled": false,
	        scrollMode: go.Diagram.InfiniteScroll,
			contentAlignment: go.Spot.Center,
			"toolManager.hoverDelay": 0,
			"toolManager.toolTipDuration":0
		});
	myDiagram.layout =
	  	$(go.TreeLayout,  			
		    { angle: 0, 
	    	  layerSpacing: 80
		    }
		);		
	myDiagram.nodeTemplate = 
		$(go.Node, "Auto",
		{
	        mouseEnter: mouseEnter,
	        mouseLeave: mouseLeave
	    },
       	$(go.Shape, "RoundedRectangle",
            {
                fill: $(go.Brush, go.Brush.Linear, { 0: "white", 1: "#ccc" }),
                stroke: "#bbb", strokeWidth: 2,
                figure:"Rectangle"  
            },
            new go.Binding("figure", "fig"),
            new go.Binding('location', 'loc', go.Point.Parse),
            new go.Binding("fill", "color")
       ),
       $(go.TextBlock,
            {
                font: "bold 14pt helvetica, bold arial, sans-serif",
                margin: 20
            },
           new go.Binding("text", "text"))         
		);
	myDiagram.nodeTemplateMap.add("nodeMap1",
			$(go.Node, "Auto",
			{
		        mouseEnter: mouseEnter,
		        mouseLeave: mouseLeave
		    },
       		$(go.Shape, "RoundedRectangle",
              {
                  fill:$(go.Brush, go.Brush.Linear, { 0: "white", 1: "#ccc" }),
                  figure:"diamond",
             	  stroke: "#bbb"
              },
               new go.Binding("figure", "fig"),
               new go.Binding('location', 'loc', go.Point.Parse),
               new go.Binding("fill", "color")
       ),
       $(go.TextBlock,
             {
                  font: "bold 10pt helvetica, bold arial, sans-serif",
                  margin:8 
              },
           new go.Binding("text", "text"))
           
		));
	myDiagram.nodeTemplateMap.add("nodeMap2",
			$(go.Node, "Auto",
			{
		        mouseEnter: mouseEnter,
		        mouseLeave: mouseLeave
		    },
       	$(go.Shape, "RoundedRectangle",
            {
                fill: $(go.Brush, go.Brush.Linear, { 0: "white", 1: "#ccc" }),
                figure:"Rectangle"
            },
            new go.Binding("figure", "fig"),
            new go.Binding('location', 'loc', go.Point.Parse),
            new go.Binding("fill", "color"),
            new go.Binding("stroke", "color1")
       ),
       $(go.TextBlock,
            {
                font: "bold 14pt helvetica, bold arial, sans-serif",
                margin: 20
            },
           new go.Binding("text", "text")),
           {                          
            toolTip:                         
              $(go.Adornment, "Auto",
                $(go.Shape, { fill: "#eee",stroke: "#bbb" }),
                $(go.Panel, "Vertical",
                  $(go.TextBlock, { margin:10,width:360,font:20},
                    new go.Binding("text", "",gettip))      //	tiptext
                )
              )
         }));
	myDiagram.nodeTemplateMap.add("nodeMap3",
   		$(go.Node, "Auto",
   		{
			mouseEnter: mouseEnter,
			mouseLeave: mouseLeave
		},
		$(go.Shape, "RoundedRectangle", {
				fill: $(go.Brush, go.Brush.Linear, {
					0: "white",
					1: "#ccc"
				}),
				figure: "Rectangle"
			},
			new go.Binding("figure", "fig"),
			new go.Binding('location', 'loc', go.Point.Parse),
			new go.Binding("fill", "color"),
			new go.Binding("stroke", "color1")
		),
       $(go.TextBlock,
            {
                font: "bold 14pt helvetica, bold arial, sans-serif",
                margin: 20
            },
           new go.Binding("text", "text")),
           {                          
            toolTip:                         
              $(go.Adornment, "Auto",
                $(go.Shape, { fill: "#eee",stroke: "#bbb" }),
                $(go.Panel, "Vertical",
                  $(go.TextBlock, { margin:10,width:530,font:20},
                    new go.Binding("text", "",gettip))      //	tiptext
                )
              )
         }           
		));
		myDiagram.linkTemplate =
   			$(go.Link, 
            {  
             	routing: go.Link.AvoidsNodes,
             	corner: 0
            },
            new go.Binding("points").makeTwoWay(),            

            $(go.Shape,   
                {
                    isPanelMain: true,
                    stroke: "#bbb"
                },
                new go.Binding("strokeDashArray", "dash"),
            	new go.Binding("stroke", "color"),
            	new go.Binding("strokeWidth", "width")
        	),
             $(go.Shape,  
                {
                   	toArrow: "standard", 
                   	stroke: "#bbb"
                },
          		new go.Binding("fill", "color")
  			),
             $(go.TextBlock,  
	              {
	                  textAlign: "center",
	                  segmentOffset: new go.Point(0, -10),
	                  font: "10pt helvetica, arial, sans-serif",
	                  stroke: "#ff0000",
	                  margin: 4
	              },
	              new go.Binding("text", "text")
             )
    	 );
    	 myDiagram.model = go.Model.fromJson(epgObj.diagramModel);
};

function parseXml(epgid){
	getMeus(epgid);
	getXml(epgid);
	init();
};

function parseMoniteXml(executionId,epgId){
	if(!epgObj.executionId||!epgObj.epgId){
		epgObj.executionId=executionId;
		epgObj.epgId=epgId;
	}
	getMeus(epgId);
	getMonitDatas(executionId);
	getXml(epgId);
	if(!epgObj.diagramModel.nodeDataArray){
		clearOutTimer(epgObj.timer);
		return;
	}
	addColor(executionId);
	initMonit();
	setTimer(executionId,epgId);
};

function setTimer(executionId,epgId){
	clearOutTimer(epgObj.timer);
	epgObj.timer=setTimeout(function(){
		parseMoniteXml(executionId,epgId);
	},1000)
}

function gettip(getNode){
	return getNode.tiptext.replace(/",/g,'"\n').replace(/:/g,' ： ').replace(/{/g,'').replace(/}/,'').replace(/\\"/g,'"').replace(/;/g,'"\n\n').replace(/"""/g,'"').replace(/""/g,'"').replace(/}/g,'');	
}

function mouseEnter() {
	clearOutTimer(epgObj.timer);
};

function mouseLeave() {
	parseMoniteXml(epgObj.executionId,epgObj.epgId);
};

$(function(){
	$('.nav-parent').click(function(){
		clearOutTimer(epgObj.timer);
	})
	$('.children li').click(function(){
		clearOutTimer(epgObj.timer);
	})
})
//parseMoniteXml(executionId,epgId);
	
//})
