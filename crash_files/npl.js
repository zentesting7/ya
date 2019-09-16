//  Thanks to:
//  http://www.howtocreate.co.uk/tutorials/javascript/objects -- javaScript objects, private/public properties
//  http://dreaminginjavascript.wordpress.com/2008/07/04/28/ -- javascript operator tricks
//	http://www.hunlock.com/blogs/Closing_The_Book_On_Javascript_Closures -- Closures
//	http://www.thespanner.co.uk/2009/01/29/detecting-browsers-javascript-hacks/
//	http://stackoverflow.com/questions/76976/how-to-get-progress-from-xmlhttprequest
//	http://weblogs.asp.net/dwahlin/archive/2011/12/28/working-with-the-javascript-this-keyword.aspx 	-- an approach for objects, prototypes, private & public members.
/*

	STYLE GUIDE:
	
		 1. i, j, k are all local iterator variables. These should only be used to index
			values in arrays, and they should never ever show up in the global scope.
		 2. Internal variables and functions are lowercase and prepended with one underscore:
			_variable, _function
			These are items which might be globally or externally accessible, but aren't guaranteed
			to be supported in the future. Other scripts should avoid referencing them, but it's
			not forbidden.
		 3. Private variables and methods are lowercase and prepended with two underscores:
			__variable, __function
			These should never appear in the global scope, or outside of any function or object.
		 5. Functions should generally avoid modifying their parameters.
		 6. Undefined members are checked using typeof member == 'undefined'; see also
			http://stackoverflow.com/questions/776950/javascript-undefined-undefined
		 7. SPEED, SPEED, SPEED. All code should have a _brutal_ emphasis on speed.
			That includes keeping the code concise, because the size of the code matters too.
		 8. Comments should explain _what_ is being done (i.e., answer "why"), rather than "how".
		 9. Use TODO to mark items that need to be taken care of in future versions.
		10. Use BUGFIX to mark items that produce errors, or potentially produce errors, and should
			be fixed soon.
		
*/

/*

	TODO:
		Switch to web workers (where available):
		1. Have Turbine handle script fragments, e.g.: /js/npl/[version]/effects/fade_in.js
		2. Spawn these as Worker threads
		3. Workers communicate with NPL core to manipulate DOM (...possible?)
		https://developer.mozilla.org/En/Using_web_workers
		PROGRESS: 0%
	
	TODO:
		jquery selector compatibility
		PROGRESS: ~50%
	
	TODO:
		jquery API compatibility
		PROGRESS: 0%
	
	TODO:
		Get Turbine to minify the resulting js, or not, depending:
			/js/npl/[version]&[module]&[module]&mini (default) or &nomini (full version)
		PROGRESS: 0%
	
	TODO:
		Run tests, see if an entirely new selector engine would speed things up much.
		Try: using the tokenizer-state-parser approach from Shomi; and ridiculously complex RegEx.
		RegEx should be pre-compiled (i.e., create and store RegEx objects) for max performance.
		PROGRESS: 0%;
	
	TODO:
		Continued performance enhancements, shrinking code base
		1. document -> $._d; window -> $._w
		PROGRESS: epsilon.

	TODO:
		ElementSet.next() -- replace wonky ElementSet.element() behavior.

*/

if ( typeof array_pos == 'undefined' )
{
	if ( Array.prototype.indexOf )
	{
		function array_pos(value, search)
		{
			return search.indexOf(value);
		}
	}
	else
	{
		function array_pos(value, search)
		{
			//	Returns the index of <value> in the array <search>.
			var i = search.length;
			while ( i-- && value !== search[i] ) ;
			return i;
		}
	}
}

if ( typeof in_array == 'undefined' )
{
	function in_array (value, search, strict)
	{
		//	Returns true if <value> is in <search>.
		if (! is_array(value)) return array_pos(value, search) >= 0;
		//	Do an array-to-array comparison, return true only if
		//	<search> contains all the elements of <value>.
		if (strict)
		{
			//	Only return true if <search> contains at least as many
			//	duplicate elements as <value> ... e.g.,
			//	<search> = ['apple', 'banana', 'orange', 'pear']
			//	<values> = ['apple', 'apple'];
			//	...will return true if ! <strict>, false if <strict>.
			var i, j, _value;
			_value = value.slice();
			i = search.length;
			while (i-- && _value.length)
			{
				j = array_pos(search[i], _value);
				if (j >= 0) _value.splice(j, 1);
			}
			return _value.length == 0;
		}
		//	This approach is surprisingly faster than array_flip()/typeof-undefined/early-return.
		var i = value.length;
		while (i--)
		{
			if (array_pos(value[i], search) < 0) return false;
			//	It's tempting to reduce the search space for subsequent
			//	searches by deleting matched items from <search> (array.splice)
			//	but some fairly thorough testing finds that that approach is
			//	actually slower, even if the search space is inverted (so
			//	that each element of <search> is looked at exactly once and
			//	compared against the elements of <value>).
		}
		return true;
	}
}

if ( typeof union == 'undefined' )
{
	function union ()
	{
		//	Return a new array with the elements of each input
		//	array merged together and deduplicated.
		//	There are several approaches for this. I chose one that
		//	maintains the sort order of each input array.
		//	Avoid calling this, it's not fast.
		var i, j, current, merged;
		merged = [];
		i = 0;
		while ( i < arguments.length )
		{
			if ( is_array(arguments[i]) )
			{
				current = arguments[i].slice();
				current.reverse();
				j = current.length;
				while (j--)
				{
					if ( ! in_array(current[j], merged) ) merged.push(current[j]);
				}
			}
			i++;
		}
		return merged;
	}
}

if ( typeof is_string == 'undefined' )
{
	//	http://blog.niftysnippets.org/2010/09/say-what.html
	function is_string (value)
	{
		return toString.call(value) == '[object String]';
	}
}

if ( typeof is_array == 'undefined' )
{
	function is_array (value)
	{
		return toString.call(value) == '[object Array]';
	}
}

if ( typeof is_object == 'undefined' )
{
	function is_object (value)
	{
		return toString.call(value) == '[object Object]';
	}
}

//	http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
if ( typeof is_dom_node == 'undefined' )
{
	function is_dom_node (value)
	{
		return (typeof Node == 'object' ? value instanceof Node : value && typeof value == 'object' && typeof value.nodeType == 'number' && typeof value.nodeName == 'string');
	}
}

if ( typeof is_html_element == 'undefined' )
{
	function is_html_element (value)
	{
		return (typeof HTMLElement == 'object' ? value instanceof HTMLElement : value && typeof value == 'object' && value !== null && value.nodeType === 1 && typeof value.nodeName == 'string');
	}
}

if ( typeof is_function == 'undefined' )
{
	function is_function (value)
	{
		//	From http://jsperf.com/alternative-isfunction-implementations/9
		//	Always choose slow & correct over fast & wrong.
		return !!(value && {}.toString.call(value) == '[object Function]');
	}
}

if ( typeof is_elementset == 'undefined' )
{
	function is_elementset (value)
	{
		return toString.call(value) == '[object Object]' && typeof value._npl != 'undefined' && value._npl;
	}
}

if ( typeof is_number == 'undefined' )
{
	function is_number (value)
	{
		return !isNaN(parseFloat(value)) && isFinite(value);
	}
}

if ( typeof is_integer == 'undefined' )
{
	function is_integer (value)
	{
		return parseInt(value, 10) == value;
	}
}

//	escape_regex(): escape common regex special characters in an input string.
if ( typeof escape_regex == 'undefined' )
{
	function escape_regex (string)
	{
		return string.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
	}
}

