var admin = {};
var request = require('request');
var Admin = require('./admin.js');

var Job = require('../businessLogic/job.js');
var News = require('../businessLogic/news.js');
var Cash = require('../runtimes/cash.js');
var User = require('../runtimes/users.js');
var UserJob = require('../businessLogic/userJobList.js');
var Log = require('../runtimes/logs.js');
var Relation = require('../runtimes/relation.js');
var Market = require('../businessLogic/market.js');
var Video = require('../businessLogic/video.js');
var Zlhz = require('../businessLogic/zlhz.js');
var ZlhzOrders = require('../businessLogic/zlhzOrder.js');
var ddzGrade = require('../businessLogic/ddzGrade.js');
var datas = require('../businessLogic/datas.js');
var xiaoBeiKeOrder = require('../businessLogic/xiaoBeiKeOrder.js');
var UserInformation = require('../businessLogic/userInformation.js');
var ZiYuanQuanOrder = require('../businessLogic/ziYuanQuanOrder.js');
var MarketExamine = require('../businessLogic/marketExamine.js');

// 审核单个商家信息
admin.updateOneExamine = function(params,callback){
	MarketExamine.updateOneExamine(params,function(data){
		callback(data);
	})
}

// 获取商家信息总条数
admin.getCountMarketExamine = function(params,callback){
	MarketExamine.getCountMarketExamine(params,function(data){
		callback(data);
	})
}

// 获取商家信息
admin.findAllMarketExamine = function(params,callback){
	MarketExamine.findAllMarketExamine(params,function(data){
		callback(data);
	})
}

// 查询易廉惠返现
admin.findYlhFanXian = function(params,callback){
	datas.findYlhFanXian(params,function(data){
		callback({data});
	})
}

// 获取战略合作商品总条数
admin.findZlhzCount = function(params,callback){
	Zlhz.findZlhzCount(params,function(data){
		callback(data);
	})
}

// 获取资源圈订单
admin.findAdmOrder = function(params,callback){
	ZiYuanQuanOrder.findAdmOrder(params,function(data){
		callback(data);
	})
}

// 通过一条个人信息
admin.promiseOne = function(params,callback){
	UserInformation.promiseOne(params,function(data){
		callback(data);
	})
}

// 后台管理系统获取所有未审核的个人信息
admin.findAllUserInformation = function(params,callback){
	UserInformation.findAllUserInformation(params,function(data){
		callback(data);
	})
}

// 后台管理修改个人信息状态
admin.updateUserInformation = function(params,callback){
	User.updateUserInformation({params,function(data){
		callback(data);
	}})
}

// 后台管理K线图
admin.adminShowKXianTu = function(params,callback){
	xiaoBeiKeOrder.adminShowKXianTu(params,function(data){
		callback(data)
	})
}

// 查询开盘价收盘价
admin.findBeiKeJia = function(params,callback){
	datas.findBeiKeJia(params,function(data){
		callback(data);
	})
}

// 查询二次比例
admin.findErCi = function(params,callback){
	datas.findErCi(params,function(data){
		callback(data);
	})
}

// 查询小倍壳发行数量
admin.findShuLiang = function(params,callback){
	datas.findShuLiang(params,function(data){
		callback(data);
	})
}

// 修改小倍壳返佣
admin.upDatedatas = function(params,callback){
	datas.upDatedatas(params,function(data){
		callback(data);
	})
}

// 查询小倍壳返佣
admin.findFanYong = function(params,callback){
	datas.findFanYong(params,function(data){
		callback(data);
	})
}

// 添加新等级
admin.addOneGarde = function(params,callback){
	ddzGrade.addOneGarde(params,function(data){
		callback(data);
	})
}

// 修改单个等级信息
admin.changeOneGarde = function(req,callback){
	ddzGrade.changeOneGarde(req,function(data){
		callback(data);
	})
}

// 查询单个等级信息
admin.findOneGarde = function(req,callback){
	ddzGrade.findOneGarde(req,function(data){
		callback(data);
	})
}

// 查询所有级别
admin.findAllGarde = function(req,callback){
	ddzGrade.findAllGarde(req,function(data){
		callback(data);
	})
}

// 修改指定项目参数
admin.changeXm = function(req,callback){
	Zlhz.changeXm(req,function(data){
		callback({data});
	})
}

// 删除单个订单
admin.delZlhzOrder = function(req,callback){
	ZlhzOrders.delOnceOrder(req,function(data){
		callback(data)
	})
}

// 修改单个战略订单状态
admin.changeZlhzOrder = function(req,callback){
	ZlhzOrders.updateOnceOrder(req,function(data){
		callback(data);
	})
}

// 获取所有订单
admin.findAllOrders = function(req,callback){
	ZlhzOrders.findAllOrder(req,function(data){
		callback(data)
	})
}

