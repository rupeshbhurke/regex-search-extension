(function main() {
  const LOG = (...args) => console.log("[RegexExtension]", ...args);

  function injectUI() {
    if (document.getElementById("regex-search-pane")) {
      const pane = document.getElementById("regex-search-pane");
      pane.style.display = (pane.style.display === "none") ? "block" : "none";
      return;
    }

    LOG("Injecting search UI...");
    const pane = document.createElement("div");
    pane.id = "regex-search-pane";
    pane.dataset.theme = "light";
    pane.innerHTML = `
      <div class="regex-header">
        <input id="regex-input" placeholder="Enter regex" />
        <select id="theme-toggle">
          <option value="light">🌞 Light</option>
          <option value="dark">🌙 Dark</option>
        </select>
      </div>
      <div class="regex-buttons">
        <button id="search-btn">Search</button>
        <button id="clear-btn">Clear</button>
        <button id="prev-btn">⬆️</button>
        <button id="next-btn">⬇️</button>
      </div>
      <ul id="match-list"></ul>
    `;
    document.body.appendChild(pane);

    let currentMatches = [];
    let currentIndex = -1;

    document.getElementById("theme-toggle").onchange = (e) => {
      pane.dataset.theme = e.target.value;
    };

    document.getElementById("search-btn").onclick = () => {
      clear();
      const pattern = document.getElementById("regex-input").value;
      let regex;
      try { regex = new RegExp(pattern, "gi"); }
      catch (e) { alert("Invalid regex: " + e.message); return; }

      const skipTags = new Set(["SCRIPT", "STYLE", "IFRAME", "NOSCRIPT", "TEXTAREA", "INPUT"]);
      const list = document.getElementById("match-list");

      function highlight(node) {
        if (node.nodeType === 3) {
          const text = node.nodeValue;
          const matches = [...text.matchAll(regex)];
          if (!matches.length) return;

          const span = document.createElement("span");
          let lastIndex = 0;

          matches.forEach((match) => {
            const before = text.substring(lastIndex, match.index);
            const after = text.substring(match.index + match[0].length);
            span.appendChild(document.createTextNode(before));

            const mark = document.createElement("mark");
            mark.textContent = match[0];
            mark.classList.add("regex-highlight");
            span.appendChild(mark);
            currentMatches.push(mark);

            const context = before.slice(-20) + match[0] + after.slice(0, 20);
            const li = document.createElement("li");
            li.textContent = context;
            li.onclick = () => {
              mark.scrollIntoView({ behavior: "smooth", block: "center" });
              mark.style.backgroundColor = "orange";
            };
            list.appendChild(li);

            lastIndex = match.index + match[0].length;
          });

          span.appendChild(document.createTextNode(text.substring(lastIndex)));
          node.parentNode.replaceChild(span, node);
        } else if (node.nodeType === 1 && !skipTags.has(node.tagName)) {
          Array.from(node.childNodes).forEach(highlight);
        }
      }

      highlight(document.body);
      jump(1);
    };

    function jump(dir) {
      if (!currentMatches.length) return;
      if (currentIndex >= 0) currentMatches[currentIndex].style.backgroundColor = "yellow";
      currentIndex = (currentIndex + dir + currentMatches.length) % currentMatches.length;
      const mark = currentMatches[currentIndex];
      mark.style.backgroundColor = "orange";
      mark.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function clear() {
      document.querySelectorAll("mark.regex-highlight").forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      });
      document.getElementById("match-list").innerHTML = "";
      currentMatches = [];
      currentIndex = -1;
    }

    document.getElementById("next-btn").onclick = () => jump(1);
    document.getElementById("prev-btn").onclick = () => jump(-1);
    document.getElementById("clear-btn").onclick = clear;
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", injectUI);
  } else {
    injectUI();
  }

  LOG("Content script active");
})();