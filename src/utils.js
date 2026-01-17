import { html } from 'hono/html';
import { getFirstUser, getAllUsers } from './db.js';
import { getUsersWithFilter } from './db.js';
import { getNamesByPage, getCountByName } from './db.js';
import { getAllComments } from './db.js';

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

export function renderUserEditWithValidate(err={}, body=[]) {
  const row = getFirstUser()

  console.log("err.first_name: ", err?.first_name)

  if (Object.keys(err).length > 0) {
    return html`
      <!DOCTYPE html>
      <form id="my-form" action="/examples/inline-validation" target=htmz method="POST">
        <label>
          First Name
          <input type="text" name="first_name" value="${body['first_name']}" required autofocus 
            aria-invalid="true" >
            <small>
              ${err?.first_name}
            </small>
         </label>
        <label>
          Last Name
          <input type="text" name="last_name" value="${body['last_name']}" required>
        </label>
        <label>
          Email
          <input type="text" name="email" value="${body['email']}" required>
        </label>
        <button type="submit" style="width: auto;">Submit</button>
      </form>
      `
  }

  return html`
     <!DOCTYPE html>
     <form id="my-form" action="/examples/inline-validation" target=htmz method="POST">
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
       <button type="submit" style="width: auto;">Submit</button>
     </form>
   `
}

export function renderInfiniteScrollPage(page = 1) {

  const rows = getNamesByPage(page)
  const next = page + 1

  // const hasMore = page * 5 < getCountByName()

  return html`
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="table-body">
      ${rows.map((r) => html`
        <tr>
          <td>${r.id}</td><td>${r.name}</td>
          <td>${r.email}</td><td>${r.status === 1 ? 'Active':'Inactive'}</td>
        </tr>
      `)}
       </tbody>
    </table>

    <a id="link" href="/api/load-more?page=${next}" target=htmz>Load more...</a>
    `
}

export function renderNamesByPage(page=0) {
  const rows = getNamesByPage(page)
  const next = page + 1
  const hasMore = page * 5 + 5 <= getCountByName()

  return html`
    <div id="tmp-div">
      <input type="hidden" name="page" value="${next}">

      <template id="tpl-more-rows"> 
      ${rows.map((r) => html`
        <tr>
          <td>${r.id}</td><td>${r.name}</td>
          <td>${r.email}</td><td>${r.status === 1 ? 'Active':'Inactive'}</td>
        </tr>
      `)}
      </template> 

      <script>
        (function(){
          console.log('Run function in html fragment!')

            const parent = document.currentScript.parentElement;
            // console.log('parent:', parent)

            const template = parent.querySelector('#tpl-more-rows')
            // console.log('template:',template)

            // Accessing the main document from INSIDE an iframe
            const mainDoc = window.parent.document;
            // console.log('mainDoc', mainDoc)

            const tbody = mainDoc.getElementById('table-body')
            // console.log('tbody:', tbody)

            const clone = template.content.cloneNode(true);
            tbody.appendChild(clone) 

            const page = parent.querySelector('input[name="page"]').value
            const link = mainDoc.getElementById('link')

            link.href="/api/load-more?page=" + page

        })();
      </script>
    </div>
    `
}

export function renderCommentForm() {
  return html`
        <form id="my-form" action="/api/sent" target=htmz method="POST">
          <label>
          Comments:
          <textarea name="comment_body"></textarea>
          </label>
          <button type="submit" style="width: auto;">Submit</button>
        </form>
   `
}

export function renderCommentsDiv() {

  const rows= getAllComments()
  console.log('comments:', rows)

  return html`
    <template id='tpl-comments'>
      <ul>
      ${rows.map((r) => html`<li>${r.body}</li>`)}
      </ul>
      <script>
        (function(){
          console.log('Run function in html fragment!')

        })();
      </script>
    </template>
  `
}

export function renderUsersWithEditLink() {

  const rows = getUsersWithFilter()

  return html`
      <table id="table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r) => html`
          <tr id="row-${r.id}">
            <td>${r.id}</td>
            <td>${r.first_name}</td>
            <td>${r.email}</td>
            <td><a href='/api/load-modal?id=${r.id}' target=htmz>Edit</a></td>
           </tr>`
           )}
        </tbody>
      </table>
      <dialog id="modal-user">Empty</div>

      <script>
      </script>
   `
}
