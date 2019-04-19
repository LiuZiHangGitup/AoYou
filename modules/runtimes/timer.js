//时间管理器
var Schedule = require('node-schedule')



//传入一个时间 一个逻辑 一个回调
function Timer(time,fn,callback){
	return new Schedule.scheduleJob(time,function(){
		fn()
	});
}

module.exports = Timer

