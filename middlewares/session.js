var User = require("../models/user").User;

module.exports = function(req,res,next){
	if(!req.session.user_id){
		res.redirect("/");
	}
	else{
		User.findById(req.session.user_id,function(err,user){
			console.log(req.session.user_id);
			if(err){
				console.log(err);
				res.redirect("/login");
			}else{
				res.locals = { user: user };
				next();
			}
		});
		
	}
}