//	Array.search(): return an array of elements from the current array that match
//	a regular expression.
if ( ! Array.prototype.search )
{
	Array.prototype.search = function (expression)
	{
		var matches = [];
		var n = this.length;
		for ( var i = 0; i < n; i++ )
		{
			if ( expression.test(this[i]) ) matches.push(this[i]);
		}
		return matches;
	};
}

//	Array.extract(): return an array of elements from the current array that match
//	a regular expression, and remove those elements from the current array.
if (! Array.prototype.extract)
{
	Array.prototype.extract = function (expression)
	{
		var matches = [];
		for ( var i = 0; i < this.length; i++ )
		{
			if ( expression.test(this[i]) )
			{
				matches.push(this[i]);
				this.splice(i--, 1);
			}
		}
		return matches;
	}
}

//	Array.filter(): apply a true/false function to each element of an array and return
//	a new array with only the elements for which the function returned true.
if (! Array.prototype.filter)
{
	Array.prototype.filter = function(f/*, thisArg*/)
	{
		'use strict';
		if (this === void 0 || this === null) throw new TypeError();
		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof f !== 'function') throw new TypeError();
		var res = [];
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i = 0; i < len; i++)
		{
			if ( i in t && f.call(thisArg, t[i], i, t) ) res.push(t[i]);
		}
		return res;
	};
}

//	Add a push/concat-like function that actually works.
//	OK, so this is uncool to do, I know. Here's the thing:
//	concat() normally breaks if you pass it an object to
//	append to an array with other prototyped functions attached,
//	and push() doesn't nicely handle arrays as arguments in the
//	same situation (and Array.prototype.push.apply() seems to
//	have the same trouble as concat()).
//	This bug cost me an hour to figure out.
Array.prototype.append = function ()
{
	var e, i;
	for ( i = 0; i < arguments.length; i++ )
	{
		e = arguments[i];
		if ( is_array(e) )
		{
			for ( var j = 0; j < e.length; j++ ) this.push(e[j]);
			continue;
		}
		this.push(e);
	}
}

Array.prototype.push = function ()
{
	for ( var i = 0, n = arguments.length; i < n; i++ )
	{
		if ( is_array(arguments[i]) )
		{
			for ( var j = 0, l = arguments[i].length; j < l; j++ ) this[this.length] = arguments[i][j];
			continue;
		}
		this[this.length] = arguments[i];
	}
	return this.length;
}

//	String.trim(): trim whitespace from the beginning and end of a string.
if (! String.prototype.trim)
{
	(function() {
		// Make sure we trim BOM and NBSP
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		String.prototype.trim = function() {
			return this.replace(rtrim, '');
		};
	})();
}


