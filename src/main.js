import gsap from 'gsap';
import Lenis from 'lenis';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Configuration
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
  }
};

// Titles for each section
const titles = [
  "Desert Oasis Pool",
  "Domed Sanctuary",
  "Courtyard Retreat",
  "Arched Corridor",
];

// Initialize Lenis
const lenis = new Lenis(CONFIG.lenis);
lenis.on('scroll', ScrollTrigger.update);

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// DOM Elements
const images = [
  document.querySelector('#img-2'),
  document.querySelector('#img-3'),
  document.querySelector('#img-4')
];
const titleText = document.getElementById('title-text');
const animatedFlags = Array(images.length).fill(false);
const sectionCount = images.length;

// Utility Functions
function getMaskGradient(progress, stripCount = CONFIG.animation.stripCount) {
  const stops = [];
  const step = 100 / stripCount;
  const stripDelay = 0.7 / stripCount;

  if (progress === 0) {
    for (let i = 0; i < stripCount; i++) {
      stops.push(
        'black 0% 0%',
        'transparent 0% 0%'
      );
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

    const roundedBase = Number(base.toFixed(2));
    const roundedTop = Number(top.toFixed(2));
    const roundedSecondTop = Number(secondTop.toFixed(2));

    stops.push(
      `black ${roundedBase}% ${roundedTop}%`,
      `transparent ${roundedTop}% ${roundedSecondTop}%`
    );

  }

  return `linear-gradient(0deg, ${stops.join(', ')})`;
}

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

// Initialize images
images.forEach(img => {
  img.style.setProperty('--mask-gradient', getMaskGradient(0));
});

// Main Scroll Animation
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
        const start = i * sectionProgress;
        const end = (i + 1) * sectionProgress;
        let progress = (totalProgress - start) / sectionProgress;
        progress = Math.max(0, Math.min(1, progress));
        const scaleValue = 1.2 - 0.2 * progress;

        gsap.to(img, {
          scale: scaleValue,
          overwrite: "auto",
          duration: 0.1
        });

        img.style.setProperty('--mask-gradient', getMaskGradient(progress));

        if (progress > 0.5 && !animatedFlags[i]) {
          animatedFlags[i] = true;
          animateTitleText(titles[i + 1]);
        }

        if (progress <= 0.5 && animatedFlags[i]) {
          animatedFlags[i] = false;
          if (i > 0) {
            animateTitleText(titles[i]);
          } else {
            animateTitleText(titles[0]);
          }
        }
      });
    } 
  }
});

gsap.set('#img-1 img', { scale: 1.3 });
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

// Sticky behavior
ScrollTrigger.create({
  trigger: '.sticky-slider',
  start: 'top top',
  end: () => `+=${window.innerHeight * 2 * sectionCount}`,
  pin: true,
  anticipatePin: 1,
});
