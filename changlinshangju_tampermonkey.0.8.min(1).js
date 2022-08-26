const myCSSUrl = "https://tampermonkey.biglin.top/changlinshangju_tampermonkey.0.81.min.css";
const jqueryJsUrl = "https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.5.1.min.js";
const toastrCsssUrl = "https://tampermonkey.biglin.top/toastr.min.css";
const toastrJsUrl = "https://tampermonkey.biglin.top/toastr.min.js";
const redFbaJsUrl = "https://tampermonkey.biglin.top/red_fba.js";
const addAsinToServerUrl = "https://erp.biglin.top:8000/add_asin_to_craw_by_tampermonkey";
const submitHtmlUrl = "https://erp.biglin.top:8000/submitHtml/"
// const addAsinToServerUrl = "http://localhost:8000/add_asin_to_craw_by_tampermonkey/";

let settings = {}

// 引入CSS或者JS
function appendMyJSOrCSS_(src, timeTamper = false) {
    if (timeTamper) {
        let nocache = new Date().getTime();
        src += ("?" + nocache)
    }
    var head = document.head || document.getElementsByTagName('head')[0];
    // alert(src)
    if (src.indexOf("\.js") == -1) { //css
        var link = document.createElement('link')
        link.type = 'text/css';
        link.rel = 'stylesheet';
        // link.href = src;
        link.setAttribute("href", src);
        head.appendChild(link);
    } else {
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.setAttribute("src", src);
        head.appendChild(script);
    }
}

// 开始操作
async function start() {
    var optionsNodes = document.getElementsByName("optionSelection");
    var options = [];
    // alert(optionsNodes[0].checked)
    for (var i = 0; i < optionsNodes.length; i++) {
        if (optionsNodes[i].checked == true) {
            options.push(optionsNodes[i].value)
        }
    }
// 	alert(options)
    if (options.indexOf('采集本页') !== -1) {
        await crawlingCurrentPage();
    } else if (options.indexOf('下载SKU') !== -1) {
        await downloadSku();
    } else if (options.indexOf('复制SKU') !== -1) {
        await copySku();
    } else if (options.indexOf('邀请评论') !== -1) {
        await inviteFeedback();
    } else if (options.indexOf('所有ASIN') !== -1) {
        await getSellerAllAsins();
    } else if (options.indexOf("本条ASIN") !== -1) {
        await uploadCurrentAsins()
    } else if (options.indexOf("突显FBA") !== -1) {
        processRedFba(true);
        ReddingFbaItems();
    } else if (options.indexOf("自动提款") !== -1) {
        autoGetCash();
    } else {
        processRedFba(false)
    }
}


function autoGetCash() {
    var kpiBtn = $("button[data-testid='KpiCardButton']:has(div:contains('总余额'))");
    kpiBtn.click();
    var interval_ = setInterval(function () {
        clearInterval(interval_);
        var cashBoard = $("button[data-testid='KpiCardButton']:has(div:contains('总余额')) + div a")
        for (let i = 0; i < cashBoard.length; i++) {
            alert(cashBoard[i].innerHTML)
            // linkTo(cashBoard[i])
            // alert(cashBoard[i].click())
            break;
        }
    }, 800);
    // alert(kpiBtn.(''))
}

function ReddingFbaItems() {
    // alert('染红FBA')
    // $(“li[data-name=‘d’]”)
    // alert($)
    // var v = $("[class='a-section a-spacing-small s-padding-left-small s-padding-right-small']").html()
    $("div[data-asin]:has(span:contains('Amazon'))").css('cssText', 'background: #ffcc99 !important');
    $("div[data-asin]:has(i[class*='a-icon-prime'])").css('cssText', 'background: #ffcc99 !important');
    // // alert(asinDivs)

    $("a[class*='s-pagination-button']").click(function () {
        var interval_ = setInterval(function () {
            let i = 0;
            $("div[data-asin]:has(span:contains('Amazon'))").css('cssText', 'background: #ffcc99 !important');
            $("div[data-asin]:has(i[class*='a-icon-prime'])").css('cssText', 'background: #ffcc99 !important');

            i += 1;
            if (i > 5) {
                console.log('清除定时器interval_');
                clearInterval(interval_);
            }

        }, 800);
    });
    // alert(v)
    // setInterval(function(){

    // }, 1000);
}

