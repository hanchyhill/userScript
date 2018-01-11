// ==UserScript==
// @name        NWP helper in GuangDong
// @description 广东省气象业务网数值预报页面修改
// @namespace   minhill.com
// @include     http://10.148.8.228/to_fore_homepage.action*
// @version     1.3.3
// @grant       GM_addStyle
// @grant       @grant unsafeWindow
// @license     The MIT License (MIT); http://opensource.org/licenses/MIT
// @compatible  firefox
// @compatible  chrome
// @compatible  edge
// @note        2018/01/08 增加时效转换按钮
// @supportURL  https://greasyfork.org/scripts/26259
// @author Hanchy Hill
// ==/UserScript==
// select the target node
let userConfig = { // 用户设置
  alterDate : false, // 默认不修改时次
};

const elemsConfig = {
  latLonInput: undefined,
};

const helperConfig = {
  region:{
    hn:{//华南
      isMap: true,// 是否是等经纬地图
      projection:'Equidistant',// 投影
      latLon:{
        xRight:636.98, xLeft:172.56,
        yTop:56.516, yBottom:547.576,
        lon0:105.0, lon1:120.0,
        lat0:15.0, lat1:30.0,
      },
    },
    cn:{//中国
      isMap: true,// 是否是等经纬地图
      projection:'Lambert',
      latLon:{
        xRight:729.98, xLeft:47.9833,
        yTop:48.51666, yBottom:556.51666,
        lon0:80, lon1:150,
        lat0:0, lat1:50,
      },

    },
    oy:{//欧亚
      isMap: true,// 是否是等经纬地图
      projection:'Mercator',
      latLon:{
        xRight:692.9833, xLeft:156.9833,
        yTop:54.51666, yBottom:533.51666,
        lon0:60.0, lon1:160.0,
        lat0:10.0, lat1:70.0,
      },
    },
    gd:{//广东
      isMap: true,// 是否是等经纬地图
      projection:'Equidistant',// 投影
      latLon:{
        xRight:589.98334, xLeft:124.98334,
        yTop:104.51666, yBottom:437.51666,
        lon0:110, lon1:116,
        lat0:21.0, lat1:25.0,
      },
    },
    hy:{//海洋
      isMap: true,// 是否是等经纬地图
      projection:'Lambert',// 投影
      latLon:{
        xRight:636.98, xLeft:172.56,
        yTop:56.516, yBottom:547.576,
        lon0:105.0, lon1:120.0,
        lat0:15.0, lat1:30.0,
      },
    },
    '86st':{//单站
      isMap: false,
    },
    rainnest:{//雨涡
      isMap: false,
    },

  },
  currentRegion:'hn',
  matchLoc:()=>{},// 获取经纬度的函数
  matchParam:'',// 调用上式的第二参数
};

const utils = {
  changeRegion(region){
    helperConfig.currentRegion = region;
    return helperConfig.region[region].isMap;// 返回是否是地图
  },
  projection:{
    Mercator:{// 墨卡托投影
      calBasicInfo(lat1=0,lat2=0,n1=0,n2=0){
        /*参数lat 纬度, n坐标数值
        n0 赤道，d0放大系数
        */
        const y1 = Math.log(Math.tan(lat1)+1/Math.cos(lat1));
        const y2 = Math.log(Math.tan(lat2)+1/Math.cos(lat2));
        const n0 = (n1 - (y1/y2) * n2) / (1.0 - y1/y2);
        const d0 = y1/(n0 - n1);
        return {n0,d0};
      },
      calLatLon(mouseXY,dims){
        // console.log(dims);
        const n0 = dims.n0;
        const d0 = dims.d0;
        // console.log(Math.sinh((n0-mouseXY.y)*d0));
        const lat = Math.atan(Math.sinh((n0-mouseXY.y)*d0));
        ///---------------//
        const r = dims.xLeft;
        const o = dims.xRight;
        const s = (dims.lon1 - dims.lon0) / (o - r);
        const u = dims.lon0 + (mouseXY.x - r) * s;
        return {lat:lat*180/Math.PI,lon:u};
      },
    },
    Equidistant:{//等经纬度
      calBasicInfo(){
        return helperConfig.region[helperConfig.currentRegion].latLon
      },
      calLatLon(mouseXY,dims){
        // console.log(dims);
        const r = dims.xLeft;
        const o = dims.xRight;
        const i = dims.yTop;
        const l = dims.yBottom;
        const s = (dims.lon1 - dims.lon0) / (o - r); // o - r 内框宽度 -> s = lon/height
        const d = (dims.lat1 - dims.lat0) / (i - l);// i - l 内框高度  -> d = lat/width
        const u = dims.lon0 + (mouseXY.x - r) * s;
        const m = dims.lat1 + (mouseXY.y - i) * d;
        return {lat:m,lon:u};
      }

    },

  },
};

