/**
 * jQuery Plugin to display an inline slideshow with css3 transforms and fallback
 * 
 * @author Jérémie Blaser, allink.creative (http://allink.ch)
 * @version 1.0 (2012-05-22)
 */
 (function($){
    $.inlineSlides = function(el, slides, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("inlineSlides", base);

        base.init = function(){
            if( typeof( slides ) === "undefined" || slides === null ) slides = [];

            base.slides = slides;
            base.count = slides.length;

            base.options = $.extend({},$.inlineSlides.defaultOptions, options);

            for (var i = 0; i < base.slides.length; i++) {
                var slide = base.slides[i];
                base.$el.append('<img src="'+slide.image+'" alt="'+slide.title+'"/>');
                var link = $('<a href="#"><li></li></a>');
                link.click(base.clickLink);
                base.options.pager.append(link);
            }
            base.$el.width(base.count*base.options.slideWidth);
            if ($.fn.touchwipe) {
                base.$el.touchwipe({
                     wipeLeft: base.slideLeft,
                     wipeRight:base.slideRight,
                     min_move_x: 50,
                     min_move_y: 50,
                     preventDefaultEvents: true
                });
            }

            base.transformProp = base.getTransformProp();
            base.showSlideNr(0);
      };
        base.clickLink = function(e){
            var index = Array.prototype.indexOf.call(base.options.pager.children(), e.target.parentNode);
            base.showSlideNr(index);
            return false;
        };

        base.slideLeft = function(){
            if (base.currentIndex < base.count) base.showSlideNr(base.currentIndex + 1);
        };
        base.slideRight = function(){
            if (base.currentIndex > 0) base.showSlideNr(base.currentIndex - 1);
        };
        base.showSlideNr = function(index){
            var slide = base.slides[index];
            if (!slide) return;
            base.currentIndex = index;
            if (base.options.detail){
                base.options.detail.html('<h3>'+ (index+1) +'/'+base.count+'<br>'+slide.title+'</h3>');
            }
            var offset = -1*index*base.options.slideWidth;
            if (base.transformProp) {
                base.$el.css(base.transformProp,'translate('+ offset +'px,0)');
                base.$el.css(base.transformProp,'translate3d('+ offset +'px,0,0)');
            }
            else {
                base.$el.css('left', offset );
            }
            
            base.options.pager.children().removeClass('active');
            $(base.options.pager.children()[index]).addClass('active');
        };

        base.getTransformProp = function () {
            var b = document.body || document.documentElement;
            var s = b.style;
            var p = 'transform';
            if(typeof s[p] == 'string') {return p; }

            // Tests for vendor specific prop
            v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
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
        slideWidth: null
    };

    $.fn.inlineSlides = function(slides, options){
        return this.each(function(){
            (new $.inlineSlides(this, slides, options));
        });
    };

})(jQuery);