function processRedFba(isRed) {
    localStorage.setItem('isRedFba', isRed);
    // alert(isRed === true)
    if (isRed) {
        toastr.info('已设置FBA突显');
    } else {
        toastr.info('取消FBA突显');
    }
}

async function crawlingCurrentPage() {
}

let timerLists = []

function getListingsFromChrome() {
    let flagList = []
    // 获取站点
    let siteUrl = document.URL
    console.log('获取URL 。。。' + siteUrl)
    let amazonSite = /www.amazon.[com|co.uk|ca|fr|it|de|es|se|co.jp|ae|nl|tr|au]+/.exec(siteUrl)
    console.log('amazonSite...' + amazonSite)
    if (amazonSite != null) {
        amazonSite = amazonSite[0].replace('www.amazon.', '');
        amazonSite = amazonSite.replace('\/', '');
    }
    console.log('amazonSite: ' + amazonSite)

    let bodyHtml = $("body").html()
    let asinString = /"dimensionValuesDisplayData" : {.*}/.exec(bodyHtml)
    let asinJson;
    if (asinString == null) {
        let asin = /B0.{8}/.exec(siteUrl)
        if (asin === null) {
            alert('未获取到ASIN')
            return;
        }
        asinJson = {}
        asinJson[asin] = asin

    } else {
        asinString = asinString[0]
        asinJson = /{.*}/.exec(asinString)
        if (asinJson == null) {
            return;
        }
        // ASIN为键；变体模式为值，例如：{"B09QX37P91":["Natural-Square","150pcs-7.9inch"],"B09QXDGC7V":["Natural","100pcs-6.3inch"],"B09QWW7L4V":["White","150pcs-7.9inch"],"B09QX9X6J7":["White-Square","50pcs-7.9inch"],"B09QX92GQX":["Natural","50pcs-6.3inch"],"B09QWY1CHB":["White","50pcs-6.3inch"],"B09QXGB5J9":["White-Square","100pcs-7.9inch"],"B09QX5WM78":["Natural","100pcs-7.9inch"],"B09QX6N8ST":["White","100pcs-6.3inch"],"B09QX94PTZ":["Natural","50pcs-7.9inch"],"B09QX362R7":["White","150pcs-6.3inch"],"B09QX7RS87":["Natural","200pcs-7.9inch"],"B09QWY74RS":["Natural","150pcs-6.3inch"],"B09QX57DFR":["White","200pcs-7.9inch"],"B09QX8TY1X":["Natural-Square","50pcs-7.9inch"],"B09QX93PNG":["White","100pcs-7.9inch"],"B09QXK3W1M":["Natural-Square","100pcs-7.9inch"],"B09QWQKW9B":["Natural","200pcs-6.3inch"],"B09QX1G76G":["White","50pcs-7.9inch"]}
        asinJson = JSON.parse(asinJson[0])
    }


    let asinKeys = Object.keys(asinJson)
    for (let i = 0; i < asinKeys.length; i++) {
        // key为ASIN，值为变量名
        let biantiName = asinJson[asinKeys[i]]
        //alert()
        console.log('=======================')

        $.ajax({
            type: "GET",
            url: "https://www.amazon." + amazonSite + "/dp/" + asinKeys[i] + "?psc=1",
            success: function (data) {
                $.ajax({
                    type: "POST",
                    url: submitHtmlUrl,
                    data: {data: data, site: amazonSite, asin: asinKeys[i]},
                    contentType: "application/x-www-form-urlencoded;charset=utf-8",
                    success: function (data) {
                        flagList.push(asinKeys[i])
                    },
                    error: function (err) {
                        console.log(err)
                    }
                });
            },
            error: function (err) {
                console.log(err)
            }
        });
        //break;
        let timer = setInterval(function () {
            if (asinKeys.length === flagList.length) {
                for (let i = 0; i < timerLists.length; i++) {
                    clearInterval(timerLists[i])
                }
                alert('爬虫完毕');
            } else {
                console.log('正在采集信息。。。')
            }
        }, 1000)
        timerLists.push(timer)
    }
}

