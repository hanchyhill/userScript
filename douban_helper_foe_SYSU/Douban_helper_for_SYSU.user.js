// ==UserScript==
// @name:zh     广州大学城图书馆豆瓣助手(中山大学版)
// @name        Douban library helper for SYSU
// @description 为豆瓣图书增加广州大学城图书馆藏
// @author      Hanchy Hill
// @namespace   https://minhill.com
// @include     http://book.douban.com/subject/*
// @include     http://202.116.64.108:8080/apsm/recommend/recommend_nobor.jsp*
// @include     http://202.116.64.108:8080/apsm/recommend/recommend.jsp*
// @include     http://202.38.232.10/opac/servlet/opac.go?cmdACT=recommend.form*
// @include     http://read.douban.com/ebook/*
// @include     http://www.gdtgw.cn:8080/*
// @include     http://opac.gdufs.edu.cn:8991/F/*func=item-global*
// @include     http://202.116.64.108:8991/F/*func=item-global*
// @include     http://202.38.232.10/opac/servlet/opac.go*
// @include     http://lib.gzhu.edu.cn:8080/bookle/search2/detail/*
// @include     http://202.116.41.246:8080/opac/item.php?marc_no=*
// @include     http://210.38.102.131:86/opac/item.php?marc_no=*
// @include     http://222.200.98.171:81/bookinfo.aspx?ctrlno=*
// @include     http://121.33.246.167/opac/bookinfo.aspx?ctrlno=*
// @include     http://218.192.148.33:81/bookinfo.aspx?ctrlno=*
// @require     http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @version     1.6.7
// @license     MIT
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_xmlhttpRequest
// @grant GM_openInTab
// @grant GM_deleteValue
// @grant GM_addStyle
// @grant GM_registerMenuCommand
// @grant GM_setClipboard
// @icon        http://minhill.com/blog/wp-content/uploads/2012/03/favicon.ico
// ==/UserScript==


GM_addStyle("#ISBNLoading,#titleLoading { list-style-type:none; }");

var schoolList=["SYSU","SCUT","SCNU","GDUT","GDUFS","GZHTCM","GZHU","GZARTS","XHCOM"];

//个人选项设置
var prefs={
    school:GM_getValue("school","SYSU"),
    studentID:GM_getValue("studentID","2333333"),
    //password:"Hello_Kitty",
    campus:GM_getValue("campus","东校区"),
    telephone:GM_getValue("telephone","13145201748"),
    name:GM_getValue("name","二三三"),
    eMail:GM_getValue("eMail","HelloKitty@sysu.edu.cn"),
    libraryId:GM_getValue("libraryId","ID1000244462")
}


function LibMeta(schoolName){
    this.state=null;
    this.error=false;
    this.errorMsg=null;
    this.type=null;
    this.link=null;
    this.items=null;
    this.originUrl=null;
    this.school=schoolName;
}


function LibItem(school){
    this.bookName=null;
    this.author=null;
    this.bookIndex=null;
    this.publisher=null;
    this.pubDate=null;
    this.school=school;
    this.link=null;
    this.type="booklist";
}

function StoreItem(school){
    this.school=school;
    this.storeState=null;
    this.borrowTime=null;
    this.returnTime="";
    this.location=null;
    this.bookIndex=null;
    this.branch=null;
    this.link=null;
    this.type="store";
    this.rentable=false;
}



