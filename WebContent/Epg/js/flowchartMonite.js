var flowchartUntil={
	epgId:'',
	executionId:'',
	timer:null,
	clearTimer:null,
	temp:null,
	myDiagram:null,
	newMeuExeTipArray:{},
	meuExeTipArray:{},
	meuTipArray:{},
	monitorDatas:[],
	exceptionData:[],
	exceptionDataLength:0,
	meuWorkDataLength:0,
	nodeDataList:[],
	referenceObj:{},
};

flowchartUntil.flowchartMonite=function(epgId,executionId){
	this.epgId=epgId;
	this.executionId=executionId;
	this.init1();
}

flowchartUntil.getStatus=function(){
	var that=this;
	getResultGet1('epg/executionrecord/detail?executionId='+that.executionId,function(data){
		var meuWorkData=JSON.parse(data).rows;
		var len=that.meuWorkDataLength=meuWorkData.length;
		if(len>0){
			for(var i=0;i<len;i++){
				var containerId=meuWorkData[i].containerId,
					meuId=meuWorkData[i].meuId,
					executeId=meuWorkData[i].executeId,
					executionTime=meuWorkData[i].executionTime+' ms',
					operationId=meuWorkData[i].operationId,
					meuData={"Container ID":containerId,"MEU ID":meuId,"Execution ID":executeId,"Execution Time":executionTime,"Operation ID":operationId};
				that.meuTipArray[meuId]=meuData;
			}
		}
	})
};

flowchartUntil.getException=function(){
	var that=this;
	getResultGet1('exception?executionId='+that.executionId,function(data){
		var exceptionData=JSON.parse(data).rows;
//		console.log(exceptionData);
		var len=that.exceptionDataLength=exceptionData.length;
		if(len>0){
			for(var i=0;i<len;i++){
				var containerId=exceptionData[i].containerId,
					meuId=exceptionData[i].meuId,
					executeId=exceptionData[i].executeId,
					msg=exceptionData[i].shortMsg,
					meuExceptionData={"Container ID":containerId,"MEU ID":meuId,"Execution ID":executeId,"Msg":msg};
				that.meuExeTipArray[meuId]=meuExceptionData;
			}
		}
	})
};

flowchartUntil.getExecutionStatus=function(callback){
	var status,
		that=this;
	getResultGet1('epg/executionrecord?executionId='+that.executionId,function(data){
		status=JSON.parse(data).rows[0].status;
		if(callback&&typeof(callback)=='function'){
			callback(status);
		}
	})
//	return status;
};

