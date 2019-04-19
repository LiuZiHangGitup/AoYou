//方法测试位置
var phoneCode = require('./runtimes/phoneCode.js')
var Timer = require('./runtimes/timer.js')
var User = require('./runtimes/users.js')
var Log = require('./runtimes/logs.js')
var Relation = require('./runtimes/relation.js')
var Goods = require('./runtimes/goods.js')
var Wearhouse = require('./runtimes/wearhouse.js')
var Cash = require('./runtimes/cash.js')

var Apitest = {}
User.initToday()
new Timer('59 59 23 * * *',function(){
	User.initToday()
})

Apitest.getCode = function(res,callback){
	phoneCode.getCode(res.phone,function(data){
		callback('测试短信验证码'+JSON.stringify(data))
	})
}

Apitest.userReg = function(res,callback){
	User.register(res,function(data){
		callback('新用户注册'+JSON.stringify(data))
	})
}

Apitest.userLogin = function(res,callback){
	User.login(res,function(data){
		callback('用户登录'+JSON.stringify(data))
	})
}

Apitest.changePwd = function(res,callback){
	User.changePwd(res,function(data){
		callback('用户更改密码'+JSON.stringify(data))
	})
}

Apitest.changeRich = function(res,callback){
	User.changeRich(res,function(data){
		callback('用户增减金币'+JSON.stringify(data))
	})
}

Apitest.addLog = function(res,callback){
	Log.addLog(res,function(data){
		callback('用户增加日志'+JSON.stringify(data))
	})
}

Apitest.findLog = function(res,callback){
	Log.findLog(res,function(data){
		callback('用户查询日志'+JSON.stringify(data))
	})
}

Apitest.findChildren = function(res,callback){
	Relation.findChildren(res,function(data){
		callback('用户获取下级'+JSON.stringify(data))
	})
}

Apitest.ordinary = function(res,callback){
	Relation.ordinary(res,function(data){
		callback('用户普通返佣'+JSON.stringify(data))
	})
}

Apitest.senior = function(res,callback){
	Relation.senior(res,function(data){
		callback('用户VIP返佣'+JSON.stringify(data))
	})
}

Apitest.addGood = function(res,callback){
	Goods.addGood(res,function(data){
		callback('商品添加'+JSON.stringify(data))
	})
}

Apitest.getGood = function(res,callback){
	Goods.getGood(res,function(data){
		callback('商品获取'+JSON.stringify(data))
	})
}

Apitest.delGood = function(res,callback){
	Goods.delGood(res,function(data){
		callback('商品删除'+JSON.stringify(data))
	})
}

Apitest.updateGood = function(res,callback){
	Goods.updateGood(res,function(data){
		callback('商品更新'+JSON.stringify(data))
	})
}

Apitest.buyGood = function(res,callback){
	Goods.buyGood(res,function(data){
		callback('商品购买'+JSON.stringify(data))
	})
}

Apitest.getWh = function(res,callback){
	Wearhouse.getWh(res,function(data){
		callback('获取仓库'+JSON.stringify(data))
	})
}

Apitest.addSth = function(res,callback){
	Wearhouse.addSth(res,function(data){
		callback('仓库增加物品'+JSON.stringify(data))
	})
}

Apitest.cutSth = function(res,callback){
	Wearhouse.cutSth(res,function(data){
		callback('仓库减少物品'+JSON.stringify(data))
	})
}

Apitest.toCash = function(res,callback){
	Cash.newCash(res,function(data){
		callback('用户提现申请'+JSON.stringify(data))
	})
}

module.exports = Apitest
