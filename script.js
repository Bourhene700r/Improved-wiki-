const searchInput = document.getElementById("search");
const suggestionsList = document.getElementById("suggestions");
const articleContainer = document.getElementById("article-html");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query.length === 0) {
    suggestionsList.innerHTML = "";
    suggestionsList.style.display = "none";
    return;
  }

  fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&origin=*`)
    .then(res => res.json())
    .then(data => {
      suggestionsList.innerHTML = "";
      const results = data[1];

      results.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = item;
        li.style.opacity = "0";
        li.style.animation = "fadeInUp 0.3s ease forwards";
        li.style.animationDelay = `${index * 100}ms`;

        li.addEventListener("click", () => {
          searchInput.value = item;
          suggestionsList.innerHTML = "";
          suggestionsList.style.display = "none";
          hideSummaryPreview();
          fetchArticle(item);
        });

        li.addEventListener("mouseenter", () => {
          showSummaryPreview(item, li);
        });

        li.addEventListener("mouseleave", () => {
          hideSummaryPreview();
        });

        suggestionsList.appendChild(li);
      });

      suggestionsList.style.display = "block";
    });
});

function showSummaryPreview(title, li) {
  fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
    .then(res => res.json())
    .then(data => {
      const preview = document.createElement("div");
      preview.classList.add("popup-content");

      preview.innerHTML = `
        <p><strong>${data.title}</strong></p>
        <p>${data.extract}</p>
      `;

      const tooltip = document.getElementById("tooltip-preview");
      tooltip.innerHTML = preview.innerHTML;
      tooltip.style.display = "block";
      tooltip.style.opacity = 0;
      tooltip.classList.remove("fade-in");
      void tooltip.offsetWidth;
      tooltip.classList.add("fade-in");
      tooltip.style.opacity = 1;

      tooltip.style.top = li.getBoundingClientRect().top + window.scrollY + 15 + "px";
      tooltip.style.left = li.getBoundingClientRect().left + 200 + "px";
    });
}

function hideSummaryPreview() {
  const tooltip = document.getElementById("tooltip-preview");
  tooltip.classList.remove("fade-in");
  tooltip.style.opacity = 0;
  setTimeout(() => {
    tooltip.style.display = "none";
  }, 200);
}

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      suggestionsList.innerHTML = "";
      suggestionsList.style.display = "none";
      hideSummaryPreview();
      fetchArticle(query);
    }
  }
});

function fetchArticle(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(query)}&origin=*`;

  articleContainer.innerHTML = "Loading...";
  articleContainer.classList.remove("fade-in");
  window.scrollTo({ top: 0, behavior: "smooth" });

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        articleContainer.innerHTML = `<p>❌ Article not found.</p>`;
        return;
      }

      const html = data.parse.text["*"];
      articleContainer.innerHTML = html;
      // Show download button with animation
      document.getElementById("download-pdf").classList.remove("show");
document.getElementById("download-pdf").style.display = "none";

const downloadBtn = document.getElementById("download-pdf");
downloadBtn.classList.add("show");
downloadBtn.style.display = "block";


      void articleContainer.offsetWidth;
      articleContainer.classList.add("fade-in");

      const redirectNotice = articleContainer.querySelector("p");
      if (
        redirectNotice &&
        redirectNotice.textContent.trim().startsWith("Redirect to:") &&
        redirectNotice.querySelector("a")
      ) {
        const redirectedTitle = redirectNotice.querySelector("a").getAttribute("href").split("/wiki/")[1];
        fetchArticle(decodeURIComponent(redirectedTitle));
        return;
      }

      const links = articleContainer.querySelectorAll("a");
      links.forEach(link => {
        if (link.href.includes("/wiki/")) {
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const article = link.href.split("/wiki/")[1];
            fetchArticle(article);
          });
        }
      });

      // ⏱ Reading time
      const text = articleContainer.innerText || "";
      const wordsPerMinute = 200;
      const wordCount = text.trim().split(/\s+/).length;
      const minutes = Math.ceil(wordCount / wordsPerMinute);
      const readingTimeEl = document.getElementById("reading-time");
      if (readingTimeEl) {
        readingTimeEl.textContent = `🕒 Estimated reading time: ${minutes} min`;
      }

    })
    .catch(err => {
      articleContainer.innerHTML = `<p>Error loading article.</p>`;
      console.error(err);
    });
}

document.getElementById("toggle-theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  function updateThemeIcon() {
    // No need to manually change icons, CSS handles it now
  }
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

function updateThemeIcon() {
  const icon = document.getElementById("theme-icon");
  if (document.body.classList.contains("dark")) {
    icon.textContent = "🌙";
  } else {
    icon.textContent = "☀️";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  updateThemeIcon(); // still called for consistency
});


window.addEventListener("scroll", () => {
  const scrollTop = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const percent = (scrollTop / height) * 100;
  document.getElementById("progress-bar").style.width = percent + "%";

  document.getElementById("back-to-top").style.display = scrollTop > 300 ? "block" : "none";
});

document.getElementById("back-to-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("mouseover", (e) => {
  if (e.target.closest("#article-html a")) {
    const link = e.target.closest("a");
    const href = link.getAttribute("href");
    if (href && href.includes("/wiki/")) {
      const title = decodeURIComponent(href.split("/wiki/")[1]);
      showSummaryPreview(title, link);
    }
  }
});

document.addEventListener("mouseout", (e) => {
  if (e.target.closest("#article-html a")) {
    hideSummaryPreview();
  }
});
document.addEventListener("mousemove", (e) => {
  const clouds = document.querySelectorAll(".cloud");
  if (!('ontouchstart' in window)) {
    document.addEventListener("mousemove", (e) => {
      const clouds = document.querySelectorAll(".cloud");
      clouds.forEach(cloud => {
        const rect = cloud.getBoundingClientRect();
        const cloudCenterX = rect.left + rect.width / 2;
        const cloudCenterY = rect.top + rect.height / 2;
  
        const dx = cloudCenterX - e.clientX;
        const dy = cloudCenterY - e.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        const maxEffectDistance = 150;
        if (distance < maxEffectDistance) {
          const offsetX = (dx / distance) * (maxEffectDistance - distance);
          const offsetY = (dy / distance) * (maxEffectDistance - distance);
          cloud.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        } else {
          cloud.style.transform = "";
        }
      });
    });
  }
  
  clouds.forEach(cloud => {
    const rect = cloud.getBoundingClientRect();
    const cloudCenterX = rect.left + rect.width / 2;
    const cloudCenterY = rect.top + rect.height / 2;

    const dx = cloudCenterX - e.clientX;
    const dy = cloudCenterY - e.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const maxEffectDistance = 200;
    if (distance < maxEffectDistance) {
      const moveX = (dx / distance) * (maxEffectDistance - distance);
      const moveY = (dy / distance) * (maxEffectDistance - distance);
      cloud.style.transform = `translate(${moveX}px, ${moveY}px)`;
    } else {
      cloud.style.transform = "translate(0, 0)";
    }
  });
});
document.getElementById("download-pdf").addEventListener("click", () => {
  const articleHTML = document.getElementById("article-html");
  const titleMatch = articleHTML.querySelector("h1, h2, h3");
  const title = titleMatch ? titleMatch.innerText.replace(/[^\w\s]/gi, '').slice(0, 40) : "wiki-article";
  
  if (!articleHTML || !articleHTML.innerText.trim()) {
    alert("No article loaded to download.");
    return;
  }

  const opt = {
    margin: 0.5,
    filename: `${title}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Delay for rendering
  setTimeout(() => {
    html2pdf().set(opt).from(articleHTML).save();
  }, 200);
});
