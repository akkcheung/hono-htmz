import { Hono } from 'hono'
import { html } from 'hono/html';

import { serveStatic } from "hono/bun"; // use `serve-static` for Node
import { layout } from './layout.js'

import { renderUser, renderUserEdit } from "./utils.js";
import { updateUser } from "./db.js"

import { renderAllUsers } from "./utils.js";
import { updateStatus } from "./db.js"

import { renderUsersWithFilter } from "./utils.js";

const app = new Hono()

// Static files
app.use("/public/*", serveStatic({ root: "./" }));

app.get('/', (c) => {
  return c.text('Hello Hono 2!')
});

app.get('/examples/ajax-update', (c) => {
  return c.html(
    layout({
      title: "Ajax Update",
      body: ` 
        <a href="/api/new-content-route#content-to-replace" target=htmz role="button">Click to Load</a>
        </p>
        <div id="content-to-replace">
          This text will be replaced by content from the server.
        </div>
      `,
    })
 )
});

app.get('/api/new-content-route', (c) => {
  return c.html('Ajax Update Content')  
})

app.get('/examples/inline-edit', (c) => {
  return c.html(
    layout({
      title: "Inline Edit",
      body: `
        ${renderUser()}
      `
    })
  )
})

app.get('/examples/', (c) => {
  return c.html(
    layout({
      title: "Examples",
      body: `
        <a href='./inline-edit'>Inline Edit</a>

        <br>
        <a href='./bulk-update'>Bulk Update</a>

        <br>
        <a href='./instant-search'>Instant Search</a>
      `
    })
  )
})

app.get('/examples/inline-edit/edit', (c) => {
  return c.html(
      renderUserEdit()
  )
})

app.post('/examples/inline-edit/save', async (c) => {

  const formDataObject = await c.req.parseBody()
  console.log(formDataObject['first_name'])

  updateUser(formDataObject)
  return c.html(
      renderUser(),
  )
})

app.get('/examples/bulk-update', (c) => {
  return c.html(
    layout({
      title: "Bulk Update",
      body: `
        <div id="demo">
          ${renderAllUsers()}
        <div>
        <div id="success"></div>
      `
    })
  )
})

app.post('/examples/bulk-update', async (c) => {

  const body = await c.req.parseBody()

  const ids = body['id[]']
  console.log(ids)

  updateStatus(ids)
  return c.html(
    renderAllUsers()
    // `<div id="demo">Updated sucessfully!</id>`
  )
})

app.get('/examples/instant-search', (c) => {
  return c.html(
    layout({
      title: "Bulk Update",
      body: `
        <div id="demo">
          <form id="my-form" action="/examples/instant-search" target=htmz method="POST"> 
            <input type="search" id="searchInput" name="search" placeholder="Type to filter contacts..."> 
            <!-- <button type="submit" style="width: auto;">Submit</button> -->
          </form>
          ${renderUsersWithFilter('')}
        <div>
        <div id="success"></div>
      `,
      scripts: `
      <script>
        function debounce(func, delay = 300) {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        }

        const processSearch = debounce(() => {
          const form = document.getElementById('my-form')
          form.requestSubmit()
        }, 400)


        searchInput = document.getElementById('searchInput')

        searchInput.addEventListener('input', processSearch)
      </script>


      `
    })
  )
})

app.post('/examples/instant-search', async (c) => {

  const body = await c.req.parseBody()
  console.log(body['search'])


  return c.html(
    renderUsersWithFilter(body['search'])
  )
})

export default app