GM_addStyle('#pic_frame div{border:1px solid !important;cursor:crosshair !important;}');

var NWP_init = function(){
    var fcHour = document.getElementById('forecast_hour');
    var iniTime = document.getElementById('create_day');
    var infoBar = document.getElementById('pic_info');
    var referNode = document.getElementById('to_contrast');
    var divTime = document.createElement('span');
    divTime.textContent = 'hello world';
    divTime.setAttribute('class', 'lcTime');
    divTime.style.position = 'relative';
    divTime.style.float = 'right';
    divTime.style.right = '120px';
    infoBar.insertBefore(divTime, referNode);
    // document.querySelector("#forecast_hours div").textContent = "日期";

    // create an observer instance
    var UTC8 = new MutationObserver(function (mutations) {
      var dateString = iniTime.textContent.match(/(\d+).*?(\d+).*?(\d+).*?(\d+)/);
      var fcDate = [];
      fcDate[0] = Number(dateString[1]);
      fcDate[1] = Number(dateString[2]);
      fcDate[2] = Number(dateString[3]);
      fcDate[3] = Number(dateString[4]);
      fcDate[4] = Number(fcHour.textContent.match(/\d+/));
      fcDate[5] = new Date(fcDate[0], fcDate[1] - 1, fcDate[2], fcDate[3] + fcDate[4] + 8);
      var localTime = String(fcDate[5].getMonth() + 1) + '月' + fcDate[5].getDate() +
      '日' + fcDate[5].getHours() + '时 GMT+8';
      divTime.textContent = localTime;
    });
    // configuration of the observer:
    var config = {
      attributes: true,
      childList: true,
      characterData: true
    };
    UTC8.observe(fcHour, config);
    // later, you can stop observing
    //observer.disconnect();
    //
    //
    /////////////////////////////////////////////////////////////


    //
    ///
    ////////////////////修改时效列/////////////////////////////////////////
    var alterTimelist = function (mutations) {
      //alert(timeBar.length);
      if(!userConfig.alterDate) return; // 不修改则直接返回
      var dateString = iniTime.textContent.match(/(\d+).*?(\d+).*?(\d+).*?(\d+)/);
      var fcDate = [];
        fcDate[0] = Number(dateString[1]);
        fcDate[1] = Number(dateString[2]);
        fcDate[2] = Number(dateString[3]);
        fcDate[3] = Number(dateString[4]);
      for (let i = 0; i < timeBar.length; i++) {
        oValue = timeBar[i].value;
        fcDate[4] = Number(timeBar[i].value);

        fcDate[5] = new Date(fcDate[0], fcDate[1] - 1, fcDate[2], fcDate[3] + fcDate[4] + 8);

        iday = String(fcDate[5].getDate());
        iday = Array(2 > iday.length ? 2 - iday.length + 1 || 0 : 0).join(0) + iday;

        ihour = String(fcDate[5].getHours());
        ihour = Array(2 > ihour.length ? 2 - ihour.length + 1 || 0 : 0).join(0) + ihour;

        localTime = iday+' ' + ihour+'     ;';
        styleText = '#'+timeBar[i].getAttribute("id")+':before{white-space:pre;content: "  '+localTime+'  "}';
        GM_addStyle(styleText);

        switch(fcDate[5].getHours()){
          case 5:
            timeBar[i].style.cssText = "border-left:2px solid #9B30FF";
            break;
          case 14:
            timeBar[i].style.cssText = "border-left:2px solid #EE3B3B";
            break;
          case 20:
            timeBar[i].style.cssText = "border-bottom:1px dotted #8E8E8E;border-left:2px solid #ffffff;";
            break;
          default:
            timeBar[i].style.cssText = "border-left:2px solid #ffffff;";
        }
      }
    };
    /////////////////////////////////////////////////////////////
    ///
    var selectObserver = new MutationObserver(alterTimelist);
    // configuration of the observer:
    var timeBar = document.querySelector("#forecast_hours select");
    var config2 = {
      attributes: false,
      childList: true,
      characterData: false,
    };
    selectObserver.observe(timeBar, config2);
    GM_addStyle("#forecast_hours option{width: 50px!important; overflow: hidden!important;}");

    //-----------------------------------------------------------------------------//
    let imgObserver = new MutationObserver(fitImgLoc);
    imgObserver.observe(timeBar, config2);
    //-----------------------------------绑定坐标-----------------------------------//
    function fitImgLoc(){ // 绑定img包含的div元素
      // console.log(unsafeWindow._region);
      // TODO
      const isMap = utils.changeRegion(unsafeWindow._region); // 改变地图;
      if(!isMap) return; // 如果不是地图直接返回
      /////TODO 判断地图逻辑分离
      const currMap = helperConfig.region[helperConfig.currentRegion];
      const currProjection = currMap.projection;
      //let matchLoc = ({});
      //let param = ({});
      switch (currProjection) {
        case 'Mercator':
          const dims = currMap.latLon;
          const lat1 = Math.PI/180.0 * dims.lat0;
          const lat2 = Math.PI/180.0 *dims.lat1;
          const n1 = dims.yBottom;
          const n2 = dims.yTop;
          // console.log(dims);
          const param1 = utils.projection.Mercator.calBasicInfo(
            lat1, lat2, n1, n2
          )
          helperConfig.matchParam = {...param1,
                  xRight:dims.xRight,
                  xLeft:dims.xLeft,
                  lon0:dims.lon0,
                  lon1:dims.lon1,
                  }
          console.log(helperConfig.matchParam);
          helperConfig.matchLoc = utils.projection.Mercator.calLatLon;
          break;
      
        default:
          helperConfig.matchParam = currMap.latLon;
          helperConfig.matchLoc = utils.projection.Equidistant.calLatLon;
          break;
      }

      let wrapDiv = document.querySelector('#pic_frame div');
      if(wrapDiv){
        wrapDiv.addEventListener('mousemove', getMouseLatLon);
        // console.log(wrapDiv.clientWidth);// offsetWidth , clientWidth, scrollWidth
      }
    }

     function getElemRelPos (e, t, n) {// e.target, e.clientX, e.clientY
      var a = e.getBoundingClientRect(),
          r = getComputedStyle(e);
      return {
          x: t - (a.left + parseFloat(r.paddingLeft) + parseFloat(r.borderLeftWidth)),
          y: n - (a.top + parseFloat(r.paddingTop) + parseFloat(r.borderTopWidth))
      };
    }

    function getMouseLatLon(event){
      let target = event.target;//
      let dims = helperConfig.region[helperConfig.currentRegion].latLon;


      /*let dims =  {"width": 875, "height": 601,
                "pagewidth": 876, "pageheight": 601,
                "Xplot0": 211.0, "Xplot1": 812.0,
                "Yplot0": 53, "Yplot1": 676,// 从下往上算
                "lon0": 105.0, "lon1": 120.0,
                "lat0": 15.0, "lat1": 30.0}; */
                  //"pagewidth": 876, "pageheight": 602,
                  //"Xplot0": 87, "Xplot1": 773,
                  //"Yplot0": 54, "Yplot1": 549,
                  //"lon0": 101, "lon1": 126.314,
                  //"lat0": 15, "lat1": 30.15};
      const mouseXY = getElemRelPos(target, event.clientX, event.clientY); // 相对图像的像素位置{x,y}
      // console.log(mouseXY);
      // const r = dims.Xplot0 / dims.pagewidth * target.clientWidth;// r ->x右值
      // const o = dims.Xplot1 / dims.pagewidth * target.clientWidth;// o ->x左值
      // const i = (dims.pageheight - dims.Yplot1) / dims.pageheight * target.clientHeight;// y 上值
      // const l = (dims.pageheight - dims.Yplot0) / dims.pageheight * target.clientHeight;// y 下值
/*       const r = dims.xLeft;
      const o = dims.xRight;
      const i = dims.yTop;
      const l = dims.yBottom;
      const s = (dims.lon1 - dims.lon0) / (o - r); // o - r 内框宽度 -> s = lon/height
      const d = (dims.lat1 - dims.lat0) / (i - l);// i - l 内框高度  -> d = lat/width
      const u = dims.lon0 + (mouseXY.x - r) * s;
      const m = dims.lat1 + (mouseXY.y - i) * d; */
      const loc = helperConfig.matchLoc(mouseXY, helperConfig.matchParam);
      elemsConfig.latLonInput.lat.innerHTML = loc.lat;
      elemsConfig.latLonInput.lon.innerHTML = loc.lon;
      // console.log(mouseXY.x, mouseXY.y);
      // return {lat: m, lon: u};
      //console.log(mouseXY.x, mouseXY.y);
      //console.log(m,u,mouseXY.x,mouseXY.y);

    }
    //------------------------------24小时跳跃-------------------------------------//
    var timeJump = function(){
      //var hourBar = document.getElementById('from_hour');float-l
      var jumpParent = document.querySelector('.float-l');
      var pre24 = document.createElement('button');
      pre24.addEventListener("click", function(){timeTrigger(-24);});
      pre24.textContent = "-24";
      jumpParent.appendChild(pre24);

      var next24 = document.createElement('button');
      next24.addEventListener("click", function(){timeTrigger(24);});
      next24.textContent = "+24";
      jumpParent.appendChild(next24);

      var timeTrigger = function(timer){
        selectedVal = timeBar[timeBar.selectedIndex].getAttribute("data-hour");
        nextVal = String(Number(selectedVal) + timer);
        var posi = 3;
        nextVal = Array(posi > nextVal.length ? posi - nextVal.length + 1 || 0 : 0).join(0) + nextVal;
        nextopt = timeBar.querySelector("#option_"+nextVal);
        //alert(nextopt);
        if(!nextopt) return;
        timeBar[timeBar.selectedIndex].selected = false;
        nextopt.selected = true;
        //var oitem = document.getElementById('option_018');
        //oitem.selected = true;
        var changeEvt = document.createEvent('HTMLEvents');
        changeEvt.initEvent('change',true,true);
        timeBar.dispatchEvent(changeEvt);
      };
    };

    timeJump();
    /////切换时效

    function switchDate(){
      userConfig.alterDate = !userConfig.alterDate;
      if(userConfig.alterDate){
        switchDateBtn.textContent = "切换成时效";
        alterTimelist();
      }
      else{
        switchDateBtn.textContent = "切换成日期";
        for(let ele of timeBar){
          ele.style.cssText = '';
          styleText = '#'+ele.getAttribute("id")+':before{white-space:pre;content: ""}';
        GM_addStyle(styleText);
        }
      }
    }

    var switchParent = document.querySelector('.float-l');
    let switchDateBtn = document.createElement('button');
    switchDateBtn.addEventListener("click", switchDate);
    switchDateBtn.textContent = "切换成日期";
    switchParent.appendChild(switchDateBtn);
    /////end 切换时效 /////
  };

