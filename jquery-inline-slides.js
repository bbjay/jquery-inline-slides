/**
 * jQuery Plugin to display an inline slideshow with css3 transforms and fallback
 *
 * @author Jérémie Blaser, Marius Küng allink.creative (http://allink.ch)
 * @version 1.1 (2012-08-7)
 */
 (function($){
    $.inlineSlides = function(el, slides, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        var vendorPrefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
        var swipe = {};

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("inlineSlides", base);

        base.init = function(){
            if( typeof( slides ) === "undefined" || slides === null ) slides = [];
            base.slides = slides;

            base.options = $.extend({},$.inlineSlides.defaultOptions, options);
            // determine slide width from the wrapper div if not given as an option
            base.slideWidth = base.options.width || base.$el.parent().width();
            base.count = base.options.count || slides.length;
            base.$el.width(base.count * base.$el.width());

            if(base.options.resize) {
                $(window).resize(function() {
                    for(var i = 0; i < base.$el.children().length; i++) {
                        var current_slide = $(base.$el.children()[i]);
                        base.slideWidth = base.$el.parent().width();
                        current_slide.width(base.slideWidth);
                        base.$el.width(base.count * base.slideWidth);
                    }
                    base.update_position();
                });
            }

            for (var i = 0; i < base.slides.length; i++) {
                var slide = base.slides[i];
                var slideContent;
                if (base.options.type == 'div'){
                    slideContent = '<div style="width:'+base.slideWidth+'px; background-image: url(' + slide.image + ');"></div>';
                    if(base.options.detail){
                        if(base.options.detail.inside)
                            slideContent = '<div style="background-image: url(' + slide.image + ');"><div class="' + base.options.detail.inside + '">' + slide.desc.inside + '</div></div>';
                    }
                    if(slide.link){
                        slideContent = $(slideContent).data('link', slide.link);
                        slideContent.click(base.clickImageLink).css('cursor', 'pointer');
                    }
                    base.$el.append(slideContent);
                }
                else if (base.options.type == 'img'){
                    slideContent = '<img src="'+slide.image+'" alt="'+slide.title+'"/>';
                    if(slide.link)
                        base.$el.append('<a href="' + slide.link + '">' + slideContent + '</a>');
                    else
                        base.$el.append(slideContent);
                }

                // setup pager
                if(base.options.pager && base.slides.length > 1){
                    var link = $('<a href="#" class="a'+ i +'"><li></li></a>');
                    link.click(base.clickPagerItem);
                    base.options.pager.append(link);
                }
            }

            // detect CSS3 properties
            base.transformProp = base.getCSSProp('transform');
            base.transitionProp = base.getCSSProp('transition');

            // set transition for the base element
            if (base.transitionProp) {
                base.$el.css(base.transitionProp, 'all ' + base.options.duration + ' ' + base.options.easing);
            }

            // setup button handlers
            if (base.options.rightButton !== null) {
                $(base.options.rightButton).click(function(e){
                    base.slideLeft();
                    return false;
                });
            }
            if (base.options.leftButton !== null) {
                $(base.options.leftButton).click(function(e){
                    base.slideRight();
                    return false;
                });
            }

            base.showSlideNr(0);
            if (base.options.autoplay) base.autoplay();
            if (base.slides.length > 1) swipe.init();
        };

        base.clickImageLink = function(){
            document.location.href = $(this).data('link');
        };
        base.clickPagerItem = function(e){
            var index = $.inArray(e.target.parentNode, base.options.pager.children());
            base.showSlideNr(index);
            if (base.options.autoplay) clearInterval(base.slideInterval);
            return false;
        };

        base.slideLeft = function(){
            if (base.currentIndex +1 < base.count) base.showSlideNr(base.currentIndex + 1);
        };
        base.slideRight = function(){
            if (base.currentIndex > 0) base.showSlideNr(base.currentIndex - 1);
        };
        base.showSlideNr = function(index) {
            var slide = base.slides[index];
            base.currentIndex = index;

            // update slide description
            if (base.options.detail){
                if(base.options.detail.outside)
                    base.options.detail.outside.html(slide.desc.outside);
                else
                    base.options.detail.html(slide.desc);
            }

            // perform slide animation
            var offset = -1*index*base.slideWidth;
            if (base.transformProp && base.transitionProp) {
                base.$el.css(base.transformProp,'translate('+ offset +'px,0)');
                base.$el.css(base.transformProp,'translate3d('+ offset +'px,0,0)');
            }
            else if(base.transitionProp){
                base.$el.css(base.transitionProp,'left ' + offset +'px');
            }
            else {
                // jQuery animate fallback
                base.$el.animate({
                    left: offset
                });
            }

            // update pager
            if (base.options.pager !== null) {
                base.options.pager.children().removeClass('active');
                $(base.options.pager.children()[index]).addClass('active');
            }
            if (base.options.numericPager !== null) {
                base.options.numericPager.html((index+1) + base.options.numericPagerSeparator + base.count);
            }

            // update buttons
            if (base.options.leftButton !== null) {
                if (index === 0) base.options.leftButton.removeClass('active');
                else base.options.leftButton.addClass('active');
            }
            if (base.options.rightButton !== null) {
                if (index === base.count-1) base.options.rightButton.removeClass('active');
                else base.options.rightButton.addClass('active');
            }
            if (base.options.slideChangeCallback !== null && typeof(base.options.slideChangeCallback) == 'function') {
                base.options.slideChangeCallback(index);
            }
        };

        base.getCSSProp = function (property) {
            var b = document.body || document.documentElement;
            var s = b.style;
            var p = property;
            if(typeof s[p] == 'string') {return p; }

            // Tests for vendor specific prop
            var v = vendorPrefixes;
            pu = p.charAt(0).toUpperCase() + p.substr(1);
            for(var i=0; i<v.length; i++) {
                if(typeof s[v[i] + pu] == 'string') {
                    return '-'+ v[i].toLowerCase() +'-'+ p;
                }
            }
            return false;
        };

        base.update_position = function() {
            base.showSlideNr(base.currentIndex);
        };

        base.moveSlider = function(offset){
            base.$el.css(base.transformProp,'translate('+ offset +'px,0)');
            base.$el.css(base.transformProp,'translate3d('+ offset +'px,0,0)');
        };

        base.autoplay = function(){
            clearInterval(base.slideInterval);
            base.slideInterval = setInterval(animate, parseFloat(base.options.duration, 10)*20000);
            base.slideToRight = false;

            function animate(){
                if(base.currentIndex == base.count-1){
                    base.slideToRight = true;
                }
                if(base.currentIndex === 0){
                    base.slideToRight = false;
                }
                if(base.slideToRight) {
                    base.slideRight();
                }
                else {
                    base.slideLeft();
                }
            }
        };

        swipe.init = function() {
            swipe.touchEnabled = 'ontouchstart' in window.document;
            swipe.element = document.getElementById(base.$el.parent().attr('id'));
            swipe.touch = false;

            swipe.startX = 0;
            swipe.distanceX = 0;
            swipe.currentDistance = 0;
            swipe.currentIndex = 0;
            swipe.tolerance = 0.25;
            swipe.offset = 0;

            base.$el.children().css({
                '-webkit-backface-visibility': 'hidden',
                '-webkit-perspective': 1000
            });

            $(base.$el.parent()).bind('touchstart', swipe.startHandler);
            $(base.$el.parent()).bind('touchmove', swipe.moveHandler);
            $(base.$el.parent()).bind('touchend', swipe.endHandler);
        };

        swipe.startHandler = function(event) {
            clearInterval(base.slideInterval);
            swipe.event = swipe.touchEnabled ? event.originalEvent.touches[0] : event;

            swipe.startX = swipe.event.pageX;
            swipe.startY = swipe.event.pageY;
            swipe.touch = true;
            return false;
        };

        swipe.moveHandler =  function(event) {
            if (swipe.touch) {
                swipe.event = swipe.touchEnabled ? event.originalEvent.touches[0] : event;
                swipe.distanceX = swipe.event.pageX - swipe.startX;
                swipe.offset = -(base.currentIndex * base.slideWidth) + (swipe.distanceX);
                base.moveSlider(swipe.offset);
            }
            return false;
        };

        swipe.endHandler = function(event) {
            swipe.touch = false;
            if(!swipe.distanceX) return false;

            if(-swipe.distanceX > (base.slideWidth/2) - base.slideWidth * swipe.tolerance){
                base.currentIndex++;
                base.currentIndex = base.currentIndex >= base.count ? base.count-1 : base.currentIndex;
            }
            else if(swipe.distanceX > (base.slideWidth/2) - base.slideWidth * swipe.tolerance){
                base.currentIndex--;
                base.currentIndex = base.currentIndex < 0 ? 0 : base.currentIndex;
            }
            swipe.offset = -base.currentIndex * base.slideWidth;
            base.moveSlider(swipe.offset);

            base.options.pager.children().removeClass('active');
            $(base.options.pager.children()[base.currentIndex]).addClass('active');

            swipe.distanceX = 0;
            swipe.offset = 0;

            return false;
        };

        // Run initializer
        base.init();
    };

    $.inlineSlides.defaultOptions = {
        pager: null,
        numericPager: null,
        numericPagerSeparator: ' / ',
        detail: null,
        duration: '0.4s',
        easing: 'ease-in-out',
        type: 'div',
        rightButton: null,
        leftButton: null,
        slideChangeCallback: null
    };

    $.fn.inlineSlides = function(slides, options){
        return this.each(function(){
            (new $.inlineSlides(this, slides, options));
        });
    };

})(jQuery);
