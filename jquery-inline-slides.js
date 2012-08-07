/**
 * jQuery Plugin to display an inline slideshow with css3 transforms and fallback
 * 
 * @author Jérémie Blaser, Marius Küng allink.creative (http://allink.ch)
 * @version 1.0 (2012-05-22)
 */
 (function($){
    $.inlineSlides = function(el, slides, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        var vendorPrefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];

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
                        slideContent.click(function(){
                            document.location.href = $(this).data('link');
                        }).css('cursor', 'pointer');
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
                    link.click(base.clickLink);
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

            // detect & setup touchwipe
            if ($.fn.touchwipe) {
                base.$el.touchwipe({
                     wipeLeft: base.slideLeft,
                     wipeRight:base.slideRight,
                     min_move_x: 50,
                     min_move_y: 50,
                     preventDefaultEvents: true
                });
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
        };
        base.clickLink = function(e){
            var index = $.inArray(e.target.parentNode, base.options.pager.children());
            base.showSlideNr(index);
            return false;
        };

        base.slideLeft = function(){
            if (base.currentIndex +1 < base.count) base.showSlideNr(base.currentIndex + 1);
        };
        base.slideRight = function(){
            if (base.currentIndex > 0) base.showSlideNr(base.currentIndex - 1);
        };
        base.showSlideNr = function(index){
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

        // Run initializer
        base.init();
    };

    $.inlineSlides.defaultOptions = {
        pager: null,
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