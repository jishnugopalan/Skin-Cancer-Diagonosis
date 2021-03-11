var express = require("express");
var bodyParser = require("body-parser");
const ejs = require("ejs");

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extends: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("test");
});

app.post("/result", (req, res) => {
  if (req.body) {
    p = req.body
    // res.redirect("/result");
    console.log(p)
    //res.send(p)
    res.render("result", { p })
  }
  res.render("/")

})

app.get("/result",(req,res)=>{
  res.redirect("/")
})

app.get("/test",(req,res)=>{
  res.send("dey")
})
app.listen(process.env.PORT || 3000, function () {
  console.log("listening at port 3000");
});
