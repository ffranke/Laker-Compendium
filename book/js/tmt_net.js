/** 
* Copyright 2006-2009 massimocorner.com
* License: http://www.massimocorner.com/license.htm
* @author      Massimo Foti (massimo@massimocorner.com)
* @version     1.0, 2009-03-31
*/

if(typeof(tmt) == "undefined"){
	var tmt = {};
}

tmt.net = {};

// Constants
tmt.net.AJAX_USER_AGENT = "tmt.net";

tmt.net.requestFactory = function(valueObj){
	var obj = {};
	obj.request = null;
	obj.loadCallback = valueObj.loadCallback;
	if(!valueObj.params){
		valueObj.params = null;
	}
	// GET is the default method
	if(!valueObj.method){
		valueObj.method = "GET";
	}
	// Default contentType for POST
	if(!valueObj.contentType && valueObj.method == "POST"){
		valueObj.contentType = "application/x-www-form-urlencoded";
	}
	// Timeout default
	obj.timeout = tmt.net.DEFAULT_TIMEOUT;
	obj.timeoutId = null;
	if(valueObj.timeout){
		obj.timeout = valueObj.timeout;
	}
	// Create the XMLHttpRequest
	obj.request = tmt.net.getRequestObj();
	// Terminate the request and the timeout
	obj.abort = function(statusCode){
		// If no code passed, use default
		var code = (statusCode) ? statusCode : tmt.net.REQUEST_ABORTED;
		if(obj.isRequestRunning()){
			window.clearTimeout(obj.timeoutId);
			obj.request.abort();
			obj.errback.call(obj.createResponse(code));
		}
	}

	// Check the state and invoke the callback as soon as the request is done
	obj.checkReadyState = function(){
		if(obj.request.readyState == tmt.net.READY_STATE_COMPLETE){
			// Request finished, no more need to run the timeout
			window.clearTimeout(obj.timeoutId);
			var httpStatus = obj.request.status;
			if(httpStatus){
				if(
					(httpStatus >= 200 && httpStatus <= 300) || 
					(httpStatus == 304) ||
					(location.protocol == "file:")
					){
					obj.loadCallback.call(obj.createResponse(tmt.net.REQUEST_OK));
				}
				else{
					obj.errback.call(obj.createResponse(tmt.net.REQUEST_FAILED));
				}
			}
			// Safari sometimes fails to report HTTP status. 
			// If we get no status, return the response anyway, just without error checking
			else{
				 obj.loadCallback.call(obj.createResponse(tmt.net.REQUEST_FAILED));
			}
			// Destroy the request object, just in case...
			obj.request = null;
		}
	}

	// Create a custom response object storing data to send back 
	obj.createResponse = function(statusCode){
		var container = {};
		container.response = {}; 
		// Custom properties
		container.response.url = valueObj.url;
		container.response.contextData = valueObj.contextData;
		container.response.errorcode = statusCode;
		// Native properties from the request object, not available for aborted requests
		if(statusCode == tmt.net.REQUEST_OK || statusCode == tmt.net.REQUEST_FAILED){
			container.response.status = obj.request.status;
			container.response.readyState = obj.request.readyState;
			container.response.statusText = obj.request.statusText;
			container.response.allResponseHeaders = obj.request.getAllResponseHeaders();
			container.response.responseText = obj.request.responseText;
			container.response.responseXML = obj.request.responseXML;
		}
		// If a reference to a DOM node was passed, pass it back
		if(valueObj.domNode){
			container.response.domNode = valueObj.domNode;	
		}
		return container;
	}

	// By default errors are handled with an alert
	obj.defaultErrback = function(){
		var errorMsg = tmt.net.MSG_FAILED_REQUEST;
		errorMsg += "\n";
		errorMsg += "\nurl: " + this.response.url;
		errorMsg += "\nerrorcode: " + this.response.errorcode;
		// Data not available for abort or timeout
		if(this.response.errorcode == tmt.net.REQUEST_FAILED){
			errorMsg += "\nreadyState: " + this.response.readyState;
			errorMsg += "\nHTTP status: " + this.response.status;
			errorMsg += "\n";
			errorMsg += "\nResponse headers:";
			errorMsg += "\n" + this.response.allResponseHeaders;
		}
		alert(errorMsg);
	}
	obj.errback = (valueObj.errback) ? valueObj.errback : obj.defaultErrback;

	// Check if the request is running
	obj.isRequestRunning = function(){
		return (obj.request.readyState != tmt.net.READY_STATE_COMPLETE) && (obj.request.readyState != tmt.net.READY_STATE_COMPLETE);
	}

	// Perform the HTTP request
	obj.send = function(){
		try{
			obj.request.onreadystatechange = function(){
				obj.checkReadyState.call();
			}
			obj.request.open(valueObj.method, valueObj.url, true);
			if(valueObj.contentType){
				obj.request.setRequestHeader("Content-Type", valueObj.contentType);
			}
			// Add custom user-agent
			if(valueObj.headers && !valueObj.headers["X-Requested-With"]){
				obj.request.setRequestHeader("X-Requested-With", tmt.net.AJAX_USER_AGENT);
			}
			// Add custom HTTP headers (if any)
			if(valueObj.headers){				
				for(var x in valueObj.headers){
					obj.request.setRequestHeader(x, valueObj.headers[x]);
				}
			}
			// Send the HTTP request and start running the timeout
			obj.request.send(valueObj.params);
			obj.timeoutId = setTimeout(obj.timedAbort, obj.timeout);
		}
		catch(err){
			obj.errback.call(obj.createResponse(tmt.net.REQUEST_FAILED));
		}
	}

	// Invoked on timeout to abort the request
	obj.timedAbort = function(){
		obj.abort(tmt.net.REQUEST_TIMEOUT);
		window.clearTimeout(obj.timeoutId);
	}

	return obj;
}