async function uploadCurrentAsins() {
    //alert();
    let a = document.querySelectorAll('body')
    //let a = $('body')
    let b = a[0].innerHTML
    let res = b.indexOf('50 Pcs Kids Disposable_Face_Masks')
    var reg = new RegExp(/"dimensionValuesDisplayData" : {.*}/)
    res = reg.exec(b)
    let aa = ''
    //alert('=====' + res + typeof res + (res !== null && reg !== ''))
    if (res !== null && res !== '' && res !== undefined) {
        res = res[0]
        //alert('=====2========'+res)
        var reg2 = new RegExp(/{.*}/)

        var res2 = reg2.exec(res)[0]
        var obj = JSON.parse(res2)
        //alert(res2)
        //console.log(robj)
        let rrrr = Object.keys(obj)
        console.log(rrrr);
        for (let iii = 0; iii < rrrr.length; iii++) {
            console.log(rrrr[iii])
        }

        var obj_arr = Object.keys(obj)
        let bb = ''
        obj_arr.forEach((e) => {
            bb += e + '\n'
            aa += e + ' '
        })
        var aaa = aa + '\n\n\n' + bb + '\n\n\n\n\n\n\n\n\n'

    }

    var site = window.location.href
    var site_ = site
    site = new RegExp(/\.amazon\..+?\//i).exec(site)
    //alert(site)
    if (site != null && site != '' && site != undefined) {
        site = site[0].replaceAll('\.amazon', '').replaceAll('\/', '')
    } else {
        alert('出错！')
    }
    //alert(site)

    if (aa == '' || aa == null || aa == undefined) {
        aa = new RegExp(/B0.{8}/).exec(site_)[0]
        //alert(aa)
    }

    // 上传到服务器
    var formData = new FormData();
    formData.append("asins", aa)
    formData.append("site", site)
    jQuery.support.cors = true;

    function resolve() {
        if (data === 'error') {
            toastr.error("获取变体失败，上传失败")
        } else {
            toastr.success("全部变体ASIN上传成功！")
        }
    }

    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            url: addAsinToServerUrl,
            data: {asins: aa, site: site},
            contentType: "application/x-www-form-urlencoded;charset=utf-8",
            success: function (data) {
                resolve(data);
                getListingsFromChrome();
                alert('成功上传ASIN信息，点击确定开始采集Listing！')
            },
            error: function (err) {
                //
                console.log(err)
                resolve("error")
                // alert(err)
            }
        });
    })
}

async function getSellerAllAsins() {
// 	alert()
    toastr.info('开始')

    $.ajax({
        type: "GET",
        url: "https://www.amazon.fr/s?i=merchant-items&me=A3USG5B4TCNFER&page=4&marketplaceID=A13V1IB3VIYZZH&qid=1646916993&ref=sr_pg_4",
        success: function (data) {
            console.log(data)
            resolve(data);
        },
        error: function (err) {
            console.log(err)
            resolve("error")
        }
    });
}

// 下载SKU-ASIN脚本，在Amazon后台管理中使用
async function downloadSku() {
    var skus = crawlingSku();
    downloadTxt(skus[0], "SKU-ASIN-PRICE" + getDate() + '.txt');
    toastr.info('即将下载，请注意保存文件！');
}

