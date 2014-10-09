douban_helper_SYSU
==================

为豆瓣图书添加广州大学城各高校图书馆藏
<h2>介绍</h2>
1.为豆瓣图书/豆瓣电子书页面增加中大图书馆藏检索（ISBN号与全字段检索）；

2.提供大学城9个高校的ISBN图书检索（中山大学、华南理工大学、华南师范大学、广东外语外贸大学、广东工业大学、广州大学、广州美术学院、广州中医药大学）；

3.豆瓣图书一键荐购图书(中山大学、华南理工大学)。

3.在各高校馆藏页面一键互借图书。

测试页面：
http://book.douban.com/subject/6729209/
http://read.douban.com/ebook/5503062/

![预览](https://i.minus.com/ibrP3oZ0LrUT.png)
<img src="https://i.minus.com/ibrP3oZ0LrUT.png" />
<img src="https://i.minus.com/izOhANdHKI7U3.png" />
<img src="https://i.minus.com/imQC3IVQ4OWI.png" />
<img src="https://i.minus.com/ibriQ7Z92iapKf.png" />


<h2>如何安装</h2>
根据自己的浏览器先安装扩展，扩展安装完毕后点击本页面【安装脚本】/【Install this script】按钮即可完成安装
<ul class="simple">
<li><a href="http://www.firefox.com/" class="reference external">Firefox</a> + <a href="https://addons.mozilla.org/firefox/addon/greasemonkey/" class="reference external">Greasemonkey</a></li>
<li><a href="http://www.opera.com/" class="reference external">Opera</a> + <a href="https://addons.opera.com/extensions/details/violent-monkey/" class="reference external">Violentmonkey</a></li>
<li><a href="http://www.google.com/chrome" class="reference external">Chrome</a> + <a href="http://tampermonkey.net" class="reference external">Tampermonkey</a>
（各种基于chromium开发的浏览器如360极速、猎豹之类的安装这个，无法进入chrome商店请看下面解决方法）</li>
<li><a href="http://www.maxthon.cn/" class="reference external">Maxthon</a> + <a href="http://extension.maxthon.cn/detail/index.php?view_id=1680" class="reference external">Violentmonkey</a></li>
<li><a href="http://www.apple.com/cn/safari/" class="reference external">Safari</a> + <a href="http://ss-o.net/safari/extension/NinjaKit.safariextz" class="reference external">NinjaKit</a></li>
<li>……</li>
</ul>

<h2>无法进入chrome商店怎么办</h2>
1.用代理；
2.修改host，可百度“hoststool”；
3.下载离线版tampermonkey扩展程序后安装（chrome31以上可能需要修改组策略）<a href="http://www.qixing123.com/webstore/chrome/Tampermonkey/Tampermonkey.crx">tampermonkey七星下载点</a>  <a href="https://clients2.googleusercontent.com/crx/blobs/QgAAAC6zw0qH2DJtnXe8Z7rUJP2izI4Gb1KxyjdhKF5P5kzhCcw2gxzusRnS4tEsDU_bK7Hrlqb5oKOyKy_9g8fIR-87kT-QZKm4JRu8x5avDi8-AMZSmuUkf2ioLgVLAFww8ms_67Rj-gHuGw/extension_3_8_52.crx">chrome商店离线地址</a>  
<h2>更新：</h2>

<p>1.6.7 星海音乐学院图书馆终于可以上了，添加星海音乐学院检索。添加双击粘贴馆藏信息剪贴板功能。</p>
<p>1.6.4-5 修正豆瓣电子书ISBN为10位码时无法正确转换的问题</p>
<p>1.6.3 完成华师、广州大学、广中医的全字段检索；测试华南理工大学的荐购页面</p>
<p>1.6.2 修改设置按钮在不同院校时发生错位问题，完成华南理工大学的全字段检索</p>
<p>1.6.1 为chrome（同名函数覆盖）/opera12（无MutationObserver对象）进行兼容性修改</p>
<p>1.5.12 修改样式;获取华理工馆藏URL为POST时的情况;修复SYSU和GDUFS包含同名函数getBookinfo导致相互覆盖的问题（惊天BUG= =!）。</p>
<p>1.5.11 豆瓣页面添加可借阅图书识别</p>
<p>1.5.10 为各高校页面添加【十校互借】按钮</p>
<p>1.5.9 初步测试十校荐购页面</p>
<p>1.5.8 对设置框架进行兼容性修改，额外在页面上增加设置按钮。</p>
<p>1.5.7 为Violentmonkey进行兼容性修改</p>
<p>1.5.6 新增个人设置框架，请点击油猴子图标=>用户脚本命令=>图书馆检索设置</p>
<p>1.5.5 新增豆瓣电子图书页面的检索功能</p>
<p>1.5.4  
          修正ISBN中西文检索的判断；
          截断书名中的小括号，防止搜索时进入子搜索模式；
          修改样式；
           添加了其他图书馆无图书时的提醒。
          </p>
<p>1.5.3  新增其他图书馆ISBN检索，支持广东外语外贸大学、广东工业大学、广州美术学院、华南理工大学、华南师范大学、广州中医药大学、广州大学</p>
<p> 1.4.1      
         1.修复各种BUG;
         2.新增对外文图书的检索;
         3.重构脚本完成组件化;
         4.去除博济搜索模块，跟博济说再见。</p>
<h2>兼容性报告</h2>
Douban helper for SYSU v1.5.7在以下环境通过兼容性测试：
firefox 32.0 + GreaseMonkey2.0
firefox Nightly 35.0a1 + GreaseMonkey2.2
Chrome 34 +Tampermonkey3.8.52
Opera 12.16 + Violentmonkey1.6.3
Maxthon4.4 + 暴力猴2

<h2>欢迎反馈BUG</h2>