/**
* Return an instance of an XMLHttpRequest (either native or Active-X) depending on browser and environment
*/
tmt.net.getRequestObj = function(){
	var requestObj = {};
	var isLocal = location.protocol == "file:";
	if(!isLocal){
		if(window.XMLHttpRequest){
			requestObj = new XMLHttpRequest();
		}
		else if(tmt.net.XHR_ACTIVEX_NAME){
			requestObj = new ActiveXObject(tmt.net.XHR_ACTIVEX_NAME);
		}
		// No native support for XMLHttpRequest, no Active-X, no AJAX :-( 
		else{
			throw new Error(tmt.net.MSG_NO_XMLHTTPREQUEST);
		}
	}
	// Native XMLHttpRequest fails in IE 7 for local files, in this case we revert back to Active-X
	else{
		if(tmt.net.XHR_ACTIVEX_NAME){
			requestObj = new ActiveXObject(tmt.net.XHR_ACTIVEX_NAME);
		}
		else if(window.XMLHttpRequest){
			requestObj = new XMLHttpRequest();
		}
		// No native support for XMLHttpRequest, no Active-X, no AJAX :-( 
		else{
			throw new Error(tmt.net.MSG_NO_XMLHTTPREQUEST);
		}
	}
	return requestObj;
}

/**
* Perform an HTTP request. You can either use a list of arguments or a single objects containing name/value pairs
* Available arguments using list: url (required), loadCallback (required), errback, method, params
* Available arguments using object are the ones above plus: contentType, timeout, 
* headers (an array of objects with name/value fields), and contextData.
* contextData is a very special kind of argument, where the caller can store any arbitrary content that will be available inside the callback
*/
tmt.net.httpRequest = function(url, loadCallback, errback, method, params){
	var request = null;
	var valueObj = {};
	if(typeof(arguments[0]) == "string"){
		// Arguments were passed using a list, turn them into an object
		valueObj.url = url;
		valueObj.loadCallback = loadCallback;
		if(errback){
			valueObj.errback = errback;
		}
		if(method){
			valueObj.method = method;
		}
		if(params){
			valueObj.params = params;
		}
	}
	else{
		// Arguments were passed using an object
		valueObj = arguments[0];
	}
	try{
		// Initialize the request object
		request = tmt.net.requestFactory(valueObj);
		// Perform the HTTP call
		request.send();
	}
	catch(err){
		alert(err.message);
	}
	return request;
}

/**
* Returns true if the current browser is supported by the library, false otherwise
*/
tmt.net.isSupported = function(){
	if(window.XMLHttpRequest || window.ActiveXObject){
		return true;
	}
	return false;
}

// Constants
tmt.net.DEFAULT_TIMEOUT = 60000;
tmt.net.READY_STATE_UNINITIALIZED = 0;
tmt.net.READY_STATE_COMPLETE = 4;
tmt.net.REQUEST_FAILED = 100;
tmt.net.REQUEST_ABORTED = 101;
tmt.net.REQUEST_TIMEOUT = 102;
tmt.net.REQUEST_OK = 200;
tmt.net.MSG_FAILED_REQUEST = "Unable to retrieve data";
tmt.net.MSG_NO_XMLHTTPREQUEST = "Your browser doesn't support XMLHttp calls";
// Store names for XMLHttpRequest Active-X, from the newer to the older
tmt.net.XHR_ACTIVEX_VERSIONS = new Array(
	"MSXML2.XmlHttp.6.0", 
	"MSXML2.XmlHttp.3.0", 
	"MSXML2.XmlHttp", 
	"Microsoft.XmlHttp"
);

tmt.net.XHR_ACTIVEX_NAME = null;
// Find the most recent XmlHttp Active-X available
if(window.ActiveXObject){
	for(var i=0; tmt.net.XHR_ACTIVEX_VERSIONS.length; i++){
		// IE keeps running the loop if it's unable to find any Active-X. Really weird indeed...
		if(i > tmt.net.XHR_ACTIVEX_VERSIONS.length){
			throw new Error("Unable to instantiate any suitable XMLHttp component");
		}
		try{
			new ActiveXObject(tmt.net.XHR_ACTIVEX_VERSIONS[i]);
			tmt.net.XHR_ACTIVEX_NAME = tmt.net.XHR_ACTIVEX_VERSIONS[i];
			break;
		}
		catch(err){
		}
	}
}