_npl = function(){

	this._window = window;
	this._document = document;

	if ( arguments.length > 0 )
	{
		//this._document = ( arguments.length > 0 && {}.toString.call(arguments[0]) == '[object HTMLDocument]' ) ? arguments[0] : document;
		if ( {}.toString.call(arguments[0]) == '[object Window]' || ({}.toString.call(arguments[0]) == '[object global]' && arguments[0].toString() == '[object Window]' && arguments[0].hasOwnProperty('document')) )
		{
			this._window = arguments[0];
			this._document = arguments[0].document;
		}
		else if ( {}.toString.call(arguments[0]) == '[object HTMLDocument]' )
		{
			this._document = arguments[0];
		}
	}

	this.window = (function(parent){
		var _on_blur = false;
		var _on_focus = false;
		var _is_active = true;
		if ( typeof parent._window.innerWidth != 'undefined' )
		{
			var _width = function(){return parent._window.innerWidth};
			var _height = function(){return parent._window.innerHeight};
		}
		else if ( typeof parent._document.documentElement != 'undefined' )
		{
			var _width = function(){return parent._document.documentElement.clientWidth == 0 ? parent._document.getElementsByTagName('body')[0].clientWidth : parent._document.documentElement.clientWidth};
			var _height = function(){return parent._document.documentElement.clientHeight == 0 ? parent._document.getElementsByTagName('body')[0].clientHeight : parent._document.documentElement.clientHeight};
		}
		else if ( typeof parent._document.body != 'undefined' && typeof parent._document.body.clientWidth != 'undefined' )
		{
			var _width = function(){return parent._document.body.clientWidth};
			var _height = function(){return parent._document.body.clientHeight};
		}
		else
		{
			var _width = function(){return 0};
			var _height = function(){return 0};
		}

		parent._window.onfocus	= function(){_is_active = true};
		parent._window.onblur	= function(){_is_active = false};

		return {
			is_active: function()
			{
				return _is_active;
			},

			on_focus: function (pFunction)
			{
				if (typeof pFunction == 'undefined') return _on_focus;
				_on_focus = pFunction;
				parent._window.onfocus = function(){
					_is_active = true;
					_on_focus();
				};
			},

			on_blur: function (pFunction)
			{
				if (typeof pFunction == 'undefined') return _on_blur;
				_on_blur = pFunction;
				parent._window.onblur = function(){
					_is_active = false;
					_on_blur();
				};
			},

			width: function ()
			{
				return _width();
			},

			height: function ()
			{
				return _height();
			}
		};
	})(this);

	this.page = (function(parent){
		//  Private properties.
		var _onload = parent._window.onload;
		var _loaded = false, _initfunctions = [], _resizefunctions = [], _watchresize = false, _windowlastx = 0, _windowlasty = 0, _windowchanged = 0, _windowlastchg = 0;
		parent._window.onload = function(){
			//_document.onmousemove = function (pEvent) { NPL.Mouse.update(pEvent) };
			//if ( typeof window.captureEvents != 'undefined' ) { window.captureEvents(Event.MOUSEMOVE); }
			for ( var i = 0; i < _initfunctions.length; i++ ) { _initfunctions[i](); }
	        delete _initfunctions; 
	        if (_onload) _onload();
	        delete _onload;
	        _loaded = true;
		};

		return {
			_windowchanged: function ()
			{
				if ( typeof this._document.body.clientHeight != 'undefined' && typeof this._document.body.clientWidth != 'undefined' && _windowlastx == 0 && _windowlasty == 0 )
				{
					_windowlastx = this.window.width();
					_windowlasty = this.window.height();
					this.page._windowchanged = function(){
						if ( _windowlastx != this.window.width() || _windowlasty != this.window.height() )
						{
							_windowlastchg = (new Date()).getTime();
							_windowlastx = NPL.Window.Width();
							_windowlasty = NPL.Window.Height();
							if ( _windowchanged == 0 )
							{
								_windowchanged = 1;
								//	Signal that window has begun changing.
								if ( typeof _resizefunctions['begin'] != 'undefined' ) { for (var i=0;i<_resizefunctions['begin'].length;i++){_resizefunctions['begin'][i]('begin');}}
							}
							else
							{
		    					//	Signal that window is still changing.
		    					if ( typeof _resizefunctions['active'] != 'undefined' ) { for (var i=0;i<_resizefunctions['active'].length;i++){_resizefunctions['active'][i]('active');}}
		    				}
						}
						else if ( _windowchanged == 0 )
						{
							//	Signal that window has not changed.
							if ( typeof _resizefunctions['quiet'] != 'undefined' ) { for (var i=0;i<_resizefunctions['quiet'].length;i++){_resizefunctions['quiet'][i]('quiet');}}
						}
						else if ( (new Date()).getTime() - _windowlastchg > 3000 )
						{
							_windowchanged = 0;
							//	Signal that window has stopped changing.
							if ( typeof _resizefunctions['end'] != 'undefined' ) { for (var i=0;i<_resizefunctions['end'].length;i++){_resizefunctions['end'][i]('end');}}
						}
					}
				}
			},

            on_load: function (pInitFunction)
			{
				if ( ! _loaded )
				{
			    	_initfunctions[_initfunctions.length] = pInitFunction;
			    }
			    else
			    {
			    	pInitFunction();
			    }
			},
			
			on_resize: function (pResizeCode, pResizeFunction)
			{
				switch ( pResizeCode )
				{ case 'begin':case 'end':case 'active':case 'quiet':
					if (typeof _resizefunctions[pResizeCode] == 'undefined') _resizefunctions[pResizeCode] = [];
					_resizefunctions[pResizeCode][_resizefunctions[pResizeCode].length] = pResizeFunction;
					if ( _watchresize == false )
					{
						_watchresize = true;
						setInterval(function(){NPL.page._windowchanged()}, 1000);
					}
				}
			},

			width: function ()
			{
				//	Bugfix 10/12/2009: Safari's braindead javascript engine returns "NaN" if you
				//	try to turn the following code into a terniary operation:
				//	return document.width ? parseInt(document.width) : parseInt(document.body.clientWidth);
				if (typeof parent._document.width != 'undefined') return parseInt(parent._document.width);
			    return parseInt(parent._document.body.clientWidth);
			}
		};
	})(this);

	this.parse_selector = function (selector)
	{
		if (! is_string(selector)) return Array();
		var i, n, x, y, parsed, chunk, tag;
		selector = selector.trim();
		parsed = [];
		for ( i = 0, n = selector.length; i < n; i++ )
		{
			for ( chunk = {}, tag = ''; i < n && selector.charAt(i) != ' '; i++ )
			{
				switch ( selector.charAt(i) )
				{
					case '#':
						x = (x = selector.indexOf(' ', ++i)) < 1 ? n : x;
						y = (y = selector.indexOf('[', i)) < 1 ? n : y;
						x = x < y ? x : y;
						chunk.id = selector.substring(i, i = x);
						i--;
						break;
					case '.':
						x = (x = selector.indexOf(' ', ++i)) < 1 ? n : x;
						y = (y = selector.indexOf('[', i)) < 1 ? n : y;
						x = x < y ? x : y;
						chunk.classnames = selector.substring(i, i = x).split('.');
						i--;
						break;
					case '[':
						//	attribute selector.
						x = selector.indexOf(']', i);
						if ( !x )
						{
							//	Selector looks like: "tag[attr". Throw it out.
							i = selector.indexOf(' ', i) - 1;
							if ( i < 1 ) i = n;
							break;
						}
						var attr = selector.substring(++i, i = x);
						var value = '';
						var modifier = '';
						//	See if the attribute selector specifies a value.
						x = attr.indexOf('=');
						if (x == 0) break;		//	Selector looks like: "tag[=..". Throw it out.
						if (x > 0)
						{
							value = attr.substring(x+1);
							attr = attr.substring(0, x);
							//	Should now have a key-value pair.
							//	The last character of attr may be "|" or "~" which modify the way that attributes match.
							switch (attr.charAt(attr.length-1))
							{ case '|':case'~':
								modifier = attr.charAt(attr.length-1);
							}
						}
						//	Trim quotes.
						if (attr.charAt(0) == '"' && attr.charAt(attr.length-1) == '"') attr = attr.substring(1,attr.length-1);
						if (value.charAt(0) == '"' && value.charAt(value.length-1) == '"') value = value.substring(1,value.length-1);
						if ( attr.length > 0 )
						{
							if (! chunk.attrs) chunk.attrs = {};
							//	The selection code later on will look for a modifier at the beginning of value.
							chunk.attrs[attr] = modifier != '' ? modifier + value : value;
						}
						break;
					default:
						tag += selector.charAt(i);
				}
			}
			if (tag.length) chunk.tag = tag;
			parsed.push(chunk);
		}
		return parsed;
	};

	this.select = function (selector, elements)
	{
		if (! is_string(selector)) return new _npl_elementset(selector);
		if (typeof elements == 'undefined')		elements = [this._document]
		else if (is_elementset(elements))		elements = elements.elements()
		else if (! is_array(elements))			elements = [elements];
		elements = new _npl_elementset(elements);
		return elements.select(selector);
	};

	this.new_uid = (function()
	{
		var _uidcount = 1;
		return function(){return (++_uidcount).toString() + (new Date()).getTime().toString().substring(6) + (1000 + ~~(Math.random() * 1000)).toString();};
	})();

	this._http = function(pParameters)
	{
		//	Parameters:
		//		method: required; 'post', 'put', or 'get'
		//		uri: required
		//		callback: optional
		//		parameters: optional; only used in post requests
		//	Use http_get or http_post instead; this is an internal function they call.
		var xRequest = {'xhr': new XMLHttpRequest(), 'uri': '', 'callback': false, 'data': ''};
		var content_type = '';
		if ( pParameters.hasOwnProperty('uri') )
		{
			xRequest['uri'] = pParameters['uri'];
			if ( pParameters.hasOwnProperty('callback') && is_function(pParameters['callback']) )
			{
				xRequest['callback'] = pParameters['callback'];
				xRequest['xhr']['onreadystatechange'] = (function(){
					return function(){
						if ( xRequest['xhr']['readyState'] == 4 )
						{
							xRequest['callback'].call(xRequest.xhr, xRequest);
						}
					};
				})();
			}
			if ( pParameters.hasOwnProperty('data') )
			{
				xRequest['data'] = pParameters['data'];
			}
			if ( pParameters.hasOwnProperty('method') )
			{
				if ( pParameters['method'] == 'get' )
				{
					xRequest['xhr'].open('GET', xRequest['uri'], xRequest['callback'] !== false);
					xRequest['xhr'].send(xRequest['data']);
				}
				else if ( pParameters['method'] == 'post' || pParameters['method'] == 'put' )
				{
					if ( is_object(xRequest['data']) || is_array(xRequest['data']) )
					{
						//	Convert the object data to a JSON string.
						xRequest['data'] = JSON.stringify(xRequest['data']);
						content_type = 'application/json';
					}
					else if ( is_string(xRequest['data']) )
					{
						content_type = 'application/x-www-form-urlencoded';
					}
					if ( content_type != '' )
					{
						//	http://stackoverflow.com/questions/7210507/ajax-post-error-refused-to-set-unsafe-header-connection
						xRequest['xhr'].open(pParameters['method'].toUpperCase(), xRequest['uri'], xRequest['callback'] !== false);
						xRequest['xhr'].setRequestHeader('Content-type', content_type);
						xRequest['xhr'].send(xRequest['data']);
					}
				}
			}
		}
		return xRequest;
	};

	this.http_get = function ()
	{
		//	Parameters:
		//		1: URI
		//		2: Callback (optional)
		if ( arguments.length > 1 ) return this._http({'method': 'get', 'uri': arguments[0], 'callback': arguments[1]});
		if ( arguments.length > 0 ) return this._http({'method': 'get', 'uri': arguments[0]});
		return this._http({});
	};

	this.http_post = function ()
	{
		//	Parameters:
		//		1: URI
		//		2: Data (optional)
		//		3: Callback (optional)
		if ( arguments.length > 2 ) return this._http({'method': 'post', 'uri': arguments[0], 'data': arguments[1], 'callback': arguments[2]});
		if ( arguments.length > 1 ) return this._http({'method': 'post', 'uri': arguments[0], 'data': arguments[1]});
		if ( arguments.length > 0 ) return this._http({'method': 'post', 'uri': arguments[0]});
		return this._http({});
	};

	this.http_put = function ()
	{
		//	Parameters:
		//		1: URI
		//		2: Data (optional)
		//		3: Callback (optional)
		if ( arguments.length > 2 ) return this._http({'method': 'put', 'uri': arguments[0], 'data': arguments[1], 'callback': arguments[2]});
		if ( arguments.length > 1 ) return this._http({'method': 'put', 'uri': arguments[0], 'data': arguments[1]});
		if ( arguments.length > 0 ) return this._http({'method': 'put', 'uri': arguments[0]});
		return this._http({});
	};

	this.new_image = function (pImageURI)
	{
    	var xImage = this._document.createElement('img');         //  Can't use "new Image()", Safari will choke on it later.
    	xImage.src = pImageURI;
		//	Try attaching the image to the document tree?
		//	Internet Explorer will mysteriously shrink the image down
		//	to 28x28 if the image is attached to an element at any point in its
		//	load process. *sigh*
		//	Some browsers (ahem, Safari) do an annoying job of never supplying any
		//	information on properties for an object unless it's been attached to the document
		//	tree. Sooooo .... LoadImage now has its very own hidden element to pre-attach images.
		//	Can't set display to 'none' or Safari 2 will still refuse to set properties for dynamically loaded images.
		var xMagic = this.select('#__NPL__LoadImageMagic');
    	if ( xMagic.count == 0 )
    	{
			xMagic = this.select(this._document.createElement('div'));
			xMagic.setAttr('id', '__NPL__LoadImageMagic').setAttr('style', 'top: -5000px; position: absolute');
			this._document.body.appendChild(xMagic.element());
			//	Safari will not handle style operations on an element until it's attached to the document.
			xMagic.left(-5000).width(0).height(0).style('overflow', 'hidden');
		}
		xMagic.element().appendChild(xImage);
    	return this.select(xImage);
	};

	this.new_task = function (run_function)
	{
		var __taskFunction = run_function;
		var __taskTimeoutID = 0;
		
		var __taskObject = {
		
			start: function (delay_ms)
			{
				__taskObject.run = function () {
					var wait_ms = __taskFunction.call(__taskObject);
					if (wait_ms > 0) __taskTimeoutID = setTimeout(__taskObject.run, wait_ms);
					else { __taskObject.run = function(){}; }
				};
				__taskTimeoutID = setTimeout(__taskObject.run, typeof delay_ms == 'undefined' ? 5 : delay_ms);
			},
			
			run: function(){},
			
			stop: function () { __taskObject.run = function(){} },
			
			end: function() { __taskObject.run = function(){} }
		};
		
		return __taskObject;
	};

	this.clone_to = function (pObject)
	{
		//	Create an NPL object and attach it to pObject.
		if (! pObject.hasOwnProperty('_npl')) pObject._npl = _npl;
		if ( ! pObject.hasOwnProperty('NPL') )
		{
			//	At the moment, {}.toString().call(pObject) gives '[object global]', which screws
			//	with the type detection in the _npl constructor.
			//	So, figure it out here and then pass the correct thing to the constructor.
			//	Annoyingly, {}.toString().call(pObject.window) also == '[object global]', but
			//	pObject.window.toString() is '[object Window]'...
			if ( pObject.hasOwnProperty('window') && ({}.toString.call(pObject.window) == '[object Window]' || ({}.toString.call(pObject.window) == '[object global]' && pObject.window.toString() == '[object Window]' && pObject.window.hasOwnProperty('document'))) )
			{
				pObject.NPL = new pObject._npl(pObject.window);
			}
			else if ( pObject.hasOwnProperty('document') && {}.toString.call(pObject.document) == '[object HTMLDocument]' )
			{
				pObject.NPL = new pObject._npl(pObject.document);
			}
			else
			{
				pObject.NPL = new pObject._npl();
			}
		}
		if (! pObject.hasOwnProperty('$')) pObject.$ = function(){return pObject.NPL.select.apply(pObject.NPL, arguments)};
		if ( ! pObject.hasOwnProperty('_npl_elementset') )
		{
			pObject._npl_elementset = _npl_elementset;
			pObject._npl_elementset.prototype = new _npl_elementset(document);
		}
	};

};

