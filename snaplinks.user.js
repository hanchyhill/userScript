// ==UserScript==  
// @name       snap Links Mod
// @description 批量获取页面链接和选项框
// @name:en        snap Links Mod
// @description:en snap Links radios chenkboxs imgage from website
// @author      Hanchy Hill
// @namespace   https://minhill.com/snapLinks
// @include http*
// @version     0.5
// @license     MIT
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_openInTab
// @grant GM_deleteValue
// @grant GM_addStyle
// @grant GM_registerMenuCommand
// @grant GM_setClipboard
// @grant GM_log
// @icon        http://minhill.com/blog/wp-content/uploads/2012/03/favicon.ico
// ==/UserScript==

var snapLinks = {
	timer: null,
	button: 0,

	init: function() {
		/*if (!snapLinks.inited) {
			var menuitem = document.getElementById("SnapLinksCopyLinksSetFormat");
			if (menuitem) {
				var func = function() {
					var format = prompt('请输入需要设置的格式（%t：标题，%u：链接，%n：序号，%r：反向序号）', 
						'<a href="%u">%r. %t</a><br>');
					snapLinks.copyLinks(null, false, format);
				};
				menuitem.addEventListener('command', func, false);
			}

			snapLinks.inited = true;
		}*/
		

		snapLinks.win = window;
		if (snapLinks.win == window) snapLinks.win = window;
		snapLinks.doc = snapLinks.win.document;
		snapLinks.body = snapLinks.doc.body;
		if (!snapLinks.body instanceof HTMLBodyElement){
			alert("Can not snaplinks.");
			return false;
		}

		snapLinks.root = snapLinks.doc.documentElement;
		//this.utils = this.win.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
		snapLinks.popup = document.getElementById("snapLinksMenupopup");

		snapLinks.bodyCursor = snapLinks.body.style.cursor;
		snapLinks.rootCursor = snapLinks.root.style.cursor;
		snapLinks.body.style.setProperty("cursor", "crosshair", "important");
		snapLinks.root.style.setProperty("cursor", "crosshair", "important");

		snapLinks.highlights = [];
		snapLinks.elements = [];
		//alert(snapLinks.button);

		snapLinks.doc.addEventListener("mousedown", snapLinks.handleEvent, true);
		snapLinks.doc.addEventListener("pagehide", snapLinks.handleEvent, true);
	},
	uninit: function() {
		//alert("uninit");
		snapLinks.doc.removeEventListener("mousedown", snapLinks.handleEvent, true);
		snapLinks.doc.removeEventListener("mousemove", snapLinks.handleEvent, true);
		snapLinks.doc.removeEventListener("pagehide", snapLinks.handleEvent, true);
		snapLinks.doc.removeEventListener("mouseup", snapLinks.handleEvent, true);//?
		setTimeout(function(self){
			snapLinks.doc.removeEventListener("click", snapLinks.handleEvent, true);
		}, 10, snapLinks);

		if (snapLinks.box && snapLinks.box.parentNode)
			snapLinks.box.parentNode.removeChild(snapLinks.box);
		snapLinks.box = null;
		snapLinks.body.style.cursor = snapLinks.bodyCursor;
		snapLinks.root.style.cursor = snapLinks.rootCursor;
	},
	destroy: function() {
		snapLinks.uninit();
		snapLinks.lowlightAll();
		document.removeEventListener("click",snapLinks.destroy,false);

		var sslpop = document.getElementById("snapLinksMenupopup")
		sslpop.setAttribute("class","hidden_popup");
		sslpop.setAttribute("style",null);

	},
	handleEvent: function(event) {
		//alert(event.type);
		switch(event.type){
			case "mousedown":
				if (event.button != 0 || event.ctrlKey || event.shiftKey || event.altKey) return;
				event.preventDefault();
				event.stopPropagation();

				snapLinks.draw(event);
				break;
			case "mousemove":
				event.preventDefault();
				event.stopPropagation();
				var moveX = event.pageX;
				var moveY = event.pageY;
				if (snapLinks.downX > moveX) snapLinks.box.style.left = moveX + "px";
				if (snapLinks.downY > moveY) snapLinks.box.style.top  = moveY + "px";
				snapLinks.box.style.width  = Math.abs(moveX - snapLinks.downX) + "px";
				snapLinks.box.style.height = Math.abs(moveY - snapLinks.downY) + "px";

				if (snapLinks.timer) {
					clearTimeout(snapLinks.timer);
					snapLinks.timer = null;
				}
				var timeStamp = new Date().getTime();
				if (timeStamp - snapLinks.lastHiglightedTime > 150) {
					snapLinks.boxRect = snapLinks.box.getBoundingClientRect();
					snapLinks.highlightAll();
				} else {
					var self = snapLinks;
					snapLinks.timer = setTimeout(function() {
						self.boxRect = self.box.getBoundingClientRect();
						self.highlightAll();
					}, 200);
				}
				break;
			case "mouseup":
				//alert("mouseup");
				if (event.button != snapLinks.button || event.ctrlKey || event.shiftKey) return;
				event.preventDefault();
				event.stopPropagation();

				if (snapLinks.timer) {
					clearTimeout(snapLinks.timer);
					snapLinks.timer = null;
				}
				snapLinks.boxRect = snapLinks.box.getBoundingClientRect();
				snapLinks.highlightAll();


				//alert("mouseup");

				for (let [i, e] in Iterator(snapLinks.highlights)) {
					if (e instanceof HTMLImageElement) {
						let link = snapLinks.doc.evaluate(
							'ancestor::*[@href]', e, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
						if (snapLinks.highlights.indexOf(link) === -1) {
							snapLinks.elements[snapLinks.elements.length] = link;
						}
						continue;
					}
					snapLinks.elements[snapLinks.elements.length] = e;
				}
				snapLinks.elements = snapLinks.elements;//?

				snapLinks.uninit();
				snapLinks.showPopup(event);
				break;
			case "click":
				event.preventDefault();
				event.stopPropagation();
				break;
			case "pagehide":
				snapLinks.destroy();
				break;
		}
	},
	draw: function(aEvent) {
		snapLinks.lastHiglightedTime = new Date().getTime();
		snapLinks.downX = aEvent.pageX;
		snapLinks.downY = aEvent.pageY;
		snapLinks.box = snapLinks.doc.createElement("div");
		snapLinks.box.id = "snap-links-box";
		snapLinks.box.style.cssText = [
			'background-color: rgba(0,128,255,.1) !important;'
			,'border: 1px solid rgb(255,255,0) !important;'
			,'box-sizing: border-box !important;'
			,'-moz-box-sizing: border-box !important;'
			,'position: absolute !important;'
			,'z-index: 2147483647 !important;'
			,'top:' + snapLinks.downY + 'px;'
			,'left:' + snapLinks.downX + 'px;'
			,'cursor: crosshair !important;'
			,'margin: 0px !important;'
			,'padding: 0px !important;'
			,'outline: none !important;'
		].join(" ");
		snapLinks.body.appendChild(snapLinks.box);

		snapLinks.doc.removeEventListener("mousedown", snapLinks.handleEvent, true);
		snapLinks.doc.addEventListener("mousemove", snapLinks.handleEvent, true);
		snapLinks.doc.addEventListener("mouseup", snapLinks.handleEvent, true);
		snapLinks.doc.addEventListener("click", snapLinks.handleEvent, true);
	},
	highlightAll: function() {
		var a = '[href]:not([href^="javascript:"]):not([href^="mailto:"]):not([href^="#"])';
		var selector = a + ', ' + a + ' img, input[type="checkbox"],  input[type="radio"]';
		selector += ', a.b-in-blk.input-cbx[href^="javascript:"]';  // 百度盘的特殊多选框

		var contains = snapLinks.getContainsElements();
		contains.reverse();
		var matches = [];
		for (let [i, e] in Iterator(contains)) {
			if (e.nodeType !== 1 || !e.matches(selector))
				continue;

			if (e.hasAttribute('href')) {
				let imgs = Array.slice(e.getElementsByTagName('img'));
				if (imgs[0]) {
					[].push.apply(contains, imgs);
					continue;
				}
			}

			if (!("defStyle" in e))
				snapLinks.highlight(e);
			matches[matches.length] = e;
		}

		snapLinks.highlights.forEach(function(e, i, a){
			if (matches.indexOf(e) === -1)
				snapLinks.lowlight(e);
		}, snapLinks);

		snapLinks.highlights = matches;
		snapLinks.lastHiglightedTime = new Date().getTime();
	},
	lowlightAll: function() {
		snapLinks.highlights.forEach(function(e){
			snapLinks.lowlight(e);
		}, this);
	},
	highlight: function(elem) {
		if (!('defStyle' in elem))
			elem.defStyle = elem.getAttribute('style');
		//elem.style.setProperty('outline', '2px solid #ff0000', 'important');
		elem.style.setProperty('outline', '2px solid #ff0000', null);
		elem.style.setProperty('outline-offset', '-1px', null);
		//elem.style.setProperty('outline-offset', '-1px', 'important');
	},
	lowlight: function(elem) {
		if ("defStyle" in elem) {
			elem.defStyle?
				elem.style.cssText = elem.defStyle:
				elem.removeAttribute("style");
			delete elem.defStyle;
		}
	},
	getContainsElements: function() {
		if (!snapLinks.boxRect) return;
		var a = '[href]:not([href^="javascript:"]):not([href^="mailto:"]):not([href^="#"])';
		var selector = a + ', ' + a + ' img, input[type="checkbox"],  input[type="radio"]';
		selector += ', a.b-in-blk.input-cbx[href^="javascript:"]';
		//var nodes = document.querySelectorAll("a[href],img,radio,checkbox");
		var nodes = document.querySelectorAll(selector);
		var arraynode=[] , len = nodes.length , i;
		


		for (i = 0; i < len; i++) {
			if(this.inSelect(nodes[i])) arraynode.push(nodes[i]);
	    }

	    return arraynode;

	},

	inSelect : function (node){
		var boxPos = snapLinks.boxRect;
        var xmin = boxPos.left, xmax = boxPos.right, ymin = boxPos.top, ymax = boxPos.bottom;

		var pos = this.getOffset(node);
		var point = new Array();

		point = [pos.x, pos.x + pos.width, pos.y, pos.y + pos.height];
		
		var swithcase = [];
		if((point[0]>xmin&&point[0]<xmax)||
		(point[1]>xmin&&point[1]<xmax)||
		(point[0]<xmin&&point[1]>xmax)){
			swithcase[0] = true;
		} 
		if((point[2]>ymin&&point[2]<ymax)||
		(point[3]>ymin&&point[3]<ymax)||
		(point[2]<ymin&&point[3]>ymax)){
			swithcase[1] = true;
		} 
		
		if(swithcase[0]&&swithcase[1]){
			return true;
		}

		else{
			return false;
		}

	},

	getOffset : function(node){
		var rect = node.getBoundingClientRect();

		return {
			//x: window.pageXOffset + rect.left,
			//y: window.pageYOffset + rect.top,
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height
		};
	},


	showPopup: function(aEvent) {
		//alert("Popup");
		var cls = [];

		var linkcount = 0;
		var specialLinkCount = 0;  // 特殊的类似多选框的链接
		var imagecount = 0;
		var checkboxcount = 0;
		var radiocount = 0;
		for (let [i, elem] in Iterator(this.elements)) {
			if (elem instanceof HTMLAnchorElement) 
			   elem.href.indexOf('javascript:') == 0 ? specialLinkCount++ : linkcount++;
		}
		for (let [i, elem] in Iterator(this.elements)) {
			if (elem instanceof HTMLAnchorElement && /\.(jpe?g|png|gif|bmp)$/i.test(elem.href))
				imagecount++;
		}
		for (let [i, elem] in Iterator(this.elements)) {
			if (elem instanceof HTMLInputElement && elem.type === 'checkbox') {
 				checkboxcount++;
			}
		}
		for (let [i, elem] in Iterator(this.elements)) {
			if (elem instanceof HTMLInputElement && elem.type === 'radio') {
 				radiocount++;
			}
		}
		if ( linkcount > 0 ) cls.push("hasLink");
		if ( imagecount > 0 ) cls.push("hasImageLink");
		if ( checkboxcount > 0 ) cls.push("hasCheckbox");
		if ( radiocount > 0 ) cls.push("hasRadio");
		if ( specialLinkCount > 0 ) cls.push("hasSpecialLink");



		var setCount = function(id, label){
			let currentEntry = document.getElementById(id);
			if(currentEntry)
				currentEntry.innerHTML = label;
		};

		var data = {
			"SnapLinksOpenLinks": "在新标签打开所有链接 (" + linkcount + ")",
			"SnapLinksCopyLinks": "复制所有链接URL (" + linkcount + ")",
			"SnapLinksCopyLinksReverse": "复制所有链接URL (" + linkcount + ") (反向)",
			"SnapLinksCopyLinksAndTitles": "复制所有链接标题 + URL (" + linkcount + ")",
			"SnapLinksCopyLinksAndTitlesMD": "复制所有链接标题 + URL (" + linkcount + ") (MD)",
			"SnapLinksCopyLinksAndTitlesBBS": "复制所有链接标题 + URL (" + linkcount + ") (BBS)",
			"SnapLinksCopyLinksRegExp": "复制所有链接标题 + URL (" + linkcount + ") (筛选)",
			"SnapLinksCopyLinksSetFormat": "复制所有链接标题 + URL (" + linkcount + ") (设置复制格式)",
			"SnapLinksOpenImageLinks": "在新标签页打开所有图片链接 (" + imagecount + ")",
			"SnapLinksImageLinksOnePage": "在一个标签页显示所有图片链接 (" + imagecount + ")",
			"SnapLinksCheckBoxSelect": "复选框 - 选中 (" + checkboxcount + ")",
			"SnapLinksCheckBoxCancel": "复选框 - 取消 (" + checkboxcount + ")",
			"SnapLinksCheckBoxTaggle": "复选框 - 反选 (" + checkboxcount + ")",
			"SnapLinksRadioSelect": "单选框 - 选中 (" + radiocount + ")",
			"SnapLinksRadioCancel": "单选框 - 取消 (" + radiocount + ")",
			"SnapLinksClickLinks": "特殊单选框 - 选中 (" + specialLinkCount + ")",
		};

		for(let id in data){
			setCount(id, data[id]);
		}


        var setStyleNode = function(showList){
			var setList = ["hasLink","hasImageLink","hasCheckbox","hasRadio","hasSpecialLink"];
			setList.forEach(
				function(elist){
					eClass = document.getElementsByClassName(elist);
					if(eClass){
						if(showList.indexOf(elist)==-1){
							for(var i=0;i<eClass.length;i++){
								eClass[i].style =  "display:none";
							}
							//eClass.forEach(function(enode){enode.setAttribute("stlye","display:none")})
						} else{
							for(var i=0;i<eClass.length;i++){
								eClass[i].style = "display:block";
							}							
							//eClass.forEach(function(enode){enode.setAttribute("stlye","display:block")})
						}
					}
				}
			)
		}
		
		 


		if (cls.length > 0) {
			setStyleNode(cls);
			snapLinks.openPopupAtScreen(aEvent.pageX, aEvent.pageY,aEvent.clientX,aEvent.clientY);
			
			//snapLinks.popup.className = cls.join(' ');
			
		} else {
			snapLinks.lowlightAll();
		}
	},
	openPopupAtScreen:function(ax,ay,cx,cy){
		
		var popMenu = document.getElementById("snapLinksMenupopup");
		var  midx = document.documentElement.clientWidth/2;
		var midy = document.documentElement.clientHeight/2;
		GM_log("pointerY:"+ay);
		GM_log("screen:"+midy*2);
		GM_log(ay-document.body.scrollTop);


		popMenu.className = "trigger_popup";
		//popMenu.style.position = "absolute";
		
		var menuRight = ax - popMenu.clientWidth;
		//alert(popMenu.clientHeight);
		var menuDown = ay - popMenu.clientHeight;

		//popMenu.setAttribute("style","left: "+ax.toString()+"px; top: "+ay.toString()+"px;")
        //popMenu.style.left = ax.toString()+"px";
		//popMenu.style.top = ay.toString()+"px";
        document.addEventListener("click",snapLinks.destroy,false);

		xaxis = (cx<midx) ? "left: "+ax.toString()+"px;":"left: "+menuRight.toString()+"px;";

		yaxis = (cy<midy) ? " top: "+ay.toString()+"px;" : " top: "+menuDown.toString()+"px;";
		popMenu.setAttribute("style", xaxis + yaxis);


		
		
		
		//popMenu.getElementById("SnapLinksCopyLinks").addEventListener()
		//alert(snapLinks.elements);
//      document.getElementById("SnapLinksOpenLinks").addEventListener("click",function(){snapLinks.openLinks()},false);
//	  document.getElementById("SnapLinksCopyLinks").addEventListener("click",function(){snapLinks.copyLinks()},false);
     
	},
	openLinks : function(regexp){
		var obj = {};
		for (let [i, elem] in Iterator(this.elements)) {
			if (!elem.href || /^(?:javascript:|mailto:|#)/i.test(elem.href)) continue;
			if (!regexp || regexp.test(elem.href))
				obj[elem.href] = true;
		}
		for (let [key, val] in Iterator(obj)) {
			
			GM_openInTab(key);
			//gBrowser.addTab(key, { ownerTab: gBrowser.mCurrentTab });
		}
	},
	clickLinks : function(){
		for (let [i, elem] in Iterator(this.elements)) {
			if (!elem.href || /^(?:javascript:|mailto:|#)/i.test(elem.href)) {
				elem.click();
			}
		}
	},
	copyLinks : function(regexp, reverse, format){




		//GM_log(selements);
		var links = this.elements.filter(function(elem){
			return elem instanceof HTMLAnchorElement && (!regexp || regexp.test(elem.href))
		});

		

		var num = 1,
			numReverse = links.length;
		links = links.map(function(e) {
			if (format) {
				return format.replace(/%t/g, e.textContent)
							 .replace(/%u/g, e.href)
							 .replace(/%r/g, numReverse--)
							 .replace(/%n/g, num++);
			}
			return e.href;
		});

        // 筛选出重复的
        links = snapLinks.unique(links);

        if(reverse)
        	links = links.reverse();

		if (links.length){
			GM_setClipboard(links.join('\n'));
			//Components.classes["@mozilla.org/widget/clipboardhelper;1"]
			//	.getService(Components.interfaces.nsIClipboardHelper)
            //    .copyString(links.join('\n'));
		}
	},
	imageOnePage : function(){
		var htmlsrc = [
			'<style>'
			,'img { max-width: 100%; max-height: 100%; }'
			,'</style>'].join('');
		for (let [i, elem] in Iterator(this.elements)) {
			if (elem instanceof HTMLAnchorElement && /\.(jpe?g|png|gif|bmp)$/i.test(elem.href))
				htmlsrc += '\n<img src="' + elem.href + '">'
		}
		GM_openInTab("data:text/html;charset=utf-8," +
			'<html><head><title>' + snapLinks.doc.domain + ' 图象列表</title><body>' +
			encodeURIComponent(htmlsrc));
	},
	checkbox : function(bool){
		for (let [i, elem] in Iterator(this.elements)) {
			if (elem instanceof HTMLInputElement && elem.type === 'checkbox') {
				elem.checked = arguments.length == 0?
					!elem.checked :
					bool;
			}
		}
	},
	radio : function(bool){
		for (let [i, elem] in Iterator(this.elements)) {
			if (elem instanceof HTMLInputElement && elem.type === 'radio') {
				elem.checked = arguments.length == 0?
					!elem.checked :
					bool;
			}
		}
	},
	unique: function(a){
		var o = {},
			r = [],
			t;
		for (var i = 0, l = a.length; i < l; i++) {
			t = a[i];
			if(!o[t]){
				o[t] = true;
				r.push(t);
			}
		}
		return r;
	}
};





function begin() {
	var ibody = document.getElementsByTagName("body")[0]
	ibody.setAttribute("contextmenu","popup-menu");

	var rclickMenu = document.createElement("menu");
	rclickMenu.setAttribute("type","context");
	rclickMenu.setAttribute('id', "popup-menu");

	var imenu = document.createElement("menuitem");
	imenu.setAttribute("id","snapclicks");	
	imenu.setAttribute('label', "snap-links");
	imenu.innerHTML = "snap links";

	rclickMenu.appendChild(imenu);
	ibody.appendChild(rclickMenu);

	imenu.addEventListener("click", snapLinks.init, false);

	var popup = document.createElement("div");
	//popup.setAttribute("onclick","snapLinks.lowlightAll();");
	popup.setAttribute("id","snapLinksMenupopup");
	popup.setAttribute("class","hidden_popup");
	popup.innerHTML = '<div class = "-hasLink-">' +
	    '<div  id="SnapLinksOpenLinks" class="hasLink" >在新标签打开所有链接</div>' +
		'<div id="SnapLinksCopyLinks" class="hasLink" >复制所有链接URL</div>' +
        '<div id="SnapLinksCopyLinksReverse" class="hasLink"  >复制所有链接URL（反向）</div>' +
        '<div id="SnapLinksCopyLinksAndTitles" class="hasLink"  >复制所有链接标题 + URL</div>' +
        '<div id="SnapLinksCopyLinksAndTitlesMD" class="hasLink" >复制所有链接标题 + URL (MD)</div>' +
        '<div id="SnapLinksCopyLinksAndTitlesBBS" class="hasLink">复制所有链接标题 + URL (BBS)</div>' +
        '<div id="SnapLinksCopyLinksRegExp" class="hasLink" >复制所有链接标题 + URL (筛选)</div>' +
        '<div id="SnapLinksCopyLinksSetFormat" class="hasLink" >复制所有链接标题 + URL (设置复制格式)</div>' +
		'<div id="SnapLinksOpenImageLinks" class="hasImageLink"  >在新标签页打开所有图片链接</div>' +
		'<div  id="SnapLinksImageLinksOnePage" class="hasImageLink" >在一个标签页显示所有图片链接</div>' +
		'</div>' +
		'<div class="hasLink-hasCheckbox-hasRadio" >' +
		'<div  id="SnapLinksCheckBoxSelect" class="hasCheckbox" >复选框 - 选中</div>' +
		'<div  id="SnapLinksCheckBoxCancel" class="hasCheckbox" >复选框 - 取消</div>' +
		'<div  id="SnapLinksCheckBoxTaggle" class="hasCheckbox" >复选框 - 反选</div>' +
		'<div  id="SnapLinksRadioSelect" class="hasRadio" >单选框 - 选中</div>' +
		'<div  id="SnapLinksRadioCancel" class="hasRadio">单选框 - 取消</div>' +
		'<div  id="SnapLinksClickLinks" class="hasSpecialLink" >特殊单选框 - 选中</div>' +
		'</div>';
	ibody.insertBefore(popup,ibody.childNodes[0]);



	  //popup.addEventListener("click",function(){snapLinks.lowlightAll()},false);
      document.getElementById("SnapLinksOpenLinks").addEventListener("click",function(){snapLinks.openLinks()},false);
	  document.getElementById("SnapLinksCopyLinks").addEventListener("click",function(){snapLinks.copyLinks()},false);
	  document.getElementById("SnapLinksCopyLinksReverse").addEventListener("click",function(){snapLinks.copyLinks(null, true)},false);
	  document.getElementById("SnapLinksCopyLinksAndTitles").addEventListener("click",function(){snapLinks.copyLinks(null, false, '%t\n%u')},false);
	  document.getElementById("SnapLinksCopyLinksAndTitlesMD").addEventListener("click",function(){snapLinks.copyLinks(null, false, '[%t](%u)')},false);
	  document.getElementById("SnapLinksCopyLinksAndTitlesBBS").addEventListener("click",function(){snapLinks.copyLinks(null, false, '[url=%u]%t[/url]')},false);
	  document.getElementById("SnapLinksCopyLinksRegExp").addEventListener("click",function(){var reg=prompt('请输入需要筛选的 RegExp', '');snapLinks.copyLinks(new RegExp(reg));},false);
	  //document.getElementById("SnapLinksCopyLinksSetFormat").addEventListener("click",function(){snapLinks.copyLinks()},false);

      document.getElementById("SnapLinksOpenImageLinks").addEventListener("click",function(){snapLinks.openLinks(/\.(jpe?g|png|gif|bmp)$/i);},false);
	  document.getElementById("SnapLinksImageLinksOnePage").addEventListener("click",function(){snapLinks.imageOnePage();},false);
	  document.getElementById("SnapLinksCheckBoxSelect").addEventListener("click",function(){snapLinks.checkbox(true);},false);
	  document.getElementById("SnapLinksCheckBoxCancel").addEventListener("click",function(){snapLinks.checkbox(false);},false);
	  document.getElementById("SnapLinksCheckBoxTaggle").addEventListener("click",function(){snapLinks.checkbox();},false);
	  document.getElementById("SnapLinksRadioSelect").addEventListener("click",function(){snapLinks.radio(true);},false);
	  document.getElementById("SnapLinksRadioCancel").addEventListener("click",function(){snapLinks.radio(false);},false);
	  document.getElementById("SnapLinksClickLinks").addEventListener("click",function(){snapLinks.clickLinks()},false);
	  

GM_addStyle(".hidden_popup { display:none!important; } .trigger_popup{display:block!important;z-index:99999}" +

" #snapLinksMenupopup{position:absolute;background-color: rgb(45,53,63);border-bottom: 0px solid rgb(20,20,20);" +
"border-bottom: 0px solid rgb(20,20,20);cursor:pointer;border-radius: 4px;border: 1px solid rgb(22,25,28);box-shadow:0 1px 0 rgba(162,184,204,0.25) inset,0 0 4px hsla(0,0%,0%,0.95);}" +
"#snapLinksMenupopup div{color: white;} #snapLinksMenupopup > div > div:hover{color: rgb(51,159,255);" + 
	 "background-color: transparent; background-image:linear-gradient(to bottom,rgb(37,46,54),rgb(36,40,45));} ");
};

begin();


