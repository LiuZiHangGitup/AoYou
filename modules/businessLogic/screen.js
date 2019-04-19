//用户上传截图的逻辑
//用户任务相关
var Config = require('./../config.js')

var screenSchema = new Config.mongoose.Schema({
	//用户ID
    uid:{type:String}

})









module.exports = Config.db.model('screens',screenSchema);