// 在Amazon后台，下载DELETE库存家在工具文件
async function copySku() {

    // toastr.success('yes')
    try {
        var skus = crawlingSku();
        copyTextToClipboard(skus[1]);
        toastr.success('已将本页SKU复制到剪切板');
        let pureSkus = skus[1].trim().split(/[\s\n]/)

        fileText = 'seller-sku\tadd-delete\n'
        for (let i = 0; i < pureSkus.length; i++) {
            fileText += (pureSkus[i] + '\tx\n')
        }
        fileText = fileText.trim()
        downloadTxt(fileText, 'DELETE-' + getDate() + '.txt')
// 		alert(fileText)
    } catch (e) {
        toastr.error('复制SKU失败！')
    }
}

async function inviteFeedback() {
}

function linkTo(link = undefined) {
    //alert()
    var a_ = document.createElement("a");
    document.body.appendChild(a_);
    a_.href = link
    a_.target = '_blank'; //指定在新窗口打开
    setTimeout(function (A) {
        A.click()
    }, 800, a_)
}


// JS小爬虫，将Amazon后台的SKU和ASIN爬取下来
/*
{"date":"08/07/2021 05:00:06","parent":"0","image":"https://m.media-amazon.com/images/I/41W1nm0m5ES._SS60_.jpg","quantity":"200","isGuild":"false","title":"通用 Shorts for Women with Pocket ?Workout Yoga Running Walking Riding?Fashion Shorts for Gym Exercise (Green, 6-8)","sales_rank":"-","date-status-changed":"08/07/2021 05:00:20","shipping_template":"legacy-template-id","decimalSeperator":".","price":"9.99","asin":"B098XDKXC1","sku":"20210708GN01S","productType":"SHORTS","status":"20","escapedSku":"20210708GN01S"}
 */
function crawlingSku() {
    let a = document.querySelectorAll('#myitable > div.mt-content.clearfix > div > table tr');
    let b = a[1].getAttribute('data-row-data');
    b = JSON.parse(b);
    let asins = ''
    let aa = '';
    let skus = '';
    let count = a.length
    for (let i = 0; i < a.length; i++) {
        b = a[i].getAttribute('data-row-data');
        if (b) {
            b = JSON.parse(b);
            aa += b.sku + '\t' + (b.upcOrEan === 'undefined' ? b.upcOrEan:b.asin) + '\t' + b.price + '\n';
            skus += (b.sku + '\n');
            asins += ((b.upcOrEan === 'undefined' ? b.upcOrEan:b.asin) + '\n')
        }

    }
    return ["===============SKU-ASIN-PRICE("+count+"条)=============\n" + aa + '\n================================\n\n' +
    '===================SKU List('+count+'条)============\n' + skus + '\n================================\n\n' +
    '========================ASIN List=('+count+'条)============\n' + asins, skus];
}

// 生成年月日字符串
function getDate() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentDate = date.getFullYear() + '年' + month + '月' + strDate + '日';
    return currentDate;
}

// 复制字符串到剪切板
function copyTextToClipboard(text) {
    if (navigator.clipboard) {
        // clipboard api 复制
        navigator.clipboard.writeText(text);
    } else {
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        // 隐藏此输入框
        textarea.style.position = 'fixed';
        textarea.style.clip = 'rect(0 0 0 0)';
        textarea.style.top = '10px';
        // 赋值
        textarea.value = text;
        // 选中
        textarea.select();
        // 复制
        document.execCommand('copy', true);
        // 移除输入框
        document.body.removeChild(textarea);
    }
}


// JS下载文件
function downloadTxt(text, fileName) {
    let element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', fileName)
    element.style.display = 'none'
    element.click()
}