///////////////////////////豆瓣图书元信息///////////////////////////////////
bookMeta=(function(){
    if(location.href.indexOf('book')==-1){return null;}

    if(location.href.indexOf('douban.com/subject')!=-1){
        //执行豆瓣图书Func.
    
  var rawBookInfo=document.getElementById("info").innerHTML; //获取info块
  var author = document.querySelector("#info a"); //获取作者
  if (author){
    author = author.innerHTML.trim();

  }

  var title =document.querySelector('h1 span').textContent;
  var bracketIndex = title.indexOf("(");//去除括号，防止搜索进行子匹配操作
    if(bracketIndex!=-1){
        title=title.slice(0,bracketIndex);
    }

  bracketIndex = title.indexOf("（");//去除括号，防止搜索进行子匹配操作
    if(bracketIndex!=-1){
        title=title.slice(0,bracketIndex);
    }

  var publisher = /出版社:<\/span>(.*)<br>/.exec(rawBookInfo);
  if (publisher !== null){
    publisher = publisher[1].trim();
  }

  var pubdate = /出版年:<\/span>(.*)<br>/.exec(rawBookInfo); 
  if (pubdate !== null){
    pubdate = /[\d]+/.exec(pubdate[1].trim());
    pubdate = pubdate[0];
  }

  var price = /定价:<\/span>(.*)<br>/.exec(rawBookInfo);
  if (price !== null){
    price = price[1].trim();
  }

  var isbn = /ISBN:<\/span>(.*)<br>/.exec(rawBookInfo);
  if (isbn !== null){
    isbn = isbn[1].trim();
  }
  var bookIndex = /统一书号:<\/span>(.*)<br>/.exec(rawBookInfo);
  if (bookIndex !== null){
    bookIndex = bookIndex[1].trim();
  }

  var rating = document.querySelector('#interest_sectl .rating_num').innerHTML.trim();
  if (!rating) {
    rating = '暂无评分';
  }
  }

  else if(location.href.indexOf('ebook')!=-1){
    var allNodes, isbn=null;
    allNodes = document.evaluate('//a[@itemprop="isbn"]',document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);//获取isbn
    //alert(allNodes.snapshotItem(0));
    if(allNodes.snapshotItem(0)){
        isbn=allNodes.snapshotItem(0).innerHTML;
      //alert(isbn);
    }
//////////////

////////////
    var title;
    allNodes = document.evaluate('//h1[@itemprop="name"]',document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
    if(allNodes.snapshotItem(0)){
        title=allNodes.snapshotItem(0).innerHTML;
        var bracketIndex = title.indexOf("(");//去除括号，防止搜索进行子匹配操作
        if(bracketIndex!=-1){
            title=title.slice(0,bracketIndex);
        }
    
        bracketIndex = title.indexOf("（");//去除括号，防止搜索进行子匹配操作
            if(bracketIndex!=-1){
            title=title.slice(0,bracketIndex);
        }
      //alert(title);
    }

    var publisher;
    allNodes = document.evaluate('//span[@itemprop="publisher"]',document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
    if(allNodes.snapshotItem(0)){
        publisher=allNodes.snapshotItem(0).innerHTML;
      //alert(publisher);
    }

    var author;
    allNodes = document.evaluate('//span[@itemprop="author"]',document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
    if(allNodes.snapshotItem(0)){
        author=allNodes.snapshotItem(0).innerHTML;
      //alert(author);
    }

    var pubdate;
    allNodes = document.evaluate('//span[@itemprop="datePublished"]',document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
    if(allNodes.snapshotItem(0)){
        pubdate=allNodes.snapshotItem(0).innerHTML;
        pubdate=pubdate.slice(0,4);
      //alert(pubdate);
    }    

    var rating='暂无评分';
    var price="";
    var bookIndex="";
  }
//////////////////////ISBN转为旧格式///////////////////////////////////
  function ISBN10(isbn){

    if(isbn == null){
        return null;
    }
    else if(pubdate == null){

        return isbn;
    }

    if(isbn.length==13){

    var rawISBN=isbn.slice(3,12);

    var checkCode=0;//校验码
    for(i=0;i<9;i++){
        checkCode+=parseInt(rawISBN[i])*(10-i);
    }

    checkCode=11-checkCode%11;
    if(checkCode==10){checkCode="X";}


    var preCode="";
    publishDate=Number(pubdate.slice(0,4));
    if((publishDate)>=2007){//判断年份以检查是否需要加前缀和修正校验位
        preCode=isbn.slice(0,3)+"-";
        checkCode=isbn[12];
    }
}
    else{//ISBN只有10位的时候，年份小于2007时校验位为原码
        rawISBN =isbn.slice(0,9);
        checkCode = isbn[9];
        preCode="";
        publishDate=Number(pubdate.slice(0,4));
    if((publishDate)>=2007){//判断年份以检查是否需要加前缀和修正校验位
        preCode='978'+"-";
        a = 7+parseInt(rawISBN[0])+parseInt(rawISBN[2])+parseInt(rawISBN[4])+parseInt(rawISBN[6])+parseInt(rawISBN[8]);
        a =a*3;
        b = 9+8+parseInt(rawISBN[1])+parseInt(rawISBN[3])+parseInt(rawISBN[5])+parseInt(rawISBN[7]);
        c = a+b;
        d = c%10;
        checkCode = (10-d)%10;
    }
}
    switch(rawISBN[1]){
    case '0':
        ISBNold=preCode+rawISBN[0]+"-"+rawISBN.slice(1,3)+"-"+rawISBN.slice(3,9)+"-"+checkCode;
        break;
    case '1':
    case '2':
    case '3':
        ISBNold=preCode+rawISBN[0]+"-"+rawISBN.slice(1,4)+"-"+rawISBN.slice(4,9)+"-"+checkCode;
        break;
    case '5':
    case '7':
        ISBNold=preCode+rawISBN[0]+"-"+rawISBN.slice(1,5)+"-"+rawISBN.slice(5,9)+"-"+checkCode;
        break;
    case '4':
    case '8':
        ISBNold=preCode+rawISBN[0]+"-"+rawISBN.slice(1,6)+"-"+rawISBN.slice(6,9)+"-"+checkCode;
        break;
    default:
        ISBNold=rawISBN;
        break;
    }
    return ISBNold;
  }

var isbn10=ISBN10(isbn,pubdate);
/////////////////////////////////////////////////////////

  return{
    "title": title,
    "author": author,
    "publisher": publisher,
    "pubdate": pubdate,
    "price": price,
    "isbn": isbn,
    "bookIndex": bookIndex,
    "rating": rating,
    "isbn10": isbn10
  };
})();

//alert(bookMeta.isbn10);


//各学校元信息
var schoolInfo={
//中山大学
"SYSU":{
    name:"中山大学",
    anySearchUrl:"http://202.116.64.108:8991/F/?func=find-b&find_code=WRD&request=%s",
    anyForeianSearchUrl:"http://202.116.64.108:8991/F/?func=find-b&find_code=WRD&request=%s&local_base=ZSU09",
    isbnSearchUrl:"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=%s",
    isbnForeianSearchUrl:"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=%s&local_base=ZSU09",
    titleSearchUrl:"",
    abbrName:"中大",
    isGBK:false,
    recommendUrl:"http://202.116.64.108:8080/apsm/recommend/recommend.jsp?url_id=http://202.116.64.108:8991/F/"
},

//华南理工大学
"SCUT":{
    name:"华南理工大学",
    anySearchUrl:"http://202.38.232.10/opac/servlet/opac.go?CLANLINK=&CODE=&FIELD1=TITLE&MARCTYPE=&MODE=FRONT&ORGLIB=SCUT&PAGE=&RDID=ANONYMOUS&SCODE=&TABLE=&VAL1=%s&cmdACT=simple.list&libcode=",
    isbnSearchUrl:"http://202.38.232.10/opac/servlet/opac.go?CLANLINK=&CODE=&FIELD1=ISBN&MARCTYPE=&MODE=FRONT&ORGLIB=SCUT&PAGE=&RDID=ANONYMOUS&SCODE=&TABLE=&VAL1=%s&cmdACT=simple.list&libcode=",
    abbrName:"华理工",
    isGBK:false,
    recommendUrl:"http://202.38.232.10/opac/servlet/opac.go?cmdACT=recommend.form"

},

//南中国一般大学
"SCNU":{
    name:"华南师范大学",
    abbrName:"华师",
    anySearchUrl:"http://202.116.41.246:8080/opac/openlink.php?sort=M_TITLE&orderby=ASC&title=%s",
    isbnSearchUrl:"http://202.116.41.246:8080/opac/openlink.php?isbn=%s&_m=1",
    isGBK:false
},

//广东工业大学
"GDUT":{
    name:"广东工业大学",
    abbrName:"广工",
    anySearchUrl:"http://222.200.98.171:81/searchresult.aspx?anywords=%s&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL",
    isbnSearchUrl:"http://222.200.98.171:81/searchresult.aspx?isbn_f=%s&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL",
    isGBK:true
},

//外语外贸大学
"GDUFS":{
    name:"广东外语外贸大学",
    abbrName:"广外",
    anySearchUrl:"http://opac.gdufs.edu.cn:8991/F/?find_code=WRD&request=%s&func=find-b",
    isbnSearchUrl:"http://opac.gdufs.edu.cn:8991/F/?func=find-b&find_code=ISB&request=%s&local_base=GWD01",
    isbnForeianSearchUrl:"http://opac.gdufs.edu.cn:8991/F/?func=find-b&find_code=ISB&request=%s&local_base=GWD09",
    isGBK:false

},

//广州中医药大学
"GZHTCM":{
  name:"广州中医药大学",
  abbrName:"广中医",
  anySearchUrl:"http://210.38.102.131:86/opac/openlink.php?sort=M_TITLE&orderby=ASC&title=%s",
  isbnSearchUrl:"http://210.38.102.131:86/opac/openlink.php?strText=%s&strSearchType=isbn",
  isGBK:false
},

//广州大学
"GZHU":{
    name:"广州大学",
    abbrName:"广大",
    anySearchUrl:"http://lib.gzhu.edu.cn:8080/bookle/?id=searchForm&displayPages=15&index=default&matchesPerPage=10&query=%s&searchPage=1&submit=Bookle%20%E6%90%9C%E7%B4%A2",
    isbnSearchUrl:"http://lib.gzhu.edu.cn:8080/bookle/?index=default&query=STANDARDNO%3A%28%s%29",
    isGBK:false
},

//广州美术学院gzarts
"GZARTS":{
    name:"广州美术学院",
    abbrName:"广美",
    anySearchUrl:"http://121.33.246.167/opac/searchresult.aspx?anywords=%s&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL&ecx=0",
    isbnSearchUrl:"http://121.33.246.167/opac/searchresult.aspx?isbn_f=%s&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL&ecx=0",
    //http://121.33.246.167/opac/searchresult.aspx?isbn_f=7-02-000220-X&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL&ecx=0
    isGBK:true
},


//星海音乐学院
"XHCOM":{
    name:"星海音乐学院",
    abbrName:"星海",
    anySearchUrl:"http://218.192.148.33:81/searchresult.aspx?anywords=%s&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL",
    isbnSearchUrl:"http://218.192.148.33:81/searchresult.aspx?isbn_f=%s&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL",
    isGBK:true
},

//广东药学院,由于编码问题和没提供ISBN检索，暂不支持//
}





function popSetting(){
        GM_addStyle("#libSetting {background: #F6F6F1;border: 1px solid #aaa;box-shadow: 0 0 8px 2px #777;height: auto;left: 320px;min-height: 100px;padding: 0 20px 65px;position: fixed;top: 25%;width: 600px;z-index: 1000002;}"+
'.setbtn{display: inline-block; background: #33A057; border: 1px solid #2F7B4B; color: white; padding: 1px 10px; border-radius: 3px; margin-right: 8px;margin:5px;cursor:pointer;} ');


    var settingDiv = document.createElement("div");
    settingDiv.setAttribute("id","libSetting");
    settingDiv.innerHTML="<h2>图书馆检索设置</h2>"+
    '&nbsp&nbsp'+'学校<select id="setschool" class="barname">'+'<option value="SYSU">中山大学</option><option value="SCUT">华南理工大学</option>'+
    '<option value="SCNU">华南师范大学</option><option value="GDUFS">广东外语外贸大学</option>'+
    '<option value="GDUT">广东工业大学</option><option value="GZHU">广州大学</option>'+
    '<option value="GZHTCM">广州中医药大学</option><option value="GZARTS">广州美术学院</option><option value="XHCOM">星海音乐学院</option></select>'+'&nbsp&nbsp'+
    '学号<input id="setstudentID" class="barname">'+'&nbsp&nbsp&nbsp'+
    //'password<input id="setpassword" class="barname">'+'<br>'+
    '校区<input id="setcampus" class="barname">'+'<br><br>'+
    '手机号<input id="settelephone" class="barname">'+'&nbsp&nbsp'+
    '姓名<input id="setname" class="barname">'+'&nbsp&nbsp'+
    '邮箱<input id="seteMail" class="barname">'+'<br>'+'<br>'+
    '读者ID<input id="setLibID" class="barname">*读者ID为荐购页面登陆时所填写的ID，请自行查阅本馆读者荐购页面'+'<br>'+'<br>'+
    '<a id="setsave" class="setbtn">保存设置并刷新</a><a  id="setclose" class="setbtn">直接关闭</a>'

    document.getElementsByTagName("body")[0].appendChild(settingDiv);// 插入完毕

    document.getElementById("setschool").value=prefs.school;
    document.getElementById("setstudentID").value=prefs.studentID;
    document.getElementById("setcampus").value=prefs.campus;
    document.getElementById("settelephone").value=prefs.telephone;
    document.getElementById("setname").value=prefs.name;
    document.getElementById("seteMail").value=prefs.eMail;
    document.getElementById("setLibID").value=prefs.libraryId;
    function setSaving(){
        //alert(document.getElementById("setstudentID").value);
        GM_setValue("school",document.getElementById("setschool").value);

        GM_setValue("studentID",document.getElementById("setstudentID").value);
        //alert(GM_getValue("studentID"));
        GM_setValue("campus",document.getElementById("setcampus").value);
        GM_setValue("telephone",document.getElementById("settelephone").value);
        GM_setValue("name",document.getElementById("setname").value);
        GM_setValue("eMail",document.getElementById("seteMail").value);
        GM_setValue("libraryId",document.getElementById("setLibID").value);
        settingDiv.parentNode.removeChild(settingDiv);
        location.reload();    
    } 
    //function setClosing(){
        //alert(document.getElementById("setstudentID").value);
        
   
    //} 
    document.getElementById("setsave").addEventListener("click",setSaving,false); 
    document.getElementById("setclose").addEventListener("click",function(){settingDiv.parentNode.removeChild(settingDiv)},false);
    
}



//函数：提取isbn搜索元信息
var isbnFilter={
    //中山大学
    SYSU: {

        respond:function (reDetails,frameLocation,fullUrl) {

              //var fullUrl = reDetails.finalUrl;
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("SYSU");
                msg.state="error";
                msg.errorMsg="ISBN连接错误";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
              //document.getElementById("footer").textContent=reDetails.responseText;
              if(reDetails.responseText.indexOf('indexpage')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
                  var msg = new LibMeta("SYSU");
                  msg.state="recommend";
                  //hasBook = false;
                  //recommendBook();
                  messageCatcher(msg,frameLocation);
                  return;
              }

                //document.getElementById("footer").textContent=reDetails.responseText;
                //var frame =document.createElement("div");
                //frame.innerHTML = reDetails.responseText;
                //alert(frame.innerHTML);
                if(reDetails.responseText.indexOf('Search Results')!=-1){
                    //alert("跳转到搜索页");
                    //var frame =document.createElement("div");
                //frame.innerHTML = reDetails.responseText;
                //document.getElementById("reviews").textContent=frame.innerHTML;          
                
                    titleFilter.SYSU.filter(reDetails.responseText,fullUrl,frameLocation);
                    
                }
                else{

                  isbnFilter.SYSU.filter(reDetails.responseText,frameLocation);

                }
                
                return;
        },


        filter:function(gettxt,frameLocation){

        /////////////////////////////////////////////////////////

        str = gettxt;
        str = str.replace(/[ | ]*\n/g,''); //去除行尾空白
        str = str.replace(/\n[\s| | ]*\r/g,''); //去除多余空行
        str = str.replace(/amp;/g,""); //去除URL转码
        //alert(str);


        ///获取一整块
        var eBook;
        eBook = null;
        if(str.match(/电子资源定位/)){
        //document.getElementById("footer").textContent=str;
        eBook = str.match(/电子资源定位.*?jpg.*?File Extension: url">(.*?)<\/a>/)[1];
        }
        if(!eBook&&str.indexOf("索书")==-1){
            var msg = new LibMeta("SYSU");
            msg.state="recommend";
            //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
        }
        str = str.match(/全部馆藏(.*?)所有单册借阅状态/g)
        //alert(typeof str[0]);
        var txt = str[0];
        txt = txt.match(/http:.*?sub_library=/)[0];
        //alert(txt);
    // alert(eBook);
                //alert(typeof where);
            GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,
            url : txt,
            //url : fullurl,//"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=7101003044",
            onload : function (reDetails) {
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("SYSU");
                msg.state="error";
                msg.errorMsg="无法获取馆藏列表";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
                var libra =document.createElement("div");
                libra.innerHTML = reDetails.responseText;
                isbnFilter.SYSU.getBookinfo(libra.innerHTML,eBook,frameLocation,txt);//回调函数馆藏位置获取
            }
        });

//////////////////////////////////////////////

      },
/////////////////回调函数馆藏位置获取////////////////////////////////////////
    getBookinfo:function(webText,eBook,frameLocation,url){
    var hasBook = true;
    webText = webText.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"");
    //alert(webText);

    ///防止无书籍的情况发生
    if(webText.indexOf('无匹配单册')!=-1){
        var msg = new LibMeta("SYSU");
        msg.state="recommend";
        messageCatcher(msg,frameLocation);
        return null;
    }
    else{
    blockBook = webText.match(/OPAC注释(.*?)<\/tbody>/)[1];
    //alert(typeof blockBook);
    borrowItem = blockBook.match(/<tr>.*?<\/tr>/g);
    //alert(borrowItem[0]);
    var loan = new Array();

      for(k=0;k<borrowItem.length;k++){
      loan[k] = borrowItem[k].match(/<!--Loan.*?td1">(.*?)<\/td>.*?date.*?td1">(.*?)<\/td>.*?hour.*?td1>(.*?)<\/td>.*?Sub.*?nowrap="">(.*?)<\/td>.*?Collection.*?nowrap="">(.*?)<\/td>.*?td1">(.*?)<\/td>/);
    /////借书类型/时间/到期/分馆/馆藏地/索书号
      }
    }
    /////////////////

      if(hasBook){
        //alert("hasBook");
        var storeList = new LibMeta("SYSU");
        storeList.state="store";
        storeList.items= new Array();


        for(s=0;s<borrowItem.length;s++){
           //allBook += bookStatus;
           storeList.items[s]=new StoreItem("SYSU");
           storeList.items[s].storeState=loan[s][1];
           storeList.items[s].returnTime=loan[s][2].replace(/<br>/,"");
           storeList.items[s].branch=loan[s][4];
           storeList.items[s].link=url;
           storeList.items[s].location=loan[s][5];
           storeList.items[s].bookIndex=loan[s][6];
           if(storeList.items[s].storeState.indexOf('外借')!=-1&&storeList.items[s].returnTime.indexOf("在架上")!=-1&&storeList.items[s].storeState.indexOf('闭架')==-1){
                storeList.items[s].rentable=true;
           }

           //alert(allBook);      
        }
        //alert(storeList.items.length);
        if(eBook){
          //get_eBook(eBook);
          var itemsLength=storeList.items.length;
          storeList.items[itemsLength]=new StoreItem("SYSU");         
          storeList.items[itemsLength].link=eBook;
          storeList.items[itemsLength].type="eBook";
          storeList.items[itemsLength].storeState="电子书";
        };
      } 
      //alert(storeList.items.length);
      //return messageCatcher(storeList);
      //alert(storeList.school+" zsdx");
      messageCatcher(storeList,frameLocation);
      return null;
      
        //allBook += '</div>' 
        //$('.aside').prepend(allBook);
    //////////////////////完成框架插入//////////////
          }
    },
    //华南理工大学
    SCUT:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("SCUT");
          msg.state="error";
          msg.errorMsg="ISBN连接错误";
                //alert("ISBN连接错误");//后续版本再处理
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('无符合')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("SCUT");
            msg.state="recommend";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          isbnFilter.SCUT.filter(reDetails.responseText,frameLocation);

      },
      filter:function(text,frameLocation){
        //http://202.38.232.10/opac/servlet/opac.go?SORTFIELD=CALLNO&SORTORDER=asc&bookid=413213&cmdACT=query.bookdetail&libcode=
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"");
        rowText = text.match(/javascript:book_detail.*?<\/tr>/g);
        //alert(rowText);

        var bookBlock = new Array();
        var bookDetail = new Array();
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/\((\d+\.?\d*)\)">(.*?)<\/a>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();

        }

        var list = new LibMeta("SCUT");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("SCUT");
           list.items[s].link ="http://202.38.232.10/opac/servlet/opac.go?SORTFIELD=CALLNO&SORTORDER=asc&bookid="+bookBlock[s][0]+"&cmdACT=query.bookdetail&libcode=";
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][2];
           list.items[s].publisher = bookBlock[s][3];
           list.items[s].bookIndex = bookBlock[s][6];
           list.items[s].pubDate = bookBlock[s][5];
        }

        //进一步获取馆藏
        GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,
            url : list.items[0].link,
            //url : fullurl,//"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=7101003044",
            onload : function (reDetails) {
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("SCUT");
                msg.state="error";
                msg.errorMsg="无法获取馆藏列表";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
                //var libra =document.createElement("div");
                //document.getElementById("reviews").textContent=reDetails.responseText;
                getStoreFilter(reDetails.responseText,frameLocation,list.items[0].link);//回调函数馆藏位置获取
            }
        });



        function  getStoreFilter(text,frameLocation,finalUrl){
          text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"");
          text=text.match(/id="queryholding".*?<\/table>/);
          var row;
          row=text[0].match(/<tr>.*?<\/tr>/g);
          //alert(row.length);
          row.shift();
          //alert(row[0]);

          var storeBlock = new Array();
          for(s=0;s<row.length;s++){
          storeBlock[s] = row[s].match(/"8%">(.*?)<\/td>.*?F">(.*?)<\/td.*?8%">(.*?)<\/td>.*?4%">(.*?)<\/td>.*?8%">(.*?)<\/td>.*?8%">(.*?)<\/td>.*?0%">(.*?)<\/td>/);
          //alert(bookBlock[s].length);
          storeBlock[s].shift();


        }

          var storeList = new LibMeta("SCUT");
          storeList.state="store";
          storeList.items= new Array();

          for(s=0;s<storeBlock.length;s++){
            storeList.items[s]=new StoreItem("SCUT");
            storeList.items[s].storeState=storeBlock[s][5].replace(/ /g,"");
            storeList.items[s].returnTime=storeBlock[s][6];
            storeList.items[s].branch=storeBlock[s][0];
            storeList.items[s].location = storeBlock[s][1];
            storeList.items[s].bookIndex = storeBlock[s][2];
            storeList.items[s].link = finalUrl;
            if(storeList.items[s].storeState.indexOf('在馆')!=-1&&storeList.items[s].branch.indexOf('停')==-1){
                storeList.items[s].rentable=true;
            }
          }
           messageCatcher(storeList,frameLocation);
           return;

        }

      }
    },

    //南中国一般大学
    SCNU:{      
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("SCNU");
          msg.state="error";
          msg.errorMsg="ISBN连接错误";
                //alert("ISBN连接错误");//后续版本再处理
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('没有')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("SCNU");
            msg.state="recommend";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          isbnFilter.SCNU.filter(reDetails.responseText,frameLocation);

      },

      filter:function(text,frameLocation){
        //http://202.38.232.10/opac/servlet/opac.go?SORTFIELD=CALLNO&SORTORDER=asc&bookid=413213&cmdACT=query.bookdetail&libcode=
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/ /g,"").replace(/\r/g,"");
        rowText = text.match(/book_list_info.*?<img/);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText;        

        var bookBlock = new Array();
        var bookDetail = new Array();
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/marc_no=(\d+\.?\d*)">(.*?)<\/a>(.*?)<\/h3>.*?span>(.*?)<br>(.*?)<\/span>(.*?)<br\/>(.*?)<br\/>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();
        }



        var list = new LibMeta("SCNU");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("SCNU");
           list.items[s].link ="http://202.116.41.246:8080/opac/item.php?marc_no="+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][5];
           list.items[s].publisher = bookBlock[s][6];
           list.items[s].bookIndex = bookBlock[s][2];
           //alert(list.items[s].bookName);
        }
        //messageCatcher(list,frameLocation);

        //进一步获取馆藏
        GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,
            url : list.items[0].link,
            //url : fullurl,//"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=7101003044",
            onload : function (reDetails) {
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("SCNU");
                msg.state="error";
                msg.errorMsg="无法获取馆藏列表";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
                //var libra =document.createElement("div");
                //document.getElementById("reviews").textContent=reDetails.responseText;
                getStoreFilter(reDetails.responseText,frameLocation,list.items[0].link);//回调函数馆藏位置获取
            }
        });



        function  getStoreFilter(text,frameLocation,finalUrl){
          text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
          var row;
          row=text.match(/whitetext.*?left/g);
          //alert(row.length);
          //row.shift();
          //alert(row[0]);

          var storeBlock = new Array();
          for(s=0;s<row.length;s++){
            //alert(row[s].replace(/[ | ]*/g,''));
            storeBlock[s] = row[s].match(/"10%">(.*?)<\/td>.*?title="(.*?)">.*?20%">(.*?)<\/td>/);
            //alert(storeBlock[s].length);
            storeBlock[s].shift();
        }

          var storeList = new LibMeta("SCNU");
          storeList.state="store";
          storeList.items= new Array();

          for(s=0;s<storeBlock.length;s++){
            storeList.items[s]=new StoreItem("SCNU");
            storeList.items[s].storeState=storeBlock[s][2].replace(/ /g,"");
            //storeList.items[s].returnTime=storeBlock[s][2];
            storeList.items[s].branch=storeBlock[s][1];
            //storeList.items[s].location = storeBlock[s][1];
            storeList.items[s].bookIndex = storeBlock[s][0];
            storeList.items[s].link = finalUrl;
            if(storeList.items[s].storeState.indexOf('可借')!=-1){
                storeList.items[s].rentable=true;
            }
          }
           messageCatcher(storeList,frameLocation);
           return;

        }

      }
    },

    //广东工业大学
    GDUT:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("GDUT");
          msg.state="error";
          msg.errorMsg="ISBN连接错误";
                //alert("ISBN连接错误");
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('没有')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("GDUT");
            msg.state="recommend";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          isbnFilter.GDUT.filter(reDetails.responseText,frameLocation);

      },
      filter:function(text,frameLocation){
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
        rowText = text.match(/class="tb".*?<\/table>/);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText;        

        var bookBlock = new Array();

        bookBlock[0]=rowText[0].match(/(bookinfo.aspx\?ctrlno=\d+\.?\d*)".*?blank">(.*?)<\/a>.*?<td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td>/);
        //alert(bookBlock[0].length);

        bookBlock[0].shift();
        var list = new LibMeta("GDUT");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("GDUT");
           list.items[s].link ="http://222.200.98.171:81/"+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][2];
           list.items[s].publisher = bookBlock[s][3];
           list.items[s].pubDate = bookBlock[s][4];
       }
           //list.items[s].bookIndex = bookBlock[s][2];
           //alert(list.items[s].link);


                //进一步获取馆藏
        GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,
            url : list.items[0].link,
            //url : fullurl,//"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=7101003044",
            onload : function (reDetails) {
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("GDUT");
                msg.state="error";
                msg.errorMsg="无法获取馆藏列表";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
                //var libra =document.createElement("div");
                //document.getElementById("reviews").textContent=reDetails.responseText;
                getStoreFilter(reDetails.responseText,frameLocation,list.items[0].link);//回调函数馆藏位置获取
            }
        });

        function  getStoreFilter(text,frameLocation,finalUrl){
          text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
          var row;
          row=text.match(/<tbody>.*?<\/tbody>/);
          row[0].replace(/ /g,"");
          //alert(row[0]);
          row = row[0].match(/<tr>.*?<\/tr>/g);
 
          //alert(row.length);
          //row.shift();
          //alert(row[0]);

          var storeBlock = new Array();
          for(s=0;s<row.length;s++){
            //alert(row[s].replace(/[ | ]*/g,''));
            //alert(row[s]);
            storeBlock[s] = row[s].match(/showLibInfo.*?'>(.*?)<\/a><\/td><td>(.*?)<\/td><td>(.*?)<\/td>.*?tbr.*?<td>.*?<td>(.*?)<\/td>/);
            //alert(storeBlock[s].length);
            storeBlock[s].shift();
        }

          var storeList = new LibMeta("GDUT");
          storeList.state="store";
          storeList.items= new Array();

          for(s=0;s<storeBlock.length;s++){
            storeList.items[s]=new StoreItem("GDUT");
            storeList.items[s].storeState=storeBlock[s][3];
            //storeList.items[s].returnTime=storeBlock[s][2];
            storeList.items[s].branch=storeBlock[s][0];
            //storeList.items[s].location = storeBlock[s][1];
            storeList.items[s].bookIndex = storeBlock[s][1];
            storeList.items[s].link = finalUrl;
            if(storeList.items[s].storeState.indexOf('可供出借')!=-1){
                storeList.items[s].rentable=true;
            }
          }
           messageCatcher(storeList,frameLocation);
           return;

        }

      }
    },

    //外语外贸大学
    GDUFS:{
        respond:function (reDetails,frameLocation,fullUrl) {
              //var fullUrl = reDetails.finalUrl;
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("GDUFS");
                msg.state="error";
                msg.errorMsg="ISBN连接错误";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
              //document.getElementById("footer").textContent=reDetails.responseText;
              if(reDetails.responseText.indexOf('indexpage')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
                  var msg = new LibMeta("GDUFS");
                  msg.state="recommend";
                  //hasBook = false;
                  //recommendBook();
                  messageCatcher(msg,frameLocation);
                  return;
              }

                //document.getElementById("footer").textContent=reDetails.responseText;
                //var frame =document.createElement("div");
                //frame.innerHTML = reDetails.responseText;
                //alert(frame.innerHTML);
                if(reDetails.responseText.indexOf('Search Results')!=-1){
                    //alert("跳转到搜索页");
                    //var frame =document.createElement("div");
                //frame.innerHTML = reDetails.responseText;
                //document.getElementById("reviews").textContent=frame.innerHTML;          
                
                    titleFilter.GDUFS.filter(reDetails.responseText,fullUrl,frameLocation);
                    
                }
                else{
                  isbnFilter.GDUFS.filter(reDetails.responseText,frameLocation);

                }
                
                return;
        },


        filter:function(gettxt,frameLocation){
            //alert(typeof where);
        /////////////////////////////////////////////////////////

        str = gettxt;
        str = str.replace(/[ | ]*\n/g,''); //去除行尾空白
        str = str.replace(/\n[\s| | ]*\r/g,''); //去除多余空行
        str = str.replace(/amp;/g,""); //去除URL转码
        //alert(str);


        ///获取一整块
        var eBook;
        eBook = null;
        if(str.match(/电子资源定位/)){
        //document.getElementById("footer").textContent=str;
        eBook = str.match(/电子资源定位.*?jpg.*?File Extension: url">(.*?)<\/a>/)[1];
        }
        if(!eBook&&str.indexOf("索书")==-1){
            var msg = new LibMeta("GDUFS");
            msg.state="recommend";
            //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
        }
        str = str.match(/全部馆藏(.*?)所有单册/g)
        //alert(typeof str[0]);
        var txt = str[0];
        txt = txt.match(/http:.*?sub_library=/);
        where=txt;
        //alert(txt);
    // alert(eBook);
            GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,
            url : where[0],
            //url : fullurl,//"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=7101003044",
            onload : function (reDetails) {
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("GDUFS");
                msg.state="error";
                msg.errorMsg="无法获取馆藏列表";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
                var libra =document.createElement("div");
                libra.innerHTML = reDetails.responseText;
                isbnFilter.GDUFS.getBookinfo(libra.innerHTML,eBook,frameLocation,where[0]);//回调函数馆藏位置获取
            }
        });
        //alert(txt);
        


//////////////////////////////////////////////


 
      },
      /////////////////回调函数馆藏位置获取////////////////////////////////////////
    getBookinfo:function(webText,eBook,frameLocation,finalUrl){
    var hasBook = true;
    webText = webText.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"");
    //alert(webText);

    ///防止无书籍的情况发生
    if(webText.indexOf('无匹配单册')!=-1){
        var msg = new LibMeta("GDUFS");
        msg.state="recommend";
        messageCatcher(msg,frameLocation);
    }
    else{
    blockBook = webText.match(/OPAC注释(.*?)<\/tbody>/)[1];
    //alert(typeof blockBook);
    borrowItem = blockBook.match(/<tr>.*?<\/tr>/g);
    //alert(borrowItem[0]);
    var loan = new Array();

      for(k=0;k<borrowItem.length;k++){
      loan[k] = borrowItem[k].match(/<!--Loan.*?td1">(.*?)<\/td>.*?date.*?td1">(.*?)<\/td>.*?hour.*?td1>(.*?)<\/td>.*?Sub.*?nowrap="">(.*?)<\/td>.*?Location.*?td1">(.*?)<\/td>/);
    /////借书类型/时间/到期/位置/索书号
      }
    }
    /////////////////


      if(hasBook){
        //alert("hasBook");
        var storeList = new LibMeta("GDUFS");
        storeList.state="store";
        storeList.items= new Array();


        for(s=0;s<borrowItem.length;s++){
            
           //bookStatus =   '<ul class="ft pl more-after"> ' +
           //               '<li style="border: none">单册状态:' + loan[s][1]+
           //               '<span style="position:relative; left:20px;">应还日期: ' + loan[s][2].replace(/<br>/,"") +'</span></li>' + 
                          //'<li style="border: none">到期: ' + loan[s][3] + '</li>' +
           //               '<li style="border: none">分馆: ' + loan[s][4] + '</li>' +
            //              '</ul>';
                          
                         
           //allBook += bookStatus;
           storeList.items[s]=new StoreItem("GDUFS");
           storeList.items[s].storeState=loan[s][1];
           storeList.items[s].returnTime=loan[s][2].replace(/<br>/,"");
           storeList.items[s].branch=loan[s][4];
           storeList.items[s].bookIndex=loan[s][5];
           storeList.items[s].link=finalUrl;
           if(storeList.items[s].storeState.indexOf('外借')!=-1&&storeList.items[s].returnTime.indexOf('在架上')!=-1&&storeList.items[s].storeState.indexOf('闭架')==-1){//闭架无法预约
                storeList.items[s].rentable=true;
           }

           //alert(allBook);      
        }
        //alert(storeList.items.length);
        if(eBook){
          //get_eBook(eBook);
          var itemsLength=storeList.items.length;
          storeList.items[itemsLength]=new StoreItem("GDUFS");         
          storeList.items[itemsLength].link=eBook;
          storeList.items[itemsLength].type="eBook";
          storeList.items[itemsLength].storeState="电子书";
        };
      } 
      //alert(storeList.items.length);
      //return messageCatcher(storeList);
      //alert(storeList.school+" gw");
      messageCatcher(storeList,frameLocation);
      
        //allBook += '</div>' 
        //$('.aside').prepend(allBook);
    //////////////////////完成框架插入//////////////
          }
    },

    //广州中医药大学
    GZHTCM:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("GZHTCM");
          msg.state="error";
          msg.errorMsg="ISBN连接错误";
                //alert("ISBN连接错误");//后续版本再处理
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('没有')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("GZHTCM");
            msg.state="recommend";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          isbnFilter.GZHTCM.filter(reDetails.responseText,frameLocation);

      },

      filter:function(text,frameLocation){
        //http://202.38.232.10/opac/servlet/opac.go?SORTFIELD=CALLNO&SORTORDER=asc&bookid=413213&cmdACT=query.bookdetail&libcode=
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/ /g,"").replace(/\r/g,"");
        rowText = text.match(/book_list_info.*?<img/);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText;        

        var bookBlock = new Array();
        var bookDetail = new Array();
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/marc_no=(\d+\.?\d*)">(.*?)<\/a>(.*?)<\/h3>.*?span>(.*?)<br>(.*?)<\/span>(.*?)<br\/>(.*?)<br\/>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();
        }



        var list = new LibMeta("GZHTCM");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("GZHTCM");
           list.items[s].link ="http://210.38.102.131:86/opac/item.php?marc_no="+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][5];
           list.items[s].publisher = bookBlock[s][6];
           list.items[s].bookIndex = bookBlock[s][2];
           //alert(list.items[s].bookName);
        }
        //messageCatcher(list,frameLocation);

        //进一步获取馆藏
        GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,
            url : list.items[0].link,
            //url : fullurl,//"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=7101003044",
            onload : function (reDetails) {
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("GZHTCM");
                msg.state="error";
                msg.errorMsg="无法获取馆藏列表";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
                //var libra =document.createElement("div");
                //document.getElementById("reviews").textContent=reDetails.responseText;
                getStoreFilter(reDetails.responseText,frameLocation,list.items[0].link);//回调函数馆藏位置获取
            }
        });



        function  getStoreFilter(text,frameLocation,finalUrl){
          text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
          var row;
          row=text.match(/whitetext.*?left/g);
          //alert(row.length);
          //row.shift();
          //alert(row[0]);

          var storeBlock = new Array();
          for(s=0;s<row.length;s++){
            //alert(row[s].replace(/[ | ]*/g,''));
            //alert(row[s]);
            storeBlock[s] = row[s].match(/"10%">(.*?)<\/td>.*?gif"\/>(.*?)<\/td>.*?20%">(.*?)<\/td>/);
            //alert(storeBlock[s].length);
            storeBlock[s].shift();
        }

          var storeList = new LibMeta("GZHTCM");
          storeList.state="store";
          storeList.items= new Array();

          for(s=0;s<storeBlock.length;s++){
            storeList.items[s]=new StoreItem("GZHTCM");
            storeList.items[s].storeState=storeBlock[s][2].replace(/ /g,"");
            //storeList.items[s].returnTime=storeBlock[s][2];
            storeList.items[s].branch=storeBlock[s][1];
            //storeList.items[s].location = storeBlock[s][1];
            storeList.items[s].bookIndex = storeBlock[s][0];
            storeList.items[s].link = finalUrl;
            if(storeList.items[s].storeState.indexOf('可借')!=-1){
                storeList.items[s].rentable=true;
            }
          }
           messageCatcher(storeList,frameLocation);
           return;

        }

      }

    },

    //广州大学
    GZHU:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("GZHU");
          msg.state="error";
          msg.errorMsg="ISBN连接错误";
                //alert("ISBN连接错误");//后续版本再处理
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('找不到')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("GZHU");
            msg.state="recommend";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          isbnFilter.GZHU.filter(reDetails.responseText,frameLocation);

      },
      filter:function(text,frameLocation){
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/ /g,"").replace(/\r/g,"");
        rowText = text.match(/book_info>.*?<\/div>/g);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText[0];  

        var bookBlock = new Array();
        var bookDetail = new Array();
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/href="(.*?)"target="_blank">(.*?)<\/a><span>(.*?)<\/span>.*?<h4>(.*?)&nbsp;/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();
        }

        var list = new LibMeta("GZHU");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("GZHU");
           list.items[s].link ="http://lib.gzhu.edu.cn:8080"+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][2];
           list.items[s].publisher = bookBlock[s][3];

           //list.items[s].bookIndex = bookBlock[s][2];
           //alert(list.items[s].bookName);
        }
        //messageCatcher(list,frameLocation);

        //进一步获取馆藏
        GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,
            url : list.items[0].link,
            //url : fullurl,//"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=7101003044",
            onload : function (reDetails) {
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("GZHU");
                msg.state="error";
                msg.errorMsg="无法获取馆藏列表";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
                //var libra =document.createElement("div");
                //document.getElementById("reviews").textContent=reDetails.responseText;
                getStoreFilter(reDetails.responseText,frameLocation,list.items[0].link);//回调函数馆藏位置获取
            }
        });

        function  getStoreFilter(text,frameLocation,finalUrl){
          text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
          var row;
          var bookIndex = text.match(/索书号.*?<td>(.*?)<\/td>/)[1];
          
          text=text.match(/holdings_info_content.*?clear/);
          //alert(row.length);
          //row.shift();
          row = text[0].match(/<td>.*?<\/tr>/g);
          //alert(row.length);


          var storeBlock= new Array();
          for(s=0;s<row.length;s++){
            //row[s].shift();

            storeBlock[s] = row[s].match(/<td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<a.*?<\/tr>/);
            //alert(storeBlock[s].length);
            storeBlock[s].shift();
        }

          var storeList = new LibMeta("GZHU");
          storeList.state="store";
          storeList.items= new Array();

          for(s=0;s<storeBlock.length;s++){
            storeList.items[s]=new StoreItem("GZHU");
            storeList.items[s].storeState=storeBlock[s][1];
            storeList.items[s].returnTime=storeBlock[s][3];
            storeList.items[s].branch=storeBlock[s][4];
            storeList.items[s].link=finalUrl;
            storeList.items[s].bookIndex=bookIndex;
            if(storeList.items[s].storeState.indexOf('在馆')!=-1){
                storeList.items[s].rentable=true;
            }
            //storeList.items[s].location = storeBlock[s][1];
            //storeList.items[s].bookIndex = storeBlock[s][0];
          }
           messageCatcher(storeList,frameLocation);
           return;

        }



      }
    },

    //广州美术学院
    GZARTS:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("GZARTS");
          msg.state="error";
          msg.errorMsg="ISBN连接错误";
                //alert("ISBN连接错误");
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('没有')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("GZARTS");
            msg.state="recommend";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          isbnFilter.GZARTS.filter(reDetails.responseText,frameLocation);

      },
      filter:function(text,frameLocation){
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
        rowText = text.match(/class="tb".*?<\/table>/);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText;        

        var bookBlock = new Array();
        //var bookDetail = new Array();
        /*
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/marc_no=(\d+\.?\d*)">(.*?)<\/a>(.*?)<\/h3>.*?span>(.*?)<br>(.*?)<\/span>(.*?)<br\/>(.*?)<br\/>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();
        }
        */
        bookBlock[0]=rowText[0].match(/(bookinfo.aspx\?ctrlno=\d+\.?\d*)".*?blank">(.*?)<\/a>.*?<td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td>/);
        //alert(bookBlock[0].length);

        bookBlock[0].shift();
        var list = new LibMeta("GZARTS");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("GZARTS");
           list.items[s].link ="http://121.33.246.167/opac/"+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][2];
           list.items[s].publisher = bookBlock[s][3];
           list.items[s].pubDate = bookBlock[s][4];
       }
           //list.items[s].bookIndex = bookBlock[s][2];
           //alert(list.items[s].link);


                //进一步获取馆藏
        GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,
            url : list.items[0].link,
            //url : fullurl,//"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=7101003044",
            onload : function (reDetails) {
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("GZARTS");
                msg.state="error";
                msg.errorMsg="无法获取馆藏列表";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
                //var libra =document.createElement("div");
                //document.getElementById("reviews").textContent=reDetails.responseText;
                getStoreFilter(reDetails.responseText,frameLocation,list.items[0].link);//回调函数馆藏位置获取
            }
        });

        function  getStoreFilter(text,frameLocation,finalUrl){
          text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
          //document.getElementById("reviews").textContent=text;
          var row;
          row=text.match(/<tbody>.*?<\/tbody>/);
          row[0].replace(/ /g,"");
          //alert(row[0]);
          row = row[0].match(/<tr>.*?<\/tr>/g);
 
          //alert(row.length);
          //row.shift();
          //alert(row[0]);

          var storeBlock = new Array();
          for(s=0;s<row.length;s++){
            //alert(row[s].replace(/[ | ]*/g,''));
            //alert(row[s]);
            storeBlock[s] = row[s].match(/showLibInfo.*?'>(.*?)<\/a><\/td><td>(.*?)<\/td><td>(.*?)<\/td>.*?tbr.*?<td>.*?<td>(.*?)<\/td>/);
            //alert(storeBlock[s].length);
            storeBlock[s].shift();
        }
          var storeList = new LibMeta("GZARTS");
          storeList.state="store";
          storeList.items= new Array();

          for(s=0;s<storeBlock.length;s++){
            storeList.items[s]=new StoreItem("GZARTS");
            storeList.items[s].storeState=storeBlock[s][3];
            //storeList.items[s].returnTime=storeBlock[s][2];
            storeList.items[s].branch=storeBlock[s][0];
            //storeList.items[s].location = storeBlock[s][1];
            storeList.items[s].bookIndex = storeBlock[s][1];
            storeList.items[s].link=finalUrl;
            if(storeList.items[s].storeState.indexOf('可供出借')!=-1){
                storeList.items[s].rentable=true;
            }
          }
           messageCatcher(storeList,frameLocation);
           return;
        }

      }
    },


    //星海音乐学院
    XHCOM:{      
        respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("XHCOM");
          msg.state="error";
          msg.errorMsg="ISBN连接错误";
                //alert("ISBN连接错误");
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('没有')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("XHCOM");
            msg.state="recommend";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          isbnFilter.XHCOM.filter(reDetails.responseText,frameLocation);

      },
      filter:function(text,frameLocation){
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
        rowText = text.match(/class="tb".*?<\/table>/);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText;        

        var bookBlock = new Array();
        //var bookDetail = new Array();
        /*
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/marc_no=(\d+\.?\d*)">(.*?)<\/a>(.*?)<\/h3>.*?span>(.*?)<br>(.*?)<\/span>(.*?)<br\/>(.*?)<br\/>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();
        }
        */
        bookBlock[0]=rowText[0].match(/(bookinfo.aspx\?ctrlno=\d+\.?\d*)".*?blank">(.*?)<\/a>.*?<td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td>/);
        //alert(bookBlock[0].length);

        bookBlock[0].shift();
        var list = new LibMeta("XHCOM");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("XHCOM");
           list.items[s].link ="http://218.192.148.33:81/"+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][2];
           list.items[s].publisher = bookBlock[s][3];
           list.items[s].pubDate = bookBlock[s][4];
       }
           //list.items[s].bookIndex = bookBlock[s][2];
           //alert(list.items[s].link);


                //进一步获取馆藏
        GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,
            url : list.items[0].link,
            //url : fullurl,//"http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=7101003044",
            onload : function (reDetails) {
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("XHCOM");
                msg.state="error";
                msg.errorMsg="无法获取馆藏列表";
                //alert("ISBN连接错误");//后续版本再处理
                messageCatcher(msg,frameLocation);
                return;
              }
                //var libra =document.createElement("div");
                //document.getElementById("reviews").textContent=reDetails.responseText;
                getStoreFilter(reDetails.responseText,frameLocation,list.items[0].link);//回调函数馆藏位置获取
            }
        });

        function  getStoreFilter(text,frameLocation,finalUrl){
          text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
          //document.getElementById("reviews").textContent=text;
          var row;
          row=text.match(/<tbody>.*?<\/tbody>/);
          row[0].replace(/ /g,"");
          //alert(row[0]);
          row = row[0].match(/<tr>.*?<\/tr>/g);
 
          //alert(row.length);
          //row.shift();
          //alert(row[0]);

          var storeBlock = new Array();
          for(s=0;s<row.length;s++){
            //alert(row[s].replace(/[ | ]*/g,''));
            //alert(row[s]);
            storeBlock[s] = row[s].match(/showLibInfo.*?'>(.*?)<\/a><\/td><td>(.*?)<\/td><td>(.*?)<\/td>.*?tbr.*?<td>.*?<td>(.*?)<\/td>/);
            //alert(storeBlock[s].length);
            storeBlock[s].shift();
        }
          var storeList = new LibMeta("XHCOM");
          storeList.state="store";
          storeList.items= new Array();

          for(s=0;s<storeBlock.length;s++){
            storeList.items[s]=new StoreItem("XHCOM");
            storeList.items[s].storeState=storeBlock[s][3];
            //storeList.items[s].returnTime=storeBlock[s][2];
            storeList.items[s].branch=storeBlock[s][0];
            //storeList.items[s].location = storeBlock[s][1];
            storeList.items[s].bookIndex = storeBlock[s][1];
            storeList.items[s].link=finalUrl;
            if(storeList.items[s].storeState.indexOf('可供出借')!=-1){
                storeList.items[s].rentable=true;
            }
          }
           messageCatcher(storeList,frameLocation);
           return;
        }

      }
  },

    //广东药学院,由于编码问题和没提供ISBN检索，暂不支持//

}

