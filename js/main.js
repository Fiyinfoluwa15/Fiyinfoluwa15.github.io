/* ─────────────────────────────────────────────────────────────
   main.js  —  Fiyinfoluwa Balogun portfolio
   Sections:
     1. Nav scroll behaviour
     2. Mobile menu
     3. Scroll reveal
     4. Notion projects fetch
   ───────────────────────────────────────────────────────────── */


/* ── 1. NAV SCROLL BEHAVIOUR ────────────────────────────────── */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});


/* ── 2. MOBILE MENU ─────────────────────────────────────────── */
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});


/* ── 3. SCROLL REVEAL ───────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal-up');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// Hero elements — trigger immediately on load
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal-up').forEach(el => {
    el.classList.add('visible');
  });
});


/* ── 4. GOOGLE SHEETS PROJECTS FETCH ────────────────────────── */

/*
  HOW TO SET UP GOOGLE SHEETS:
  ─────────────────────────────
  1. Create a new Google Sheet
  2. Add these exact headers in row 1:
       title | description | tags | link | image | published
  3. Fill in your projects as rows
       - tags: separate with semicolons e.g.  SQL;Python;EDA
       - image: paste a Google Drive direct link (see README)
       - published: type TRUE to show, FALSE to hide
  4. Click File → Share → Publish to web
       → Select your sheet name
       → Select CSV format
       → Click Publish
       → Copy the URL
  5. Paste the URL below replacing PASTE_YOUR_CSV_URL_HERE
  6. Save and push to GitHub — done!

  ADDING A NEW PROJECT LATER:
  ────────────────────────────
  Just add a new row to the sheet, set published to TRUE.
  It appears on the site within minutes. No code needed!
*/

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR9kzmYM1xrrZeyEbm_bZQBWOUqkZXobl1nexHtjHTXycBtzUiA3jBKic8YMhrtcoztIk0oEW5u3F-X/pub?output=csv';

async function fetchProjects() {
  const loading = document.getElementById('projectsLoading');
  const error   = document.getElementById('projectsError');
  const grid    = document.getElementById('projectsGrid');

  // Sheet not connected yet — show fallback projects
  // if (SHEET_URL === 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR9kzmYM1xrrZeyEbm_bZQBWOUqkZXobl1nexHtjHTXycBtzUiA3jBKic8YMhrtcoztIk0oEW5u3F-X/pub?output=csv') {
  //   loading.classList.add('hidden');
  //   renderFallbackProjects(grid);
  //   return;
  // }

  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error('Sheet fetch failed');

    const csv = await response.text();
    const rows = csv.trim().split('\n').slice(1); // skip header row

    const projects = rows.map(row => {
      // Handle commas inside quoted fields
      const cols = [];
      let current = '';
      let inQuotes = false;
      for (let char of row) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; }
        else { current += char; }
      }
      cols.push(current.trim());

      const [title, description, tags, link, image, published] = cols;
      return { title, description, tags, link, image, published };
    });

    const published = projects.filter(p =>
      p.published?.trim().toUpperCase() === 'TRUE'
    );

    loading.classList.add('hidden');

    if (published.length === 0) {
      renderFallbackProjects(grid);
      return;
    }

    published.forEach((project, i) => {
      const card = buildProjectCard({
        title:       project.title?.trim()       || 'Untitled',
        description: project.description?.trim() || '',
        tags:        project.tags ? project.tags.split(';').map(t => t.trim()) : [],
        link:        project.link?.trim()        || '#',
        image:       project.image?.trim()       || '',
        index: i
      });
      grid.appendChild(card);
    });

  } catch (err) {
    console.error('Sheet error:', err);
    loading.classList.add('hidden');
    error.classList.remove('hidden');
    renderFallbackProjects(grid);
  }
}

function sanitiseImageUrl(url) {
  if (!url) return '';

  // Convert GitHub blob URL to raw
  // e.g. github.com/user/repo/blob/main/image.png → raw.githubusercontent.com/...
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }

  // Convert Google Drive share URL to direct
  // e.g. drive.google.com/file/d/ID/view → drive.google.com/uc?export=view&id=ID
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  return url;
}

const placeholderHTML = (title) => `
  <div class="project-thumb-placeholder">
    <div class="placeholder-bg"></div>
    <div class="placeholder-content">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
      <span>${title}</span>
    </div>
  </div>`;

