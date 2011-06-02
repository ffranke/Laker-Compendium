// Card Flip Effect
function mySideChange(front) {
    if (front) {
        $(".back", this).hide();
		$(".front", this).show();
		
    } else {
        $(".back", this).show();
		$(".front", this).hide();
    }
}

// Initiate Card Flip Effect
$('.card-flip').click(function () {
    $(this).rotate3Di(
        'toggle',
        500,
        {
			easing: 'swing',
            sideChange: mySideChange,
           
        }
	);
});