//函数：提取title搜索元信息
var titleFilter={
    //中山大学
    SYSU:{

     respond:function(reDetails,frameLocation,fullUrl) {
              //fullUrl=reDetails.finalUrl;
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("SYSU");

                msg.state = "error";
                msg.errorMsg = "搜索连接错误";
                messageCatcher(msg,frameLocation);
                ///error_log = "搜索连接错误";
                ///error_output(error_log,fullurl);
                ///alert("全字段搜索连接错误");
                return;
              }

              /*if(reDetails.responseText.indexOf('indexpage')!=-1){
                  var msg = new LibMeta();
                  msg.state = "error";
                  msg.errorMsg = "全字段查无此书";
                  ///hasBook = false;
                  ///error_output(error_log,fullurl);
                  messageCatcher(msg,frameLocation);
                  return;
              }*/
                //var frame =document.createElement("div");
                //frame.innerHTML = reDetails.responseText;
                if(reDetails.responseText.indexOf('Search Results')!=-1){
                    //alert("跳转到搜索页");
                    //titleFilter.SYSU.filter(frame.innerHTML,fullurl);
                    titleFilter.SYSU.filter(reDetails.responseText,fullUrl,frameLocation);
                    return;
                }
                else if(reDetails.responseText.indexOf('记录数')!=-1||reDetails.responseText.indexOf('轮排')!=-1){
                    var msg = new LibMeta("SYSU");
                    msg.state = "error";
                    msg.errorMsg = "搜索页面跳转到了款目/轮排列表页面，<br>此页面无法获取图书详细信息。";
                    ///error_log = "搜索页面跳转到了记录数页面，此页面无法获取图书详细信息。";
                    ///error_output(error_log,fullurl);
                    messageCatcher(msg,frameLocation);
                    return;
                }
                else{

                    //error_log = "搜索页面跳转到馆藏,<br>如果ISBN查询无结果，说明其跳转到了错误的图书。";
                    //error_output(error_log,fullurl);
                    
                     isbnFilter.SYSU.filter(reDetails.responseText,frameLocation);
                     return;
                    //showisbn(frame.innerHTML,fullurl);
                  //return;
                  //alert("全字段跳转ISBN馆藏");//BUG处理,以后再说,基本检索
                  //
                }
      },

      filter:function (txt,urltext,frameLocation){

    str = txt;
    str = str.replace(/[ | ]*\n/g,''); //去除行尾空白
    str = str.replace(/\n[\s| | ]*\r/g,''); //去除多余空行
    str = str.replace(/amp;/g,""); //去除URL转码
    //alert(str);
    //if(urltext.indexOf("ISB")){alert(str)};
    atxt= str.match(/col2>.*?<\/table>/g);
    //alert(atxt.length);
    //if(urltext.indexOf("ISB")){alert(atxt.length)};
    ///////获取图书馆书本元信息//////
    var bookDetail = new Array();//元信息数组
    atxt.shift();//去除整块信息中的多余信息

    for(s=0;s<atxt.length;s++){

          bookDetail[s] = atxt[s].match(/a href=(.*?)>(.*?)<\/a>.*?top>(.*?)<td.*?top>(.*?)<tr>.*?top>(.*?)<td.*?top>(.*?)<tr>/).slice(1);
          // 超链接/ 书名 /作者 / 索引号/出版社 /年份 /
    }

      ////////框架//////////////////////////////////

        //hasBook = true;

      //if(hasBook){

       //判断URL类型
       if(urltext.indexOf('ISB')!=-1){
        var allBook = '<div class="gray_ad" id="sysulib"><h2>中大ISBN检索</h2>' +
                       '<a href="'+ urltext +'" target="_blank">前往图书馆查看这本书</a>'; 
       }
       else{
        var allBook = '<div class="gray_ad" id="sysulib"><h2>中大图书馆检索</h2>' +
                       '<a href="'+ urltext +'" target="_blank">前往图书馆查看这本书</a>';         
       }
       //alert(allBook);
        var display;
        var list = new LibMeta("SYSU");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<bookDetail.length;s++){
            if(s>4){
              display=" ;display : none";
            }
            else{
              display="";
            }

                                                 
           //allBook += bookStatus;
           list.items[s] = new LibItem("SYSU");
           list.items[s].link = bookDetail[s][0];
           list.items[s].bookName = bookDetail[s][1];
           list.items[s].author = bookDetail[s][2];
           list.items[s].publisher = bookDetail[s][4];
           list.items[s].pubDate = bookDetail[s][5];

           //alert(list.items[s].bookName);
        }
        //alert(allBook);
        //allBook += '</div>' 
        messageCatcher(list,frameLocation);
        //判断URL
  
      ///////////////判断URL

      //} 
      ////////////插入框架结束//////////////
    }

    },
    //华南理工大学
    SCUT:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("SCUT");
          msg.state="error";
          msg.errorMsg="全字段连接错误";
                //alert("ISBN连接错误");//后续版本再处理
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('无符合')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("SCUT");
            msg.state="error";
          msg.errorMsg="全字段查无此书";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          titleFilter.SCUT.filter(reDetails.responseText,frameLocation);

      },
      filter:function(text,frameLocation){
        //http://202.38.232.10/opac/servlet/opac.go?SORTFIELD=CALLNO&SORTORDER=asc&bookid=413213&cmdACT=query.bookdetail&libcode=
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"");
        rowText = text.match(/javascript:book_detail.*?<\/tr>/g);
        //alert(rowText);

        var bookBlock = new Array();
        var bookDetail = new Array();
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/\((\d+\.?\d*)\)">(.*?)<\/a>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>.*?F">(.*?)<\/TD>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();

        }

        var list = new LibMeta("SCUT");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("SCUT");
           list.items[s].link ="http://202.38.232.10/opac/servlet/opac.go?SORTFIELD=CALLNO&SORTORDER=asc&bookid="+bookBlock[s][0]+"&cmdACT=query.bookdetail&libcode=";
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][2];
           list.items[s].publisher = bookBlock[s][3];
           list.items[s].bookIndex = bookBlock[s][6];
           list.items[s].pubDate = bookBlock[s][5];
        }

        messageCatcher(list,frameLocation);
        return;

      }
    },

    //南中国一般大学
    SCNU:{
respond: function (reDetails, frameLocation) {
  if (reDetails.status !== 200 && reDetails.status !== 304) {
    var msg = new LibMeta('SCNU');
    msg.state = 'error';
    msg.errorMsg = '全字段检索连接错误';
    //alert("ISBN连接错误");//后续版本再处理
    messageCatcher(msg, frameLocation);
    return;
  }
  //document.getElementById("footer").textContent=reDetails.responseText;

  if (reDetails.responseText.indexOf('没有') != - 1) {
    //alert("ISBN查无此书"); //增加荐购
    var msg = new LibMeta('SCNU');
    msg.state = 'error';
    msg.errorMsg = '全字段查无此书';
    //hasBook = false;
    //recommendBook();
    messageCatcher(msg, frameLocation);
    return;
  }
  //document.getElementById("reviews").textContent=reDetails.responseText;

  titleFilter.SCNU.filter(reDetails.responseText, frameLocation);
},
filter: function (text, frameLocation) {
  //http://202.38.232.10/opac/servlet/opac.go?SORTFIELD=CALLNO&SORTORDER=asc&bookid=413213&cmdACT=query.bookdetail&libcode=
  text = text.replace(/[ | ]*\n/g, '').replace(/\n[\s| | ]*\r/g, '').replace(/amp;/g, '').replace(/ /g, '').replace(/\r/g, '');
  rowText = text.match(/book_list_info.*?<img/);
  //alert(rowText.length);
  //document.getElementById("reviews").textContent=rowText;        
  var bookBlock = new Array();
  var bookDetail = new Array();
  for (s = 0; s < rowText.length; s++) {
    bookBlock[s] = rowText[s].match(/marc_no=(\d+\.?\d*)">(.*?)<\/a>(.*?)<\/h3>.*?span>(.*?)<br>(.*?)<\/span>(.*?)<br\/>(.*?)<br\/>/);
    //alert(bookBlock[s].length);
    bookBlock[s].shift();
  }
  var list = new LibMeta('SCNU'); ////构造函数
  list.state = 'booklist';
  list.items = new Array();
  for (s = 0; s < rowText.length; s++) {
    list.items[s] = new LibItem('SCNU');
    list.items[s].link = 'http://202.116.41.246:8080/opac/item.php?marc_no=' + bookBlock[s][0];
    list.items[s].bookName = bookBlock[s][1];
    list.items[s].author = bookBlock[s][5];
    list.items[s].publisher = bookBlock[s][6];
    list.items[s].bookIndex = bookBlock[s][2];
    //alert(list.items[s].bookName);
  }
   messageCatcher(list,frameLocation);
   return;

}

    },

    //广东工业大学
    GDUT:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("GDUT");
          msg.state="error";
          msg.errorMsg="全字段连接错误";
                //alert("ISBN连接错误");
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('没有')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("GDUT");
          msg.state="error";
          msg.errorMsg="全字段查无此书";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          titleFilter.GDUT.filter(reDetails.responseText,frameLocation);

      },
      filter:function(text,frameLocation){
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
        rowText = text.match(/class="tb".*?<\/table>/);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText;        

        var bookBlock = new Array();
        //var bookDetail = new Array();
        /*
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/marc_no=(\d+\.?\d*)">(.*?)<\/a>(.*?)<\/h3>.*?span>(.*?)<br>(.*?)<\/span>(.*?)<br\/>(.*?)<br\/>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();
        }
        */
        bookBlock[0]=rowText[0].match(/(bookinfo.aspx\?ctrlno=\d+\.?\d*)".*?blank">(.*?)<\/a>.*?<td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td>/);
        //alert(bookBlock[0].length);

        bookBlock[0].shift();
        var list = new LibMeta("GDUT");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("GDUT");
           list.items[s].link ="http://222.200.98.171:81/"+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][2];
           list.items[s].publisher = bookBlock[s][3];
           list.items[s].pubDate = bookBlock[s][4];
           //list.items[s].bookIndex = bookBlock[s][2];
        }
        messageCatcher(list,frameLocation);

      }     
    },

    //外语外贸大学
    GDUFS:{
     respond:function(reDetails,frameLocation,fullUrl) {
              //fullurl=reDetails.finalUrl;
              if (reDetails.status !== 200&&reDetails.status !== 304){
                var msg = new LibMeta("GDUFS");

                msg.state = "error";
                msg.errorMsg = "搜索连接错误";
                messageCatcher(msg,frameLocation);
                ///error_log = "搜索连接错误";
                ///error_output(error_log,fullurl);
                ///alert("全字段搜索连接错误");
                return;
              }


                if(reDetails.responseText.indexOf('Search Results')!=-1){
                    //alert("跳转到搜索页");
                    //titleFilter.SYSU.filter(frame.innerHTML,fullurl);
                    titleFilter.GDUFS.filter(reDetails.responseText,fullUrl,frameLocation);
                    return;
                }
                else if(reDetails.responseText.indexOf('记录数')!=-1||reDetails.responseText.indexOf('轮排')!=-1){
                    var msg = new LibMeta("GDUFS");
                    msg.state = "error";
                    msg.errorMsg = "搜索页面跳转到了款目/轮排列表页面，<br>此页面无法获取图书详细信息。";
                    ///error_log = "搜索页面跳转到了记录数页面，此页面无法获取图书详细信息。";
                    ///error_output(error_log,fullurl);
                    messageCatcher(msg,frameLocation);
                    return;
                }
                else{

                    //error_log = "搜索页面跳转到馆藏,<br>如果ISBN查询无结果，说明其跳转到了错误的图书。";
                    //error_output(error_log,fullurl);
                    
                     isbnFilter.GDUFS.filter(reDetails.responseText,frameLocation);
                     return;
                    //showisbn(frame.innerHTML,fullurl);
                  //return;
                  //alert("全字段跳转ISBN馆藏");//BUG处理,以后再说,基本检索
                  //
                }
      },

      filter:function (txt,urltext,frameLocation){

    str = txt;
    str = str.replace(/[ | ]*\n/g,''); //去除行尾空白
    str = str.replace(/\n[\s| | ]*\r/g,''); //去除多余空行
    str = str.replace(/amp;/g,""); //去除URL转码
    //alert(str);
    //if(urltext.indexOf("ISB")){alert(str)};
    atxt= str.match(/col2>.*?<\/table>/g);
    //alert(atxt.length);
    //if(urltext.indexOf("ISB")){alert(atxt.length)};
    ///////获取图书馆书本元信息//////
    var bookDetail = new Array();//元信息数组
    atxt.shift();//去除整块信息中的多余信息

    for(s=0;s<atxt.length;s++){
       // bookDetail[s] = atxt[s].match(/a[ ]href="(.*?)">(.*?)<\/a>.*?"top">(.*?)<\/td>.*?"top">(.*?)<\/td>.*?"top">(.*?)<\/td>.*?"top">(.*?)<\/td>.*?sub_library=(.*?)<\/table>/).slice(1);
        // 超链接/ 书名 /作者 / 索引号/出版社 /年份 /藏书信息(由于有些书无馆藏，暂时不获取)
        //if(!bookDetail[s]){ //如果没有馆藏信息
            //alert(atxt[s]);
          bookDetail[s] = atxt[s].match(/a href=(.*?)>(.*?)<\/a>.*?top>(.*?)<td.*?top>(.*?)<tr>.*?top>(.*?)<td.*?top>(.*?)<tr>/).slice(1);
          // 超链接/ 书名 /作者 / 索引号/出版社 /年份 /
    }

      ////////框架//////////////////////////////////


        var display;
       
        var list = new LibMeta("GDUFS");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<bookDetail.length;s++){
            if(s>4){
              display=" ;display : none";
            }
            else{
              display="";
            }

                                                 
           //allBook += bookStatus;
           list.items[s] = new LibItem("GDUFS");
           list.items[s].link = bookDetail[s][0];
           list.items[s].bookName = bookDetail[s][1];
           list.items[s].author = bookDetail[s][2].replace(/<br>/,"").replace(/<br\/>/,"");
           list.items[s].publisher = bookDetail[s][4];
           list.items[s].pubDate = bookDetail[s][5];

           //alert(list.items[s].bookName);
        }
        //alert(allBook);
        //allBook += '</div>' 
        messageCatcher(list,frameLocation);
        //判断URL
  
      ///////////////判断URL

      //} 
      ////////////插入框架结束//////////////
    }

    },

    //广州中医药大学
    GZHTCM:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("GZHTCM");
          msg.state="error";
          msg.errorMsg="全字段连接错误";
                //alert("ISBN连接错误");//后续版本再处理
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('没有')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("GZHTCM");
          msg.state="error";
          msg.errorMsg="全字段查无此书";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          titleFilter.GZHTCM.filter(reDetails.responseText,frameLocation);

      },

      filter:function(text,frameLocation){
        //http://202.38.232.10/opac/servlet/opac.go?SORTFIELD=CALLNO&SORTORDER=asc&bookid=413213&cmdACT=query.bookdetail&libcode=
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/ /g,"").replace(/\r/g,"");
        rowText = text.match(/book_list_info.*?<img/);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText;        

        var bookBlock = new Array();
        var bookDetail = new Array();
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/marc_no=(\d+\.?\d*)">(.*?)<\/a>(.*?)<\/h3>.*?span>(.*?)<br>(.*?)<\/span>(.*?)<br\/>(.*?)<br\/>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();
        }



        var list = new LibMeta("GZHTCM");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("GZHTCM");
           list.items[s].link ="http://210.38.102.131:86/opac/item.php?marc_no="+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][5];
           list.items[s].publisher = bookBlock[s][6];
           list.items[s].bookIndex = bookBlock[s][2];
           //alert(list.items[s].bookName);
        }
        messageCatcher(list,frameLocation);

      }
    },

    //广州大学
    GZHU:{
respond: function (reDetails, frameLocation) {
  if (reDetails.status !== 200 && reDetails.status !== 304) {
    var msg = new LibMeta('GZHU');
    msg.state = 'error';
    msg.errorMsg = '全字段连接错误';
    //alert("ISBN连接错误");//后续版本再处理
    messageCatcher(msg, frameLocation);
    return;
  }
  //document.getElementById("footer").textContent=reDetails.responseText;

  if (reDetails.responseText.indexOf('找不到') != - 1) {
    //alert("ISBN查无此书"); //增加荐购
    var msg = new LibMeta('GZHU');
    msg.state = 'error';
    msg.errorMsg = '全字段查无此书';
    //hasBook = false;
    //recommendBook();
    messageCatcher(msg, frameLocation);
    return;
  }
  //document.getElementById("reviews").textContent=reDetails.responseText;

  titleFilter.GZHU.filter(reDetails.responseText, frameLocation);
},
filter: function (text, frameLocation) {
  text = text.replace(/[ | ]*\n/g, '').replace(/\n[\s| | ]*\r/g, '').replace(/amp;/g, '').replace(/ /g, '').replace(/\r/g, '');
  rowText = text.match(/book_info>.*?<\/div>/g);
  //alert(rowText.length);
  //document.getElementById("reviews").textContent=rowText[0];  
  var bookBlock = new Array();
  var bookDetail = new Array();
  for (s = 0; s < rowText.length; s++) {
    bookBlock[s] = rowText[s].match(/href="(.*?)"target="_blank">(.*?)<\/a><span>(.*?)<\/span>.*?<h4>(.*?)&nbsp;/);
    //alert(bookBlock[s].length);
    bookBlock[s].shift();
  }
  var list = new LibMeta('GZHU'); ////构造函数
  list.state = 'booklist';
  list.items = new Array();
  for (s = 0; s < rowText.length; s++) {
    list.items[s] = new LibItem('GZHU');
    list.items[s].link = 'http://lib.gzhu.edu.cn:8080' + bookBlock[s][0];
    list.items[s].bookName = bookBlock[s][1];
    list.items[s].author = bookBlock[s][2];
    list.items[s].publisher = bookBlock[s][3];
    //list.items[s].bookIndex = bookBlock[s][2];
    //alert(list.items[s].bookName);
  }
  messageCatcher(list,frameLocation);

    return;
  }

    },

    //广州美术学院
    GZARTS:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("GZARTS");
          msg.state="error";
          msg.errorMsg="全字段连接错误";
                //alert("ISBN连接错误");
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('没有')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("GZARTS");
          msg.state="error";
          msg.errorMsg="全字段查无此书";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          titleFilter.GZARTS.filter(reDetails.responseText,frameLocation);

      },
      filter:function(text,frameLocation){
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
        rowText = text.match(/class="tb".*?<\/table>/);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText;        

        var bookBlock = new Array();
        //var bookDetail = new Array();
        /*
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/marc_no=(\d+\.?\d*)">(.*?)<\/a>(.*?)<\/h3>.*?span>(.*?)<br>(.*?)<\/span>(.*?)<br\/>(.*?)<br\/>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();
        }
        */
        bookBlock[0]=rowText[0].match(/(bookinfo.aspx\?ctrlno=\d+\.?\d*)".*?blank">(.*?)<\/a>.*?<td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td>/);
        //alert(bookBlock[0].length);

        bookBlock[0].shift();
        var list = new LibMeta("GZARTS");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("GZARTS");
           list.items[s].link ="http://121.33.246.167/opac/"+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][2];
           list.items[s].publisher = bookBlock[s][3];
           list.items[s].pubDate = bookBlock[s][4];
           //list.items[s].bookIndex = bookBlock[s][2];
           //alert(list.items[s].link);
        }
        messageCatcher(list,frameLocation);

      }
    },


    //星海音乐学院
    XHCOM:{
      respond:function (reDetails,frameLocation) {
        if (reDetails.status !== 200&&reDetails.status !== 304){
          var msg = new LibMeta("XHCOM");
          msg.state="error";
          msg.errorMsg="全字段连接错误";
                //alert("ISBN连接错误");
          messageCatcher(msg,frameLocation);
          return;
          }
              //document.getElementById("footer").textContent=reDetails.responseText;
          if(reDetails.responseText.indexOf('没有')!=-1){
                  //alert("ISBN查无此书"); //增加荐购
            var msg = new LibMeta("XHCOM");
          msg.state="error";
          msg.errorMsg="全字段查无此书";
                  //hasBook = false;
                  //recommendBook();
            messageCatcher(msg,frameLocation);
            return;
          }

          //document.getElementById("reviews").textContent=reDetails.responseText;
          titleFilter.XHCOM.filter(reDetails.responseText,frameLocation);

      },
      filter:function(text,frameLocation){
        text = text.replace(/[ | ]*\n/g,'').replace(/\n[\s| | ]*\r/g,'').replace(/amp;/g,"").replace(/\r/g,"").replace(/ /g,"");
        rowText = text.match(/class="tb".*?<\/table>/);
        //alert(rowText.length);
        //document.getElementById("reviews").textContent=rowText;        

        var bookBlock = new Array();
        //var bookDetail = new Array();
        /*
        for(s=0;s<rowText.length;s++){
          bookBlock[s] = rowText[s].match(/marc_no=(\d+\.?\d*)">(.*?)<\/a>(.*?)<\/h3>.*?span>(.*?)<br>(.*?)<\/span>(.*?)<br\/>(.*?)<br\/>/);
          //alert(bookBlock[s].length);
          bookBlock[s].shift();
        }
        */
        bookBlock[0]=rowText[0].match(/(bookinfo.aspx\?ctrlno=\d+\.?\d*)".*?blank">(.*?)<\/a>.*?<td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td>/);
        //alert(bookBlock[0].length);

        bookBlock[0].shift();
        var list = new LibMeta("XHCOM");////构造函数
        list.state="booklist";
        list.items= new Array();
        for(s=0;s<rowText.length;s++){
           list.items[s] = new LibItem("XHCOM");
           list.items[s].link ="http://121.33.246.167/opac/"+bookBlock[s][0];
           list.items[s].bookName = bookBlock[s][1];
           list.items[s].author = bookBlock[s][2];
           list.items[s].publisher = bookBlock[s][3];
           list.items[s].pubDate = bookBlock[s][4];
           //list.items[s].bookIndex = bookBlock[s][2];
           //alert(list.items[s].link);
        }
        messageCatcher(list,frameLocation);

      }
    },

    //广东药学院,由于编码问题和没提供ISBN检索，暂不支持//
}


