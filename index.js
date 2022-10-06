const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const dbPath = path.join(__dirname, "users.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3030, () => {
      console.log("Server is Running...");
    });
  } catch (err) {
    process.exit(1);
    console.log(`DBError ${err.message}`);
  }
};

initializeDBAndServer();

// GET ALl USERS API

app.get("/api/users", async (request, response) => {
  const getUsersQuery = `SELECT * FROM users;`;
  const usersArray = await db.all(getUsersQuery);
  response.send(usersArray);
});

// GET ONE USER API

app.get("/api/users/:id", async (request, response) => {
  const { id } = request.params;
  const getUserQuery = `SELECT * FROM users WHERE id = ${id} ;`;
  const userDetails = await db.get(getUserQuery);
  console.log(userDetails);
  if (userDetails === undefined) {
    response.send("User details not exist");
  } else {
    response.send(userDetails);
  }
});

// /api/users?page=1&limit=10&name=James&sort=-age

// GET USER BASED ON QUERY API

app.get("/api/users", async (request, response) => {
  const { page = 1, limit = 10, name = "", sort = "age" } = request.query;
  const getUsersQuery = `SELECT * FROM users WHERE first_name LIKE '%${name}%' ORDER BY '${sort}' ASC
  LIMIT ${limit} OFFSET ${page};`;
  const usersArray = await db.all(getUsersQuery);
  response.status(200);
  response.send(usersArray);
});

// POST USER API

app.post("/api/users", async (request, response) => {
  const userDetails = request.body;
  const {
    id,
    first_name,
    last_name,
    company_name,
    city,
    state,
    zip,
    email,
    web,
    age,
  } = userDetails;
  const createUserQuery = `INSERT INTO users( id,first_name,last_name,company_name,city,state,zip,email,web,age)
    VALUES(${id},'${first_name}', '${last_name}', '${company_name}','${city}', 
    '${state}', ${zip},'${email}', '${web}' ,${age});`;
  const dbResponse = await db.run(createUserQuery);
  const userId = dbResponse.lastID;
  response.send({ userId });
  // response.send("User is created Successfully");
});

// UPDATE USER API

app.put("/api/users/:id", async (request, response) => {
  const { id } = request.params;
  const userDetails = request.body;
  const { first_name, last_name, age } = userDetails;
  const updateUserQuery = `UPDATE users SET first_name = '${first_name}' ,
  last_name = '${last_name}', age = ${age}
  WHERE id = ${id} ;`;
  const user = await db.run(updateUserQuery);
  // console.log(userDetails);
  response.send("user is updated");
});

// DELETE USER API

app.delete("/api/users/:id", async (request, response) => {
  const { id } = request.params;
  const deleteUserQuery = `DELETE FROM users WHERE id = ${id};`;
  await db.run(deleteUserQuery);
  // response.send("deleted");
  response.send({});
});


module.export = app;
