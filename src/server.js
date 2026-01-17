import { Hono } from 'hono'
import { html } from 'hono/html';
import { serveStatic } from "hono/bun"; // use `serve-static` for Node
// import { streamSSE } from 'hono/streaming'
import { stream } from 'hono/streaming'

import { EventEmitter } from "node:events";

import { layout } from './layout.js'

import { renderUser, renderUserEdit } from "./utils.js";
import { updateUser } from "./db.js"

import { renderAllUsers } from "./utils.js";
import { updateStatus } from "./db.js"

import { renderUsersWithFilter } from "./utils.js";
import { renderUserEditWithValidate } from "./utils.js";

import { renderInfiniteScrollPage, renderNamesByPage } from "./utils.js";

import { renderCommentForm, renderCommentsDiv } from "./utils.js";
import { addComment } from "./db.js"

import { renderUsersWithEditLink } from "./utils.js";
import { getUserById , getUserByEmail} from "./db.js"

const app = new Hono()

const dbEvents = new EventEmitter()

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

        <br>
        <a href='./server-events'>Server Events</a>

        <br>
        <a href='./dialog-form'>Dialog (Modal) Form</a>
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
          <script></script>
        `
      })
   
  return c.html(result)
})

app.get('/api/load-more', (c) => {
  const page = parseInt(c.req.query('page') || '0')

  return c.html(
    renderNamesByPage(page)
  )
})

app.get('/examples/server-events', (c) => {

  const result = layout({
        title: "Server Events",
        body: `
          ${renderCommentForm()}
          ${renderCommentsDiv()}      
          <div id='comments'></div>
          <a href="/api/comments#comments" id="link" target=htmz>Click to refresh comments</a>

        `,
        scripts: `
          <script>
            const eventSource = new EventSource('http://localhost:3000/sse');
            const container = document.getElementById('comments')

            const getComments = async () => { 
              try {
                const response = await fetch('/api/comments', {
                  headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache',
                    'Expires': '0'
                  }
                })

                if (response.ok){
                  console.log("fetch called!")

                  const target = document.querySelector('#comments')
                  console.log('target:', target)
                  
                  const htmlText = await response.text()
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(htmlText, 'text/html');
                  
                  const template = doc.querySelector('#tpl-comments')
                  console.log('template:', template)
                  
                  const clone = template.content.cloneNode(true)
                   
                  target.replaceChildren(clone)
                }
              } catch (err){
              }
            } 
            
            getComments()

            // Listen for the specific 'update' event we named in the backend
            eventSource.addEventListener('database-update', async (event) => {
              console.log('Server says: ', event.data)
            
                // document.getElementById('link').click()
                await getComments()  

            });

            // Error handling
            eventSource.onerror = (err) => {
                console.error("EventSource failed:", err);
                // The browser will automatically try to reconnect
            };
          </script>
        `
      })
   


  return c.html(result)

})

app.post('/api/sent', async (c) => {

  const body = await c.req.parseBody()
  const comment = addComment(body)

  dbEvents.emit('entity-created', comment)

  return c.html(
    renderCommentForm()
  )
})

app.get('/api/comments', async (c) => {

  return c.html(
    renderCommentsDiv()
  )
})

app.use('/sse/*', async (c, next) => {
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');
  await next();
});

app.get('/sse', (c) => {
  return stream(c, async (stream) => {

    // This function runs whenever 'entity-created' is emitted
    const listener = async (data) => {

      console.log('data:', data);
      const jsonString = JSON.stringify(data)

      await stream.write('event: database-update\n')
      await stream.write(`data: signals ${jsonString}\n\n`);
    };

    // 1. Start listening
    dbEvents.on('entity-created', listener);

    // 2. Clean up if the user closes the tab
    stream.onAbort(() => {
      dbEvents.off('entity-created', listener);
      // console.log('Client disconnected');
    });

    // 3. Keep-alive loop (prevents timeout)
    while (true) {
      await stream.write('event: ping\n')
      await stream.write(`data: signals {time_stamp: '${new Date().toLocaleTimeString()}'}\n\n`);
      await stream.sleep(20000);
    }
   })
});

app.get('/examples/dialog-form', (c) => {

  const result = layout({
    title: "Dialog (Modal) Form",
    body: `
      ${renderUsersWithEditLink()}
    `,
    scripts: `
      <script>
      </script>
      `
  })

  return c.html(result)
})

app.get('/api/load-modal', (c) => {
  const id = parseInt(c.req.query('id') || '0')
  console.log('id:', id)

  const row = getUserById(+id)
  console.log('row:', row)

  return c.html(
    `
     <dialog open id="modal-user"> 
         <form action="/examples/dialog-form/save" target=htmz method="POST">
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
           <button type="button" data-action="cancel">Cancel</button> 
         </form>
      </dialog>
      <script>

        const parent = document.currentScript.parentElement;
        const  mainDoc = window.parent.document;

        (function(){
          // console.log('delay open dialog')
        })()

        const cancelBtn = parent.querySelector('button[data-action="cancel"]')
        console.log('cancelBtn:', cancelBtn)
      
        cancelBtn.addEventListener('click', (event)=> {
          event.preventDefault()

          const modal = mainDoc.querySelector('dialog')
          console.log('modal:', modal)

          if (modal.hasAttribute('open')) {
            modal.removeAttribute('open');
          } 

        })

        const submitBtn = parent.querySelector('button[type="submit"]')
        console.log('submitBtn:', submitBtn)

        submitBtn.addEventListener('click', (event)=> {
          console.log('submitBtn clicked')

          const modal = mainDoc.querySelector('dialog')
          if (modal.hasAttribute('open')) {
            modal.removeAttribute('open');
          } 
        })

      </script>
  `
  )
});

app.post('/examples/dialog-form/save', async (c) => {

  const formDataObject = await c.req.parseBody()
  console.log(formDataObject['email'])
  

  updateUser(formDataObject)

  const row = getUserByEmail(formDataObject['email'])
  console.log('row', row)
    
    return c.html(
      `
      <template id="tpl-row">
        <tr id="row-${row.id}">
          <td>${row.id}</td>
          <td>${row.first_name}</td>
          <td>${row.email}</td>
          <td><a href='/api/load-modal?id=${row.id}' target=htmz>Edit</a></td>
        </tr>
      </template>

      <script>
        (function(){
          console.log('Run function in html fragment!')

          const parent = document.currentScript.parentElement;

          const template = parent.querySelector('#tpl-row')
          console.log('template:',template)

          const mainDoc = window.parent.document
          const dest = mainDoc.getElementById('row-${row.id}')

          const clone = template.content.cloneNode(true);
          dest.replaceWith(clone)
        })()
      </script>
      `
    )
})

// export default app
export default {
  port: 3000,
  idleTimeout: 60, // Time in seconds
  fetch: app.fetch,
}