//////////////////图书馆荐购页面Main//////////////////////////////////////

libRecommend = {
  SYSU: function () {
    if (document.getElementsByName("Z13_TITLE")&&GM_getValue('doubanTitle')) {
      $('[name="Z13_TITLE"]').val(GM_getValue('doubanTitle', 'bookMeta.title'));
      $('[name="Z13_AUTHOR"]').val(GM_getValue('doubanAuthor', 'bookMeta.author'));
      $('[name="Z13_IMPRINT"]').val(GM_getValue('doubanPublisher', 'bookMeta.publisher'));
      $('[name="Z13_YEAR"]').val(GM_getValue('doubanPubdate', 'bookMeta.pubdate'));
      $('[name="Z13_ISBN_ISSN"]').val(GM_getValue('doubanIsbn', 'bookMeta.isbn'));
      $('[name="Z13_PRICE"]').val(GM_getValue('doubanPrice', 'bookMeta.price'));
      $('[name="Z68_NO_UNITS"]').val(2);
      $('[name="Z303_REC_KEY"]').val(prefs.libraryId);
      $('[name="Z46_REQUEST_PAGES"]').val('豆瓣读书得分: ' + GM_getValue('doubanRating', 'bookMeta.rating'));
      GM_deleteValue('doubanTitle');
      GM_deleteValue('doubanAuthor');
      GM_deleteValue('doubanPublisher');
      GM_deleteValue('doubanPubdate');
      GM_deleteValue('doubanIsbn');
      GM_deleteValue('doubanPrice');
      GM_deleteValue('doubanRating');
    }
  },
  SCUT: function () {
    var pubDate = document.getElementById('b_date');
    if (!pubDate) {
      return null;
    }
    var publisher = document.getElementById('b_pub');
    var author = document.getElementsByName('F210$c') [0];
    var title = document.getElementsByName('F200$a') [0];
    var ISBN = document.getElementsByName('F010$a') [0];
    var recommendText = document.getElementsByName('F330$a') [0];
    title.value = GM_getValue('doubanTitle', 'bookMeta.title');
    author.value = GM_getValue('doubanAuthor', 'bookMeta.author');
    publisher.value = GM_getValue('doubanPublisher', 'bookMeta.publisher');
    pubDate.value = GM_getValue('doubanPubdate', 'bookMeta.pubdate');
    ISBN.value = GM_getValue('doubanIsbn', 'bookMeta.isbn');
    recommendText.value = '豆瓣读书得分: ' + GM_getValue('doubanRating', 'bookMeta.rating');
    GM_deleteValue('doubanTitle');
    GM_deleteValue('doubanAuthor');
    GM_deleteValue('doubanPublisher');
    GM_deleteValue('doubanPubdate');
    GM_deleteValue('doubanIsbn');
    GM_deleteValue('doubanPrice');
    GM_deleteValue('doubanRating');
  },
  GDUFS: function () {
  }
}
///////////////////图书馆荐购页面结束//////////////////

