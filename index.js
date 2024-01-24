import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let tasks = [];
async function getTasks() {
  const result = await db.query("SELECT * FROM tasks");
  return result.rows;
}

app.get("/", async (req, res) => {
  tasks = await getTasks();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: tasks, //result.rows
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const result = await db.query(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING *;",
    [item]
  );
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const itemId = req.body.updatedItemId;
  const item = req.body.updatedItemTitle;
  const result = await db.query("UPDATE tasks SET title = $1 WHERE id = $2", [
    item,
    itemId,
  ]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const itemId = req.body.deleteItemId;
  const result = await db.query("DELETE FROM tasks WHERE id = $1", [itemId]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
