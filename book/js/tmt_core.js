/** 
* Copyright 2006-2008 massimocorner.com
* License: http://www.massimocorner.com/license.htm
* @author      Massimo Foti (massimo@massimocorner.com)
* @version     0.3.2, 2008-05-07
 */

if(typeof(tmt) == "undefined"){
	var tmt = {};
}

/**
* Developed by John Resig
* For additional info see:
* http://ejohn.org/projects/flexible-javascript-events
*/
tmt.addEvent = function(obj, type, fn){
	if(obj.addEventListener){
		obj.addEventListener(type, fn, false);
	}
	else if(obj.attachEvent){
		obj["e" + type + fn] = fn;
		obj[type + fn] = function(){
				obj["e" + type + fn](window.event);
			}
		obj.attachEvent("on" + type, obj[type+fn]);
	}
}

/**
* Sort of an equivalent of the famous $() function. Just with a better name :-)
* Accepts either ids (strings) or DOM node references
*/
tmt.get = function(){
	var returnNodes = new Array();
	for(var i=0; i<arguments.length; i++){
		var nodeElem = arguments[i];
		if(typeof nodeElem == "string"){
			nodeElem = document.getElementById(nodeElem);
		}
		if(arguments.length == 1){
			return nodeElem;
		}
		returnNodes.push(nodeElem);
	}
	return returnNodes;
}

/**
* Returns an array containing all child nodes. 
* If no starting node is passed, assume the document is the starting point
*/
tmt.getAll = function(startNode){
	// If no node was passed, use the document
	var rootNode = (startNode) ? tmt.get(startNode) : document;
	return rootNode.getElementsByTagName("*");
}

/**
* Returns an array containing all child nodes. 
* Unlike tmt.getAll, it return only elements of type Node.NODE_ELEMENT, no comments or other kind of nodes
* If no starting node is passed, assume the document is the starting point
*/
tmt.getAllNodes = function(startNode){
	var elements = tmt.getAll(startNode);
	var nodesArray = [];
	for(var i=0; i<elements.length; i++){
		if(elements[i].nodeType == 1){
			nodesArray.push(elements[i]);
		}
	}
	return nodesArray;
}

/**
* Returns an array containing all child nodes that contain the given attribute 
* If no starting node is passed, assume the document is the starting point
*/
tmt.getNodesByAttribute = function(attName, startNode){
	var nodes = tmt.getAll(startNode);
	return tmt.filterNodesByAttribute(attName, nodes);
}

/**
* Returns an array containing all child nodes that contain the given attribute matching a given value
* If no starting node is passed, assume the document is the starting point
*/
tmt.getNodesByAttributeValue = function(attName, attValue, startNode){
	var nodes = tmt.getAll(startNode);
	return tmt.filterNodesByAttributeValue(attName, attValue, nodes);
}

/**
* Out of a node list, returns an array containing all nodes that contain the given attribute
*/
tmt.filterNodesByAttribute = function(attName, nodes){
	var filteredNodes = new Array();
	for(var i=0; i<nodes.length; i++){
		if(nodes[i].getAttribute(attName)){
			filteredNodes.push(nodes[i]);
		}
	}
	return filteredNodes;
}

/**
* Out of a node list, returns an array containing all nodes that contain the given attribute matching a given value
*/
tmt.filterNodesByAttributeValue = function(attName, attValue, nodes){
	var filteredNodes = new Array();
	for(var i=0; i<nodes.length; i++){
		if(nodes[i].getAttribute(attName) && (nodes[i].getAttribute(attName) == attValue)){
			filteredNodes.push(nodes[i]);
		}
	}
	return filteredNodes;
}

/**
* Set the value of an attribute on a list of nodes. Accepts either an id (string) or DOM node reference
*/
tmt.setNodeAttribute = function(nodeList, attName, attValue){
for(var i=0; i<nodeList.length; i++){
		var nodeElem = tmt.get(nodeList[i]);
		if(nodeElem){
			nodeElem[attName] = attValue;
		}
	}
}

/**
* Add a CSS class to a given node. Accepts either an id (string) or DOM node reference
*/
tmt.addClass = function(element, className){
	var nodeElem = tmt.get(element);
	if(!nodeElem || (tmt.hasClass(nodeElem, className) == true)){
		return;
	}
	nodeElem.className += (nodeElem.className ? " " : "") + className;
}

/**
* Check if a given node use a CSS class. Accepts either an id (string) or DOM node reference
*/
tmt.hasClass = function(element, className){
	var nodeElem = tmt.get(element);
	if(nodeElem){
		return nodeElem.className.search(new RegExp("\\b" + className + "\\b")) != -1;
	}
	return null;
}

/**
* Remove a CSS class from a given node. Accepts either an id (string) or DOM node reference
*/
tmt.removeClass = function(element, className){
	var nodeElem = tmt.get(element);
	if(!nodeElem || (tmt.hasClass(nodeElem, className) == false)){
		return;
	}
	nodeElem.className = nodeElem.className.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), "");
}

/**
* Toggle a CSS class from a given node. Accepts either an id (string) or DOM node reference
*/
tmt.toggleClass = function(element, className){
	var nodeElem = tmt.get(element);
	if(tmt.hasClass(nodeElem, className)){
		tmt.removeClass(nodeElem, className);
	}
	else{
		tmt.addClass(nodeElem, className);
	}
}

/**
* Trim a given string
*/
tmt.trim = function(str){
	return str.replace(/^\s+|\s+$/g, "");
}

/**
* Replace special XML character with the equivalent entities
*/
tmt.encodeEntities = function(str){
	if(str && str.search(/[&<>"]/) != -1){
		str = str.replace(/&/g, "&amp;");
		str = str.replace(/</g, "&lt;");
		str = str.replace(/>/g, "&gt;");
		str = str.replace(/"/g, "&quot;");
	}
	return str
}

/**
* Replace XML's entities with the equivalent character
*/
tmt.unencodeEntities = function(str){
	str = str.replace(/&amp;/g, "&");
	str = str.replace(/&lt;/g, "<");
	str = str.replace(/&gt;/g, ">");
	str = str.replace(/&quot;/g, '"');
	return str
}

/**
* Turn a set of name/value pairs stored inside an object into a URI encoded string
*/
tmt.hashToEncodeURI = function(obj){
	var values = [];
	for(var x in obj){
		values.push(encodeURIComponent(x) + "=" + encodeURIComponent(obj[x]));
	}
	return values.join("&");
}