_npl_elementset = function (pElements)
{
	if ( is_array(pElements) )
	{
		this._elements = pElements;
	}
	else if ( is_html_element(pElements) || is_dom_node(pElements) )
	{
		this._elements = [pElements];
	}
	else if ( is_object(pElements) && pElements._npl )
	{
		this._elements = pElements.elements();
	}
	else if ( typeof pElements == 'undefined' || pElements === null )
	{
		//	A child class is inheriting from this class maybe?
		this._elements = [];
	}
	else
	{
		//	???
		this._elements = pElements;
		try
		{
			throw new Error('_npl_elementset constructor: warning: unhandled parameter: ' + pElements);
		}
		catch (err)
		{
			console.log(err.stack);
		}
	}
	this._index = 0;
	this.count = this.length = typeof this._elements != 'undefined' ? this._elements.length : 0;
};


_npl_elementset.prototype._npl = true;


//     _for_all_do and _for_all_get are meta functions with horrible syntax
//     and wonderful utility. Pass them a function as the first parameter and
//     up to four other parameters, and they'll call the function with the
//     four parameters on each of the elements in the set.
_npl_elementset.prototype._for_all_do = function(f)
{
	var i = 0, n = this.count, fn = f;
	while ( i < n ) { arguments[0] = this._elements[i++]; fn.apply(this, arguments); }
	return this;
}


_npl_elementset.prototype._for_all_get = function(f)
{
	var i = 0, n = this.count, fn = f, x = [];
	while ( i < n ) { arguments[0] = this._elements[i++]; x.push(fn.apply(this, arguments)); }
	return x.length == 1 ? x[0] : x;
}


_npl_elementset.prototype._assumePixelUnits = {'top': true, 'bottom': true, 'left': true, 'right': true, 'height': true, 'width': true, 'max-height': true, 'max-width': true, 'margin-right': true, 'margin-left': true, 'margin-top': true, 'margin-bottom': true, 'text-indent': true};


_npl_elementset.prototype._camelCaser = (function()
{
	var _camelCases = {width:'width', height:'height', float:'cssFloat'};
	var _camelizer = /\-(.)/g;
	return function(p)
	{
		//  Notes on below:
		//  The anonymous function in replace accepts the string (x) and the first sub string match (y), and then returns
		//  the string to replace the match with. This is due to IE's (correct) use of camelCase for its css selectors. 
		//  http://www.quirksmode.org/dom/getstyles.html
		//  Replace: https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/String/Replace
		//	Note: According to David Mark, this use of replace() (using a function for the replacer) breaks compatibility with Safari 2.
		//	Probably not worth fixing in this case, but maybe revisit later.
		return typeof _camelCases[p] != 'undefined' ? _camelCases[p] : _camelCases[p] = p.toLowerCase().replace(_camelizer, function(x, y){return y.toUpperCase()});
	}
})();


_npl_elementset.prototype._set_E_Style = function (e,a,v)
{
	if ( document.defaultView && document.defaultView.getComputedStyle )
	{
	    //  Notes on below:
	    //  Tested with Firefox 1 -> 3.5. There was a previous note here that Firefox didn't
	    //	use camelCase, but that appears to be incorrect.
	    //  (Some versions of) Safari will literally hang if getComputedStyle returns null.
	    //	Safari v5 has apparently abandoned getComputedStyle for font-size and who-knows-what-else.
		_npl_elementset.prototype._get_E_Style = function(e,a){
			a=this._camelCaser(a);
			if (a=='fontSize') return e.style[a];
			var s=document.defaultView.getComputedStyle(e, null);
			return typeof s[a] == 'undefined' ? '' : s[a]
		};
	}
	else if ( e.currentStyle )
	{
	    _npl_elementset.prototype._get_E_Style = function(e,a){a=this._camelCaser(a);return e.currentStyle[a] ? e.currentStyle[a] : ''};
	}
	else
	{
	   _npl_elementset.prototype._get_E_Style = function(e,a){return ''};
	}
	_npl_elementset.prototype._set_E_Style = function(e,a,v){
		if(e.style)
		{
			a = this._camelCaser(a);
			//	Assume pixel-size declarations for any numbers without units.
			e.style[a] = ( (this._assumePixelUnits[a] && !isNaN(v) && isFinite(v)) ) ? v + 'px' : v;
		}
	};
	if (typeof v == 'undefined') return this._get_E_Style(e,a);
	this._set_E_Style(e,a,v);
};
_npl_elementset.prototype._get_E_Style = function(e,a){return this._set_E_Style(e,a)};


