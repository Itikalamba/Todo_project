const express = require("express");
const fs = require("fs");
const app = express();
app.set('view engine', 'ejs');
var session = require('express-session');
//middleware of express - session
app.use(session({
  secret: 'iamasecret on window',
  resave: true,
  saveUninitialized: true,
}));
//to get data from the req body

app.use(express.json());
//for form 
app.use(express.urlencoded({extended:true}));
app.get("/", (request, response) => {
  if(request.session.isLoggedIn){
    console.log(request.session.username);
    response.sendFile(__dirname+"/index.html");
    return;
  }
    response.redirect("/login");
});
app.get("/style.css", (req, res) => {
  res.sendFile(__dirname + "/style.css");
});
app.get("/todo.js", (req, res) => {
  res.sendFile(__dirname + "/js/todo.js");
});
app.get("/login",(request,response)=>{
  if(request.session.isLoggedIn){
    response.redirect("/");
    return;
  }
response.sendFile(__dirname+"/login.html");
});
app.get("/signup",(request,response)=>{
  response.sendFile(__dirname+"/signup.html");
});
//post request of form signin form 
app.post("/login",(request,response)=>{
const username=request.body.username;
const password=request.body.password;
console.log(username,password);
if(username==="itika" && password==="itika@123"){
request.session.isLoggedIn=true;
request.session.username=username;
response.status(200);
response.redirect("/");
}
else{
  response.status(403);
  response.send("error");
}
});
//post request of signup 
app.post("/signup",(request,response)=>{
const username =request.body.username;
const password= request.body.password;
if(username==="itika" && password==="itika@123"){
  response.status(200);
  response.redirect("/login");
}
else{
  response.render()
}
});
//create todo in file
app.post("/create-todo", function (req, response) {
  const todo = req.body;
  saveTodos(todo, function (error) {
    if (error) {
      response.status(500);
      console.log("post requst Error:", error);
      response.json({ error: error });
    } else {
      response.status(200);
      response.send();
    }
  });
});

//get all todos
app.get("/get-all-todos", function (request, response) {
  const userName = request.query.name;
  console.log(userName);
  getTodos(userName, false, function (error, todos) {
    if (error) {
      response.status(500);
      response.json({ error: error });
      console.log(error);
    } else {
      response.status(200);
      response.json(todos);
    }
  });
});

//delete a todo item
app.delete("/delete-todo", function (request, response) {
  const todo = request.body;
  getTodos(null, true, function (error, todos) {
    if (error) {
      response.status(500);
      response.json({ error: error });
    } else {
      const filteredTodos = todos.filter(function (todoItem) {
        return todoItem.text !== todo.text;
      });
      console.log(JSON.stringify(filteredTodos));
      fs.writeFile(
        "./Data.js",
        JSON.stringify(filteredTodos),
        function (error) {
          if (error) {
            response.status(500);
            console.log(error);
            response.json({ error: error });
          } else {
            response.status(200);
            response.send();
          }
        }
      );
    }
  });
});

//error page
app.get("*", function (request, response) {
  response.sendFile(__dirname + "/404.html");
});
app.listen(3000, () => {
  console.log("Server is running at port 3000");
});

//this function creates an entry in file after readig data from file
function saveTodos(todo, callback) {
  getTodos(null, true, function (error, todos) {
    if (error) {
      callback(error);
    } else {
      todos.push(todo);

      fs.writeFile("./Data.js", JSON.stringify(todos), function (error) {
        if (error) {
          callback(error);
        } else {
          callback();
        }
      });
    }
  });
}

//get todos that is read from file
function getTodos(username, all, callback) {
  fs.readFile("./Data.js", "utf-8", function (error, data) {
    if (error) {
      callback(error);
    } else {
      if (data.length === 0) {
        data = "[]";
      }

      try {
        let todos = JSON.parse(data);

        if (all) {
          callback(null, todos);
          return;
        }

        const filteredTodos = todos.filter(function (todo) {
          return todo.createdBy === username;
        });

        callback(null, filteredTodos);
      } catch (error) {
        callback(null, []);
      }
    }
  });
}






