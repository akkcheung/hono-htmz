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

db.run(`
  CREATE TABLE IF NOT EXISTS TBL_NAME ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status INTEGER DEFAULT 0
  );
`);

let stmt_name = db.prepare(`
  insert or ignore into TBL_NAME (name, email, status) values (?, ?, ?)
`)

stmt_name.run("AMO", "amo@mo.co", 0);
stmt_name.run("BMO", "bmo@mo.co", 1);
stmt_name.run("CMO", "cmo@mo.co", 1);
stmt_name.run("DMO", "dmo@mo.co", 1);
stmt_name.run("EMO", "emo@mo.co", 1);

stmt_name.run("FMO", "fmo@mo.co", 0);
stmt_name.run("GMO", "gmo@mo.co", 1);
stmt_name.run("HMO", "hmo@mo.co", 1);
stmt_name.run("IMO", "imo@mo.co", 1);
stmt_name.run("JMO", "jmo@mo.co", 1);

stmt_name.run("LMO", "lmo@mo.co", 0);
stmt_name.run("MMO", "mmo@mo.co", 1);
stmt_name.run("NMO", "nmo@mo.co", 1);
stmt_name.run("OMO", "omo@mo.co", 1);
stmt_name.run("PMO", "pmo@mo.co", 1);

stmt_name.run("QMO", "qmo@mo.co", 0);
stmt_name.run("RMO", "rmo@mo.co", 1);
stmt_name.run("SMO", "smo@mo.co", 1);
stmt_name.run("TMO", "tmo@mo.co", 1);
stmt_name.run("UMO", "umo@mo.co", 1);

db.run(`
  CREATE TABLE IF NOT EXISTS TBL_COMMENTS ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT NOT NULL
  );
`);

let stmt_comment = db.prepare(`
  insert or ignore into TBL_COMMENTS (id, body) values (?,? )
`)

stmt_comment.run(1, "The first comment");

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

export function getNamesByPage(page=1, pageSize=5) {
  const offset = (page - 1) * pageSize

  const query =  db.query(`SELECT * FROM TBL_NAME order BY id limit ? offset ?`)

  return query.all(pageSize, offset)
}

export function getCountByName(){
  const { count } = db.query(`SELECT count(*) as count FROM TBL_NAME`).get() 
  return count
}

export function addComment(body){

    const { comment_body } = body 
    console.log('comment_body', comment_body)

//    db.run(
//      `insert into tbl_comments (body) values (?) `,
//      comment_body 
//    );

    const query = db.prepare("insert into tbl_comments (body) values (?) ")
    const result = query.run(comment_body)

    const comment = {
      id: result.lastInsertRowid,
      body: comment_body
    }

    console.log("comment:", comment)

    return comment
}

export function getAllComments() {
  return db.query("SELECT * FROM TBL_COMMENTS ORDER BY id").all();
}

export function getUserById(id) {
  const query =  db.query("SELECT * FROM TBL_USER where id=?")

  return query.get(id)
}

export function getUserByEmail(email) {
  const query =  db.query("SELECT * FROM TBL_USER where email=?")

  return query.get(email)
}
