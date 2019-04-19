var app = {};
var request = require('request');
var Config = require('../config.js');
var Users = require('../runtimes/users.js');
var phoneCode = require('../runtimes/phoneCode.js');
var Job = require('./job.js');
var Log = require('../runtimes/logs.js');
var Cash = require('../runtimes/cash.js');
var Card = require('../runtimes/userCards.js');
var Relation = require('../runtimes/relation.js');
var News = require('./news.js');
var Userjob = require('./userJobList.js');
var Shop = require('../runtimes/shop.js');
var Market = require('./market.js');
var Car = require('./marketCar.js');
var Order = require('./userOrder.js');
var Video = require('./video.js');
var Zlhz = require('./zlhz.js');
var ddzGarde = require('./ddzGrade.js');
var datas = require('./datas.js');
var xiaoBeiKeOrder = require('./xiaoBeiKeOrder.js');
var userInformation = require('./userInformation.js');
var ZiYuanQuanOrder = require('./ziYuanQuanOrder.js');
var YlhCar = require('./ylhCar.js');
var YlhOrder = require('./ylhOrder.js');
var MarketExamine = require('./marketExamine.js');
var UserMusic = require('./userMusic.js');

// 商家下架单个商品
app.downOneGood = function(params,callback){
	Market.downOneGood(params,function(data){
		callback(data);
	})
}

// 修改单个商品信息
app.updateOneGoods = function(params,callback){
	Market.updateOneGoods(params,function(data){
		callback(data);
	})
}

// 获取商家所属商品
app.findBosGoods = function(params,callback){
	Market.findBosGoods(params,function(data){
		callback(data);
	})
}

// 查询商家个人订单
app.findBosOrder = function(params,callback){
	Order.findBosOrder(params,function(data){
		callback(data);
	})
}

// 查询用户所拥有音乐会门票
app.findOneUserMenPiao = function(params,callback){
	UserMusic.findOneUserMenPiao(params,function(data){
		callback(data);
	})
}

// 查看用户是否可购买门票
app.findUserCanBuy = function(params,callback){
	UserMusic.findUserCanBuy(params,function(data){
		callback({data});
	})
}

// 商家上传商品
app.newGood = function(params,callback){
	Market.newGood(params,function(data){
		callback(data);
	})
}

// 查询用户是否可入驻商城
app.findUserCanRuZhu = function(params,callback){
	MarketExamine.findUserCanRuZhu(params,function(data){
		callback(data);
	})
}

// 用户上传商城身份认证
app.createMarketExamine = function(params,callback){
	MarketExamine.createMarketExamine(params,function(data){
		callback({data});
	})
}

// 易廉惠每天返现
app.dayYlhFanXian = function(params,callback){
	Users.dayYlhFanXian(params,function(data){
		callback(data);
	})
}

// 重置当天小倍壳可卖出数量
app.clearTodaySellBeike = function(params,callback){
	Users.clearTodaySellBeike(params,function(data){
		callback(data);
	})
}

// 易廉惠查询购买商品所需总钱数
app.findYlhPrice = function(params,callback){
	Zlhz.findYlhPrice(params,function(data){
		callback(data);
	})
}

// 易廉惠删除购物车
app.delYlhCar = function(params,callback){
	YlhCar.delYlhCar(params,function(data){
		callback(data);
	})
}

// app获取订单
app.findYlhOrder = function(params,callback){
	YlhOrder.findAppYlhOrder(params,function(data){
		callback(data);
	})
}

// 获取小倍壳轮播图
app.findBeiKeBanner = function(params,callback){
	datas.findBeiKeBanner(params,function(data){
		callback(data);
	})
}

// 易廉惠获取购物车
app.getYlhCar = function(params,callback){
	YlhCar.getYlhCar(params,function(data){
		callback(data);
	})
}

// 易廉惠添加购物车
app.addYlhCar = function(params,callback){
	YlhCar.addYlhCar(params,function(data){
		callback(data);
	})
}

// 查询对应的战略合作商品个数(为分页做铺垫)
app.findZlhzCount = function(params,callback){
	Zlhz.findZlhzCount(params,function(data){
		callback(data);
	})
}

// 资源圈查询我的人脉
app.findUserRenMai = function(params,callback){
	ZiYuanQuanOrder.findUserRenMai(params,function(data){
		callback(data);
	})
}

// 卖家确认订单
app.goSuccessZyqOrder = function(params,callback){
	ZiYuanQuanOrder.goSuccessZyqOrder(params,function(data){
		callback(data);
	})
}
// 提交用户资源圈截图
app.uploadZyqOrders = function(params,callback){
	ZiYuanQuanOrder.uploadZyqOrders(params,function(data){
		callback(data)
	})
}