_npl_elementset.prototype._set_E_Class = function(e,c)
{
	if ( typeof e.className != 'undefined' )
	{
		_npl_elementset.prototype._get_E_Class = function(e){return e.className};
		_npl_elementset.prototype._set_E_Class = function(e,c){e.className=c};
	}
	else if ( typeof e.getAttribute != 'undefined' )
	{
		_npl_elementset.prototype._get_E_Class = function(e){return e.getAttribute('class')};
		_npl_elementset.prototype._set_E_Class = function(e,c){e.setAttribute('class', c)};
	}
	else
	{
		_npl_elementset.prototype._get_E_Class = function(e){return ''};
		_npl_elementset.prototype._set_E_Class = function(e,c){};
	}
	if (typeof c == 'undefined') return this._get_E_Class(e);
	this._set_E_Class(e,c);
}
_npl_elementset.prototype._get_E_Class = function(e){return this._set_E_Class(e)}


if ( typeof document.getElementById == 'object' )
{
	//	IE7.
	//	See also http://www.codingforums.com/archive/index.php/t-152936.html
	//	and http://www.nczonline.net/blog/2007/12/13/ie-com-reers-its-ugly-head/
	//	Even better, I also apparently can not use "for ( y in _iesucks )",
	//	because Internet Explorer does indeed munch much ass.
	_npl_elementset.prototype._get_E_ElementsByTag = function (e,t)
	{
		var children = e.getElementsByTagName(t);
		var y = children.length;
		var elements = [];
		while (y--) elements.push(children[y]);
		elements.reverse();
		return elements;
	}
}
else
{
	_npl_elementset.prototype._get_E_ElementsByTag = function (e,t)
	{
		return Array.prototype.slice.call(e.getElementsByTagName(t));
	}
}


_npl_elementset.prototype._get_E_ElementsByClassName = function (e,c)
{
	//	node.getElementsByClassName is only supported by IE9 and later.
	//	So a polyfill is provided.
	//	<c> should be a space-separated list of classes.
	if (! e.getElementsByClassName)
	{
		_npl_elementset.prototype._get_E_ElementsByClassName = function(e,c)
		{
			var node = new _npl_elementset(e);
			return node.getElementsByTagName('*').filter('.' + (c.split(' ').join('.')));
		}
	}
	else
	{
		if ( typeof document.getElementById == 'object' )
		{
			//	See IE-related notes above in _get_E_ElementsByTag().
			_npl_elementset.prototype._get_E_ElementsByClassName = function (e,c)
			{
				var children = e.getElementsByClassName(c);
				var y = children.length;
				var elements = [];
				while (y--) elements.push(children[y]);
				elements.reverse();
				return elements;
			}
		}
		else
		{
			_npl_elementset.prototype._get_E_ElementsByClassName = function (e,c)
			{
				return Array.prototype.slice.call(e.getElementsByClassName(c));
			}
		}
	}
	return this._get_E_ElementsByClassName(e,c);
}


_npl_elementset.prototype._get_E_Loaded = function(e)
{
	_npl_elementset.prototype._get_E_Loaded = typeof e.complete != 'undefined' ? function(e){return e.complete} : function(e){return true};
	return this._get_E_Loaded(e);
}


/*
	TODO: separate 'width' and 'height' out into 'displayWidth', 'displayHeight', 'innerWidth', and 'innerHeight',
	to clear up ambiguities between various issues with various browsers.
*/
_npl_elementset.prototype.width = function (pWidth)
{
	if ( typeof pWidth == 'undefined' )
	{
		return this._for_all_get(function(e){
    		//	Avoid calling _get_E_Style if possible because
    		//	_get_E_Style uses getComputedStyle() in Firefox which
    		//	is HOLY MOSES SLOW.
			return e.offsetWidth;
		});
	}
	pWidth = parseInt(pWidth);
	if (pWidth < 0) return this;
	return this._for_all_do(function(e, v){
		this._set_E_Style(e, 'width', v+'px');
		//	The goal here is to ensure that e.offsetWidth matches v.
		//	css/js sucks. There is no way to automatically set a width
		//	which will match a subsequent width() query without dinking
		//	around with the element a bit, because getComputedStyle() is
		//	slow as balls and none of e.offsetWidth or e.clientWidth or
		//	any of the other properties actually ever match the width
		//	set by element style. Laaaaaame.
		if ( v - e.offsetWidth != 0 && e.parentElement != null )
		{
			this._set_E_Style(e, 'width', 2*v - e.offsetWidth);
		}
	}, pWidth);
};


/*

	A brief rant about height values (in Firefox, not tested for other browsers yet):
	Elements expose clientHeight, offsetHeight, and scrollHeight values -- and NONE of these
	match the height value returned from a style attribute. The height returned by the style
	query does not include the element's padding.

*/

//	Set or return the style height of the element.
_npl_elementset.prototype.height = function (pHeight)
{
	/*
		Sigh. Add offsetHeight to the list of crap in Firefox which is unacceptably slow.
		There does not seem to be any alternative.
	*/
    if ( typeof pHeight == 'undefined' ) {
    	return this._for_all_get(function(e){return e.offsetHeight});
    }
    return this._for_all_do(function(e, v){this._set_E_Style(e, 'height', v)}, typeof pHeight == 'number' ? pHeight + 'px' : pHeight);
};


//	Set or return the height of the element, including borders, not including the entire scrollable area.
_npl_elementset.prototype.borderedHeight = function (pHeight)
{
	if (typeof pHeight == 'undefined') ;
	return this;
};


//	Set or return the height of the element, not including borders, including the entire scrollable area.
_npl_elementset.prototype.innerHeight = function (pHeight)
{
	if ( typeof pHeight == 'undefined' )
	{
		return this._for_all_get(function(e,o){
			switch (e.tagName.toLowerCase())
			{
				case 'iframe':
					if ( typeof e.contentDocument != 'undefined' )
					{
						return parseInt(e.contentDocument.body.scrollHeight);
					}
					else if ( typeof e.document != 'undefined' )
					{
						return parseInt(e.document.body.clientHeight);
					}
				case 'div': default:
					return e.scrollHeight;
			}
		},this);
	}
	return this;
};


//	Set or return the height of the element, not including borders, not including the entire scrollable area.
_npl_elementset.prototype.displayHeight = function (pHeight)
{
	if ( typeof pHeight == 'undefined' )
	{
		return this._for_all_get(function(e,o){
			switch(e.tagName.toLowerCase())
			{
				case 'div': default:
					return e.clientHeight;
			}
		},this);
	}
	return this._for_all_do(function(e,v){
		//	Set the displayHeight for the element. Need to calculate it according to the element's border height.
		if (typeof pHeight != 'number') pHeight = parseInt(pHeight);
		switch(e.tagName.toLowerCase())
		{
			case 'div': default:
				//	When setting height by the style attribute, the value should be the height
				//	not including padding or border:
				this._set_E_Style(e,'height', v - e.clientHeight + parseInt(this._get_E_Style(e,'height')) + 'px');
		}
	}, pHeight);
};


_npl_elementset.prototype.left = function (pLeft)
{
	if ( typeof pLeft == 'undefined' ) { return this._for_all_get(function(e){var _left=e.offsetLeft; while(typeof e.offsetParent != 'undefined' && (e=e.offsetParent)){_left += e.offsetLeft}; return _left}); }
	if (typeof pLeft == 'number') pLeft = parseInt(pLeft) + 'px';
	return this._for_all_do(function(e,l){e.style.left = l}, pLeft);
};


