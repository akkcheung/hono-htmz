import { html } from 'hono/html';
import { getFirstUser, getAllUsers } from './db.js';
import { getUsersWithFilter } from './db.js';

export function renderUser() {

  const row = getFirstUser()

  return html`
    <div id="demo">
      <p>First Name: ${row.first_name}</p>
      <p>Last Name: ${row.last_name}</p>
      <p>Emal: ${row.email}</p>

      <div>
        <a href="/examples/inline-edit/edit#demo" target=htmz role="button">Edit</a>
        <button>Reset</button>
      </div>
    </div>
  `
}

export function renderUserEdit() {
  const row = getFirstUser()

  return html`
     <div id="demo">
       <form id="my-form" action="/examples/inline-edit/save" target=htmz method="POST">
         <label>
           First Name
           <input type="text" name="first_name" value="${row.first_name}" required autofocus >
          </label>
         <label>
           Last Name
           <input type="text" name="last_name" value="${row.last_name}" required>
         </label>
         <label>
           Email
           <input type="text" name="email" value="${row.email}" required>
         </label>
         <button type="submit" id="submit-btn" style="width: auto;">Submit</button>
         <button>Cancel</button>
       </form>
     </div>
   `
}

export function renderAllUsers() {

  const rows = getAllUsers()

  return html`
        <form id="my-form" action="/examples/bulk-update" target=htmz method="POST"> 
          <table>
            <thead>
              <tr>
                <th>Edit</th>
                <th>Id</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r) => html`<tr><td>${r.id}</td><td>${r.first_name}</td><td>${r.email}</td><td><input type="checkbox" name="id[]" value=${r.id} ${r.status === 1 ? 'checked':''}></td></tr>`)}
            </tbody>
          </table>
          <button type="submit" style="width: auto;">Submit</button>
        </form>
      `
}

export function renderUsersWithFilter(search="") {

  const rows = getUsersWithFilter(search)

  return html`
      <table id="table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r) => html`<tr><td>${r.id}</td><td>${r.first_name}</td><td>${r.email}</td><td>${r.status === 1 ? 'Active':'Inactive'}</td></tr>`)}
        </tbody>
      </table>
   `
}
