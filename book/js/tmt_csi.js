/** 
* Copyright 2006-2007 massimocorner.com
* License: http://www.massimocorner.com/license.htm
* @author      Massimo Foti (massimo@massimocorner.com)
* @version     0.6.2, 2007-01-28
* @require     tmt_core.js
* @require     tmt_net.js
*/
 
if(typeof(tmt) == "undefined"){
	alert("Error: tmt.core JavaScript library missing");
}

tmt.csi = {};

tmt.csi.factory = function(htmlNode){
	var obj = new Object();
	obj.htmlNode = htmlNode;
	obj.src = htmlNode.getAttribute("csi:src");
	obj.load = function(){
		tmt.net.httpRequest(obj.src, obj.loadCallback);
	}
	obj.loadCallback = function(){
		obj.setHTML(this.response.responseText);
	}
	obj.setHTML = function(str){
		obj.htmlNode.innerHTML = str;
	}
	return obj;
}



tmt.csi.init = function(){
	if(typeof(tmt.net) == "undefined"){
		alert("Error: tmt.net JavaScript library missing");
		return;
	}
	var divNodes = document.getElementsByTagName("div");
	var csiNodes = tmt.filterNodesByAttribute("csi:src", divNodes);
	for(var i=0; i<csiNodes.length; i++){
		csiNodes[i].tmtCsi = tmt.csi.factory(csiNodes[i]);
		// Insane workaround for IE
		if(document.all){
			setTimeout(csiNodes[i].tmtCsi.load, 1);
		}
		else{
			csiNodes[i].tmtCsi.load();
		}
	}
}

// Global object storing utility methods
tmt.csi.util = {};

/**
* Private method. Given a <div> node or its id, return its csi object
*/
tmt.csi.util.getObjFromId = function(divNode){
	var targetNode = tmt.get(divNode);
	if(!targetNode){
		alert("Error: unable to find element");
		return null;
	}
	var targetObj = targetNode.tmtCsi;
	if(!targetObj){
		alert("Error: the request element is not an csi. Verify it contains the csi:src attribute");
		return null;
	}
	return targetObj;
}

/**
* Return the url of the content currently loaded inside a CSI element
*/
tmt.csi.util.getSrc = function(selectId){
	return tmt.csi.util.getObjFromId(selectId).src;
}

/**
* Load the content of a url inside a CSI element
*/
tmt.csi.util.load = function(selectId, url){
	var targetObj = tmt.csi.util.getObjFromId(selectId);
	targetObj.src = url;
	// Insane workaround for IE
	if(document.all){
		setTimeout(targetObj.load, 1);
	}
	else{
		targetObj.load();
	}
}

tmt.addEvent(window, "load", tmt.csi.init);