import {CSSPrefix} from 'cssprefix';

export default class Swiped {
    options: any;
    duration: any;
    tolerance: any;
    time: any;
    width: any;
    elem: any;
    list: any;
    dir: any;
    group: any;
    id: any;
    right: any;
    left: any;
    elemId: number;
    groupCounter: number;
    _elems: any;
    cssProps: any;
    touch: any;
    mouse: any;
    transitionEvent: any;
    eventBinded = false;
    delta: any;
    touchId: any;
    x: any;
    y: any;
    startTime: any;

    onOpen(){};
    onClose(){};

    init(o): any[] {
        this.groupCounter++;

        let elems = [];

        if (o.elems.length) {
            elems = o.elems;
        } else {
            elems = document.querySelectorAll(o.query)
        }

        let group = [];

        delete o.c;

        [].forEach.call(elems, function (elem) {
            let option = this.extend({ elem: elem, group: this.groupCounter }, o);

            group.push(new Swiped(option));
        });

        this._bindEvents();
        this._elems = this._elems.concat(group);

        if (group.length === 1) {
            return group[0];
        }

        return group;
    };

    constructor(options: any) {
        this._elems = [];

        let defaultOptions = {
            duration: 200,
            tolerance: 50,
            time: 200,
            dir: 1,
            right: 0,
            left: 0
        };

        this.options = this.extend(defaultOptions, options || {});
        this.duration = options.duration;
        this.tolerance = options.tolerance;
        this.time = options.time;
        this.width = options.left || options.right;
        this.elem = options.elem;
        this.list = options.list;
        this.dir = options.dir;
        this.group = options.group;
        this.id = this.elemId++;

        this.onOpen = typeof options.onOpen === 'function' ? options.onOpen : () => {
        };

        this.onClose = typeof options.onClose === 'function' ? options.onClose : () => {
        };

        this.right = options.right;
        this.left = options.left;

        this._elems = [];
        this.groupCounter = 0;
        this.elemId = 0;

        this.transitionEvent = (() => {
            let t,
                el = document.createElement("fakeelement");

            let transitions = {
                "transition": "transitionend",
                "OTransition": "oTransitionEnd",
                "MozTransition": "transitionend",
                "WebkitTransition": "webkitTransitionEnd"
            };

            for (t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }
        })();

        this.cssProps = {
            'transition': CSSPrefix.getName('transition'),
            'transform': CSSPrefix.getName('transform')
        };

        let msPointer = window.navigator.msPointerEnabled;

        this.touch = {
            start: msPointer ? 'MSPointerDown' : 'touchstart',
            move: msPointer ? 'MSPointerMove' : 'touchmove',
            end: msPointer ? 'MSPointerUp' : 'touchend'
        };

        this.mouse = {
            start: 'mousedown',
            move: 'mousemove',
            end: 'mouseup'
        };

        if (
            (options.right > 0 && options.tolerance > options.right) ||
            (options.left > 0 && options.tolerance > options.left)
        ) {
            console.warn('tolerance must be less then left and right');
        }
    }

    _closeAll = function (groupNumber) {
        this._elems.forEach(function (Swiped) {
            if (Swiped.group === groupNumber) {
                Swiped.close(true);
            }
        });
    };

    transitionEnd = (node, cb) => {
        let that = this;

        let trEnd = () => {
            cb.call(that);
            node.removeEventListener(this.transitionEvent, trEnd);
        };

        node.addEventListener(this.transitionEvent, trEnd);
    };
    /**
     * swipe.x - initial coordinate Х
     * swipe.y - initial coordinate Y
     * swipe.delta - distance
     * swipe.startSwipe - swipe is starting
     * swipe.startScroll - scroll is starting
     * swipe.startTime - necessary for the short swipe
     * swipe.touchId - ID of the first touch
     */

    touchStart = (e) => {
        let touch = e.changedTouches[0];

        if (e.touches.length !== 1) {
            return;
        }

        this.touchId = touch.identifier;
        this.x = touch.pageX;
        this.y = touch.pageY;
        this.startTime = new Date();

        this.resetValue();

        if (this.list) {
            this._closeAll(this.group);
        } else {
            this.close(true);
        }
    };

