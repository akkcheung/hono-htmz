// layout.js

export const layout = ({ title = "My App", body = "", scripts = "" }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>

  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" >

  <link 
    rel="stylesheet"
    href="/public/styles.css">

</head>
<body>

  <nav>
    <ul>
      <li>
        <a href="/examples/" class="contrast">Apline Ajax Examples using HTMZ</a>
      </li>
    </ul>
  </nav>

  <header><h3>${title}</h3></header>

  <main>${body}</main>

  <script>
    function htmz(frame) {
      setTimeout(() => {
        // ---------------------------------8<-----------------------------------
        // Multitarget (a.k.a out of band updates)
        // ----------------------------------------------------------------------
        // As the HTML spec says that element IDs must be unique,
        // this extension replaces elements that have corresponding elements in
        // the response with the same IDs.
        const mainTargetConsumed = !!frame.contentDocument.querySelector(
          frame.contentWindow.location.hash || null
        );
        const elements = [...frame.contentDocument.querySelectorAll("[id]")];
        // reverse order so we extract children before parents
        for (const element of elements.reverse()) {
          document.getElementById(element.id)?.replaceWith(element);
        }
        if (mainTargetConsumed) return;
        // --------------------------------->8-----------------------------------

        document
          .querySelector(frame.contentWindow.location.hash || null)
          ?.replaceWith(...frame.contentDocument.body.childNodes);
      });
    }
  </script>

  <iframe hidden="" name="htmz" onload="window.htmz(this)"></iframe>
  ${scripts}
</body>
</html>
`
