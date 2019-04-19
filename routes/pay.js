var express = require('express');
const fs = require('fs');
var router = express.Router();
// 玩家充值操作
var alipay = require("../modules/utils/alipay")
var Pay = require('../modules/runtimes/pay.js')
var musicUser = require('../modules/businessLogic/musicuser.js')

Pay.indexPay()

router.post("/webhook",function(req,res,next){
    console.log("get App go Shop Request")
    console.log("===================================")
    Pay.newPay(req.body,function(data){
        res.send(data)
    })
    console.log("===================================")
})

//充值请求
router.post("/",function(req,res){
    console.log(req.body)
    var amount = ""+req.body.num;
    // var uid = ""+req.body.uid;uid
    var outTradeNo = "alipay"+String(new Date().getTime())+"x"+new Date().getTime()+"x"+amount
    var biz_content = {  
        subject: "黄金寨音乐会",
        out_trade_no: outTradeNo,
        total_amount: amount,
        product_code: 'QUICK_WAP_WAY',
    }
    // paylist 创建支付记录，默认状态为false
    Pay.createOne({
        uid:1002,
        bill_fee:req.body.num,
        paycode:outTradeNo,
        time:new Date().getTime()
    },function(resData){
        if(resData.code === 1){
            musicUser.createNewUser({
                username:req.body.username,
                phone:Number(req.body.phone)
            },function(datas){
                console.log(datas)
                if(datas.code == 1){
                    // 向请求支付宝发送订单参数，得到支付地址，返回给前端
                    alipay(biz_content,function(url){
                        res.json({code:1,msg:"支付请求成功",url:url,data:resData})
                    });
                }else{
                    res.json({code:0,msg:'网络错误'});
                }
            })
           
        }   
    })
});

//充值成功的回调网址
router.get("/return_url",function(req,res){
    res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});
    if(req.query.total_amount == 88){
        fs.readFile('./../public/html/music/index.html',{},function(err,data){
            if(err){
                res.send('网络错误');
                return;
            }else{
                res.write(data);
                res.end();
                return;
            }
        })
    }else if(req.query.total_amount == 176){
        fs.readFile('./../public/html/music/indexSecond.html',{},function(err,data){
            if(err){
                res.send('网络错误');
                return;
            }else{
                res.write(data);
                res.end();
                return;
            }
        })
    }else if(req.query.total_amount == 264){
        fs.readFile('./../public/html/music/indexThird.html',{},function(err,data){
            if(err){
                res.send('网络错误');
                return;
            }else{
                res.write(data);
                res.end();
                return;
            }
        })
    }
})


router.post("/notify_url",function(req,res){
	console.log("服务器通知参数notify_url===",req.body);
	//响应
	res.send('success')
	console.log(red.body)
	if(req.body.trade_status == 'TRADE_SUCCESS'){
		//收到的回调信息
		var out_trade_no = req.body.out_trade_no;
		// 玩家的uid
        var uid = out_trade_no.split("x")[1];
        // 玩家的充值金额
        var num = out_trade_no.split("x")[2];
        // 玩家的支付订单号
        var paycode = req.body.out_trade_no;

        //后续的逻辑
	}
})













module.exports = router;