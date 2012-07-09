var SLIDES = [],
    IMAGES = [
    './images/example/1.png',
    './images/example/2.png',
    './images/example/3.png'
];

$(document).ready(function(){

    for (var i = 0; i < IMAGES.length; i++) {
        
        //Slide object
        var image = {
            id: i,
            title: null,
            desc: '<p>This is <b>description</b> #' + (i + 1) + '</p>',
            image: IMAGES[i],
            //link: '#'
        };

        //Add the slide to array
        SLIDES.push(image);

    }

    //Initilize plugin
    var slideshowWrapper = $('#slideshow-wrapper');
    slideshowWrapper.find('.slideshow-images').inlineSlides(SLIDES, {
        detail: $('#detail'),
        pager: $('.pager'),
        duration: '0.4s',
    });

});
