function requestUrl(url, callback) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function process(html) {
    var dom = parseToDOM(html);
    var contests = $(dom).find('.stat').find('tr :gt(1)');
    var lastTime = localStorage.getItem('lastTime');
    for (var i=0; i<Math.min(3, contests.length); i++) {
        var ct = contests[i];
        var a = $(ct).find('a')[0];
        var time = $.trim(ct.children[6].innerHTML);
        var contestInfo = {
            des: $.trim(a.innerHTML),
            url: a.href,
            price: $.trim(ct.children[3].innerHTML),
            time: {
                year: time.substr(6,4),
                month: time.substr(0,2),
                day: time.substr(3,2),
                hour: time.substr(14,2),
                minute: time.substr(17,2)
            }
        }
        if (isNew(contestInfo.time, lastTime)){
            notifyContestInfo(contestInfo);
            if (i == 0) localStorage.setItem('lastTime', JSON.stringify(contestInfo.time));
     //       $.delay(100);
        }
        else break;
    }
}

// 判断时间是否为新
function isNew(time, lastTime) {
    if (lastTime == null) {
        return true;
    } else {
        lastTime = JSON.parse(lastTime);
        var t = ['year', 'month', 'day', 'hour', 'minute'];
        var i = 0;
        while (i< 5 && time[t[i]] == lastTime[t[i]]) i++;
        if (i < 5 && time[t[i]] > lastTime[t[i]]) return true;
        else return false;
    }
}
function notifyContestInfo(contestInfo){
    var notification = webkitNotifications.createNotification(
        'img/icon.png',  // icon url - can be relative
        contestInfo.price,  // notification title
        contestInfo.des
    );
    notification.show();
}



function notifyContestInfo2(contestInfo){
    var notifUrl = chrome.extension.getURL('background.html');
    // Look through all the pages in this extension to find one we can use.
    var views = chrome.extension.getViews();
    $('#log')[0].innerHTML=notifUrl+'\n'+views[0].location.href;

    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        // If this view has the right URL and hasn't been used yet...
        if (view.location.href == notifUrl) {
            view.document.getElementById('content').href = contestInfo.url;
            view.document.getElementById('content').innerHTML = contestInfo.des;
            view.document.getElementById('title').innerHTML = '<b>'+contestInfo.price+'</b>';
            var notification = webkitNotifications.createHTMLNotification(
                  'background.html'  // html url - can be relative
            );
            notification.show();
            break;
        }
    }

}

function parseToDOM(str){
   var div = document.createElement("div");
   if(typeof str == "string")
       div.innerHTML = str;
   return div.childNodes;
}
function start() {
    var url = 'http://community.topcoder.com/tc?module=ViewActiveBugRaces';
    while(true) {
        requestUrl(url, process);
        $.delay(1000);
    }
}

(function($){
		$(document).ready(function(){
		        localStorage.clear();
		        start();
		});
})(jQuery);
