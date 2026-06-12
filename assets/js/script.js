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
navLinks.forEach(function(link) {
  link.addEventListener('click', function() {
    navLinks.forEach(el => el.classList.remove('active'));
    this.classList.add('active');
  });
});

// Mobile menu
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.overlay');

hamburger.addEventListener('click', function() {
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

// gallery category filter
const catTabs = document.querySelectorAll('.cat-tab');
const portfolioItems = document.querySelectorAll('.portfolio-item');

catTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    catTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const selected = tab.textContent.trim();

    portfolioItems.forEach(item => {
      // safely handle both string and JSON array
      let categories = [];
      try {
        categories = JSON.parse(item.dataset.category);
      } catch (e) {
        categories = [item.dataset.category]; // fallback to plain string
      }

      if (selected === 'All' || categories.includes(selected)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

$(document).ready(function() {

  // ── Magnific Popup ───────────────────────
  $('.portfolio-grid').magnificPopup({
    delegate: 'a',
    type: 'image',
    mainClass: 'mfp-with-zoom mfp-img-mobile',
    image: { verticalFit: true },
    gallery: { enabled: true },
    zoom: {
      enabled: true,
      duration: 230,
      opener: function(element) {
        return element.find('img');
      }
    },
    callbacks: {
      imageLoadComplete: function() { initZoom(); },
      change: function() { resetZoom(); }
    }
  });

  // ── Zoom State ───────────────────────────
  let scale = 1;
  let isDragging = false;
  let startX, startY;
  let translateX = 0, translateY = 0;
  let lastPinchDist = null;

  // ── Helpers ──────────────────────────────
  function getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function applyTransform(img) {
    img.css({
      transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
      transition: (isDragging || lastPinchDist) ? 'none' : 'transform 0.2s ease'
    });
  }

  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    isDragging = false;
    lastPinchDist = null;
    $('.mfp-img').css({
      transform: '',
      transition: '',
      'will-change': 'auto',
      cursor: ''
    });
  }

  // ── Init ─────────────────────────────────
  function initZoom() {
    const img = $('.mfp-img');
    img.css({ 'will-change': 'transform', cursor: 'zoom-in' });

    // ── Mouse: click to toggle zoom ───────
    img.off('click').on('click', function() {
      scale = scale === 1 ? 2 : 1;
      translateX = 0;
      translateY = 0;
      applyTransform(img);
      img.css('cursor', scale > 1 ? 'grab' : 'zoom-in');
    });

    // ── Mouse: wheel zoom ─────────────────
    img.off('wheel').on('wheel', function(e) {
      e.preventDefault();
      scale += e.originalEvent.deltaY > 0 ? -0.2 : 0.2;
      scale = Math.min(Math.max(scale, 1), 4);
      applyTransform(img);
      img.css('cursor', scale > 1 ? 'grab' : 'zoom-in');
    });

    // ── Mouse: drag ───────────────────────
    img.off('mousedown').on('mousedown', function(e) {
      if (scale === 1) return;
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      img.css('cursor', 'grabbing');
    });

    $(document).off('mousemove.zoom').on('mousemove.zoom', function(e) {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      applyTransform(img);
    });

    $(document).off('mouseup.zoom').on('mouseup.zoom', function() {
      if (!isDragging) return;
      isDragging = false;
      img.css('cursor', scale > 1 ? 'grab' : 'zoom-in');
    });

    // ── Touch: double tap to zoom ─────────
    let lastTap = 0;
    img.off('touchend.zoom').on('touchend.zoom', function(e) {
      const now = Date.now();
      const delta = now - lastTap;
      if (delta < 300 && delta > 0) {
        e.preventDefault();
        scale = scale === 1 ? 2.5 : 1;
        translateX = 0;
        translateY = 0;
        applyTransform(img);
      }
      lastTap = now;
    });

    // ── Touch: pinch + drag ───────────────
    img.off('touchstart.zoom').on('touchstart.zoom', function(e) {
      const touches = e.originalEvent.touches;
      if (touches.length === 1) {
        startX = touches[0].clientX - translateX;
        startY = touches[0].clientY - translateY;
      }
      if (touches.length === 2) {
        lastPinchDist = getPinchDistance(touches);
      }
    });

    img.off('touchmove.zoom').on('touchmove.zoom', function(e) {
      const touches = e.originalEvent.touches;

      if (touches.length === 2) {
        e.preventDefault();
        const dist = getPinchDistance(touches);
        if (lastPinchDist) {
          scale *= dist / lastPinchDist;
          scale = Math.min(Math.max(scale, 1), 4);
          applyTransform(img);
        }
        lastPinchDist = dist;

      } else if (touches.length === 1 && scale > 1) {
        e.preventDefault();
        translateX = touches[0].clientX - startX;
        translateY = touches[0].clientY - startY;
        applyTransform(img);
      }
    });

    img.off('touchend.pinch').on('touchend.pinch', function(e) {
      if (e.originalEvent.touches.length < 2) {
        lastPinchDist = null;
      }
    });
  }

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

// // disable right click
// document.addEventListener('contextmenu', e => e.preventDefault());

// // disable common keyboard shortcuts
// document.addEventListener('keydown', e => {
//   if (
//     e.key === 'F12' ||                          // devtools
//     (e.ctrlKey && e.key === 'u') ||             // view source
//     (e.ctrlKey && e.shiftKey && e.key === 'I') || // devtools
//     (e.ctrlKey && e.shiftKey && e.key === 'J') || // console
//     (e.ctrlKey && e.key === 's')                // save page
//   ) {
//     e.preventDefault();
//   }
// });