function createPanel(){
  //-创建面板-//
  const panelWrap = document.createElement("div");
  panelWrap.setAttribute("id","helper_panel");
  panelWrap.setAttribute("class","show_panel");
  const latLonWarp = document.createElement("div");
  latLonWarp.setAttribute("id","helper_latLon");
  latLonWarp.setAttribute("class","show_latLon");
  latLonWarp.innerHTML = '<span>Lat <span class="fixLoc" id="helper_lat"></span> Lon <span class="fixLoc" id="helper_lon"></span></span>';
  panelWrap.appendChild(latLonWarp);
  const ibody = document.getElementsByTagName("body")[0];
  ibody.appendChild(panelWrap);
  //-------//
  //-注册到全局变量-//
  elemsConfig.latLonInput = {
    lat:document.getElementById('helper_lat'),
    lon:document.getElementById('helper_lon'),
  };
}
// 添加面板样式
GM_addStyle(`.show_panel{display:block!important;z-index:1001;}
  #helper_panel{
      position:absolute; top:5px;right:10px;
      background-color: rgb(45,53,63);
      border-bottom: 0px solid rgb(20,20,20); padding:5px;
      border-bottom: 0px solid rgb(20,20,20);border-radius: 4px;border: 1px solid rgb(22,25,28);
      box-shadow:0 1px 0 rgba(162,184,204,0.25) inset,0 0 4px hsla(0,0%,0%,0.95);
      color: white;}
  #helper_latLon .fixLoc{display:inline-block;width:40px;height:15px;overflow:hidden;}
    `);
createPanel();
NWP_init();