////点击馆藏时触发


///////////////////框架//////////////////
titleFrame=function(){
    var frame = document.createElement("div");

    frame.innerHTML=    /*'<ul class="tabmenu">'+
        '<li id="clickISBN"><a>'+schoolInfo[prefs.school].abbrName+'</a></li>'+
        '<li id="clickOtherISBN"><a>其他图书馆</a></li>'+
        '</ul>'+*/
        '<div id="libTitle" class="tab_content libBottom">'+'<h2>'+schoolInfo[prefs.school].abbrName+'图书馆全字段检索</h2>'+'</div>'+
        '<div id="otherTitle" class="tab_content libBottom" style="display:none"><p>本Tab为测试使用</div>';//+
        //'</div>';
    //frame.innerHTML='<h2>'+schoolInfo[prefs.school].abbrName+'图书馆ISBN检索</h2>';
    //frame.setAttribute("class","gray_ad");
    frame.setAttribute("class","tablist");
/*
    frame.innerHTML='<h2>'+schoolInfo[prefs.school].abbrName+'图书馆全字段检索</h2>';
    frame.setAttribute("class","gray_ad");
    frame.setAttribute("id","libTitle");
*/
    if(location.href.indexOf("ebook")!=-1){
        var aside=document.getElementsByTagName("aside")[0];
    }
    else{
        var aside=document.querySelector(".aside");        
    }

    aside.insertBefore(frame,aside.firstChild.nextSibling);
}
ISBNFrame=function(){


    function showOtherFrame(){

      document.getElementById("libISBN").style.display="none";
      document.getElementById("otherISBN").style.display="block";
      defineClass=this.getAttribute("data-ready");
      this.setAttribute("class","blue");
      document.getElementById("clickISBN").setAttribute("class","");
      if(!defineClass){
        this.setAttribute("data-ready","already");
        otherISBN();
      }



    }


    function showOriginFrame(){
      document.getElementById("libISBN").style.display="block";
      document.getElementById("otherISBN").style.display="none";
      this.setAttribute("class","blue");
      document.getElementById("clickOtherISBN").setAttribute("class","");
  }

    var frame = document.createElement("div");


    //'<div class="tablist">'+
    frame.innerHTML=    '<ul class="tabmenu">'+
        '<li id="clickISBN" class="blue"><a>'+schoolInfo[prefs.school].abbrName+'</a></li>'+
        '<li id="clickOtherISBN"><a>其他图书馆</a></li>'+
        '<li id="settingPop"><a>设置</a></li>'+
        '</ul>'+
        '<div id="libISBN" class="tab_content libTop">'+'<h2>'+schoolInfo[prefs.school].abbrName+'图书馆ISBN检索</h2>'+'</div>'+
        '<div id="otherISBN" class="tab_content libTop" style="display:none"><div id="mainOtherISBN"></div><div id="errorOtherISBN"></div></div>';//+
        //'</div>';
    //frame.innerHTML='<h2>'+schoolInfo[prefs.school].abbrName+'图书馆ISBN检索</h2>';
    //frame.setAttribute("class","gray_ad");
    frame.setAttribute("class","tablist");
    //frame.setAttribute("id","libISBN");
    if(location.href.indexOf("ebook")!=-1){
        var aside=document.getElementsByTagName("aside")[0];
    }
    else{
        var aside=document.querySelector(".aside");        
    }
    aside.insertBefore(frame,aside.firstChild);
    clickOther=document.getElementById("clickOtherISBN");
    clickOther.addEventListener("click",showOtherFrame,false);
    clickOther=document.getElementById("clickISBN");
    clickOther.addEventListener("click",showOriginFrame,false);
    document.getElementById("settingPop").addEventListener("click",popSetting,false);


}


