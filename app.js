require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect(process.env.MONGO, {useNewUrlParser: true})
  .then(result =>console.log("Database connected."))
  .catch(error=>console.log(error + " Error trying to connect to database"))

const itemsSchema = new mongoose.Schema({
  name: String
});  

const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listsSchema);


const defaultItems = [];
Item.find().then(function(result){
  if(result.length === 0){
    const buy = new Item({
      name: "Buy Food"
    });
    
    const cook = new Item({
      name: "Cook Food"
    });
    
    const eat = new Item({
      name: "Eat Food"
    });

    Item.insertMany([buy, cook, eat]).then();
    defaultItems.push(buy);
    defaultItems.push(cook);
    defaultItems.push(eat);
  }else{
     result.forEach(function(element){
      if(element.name === "Buy Food"){
        defaultItems.push(element);
       } 
      if(element.name === "Cook Food"){
        defaultItems.push(element);
      } 
      if(element.name === "Eat Food"){
        defaultItems.push(element);
      } 
     });
  }

});


app.get("/", function(req, res) {
  Item.find().then(function(result){
      res.render("list", {listTitle: "Today", newListItems: result});
  });
});


app.post("/", function(req, res){
  const item = req.body.newItem;
  const listname = req.body.list;


  const myitem = new Item({
    name: item
  });

  if(listname === "Today"){
    myitem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname}).then(function(result){
      result.items.push(myitem);
      result.save();
      res.redirect("/"+listname);
    });
  }


});

app.post("/delete", function(req, res){
  const delItem = req.body.checkname;
  const delCusItem = req.body.checklist;

  if(delCusItem === "Today"){
    Item.deleteOne({_id:delItem}).then();
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: delCusItem}, {$pull: {items: {_id: delItem}}}).then(function(result){
      res.redirect("/"+delCusItem);
    });
  }




  
});


app.get("/:customListName", function(req, res){
  var item = lodash.capitalize(req.params.customListName);

  List.find({name:item}).then(function(result){
    if(result.length === 0){
      const list = new List({
        name: item,
        items: defaultItems
      })
      list.save();
      
      res.redirect("/"+item);
       }else{
      res.render("list", {listTitle: result[0].name , newListItems: result[0].items});

    }
  });


});



 app.get("/about/aboutpage", function(req, res){
   res.render("about");
 });

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});
