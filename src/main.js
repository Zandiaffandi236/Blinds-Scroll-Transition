import gsap from 'gsap';
import Lenis from 'lenis';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  lerp: 0.1,
});

lenis.on('scroll', ScrollTrigger.update);

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const images = [
  document.querySelector('#img-2'),
  document.querySelector('#img-3'),
  document.querySelector('#img-4')
];
const stripCount = 30;
const sectionCount = images.length;

function getMaskGradient(progress, stripCount = 30) {
  const stops = [];
  const step = 100 / stripCount;
  const stripDelay = 0.7 / stripCount; // untuk efek berantai

  for (let i = 0; i < stripCount; i++) {
    // Setiap strip punya delay
    const stripStart = i * stripDelay;
    let localProgress = (progress - stripStart) / (1 - 0.7);
    localProgress = Math.max(0, Math.min(1, localProgress));

    // Hitung posisi vertikal strip (dari bawah ke atas)
    const base = i * step;
    const top = base + step * localProgress;

    // Bagian hitam dari base sampai top, sisanya transparan
    stops.push(
      `black ${base}% ${top}%`,
      `transparent ${top}% ${base + step}%`
    );
  }
  return `linear-gradient(0deg, ${stops.join(', ')})`;
}

// Inisialisasi semua gambar ke strip tertutup
images.forEach(img => {
  img.style.setProperty('--mask-gradient', getMaskGradient(0, stripCount));
});

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

        img.style.setProperty('--mask-gradient', getMaskGradient(progress, stripCount));
      });
    }
  }
});

// Sticky behavior utama
ScrollTrigger.create({
  trigger: '.sticky-slider',
  start: 'top top',
  end: () => `+=${window.innerHeight * 2 * sectionCount}`,
  pin: true,
  anticipatePin: 1,
});