// 下架单个项目
admin.delXm = function(req,callback){
	Zlhz.delXm(req,function(data){
		callback(data)
	})
}
// 查询所有可观看的项目
admin.getAllCanShowXm = function(req,callback){
	Zlhz.findAllCanShowXm(req,function(data){
		callback(data)
	})
}
// 上传项目
admin.newXm = function(req,callback){
	Zlhz.newXm(req,function(data){
		callback(data);
	})
}

// 查询任务总条数
admin.getCashCount = function(req,callback){
	Cash.getCashCount(req,function(data){
		callback(data)
	})
}

// 查询商城物品总条数
admin.marketCount = function(req,callback){
	Market.findAllMarketCount(req,function(data){
		callback(data);
	});
} 

admin.getTalk = function(callback){
	request('https://api.uixsj.cn/hitokoto/w.php',function(err,res,body){
		callback(body)
	})
}

// 下架单个视频
admin.downVideo = function(req,callback){
	console.log("aaaa=====",req)
	Video.downVideo(req,function(data){
		callback(data)
	})
}

// 获取全部视频
admin.getAllCanShowVideos = function(req,callback){
	Video.findAllCanShow(req,function(data){
		callback(data)
	})
}

admin.adminLogin = function(req,callback){
	Admin.login(req,function(data){
		callback(data)
	})
}

admin.newAdmin = function(req,callback){
	Admin.newAdmin(req,function(data){
		callback(data)
	})
}

admin.newJob = function(req,callback){
	Job.newJob(req,function(data){
		callback(data)
	})
}

admin.getJob = function(req,callback){
	Job.adminGetJob(req,function(data){
		callback(data)
	})
}

admin.delJob = function(req,callback){

	Job.delJob(req,function(data){
		callback(data)
	})
}

admin.getCashList = function(req,callback){
	Cash.getCashList(req,callback)
}


admin.passOrder = function(req,callback){
	Cash.passOrder(req,callback)
}

admin.getCarousel = function(req,callback){
	News.getNews(function(data){
		callback(data)
	})
}

admin.addCarousel = function(req,callback){
	News.addNews(req,function(data){
		callback(data)
	})
}

admin.cutCarousel = function(req,callback){
	News.cutNews(req,function(data){
		callback(data)
	})
}

admin.getUserCount = function(req,callback){
	User.getUsers(function(data){
		callback(data)
	})
}

admin.getUserList = function(req,callback){
	User.pageUsers(req.page,function(data){
		callback(data)
	})
}

//获取完成任务总量
admin.getOverJob = function(req,callback){
	UserJob.getCount(function(data){
		callback(data)
	})
}

admin.userLog = function(req,callback){
	Log.findLog({uid:req.uid,type:0},function(data){
		callback(data)
	})
}


//封号
admin.cutUser = function(req,callback){
	User.freezeUser(req,function(data){
		callback(data)
	})
}

//开机构
admin.setVip = function(req,callback){
	Relation.setVip(req,function(data){
		callback(data)
	})
}

//获取用户的VIP等级
admin.getUserVip = function(req,callback){
	Relation.getUserVip(req,function(data){
		callback(data)
	})
}

admin.getScreenCount = function(req,callback){
	UserJob.getScreenCount(req,function(data){
		console.log("任务查询data======",data)
		callback(data)
	})
}

//获取截图
admin.getScreen = function(req,callback){
	UserJob.getScreen(req,function(data){
		callback(data)
	})
}

admin.disJob = function(req,callback){
	UserJob.disJob(req,function(data){
		callback(data)
	})
}

//获取用户下级
admin.getKids = function(req,callback){
	Relation.findChildren(req,function(data){
		callback(data)
	})
}

// 用户支付
admin.userPay = function(req,callback){
	Admin.userPay(req,function(data){callback(data)})
}

admin.newNotice = function(req,callback){
	Admin.newNotice(req,function(data){callback(data)})
}

// 查询商城列表总条数
admin.getMarketCount = function(req,callback){
	Market.findMarketCount(req,function(data){
		callback(data);
	});
}

// 获取商品列表
admin.getMarket = function(req,callback){
	Market.admGetGood(req,function(data){callback(data)})
}

// 删除商品
admin.delGood = function(req,callback){
	Admin.delGood(req,function(data){callback(data)})
}

// 创建新商品
admin.newGood = function(req,callback){
	Admin.newGood(req,function(data){callback(data)})
}

// 创建新视频
admin.createNewVideo = function(req,callback){
	Video.createNewVideo(req,function(data){
		callback(data);
	})
}

admin.getOrder = function(req,callback){
	Admin.getOrder(req,function(data){callback(data)})
}

admin.changeOrder = function(req,callback){
	Admin.changeOrder(req,function(data){callback(data)})
}

admin.returnOrder = function(req,callback){
	Admin.returnOrder(req,function(data){callback(data)})
}

admin.delOrder = function(req,callback){
	Admin.delOrder(req,function(data){callback(data)})
}

admin.allin = function(req,callback){
	Admin.allin(function(data){callback(data)})
}





















admin.check = function(req,callback){
	Admin.check(req,function(data){
		callback(data)
	})
}

module.exports = admin