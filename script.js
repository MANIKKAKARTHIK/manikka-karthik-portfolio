// ---------- Interactive Cyber Particle Constellation ----------
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let particles = [];
  const count = Math.min(window.innerWidth < 768 ? 32 : 65, 75);
  const maxDist = 135;
  let mouse = { x: -1000, y: -1000, active: false };

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  class Particle {
    constructor() {
      this.x = Math.random() * (width || window.innerWidth);
      this.y = Math.random() * (height || window.innerHeight);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.6 + 1.2;
      this.isAccent = Math.random() > 0.72;
      this.alpha = Math.random() * 0.4 + 0.25;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.025;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          this.x -= (dx / dist) * force * 1.6;
          this.y -= (dy / dist) * force * 1.6;
        }
      }
    }
    draw() {
      const currentAlpha = Math.max(0.1, this.alpha + Math.sin(this.pulse) * 0.15);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.isAccent
        ? `rgba(182, 0, 168, ${currentAlpha * 1.2})`
        : `rgba(187, 204, 215, ${currentAlpha})`;
      ctx.fill();

      if (this.isAccent) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(118, 33, 176, 0.15)';
        ctx.fill();
      }
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18;
          ctx.strokeStyle = `rgba(187, 204, 215, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      if (mouse.active) {
        const mdx = mouse.x - particles[i].x;
        const mdy = mouse.y - particles[i].y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 130) {
          const malpha = (1 - mdist / 130) * 0.38;
          ctx.strokeStyle = `rgba(182, 0, 168, ${malpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    init();
  });

  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }, { passive: true });

    heroEl.addEventListener('mouseleave', () => {
      mouse.active = false;
    });
  }

  init();
  animate();
})();

// ---------- reveal on scroll ----------
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ---------- Magnet effect ----------
(function magnet() {
  const el = document.getElementById('magnet');
  const padding = 150, strength = 4;
  let active = false;
  window.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const within = e.clientX > rect.left - padding && e.clientX < rect.right + padding &&
      e.clientY > rect.top - padding && e.clientY < rect.bottom + padding;
    if (within) {
      const ox = (e.clientX - cx) / strength, oy = (e.clientY - cy) / strength;
      el.style.transition = 'transform 0.3s ease-out';
      el.style.transform = `translateX(-50%) translate3d(${ox}px, ${oy}px, 0)`;
      active = true;
    } else if (active) {
      el.style.transition = 'transform 0.6s ease-in-out';
      el.style.transform = 'translateX(-50%) translate3d(0,0,0)';
      active = false;
    }
  }, { passive: true });
})();

// ---------- Marquee: skills ticker with real logos ----------
const DEVICON = (name, variant) => `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-${variant}.svg`;
const techIcons = {
  'HTML': DEVICON('html5', 'original'),
  'CSS': DEVICON('css3', 'original'),
  'Python': DEVICON('python', 'original'),
  'PHP': DEVICON('php', 'original'),
  'Java': DEVICON('java', 'original'),
  'MySQL': DEVICON('mysql', 'original'),
  'Flask': DEVICON('flask', 'original'),
  'Flutter': DEVICON('flutter', 'original'),
  'Firebase': DEVICON('firebase', 'plain'),
  'JDBC': DEVICON('java', 'original'),
};
const skillsRow1 = ["HTML", "CSS", "Python", "PHP", "Java", "JDBC", "MySQL"];
const skillsRow2 = ["Flask", "Flutter", "Firebase", "Cybersecurity", "AI Integration"];
function tripled(arr) { return [...arr, ...arr, ...arr]; }
function iconMarkup(label) {
  const src = techIcons[label];
  if (!src) {
    const initial = label.trim().charAt(0);
    return `<span class="icon-fallback">${initial}</span>`;
  }
  const initial = label.trim().charAt(0);
  return `<img src="${src}" alt="${label} logo" loading="lazy" onerror="this.outerHTML='<span class=&quot;icon-fallback&quot;>${initial}</span>'" />`;
}
function fillRow(id, arr) {
  const el = document.getElementById(id);
  tripled(arr).forEach(label => {
    const chip = document.createElement('span');
    chip.className = 'marquee-chip';
    chip.innerHTML = `${iconMarkup(label)}<span>${label}</span>`;
    el.appendChild(chip);
  });
}
fillRow('row1', skillsRow1);
fillRow('row2', skillsRow2);

