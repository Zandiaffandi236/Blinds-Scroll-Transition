import gsap from 'gsap';
import Lenis from 'lenis';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- Configuration ---
const CONFIG = {
  lenis: {
    duration: 1.2,
    lerp: 0.1
  },
  animation: {
    stripCount: 30,
    stagger: 0.04,
    duration: 0.5,
    ease: 'power2.out'
  },
  scale: {
    initial: 1.3,
    perSection: 0.1
  }
};

// --- Titles for each section ---
const titles = [
  "Desert Oasis Pool",
  "Domed Sanctuary",
  "Courtyard Retreat",
  "Arched Corridor",
];

// --- Initialize Lenis (smooth scroll) ---
const lenis = new Lenis(CONFIG.lenis);
lenis.on('scroll', ScrollTrigger.update);
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- DOM Elements ---
const images = [
  document.querySelector('#img-2'),
  document.querySelector('#img-3'),
  document.querySelector('#img-4')
];
const titleText = document.getElementById('title-text');
const animatedFlags = Array(images.length).fill(false);
const sectionCount = images.length;

// --- Utility: Generate mask gradient for blinds effect ---
function getMaskGradient(progress, stripCount = CONFIG.animation.stripCount) {
  const stops = [];
  const step = 100 / stripCount;
  const stripDelay = 0.7 / stripCount;

  if (progress === 0) {
    for (let i = 0; i < stripCount; i++) {
      stops.push('black 0% 0%', 'transparent 0% 0%');
    }
    return `linear-gradient(0deg, ${stops.join(', ')})`;
  }

  for (let i = 0; i < stripCount; i++) {
    const stripStart = i * stripDelay;
    let localProgress = (progress - stripStart) / (1 - 0.7);
    localProgress = Math.max(0, Math.min(1, localProgress));

    const base = i * step;
    const top = base + step * localProgress;
    const secondTop = base + step;

    stops.push(
      `black ${base.toFixed(2)}% ${top.toFixed(2)}%`,
      `transparent ${top.toFixed(2)}% ${secondTop.toFixed(2)}%`
    );
  }
  return `linear-gradient(0deg, ${stops.join(', ')})`;
}

// --- Utility: Animate title text with staggered effect ---
function animateTitleText(newText) {
  titleText.innerHTML = '';
  newText.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.style.opacity = 0;
    span.style.transform = 'translateY(40px)';
    titleText.appendChild(span);
  });
  gsap.to(titleText.children, {
    opacity: 1,
    y: 0,
    stagger: CONFIG.animation.stagger,
    duration: CONFIG.animation.duration,
    ease: CONFIG.animation.ease
  });
}

// --- Initialize mask gradients ---
images.forEach(img => {
  img.style.setProperty('--mask-gradient', getMaskGradient(0));
});

// --- Main Scroll Animation: Blinds, Scale, and Title ---
gsap.to({}, {
  scrollTrigger: {
    trigger: '.sticky-slider',
    start: 'top top',
    end: () => `+=${window.innerHeight * 2 * sectionCount}`,
    scrub: true,
    onUpdate: self => {
      const totalProgress = self.progress;
      const sectionProgress = 1 / sectionCount;
      images.forEach((img, i) => {
        // Progress untuk gambar ini
        const start = i * sectionProgress;
        let progress = (totalProgress - start) / sectionProgress;
        progress = Math.max(0, Math.min(1, progress));
        // Progress gambar berikutnya (jika ada)
        let nextProgress = 0;
        if (i < images.length - 1) {
          const nextStart = (i + 1) * sectionProgress;
          let np = (totalProgress - nextStart) / sectionProgress;
          nextProgress = Math.max(0, Math.min(1, np));
        }
        // Scale turun 0.1 saat progress gambar ini, dan 0.1 lagi setelah progress gambar berikutnya selesai
        const scaleValue = CONFIG.scale.initial - CONFIG.scale.perSection * progress - CONFIG.scale.perSection * nextProgress;
        gsap.to(img, {
          scale: scaleValue,
          overwrite: 'auto',
          duration: 0.1
        });
        img.style.setProperty('--mask-gradient', getMaskGradient(progress));
        // Animasi judul
        if (progress > 0.5 && !animatedFlags[i]) {
          animatedFlags[i] = true;
          animateTitleText(titles[i + 1]);
        }
        if (progress <= 0.5 && animatedFlags[i]) {
          animatedFlags[i] = false;
          animateTitleText(i > 0 ? titles[i] : titles[0]);
        }
      });
    }
  }
});

// --- Parallax untuk img-1 ---
gsap.set('#img-1 img', { scale: CONFIG.scale.initial });
gsap.to('#img-1 img', {
  yPercent: -12,
  ease: 'none',
  scrollTrigger: {
    trigger: '#img-1',
    start: 'top bottom',
    endTrigger: '.sticky-slider',
    end: 'top top',
    scrub: true,
  }
});

// --- Parallax img-4 setelah sticky selesai ---
let img4ParallaxTween;
ScrollTrigger.create({
  trigger: '.sticky-slider',
  start: 'top top',
  end: () => `+=${window.innerHeight * 2 * sectionCount}`,
  pin: true,
  anticipatePin: 1,
  onLeave: () => {
    img4ParallaxTween = gsap.to('#img-4 img', {
      yPercent: 10,
      ease: 'none',
      delay: 1,
      scrollTrigger: {
        trigger: '#img-4',
        start: 'center center',
        end: 'bottom top',
        scrub: true,
      }
    });
  },
  onEnterBack: () => {
    if (img4ParallaxTween) {
      img4ParallaxTween.scrollTrigger.kill();
      img4ParallaxTween.kill();
      img4ParallaxTween = null;
    }
  }
});