function buildProjectCard({ title, description, link, image, tags, index }) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.style.animationDelay = (index * 0.1) + 's';

  const tagsHTML = tags.map(t => `<span class="project-tag">${t}</span>`).join('');
  const cleanImage = sanitiseImageUrl(image);

  const wrapper = document.createElement('div');
  wrapper.className = 'project-thumb-wrapper';

  if (cleanImage) {
    const img = document.createElement('img');
    img.className = 'project-thumb';
    img.alt = title;
    img.loading = 'lazy';
    img.src = cleanImage;
    // If image fails to load for any reason, swap in the styled placeholder
    img.onerror = () => {
      wrapper.innerHTML = placeholderHTML(title);
    };
    wrapper.appendChild(img);
  } else {
    wrapper.innerHTML = placeholderHTML(title);
  }

  card.appendChild(wrapper);

  const body = document.createElement('div');
  body.className = 'project-body';
  body.innerHTML = `
    <div class="project-tags">${tagsHTML}</div>
    <h3>${title}</h3>
    <p>${description}</p>
    <a href="${link}" target="_blank" class="project-link">
      View project <span>→</span>
    </a>
  `;
  card.appendChild(body);

  return card;
}

// Fallback — shows existing projects before Google Sheet is connected
function renderFallbackProjects(grid) {
  const fallback = [
    {
      title: 'Python 101 & 102 — EDA',
      description: 'Python fundamentals and Exploratory Data Analysis following FreeCodeCamp and Alex The Analyst curriculum.',
      link: 'https://github.com/Fiyinfoluwa15/python101/blob/main/Python%20101.ipynb',
      tags: ['Python', 'EDA'],
      image: '',
    },
    {
      title: 'Sampling Techniques with R',
      description: 'Applied different statistical sampling techniques in R as part of a university Statistics course.',
      link: 'https://github.com/Fiyinfoluwa15/SAMPLING-WITH-R',
      tags: ['R', 'Statistics'],
      image: '',
    },
    {
      title: 'SQL — Breweries Dataset',
      description: 'A deep-dive SQL project exploring a Breweries dataset, uncovering sales patterns and regional trends.',
      link: 'https://github.com/Fiyinfoluwa15/BREWERIES',
      tags: ['SQL', 'Data Analysis'],
      image: '',
    },
    {
      title: 'Cloud Certifications',
      description: 'A collection of certifications in cloud computing and data analytics earned through focused study.',
      link: 'https://drive.google.com/drive/folders/1O9Dxxa2J1pvf2xqoZKgdCrz-bEJuk0Lr',
      tags: ['Cloud', 'Certifications'],
      image: '',
    },
  ];

  fallback.forEach((project, i) => {
    const card = buildProjectCard({ ...project, index: i });
    grid.appendChild(card);
  });
}

// Run on page load
fetchProjects();

/* ── TESTIMONIALS FETCH ─────────────────────────────────────── */

/*
  SETUP INSTRUCTIONS:
  1. Open her Google Sheet, click the + at the bottom to add a new tab
  2. Name the tab: Testimonials
  3. Add these headers in row 1:
       name | role | quote | stars | avatar | published
  4. Fill in a test row, set published to TRUE
  5. Click File → Share → Publish to web
     → Select the "Testimonials" tab
     → Select CSV format → Publish → Copy the URL
  6. Paste the URL below replacing PASTE_YOUR_TESTIMONIALS_CSV_URL_HERE
*/

const TESTIMONIALS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQXiVNz1VQNkGl_xTHGj9yeOLKjStrMjmrB84os5uLcw-FjvxXhvbzY7LVKY-xtqEbZGlcBAX5b093Q/pub?gid=1854328472&single=true&output=csv';