const marqueeSection = document.getElementById('marquee');
const row1El = document.getElementById('row1');
const row2El = document.getElementById('row2');
function updateMarquee() {
  const rect = marqueeSection.getBoundingClientRect();
  const sectionTop = rect.top + window.scrollY;
  const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
  row1El.style.transform = `translateX(${offset - 200}px)`;
  row2El.style.transform = `translateX(${-(offset - 200)}px)`;
}
window.addEventListener('scroll', updateMarquee, { passive: true });
updateMarquee();

// ---------- About animated text ----------
const aboutCopy = "My name is Manikka Karthik M. I am a B.Tech Information Technology student and web developer interested in building modern web applications, full-stack development and cybersecurity.";
const aboutTextEl = document.getElementById('about-text');
if (aboutTextEl) {
  aboutTextEl.textContent = '';
  const chars = Array.from(aboutCopy);
  chars.forEach(ch => {
    const span = document.createElement('span');
    span.className = 'ch';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    aboutTextEl.appendChild(span);
  });
}
const chEls = aboutTextEl.querySelectorAll('.ch');
function updateAboutText() {
  const rect = aboutTextEl.getBoundingClientRect();
  const vh = window.innerHeight;
  const startPoint = vh * 0.8;
  const endPoint = vh * 0.2;
  const totalDist = (startPoint + rect.height) - endPoint;
  let progress = (startPoint - rect.top) / totalDist;
  progress = Math.max(0, Math.min(1, progress));
  const n = chEls.length;
  chEls.forEach((span, i) => {
    const start = i / n, end = start + 1 / n;
    let local = (progress - start) / (end - start);
    local = Math.max(0, Math.min(1, local));
    span.style.opacity = 0.2 + local * 0.8;
  });
}
window.addEventListener('scroll', updateAboutText, { passive: true });
window.addEventListener('resize', updateAboutText);
updateAboutText();

// ---------- Skills list (services template) ----------
const services = [
  { number: '01', name: 'Full-Stack Web Development', icons: ['HTML', 'CSS', 'PHP'], description: 'Building complete web applications end to end -- from interface to backend to database, with clean design and real functionality.' },
  { number: '02', name: 'Python & Java Development', icons: ['Python', 'Java'], description: 'Writing application logic and backend systems across both ecosystems for real-world projects.' },
  { number: '03', name: 'Database Development with MySQL', icons: ['MySQL', 'JDBC'], description: 'Designing schemas, queries, and JDBC-connected data layers behind the applications i build.' },
  { number: '04', name: 'Flutter & Firebase Development', icons: ['Flutter', 'Firebase'], description: 'Building cross-platform mobile apps backed by real-time cloud services and authentication.' },
  { number: '05', name: 'Cybersecurity & AI Integration', icons: [], description: 'Exploring application security, authentication, and integrating AI features into practical, working software.' }
];

function serviceIconRow(icons) {
  if (!icons.length) return '';
  return `<div class="service-icons">${icons.map(label => {
    const src = techIcons[label];
    const initial = label.trim().charAt(0);
    if (!src) return `<span class="icon-fallback" style="background:rgba(12,12,12,0.08);color:#0C0C0C;">${initial}</span>`;
    return `<img src="${src}" alt="${label} logo" loading="lazy" onerror="this.outerHTML='<span class=&quot;icon-fallback&quot; style=&quot;background:rgba(12,12,12,0.08);color:#0C0C0C;&quot;>${initial}</span>'" />`;
  }).join('')}</div>`;
}

const servicesListEl = document.getElementById('services-list');
services.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'service-item reveal';
  item.style.setProperty('--fdelay', `${i * 0.1}s`);
  item.style.setProperty('--fy', '20px');
  item.innerHTML = `
  <span class="service-num">${s.number}</span>
  <div class="service-body">
    <div class="service-name-row">
      <h3 class="service-name">${s.name}</h3>
      ${serviceIconRow(s.icons)}
    </div>
    <p class="service-desc">${s.description}</p>
  </div>`;
  servicesListEl.appendChild(item);
  revealObserver.observe(item);
});

