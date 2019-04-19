var Config = {};
var crypto = require('crypto')

Config.db = require('./db.js')
Config.mongoose = require('mongoose')

//app最新版本
Config.androidVersion = '1.0.12'
Config.iosVersion = '1.0.12'

//是否允许重复用户名
Config.canSameNickName = false;
//起始用户ID 原始0
Config.startUid = 3222;
//短信验证码路径配置 [phone] [code]
Config.phoneCodeRequest = 'http://v.juhe.cn/sms/send?mobile=[phone]&tpl_id=113866&tpl_value=[code]&dtype=json&key=7f4d0613f0e023babf3dde2a2117bfc6'
    //短信验证码失效时间 0为不失效
Config.phoneCodeInvalid = 0;
//普通返佣机制  数据对应几级返 以及 每级返多少
Config.ordinaryRule = [0.1, 0.05];
//机构返佣机制	  数据对应机构无限返佣比例   数组中有几组数据 表示分为几种等级的机构 以及每级机构获得的返佣比例
Config.seniorRule = [0.02, 0.02];
Config.videoRule = [0.28, 0.28];
Config.zlhzRule = [0.15, 0.15];
//每日任务限量 依次是基础用户  普通会员 高级会员
Config.jobRule = [5, 5, 5, 5, 5, 5];

//任务等级佣金
Config.reward = [0.2, 0.4, 2, 4, 8, 20];


//游戏道具数据 
//type 1 => 消耗品
//type 2 => 道具
//type 3 => 静态物品

Config.goods = {
    // code索引
    '1': { code: 1, type: 1, name: "test1", explain: "this is a goods explain" }
}


//充值相关配置
Config.app_id = "2017081208153470"
Config.href = 'http://www.taolejin.cn/'


//方法类

//时间戳转换
Config.timeInit = function(time, callback) {
    var now = new Date(time);
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
    var minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    var second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
    var Time = month + "/" + date + " " + hour + ":" + minute + ":" + second;
    callback(Time);
}

//md5加密类
Config.toMd5 = function(str) {
    var md5 = crypto.createHash('md5');
    return md5.update(str).digest('hex');
}


module.exports = Config;