const FALLBACK_TESTIMONIALS = [
  {
    name: 'Michael',
    role: 'International Promotions Manager · International Recruitment Team',
    quote: 'Fiyin was exceptionally intentional in her approach. She took the time to deeply understand our workflow before suggesting technical solutions — a rare and appreciated quality in a data partner. She translated our "layman\'s terms" into high-quality technical outputs and demonstrated impressive critical thinking. For instance, she steered us away from using confusing week numbers toward a month-based view. This simple recommendation significantly improved data accessibility for new team members and made aligning strategic changes with results much more intuitive. The dashboard has revolutionised how we align initiatives with recruitment peaks — revealing insights that were previously hidden in our historical data.',
    stars: 5,
    avatar: '',
  },
  {
    name: 'Gill',
    role: 'Analyst Developer · Data Architecture Team',
    quote: 'Fiy was very approachable and listened carefully to what was required given the constraints we were working under. She dealt with the work promptly and efficiently. The target was to produce working reports which Fiy delivered on time — working with limited requirement information and access to source data. It seemed to work best when discussing changes and updating Qlik in person, and working this way helped to avoid any errors in understanding.',
    stars: 5,
    avatar: '',
  },
];

async function fetchTestimonials() {
  const loading = document.getElementById('testLoading');
  const error   = document.getElementById('testError');
  const grid    = document.getElementById('testGrid');

  // if (!loading || !grid) return;

  // // Sheet not connected yet — show hardcoded fallback testimonials
  // if (TESTIMONIALS_SHEET_URL === 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQXiVNz1VQNkGl_xTHGj9yeOLKjStrMjmrB84os5uLcw-FjvxXhvbzY7LVKY-xtqEbZGlcBAX5b093Q/pub?gid=1854328472&single=true&output=csv') {
  //   loading.classList.add('hidden');
  //   renderFallbackTestimonials(grid);
  //   return;
  // }

  try {
    const response = await fetch(TESTIMONIALS_SHEET_URL);
    if (!response.ok) throw new Error('Testimonials fetch failed');

    const csv = await response.text();
    const rows = csv.trim().split('\n').slice(1);

    const testimonials = rows.map(row => {
      const cols = [];
      let current = '';
      let inQuotes = false;
      for (let char of row) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; }
        else { current += char; }
      }
      cols.push(current.trim());
      const [name, role, quote, stars, avatar, published] = cols;
      return { name, role, quote, stars, avatar, published };
    });

    const published = testimonials.filter(t =>
      t.published?.trim().toUpperCase() === 'TRUE'
    );

    loading.classList.add('hidden');

    if (published.length === 0) {
      renderFallbackTestimonials(grid);
      return;
    }

    published.forEach((t, i) => {
      const card = buildTestimonialCard({
        name:   t.name?.trim()   || 'Anonymous',
        role:   t.role?.trim()   || '',
        quote:  t.quote?.trim()  || '',
        stars:  parseInt(t.stars?.trim()) || 5,
        avatar: t.avatar?.trim() || '',
        index:  i
      });
      grid.appendChild(card);
    });

  } catch (err) {
    console.error('Testimonials error:', err);
    loading.classList.add('hidden');
    renderFallbackTestimonials(grid);
  }
}

function renderFallbackTestimonials(grid) {
  FALLBACK_TESTIMONIALS.forEach((t, i) => {
    const card = buildTestimonialCard({ ...t, index: i });
    grid.appendChild(card);
  });
}

function buildTestimonialCard({ name, role, quote, stars, avatar, index }) {
  const card = document.createElement('div');
  card.className = 'test-card';
  card.style.animationDelay = (index * 0.1) + 's';

  // Build star rating (max 5)
  const clampedStars = Math.min(Math.max(stars, 1), 5);
  const starsHTML = Array.from({ length: 5 }, (_, i) =>
    `<span class="test-star ${i < clampedStars ? '' : 'empty'}">★</span>`
  ).join('');

  // Avatar — image or initial placeholder
  const cleanAvatar = sanitiseImageUrl(avatar);
  const initial = name.charAt(0).toUpperCase();

  let avatarHTML;
  if (cleanAvatar) {
    avatarHTML = `<img class="test-avatar" src="${cleanAvatar}" alt="${name}"
      onerror="this.outerHTML='<div class=\\'test-avatar-placeholder\\'>${initial}</div>'" />`;
  } else {
    avatarHTML = `<div class="test-avatar-placeholder">${initial}</div>`;
  }

  card.innerHTML = `
    <div class="test-stars">${starsHTML}</div>
    <p class="test-quote">${quote}</p>
    <div class="test-author">
      ${avatarHTML}
      <div class="test-author-info">
        <span class="test-name">${name}</span>
        ${role ? `<span class="test-role">${role}</span>` : ''}
      </div>
    </div>
  `;

  return card;
}

// Run on page load
fetchTestimonials();