// ---------- Skills Interactive PCB Circuit Canvas ----------
(function initSkillsCircuit() {
  const canvas = document.getElementById('skills-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let traces = [];
  let pulses = [];
  let mouse = { x: -1000, y: -1000, active: false };

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    buildCircuits();
  }

  function buildCircuits() {
    traces = [];
    pulses = [];
    const numTracks = Math.max(6, Math.floor(height / 110));
    for (let i = 0; i < numTracks; i++) {
      const startY = (i + 0.5) * (height / numTracks);
      const isLtoR = i % 2 === 0;
      const x1 = isLtoR ? 0 : width;
      const x2 = isLtoR ? width * 0.32 : width * 0.68;
      const y2 = startY;
      const x3 = isLtoR ? x2 + 60 : x2 - 60;
      const y3 = startY + (i % 2 === 0 ? 36 : -36);
      const x4 = isLtoR ? width : 0;
      const y4 = y3;

      const path = [
        { x: x1, y: startY },
        { x: x2, y: y2 },
        { x: x3, y: y3 },
        { x: x4, y: y4 }
      ];

      traces.push({
        points: path,
        solderPads: [{ x: x2, y: y2 }, { x: x3, y: y3 }]
      });

      pulses.push({
        pathIndex: traces.length - 1,
        progress: (i * 0.15) % 1,
        speed: 0.0016 + Math.random() * 0.0012,
        color: i % 2 === 0 ? '#7621B0' : '#B600A8'
      });
    }
  }

  function getPointOnPath(points, t) {
    let totalLen = 0;
    const lens = [];
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      const l = Math.sqrt(dx * dx + dy * dy);
      lens.push(l);
      totalLen += l;
    }
    let target = t * totalLen;
    for (let i = 0; i < lens.length; i++) {
      if (target <= lens[i]) {
        const segT = target / lens[i];
        return {
          x: points[i].x + (points[i + 1].x - points[i].x) * segT,
          y: points[i].y + (points[i + 1].y - points[i].y) * segT
        };
      }
      target -= lens[i];
    }
    return points[points.length - 1];
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    traces.forEach(trace => {
      ctx.beginPath();
      ctx.moveTo(trace.points[0].x, trace.points[0].y);
      for (let i = 1; i < trace.points.length; i++) {
        ctx.lineTo(trace.points[i].x, trace.points[i].y);
      }
      ctx.strokeStyle = 'rgba(12, 12, 12, 0.055)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      trace.solderPads.forEach(pad => {
        ctx.beginPath();
        ctx.arc(pad.x, pad.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(12, 12, 12, 0.14)';
        ctx.fill();
      });
    });

    pulses.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;

      const path = traces[p.pathIndex].points;
      const pt = getPointOnPath(path, p.progress);

      let pulseRadius = 3.2;
      let glow = 8;
      if (mouse.active) {
        const mdx = mouse.x - pt.x;
        const mdy = mouse.y - pt.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          pulseRadius = 5;
          glow = 18;
        }
      }

      ctx.save();
      ctx.shadowBlur = glow;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  const skillsSec = document.getElementById('skills');
  if (skillsSec) {
    skillsSec.addEventListener('mousemove', (e) => {
      const rect = skillsSec.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }, { passive: true });

    skillsSec.addEventListener('mouseleave', () => {
      mouse.active = false;
    });
  }

  resize();
  animate();
})();

// ---------- Projects (placeholder visuals in the same slots) ----------
const projects = [
  {
    number: '01', category: 'Full-Stack', name: 'E-Commerce Platform',
    tag1: 'PRODUCT LISTING', tag2: 'CART & CHECKOUT', tag3: 'E-COMMERCE PLATFORM'
  },
  {
    number: '02', category: 'Database + Backend', name: 'Hospital Management System',
    tag1: 'PATIENT RECORDS', tag2: 'MySQL + JDBC', tag3: 'HOSPITAL MANAGEMENT SYSTEM'
  },
  {
    number: '03', category: 'Security', name: 'Cybersecurity Project',
    tag1: 'AUTHENTICATION', tag2: 'THREAT DEFENSE', tag3: 'CYBERSECURITY PROJECT'
  }
];

const projectsListEl = document.getElementById('projects-list');
const total = projects.length;
const scrollers = [];