_npl_elementset.prototype.right = function (pRight)
{
	if ( typeof pRight == 'undefined' ) { return this._for_all_get(function(e){var _left=e.offsetLeft; var _width = e.offsetWidth; while(typeof e.offsetParent != 'undefined' && (e=e.offsetParent)){_left += e.offsetLeft}; return _left + _width}); }
	if (typeof pRight == 'number') pRight = parseInt(pRight) + 'px';
	return this._for_all_do(function(e,l){e.style.right = l}, pRight);
};


_npl_elementset.prototype.top = function (pTop)
{
	if ( typeof pTop == 'undefined' ) { return this._for_all_get(function(e){var _top=e.offsetTop; while(typeof e.offsetParent != 'undefined' && (e=e.offsetParent)){_top += e.offsetTop}; return _top}); }
	if (typeof pTop == 'number') pTop = parseInt(pTop) + 'px';
	return this._for_all_do(function(e,t){e.style.top = t}, pTop);
};


_npl_elementset.prototype.bottom = function ()
{
	return this._for_all_get(function(e){return NPL.select(e).top() + NPL.select(e).height()});
};


_npl_elementset.prototype.move = function (x, y)
{
	return this._for_all_do(function(e,x,y){
		if ( x != 0 )
		{
			var _x = parseInt(e.style.left);
			e.style.left = isNaN(_x) ? x+'px' : _x+x+'px';
		}
		if ( y != 0 )
		{
			var _y = parseInt($(e).top());
			e.style.top = isNaN(_y) ? y+'px' : _y+y+'px';
		}
	}, x, y);
};


_npl_elementset.prototype.style = function (pStyleAttr, pStyleValue)
{
    //  Return (or set) the values for pStyleAttr for each element.
    //  Note that IE will return "auto" for the CSS width of any element
    //  that has not actually had its width set by CSS. You might want to use
    //  the width() function instead.
    if ( typeof pStyleValue == 'undefined' )
    {
    	if ( typeof pStyleAttr == 'object' )
    	{
    		for ( var i in pStyleAttr )
    		{
    			this._for_all_do(function(e,a,v){this._set_E_Style(e,a,v)}, i, pStyleAttr[i]);
    		}
    		return this;
    	}
		else if ( typeof pStyleAttr == 'undefined' )
		{
			//	Return all of the style settings as a string instead.
			return this._for_all_get(function(e){
				var x = e.getAttribute('style');
				if ( typeof x == 'object' )
				{
					return '{' + e.style.cssText + '}';
				}
				return '{' + x + '}';
			});
		}
		else
		{
			return this._for_all_get(function(e, a){return this._get_E_Style(e, a)}, pStyleAttr);
		}
	}
	if ( is_number(pStyleValue) ) pStyleValue = parseInt(pStyleValue);
	//	This condition is being deprecated too. Use {property: value} objects to set styles.
	return this._for_all_do(function(e, a, v){this._set_E_Style(e, a, v)}, pStyleAttr, pStyleValue);
}


_npl_elementset.prototype.setAttr = function (pAttr, pValue)
{
	if (typeof pValue == 'undefined') return this._for_all_get(function(e,a){return e.getAttribute(a)}, pAttr);
	return this._for_all_do(function(e,a,v){e.setAttribute(a,v)}, pAttr, pValue);
}
_npl_elementset.prototype.getAttr = _npl_elementset.prototype.setAttr;

_npl_elementset.prototype.hasAttr = function (a)
{
	return this._for_all_get(function(e,a){v=e.getAttribute(a); return v != '' && v != null}, a);
}


_npl_elementset.prototype.setValue = function (pAttr, pValue)
{
	if (typeof pValue == 'undefined') return this._for_all_get(function(e){return e[pAttr]});
	return this._for_all_do(function(e,a,v){e[a]=v}, pAttr, pValue);
}
_npl_elementset.prototype.getValue = _npl_elementset.prototype.setValue;


_npl_elementset.prototype.opacity = function(pOpacity)
{
	for ( var i = 0; i < this._elements.length; i++ )
	{
		e = this._elements[i];
		if ( typeof e.style != 'undefined' )
	    {
	        if ( typeof e.style.opacity != 'undefined' )
	        {
	            _npl_elementset.prototype.opacity = function (pOpacity)
	            {
	            	if ( typeof pOpacity == 'undefined' ) { return this._for_all_get(function(e){return e.style ? e.style.opacity ? e.style.opacity : 1 : 1}); }
					return this._for_all_do(function(e,o){if (e.style) e.style.opacity = o;}, pOpacity);
	            }
	        }
	        else if ( typeof e.style.MozOpacity != 'undefined' )
	        {
	            _npl_elementset.prototype.opacity = function (pOpacity)
	            {
	            	if ( typeof pOpacity == 'undefined' ) { return this._for_all_get(function(e){return e.style ? e.style.MozOpacity ? e.style.MozOpacity : 1 : 1}); }
					return this._for_all_do(function(e,o){if (e.style) e.style.MozOpacity = o;}, pOpacity);
	            }
	        }
	        else if ( typeof e.style.filter != 'undefined' )
	        {
	            _npl_elementset.prototype.opacity = function (pOpacity)
	            {
	            	if ( typeof pOpacity == 'undefined' ) { return this._for_all_get(function(e){if (e.style){var xO=e.style.filter.match(/alpha\(opacity=([0-9]+)\)/); return (xO && xO.length > 1) ? xO[1] / 100 : 1;}}); }
					return this._for_all_do(function(e,o){if (e.style) e.style.filter = "alpha(opacity=" + o*100 + ")";}, pOpacity);
	            }
	        }
	        else
	        {
	            _npl_elementset.prototype.opacity = function (pOpacity)
	            {
	            	if (typeof pOpacity == 'undefined') return this._for_all_get(function(e){return 1});
					return this;
	            }
	        }
	        return this.opacity(pOpacity);
	    }
	}
	//	If still here, then none of the elements in the set had a style attribute. (?)
	if (typeof pOpacity == 'undefined') return this._for_all_get(function(e){return 1});
	return this;
};


_npl_elementset.prototype.classname = function (pClass)
{
    if (typeof pClass == 'undefined') return this._for_all_get(function(e){return this._get_E_Class(e)});
    return this._for_all_do(function(e,c){this._set_E_Class(e,c)}, pClass);
}; _npl_elementset.prototype.classnames = _npl_elementset.prototype.classname;


_npl_elementset.prototype.addClass = function (pClass)
{
	return this._for_all_do(function(e,c){
		var y = this._get_E_Class(e).split(' ');
		c = c.split(' ').reverse();
		var i = c.length;
		while ( i-- )
		{
			if (! in_array(c[i], y)) y.push(c[i]);
		}
		this._set_E_Class(e, y.join(' '));
	}, pClass);
};


_npl_elementset.prototype.hasClass = function (classes)
{
	//	Returns true for all elements that have all of the classes in the input.
	return this._for_all_get(function(e,c){
		return in_array(c.split(' '), this._get_E_Class(e).split(' '));
	}, classes);
};


_npl_elementset.prototype.removeClass = function (pClass)
{
	//	Benchmarked 2015-02-05.
	return this._for_all_do(function(e,c){
		var y = this._get_E_Class(e).split(' ');
		c = c.split(' ');
		var j, n;
		var i = n = y.length;
		while ( i-- )
		{
			if (in_array(y[i], c)) y.splice(i, 1);
		}
		if (y.length < n) this._set_E_Class(e, y.join(' '));
	}, pClass);
};


