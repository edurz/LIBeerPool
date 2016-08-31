var mongoose = require("mongoose");
var express = require("express");
var bodyParser = require("body-parser");
var Cerveza = require("./models/cerveza").Cerveza;
var User = require("./models/user").User;
var methodOverride = require("method-override");
var cookieSession = require("cookie-session");
var session_middleware = require("./middlewares/session");
var router_app = require("./routes_app");
var helmet = require('helmet');

var multer = require('multer');
var upload = multer({dest: './uploads/'});
var fs = require('fs');


var app = express();
var router = express.Router();



mongoose.connect("mongodb://localhost/libeerpool");

app.set("view engine","jade");

app.use(express.static("public"));
app.use(bodyParser.json()); // para poder procesar peticiones post y extraer los datos de un form. ej:  req.body.email
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(helmet());
app.disable('x-powered-by');

var expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hour
app.use(cookieSession({
    name: "session",
    keys: ["llave-1","llave-2"],
    cookie: { secure: true,
            httpOnly: true,
            expires: expiryDate
          }
}));

app.get("/", function(req,res){
    
User.find(function(err,doc){
console.log(doc);

});
if(req.session.user_id){
    res.redirect("/app");
    }else{
        res.render("index");
    }
});

app.get("/login",function(req,res){
   
        res.render("login");
});

app.get("/logout", function(req,res){
    req.session = null
    res.render("index");
});

app.get("/signup", function(req,res){
    User.find(function(err,doc){
    console.log(doc);
    res.render("signup");
    });
    
});

app.get("/cervezas", function(req,res){
res.render("cervezas")
});

app.get("/cervezas/internacionales", function(req,res){

Cerveza.find(function(error,documento){
    if(error){ console.log(error); }
    if(req.session.user_id){
        User.findById(req.session.user_id,function(err,user){
            if(err){
                console.log(err);
                res.redirect("/");
            }else{
                res.render("internacionales", { listaBeer: documento, usuario: user.username });
                
            }
        });
        
    }else{
        res.render("internacionales", { listaBeer: documento});
    }
    });

});

app.get("/cervezas/internacionales/new", function(req,res){
    if(req.session.user_id){
        User.findById(req.session.user_id,function(err,user){
            if(err){
                console.log(err);
                res.redirect("/");
            }else{
                res.render("interNew", { usuario: user.username });
                
            }
        });
             
    }else{
        res.redirect("/");
    }
});

app.get("/cervezas/internacionales/:id/editar", function(req,res){
    Cerveza.findById(req.params.id,function(err,beer){
    res.render("editar",{beer : beer})
    });
});

app.get("/cervezas/internacionales/:id/detalle", function(req,res){
    Cerveza.findById(req.params.id,function(err,beer){
    res.render("beerdetalle",{beer : beer});
});
    
})


/*POST*/

app.post("/cervezas/internacionales", upload.single('foto'), function(req,res,next){
   
        //copiamos el archivo a la carpeta definitiva de fotos
       fs.createReadStream('./uploads/'+req.file.filename).pipe(fs.createWriteStream('./public/fotos/'+req.file.originalname)); 
       //borramos el archivo temporal creado
       fs.unlink('./uploads/'+req.file.filename); 

       var cerveza = new Cerveza({nombre: req.body.nombre,
                           descripcion: req.body.descripcion,
                           imagen: '../fotos/' + req.file.originalname
        });

       
       //console.log("originalname" + req.files[x].originalname);
    

//console.log(req.body);
cerveza.save().then(function(us){ //promesas, retorna el metodo then()
        Cerveza.find(function(error,documento){
        if(error){ console.log(error); }
        res.render("internacionales" , {listaBeer : documento, mensaje : 'Se Agregó correctamente'});
        });
 },function(err){
    if(err){
    console.log(String(err));
    res.send("no pudimos guardar la info");
 }
});
});

app.post("/users", function(req,res){
var user = new User({email: req.body.email,
                     password: req.body.password,
                     password_confirmation: req.body.password_confirmation,
                     username: req.body.username
                    });

console.log(user.password_confirmation);

 user.save().then(function(us){ //promesas, retorna el metodo then()
    res.send("guardamos el user correctamente");
 },function(err){
    if(err){
    console.log(String(err));
    res.send("no pudimos guardar la info");
 }
 });

/* user.save(function(err){  //callback , funcion ascincrona
    if(err){
        console.log(String(err));
    }
    res.send("recibimos tus datos");
});
*/
});

app.post("/sessions", function(req,res){
    //User.findById("",function(err,docs){}); se copia el _id de la consola
    //User.findOne({},function(err,docs){});
User.findOne({email:req.body.email,password:req.body.password}, function(err,user){ 

    if(user){
        req.session.user_id = user._id;
        res.redirect("/app");
    }else{
        res.render("login", {mensaje : "email o contraseña incorrecta"});
    }
   
    
    
});

});


/* ----------------------------------------------------------------------------*/
/* PUT - EDITAR */ 


app.put("/cervezas/internacionales/:id", function(req,res){
Cerveza.findById(req.params.id, function(err,beer){
beer.nombre = req.body.nombre;
beer.descripcion = req.body.descripcion;
beer.save(function(err){
    if(!err){
        Cerveza.find(function(error,documento){
        if(error){ console.log(error); }
        res.render("internacionales" , {listaBeer : documento, mensaje : 'Se editó correctamente'});
        });
    }else{
        res.render("internacionales" , {listaBeer : documento});    
    }
        });
    });
});

app.delete("/cervezas/internacionales/:id", function(req,res){
    Cerveza.findOneAndRemove({_id : req.params.id},function(err){
            if(!err){
                Cerveza.find(function(error,documento){
                if(error){ console.log(error); }
                res.render("internacionales" , {listaBeer : documento , mensaje : 'Se eliminó correctamente'});
                });
            }else{
                console.log(err);
                res.redirect("/cervezas/internacionales", { Error : 'No se pudo eliminar el producto'});
            }
        })
});

app.use("/app",session_middleware);
app.use("/app",router_app);


app.listen(8080);