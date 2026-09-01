(function () {
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var status = document.getElementById("search-status");
  if (!input || !results || !status) return;

  var index = [];
  var ready = false;

  function params() {
    var query = window.location.search.replace(/^\?/, "").split("&");
    var out = {};
    query.forEach(function (pair) {
      var parts = pair.split("=");
      if (!parts[0]) return;
      out[decodeURIComponent(parts[0])] = decodeURIComponent((parts[1] || "").replace(/\+/g, " "));
    });
    return out;
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function matches(post, needle) {
    if (!needle) return false;
    if (normalize(post.title).indexOf(needle) !== -1) return true;
    if (normalize(post.excerpt).indexOf(needle) !== -1) return true;
    return (post.tags || []).some(function (tag) {
      return normalize(tag).indexOf(needle) !== -1;
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(posts, needle) {
    results.innerHTML = "";
    status.hidden = false;

    if (!needle) {
      status.textContent = "Type to search the archive.";
      return;
    }

    if (posts.length === 0) {
      status.textContent = "No posts matched “" + needle + "”.";
      return;
    }

    status.textContent = posts.length + (posts.length === 1 ? " post" : " posts");
    posts.forEach(function (post) {
      var article = document.createElement("article");
      article.className = "post-card";
      article.innerHTML =
        '<a class="post-card-link" href="' + escapeHtml(post.url) + '">' +
          '<time class="post-card-date">' + escapeHtml(post.date) + "</time>" +
          '<h2 class="post-card-title">' + escapeHtml(post.title) + "</h2>" +
          '<p class="post-card-excerpt">' + escapeHtml(post.excerpt) + "</p>" +
        "</a>";
      results.appendChild(article);
    });
  }

  function run(query) {
    var needle = normalize(query).trim();
    input.value = query;
    if (!ready) return;
    render(index.filter(function (post) { return matches(post, needle); }), needle);
  }

  input.addEventListener("input", function () {
    var value = input.value;
    var url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("q", value);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url);
    run(value);
  });

  var form = document.querySelector(".search-form");
  var indexUrl = (form && form.getAttribute("data-index")) || "/search.json";

  fetch(indexUrl)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      index = data;
      ready = true;
      run(params().q || "");
    })
    .catch(function () {
      status.hidden = false;
      status.textContent = "Search is unavailable right now.";
    });
})();