flowchartUntil.getMeu=function(){
	this.nodeDataList=[];
	var that=this;
	getResultGet1('meu?epgId='+that.epgId,function(data){
		var datas=JSON.parse(data).rows;
		var len=datas.length;
		var monitLen=that.monitorDatas.length;
		if(len>0){
			for(var i=0;i<len;i++){
				var meuId=datas[i].id,
					meuName=datas[i].name,
					isTips=false,
					isSuccessFail=false,
					isExceTips=false,
					isonlySuccess=false,
					isMonitor=false;
				if('reference' in datas[i]){
					that.referenceObj[meuId]=datas[i]["reference"];
				}
					
				if(monitLen>0){
					for(var j=0;j<monitLen;j++){
						if(that.monitorDatas[j].sourceId==meuId){
							isMonitor=true;
							break;
						}
					}
				}
				
				if(that.meuWorkDataLength>0){
					var menIdTemp,meuTipTemp;
					if(that.exceptionDataLength==0){
						for(var key in that.meuTipArray){
							menIdTemp=key;
							meuTipTemp=that.meuTipArray[key];
							meuTipTemp=JSON.stringify(meuTipTemp);
							if(key==meuId){
								isTips=true;
								break;
							}
						}
						if(isTips){
							var nodeData={"key":meuId,"text":meuName,"category":"nodeMap2","tiptext":meuTipTemp,"color":"green",};
						}else{
							if(isMonitor){
								var nodeData={"key":meuId,"text":meuName,"color":"green",};
							}else{
								var nodeData={"key":meuId,"text":meuName,};
							}
						}
					}else{
						if(meuId in that.meuTipArray||meuId in that.meuExeTipArray){
							isTips=true;
							if(meuId in that.meuTipArray){
								if(meuId in that.meuExeTipArray){
									isSuccessFail=true;
								}else{
									isonlySuccess=true;
								}
								
							}else{
								if(meuId in that.meuExeTipArray){
									isExceTips = true;
								}
							}
						}
						
						if(isTips){
							if(isSuccessFail){
								var successFailTip={};
								var tipWork=that.meuTipArray[meuId];
								var tipExe=that.meuExeTipArray[meuId];
								tipWork.Msg=tipExe.Msg;
								successFailTip=tipWork;
								successFailTip=JSON.stringify(successFailTip);
								var nodeData={"key":meuId,"text":meuName,"category":"nodeMap2","tiptext":successFailTip,"color":"orange",};
							}else if(isExceTips){
								var ExceTipString="";
								ExceTipString=that.meuExeTipArray[meuId];
								ExceTipString=JSON.stringify(ExceTipString);
								var nodeData={"key":meuId,"text":meuName,"category":"nodeMap3","tiptext":ExceTipString,"color":"red",};
							}else if(isonlySuccess){
								var onlySuccessTip="";
								onlySuccessTip=that.meuTipArray[meuId];
								onlySuccessTip=JSON.stringify(onlySuccessTip);
								var nodeData={"key":meuId,"text":meuName,"category":"nodeMap2","tiptext":onlySuccessTip,"color":"green",};
							}
						}else{
							if(isMonitor){
								var nodeData={"key":meuId,"text":meuName,"color":"green",};
							}else{
								var nodeData={"key":meuId,"text":meuName,};
							}
						}
					}
				}else{
					if(that.exceptionDataLength>0){
						var errorInfo={};
						if(meuId in that.meuExeTipArray){
							isTips = true;
							errorInfo=that.meuExeTipArray[meuId];
							errorInfo=JSON.stringify(errorInfo);
						}
						if(isTips){
							var nodeData={"key":meuId,"text":meuName,"category":"nodeMap2","tiptext":errorInfo,"color":"red",};
						}else{
							if(isMonitor){
								var nodeData={"key":meuId,"text":meuName,"color":"green",};
							}else{
								var nodeData={"key":meuId,"text":meuName,};
							}
						}
					}else{
						if(isMonitor){
							var nodeData={"key":meuId,"text":meuName,"color":"green",};
						}else{
							var nodeData={"key":meuId,"text":meuName,};
						}
					}
				}
				that.nodeDataList.push(nodeData);
			}
		}
	})
};
flowchartUntil.getGreenLine=function(callback){
	var that=this;
	getResultGet1('event/monitor?executionId='+that.executionId,function(data){
		that.monitorDatas=JSON.parse(data).rows;
		that.getMeu();
		if(typeof(callback)=='function'){
			callback();
		}
	})
};

