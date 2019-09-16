_npl_elementset.prototype.fade = function (pDescriptor, pCallback)
{
	if ( this._for_all_do ) { this._for_all_do(function(e,d,c){NPFX_Fade(NPL.select(e),d,c)}, pDescriptor, pCallback); }
	return this;
}

_npl_elementset.prototype.slide = function (pDescriptor, pCallback)
{
	if ( this._for_all_do ) { return this._for_all_do(function(e,d,c){NPFX_Slide(NPL.select(e),d,c)}, pDescriptor, pCallback); }
	return this;
}

_npl_elementset.prototype.npfx_replace = function (pElements, pEffect)
//	Replace the contents of this element (or these elements) with the contents of pElements,
//	using special effects.
{
	if ( typeof pEffect != 'undefined' )
	{
		if ( pEffect == 'slide_left' )
		{
			var xElement = this;
			pElements.id(this.id()).classname(this.classname());
			NPFX_Slide(this, (this.width() + this.left()) * -1 + ', 0, accelerate', function(pElement){
				xReturnValue = xElement.element(0).parentNode.replaceChild(pElements.element(0), xElement.element(0));
				pElements.left(NPL.window.width());
				NPFX_Slide(pElements, NPL.window.width() * -1 + ', 0, decelerate');
			});
		}
		else if ( pEffect == 'slide_right' )
		{
			var xElement = this;
			pElements.id(xElement.id()).classname(xElement.classname());
			NPFX_Slide(xElement, NPL.window.width() + ', 0, accelerate', function(pElement){
				xElement.element(0).parentNode.replaceChild(pElements.element(0), xElement.element(0));
				pElements.left(pElements.width() * -1);
				NPFX_Slide(pElements, pElements.width() + ', 0, decelerate');
			});
		}
		else if ( pEffect == 'page_slide_left' )
		{
			if ( typeof pElements == 'string' )
			{
				var xListElement = NPL.select(this.element(0));		//	Make sure there's only one element here.
				var xElement = NPL.select(document.createElement('li'));
				xElement.innerHtml(pElements).id(xListElement.id()).classname(xListElement.classname());
				//	Stuff a UID into this element for later use.
				var xUID = NPL.new_uid();
				xListElement.id(xUID).element().parentNode.appendChild(xElement.element(0));
				NPFX_Scroll(NPL.select(xListElement.element().parentNode.parentNode), {'deltaX': xListElement.width(), 'deltaY': 0, 'decelerate': true}, new Function('pElement', 'NPL.select("#' + xUID + '").remove(); pElement.element(0).scrollLeft = 0;'));
			}
		}
		else if ( pEffect == 'crossfade' )
		{
			if ( typeof pElements == 'string' )
			{
				var xOldElement = NPL.Select(this.element(0));		//	Make sure there's only one element here.
				
				/*
				//	Fix issues with executing JavaScript on element load.
				var xNewDocument = document.createDocumentFragment();
				xNewDocument.innerHTML = pElements;
				alert(xNewDocument.firstChild.innerHTML);
				*/
				
				
				//	Stuff a UID into the previous element for later use.
				var xUID = NPL.NewUID();				
				var xNewElement = NPL.Select(document.createElement('li'));
				xNewElement.id(xOldElement.id()).classname(xOldElement.classname()).opacity(0).style({'margin-top': -1 * xOldElement.height() + 'px'});
				xOldElement.id(xUID).element().parentNode.appendChild(xNewElement.element(0));
				//xNewElement.innerHtml(pElements);
				
				/* Attempt 1 -- xNewBody.innerHTML doesn't appear to work correctly.
				var xNewDocument = document.implementation.createDocument(null, 'html', null);
				var xNewBody = xNewDocument.createElement('body');
				xNewDocument.documentElement.appendChild(xNewBody);
				xNewBody.innerHTML = pElements;
				alert(xNewBody.innerHTML); // works.
				var xNode = document.importNode(xNewBody, true);
				alert(xNode.innerHTML); // doesn't work. 'undefined'
				xNewElement.element().parentNode.appendChild(xNode);
				*/
				
				/* Attempt 2 -- confirms that "innerHTML" is set, but it isn't accessible afterwards.
				var xNewDocument = document.implementation.createDocument(null, 'html', null);
				xNewDocument.innerHTML = pElements;
				alert(xNewDocument.documentElement.innerHTML);
				*/
				
				/* Attempt 3 -- this will execute the Javascript in the text, but doesn't have access to style/other elements in the page.
				xNewElement.innerHtml('<iframe></iframe>');
				NPL.Select('iframe').set('src', 'http://localhost:8888/index.html?format=content-only');
				*/
				
				/* Attempt 4 -- double-checking an earlier result. According to W3C spec,
				   (http://dev.w3.org/html5/spec/apis-in-html-documents.html#dynamic-markup-insertion),
				   "document.innerHTML ... If the node's document is an HTML document: Invoke the HTML fragment parsing algorithm.",
				   this should work, but it does not.
				var xNewDocument = document.implementation.createDocument(null, 'html', null);
				xNewDocument.innerHTML = pElements;
				alert(xNewDocument.innerHTML);				
				*/
				
				/*
				var xNode = document.importNode(xNewBody, true);
				xNewElement.element().parentNode.appendChild(xNode);
				*/

				
				NPFX_FadeOut(xOldElement);
				NPFX_FadeIn(xNewElement, new Function('pElement', 'NPL.Select("#' + xUID + '").remove(); pElement.style({"margin-top": "0"});'));
				//NPFX_FadeIn(xNewElement, function(pElement){pElement.style('margin-top', '0')});
			}
		}
	}
}

