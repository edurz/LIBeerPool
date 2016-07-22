var mongoose = require("mongoose");
var Schema = mongoose.Schema;


mongoose.connect("mongodb://localhost/libeerpool");

var beerSchema = new Schema({
nombre: String,
descripcion: String
});

var Cerveza = mongoose.model("Cerveza",beerSchema);

module.exports.Cerveza = Cerveza;