flowchartUntil.drawLine=function(){
	var that=this,jsonList="";
	getResultGet1('epg?epgId='+that.epgId,function(data){
		var datas=JSON.parse(data);
		if(datas.rows.length>0){
			var datasXml=$($.parseXML(datas.rows[0].epgDefinition));
			$(datasXml).find('epg').each(function(){
				var nodeDataArray=[],linkDataArray=[];
				var epgName=$(this).attr('name');
				$('.ng-EpgDetail .panel-heading').html(epgName);
				var meuLength=$(this).children('meus').children('meu').length,
					destLength=$(this).children('events').children('event').children('dest').length;
				var nodeDataStart={"key":"start","text":"Start","fig":"ellipse",};
				var nodeData=that.nodeDataList;
				if(nodeData.length>0){
					for(var k=0;k<nodeData.length;k++){
						nodeDataArray.push(nodeData[k]);
					}
				}
				for(var key in that.referenceObj){
					var source=key;
					for(var k=0;k<that.referenceObj[key].length;k++){
						var dest=that.referenceObj[key][k].meuId;
						var linkData={
										"from":source,
										"to":dest,
										"dash":[4,6],
										"width":3,
									} 
						for(var m=0;m<that.monitorDatas.length;m++){
							var currentMonit=that.monitorDatas[m];
							if(source==currentMonit.sourceId){
								if(dest==currentMonit.destId){
									var sourceTopic=currentMonit.sourceTopic;
									if(sourceTopic&&sourceTopic.indexOf("meu/invokeByEvent")!=-1){
										var invoke=false;
										for(var n=0;n<that.monitorDatas.length;n++){
											var anotherMonit=that.monitorDatas[n];
											var destTopic=anotherMonit.destTopic;
											if(destTopic==sourceTopic){
												invoke=true;
											}
										}
										if(invoke){
											linkData.color="green";
										}else{
											linkData.color="orange";
										}
									}else{
										linkData.color="green";
									}
								}
							}
						}
						linkDataArray.push(linkData);
					}
				}
				
				if(nodeDataArray.length>0){
					var eventAll=$(this).children('events').children('event');
					var eventLength=eventAll.length;
					if(eventLength>0){
						for(var i=0;i<eventLength;i++){
							var eventId=eventAll.eq(i).attr('id'),
								eventSource=eventAll.eq(i).attr('source'),
								eventDest=eventAll.eq(i).attr('dest'),
								eventCon=eventAll.eq(i).attr('condition');
							if(eventDest ||eventDest==""){
								var linkData={
									"from":eventSource,
									"to":eventDest,
								}
								var monitLen=that.monitorDatas.length;
								if(monitLen>0){
									for(var t=0;t<monitLen;t++){
										var tempchange = that.monitorDatas[t];
										var tmpsourceId = tempchange["sourceId"];
										var tmpdestId = tempchange["destId"];
										var tmpsourceTopic=tempchange["sourceTopic"];
										if(tmpsourceId==eventSource){
											if(tmpdestId==eventDest){
												if(tmpsourceTopic){
													if(tmpsourceTopic.indexOf("meu/invokeByEvent")>=0){
														var invokeBack=false;
														for(var q=0;q<monitLen;q++){
											    			var invokeDest=that.monitorDatas[q]["destTopic"];										    				
											    			if(invokeDest==tmpsourceTopic){
											    				invokeBack=true;										    					
											    			}										    				
											    		}
														if(invokeBack){
															linkData.color="green";
														}else{
															linkData.color="orange";
														}
													}else{
														linkData.color="green";
													}
												}else{
													linkData.color="green";
												}
											}
										}
									}
								}
								if(eventSource && eventSource!="" &&(eventDest && eventDest!="")){
									linkDataArray.push(linkData);
								}
								else if(eventSource==""&&(eventDest && eventDest!="")){
									nodeDataStart.color="green";
									nodeDataArray.push(nodeDataStart);
									var linkDataStart={"from":"start","to":eventDest,"color":"green",};
									linkDataArray.push(linkDataStart); 
								}else if(!eventCon && eventDest==""&& eventSource){
									var nodeDataEnd={"key":"end1","text":"End","fig":"ellipse",};
									for(var p=0;p<that.monitorDatas.length;p++){
										if(that.monitorDatas[p].sourceId==eventSource&&that.monitorDatas[p].destId==""){
											nodeDataEnd.color="green";
										}
									}
									nodeDataArray.push(nodeDataEnd);
									var linkDataEnd={"from":eventSource,"to":"end1",};
									if(that.monitorDatas.length>0){
										for(var t=0;t<that.monitorDatas.length;t++){
											var tempchange = that.monitorDatas[t];
											var tmpsourceId = tempchange["sourceId"];
											var tmpdestId = tempchange["destId"];
											if(tmpsourceId==eventSource){
											    if(tmpdestId==eventDest){
											    	linkDataEnd.color="green";
											    }
											}
										}
									}
									linkDataArray.push(linkDataEnd);
								}
							}else if((eventSource && eventSource!="")&&!eventDest && eventDest!=""){
								var sourct11 = $(this).children('events').children('event').eq(i).attr("source");
								var destTolingxingColor = false; 
								var hasSameSourceIndex = 0;
								if(that.monitorDatas.length>0){
									for(var t=0;t<that.monitorDatas.length;t++){
										var tempchange = that.monitorDatas[t];
										var tmpsourceId = tempchange["sourceId"];
										var tmpdestId = tempchange["destId"];
										var tmpsourceTopic=tempchange["sourceTopic"];
									    if(tmpsourceId==sourct11){
									    	var eventDest1  = $(this).children('events').children('event').eq(i).children('dest');
			                				var eventDestLength1=eventDest1.length;
			               					 for(var j=0;j<eventDestLength1;j++){
			                					var childdest1 = eventDest1.eq(j);
												var eventChildDest1= childdest1.attr('id');
												if(tmpdestId==eventChildDest1){
													destTolingxingColor = true; 
												    hasSameSourceIndex = t;
												}
											}
									    }
									}
								}
								//create diamond
								var diamond = "diamond" + (i+1);
								var nodeDataCenter={"key":diamond,"text":"","fig":"diamond","category":"nodeMap1",};
				                nodeDataArray.push(nodeDataCenter);
				                var linkCenter={"from":sourct11,"to":diamond};
				                if(destTolingxingColor){
				       				var tmpsourceTopic1 = that.monitorDatas[hasSameSourceIndex]["sourceTopic"];
									var invokeBack1=false;
									var hasInvoke = false;
									if(tmpsourceTopic1){
										if(tmpsourceTopic1.indexOf('meu/invokeByEvent')>=0){
											hasInvoke = true;
											for(var q=0;q<that.monitorDatas.length;q++){
											    var ttt=that.monitorDatas[q]["destTopic"];										    				
											    if(ttt==tmpsourceTopic1){
											    	invokeBack1=true;										    					
											    }											    				
											}
											if(invokeBack1){
												linkCenter.color="green"
											}else{
												linkCenter.color="orange"
											}
										}else{
											linkCenter.color="green"
										}
									}else{
										linkCenter.color="green"
									}
				                }
								linkDataArray.push(linkCenter);
								var eventDest  = $(this).children('events').children('event').eq(i).children('dest');
				                var eventDestLength=eventDest.length;
				                for(var j=0;j<eventDestLength;j++){
				                	var childdest = eventDest.eq(j);
									var eventChildDest= childdest.attr('id');
									var condition= childdest.attr('condition');																				
									var hasSame = 0;
									for(var k=0;k<eventLength;k++){
										var eventCondition=$(this).children('events').children('event').eq(k).attr('condition');
										if(eventCondition && eventCondition==condition){
											dest11 = $(this).children('events').children('event').eq(k).attr("dest");
											condition11=eventCondition;
											hasSame ++;
										}
									}	
									var hasSameDest = false;
									if(hasSameSourceIndex>0){
										var tttt = that.monitorDatas[hasSameSourceIndex]
										if(eventChildDest==that.monitorDatas[hasSameSourceIndex]["destId"]){
											hasSameDest = true; 
										}
									}
									if(hasSame>0){
										var circle = "circle"+(j+1);
										//circle
										var nodeDataCircle={"key":circle,"text":"","fig":"circle","category":"nodeMap1",};
				                        nodeDataArray.push(nodeDataCircle);
				                         var linkCenter={"from":diamond,"to":circle};
										if(hasSameDest){
											if(hasInvoke){
												if(invokeBack1){
													linkCenter.color="green";
										    	}else{
										    		linkCenter.color="orange";
										    	}
											}else{													
												linkCenter.color="green";
											}												
										}
									    linkDataArray.push(linkCenter);
									    
									     var linkCenter1={"from":circle,"to":eventChildDest};
										if(hasSameDest){
										    if(hasInvoke){
												if(invokeBack1){
													linkCenter1.color="green";
										    	}else{
										    		linkCenter1.color="orange";
										    	}
											}else{													
												linkCenter1.color="green";
											}
										}
									    linkDataArray.push(linkCenter1);
									    if(dest11==""){
									        var ends = "ends"+(j+1);
									        var nodeDataEnd={"key":ends,"text":"End","fig":"ellipse",};
									        for(var p=0;p<that.monitorDatas.length;p++){
												if(that.monitorDatas[p].sourceId==sourct11&&that.monitorDatas[p].destId==""){
													if(condition11==condition){
														for(var q=0;q<that.monitorDatas.length;q++){
															if(that.monitorDatas[q].sourceId==sourct11&&that.monitorDatas[q].destId==eventChildDest){
																nodeDataEnd.color="green";
															}
														}
													}
												}
											}
											nodeDataArray.push(nodeDataEnd);
											 var linkCenter2={"from":circle,"to":ends};
											if(hasSameDest){
												linkCenter2.color="green";
											}
									        linkDataArray.push(linkCenter2);
									    }									        				                              
									}else{
										var linkCenter3={"from":diamond,"to":eventChildDest};
										if(hasSameDest){
											if(hasInvoke){
												if(invokeBack1){
													linkCenter3.color="green";
										    	}else{
										    		linkCenter3.color="orange";
										    	}
											}else{													
												linkCenter3.color="green";
											}
										            
										}
									    linkDataArray.push(linkCenter3);											
									}										
								}
								
							}
						}
					}
				}else{
					console.log("meu data information does not exist");
				}
				that.temp={
					"nodeKeyProperty":"key",
					"nodeDataArray":nodeDataArray,
					"linkDataArray":linkDataArray,
				}
//				console.log(that.temp);
			})
		}else{
			swal("Error~", datas.message+" !", "error");
		}
	})
};

