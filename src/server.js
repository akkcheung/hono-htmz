import { Hono } from 'hono'
import { html } from 'hono/html';

import { serveStatic } from "hono/bun"; // use `serve-static` for Node
import { layout } from './layout.js'

import { renderUser, renderUserEdit } from "./utils.js";
import { updateUser } from "./db.js"

import { renderAllUsers } from "./utils.js";
import { updateStatus } from "./db.js"

import { renderUsersWithFilter } from "./utils.js";
import { renderUserEditWithValidate } from "./utils.js";

import { renderInfiniteScrollPage, renderNamesByPage } from "./utils.js";

const app = new Hono()

// Static files
app.use("/public/*", serveStatic({ root: "./" }));

app.get('/', (c) => {
  return c.text('Hello Hono !') });

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

        <br>
        <a href='./inline-validation'>Inline Validation</a>

        <br>
        <a href='./infinite-scroll'>Infinite Scroll</a>
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

app.get('/examples/inline-validation', (c) => {
  return c.html(
    layout({
      title: 'Inline Validation',
      body: 
      `<div id="demo">
        ${renderUserEditWithValidate()}
      </div>
      `
    })
  )
})

app.post('/examples/inline-validation', async (c) => {

  const body = await c.req.parseBody()
  console.log(body['first_name'])

  const firstName = body['first_name']
  console.log(firstName.length)

  let err = {}

  if (firstName.length > 2){
    updateUser(body)
  } else {
    err = {
      "first_name": "Text is too short!"
    }
  }

  return c.html(
    renderUserEditWithValidate(err, body)
  )
})

app.get('/examples/infinite-scroll', (c) => {
  const page = parseInt(c.req.query('page') || '2')
  console.log('page:', page)

  const result = layout({
        title: "Infinite Scroll",
        body: `
          <div id="tmp-div">
            <input type="hidden" name="page" value="${page}"">
          </div>
          ${renderInfiniteScrollPage()}
        `,
        scripts: `
          <script>

          // const target = document.getElementById('demo')
//          const target = document.getElementById('tmp-div')
//          console.log(target)
//
//          const tbody = document.getElementById('table-body')
//
//          const link = document.getElementById('link')
//          console.log(link)
//
//          const observer = new MutationObserver((mutations) => {
//            for (const mutation of mutations) {
//              // if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
//              if (mutation.addedNodes.length > 0) {
//                // Logic for when the fragment arrives
//                console.log("Response fragment detected in target!");
//                console.log("addedNodes:", mutation.addedNodes.length)
//                
//                // Trigger your cloning logic or UI updates here
//                const template = target.querySelector('#tpl-more-rows');
//
//                if (template !== null) {
//                  const clone = template.content.cloneNode(true);
//                  tbody.appendChild(clone) 
//                }
//
//                // const tmpDiv = document.getElementById('tmp-div')
//                // console.log('tmpDiv page', tmpDiv.dataset.page)
//                // const page = document.querySelector('input[name="page"]').value
//                // console.log('page:',page )
//
//                // url.searchParams.set('page', tmpDiv.dataset.page)
//
//                // link.href="/api/load-more?page=" + tmpDiv.dataset.page
//                // link.href="/api/load-more?page=" + page
//              }
//            }
//          });
//
//          // observer.observe(target, { childList: true });
//          observer.observe(document.body, { childList: true });
//          
//          const observerA = new MutationObserver((mutations) => {
//            mutations.forEach(mutation => {
//              mutation.addedNodes.forEach(node => {
//                if (node.nodeType === 1) {
//                  // 'node' is now your template reference in the main DOM
//                  console.log("Referencing new content:", node);
//                }
//              });
//            });
//          });
//
//          // observerA.observe(document.body, { childList: true });
//
//          document.addEventListener('partialLoaded', (e) => {
//            console.log('Partial says:', e.detail.status)
//          })
          </script>
        `
      })
   
  // result = renderNamesByPage()
  return c.html(result)
})

//app.get('/api/rows', (c) => {
//  const page = parseInt(c.req.query('page') || '0')
//
//  return c.html(
//    renderNamesByPage(page)
//  )
//})

app.get('/api/load-more', (c) => {
  const page = parseInt(c.req.query('page') || '0')

  return c.html(
    renderNamesByPage(page)
  )
})


export default app
