// Scroll spy function
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function setActiveLink() {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  // fallback to first section when at top
  if (!current && sections.length > 0) {
    current = sections[0].getAttribute('id');
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// run on load + scroll
setActiveLink();
window.addEventListener('scroll', setActiveLink);

// Desktop menu — also set active on click
navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    navLinks.forEach(el => el.classList.remove('active'));
    this.classList.add('active');
  });
});

// Mobile menu
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.overlay');

hamburger.addEventListener('click', function () {
  this.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  overlay.classList.toggle('active');
});

function closeMobileMenu() {
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('active');
  overlay.classList.remove('active');
}

mobileNavLinks.forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

overlay.addEventListener('click', closeMobileMenu);

document.addEventListener('click', (e) => {
  if (
    mobileMenu.classList.contains('active') &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeMobileMenu();
  }
});

// LightGallery initialization
document.addEventListener('DOMContentLoaded', () => {

  let lgInstance = null;

  function initGallery() {
    if (lgInstance) {
      lgInstance.destroy();
    }
    lgInstance = lightGallery(document.querySelector('.portfolio-grid'), {
      selector: '.portfolio-item:not(.hidden) a',
      plugins: [lgZoom, lgThumbnail],
      speed: 300,
      download: false,
      mousewheel: false,
    });
  }

  const catTabs = document.querySelectorAll('.cat-tab');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selected = tab.textContent.trim();

      portfolioItems.forEach(item => {
        let categories = [];
        try {
          categories = JSON.parse(item.dataset.category);
        } catch (e) {
          categories = item.dataset.category ? [item.dataset.category] : [];
        }

        if (selected === 'All' || categories.includes(selected)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });

      initGallery();
    });
  });

  initGallery();

});

//Typing animation for about section
const text = `Hi, I'm AELYN.

A designer with no fixed style—because your brand dictates the aesthetic, not me.

Rather than imposing my own aesthetic, I adapt to your goals, your audience, and your vision. I focus on creating digital experiences and visual identities that tell your story.

I specialize in web design and front end web development. Along the way, I've also worked on graphic design, print materials, illustration and a variety of other creative projects.`;

const el = document.getElementById('aboutTyping');
let i = 0;
let isTyping = false;

function startTyping() {
  if (isTyping) return;
  isTyping = true;
  i = 0;
  el.textContent = '';

  function type() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(type, 25); // speed — lower = faster
    }
  }
  type();
}

// start when section is visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      startTyping();
    }
  });
}, { threshold: 0.3 });

observer.observe(document.getElementById('about'));

// Detect iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

if (isIOS()) {
  document.documentElement.classList.add('ios');
}

  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('contactSubmitBtn');
  const status = document.getElementById('contactFormStatus');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending...';
    status.style.display = 'none';

    try {
      const response = await fetch('https://formspree.io/f/mrengpwq', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (response.ok) {
        form.reset();
        status.textContent = "Thanks — your message has been sent. I'll get back to you soon.";
        status.style.color = '#3a5c59';
      } else {
        status.textContent = 'Something went wrong. Please try again or email me directly.';
        status.style.color = '#b3453e';
      }
    } catch (error) {
      status.textContent = 'Something went wrong. Please check your connection and try again.';
      status.style.color = '#b3453e';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      status.style.display = 'block';
    }
  });