_npl_elementset.prototype.toggleClass = function (classnames)
{
	return this._for_all_do(function(e,c){
		var y = this._get_E_Class(e).split(' ');
		c = c.split(' ');
		var j, n, x;
		var i = n = y.length;
		while ( i-- )
		{
			if ((x = array_pos(y[i], c)) > -1)
			{
				y.splice(i, 1);
				c.splice(x, 1);
			}
		}
		if (c.length > 0)
		{
			Array.prototype.push.apply(y, c);
			this._set_E_Class(e, y.join(' '));
		}
		else if (y.length < n) this._set_E_Class(e, y.join(' '));
	}, classnames);
};


_npl_elementset.prototype.innerHtml = function (pHTML)
{
	if (typeof pHTML == 'undefined') return this._for_all_get(function(e){return e['innerHTML']});
	return this._for_all_do(function(e,v){e['innerHTML']=v; if (typeof e._ondomchange!='undefined') e._ondomchange.call(e);}, pHTML);
};


_npl_elementset.prototype.appendChild = function (child)
{
	if ( typeof child == 'undefined' ) return new _npl_elementset();
	if ( typeof(child._npl) != 'undefined' )
	{
		return new _npl_elementset(this._for_all_get(function(e,c){var x=e.appendChild(c); if (typeof e._ondomchange!='undefined') e._ondomchange.call(e); return x;}, child.element()));
	}
	if ( is_array(child) )
	{
		var children = [];
		for ( var i in child )
		{
			if ( child.hasOwnProperty(i) )
			{
				children.push(this.appendChild(child[i]));
				//children.push(this._for_all_get(function(e,c){var x=e.appendChild(c); if (typeof e._ondomchange!='undefined') e._ondomchange.call(e); return x;}, child[i]));
			}
		}
		return new _npl_elementset(children);
	}
	if ( is_object(child) )
	{
		//	{tag: "", id:"", classes:"", content:""}
		if ( child.hasOwnProperty('tag') )
		{
			var e = $(document.createElement(child.tag));
			for ( var attribute in child )
			{
				if ( child.hasOwnProperty(attribute) )
				{
					switch (attribute)
					{
						case 'id':
							e.id(child[attribute]);
							break;
						case 'class':
						case 'classes':
							e.classname(child[attribute]);
							break;
						case 'content':
							e.innerHtml(child[attribute]);
							break;
						case 'attributes':
							for ( var elem_attr in child[attribute] )
							{
								if ( child[attribute].hasOwnProperty(elem_attr) )
								{
									e.setAttr(elem_attr, child[attribute][elem_attr]);
								}
							}
					}
				}
			}
			return new _npl_elementset(this._for_all_get(function(e,c){var x=e.appendChild(c); if (typeof e._ondomchange!='undefined') e._ondomchange.call(e); return x;}, e.element()));
		}
	}
	return new _npl_elementset(this._for_all_get(function(e,c){var x=e.appendChild(c); if (typeof e._ondomchange!='undefined') e._ondomchange.call(e); return x;}, child));
};


_npl_elementset.prototype.element = function (i)
{
	if (this._elements.length == 1) return this._elements[0];
	if (typeof i != 'undefined') this._index = i;
	if (this._index < this._elements.length) return this._elements[this._index++];
	this._index = 0;
	return null;
};


_npl_elementset.prototype.filter = function (selector)
{
	//	Remove elements from the current element set that don't
	//	match <selector>.
	if ( is_string(selector) ) selector = NPL.parse_selector(selector);
	if ( ! is_array(selector) ) selector = [selector];
	//	The selector can't have more than one chunk, since this function
	//	doesn't look at child elements.
	if ( selector.length != 1 || ! this._elements.length ) this._elements = [];
	selector = selector[0];
	//	Filters, in order from fastest to slowest.
	if ( selector.id )
	{
		this._elements = this._elements.filter(function(e){
			//	Treat IDs and classes as case sensitive:
			//	https://developer.mozilla.org/en-US/docs/Case_Sensitivity_in_class_and_id_Names
			return e.getAttribute('id') == selector.id;
		});
	}
	if ( selector.tag )
	{
		selector.tag = selector.tag.toLowerCase();
		this._elements = this._elements.filter(function(e){
			return e.tagName.toLowerCase() == selector.tag;
		});
	}
	if ( selector.classnames )
	{
		this._elements = this._elements.filter(function(e){
			return in_array(selector.classnames, _npl_elementset.prototype._get_E_Class(e).split(' '));
		});
	}
	if ( selector.attrs )
	{
		for ( var attr in selector.attrs )
		{
			if ( selector.attrs.hasOwnProperty(attr) )
			{
				if ( selector.attrs[attr] == '' )
				{
					this._elements = this._elements.filter(function(e){
						var a = e.getAttribute(attr);
						return a != '' && a != null;
					});
				}
				else if ( selector.attrs[attr].charAt(0) == '~' )
				{
					//	Attribute value must be part of a space-separated list:
					//	<div language="en fr de">
					var attr_value = selector.attrs[attr].substring(1);
					this._elements = this._elements.filter(function(e){
						var a = e.getAttribute(attr);
						return a != null && in_array(attr_value, a.split(' '));
					});
				}
				else if ( selector.attrs[attr].charAt(0) == '|' )
				{
					//	Attribute must be exactly matched, or must match the selector followed by a -. e.g.:
					//	<div language="en-US"> will match div[language|=en]
					var attr_value = selector.attrs[attr].substring(1);
					this._elements = this._elements.filter(function(e){
						var a = e.getAttribute(attr);
						return a != null && (a == attr_value || a.indexOf(attr_value+'-') >= 0);
					});
				}
				else
				{
					//	Exact match.
					var attr_value = selector.attrs[attr];
					this._elements = this._elements.filter(function(e){
						return e.getAttribute(attr) == attr_value;
					});
				}
			}
		}
	}
	this.count = this.length = this._elements.length;
	return this;
}

_npl_elementset.prototype.select = function (selector)
{
	if (is_integer(selector)) return new _npl_elementset(this._elements[selector]);
	if (! is_string(selector)) return new _npl_elementset(selector);
	var elements, token, tag_set, class_set;
	elements = new _npl_elementset(this._elements.slice());
	selector = NPL.parse_selector(selector).reverse();
	while ( selector.length && elements.length )
	{
		token = selector.pop();
		if ( token.tag )
		{
			tag_set = elements.getElementsByTagName(token.tag);
			if ( tag_set.count > 20 && token.classnames && (class_set = elements.getElementsByClassName(token.classnames)).count < tag_set.count )
			{
				//	For larger sets, it might be faster to first
				//	grab a set of elements based on class names.
				elements = class_set;
				token.classnames = false;
			}
			else
			{
				elements = tag_set;
				token.tag = false;
			}
		}
		else if ( token.classnames )
		{
			elements = elements.getElementsByClassName(token.classnames);
			token.classnames = false;
		}
		else
		{
			elements = elements.getElementsByTagName('*');
		}
		elements.filter(token);
	}
	return elements;
}

_npl_elementset.prototype.getElementsByTagName = function (tag)
{
	return new _npl_elementset(this._for_all_get(function(e,tag){return this._get_E_ElementsByTag(e,tag)}, tag));
}

_npl_elementset.prototype.getElementsByClassName = function (classes)
{
	if ( is_array(classes) ) classes = classes.join(' ')
	else if ( classes.indexOf('.') > -1 ) classes = classes.substring(1).split('.').join(' ');
	return new _npl_elementset(this._for_all_get(function(e,classes){return this._get_E_ElementsByClassName(e,classes)}, classes));
}