//////////////////////其它图书馆//////////////////////////////////

function otherISBN(){
    for(var key in schoolList){
      if(schoolList[key]!=prefs.school){
        //alert(school);
        mineISBN(schoolList[key],"otherISBN");
      }
    }
}
//////////////ISBN搜索xml获取//////////////////
mineISBN = function(school,frameLocation){

    if(frameLocation=="ISBN"){
          ISBNFrame();
    }
   
    if(bookMeta.isbn){
      var fullUrl="";
        switch(school){

          case "SCUT":
          case "SCNU":
          case "GZHU":
          case "GDUT":
          case "GZHTCM":
          case "GZARTS":
          case "XHCOM":
            fullUrl =schoolInfo[school].isbnSearchUrl.replace(/%s/,bookMeta.isbn10);
            //alert(fullurl);
            break;
          case "SYSU":
          case "GDUFS":

            if(bookMeta.isbn&&bookMeta.title.charCodeAt(0)<=122&&bookMeta.isbn[3]!=="7"){
             fullUrl=schoolInfo[school].isbnForeianSearchUrl.replace(/%s/,bookMeta.isbn);  
            }
            else{
              fullUrl=schoolInfo[school].isbnSearchUrl.replace(/%s/,bookMeta.isbn);        
            }
            break;
          default:
            break;
        }
        if(frameLocation=="ISBN"){
          //ISBNFrame();
          insertLoading(fullUrl);
        }
        frame = document.getElementById("libISBN");  //此处frame需要删除    
        //alert(fullUrl);

        GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,//异步获取
            //url : "http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=9787805985824",
            url : fullUrl,
            onload :function (reDetails){
         

              isbnFilter[school].respond(reDetails,frameLocation,fullUrl);
            }
        });
    
    }

    else{//无ISBN号的情况
        var msg = new LibMeta(school);
        msg.error=true;
        msg.state="error";
        msg.errorMsg = "无法获取ISBN号";

        messageCatcher(msg,frameLocation)

    }
}

function insertLoading(fullUrl){
        frame = document.getElementById("libISBN");
        frameLink = document.createElement("a");
        frameLink.setAttribute("target","_blank");
        frameLink.innerHTML="前往图书馆查看这本书";
        frameLink.setAttribute("href",fullUrl);
        frame.appendChild(frameLink);

        loadingFrame=document.createElement("div");
        loadingFrame.setAttribute("id","ISBNLoading");
        loadingFrame.innerHTML= '<li id="loadingSource"><a><img border="0" src="data:image/gif;base64,R0lGODlhCgAKAJEDAMzMzP9mZv8AAP///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAADACwAAAAACgAKAAACF5wncgaAGgJzJ647cWua4sOBFEd62VEAACH5BAUAAAMALAEAAAAIAAMAAAIKnBM2IoMDAFMQFAAh+QQFAAADACwAAAAABgAGAAACDJwHMBGofKIRItJYAAAh+QQFAAADACwAAAEAAwAIAAACChxgOBPBvpYQYxYAIfkEBQAAAwAsAAAEAAYABgAAAgoEhmPJHOGgEGwWACH5BAUAAAMALAEABwAIAAMAAAIKBIYjYhOhRHqpAAAh+QQFAAADACwEAAQABgAGAAACDJwncqi7EQYAA0p6CgAh+QQJAAADACwHAAEAAwAIAAACCpRmoxoxvQAYchQAOw=="> 努力加载中...</a></li>'

        frame.appendChild(loadingFrame);
}
/////////////////////////////////////////


//////////////书名搜索xml获取//////////////////
mineTitle = function(school){
    titleFrame();
        if(bookMeta.isbn&&bookMeta.title.charCodeAt(0)<=122&&bookMeta.isbn[3]!=="7"){
             var fullUrl=schoolInfo[school].anyForeianSearchUrl.replace(/%s/,bookMeta.title);
        }
        else{
             var fullUrl=schoolInfo[school].anySearchUrl.replace(/%s/,bookMeta.title);           
        }

        frame = document.getElementById("libTitle");
        loadingFrame=document.createElement("div");
        loadingFrame.setAttribute("id","titleLoading");
        loadingFrame.innerHTML= '<li id="loadingSource"><img border="0" src="data:image/gif;base64,R0lGODlhCgAKAJEDAMzMzP9mZv8AAP///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAADACwAAAAACgAKAAACF5wncgaAGgJzJ647cWua4sOBFEd62VEAACH5BAUAAAMALAEAAAAIAAMAAAIKnBM2IoMDAFMQFAAh+QQFAAADACwAAAAABgAGAAACDJwHMBGofKIRItJYAAAh+QQFAAADACwAAAEAAwAIAAACChxgOBPBvpYQYxYAIfkEBQAAAwAsAAAEAAYABgAAAgoEhmPJHOGgEGwWACH5BAUAAAMALAEABwAIAAMAAAIKBIYjYhOhRHqpAAAh+QQFAAADACwEAAQABgAGAAACDJwncqi7EQYAA0p6CgAh+QQJAAADACwHAAEAAwAIAAACCpRmoxoxvQAYchQAOw=="> 努力加载中...</li>'

              frameLink = document.createElement("a");
              frameLink.setAttribute("target","_blank");
              frameLink.innerHTML="前往图书馆查看这本书";
              frameLink.setAttribute("href",fullUrl);
              frame.appendChild(frameLink);
              frame.appendChild(loadingFrame);
                //alert(fullUrl);
        //alert(schoolInfo[school].isGBK);
        if(!schoolInfo[school].isGBK){
          GM_xmlhttpRequest({ //获取列表
            method : 'GET',
           synchronous : false,//异步获取
            //url : "http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=9787805985824",
            url : fullUrl,
            onload :function (reDetails){
              //var innerContent=document.createElement("div");
              
              titleFilter[school].respond(reDetails,"title",fullUrl);
            }
          });
        }
        else{
          GM_xmlhttpRequest({
            method: "POST",
            url: "http://yigewang.duapp.com/urlencode.php?m=ajax",
            data: "charset=GB2312&q="+bookMeta.title+"&type=encode",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "Cookie": "BAEID=5F612DF6E06FBEA7ACF81CFD7974892C:FG=1"

            },
          onload: function(response) {
              //alert("text");
              if (response.status !== 200&&response.status !== 304){
                var msg = new LibMeta(school);
                msg.state="error";
                msg.errorMsg="无法获取远程GBK转码";
                messageCatcher(msg,frameLocation);
                return;
              }
                fullUrl=  schoolInfo[school].anySearchUrl.replace(/%s/,response.responseText);
                frameLink.setAttribute("href",fullUrl);
                //alert(fullUrl);
                GM_xmlhttpRequest({ //获取列表
                method : 'GET',
                synchronous : false,//异步获取
                //url : "http://202.116.64.108:8991/F/?func=find-b&find_code=ISB&request=9787805985824",
                url : fullUrl,
                onload :function (reDetails){
                  //var innerContent=document.createElement("div");
                  titleFilter[school].respond(reDetails,"title",fullUrl);
            }
          });
            }
        });

        }


}
/////////////////////////////////////////




///////////////ISBN插入框架//////////////////////////////
ISBNInsert=function(msg,frameLocation){
    var innerContent=document.createElement("div");
    innerContent.innerHTML= msg;
    switch(frameLocation){
        case "ISBN":
            loading =document.getElementById("ISBNLoading");
            loading.parentNode.removeChild(loading);
            frame = document.getElementById("libISBN");
            break;
        case "title":
            loading =document.getElementById("titleLoading");
            loading.parentNode.removeChild(loading);
            frame = document.getElementById("libTitle");
            break;
        case "otherISBN":
            frame = document.getElementById("mainOtherISBN");
            break;
        default:
            break;
    }
    frame.appendChild(innerContent);
    function addStoreListener(){
        GM_setClipboard(this.getAttribute("data-storeInfo"));
        confirm("以下信息已复制到粘贴板\n\n"+this.getAttribute("data-storeInfo"));
    }
    var storeListener = document.querySelectorAll(".preStoreRegister");
    for(s=0;s<storeListener.length;s++){
        storeListener[s].addEventListener("dblclick",addStoreListener,false);
        storeListener[s].classList.remove("preStoreRegister");
    }
}
///////////////Title插入框架//////////////////////////////
titleInsert=function(msg,frameLocation){

    var innerContent=document.createElement("div");
    innerContent.innerHTML= msg;
    switch(frameLocation){
        case "ISBN":
            loading =document.getElementById("ISBNLoading");
            loading.parentNode.removeChild(loading);
            frame = document.getElementById("libISBN");
            break;
        case "title":
            GM_addStyle("#libTitle { max-height: 350px;overflow: auto; }");
            loading =document.getElementById("titleLoading");
            loading.parentNode.removeChild(loading);
            frame = document.getElementById("libTitle");
            break;
        case "otherISBN":
            frame = document.getElementById("mainOtherISBN");
            break;
        default:
            break;
    }
    
    frame.appendChild(innerContent);
}

