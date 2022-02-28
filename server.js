const express = require("express");
const fs = require("fs"); //for writing to json file
const data = require("./database.json");
const app = express();

app.use(express.static("public"));

app.use(express.json());

 //middlewheres
const checkUser = (req, res, next) => {

    let username = req.query.user;
    let user = data.users.find(u => u.username == username);
    if(user) return next();
    res.status(401).json({success: false});

}
app.all("*", (req, res, next) => {
   
    setTimeout(() => {
        next();
    }, 1000)

})


// all pages
app.get("/home", (req,res)=>{
    res.sendFile("html/home.html", {root: __dirname});
})
app.get("/about", (req,res)=>{
    res.sendFile("html/about.html", {root: __dirname});
})
app.get("/catalog2", checkUser, (req,res)=>{
    res.sendFile("html/catalog2.html", {root: __dirname});
})
app.get("/manage_users", checkUser, (req,res)=>{
    res.sendFile("html/manage_users.html", {root: __dirname});
})
app.get("/contact", (req,res)=>{
    res.sendFile("html/contact.html", {root: __dirname});
})



//all api routes

app.post("/api/login", (req,res) => {

    let username = req.body.username;
    let password = req.body.password;

    let customer = get_customers().find(c => c.username == username && c.password == password);
    if(customer) return res.json({login:true, type:"customer", username: customer.username});

    let employee = get_employees().find(e=> e.username == username && e.password == password);
    if(employee) return res.json({login:true, type:"employee", username: employee.username});

    let manager = get_managers().find(m => m.username == username && m.password == password);
    if(manager) return res.json({login:true, type:"manager", username: manager.username});
    
    res.json({login:false});
    
})

app.get("/api/flowers", checkUser, (req, res) => {
    res.json({success: true, data: get_flowers()});
})

app.get("/api/users", checkUser, (req, res) => {
    res.json({success: true, data: get_all_users()})
})

//add user
//new id
app.post("/api/users", checkUser, (req, res) => {
    let body = req.body;
    body.id = newId();
    data.users.push(body);
    updateJsonFile();
    //console.log(data.users);
    res.json({success: true, msg: "user added successfuly"})
})

//update user
app.put("/api/users/:id", checkUser, (req, res) => {

    let id = req.params.id;
    let password = req.params.password;
    let body = req.body;

    data.users.map((user, index) => {
        if(user.id == id){
            body.id = Number(id);
            if(body.password == undefined) //if update by employee, password shell not changed
                body.password = user.password;
            data.users[index] = body;
        }
    })
   
    updateJsonFile();
    res.json({success: true, msg: "user updated successfuly"})

})

app.delete("/api/users/:id", checkUser, (req, res) => {
    let id = req.params.id;
    let index = null;

    data.users.map((user, i) => {
        if(user.id == id){
            index = i;
        }
    })

    data.users.splice(index, 1)
    updateJsonFile();
    res.json({success: true, msg: "user deleted successfuly"})

})


const newId = () => {
    const arr = [];
    get_all_users().map(user => arr.push(Number(user.id)));
    return Math.max(...arr) + 1;
}

app.all("*", (req, res) => {
    res.status(404).json({error:"Page not.."});
});

app.listen(8080, () => {
    console.log("server is runnig on port 8080");
});

function get_employees(){return data.users.filter(user => user.category == "employee");}
function get_customers(){return data.users.filter(user => user.category == "customer");}
function get_flowers(){return data.flowers;}
function get_managers(){return data.users.filter(user => user.category == "manager");}
function get_supliers(){return data.supplier;}
function get_all_users(){return data.users}

function updateJsonFile(){
    fs.writeFile("database.json", JSON.stringify(data), err => {
     
        // Checking for errors
        if (err) throw err; 
       
        console.log("Done writing"); // Success
    });
}