function NPFX_Fade ( pElement, pDescriptor, pCallback )
{
	if ( typeof pElement != 'undefined' && typeof pDescriptor != 'undefined' )
	{
		if ( typeof pElement._npfx_fadeLock != 'undefined' )
		{
			pElement._npfx_fadeLock.end();
		}
		var xTask = NPL.new_task(function(){
			if ( this.taskStatus != 8 )
			{
				if ( this._iteration < this._deltas.length )
				{
					this._element.opacity(this._deltas[this._iteration++] * .01);
					return 22;
				}
				if ( typeof this._callback != 'undefined' ) { this._callback(this._element); }
				return 0;
			}
			else
			{
				//	"Dying". Immediately complete the task.
				this._element.opacity(this._deltas[this._iteration++] * .01);
				delete this._element._npfx_fadeLock;
			}
		});
		pElement._npfx_fadeLock = xTask;
		//xTask.Name('NPFX_Fade');
		xTask._element = pElement;
		//	Parse pDescriptor
		xTask._parameters = {
			begin: pDescriptor.begin === undefined ? xTask._element.opacity() : pDescriptor.begin * 100,
			end: pDescriptor.end === undefined ? 0 : pDescriptor.end * 100,
			rate: pDescriptor.rate === undefined ? 1.9 : pDescriptor.rate
		};
		if ( xTask._parameters.begin == xTask._parameters.end )
		{
			delete pElement._npfx_fadeLock;
		}
		else
		{
			if ( xTask._parameters.begin > xTask._parameters.end )
			{
				xTask._deltas = _NPFX_Exponential_Deltas({'rate': xTask._parameters.rate, 'upperBound': xTask._parameters.begin, 'terminateAtBounds': true, 'yOffset': xTask._parameters.end}).reverse();
			}
			else
			{
				xTask._deltas = _NPFX_Exponential_Deltas({'rate': xTask._parameters.rate, 'upperBound': xTask._parameters.end, 'terminateAtBounds': true, 'yOffset': xTask._parameters.begin});
			}
			if ( typeof pCallback != 'undefined' ) { xTask._callback = pCallback; }
			xTask._iteration = 0;
			xTask.start();
		}
	}
}