///////////////Title插入框架//////////////////////////////
errorInsert=function(msg,frameLocation,school){
    var innerContent=document.createElement("div");
    innerContent.innerHTML= msg;
    switch(frameLocation){
        case "ISBN":
            if(loading =document.getElementById("ISBNLoading")){
                loading.parentNode.removeChild(loading);
            }
            

            frame = document.getElementById("libISBN");
            break;
        case "title":
            loading =document.getElementById("titleLoading");
            loading.parentNode.removeChild(loading);
            frame = document.getElementById("libTitle");
            break;
        case "otherISBN":
            frame = document.getElementById("errorOtherISBN"); 
            if(!frame.textContent){
                frame.innerHTML+="以下院校查无此书: "
            }
            frame.innerHTML+=school+"&nbsp|&nbsp";           
        default:
            return;
    }
    
    frame.appendChild(innerContent);
}


//////////////豆瓣网页荐购获取/////////////////////////
recommendBook = function(frameLocation,school){
        var innerContent=document.createElement("div");
    
    switch(frameLocation){
        case "ISBN":
            loading =document.getElementById("ISBNLoading");
            loading.parentNode.removeChild(loading);
            frame = document.getElementById("libISBN");
            break;
        case "title":
            loading =document.getElementById("titleLoading");
            loading.parentNode.removeChild(loading);
            frame = document.getElementById("libTitle");
            break;
        case "otherISBN":
            frame = document.getElementById("errorOtherISBN"); 
            if(!frame.textContent){
                frame.innerHTML+="以下院校查无此书: "
            }
            frame.innerHTML+=schoolInfo[school].abbrName+" ";
            return;
        default:
            return;
    }
    
    
  function gotoRecommend(){
      //var bookMeta = helper.book.meta();
      //alert(bookMeta.bookIndex);

      GM_setValue('doubanTitle',bookMeta.title);
      GM_setValue('doubanAuthor',bookMeta.author);
      GM_setValue('doubanPublisher',bookMeta.publisher);
      GM_setValue('doubanPubdate',bookMeta.pubdate);
      GM_setValue('doubanIsbn',bookMeta.isbn||bookMeta.bookIndex);
      GM_setValue('doubanPrice',bookMeta.price);
      GM_setValue('doubanRating',bookMeta.rating);
      GM_openInTab(schoolInfo[prefs.school].recommendUrl);

  };

  var style = ('style="' +
                         'display: inline-block; ' +
                         'background: #33A057; ' +
                         'border: 1px solid #2F7B4B; ' +
                         'color: white; ' +
                         'padding: 1px 10px; ' +
                         'border-radius: 3px; ' +
                         'margin-right: 8px;" '
  );


  statBtn = ('<a id="recbtn" rel="modal:open"' + 
      style + '>荐购</a>' );

  var allBook = '<ul><li>ISBN查询无此书'+statBtn+'</li></ul>';
   
  innerContent.innerHTML= allBook;
  frame.appendChild(innerContent);

  button=document.getElementById("recbtn");
  if(button){
    button.addEventListener("click",gotoRecommend,false);    
  }


  
}

///////获取回调数据//////////////
messageCatcher=function(msg,frameLocation){
  //alert(msg.school);
  switch(msg.state){
    case "store":
        var allBook="";
        var otherAbbr="";
        if(frameLocation.indexOf("other")!=-1){

          otherAbbr="院校:"+schoolInfo[msg.school].abbrName+" ";
        }

        var attachRent="";
        for(s=0;s<msg.items.length;s++){
            if(msg.items[s].rentable){
                attachRent=' rentable'
            }
            else{
                attachRent='';
            }
            storeInfo = bookMeta.title+" "+schoolInfo[msg.school].name+" ";
            //msg.items[s].bookIndex=null;
            if(msg.items[s].bookIndex) storeInfo+="索书号:"+msg.items[s].bookIndex+" ";            
            if(msg.items[s].branch) storeInfo+="分馆:"+msg.items[s].branch+" ";
            if(msg.items[s].location) storeInfo+="馆藏地:"+msg.items[s].location;
            //alert(storeInfo);       
           bookStatus =   '<ul class="preStoreRegister storelist ft pl more-after'+attachRent+'" data-storeInfo="'+storeInfo+'" '+'title="双击可粘贴馆藏信息到剪贴板"'+'> ' +//+'ondblclick="GM_setClipboard(this.getAttribute('+"'data-storeInfo'"+'))"'
                          '<li style="border: none"><a href="'+msg.items[s].link+'" target="_blank">'+otherAbbr+'单册状态:' + msg.items[s].storeState+
                          '<span style="position:relative; ">  应还日期: ' + msg.items[s].returnTime +'</span></a></li>' + 
                          //'<li style="border: none">到期: ' + loan[s][3] + '</li>' +
                          '<li style="border: none">分馆: ' + msg.items[s].branch + '</li>' +
                          '</ul>';                        
           allBook += bookStatus;

           //alert(allBook);      
        }
        //alert(allBook);
        ISBNInsert(allBook,frameLocation);
        break;
    case "booklist":
        var display;
        var allBook = "";
        var otherAbbr="";
        if(frameLocation.indexOf("other")!=-1){
          otherAbbr="院校:"+schoolInfo[msg.items[0].school].abbrName+" ";
        }
        for(s=0;s<msg.items.length;s++){
            if(s>4){
              display="display : none;";
            }
            else{
              display="";
            }

           bookStatus =   '<ul class="ft pl more-after"> ' +
            '<li style="border: none"><a href="'+msg.items[s].link+'"target="_blank">'+otherAbbr+'书名:' + msg.items[s].bookName+ '</a></li>' +
                          '<li style="overflow:hidden;border: none;'+display+'">作者: ' + msg.items[s].author  + 
                          '  出版社:' + msg.items[s].publisher + '</li>' +
                          //'<li style="border: none'+display+'"><a >出版社: ' + bookDetail[s][4] + '</a></li>' +
                          //'<li style="border: none'+display+'"><a >年份: ' + bookDetail[s][5] + '</a></li>' +
                          '</ul>';
                                                 
           allBook += bookStatus;
        }
        //return allBook;
        titleInsert(allBook,frameLocation);
        break;
    case "recommend":
      //alert("recommend");
      recommendBook(frameLocation,msg.school);
      break;
    case "error":
        var bookStatus = '<ul class="ft pl more-after"> ' +
                     '<li style="border: none">' + msg.errorMsg+'</li>' +
                     '</ul>';
        //return bookStatus;
        //alert(msg.errorMsg);
        //alert(frameLocation);
        errorInsert(bookStatus,frameLocation,schoolInfo[msg.school].abbrName);
        break;
    default:
      alert("defalut");
      break;
  }

}
/////////////////////////////////




//////////////////图书馆荐购页面Main//////////////////////////////////////

libMain = function(){
    
    if(GM_getValue('doubanTitle')){
      $('[name="Z13_TITLE"]').val(GM_getValue('doubanTitle','bookMeta.title'));
      $('[name="Z13_AUTHOR"]').val(GM_getValue('doubanAuthor','bookMeta.author'));
      $('[name="Z13_IMPRINT"]').val(GM_getValue('doubanPublisher','bookMeta.publisher'));
      $('[name="Z13_YEAR"]').val(GM_getValue('doubanPubdate','bookMeta.pubdate'));
      $('[name="Z13_ISBN_ISSN"]').val(GM_getValue('doubanIsbn','bookMeta.isbn'));
      $('[name="Z13_PRICE"]').val(GM_getValue('doubanPrice','bookMeta.price'));
      $('[name="Z68_NO_UNITS"]').val(2);
      $('[name="Z303_REC_KEY"]').val(prefs.studentID);
      $('[name="Z46_REQUEST_PAGES"]').val('豆瓣读书得分: '+ GM_getValue('doubanRating','bookMeta.rating'));
      GM_deleteValue('doubanTitle');
      GM_deleteValue('doubanAuthor');
      GM_deleteValue('doubanPublisher');
      GM_deleteValue('doubanPubdate');
      GM_deleteValue('doubanIsbn');
      GM_deleteValue('doubanPrice');
      GM_deleteValue('doubanRating');


  }
  
  //alert(GM_getValue('doubanTitle'));

}
///////////////////图书馆荐购页面结束//////////////////



GM_addStyle('.recbtn{display: inline-block; background: #33A057;border: 1px solid #2F7B4B; color: white; padding: 1px 10px; border-radius: 3px; margin-right: 8px;cursor:pointer} ')





GM_registerMenuCommand("图书馆检索设置", popSetting);
//////////////主函数//////////////////////////

if(location.href.indexOf('douban')!=-1){

  GM_addStyle(".tablist {position:relative;}"+
".tab_content {position: relative;width:295px;margin-bottom:5px;max-height: 350px;overflow: auto;padding:15px 5px 15px 5px;border:1px solid #91a7b4;border-radius:3px;box-shadow:0 2px 3px rgba(0,0,0,0.1);font-size:1.2em;line-height:1.5em;color:#666;background:#F6F6F1;}"+
".tabmenu {position:absolute;bottom:100%;margin:0;width:316px;}"+
  ".tabmenu li{display:inline-block;}"+
  ".tabmenu li a {display:block;padding:5px 10px;margin:0 10px 0 0;border:1px solid #91a7b4;border-radius:5px 5px 0 0;background:#F6F6F1;color:#333;text-decoration:none;}#libISBN div ul,#libTitle div ul,#otherISBN div ul,#otherTitle div ul{border-bottom: 1px dashed #ddd;}#errorOtherISBN{font-size:10px}.blue a{background:#37A !important;color:white !important;}.tab_content h2{color:#007722; font:15px/150% Arial,Helvetica,sans-serif;margin: 0 0 12px;}"+
".libTop{margin-top:30px;}#clickISBN a,#clickOtherISBN a,#settingPop a{cursor:pointer;}#settingPop{position:relative;float:right;}"+
".rentable{background:#E3F1ED!important;}.ft.pl.rentable li a{color:#4f946e;}.ft.pl.rentable li a:hover{background:#007711;color:#FFFFFF;}");
  mineISBN(prefs.school,"ISBN");
  mineTitle(prefs.school);

    GM_setValue("doubanTitle",bookMeta.title);
    GM_setValue("doubanAuthor",bookMeta.author);
    GM_setValue('doubanPubdate',bookMeta.pubdate);
    GM_setValue("doubanIsbn",bookMeta.isbn);
    GM_setValue("doubanPublisher",bookMeta.publisher);
}



if(location.href.indexOf('http://202.116.64.108:8080/apsm/recommend/recommend.jsp')!=-1){
  libRecommend.SYSU();//中山大学图书馆荐购页面
}

if(location.href.indexOf('http://202.38.232.10/opac/servlet/opac.go?cmdACT=recommend.form')!=-1){
  libRecommend.SCUT();//华南理工大学图书馆荐购页面
}

if(location.href.indexOf('gdtgw.cn')!=-1){//十校互借页面

    if(GM_getValue('gotoRent')==true){

    function clickShow(mutations){    //点击按钮
        function fillForm(mutations){//填写表单

            document.getElementById("idNo").value=prefs.studentID;
            document.getElementById("campusId").value=prefs.school.toLowerCase();//无法设置，还需要一次监听，或者setTimeout
            document.getElementsByName("reader.email")[0].value=prefs.eMail;
            document.getElementsByName("reader.campus")[0].value=prefs.campus;
            document.getElementsByName("reader.phone")[0].value=prefs.telephone;
            document.getElementById("name").value=prefs.name;
            document.getElementById("supplier").value=GM_getValue("rentSchool","");
            document.getElementById("callNo").value=GM_getValue("bookIndex","");            
            document.getElementById("title").value=GM_getValue("doubanTitle","");
            document.getElementById("isbn").value=GM_getValue("doubanIsbn","");     
            document.getElementById("author").value=GM_getValue("doubanAuthor","");  
            document.getElementById("publisher").value=GM_getValue("doubanPublisher","");
            document.getElementById("publishTime").value=GM_getValue("doubanPubdate","");
                 
            observerRight.disconnect();//去除监听
            var target = document.getElementById("campusId");
            var observerSchool = new MutationObserver(function(mutations,obs){
                document.getElementsByName("reader.campusId")[0].value=prefs.school.toLowerCase();
                //alert("test");
                obs.disconnect;


            });
            var config = { 'childList': true} 
            // 传入目标节点和观察选项
            observerRight.observe(target, config);

            
        }
        ////////////////////////////////////////


        document.getElementById("Map").areas[1].click();
        observerLeft.disconnect();
        var target = document.querySelector('#rightContent');
        var observerRight = new MutationObserver(fillForm);
        var config = { 'childList': true} 
        // 传入目标节点和观察选项
        observerRight.observe(target, config);
    }
    ///////////////////////


        var MutationObserver = window.MutationObserver ||
        window.WebKitMutationObserver || 
        window.MozMutationObserver;
        if(MutationObserver){
    // 选择目标节点
        var target = document.querySelector('#leftContent');

    // 创建观察者对象
        var observerLeft = new MutationObserver(clickShow); 
    // 配置观察选项:
        var config = { 'childList': true} 
    // 传入目标节点和观察选项
        observerLeft.observe(target, config); 
    // 随后,你还可以停止观察

       
        }
        else{
            function clickSecond(){

            document.getElementById("idNo").value=prefs.studentID;
            document.getElementById("campusId").value=prefs.school.toLowerCase();//无法设置，还需要一次监听，或者setTimeout
            document.getElementsByName("reader.email")[0].value=prefs.eMail;
            document.getElementsByName("reader.campus")[0].value=prefs.campus;
            document.getElementsByName("reader.phone")[0].value=prefs.telephone;
            document.getElementById("name").value=prefs.name;
            document.getElementById("supplier").value=GM_getValue("rentSchool","");
            document.getElementById("callNo").value=GM_getValue("bookIndex","");            
            document.getElementById("title").value=GM_getValue("doubanTitle","");
            document.getElementById("isbn").value=GM_getValue("doubanIsbn","");     
            document.getElementById("author").value=GM_getValue("doubanAuthor","");  
            document.getElementById("publisher").value=GM_getValue("doubanPublisher","");
            document.getElementById("publishTime").value=GM_getValue("doubanPubdate","");
            }

            function clickFirst(){
            document.getElementById("Map").areas[1].click();
            setTimeout(function(){clickSecond()},1000);
            }

            setTimeout(function(){clickFirst()},500);
        }
        GM_setValue('gotoRent',false); 

    }
}


if(location.href.indexOf('gdufs.edu.cn')!=-1&&prefs.school!="GDUFS"){//广外

    var rentTable=document.getElementsByTagName("table");
    rentTable=rentTable[6];

    function GDUFS_interLending(){
        var bookIndex=this.parentNode.parentNode.cells[5].textContent;
        GM_setValue("bookIndex",bookIndex);
        GM_setValue("rentSchool","gdufs");
        GM_setValue("gotoRent",true);
        GM_openInTab("http://www.gdtgw.cn:8080/#.html");
    }

    for (var s = 1; s < rentTable.rows.length; s++) {
         //let bookIndex=rentTable.rows[s].cells[5].textContent;
         var recbtn=document.createElement("a");
         recbtn.setAttribute("class","recbtn");
         recbtn.innerHTML="十校互借";
         rentTable.rows[s].cells[9].innerHTML='';
         rentTable.rows[s].cells[9].appendChild(recbtn);
         recbtn.addEventListener("click",GDUFS_interLending,false);
    };
}

