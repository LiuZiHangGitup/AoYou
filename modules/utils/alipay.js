var fs= require("fs");
var path = require("path"); 
var crypto = require("crypto");
var request = require("request");
var Config = require('../config.js')
module.exports = function(biz_content,callback){
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
// 请求公共参数
var options = {
    app_id:Config.app_id,
    method:"alipay.trade.wap.pay",
    charset:"utf-8",
    sign_type:"RSA2",
    version:"1.0",
    timestamp:new Date().format("yyyy-MM-dd hh:mm:ss"),
    notify_url:Config.href+"pay/notify_url",
    return_url:Config.href+"pay/return_url",
    biz_content:JSON.stringify(biz_content)
}
// 解析参数，形成待签名字符串
function sortParams(options){
    var unencodeArr = [];
    var encodeArr = []
    for(var key in options){
        unencodeArr.push(key+"="+options[key])
        encodeArr.push(key+"="+encodeURIComponent(options[key]))
    }
    unencodeArr.sort();
    encodeArr.sort();
    var unencodeStr = unencodeArr.join("&");
    var encodeStr = encodeArr.join("&");
    return {
        unencodeStr:unencodeStr,
        encodeStr:encodeStr
    }
}
// 获取私钥
var privateKey = fs.readFileSync(path.resolve(__dirname,"../../pem/alipay_private_key.pem"),"ascii")
// 生成签名
var sign = crypto
            .createSign("RSA-SHA256")
            .update(sortParams(options).unencodeStr,"utf-8")
            .sign(privateKey,"base64");
var url = "https://openapi.alipay.com/gateway.do?"+ sortParams(options).encodeStr+"&sign="+encodeURIComponent(sign);
request.post({
        url:url, 
        form: {}
    },function(err,response,body){ 
        callback(response.caseless.dict.location)
    })
}