function NPFX_Scroll ( pElement, pScrollDescriptor, pCallback )
{
	if ( typeof pElement != 'undefined' && typeof pScrollDescriptor != 'undefined' )
	{
		var xTask = NPL.new_task(function(){
			if ( this.taskStatus == 8 )
			{
				//	"Dying". Immediately place the element.
				if ( ! isNaN(this._destinationX) ) { this._element.left(this._destinationX); }
				if ( ! isNaN(this._destinationY) ) { this._element.top(this._destinationY); }
			}
			else
			{
				if ( this._iteration < this._xDeltas.length )
				{
					this._element.element().scrollLeft = this._element.element().scrollLeft + this._xDeltas[this._iteration++];
					return 20;
				}
			}
			if ( typeof this._callback != 'undefined' )
			{
				this._callback(this._element);
			}
			return 0;
		});
		if ( pScrollDescriptor.deltaX !== undefined )
		{
			xTask._element = pElement;
			//	Pre-calculate the scroll values for the element.
			if ( pScrollDescriptor.decelerate === true )
			{
				xTask._xDeltas = _NPFX_Exponential_Deltas({rate: 1.85, sumsBound: pScrollDescriptor.deltaX, terminateAtBounds: true}).reverse();
			}
			else
			{
				xTask._xDeltas = _NPFX_Exponential_Deltas({rate: 1.85, sumsBound: pScrollDescriptor.deltaX, terminateAtBounds: true});
			}
			if ( typeof pCallback != 'undefined' ) { xTask._callback = pCallback; }
			xTask._iteration = 0;
			xTask.start();
		}
	}
}

function NPFX_Slide (pElement, pSlideDescriptor, pCallback)
{
	//	"x_coord, y_coord, <decelerate | accelerate>"	<-- Do like this instead
	if ( typeof pElement != 'undefined' && typeof pSlideDescriptor != 'undefined' )
	{
		var xTask = NPL.new_task(function(){
			var xReturnValue = 0;
			if ( this.taskStatus == 8 )
			{
				//	"Dying". Immediately place the element.
				if ( ! isNaN(this._destinationX) ) { this._element.left(this._destinationX); }
				if ( ! isNaN(this._destinationY) ) { this._element.top(this._destinationY); }
			}
			else
			{
				if ( this._iteration < this._xDeltas.length )
				{
					this._element.move(this._xDeltas[this._iteration], 0);
					xReturnValue = 16;
				}
				if ( this._iteration < this._yDeltas.length )
				{
					this._element.move(0, this._yDeltas[this._iteration]);
					xReturnValue = 16;
				}
				this._iteration++;
				if ( xReturnValue != 0 ) { return xReturnValue; }
			}
			if ( typeof this._callback != 'undefined' )
			{
				this._callback(this._element);
			}
			return xReturnValue;
		});
		//xTask.Name('NPFX_Slide');
		xTask._element = pElement;
		if ( typeof pCallback != 'undefined' )
		{
			xTask._callback = pCallback;
		}
		//	Parse pSlideDescriptor
		var i = -1;
		xTask._deltaX = parseInt(pSlideDescriptor.substring(++i, i = pSlideDescriptor.indexOf(',', i)));
		xTask._deltaY = parseInt(pSlideDescriptor.substring(++i, i = pSlideDescriptor.indexOf(',', i)));
		while ( pSlideDescriptor[++i] == ' ' ) { ; }
		var j = pSlideDescriptor.length;
		while ( j && pSlideDescriptor[--j] == ' ' ) { ; }
		if ( ++j > i )
		{
			var xAcceleration = pSlideDescriptor.substring(i, j).toLowerCase();
		}
		else
		{
			var xAcceleration = pSlideDescriptor.substring(i).toLowerCase();
		}
		//	Pre-calculate the position values for the element.
		xTask._xDeltas = _NPFX_Exponential_Deltas({'rate': 1.2, 'sumsBound': xTask._deltaX, 'terminateAtBounds': true});
		xTask._yDeltas = _NPFX_Exponential_Deltas({'rate': 1.2, 'sumsBound': xTask._deltaY, 'terminateAtBounds': true});
		xTask._iteration = 0;
		if ( xAcceleration == 'decelerate' )
		{
			xTask._xDeltas.reverse();
			xTask._yDeltas.reverse();
		}
		xTask.start();
	}
}