if(location.href.indexOf('202.116.64.108:8991')!=-1&&prefs.school!="SYSU"){//中大

    var rentTable=document.getElementsByTagName("table");
    rentTable=rentTable[6];

    function SYSU_interLending(){
        var bookIndex=this.parentNode.parentNode.cells[6].textContent;
        GM_setValue("bookIndex",bookIndex);
        GM_setValue("rentSchool","sysu");
        GM_setValue("gotoRent",true);
        GM_openInTab("http://www.gdtgw.cn:8080/#.html");
    }

    for (var s = 1; s < rentTable.rows.length; s++) {
         //let bookIndex=rentTable.rows[s].cells[5].textContent;
         var recbtn=document.createElement("a");
         recbtn.setAttribute("class","recbtn");
         recbtn.innerHTML="十校互借";
         rentTable.rows[s].cells[9].innerHTML='';
         rentTable.rows[s].cells[9].appendChild(recbtn);
         recbtn.addEventListener("click",SYSU_interLending,false);
    };
}

if(location.href.indexOf('http://202.38.232.10/opac/servlet/opac.go')!=-1&&prefs.school!="SCUT"){//华理工
    var rentTable=document.getElementById("queryholding");
    if(!rentTable){
        //alert("test");
        return null;
    }

    function SCUT_interLending(){
        var bookIndex=this.parentNode.parentNode.cells[2].textContent;

        var title=document.getElementById("bookName").getAttribute("value");

        var infoTable=document.getElementsByClassName("left12")[0].getElementsByTagName("table")[0];
        ISBN = infoTable.textContent;
        ISBN = ISBN.replace(/\n/g,"").replace(/ /g,"").match(/ISBN(\d|-)+/)[0].slice(4);
        publisher = infoTable.rows[2].cells[1].textContent;
        pubDate = publisher.match(/\d+/);
        publisher = publisher.slice(0,publisher.indexOf(pubDate)-2);
        author = infoTable.rows[1].cells[1].getElementsByTagName("a")[0].innerHTML;
        //alert(author+publisher+pubDate+ISBN);
        //alert(ISBN);
        GM_setValue("bookIndex",bookIndex);
        GM_setValue("rentSchool","scut");
        GM_setValue("gotoRent",true);
        GM_setValue("doubanTitle",title);
        GM_setValue("doubanPubdate",pubDate);
        GM_setValue("doubanPublisher",publisher);
        GM_setValue("doubanAuthor",author);
        GM_setValue("doubanIsbn",ISBN);
        GM_openInTab("http://www.gdtgw.cn:8080/#.html");
    }
    rentTable=rentTable.rows[0].cells[0].getElementsByTagName("table")[0];
    //alert(rentTable.textContent);
    for (var s = 1; s < rentTable.rows.length; s++) {
         //let bookIndex=rentTable.rows[s].cells[5].textContent;
         var recbtn=document.createElement("a");
         recbtn.setAttribute("class","recbtn");
         recbtn.innerHTML="十校互借";
         var btncell=rentTable.rows[s].cells[3];
         btncell.appendChild(recbtn);
         recbtn.addEventListener("click",SCUT_interLending,false);
    };    
}

if(location.href.indexOf('lib.gzhu.edu.cn:8080/bookle/search2/detail')!=-1&&prefs.school!="GZHU"){//广州大学
    var rentTable=document.getElementsByClassName("book_holding")[0];

    function GZHU_interLending(){

        var infoTable=document.getElementsByClassName("book_detail")[0];
        //alert(infoTable.textContent);

        var bookIndex=infoTable.rows[5].cells[1].textContent;
        var publisher = infoTable.rows[0].cells[1].textContent;
        var pubDate = publisher.match(/\d+/);

        publisher=publisher.slice(0,publisher.indexOf(pubDate)-1);
        var title=document.getElementsByTagName("title")[0].textContent.slice(13,-1);
        var author=infoTable.rows[1].cells[1].textContent.replace(/\n/g,"").replace(/ /g,"");
        //alert(publisher+bookIndex+pubDate+title);
        GM_setValue("doubanTitle",title);
        GM_setValue("doubanPubdate",pubDate);
        GM_setValue("doubanPublisher",publisher);
        GM_setValue("doubanAuthor",author);
        GM_setValue("bookIndex",bookIndex);
        GM_setValue("rentSchool","gzhu");
        GM_setValue("gotoRent",true);
        GM_setValue("doubanTitle",title);
        GM_openInTab("http://www.gdtgw.cn:8080/#.html");
    }

    //alert(rentTable.textContent);
    for (var s = 1; s < rentTable.rows.length; s++) {
         //let bookIndex=rentTable.rows[s].cells[5].textContent;
         var recbtn=document.createElement("a");
         recbtn.setAttribute("class","recbtn");
         recbtn.innerHTML="十校互借";
         var btncell=rentTable.rows[s].cells[6];
         btncell.appendChild(recbtn);
         recbtn.addEventListener("click",GZHU_interLending,false);
    };    
}

if(location.href.indexOf('http://210.38.102.131:86/opac/item.php?marc_no=')!=-1&&prefs.school!="GZHTCM"){//广中医
    var rentTable=document.getElementById("item");

    function GZHTCM_interLending(){

        var infoTable=document.getElementsByClassName("booklist");
        //alert(infoTable.textContent);

        var bookIndex=this.parentNode.parentNode.cells[0].textContent;
        var publisher =infoTable[1].getElementsByTagName("dd")[0].textContent;
        var pubDate = publisher.match(/\d+/);
        var ISBN=infoTable[2].getElementsByTagName("dd")[0].textContent.match(/(\d|-)+/);

        publisher=publisher.slice(0,publisher.indexOf(pubDate)-1);
        var title=document.getElementsByTagName("title")[0].textContent;
        var author=infoTable[0].getElementsByTagName("dd")[0].textContent;
        author = author.slice(author.indexOf('/')+1)
        //alert(publisher+bookIndex+pubDate+title);
        GM_setValue("doubanTitle",title);
        GM_setValue("doubanIsbn",ISBN);
        GM_setValue("doubanPubdate",pubDate);
        GM_setValue("doubanPublisher",publisher);
        GM_setValue("doubanAuthor",author);
        GM_setValue("bookIndex",bookIndex);
        GM_setValue("rentSchool","gzhtcm");
        GM_setValue("gotoRent",true);
        GM_setValue("doubanTitle",title);
        GM_openInTab("http://www.gdtgw.cn:8080/#.html");
    }

    //alert(rentTable.textContent);
    for (var s = 1; s < rentTable.rows.length; s++) {
         //let bookIndex=rentTable.rows[s].cells[5].textContent;
         var recbtn=document.createElement("a");
         recbtn.setAttribute("class","recbtn");
         recbtn.innerHTML="十校互借";
         var btncell=rentTable.rows[s].cells[2];
         btncell.appendChild(recbtn);
         recbtn.addEventListener("click",GZHTCM_interLending,false);
    };    
}

if(location.href.indexOf('http://202.116.41.246:8080/opac/item.php?marc_no=')!=-1&&prefs.school!="SCNU"){//华师
    var rentTable=document.getElementById("item");

    function SCNU_interLending(){

        var infoTable=document.getElementsByClassName("booklist");
        //alert(infoTable.textContent);

        var bookIndex=this.parentNode.parentNode.cells[0].textContent;
        var publisher =infoTable[1].getElementsByTagName("dd")[0].textContent;
        var pubDate = publisher.match(/\d+/);
        var ISBN=infoTable[2].getElementsByTagName("dd")[0].textContent.match(/(\d|-)+/);

        publisher=publisher.slice(0,publisher.indexOf(pubDate)-1);
        var title=document.getElementsByTagName("title")[0].textContent;
        var author=infoTable[0].getElementsByTagName("dd")[0].textContent;
        author = author.slice(author.indexOf('/')+1)
        //alert(publisher+bookIndex+pubDate+title);
        GM_setValue("doubanTitle",title);
        GM_setValue("doubanIsbn",ISBN);
        GM_setValue("doubanPubdate",pubDate);
        GM_setValue("doubanPublisher",publisher);
        GM_setValue("doubanAuthor",author);
        GM_setValue("bookIndex",bookIndex);
        GM_setValue("rentSchool","scnu");
        GM_setValue("gotoRent",true);
        GM_setValue("doubanTitle",title);
        GM_openInTab("http://www.gdtgw.cn:8080/#.html");
    }

    //alert(rentTable.textContent);
    for (var s = 1; s < rentTable.rows.length; s++) {
         //let bookIndex=rentTable.rows[s].cells[5].textContent;
         var recbtn=document.createElement("a");
         recbtn.setAttribute("class","recbtn");
         recbtn.innerHTML="十校互借";
         var btncell=rentTable.rows[s].cells[2];
         btncell.appendChild(recbtn);
         recbtn.addEventListener("click",SCNU_interLending,false);
    };    
}

if(location.href.indexOf('http://222.200.98.171:81/bookinfo.aspx?ctrlno=')!=-1&&prefs.school!="GDUT"){//广东工业大学
    var rentTable=document.getElementById("bardiv").getElementsByTagName("table")[0];

    function GDUT_interLending(){

        var infoTable=document.getElementById("ctl00_ContentPlaceHolder1_bookcardinfolbl");
        //alert(infoTable.textContent);

        var bookIndex=this.parentNode.parentNode.cells[1].textContent;
        var publisher =infoTable.getElementsByTagName("a")[0].innerHTML;
        var pubDate = infoTable.textContent.match(/\d+\.?\d*/);
        var ISBN=infoTable.textContent.replace(/\n/g,"").match(/ISBN(\d|-)+/)[0];
        //alert(ISBN);
        ISBN=ISBN.slice(4)
        var title=infoTable.textContent.slice(0,infoTable.textContent.indexOf("／")).replace(/　+/g,"");
        var author=infoTable.textContent.slice(infoTable.textContent.indexOf("／")+1,infoTable.textContent.indexOf("—")-1);

        //alert(publisher+bookIndex+pubDate+title);
        GM_setValue("doubanTitle",title);
        GM_setValue("doubanIsbn",ISBN);
        GM_setValue("doubanPubdate",pubDate);
        GM_setValue("doubanPublisher",publisher);
        GM_setValue("doubanAuthor",author);
        GM_setValue("bookIndex",bookIndex);
        GM_setValue("rentSchool","gdut");
        GM_setValue("gotoRent",true);
        GM_setValue("doubanTitle",title);
        GM_openInTab("http://www.gdtgw.cn:8080/#.html");
    }

    //alert(rentTable.textContent);
    for (var s = 1; s < rentTable.rows.length; s++) {
         //let bookIndex=rentTable.rows[s].cells[5].textContent;
         var recbtn=document.createElement("a");
         recbtn.setAttribute("class","recbtn");
         recbtn.innerHTML="十校互借";
         var btncell=rentTable.rows[s].cells[6];
         btncell.appendChild(recbtn);
         recbtn.addEventListener("click",GDUT_interLending,false);
    };    
}

if(location.href.indexOf('http://121.33.246.167/opac/bookinfo.aspx?ctrlno=')!=-1&&prefs.school!="GZARTS"){//广州美术学院
    var rentTable=document.getElementById("bardiv").getElementsByTagName("table")[0];

    function GZARTS_interLending(){

        var infoTable=document.getElementById("ctl00_ContentPlaceHolder1_bookcardinfolbl");
        //alert(infoTable.textContent);

        var bookIndex=this.parentNode.parentNode.cells[1].textContent;
        var publisher =infoTable.getElementsByTagName("a")[0].innerHTML;
        var pubDate = infoTable.textContent.match(/\d+\.?\d*/);
        var ISBN=infoTable.textContent.replace(/\n/g,"").match(/ISBN(\d|-)+/)[0];
        //alert(ISBN);
        ISBN=ISBN.slice(4)
        var title=infoTable.textContent.slice(0,infoTable.textContent.indexOf("／")).replace(/　+/g,"");
        var author=infoTable.textContent.slice(infoTable.textContent.indexOf("／")+1,infoTable.textContent.indexOf("—")-1);

        //alert(publisher+bookIndex+pubDate+title);
        GM_setValue("doubanTitle",title);
        GM_setValue("doubanIsbn",ISBN);
        GM_setValue("doubanPubdate",pubDate);
        GM_setValue("doubanPublisher",publisher);
        GM_setValue("doubanAuthor",author);
        GM_setValue("bookIndex",bookIndex);
        GM_setValue("rentSchool","gzarts");
        GM_setValue("gotoRent",true);
        GM_setValue("doubanTitle",title);
        GM_openInTab("http://www.gdtgw.cn:8080/#.html");
    }

    //alert(rentTable.textContent);
    for (var s = 1; s < rentTable.rows.length; s++) {
         //let bookIndex=rentTable.rows[s].cells[5].textContent;
         var recbtn=document.createElement("a");
         recbtn.setAttribute("class","recbtn");
         recbtn.innerHTML="十校互借";
         var btncell=rentTable.rows[s].cells[6];
         btncell.appendChild(recbtn);
         recbtn.addEventListener("click",GZARTS_interLending,false);
    };    
}

if(location.href.indexOf('http://218.192.148.33:81/bookinfo.aspx?ctrlno=')!=-1&&prefs.school!="XHCOM"){//星海音乐学院
    var rentTable=document.getElementById("bardiv").getElementsByTagName("table")[0];

    function XHCOM_interLending(){

        var infoTable=document.getElementById("ctl00_ContentPlaceHolder1_bookcardinfolbl");
        //alert(infoTable.textContent);

        var bookIndex=this.parentNode.parentNode.cells[1].textContent;
        var publisher =infoTable.getElementsByTagName("a")[0].innerHTML;
        var pubDate = infoTable.textContent.match(/\d+\.?\d*/);
        var ISBN=infoTable.textContent.replace(/\n/g,"").match(/ISBN(\d|-)+/)[0];
        //alert(ISBN);
        ISBN=ISBN.slice(4)
        var title=infoTable.textContent.slice(0,infoTable.textContent.indexOf("／")).replace(/　+/g,"");
        var author=infoTable.textContent.slice(infoTable.textContent.indexOf("／")+1,infoTable.textContent.indexOf("—")-1);

        //alert(publisher+bookIndex+pubDate+title);
        GM_setValue("doubanTitle",title);
        GM_setValue("doubanIsbn",ISBN);
        GM_setValue("doubanPubdate",pubDate);
        GM_setValue("doubanPublisher",publisher);
        GM_setValue("doubanAuthor",author);
        GM_setValue("bookIndex",bookIndex);
        GM_setValue("rentSchool","xhcm");
        GM_setValue("gotoRent",true);
        GM_setValue("doubanTitle",title);
        GM_openInTab("http://www.gdtgw.cn:8080/#.html");
    }

    //alert(rentTable.textContent);
    for (var s = 1; s < rentTable.rows.length; s++) {
         //let bookIndex=rentTable.rows[s].cells[5].textContent;
         var recbtn=document.createElement("a");
         recbtn.setAttribute("class","recbtn");
         recbtn.innerHTML="十校互借";
         var btncell=rentTable.rows[s].cells[6];
         btncell.appendChild(recbtn);
         recbtn.addEventListener("click",XHCOM_interLending,false);
    };    
}