projects.forEach((p, i) => {
  const scroller = document.createElement('div');
  scroller.className = 'project-scroller';

  const sticky = document.createElement('div');
  sticky.className = 'project-card-sticky';
  sticky.style.top = `${96 + i * 28}px`;

  const targetScale = 1 - (total - 1 - i) * 0.03;

  sticky.innerHTML = `
  <div class="project-card">
    <div class="project-top">
      <div class="project-top-left">
        <span class="project-num">${p.number}</span>
        <div class="project-meta">
          <span class="project-cat">${p.category}</span>
          <span class="project-name">${p.name}</span>
        </div>
      </div>
      <button class="btn-live">Live Project</button>
    </div>
    <div class="project-images">
      <div class="project-col1">
        <div class="ph-box" style="background:linear-gradient(150deg,#1B2130,#0E1219);border:1px solid rgba(215,226,234,0.15);">${p.tag1}</div>
        <div class="ph-box" style="background:linear-gradient(150deg,#171C29,#0B0E14);border:1px solid rgba(215,226,234,0.15);">${p.tag2}</div>
      </div>
      <div class="project-col2">
        <div class="ph-box" style="background:linear-gradient(160deg,#20263A,#0C0C0C);border:1px solid rgba(215,226,234,0.15);">${p.tag3}</div>
      </div>
    </div>
  </div>`;

  scroller.appendChild(sticky);
  projectsListEl.appendChild(scroller);
  scrollers.push({ scroller, sticky, targetScale });
});

function updateProjectScales() {
  scrollers.forEach(({ scroller, sticky, targetScale }) => {
    const rect = scroller.getBoundingClientRect();
    const h = rect.height;
    let progress = -rect.top / h;
    progress = Math.max(0, Math.min(1, progress));
    const scale = 1 + (targetScale - 1) * progress;
    sticky.style.transform = `scale(${scale})`;
  });
}
window.addEventListener('scroll', updateProjectScales, { passive: true });
window.addEventListener('resize', updateProjectScales);
updateProjectScales();