// 获取用户待确认订单的对方信息
app.findDaiQueRenOrder = function(params,callback){
	ZiYuanQuanOrder.findDaiQueRenOrder(params,function(data){
		callback(data);
	})
}

// 获取用户所有资源圈订单
app.getUserAllZiYuanQuanOrders = function(params,callback){
	ZiYuanQuanOrder.findUserAllOrders(params,function(data){
		callback(data);
	})
}

// 资源圈卖出小倍壳 
app.createZiYuanQuanOrderSell = function(params,callback){
	ZiYuanQuanOrder.createOrderSell(params,function(data){
		callback(data);
	})
}

// 判断是否为国士无双
app.ifGuoShiWuShuang = function(params,callback){
	Users.userDdzgrade(params,function(data){
		callback(data)
	})
}

// 资源圈买入小倍壳
app.createZiYuanQuanOrderBuy = function(params,callback){
	ZiYuanQuanOrder.createOrderBuy(params,function(data){
		callback(data);
	})
}

// 查看用户是否提交个人信息
app.userIfGoInformation = function(params,callback){
	Users.ifInfomation(params,function(data){
		callback(data);
	})
}

// 创建个人信息
app.createUserInformation = function(params,callback){
	userInformation.createUser(params,function(data){
		callback(data);
	})
}

// 查询K线图数据
app.showKXianTu = function(params,callback){
	xiaoBeiKeOrder.showKXianTu(params,function(data){
		callback(data);
	})
}

// 订单二次兑换
app.pushJiFen = function(params,callback){
	Users.pushJiFen(params,function(data){
		callback(data);
	})
}

// 购买单个订单
app.buyOneXiaoBeiKeOrder = function(params,callback){
	Users.buyOneXiaoBeiKeOrder(params,function(data){
		callback(data)
	})
}

// 查询所有未卖出订单
app.findAllPutOrder = function(params,callback){
	xiaoBeiKeOrder.findAllPutOrder(params,function(data){
		callback(data);	
	})
}

// 比较卖出价
app.compareUpDown = function(params,callback){
	datas.compareUpDown(params,function(data){
		callback(data);
	})
}

// 卖出小倍壳
app.putXiaoBeiKe = function(params,callback){
	Users.putXiaoBeiKe(params,function(data){
		callback(data);
	})
}

// 购买小倍壳
app.buyXiaoBeiKe = function(params,callback){
	Users.buyXiaoBeiKe(params,function(data){
		callback(data);
	})
}

// 查询用户拥有贝壳数量
app.findUserHaveBeiKe = function(params,callback){
	Users.findUserHaveBeiKe(params,function(data){
		callback(data);
	})
}

// 查询开盘价
app.findBeiKeJia = function(req,callback){
	datas.findBeiKeJia(req,function(data){
		callback(data);
	})
}

// 判断用户升级后到多少级
app.findUpDdzGarde = function(req,callback){
	ddzGarde.findUpDdzGarde(req,function(data){
		callback({data})
	})
}

// 查询用户当前斗地主等级
app.nowDdzGrade = function(req,callback){
	Users.nowDdzGrade(req,function(data){
		callback(data);
	})
}

// 查询此用户一共推广了多少人
app.findAllTuiGuang = function(req,callback){
	Users.findAllTuiGuang(req,function(data){
		callback(data)
	})
}

// 判断此用户是否为svip
app.ifJGVip = function(req,callback){
	Relation.ifLvVip(req,function(data){
		callback(data);
	})
}

// 修改战略合作协议状态
app.changeZlhz = function(req,callback){
	Users.changeZlhzShu(req,function(data){
		callback(data);
	})
}

// 是否显示战略合作协议
app.ifShowZlhz = function(req,callback){
	Users.zlhzShu(req,function(data){
		callback(data);
	})
}

// 查询所有可观看的项目
app.getAllCanShowXm = function(req,callback){
	Zlhz.findAllCanShowXm(req,function(data){
		callback(data)
	})
}
// 查询是否可观看视频接口
app.ifCanShowThisVideo = function(req,callback){
	Users.showThisVideo(req,function(data){
		callback(data);
	})
}

// 查询是否可观看视频接口
app.ifCanShowVideo = function(req,callback){
	Users.canShowVideo(req,function(data){
		callback(data);
	})
}

// 登陆接口

app.getAllCanShow = function(req,callback){
	Video.findAllCanShow(req,function(data){
		callback(data)
	})
}

