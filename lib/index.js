var $ = require('jquery')
var Transform3d = require('transform3d')
var Transition = require('transition')
var equations = require('transition/equations')

$(function(){

    var el = document.createElement('div'),
        transformProps = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
        transformProp = support(transformProps),
        // transformProp = 'webkitTransform',
        transitionDuration = 'transitionDuration WebkitTransitionDuration MozTransitionDuration OTransitionDuration msTransitionDuration'.split(' '),
        transitionDurationProp = support(transitionDuration);
        // transitionDurationProp = 'webkitTransitionDuration';

    function support(props) {
        for(var i = 0, l = props.length; i < l; i++) {
            if(typeof el.style[props[i]] !== "undefined") {
                return props[i];
            }
        }
    }

    var mouse = {
            start : {}
        },
        touch = document.ontouchmove !== undefined,
        viewport = {
            rotation: 0,
            x: -10,
            y: 20,
            el: $('.cube')[0],
            move: function(coords) {
                if(coords) {
                    if(typeof coords.x === "number") this.x = coords.x;
                    if(typeof coords.y === "number") this.y = coords.y;
                }

                this.el.style[transformProp] = "translateZ(-407px) rotateY("+this.y+"deg)";
            },
            finish: function() {
                var rotation = Math.round(this.y/90) * 90

                var transform1 = new Transform3d()
                var transform2 = new Transform3d()
                
                transform1.translateZ(-255).rotateY(this.y).scale(1)
                transform2.translateZ(-155).rotateY(rotation).scale(1)
                // var interpolation = transform1.interpolation(transform2)
                var interpolation = new Transform3d.Interpolation(transform1, transform2)
                var el = this.el
                viewport.el.style[transitionDurationProp] = null
                var animation = new Transition(200, equations.sineOut, function(delta) {
                    var trans = interpolation.step(delta).compose()
                    // console.log(trans)
                    // el.style[transformProp] = 'translateZ(-207deg)'// + trans
                    el.style[transformProp] = trans
                })
                 
                animation.start()
                setTimeout(function() {
                  viewport.el.style[transitionDurationProp] = '200ms'
                }, 250)

                this.y = rotation

                // this.el.style[transformProp] = "translateZ(-207px) rotateY("+rotation+"deg)";
                

            },
            reset: function() {
                this.move({x: 0, y: 0});
            }
        };

    viewport.duration = function() {
        var d = touch ? 10 : 200;
        // d = 200
        viewport.el.style[transitionDurationProp] = d + "ms";
        return d;
    }();

    $(document).keydown(function(evt) {
        switch(evt.keyCode)
        {
            case 37: // left
                viewport.move({y: viewport.y - 90});
                break;

            case 38: // up
                evt.preventDefault();
                viewport.move({x: viewport.x + 90});
                break;

            case 39: // right
                viewport.move({y: viewport.y + 90});
                break;

            case 40: // down
                evt.preventDefault();
                viewport.move({x: viewport.x - 90});
                break;

            case 27: //esc
                viewport.reset();
                break;

            default:
                break;
        };
    }).bind('mousedown touchstart', function(evt) {
        delete mouse.last;
        if($(evt.target).is('a, iframe')) {
            return true;
        }

        evt.originalEvent.touches ? evt = evt.originalEvent.touches[0] : null;
        mouse.start.x = evt.pageX;
        mouse.start.y = evt.pageY;
        viewport.moving = false
        $(document).bind('mousemove touchmove', function(event) {
            // Only perform rotation if one touch or mouse (e.g. still scale with pinch and zoom)
            if(!touch || !(event.originalEvent && event.originalEvent.touches.length > 1)) {
                event.preventDefault();
                // Get touch co-ords
                event.originalEvent.touches ? event = event.originalEvent.touches[0] : null;
                $('.viewport').trigger('move-viewport', {x: event.pageX, y: event.pageY});
                // $('.viewport').trigger('move-viewport', {x: event.pageX});
            }
        });

        $(document).bind('mouseup touchend', function () {
            $(document).unbind('mousemove touchmove');
        });
    }).bind('mouseup touchend', function(evt) {
      viewport.finish()
    })

    $('.viewport').bind('move-viewport', function(evt, movedMouse) {
        // Reduce movement on touch screens
        var movementScaleFactor = touch ? 4 : 1;
        movementScaleFactor = 2

        if (!mouse.last) {
            mouse.last = mouse.start;
        } else {
            if (forward(mouse.start.x, mouse.last.x) != forward(mouse.last.x, movedMouse.x)) {
                mouse.start.x = mouse.last.x;
            }
            if (forward(mouse.start.y, mouse.last.y) != forward(mouse.last.y, movedMouse.y)) {
                mouse.start.y = mouse.last.y;
            }
        }

        viewport.move({
            x: viewport.x + parseInt((mouse.start.y - movedMouse.y)/movementScaleFactor, 10),
            y: viewport.y - parseInt((mouse.start.x - movedMouse.x)/movementScaleFactor, 10)
        });

        mouse.last.x = movedMouse.x;
        mouse.last.y = movedMouse.y;

        function forward(v1, v2) {
            return v1 >= v2 ? true : false;
        }
    });


});