flowchartUntil.drawChart=function(){
	var that=this;
	this.getStatus();
	this.getException();
	this.getGreenLine(function() {
		that.drawLine();
		that.myDiagram.model = go.Model.fromJson(that.temp);
		that.setTimer();
	})
}

flowchartUntil.setTimer=function(){
//	console.log(status);
//	var that=this;
//	this.timer = setInterval(function() {
//		that.getExecutionStatus(function(status){
////			console.log(status);
////			localStorage.setItem('Status',status);
//			if(status == "COMPLETE" || status == "COMPLETE_WITH_ERROR" || status == "TIMEOUT"){
//				that.clearTimer=setTimeout(function(){
//					clearInterval(that.timer);
//					clearTimeout(that.clearTimer);
//					that.timer = null;
//					that.clearTimer=null;
//				},10000)
//			}
//			that.drawChart();
//		});
//	}, 1000)
//	this.drawChart();
	var that=this;
	clearOutTimer(that.timer);
	that.timer=setTimeout(function(){
//		console.log('drawChart');
		that.drawChart();
	},1000)
};

flowchartUntil.init1=function(){
	clearInterval(this.timer);
	var $ = go.GraphObject.make;
	this.myDiagram =
	$(go.Diagram, "myDiagram",{
		initialAutoScale: go.Diagram.Uniform,
		"animationManager.isEnabled": false,
        scrollMode: go.Diagram.InfiniteScroll,
		contentAlignment: go.Spot.Center,
		"toolManager.hoverDelay": 0,
		"toolManager.toolTipDuration":0
	});
	this.myDiagram.layout =
	  	$(go.TreeLayout,  			
	    { angle: 0, 
	    	layerSpacing: 200
	    }
	);		
	this.myDiagram.nodeTemplate = 
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
		this.myDiagram.nodeTemplateMap.add("nodeMap1",
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
		this.myDiagram.nodeTemplateMap.add("nodeMap2",
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
//					 new go.Binding("text","tiptext"))
                )
              )
         }));
   this.myDiagram.nodeTemplateMap.add("nodeMap3",
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
//					 new go.Binding("text","tiptext"))
                )
              )
         }           
		));
		this.myDiagram.linkTemplate =
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
    	var	status=localStorage.getItem("Status");
//  	this.setTimer(status);	
		this.setTimer();	
};

$(function(){
	$('.nav-parent').click(function(){
		clearOutTimer(flowchartUntil.timer);
	})
	$('.children li').click(function(){
		clearOutTimer(flowchartUntil.timer);
	})
})

function gettip(getNode){
	return getNode.tiptext.replace(/",/g,'"\n').replace(/:/g,' ： ').replace(/{/g,'').replace(/}/,'').replace(/\\"/g,'"').replace(/;/g,'"\n\n').replace(/"""/g,'"').replace(/""/g,'"').replace(/}/g,'');	
}
	
function mouseEnter() {
	clearOutTimer(flowchartUntil.timer);
};

function mouseLeave() {
	flowchartUntil.setTimer();
};