app.login = function(req,callback){
	Users.login(req,function(data){
		callback(data)
	})
}

// 注册接口
app.reg = function(req,callback){
	Users.register(req,function(data){
		callback(data)
	})
}

// 获取验证码接口
app.getCode = function(req,callback){
	phoneCode.getCode(req.phone,function(data){
		callback(data)
	})
}

// 获取任务接口
app.getJobs = function(res,callback){
	Job.getJob(res,function(data){
		callback(data)
	})
}

// //执行任务接口
app.doneJob = function(res,callback){
	Job.doneJob(res,function(data){
		callback(data)
	})
}

//用户身份校验
app.check = function(req,callback){
	Users.check(req,function(data){
		callback(data)
	})
}

// 获取日志
app.getLogs = function(req,callback){
	Log.findLog(req,function(data){
		callback(data)
	})
}

// 重新获取自己的数据
app.newMyData = function(req,callback){
	Users.newMyData(req,function(data){
		callback(data)
	})
}


app.getCash = function(req,callback){
	User.getCash(req,function(data){
		callback(data)
	})
}

// 获取记录
app.cashLog = function(req,callback){
	Cash.cashLogs(req,function(data){
		callback(data)
	})
}

app.toCash = function(req,callback){
	Cash.newCash(req,function(data){
		callback(data)
	})
}

app.getCard = function(req,callback){
	Card.getCard(req,function(data){
		callback(data)
	})
}

app.updateCard = function(req,callback){
	Card.updateCard(req,function(data){
		callback(data)
	})
}

app.getKid = function(req,callback){
	Relation.findChildren(req,function(data){
		callback(data)
	})
}

app.getNews = function(req,callback){
	News.getNews(function(data){
		callback(data)
	})
}

app.update = function(req,callback){
	Job.updateJob(req,function(data){
		callback(data)
	})
}

// 获取我的任务
app.getMyJob = function(req,callback){
	Userjob.getMyJob(req,function(data){
		callback(data)
	})
}

app.upScreen = function(req,callback){
	Userjob.updateImg(req,function(data){
		callback(data)
	})
}

// 修改密码
app.changePwd = function(req,callback){
	Users.changePwd(req,function(data){
		callback(data)
	})
}	

app.getVipPrice = function(req,callback){
	Shop.getThing(function(data){
		callback(data)
	})
}

// 注册会员
app.toBeVip = function(req,callback){
	Shop.toBeVip(req,function(data){
		callback(data)
	})
}

// 查询商城列表总条数
app.getMarketCount = function(req,callback){
	Market.findMarketCount(req,function(data){
		callback(data);
	});
}

// 获取商品
app.getGood = function(req,callback){
	Market.admGetGood(req,function(data){
		callback(data)
	})
}

//查询商品积分金币/积分+金币
app.findPriceScore = function(req,callback){
	Market.findPriceScore(req,function(data){
		callback(data)
	})
} 


//购买商品
app.buyGoods = function(req,callback){
	Market.buyGoods(req,function(data){
		callback(data)
	})
}

// 获取订单
app.getOrder = function(req,callback){
	Order.getOrder(req,function(data){
		callback(data)
	})
}

// 购物车购买
app.buyCar = function(req,callback){
	Market.buyCar(req,function(data){
		callback(data)
	})
}

// 添加购物车
app.addCar = function(req,callback){
	Car.addCar(req,function(data){
		callback(data)
	})
}

app.cutCar = function(req,callback){
	Car.cutCar(req,function(data){
		callback(data)
	})
}

// 获取购物车
app.getCar = function(req,callback){
	Car.getCar(req,function(data){
		callback(data)
	})
}

// 删除购物车
app.delCar = function(req,callback){
	Car.delCar(req,function(data){
		callback(data)
	})
}

// 获取轮播图
app.getBanner = function(req,callback){
	Market.getBanner(req,function(data){
		callback(data)
	})
}

app.getNotice = function(req,callback){
	Market.getNotice(req,function(data){
		callback(data)
	})
}

app.getReward = function(req,callback){
	callback({code:1,data:Config.reward})
}

// 积分购买
app.buyGoodByScore = function(req,callback){
	Market.buyGoodByScore(req,function(data){
		callback(data)
	})
}

// 积分购买
app.pricePlusScore = function(req,callback){
	Market.pricePlusScore(req,function(data){
		callback(data)
	})
}

// 根据商品id查询商品详细信息
app.findGoodById = function(req,callback){
	Market.findGoodById(req,function(data){
		callback(data)
	})
}

module.exports = app