// 创建开始按钮
function createStartButton() {
    let base = document.createElement("div");
    try {
        // alert(myCSSUrl)
        appendMyJSOrCSS_(myCSSUrl, true)
    } catch (e) {
        alert('==引入CSS报错==' + e)
    }
    appendMyJSOrCSS_(toastrCsssUrl)
    appendMyJSOrCSS_(toastrJsUrl)

    // alert('10010');
    let body = document.getElementsByTagName("body")[0];
    var baseInfo = "";
    // alert(88899)
    baseInfo +=
        "<form id=\"settingData\"class=\"egg_menu\"action=\"\"target=\"_blank\"onsubmit=\"return false\"><div class=\"egg_setting_box\"><div class=\"egg_setting_item\"><label>采集本页</label><input class=\"egg_setting_switch\"type=\"checkbox\"name=\"optionSelection\"value=\"采集本页\"/></div><div class=\"egg_setting_item\"><label>店铺ASIN</label><input class=\"egg_setting_switch\"type=\"checkbox\"name=\"optionSelection\"value=\"所有ASIN\"/></div><div class=\"egg_setting_item\"><label>本页ASIN</label><input class=\"egg_setting_switch\"type=\"checkbox\"name=\"optionSelection\"value=\"本条ASIN\"/></div><div class=\"egg_setting_item\"><label>下载SKU</label><input class=\"egg_setting_switch\"type=\"checkbox\"name=\"optionSelection\"value=\"下载SKU\"/></div><div class=\"egg_setting_item\"><label>复制SKU</label><input class=\"egg_setting_switch\"type=\"checkbox\"name=\"optionSelection\"value=\"复制SKU\"/></div><div class=\"egg_setting_item\"><label>邀请评论</label><input class=\"egg_setting_switch\"type=\"checkbox\"name=\"optionSelection\"value=\"邀请评论\"/></div><div class=\"egg_setting_item\"><label>自动提款</label><input class=\"egg_setting_switch\"type=\"checkbox\"name=\"optionSelection\"value=\"自动提款\"/></div><hr/><div class=\"egg_setting_item\"><label>突显FBA</label><input class=\"egg_setting_switch\"type=\"checkbox\"name=\"optionSelection\"value=\"突显FBA\"/></div></div></div></form><button class=\"side_btn\"onclick=\"isShowMenu()\">&lt;</button>";
    base.innerHTML = baseInfo;
    body.append(base)

    let startButton = document.createElement("button");
    startButton.setAttribute("id", "startButton");
    startButton.innerText = "开始操作";
    startButton.className = "egg_study_btn egg_menu";
    //添加事件监听
    try { // Chrome、FireFox、Opera、Safari、IE9.0及其以上版本
        startButton.addEventListener("click", start, false);
    } catch (e) {
        try { // IE8.0及其以下版本
            startButton.attachEvent('onclick', start);
        } catch (e) { // 早期浏览器
            alert('浏览器版本太旧，无法正常运行！')
        }
    }
    //插入节点
    body.append(startButton);
    showMenu();

};

// 判定是否显示目录
function isShowMenu() {
    let items = document.getElementsByClassName("side_btn");
    // alert(items[0].innerHTML)
    if (items[0].innerHTML === '&lt;') {
        showMenu(true)
        items[0].innerHTML = '>'
    } else {
        showMenu(false)
        items[0].innerHTML = '<'
    }
}


//是否显示目录
function showMenu(isShow = false) {
    let items = document.getElementsByClassName("egg_menu");
    for (let i = 0; i < items.length; i++) {
        items[i].style.display = isShow ? "block" : "none";
    }
}

// 加载脚本初始化操作
function initApp() {
    // 判断是否有常开选项
    var isRedFba = localStorage.getItem('isRedFba') // 是否突显FBA
    // alert(isRedFba)
// 	alert($)
    settings.isRedFba = isRedFba
    if (isRedFba === 'true') {
        var checkInterval = setInterval(function () {
            ReddingFbaItems();
            clearInterval(checkInterval)
        }, 1200)

    }
}

// 脚本主入口
function main__() {
    // alert(111)
    let domain = document.domain;
    if (/amazon\./g.exec(domain) === null) {
        return
    }
    appendMyJSOrCSS_(jqueryJsUrl)
    // 如果是亚马逊的内容，则继续运行
    initApp();
// 	alert(settings.isRedFba)
    createStartButton();
};

main__();
