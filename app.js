const express = require("express");
// const date = require(__dirname + '/date.js');
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

// let items = ['Buy food', 'Cook food', 'Eat Food'];

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.static("public"));

app.set("view engine", "ejs");

//mongoose.connect("mongodb://localhost:27017/toDoListDB");
mongoose.connect("mongodb+srv://admin:Test123@cluster0.mxa5w.mongodb.net/toDoListDB?retryWrites=true&w=majority", {useNewUrlParser: true});


const itemSchema = {
    name: String,
};

const listSchema = {
    name: String,
    items: [itemSchema],
};

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemSchema);

app.get("/", (req, res) => {
    // let day = date.getDate();

    Item.find({}, (errors, results) => {
        if (errors) {
            console.log(errors);
        } else {
            // console.log(results);
            res.render("list", {
                listTitle: "Today",
                newListItems: results,
            });
        }
    });
});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    if (customListName === "Favicon.ico") return;
    List.findOne({ name: customListName }, (err, foundList) => {
        if (err) {
            console.log("doesn't exist");
        } else {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: [],
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items,
                });
            }
        }
    });
});

app.post("/", (req, res) => {
    // console.log(req.body.newItem);
    const pushItem = new Item({ name: req.body.newItem });
    const pushList = req.body.list;
    //console.log(req.body);
    if (pushList === "Today") {
        pushItem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: pushList }, (err, foundList) => {
            foundList.items.push(pushItem);
            foundList.save();
            res.redirect("/" + pushList);
        });
    }
});

app.post("/delete", (req, res) => {
    //console.log(req.body);
    const deleteId = req.body.checkbox;
    const pushList = req.body.listName;

    if (pushList === "Today") {
        Item.findByIdAndRemove(deleteId, (errors) => {
            if (errors) {
                console.log(errors);
            } else {
                //console.log("Delete successfully" + deleteId);
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate(
            { name: pushList },
            { $pull: { items: { _id: deleteId } } },
            (err, foundList) => {
                res.redirect("/" + pushList);
            }
        );
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server starting on port 3000");
});