// ---------- Projects Autonomous Radar & Cyber Telemetry Canvas ----------
(function initProjectsRadarCanvas() {
  const canvas = document.getElementById('projects-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let nodes = [];
  let radarAngle = 0;
  let rings = [];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    width = parent.clientWidth;
    height = parent.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    initNodes();
  }

  function initNodes() {
    nodes = [];
    const count = Math.min(42, Math.max(18, Math.floor((width * height) / 45000)));
    const hexChars = '0123456789ABCDEF';
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.2,
        alpha: Math.random() * 0.5 + 0.25,
        color: i % 3 === 0 ? '#7621B0' : (i % 3 === 1 ? '#2D8CF0' : '#D7E2EA'),
        hasTag: i % 5 === 0,
        tag: '0x' + hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)]
      });
    }

    rings = [
      { x: width * 0.18, y: height * 0.22, maxR: 220, r: 40, speed: 0.35, color: 'rgba(118, 33, 176, ' },
      { x: width * 0.85, y: height * 0.58, maxR: 260, r: 80, speed: 0.3, color: 'rgba(45, 140, 240, ' },
      { x: width * 0.45, y: height * 0.85, maxR: 200, r: 10, speed: 0.38, color: 'rgba(182, 0, 168, ' }
    ];
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw pulsating sonar radar rings
    rings.forEach(ring => {
      ring.r += ring.speed;
      if (ring.r > ring.maxR) ring.r = 0;
      const prog = ring.r / ring.maxR;
      const alpha = (1 - prog) * 0.22;

      ctx.save();
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color + alpha + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Subtle concentric inner ring
      if (ring.r > 50) {
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color + (alpha * 0.5) + ')';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Center crosshair marker
      ctx.beginPath();
      ctx.moveTo(ring.x - 8, ring.y);
      ctx.lineTo(ring.x + 8, ring.y);
      ctx.moveTo(ring.x, ring.y - 8);
      ctx.lineTo(ring.x, ring.y + 8);
      ctx.strokeStyle = ring.color + '0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });

    // Rotating radar beam from ring 1
    if (rings.length > 1) {
      const mainCenter = rings[1];
      radarAngle += 0.009;
      const beamLen = 220;
      const bx = mainCenter.x + Math.cos(radarAngle) * beamLen;
      const by = mainCenter.y + Math.sin(radarAngle) * beamLen;

      ctx.save();
      const sweepGrad = ctx.createLinearGradient(mainCenter.x, mainCenter.y, bx, by);
      sweepGrad.addColorStop(0, 'rgba(45, 140, 240, 0.2)');
      sweepGrad.addColorStop(1, 'rgba(45, 140, 240, 0)');
      ctx.beginPath();
      ctx.moveTo(mainCenter.x, mainCenter.y);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Draw connections between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          const alpha = (1 - dist / 110) * 0.16;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(215, 226, 234, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Update and draw nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0) n.x = width;
      if (n.x > width) n.x = 0;
      if (n.y < 0) n.y = height;
      if (n.y > height) n.y = 0;

      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = n.alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = n.color;
      ctx.fill();

      if (n.hasTag) {
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(215, 226, 234, 0.25)';
        ctx.fillText(n.tag, n.x + 5, n.y - 4);
      }
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
  animate();
})();

// ---------- Contact Me Buttons Smooth Scroll ----------
document.querySelectorAll('.btn-contact').forEach(btn => {
  btn.addEventListener('click', () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ---------- Contact Form Submission (FormSubmit AJAX direct email) ----------
async function submitContactForm() {
  const nameInput = document.getElementById('c-name');
  const emailInput = document.getElementById('c-email');
  const subjectInput = document.getElementById('c-subject');
  const msgInput = document.getElementById('c-message');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('btn-submit');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const subject = (subjectInput && subjectInput.value.trim()) || 'New Portfolio Inquiry';
  const msg = msgInput ? msgInput.value.trim() : '';

  if (!name || !email || !msg) {
    if (statusEl) {
      statusEl.className = 'form-status-msg mono error';
      statusEl.style.display = 'block';
      statusEl.textContent = '⚠ Please fill in all required fields.';
    }
    return;
  }

  // Check if page is opened as a local file (file:///)
  if (window.location.protocol === 'file:') {
    if (statusEl) {
      statusEl.className = 'form-status-msg mono';
      statusEl.style.display = 'block';
      statusEl.textContent = 'ℹ Local file:// detected (FormSubmit API requires a web server like localhost or GitHub Pages). Opening mail client...';
    }
    const mailtoFallback = `mailto:manikkakarthik12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + msg)}`;
    setTimeout(() => {
      window.location.href = mailtoFallback;
    }, 400);
    return;
  }

  // Update UI to transmitting / loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting Uplink...';
  }
  if (statusEl) {
    statusEl.className = 'form-status-msg mono loading';
    statusEl.style.display = 'block';
    statusEl.textContent = '> Encrypting packet and transmitting to manikkakarthik12@gmail.com...';
  }

  try {
    const response = await fetch('https://formsubmit.co/ajax/manikkakarthik12@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        _subject: `Portfolio Message: ${subject} (from ${name})`,
        message: msg,
        _template: 'table',
        _captcha: 'false'
      })
    });

    const data = await response.json();
    const isSuccess = data.success === 'true' || data.success === true;

    if (response.ok && isSuccess) {
      if (statusEl) {
        statusEl.className = 'form-status-msg mono';
        statusEl.style.display = 'block';
        statusEl.textContent = "✓ Transmit complete! Your message has been sent to Karthik's inbox.";
      }
      const form = document.getElementById('contact-form');
      if (form) form.reset();
    } else if (data.message && data.message.includes('Activation')) {
      if (statusEl) {
        statusEl.className = 'form-status-msg mono';
        statusEl.style.display = 'block';
        statusEl.textContent = "ℹ Activation needed: FormSubmit sent an activation link to manikkakarthik12@gmail.com. Check your Spam/Inbox and click 'Activate Form'!";
      }
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch (err) {
    console.error('Submission error:', err);
    if (statusEl) {
      statusEl.className = 'form-status-msg mono error';
      statusEl.style.display = 'block';
      const fallbackMailto = `mailto:manikkakarthik12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + msg)}`;
      statusEl.innerHTML = `⚠ Transmission error (${err.message || 'Network'}). <a href="${fallbackMailto}" style="color:#00FF88;text-decoration:underline;">Click here to send directly via email</a>`;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Transmit Message &rarr;';
    }
  }
}

// ---------- Skills Section Dynamic Mouse Spotlight ----------
const skillsSec = document.getElementById('skills');
if (skillsSec) {
  skillsSec.addEventListener('mousemove', (e) => {
    const rect = skillsSec.getBoundingClientRect();
    skillsSec.style.setProperty('--sk-x', `${e.clientX - rect.left}px`);
    skillsSec.style.setProperty('--sk-y', `${e.clientY - rect.top}px`);
  }, { passive: true });
}
