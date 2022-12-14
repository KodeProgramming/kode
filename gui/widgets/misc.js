/*****
 * Copyright (c) 2017-2022 Kode Programming
 * https://github.com/KodeProgramming/kode/blob/main/LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*****/


/*****
 * WHtml, WHead, and WBody are widget wrappers for the entire HTML document, the
 * HEAD, and the BODY elements respectively.  These are classes for specific
 * HTML elements because of their overall significance for the doc structure.
 * As needed, specialized features will be added to each of these classes to
 * help manage, encapsulate, and minimize the code throughtout the framework.
*****/
register(class WHtml extends Widget {
    constructor(doc) {
        super(doc.getHtml());
    }
});


/*****
 * WHtml, WHead, and WBody are widget wrappers for the entire HTML document, the
 * HEAD, and the BODY elements respectively.  These are classes for specific
 * HTML elements because of their overall significance for the doc structure.
 * As needed, specialized features will be added to each of these classes to
 * help manage, encapsulate, and minimize the code throughtout the framework.
*****/
register(class WHead extends Widget {
    constructor(doc) {
        super(doc.getHead());
    }
});


/*****
 * WHtml, WHead, and WBody are widget wrappers for the entire HTML document, the
 * HEAD, and the BODY elements respectively.  These are classes for specific
 * HTML elements because of their overall significance for the doc structure.
 * As needed, specialized features will be added to each of these classes to
 * help manage, encapsulate, and minimize the code throughtout the framework.
*****/
register(class WBody extends WStack {
    constructor(doc) {
        super(doc.getBody());
    }
});


/*****
 * A hot spot is implemented as a DIV and provides an alternative to using an A
 * element for interactive / responsive elements for clicking to invoke GUI
 * actions.  The framework approach is to encourage the use of the WLink for
 * anchors to external URLs and the use of WHotSpot for an item to invoked an
 * action on the GUI.  Warm spot and cold spot are analogs.
*****/
register(class WSpot extends Widget {
    constructor(display) {
        super('div');
        this.display = display ? display : value => value.toString();
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
        this.set(this.display(value));
        return this;
    }
});

register(class WHotSpot extends WSpot {
    constructor(display) {
        super(display);
        this.setWidgetStyle('hotspot');
    }
});

register(class WWarmSpot extends WSpot {
    constructor(display) {
        super(display);
        this.setWidgetStyle('warmspot');
    }
});

register(class WColdSpot extends WSpot {
    constructor(display) {
        super(display);
        this.setWidgetStyle('coldspot');
    }
});