function _NPFX_Exponential_Deltas ( pDescriptor )
//	Used to make things feel "smooth" to humans.
//	Returns an array of results from an exponential function.
//	yOffset: a value added to each iteration. This has the effect of moving the exponential graph "up" the y-axis a bit.
//	xOffset: a value added to the exponentiation function of each iteration. This has the effect of moving the exponential graph along the x-axis a bit.
//	startingValue: a value from which to begin exponentiation. This has the effect of starting the exponentiation at a higher iteration than 0.
//	rate: the rate at which the exponential function grows.
//	lowerBound: [optional] the lower boundary value that the function should start with. The exponential function begins from 0 as normal. This is synonymous with yOffset.
//	upperBound: the maximum value that the function should produce before returning.
//	sumsBound: the maximum sum of all values that the function can reach before returning. sumsBound takes precedence over upperBound.
//	doNotExceedBounds: If the next iteration of the function will exceed sumsBound or upperBound, then return immediately.
//	terminateAtBounds: If the next iteration of the function will exceed sumsBound or upperBound, then return the difference as the final iteration.
{
	//	Set up some defaults.
	if ( pDescriptor.xOffset === undefined ) { pDescriptor.xOffset = 0; }
	if ( pDescriptor.yOffset === undefined ) { pDescriptor.yOffset = 0; }
	if ( pDescriptor.rate === undefined )
	{
		pDescriptor.rate = 1.5;
	}
	else if ( pDescriptor.rate < 1.1 )
	{
		return [];
	}
	if ( pDescriptor.lowerBound === undefined ) { pDescriptor.lowerBound = 0; }
	if ( pDescriptor.startingValue === undefined ) { pDescriptor.startingValue = 0; }
	//	Validation stage.
	var xDirection = 0;
	if ( pDescriptor.sumsBound !== undefined )
	{
		if ( pDescriptor.sumsBound < 0 )
		{
			xDirection = -1;
			var xSumLimit = -1 * pDescriptor.sumsBound;
		}
		else if ( pDescriptor.sumsBound > 0 )
		{
			xDirection = 1;
			var xSumLimit = pDescriptor.sumsBound;
		}
	}
	if ( pDescriptor.upperBound !== undefined )
	{
		if ( pDescriptor.upperBound < 0 )
		{
			//	Check for incompatible boundary conditions.
			if ( xDirection > 0 ) { return []; }
			xDirection = -1;
		}
		else if ( pDescriptor.upperBound > 0 )
		{
			//	Check for incompatible boundary conditions.
			if ( xDirection < 0 ) { return []; }
			xDirection = 1;
		}
	}
	if ( xDirection == 0 ) { return []; } //	Exit if there's no termination condition.
	var i = 0;
	var xIterationValue = 0;
	var xReturnValue = [];
	while ( xIterationValue < pDescriptor.startingValue )
	{
		xIterationValue = parseInt(Math.pow(pDescriptor.rate, i + pDescriptor.xOffset)) + parseInt(pDescriptor.yOffset) + parseInt(pDescriptor.lowerBound);
		i++;
	}
	while ( true )
	{
		xIterationValue = parseInt(Math.pow(pDescriptor.rate, i + pDescriptor.xOffset)) + parseInt(pDescriptor.yOffset) + parseInt(pDescriptor.lowerBound);
		if ( pDescriptor.sumsBound !== undefined )
		{
			if ( xIterationValue >= xSumLimit )
			{
				if ( pDescriptor.terminateAtBounds !== undefined )
				{
					xReturnValue[i] = xDirection * xSumLimit;
					return xReturnValue;
				}
				else if ( pDescriptor.doNotExceedBounds !== undefined )
				{
					if ( xIterationValue == xSumLimit )
					{
						xReturnValue[i] = xDirection * xSumLimit;
					}
					return xReturnValue;
				}
				xReturnValue[i] = xDirection * xIterationValue;
				return xReturnValue;
			}
			xSumLimit -= xIterationValue;
		}
		if ( pDescriptor.upperBound !== undefined )
		{
			if ( xIterationValue >= pDescriptor.upperBound )
			{
				if ( pDescriptor.terminateAtBounds !== undefined )
				{
					xReturnValue[i] = xDirection * pDescriptor.upperBound;
					return xReturnValue;
				}
				else if ( pDescriptor.doNotExceedBounds !== undefined )
				{
					if ( xIterationValue == pDescriptor.upperBound )
					{
						xReturnValue[i] = xDirection * xIterationValue;
					}
					return xReturnValue;
				}
				xReturnValue[i] = xDirection * xIterationValue;
				return xReturnValue;
			}
		}
		xReturnValue[i] = xDirection * xIterationValue;
		i++;
	}
}