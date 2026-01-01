// db.js

import { Database } from "bun:sqlite";

const db = new Database("app.db");

db.run(`
  CREATE TABLE IF NOT EXISTS TBL_USER ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status INTEGER DEFAULT 0
  );
`);

let stmt_user = db.prepare(`
  insert or ignore into TBL_USER (first_name, last_name, email) values (?, ?, ?)
`)

stmt_user.run("Finn", "Mertens", "fmertens@candykingdom.gov");
stmt_user.run("Jake the Dog", "-", "jake@candykingdom.gov");
stmt_user.run("BMO", "-", "bmo@mo.co");
stmt_user.run("Marceline", "-", "marceline@vampirequeen.me");

export function getFirstUser() {
  return db.query("SELECT * FROM TBL_USER ORDER BY id limit 1").get()
}

export function updateUser(user){

  const { first_name, last_name, email  } = user

    db.run(
      `update tbl_user set first_name=?, last_name=? where email=? `,
      first_name,
      last_name,
      email
    );

}

export function getAllUsers() {
  return db.query("SELECT * FROM TBL_USER ORDER BY id").all();
}

export function updateStatus(selection){
  if (typeof selection === "undefined"){
    db.run(
      `update tbl_user set status = 0`
    );
  } else {
    
    db.run(
      `update tbl_user set status = 0`  
    );

    for ( let i=0; i < selection.length; i++){
      let id = +selection[i]

      db.run(
        `update tbl_user set status = 1 where id = ?`,
        id
      );
    }
  }
}
export function getUsersWithFilter(search="") {
  console.log("getUserWithFilter >", search)

  const query =  db.query(`SELECT * FROM TBL_USER where email like ?`
    , '')

  return query.all(`%${search}%`)

}