    touchMove = function (e) {
        let touch = e.changedTouches[0];

        // touch of the other finger
        if (!this.isValidTouch(e)) {
            return;
        }

        this.delta = touch.pageX - this.x;

        this.dir = this.delta < 0 ? -1 : 1;
        this.width = this.delta < 0 ? this.right : this.left;

        this.defineUserAction(touch);

        if (this.startSwipe) {
            this.move();

            //prevent scroll
            e.preventDefault();
        }
    };

    touchEnd = function (e) {
        if (!this.isValidTouch(e, true) || !this.startSwipe) {
            return;
        }

        // if swipe is more then 150px or time is less then 150ms
        if (this.dir * this.delta > this.tolerance || <any>new Date() - this.startTime < this.time) {
            this.open();
        } else {
            this.close();
        }

        e.stopPropagation();
        e.preventDefault();
    };

    /**
     * Animation of the opening
     */
    open = function (isForce) {
        this.animation(this.dir * this.width);
        this.swiped = true;

        if (!isForce) {
            this.transitionEnd(this.elem, this.onOpen);
        }

        this.resetValue();
    };

    /**
     * Animation of the closing
     */
    close = function (isForce) {
        this.animation(0);
        this.swiped = false;

        if (!isForce) {
            this.transitionEnd(this.elem, this.onClose);
        }

        this.resetValue();
    };

    toggle = function () {
        if (this.swiped) {
            this.close();
        } else {
            this.open();
        }
    };

    /**
     * reset to initial values
     */
    resetValue = function() {
        this.startSwipe = false;
        this.startScroll = false;
        this.delta = 0;
    };

    _bindEvents = () => {
        if (this.eventBinded) {
            return false;
        }

        this.delegate(this.touch.move, 'touchMove');
        this.delegate(this.touch.end, 'touchEnd');
        this.delegate(this.touch.start, 'touchStart');

        this.delegate(this.mouse.move, 'touchMove');
        this.delegate(this.mouse.end, 'touchEnd');
        this.delegate(this.mouse.start, 'touchStart');

        this.eventBinded = true;
    };

    /**
     * detect of the user action: swipe or scroll
     */
    defineUserAction = function (touch) {
        let DELTA_X = 10;
        let DELTA_Y = 10;

        if (Math.abs(this.y - touch.pageY) > DELTA_Y && !this.startSwipe) {
            this.startScroll = true;
        } else if (Math.abs(this.delta) > DELTA_X && !this.startScroll) {
            this.startSwipe = true;
        }
    };

    /**
     * Which of the touch was a first, if it's a multitouch
     * touchId saved on touchstart
     * @param {object} e - event
     * @returns {boolean}
     */
    isValidTouch = (e, isTouchEnd) => {
        // take a targetTouches because need events on this node
        // targetTouches is empty in touchEnd, therefore take a changedTouches
        let touches = isTouchEnd ? 'changedTouches' : 'targetTouches';

        return e[touches][0].identifier === this.touchId;
    };

    move = () => {
        if ((this.dir > 0 && (this.delta < 0 || this.left === 0)) || (this.dir < 0 && (this.delta > 0 || this.right === 0))) {
            return false;
        }

        let deltaAbs = Math.abs(this.delta);

        if (deltaAbs > this.width) {
            // linear deceleration
            this.delta = this.dir * (this.width + (deltaAbs - this.width) / 8);
        }

        this.animation(this.delta, 0);
    };

    animation = (x, duration) => {
        duration = duration === undefined ? this.duration : duration;

        this.elem.style.cssText = this.cssProps.transition + ':' + this.cssProps.transform + ' ' + duration + 'ms; ' +
            this.cssProps.transform + ':' + 'translate3d(' + x + 'px, 0px, 0px)';
    };

    destroy = (isRemoveNode) => {
        let id = this.id;

        this._elems.forEach(function (elem, i) {
            if (elem.id === id) {
                this._elems.splice(i, 1);
            }
        });

        if (isRemoveNode) {
            this.elem.parentNode.removeChild(this.elem);
        }
    };

    private delegate(event, cbName) {
        document.addEventListener(event, (e) => {
            this._elems.forEach(function (Swiped) {
                let target = e.target;

                while (target) {
                    if (target === Swiped.elem) {
                        Swiped[cbName](e);

                        return false;
                    }
                    target = target.parentNode;
                }

                return false;
            });
        });
    }

    private extend(current, options) {

        for (let i in options) {
            if (options.hasOwnProperty(i)) {
                current[i] = options[i];
            }
        }

        return current;
    }
}