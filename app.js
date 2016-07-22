var express = require("express");
var bodyParser = require("body-parser");
var Cerveza = require("./models/cerveza").Cerveza;

var app = express();

app.set("view engine","jade");

app.use(express.static("public"));
app.use(bodyParser.json()); // para poder procesar peticiones post y extraer los datos de un form. ej:  req.body.email
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req,res){
    
Cerveza.find(function(err,doc){
console.log(doc);
res.render("index");
})
});

app.get("/cervezas", function(req,res){
res.render("cervezas")
});

app.get("/cervezas/internacionales", function(req,res){

Cerveza.find(function(error,documento){
    if(error){ console.log(error); }
    res.render("internacionales", { listaBeer: documento})
    });

});

app.get("/cervezas/internacionales/new", function(req,res){
res.render("interNew")
});


/*POST*/

app.post("/cervezas/internacionales", function(req,res){
//console.log(req.body);
var cerveza = new Cerveza({nombre: req.body.nombre,
                           descripcion: req.body.descripcion
});

cerveza.save().then(function(us){ //promesas, retorna el metodo then()
    res.send("guardado correctamente");
 },function(err){
    if(err){
    console.log(String(err));
    res.send("no pudimos guardar la info");
 }
});

});

app.listen(8080);