_npl_elementset.prototype.elements		= function (){return this._elements.length > 0 ? this._elements.slice(0) : []};
_npl_elementset.prototype.id			= function (i){return this.setAttr('id', i)};
_npl_elementset.prototype.onclick		= function (f){return this.setValue('onclick', f)};
_npl_elementset.prototype.onmouseover	= function (f){return this.setValue('onmouseover', f)};
_npl_elementset.prototype.onmouseout	= function (f){return this.setValue('onmouseout', f)};
_npl_elementset.prototype.onmousedown	= function (f){return this.setValue('onmousedown', f)};
_npl_elementset.prototype.onmouseup		= function (f){return this.setValue('onmouseup', f)};
_npl_elementset.prototype.oninput		= function (f){return this.setValue('oninput', f)};
_npl_elementset.prototype.onblur		= function (f){return this.setValue('onblur', f)};
_npl_elementset.prototype.onkeydown		= function (f){return this.setValue('onkeydown', f)};
_npl_elementset.prototype.onkeypress	= function (f){return this.setValue('onkeypress', f)};
_npl_elementset.prototype.onkeyup		= function (f){return this.setValue('onkeyup', f)};
_npl_elementset.prototype.focus 		= function (){return this._for_all_do(function(e){e.focus()})};
_npl_elementset.prototype.click			= function (){return this._for_all_do(function(e){e.onclick.call(e)})};
_npl_elementset.prototype.scrollWidth	= function (){return this._for_all_get(function(e){return e.scrollWidth})};
_npl_elementset.prototype.scrollHeight	= function (){return this._for_all_get(function(e){return e.scrollHeight})};
_npl_elementset.prototype.htmlTag		= function (){return this._for_all_get(function(e){return e.tagName.toLowerCase()})};
_npl_elementset.prototype.href			= function (v){return this.setValue('href', v)};
_npl_elementset.prototype.nextSibling	= function (){return this._for_all_get(function(e){return NPL.select(e.nextSibling)})};
_npl_elementset.prototype.prevSibling	= function (){return this._for_all_get(function(e){return NPL.select(e.previousSibling)})};
_npl_elementset.prototype.parentNode	= function (){return this._for_all_get(function(e){return NPL.select(e.parentNode)})};

_npl_elementset.prototype.parents = function ()
{
	//	Compile a list of all of the parent nodes for these elements (going all the way up the document tree).
	//	The document object will be at the very end of the returned element set.
	var e, lineage, parents = [];
	var i = 0, n = this.count;
	while ( i < n )
	{
		e = this._elements[i++];
		lineage = [];
		while ( e.parentNode && e.parentNode != document )
		{
			lineage.push(e.parentNode);
			e = e.parentNode;
		}
		//	reverse() each of the lineages so that when
		//	union() is called, the root nodes end up at the beginning
		//	of the array and the leaf nodes at the end, and then it
		//	gets re-reversed() again for correct order.
		lineage.reverse();
		parents.push([lineage]);
	}
	parents = union.apply(this, parents);
	parents.reverse();
	return new _npl_elementset(parents);
}

_npl_elementset.prototype.scrollLeft = function (pValue)
{
	if (typeof pValue == 'undefined') return this._for_all_get(function(e){return e.scrollLeft});
	return this._for_all_do(function(e,v){e.scrollLeft=v}, pValue);
}

_npl_elementset.prototype.value = function (pValue)
{
	if (typeof pValue == 'undefined') return this._for_all_get(function(e){return e['value']});
	return this._for_all_do(function(e,v){e['value']=v}, pValue);
}

_npl_elementset.prototype.ondomchange = function (pFunction)
{
	if (typeof pFunction == 'undefined') return this._for_all_get(function(e){return e._ondomchange});
	return this._for_all_do(function(e){e._ondomchange = pFunction});
}


_npl_elementset.prototype.clone = function ()
{
	return this._for_all_get(function(e){
		e = NPL.Select(e);
		var xE = NPL.select(document.createElement(e.htmlTag()));
		xE.id(e.id())
			.classname(e.classname())
			.onclick(e.onclick())
			.onmouseover(e.onmouseover())
			.onmouseout(e.onmouseout())
			.onmousedown(e.onmousedown())
			.onmouseup(e.onmouseup());
		if ( e.htmlTag() != 'iframe' )
		{
			//	Internet Explorer will throw an "unknown runtime error" if this is attempted
			//	on an iframe. >:-(
			xE.innerHtml(e.innerHtml());
		}
		xE.style(e.style())
			.top(e.element().offsetTop)
			.left(e.left())
			.width(e.width());	//	Required by IE 8
		return xE;
	});
}


_npl_elementset.prototype.onload = function (pFunction)
{
	if (typeof pFunction === 'undefined') return this.setValue('onload');
	if ( this.isImage() )
	{
		if ( this.loaded() && this.width() > 0 )
		{
			pFunction(this);
		}
		else
		{
			var xTask = NPL.new_task(function(){if (this._image.loaded() && this._image.width() > 0){this._onloadf(this._image);return 0;}return 50;});
			xTask._image = this;
			xTask._onloadf = pFunction;
			xTask.start();
		}
	}
	else if ( this.htmlTag() == 'iframe' )
	{
		if ( typeof this.element().attachEvent != 'undefined' )
		{
			//	Internet Explorer ... I WILL TAPDANCE ON YOUR GRAVE.
			this.element().attachEvent('onload', pFunction);
		}
		else
		{
			this.element().onload = pFunction;
		}
	}
	else
	{
		pFunction(this);
	}
	return this;
};


_npl_elementset.prototype.isImage = function ()
{
	return this._for_all_get(function(e){return e.tagName.toLowerCase() == 'img'});
};


_npl_elementset.prototype.loaded = function ()
{
	if (! this.isImage()) return true;
	var x = this._for_all_get(function(e){return this._get_E_Loaded(e)});
	return typeof x == 'boolean' ? x : ! in_array(false, x);
};


_npl_elementset.prototype.replace = function (replacements, effect)
{
	if ( typeof effect != 'undefined' && typeof this.npfx_replace != 'undefined' )
	{
		return this.npfx_replace(replacements, effect);
	}
	if ( is_string(replacements) )
	{
		return this.innerHtml(replacements);
	}
	if ( is_dom_node(replacements) || is_html_element(replacements) )
	{
		replacements = [replacements];
	}
	else if ( is_elementset(replacements) )
	{
		replacements = replacements.elements();
	}
	if ( is_array(replacements) )
	{
		var n = this._elements.length;
		var m = replacements.length;
		if (n != m) console.log('_npl_elementset.replace(): warning, count mismatch between current elements and replacement elements.');
		var x = [];
		var j;
		var i = j = 0;
		while ( (i < n) && (j < m) )
		{
			x.push(this._elements[i].parentNode.replaceChild(replacements[j], this._elements[i]));
			this._elements[i++] = replacements[j++];
		}
		return $(x);
	}
	return $([]);
};


_npl_elementset.prototype.remove = function () {return this._for_all_do(function(e){var p = e.parentNode; p.removeChild(e); if (typeof p._ondomchange != 'undefined') p._ondomchange.call(p);})};


_npl_elementset.prototype.contains = function (element)
{
	//	Return true if element is bounded by items in the elementset.
	return this._for_all_get(function(e,x){e = $(e); x = $(x); return x.left() >= e.left() && x.left() < e.scrollWidth() && x.top() >= e.top() && x.top() < e.scrollHeight()}, element);
};


_npl_elementset.prototype.insertRow = function (pParam)
{
	var xReturnValue = this._for_all_get(function(e)
	{
		switch (e.tagName.toLowerCase())
		{ case 'table': case 'tbody':
			var xRow = e.insertRow(pParam);
			if (typeof e._ondomchange != 'undefined') e._ondomchange.call(e); xRow._ondomchange = e._ondomchange;
			return NPL.select(xRow);
		}
		return false;
	});
	return xReturnValue;
};


if (typeof NPL == 'undefined') NPL = new _npl();
if (typeof $ == 'undefined') $ = function(){return NPL.select.apply(NPL, arguments)};

//	Fin.
