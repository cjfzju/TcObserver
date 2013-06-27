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
    var curTime;
    for (var i=0; i<contests.length; i++) {
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
        if (isNew(contestInfo.time)) notifyContestInfo(contestInfo);
        else break;
        if (i == 0) curTime = contestInfo.time;
    }
    if (i > 0) localStorage.setItem('lastTime', JSON.stringify(curTime));
}

// 判断时间是否为新
function isNew(time) {
    var lastTime = localStorage.getItem('lastTime');
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
//    $('#info')[0].innerHTML='good';
    var notification = webkitNotifications.createNotification(
        'img/icon.png',  // icon url - can be relative
        'new!',  // notification title
        contestInfo.des
    );
    notification.show();
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
		        if (!localStorage.getItem('lastTime')) {
		            time = {
                        year: 2013,
                        month: 06,
                        day: 26,
                        hour: 6,
                        minute: 54
                    };
                    localStorage.setItem('lastTime', JSON.stringify(time));
                }
		        start();
		});
})(jQuery);
