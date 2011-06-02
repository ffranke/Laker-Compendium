//Get Filename without the "html"

var articlenumber = window.location.pathname.split("/").pop().split('.').shift();




// Function to generate Article-Links

function output(waytogo){
	
var next = parseFloat(articlenumber) + 1;
var prev = parseFloat(articlenumber) - 1;


if(waytogo == 'next') {
    var navlink = next + ".html";
} else {
	var navlink = prev + ".html";
	}
	
if(articlenumber == 9) {
	if(waytogo == 'next') {
    var navlink = navlink;
    } else {
	var navlink = "0" + navlink;
	}
} else if(articlenumber < 10)  {	
var navlink = "0" + navlink;
	}

	
if(articlenumber == 10) {
	if(waytogo == 'prev') {
	var navlink = "0" + navlink;
	
	}
	}
	
//Special-Case for first page

if(articlenumber == 1) {
	if(waytogo == 'next') {
    var navlink = "0" + next + ".html";
    } else {
	var navlink = "001b" + ".html";
	}

	}	

//Special-Case for how to use page
	
if(articlenumber == '001b') {
	if(waytogo == 'next') {
    var navlink = "01" + ".html";
    } else {
	var navlink = "001" + ".html";
	}

	}
	
	
window.location = navlink;



}

 //Function to display articlenumber (Articlenumber = File Name)
$(document).ready(function() { 
$('#article-number').append('<p>' + parseFloat(articlenumber) + '</p>');  

if(articlenumber == 17) {
$('.logo-small').hide();
	}

});
