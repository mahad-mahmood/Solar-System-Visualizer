class SolarSystemVisualizer {
    constructor() {
        this.canvas = document.getElementById('solar-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;
        this.isPaused = false;
        this.time = 0;
        this.dpr = window.devicePixelRatio || 1;
        this.screenPositions = [];
        this.hoveredPlanet = null;
        this.isTooltipLocked = false;

        // Control elements
        this.speedSlider = document.getElementById('speed-slider');
        this.scaleSlider = document.getElementById('scale-slider');
        this.sizeModeSelect = document.getElementById('size-mode');
        this.viewCenterSelect = document.getElementById('view-center');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.planetInfo = document.getElementById('planet-info');

        // Display elements
        this.speedValue = document.getElementById('speed-value');
        this.scaleValue = document.getElementById('scale-value');

        // Planet data
        this.planets = [
            { name: 'Sun', color: '#FFA500', radius: 20, distance: 0, orbitalPeriod: 0, eccentricity: 0, angle: 0, dayLength: Infinity, rotationAngle: 0, mass: '1.989 × 10³⁰ kg', diameter: '1,392,700 km', info: 'The Sun is a G-type main-sequence star that makes up about 99.86% of the Solar System\'s mass.' },
            { name: 'Mercury', color: '#8C7853', radius: 3, distance: 58, orbitalPeriod: 88, eccentricity: 0.205, angle: 0, dayLength: 1407.6, rotationAngle: 0, mass: '3.301 × 10²³ kg', diameter: '4,879 km', info: 'Mercury is the smallest planet and closest to the Sun. It has extreme temperature variations.' },
            { name: 'Venus', color: '#FFC649', radius: 4, distance: 108, orbitalPeriod: 225, eccentricity: 0.007, angle: 0, dayLength: -5832.5, rotationAngle: 0, mass: '4.867 × 10²⁴ kg', diameter: '12,104 km', info: 'Venus is the hottest planet due to its thick atmosphere and greenhouse effect.' },
            { name: 'Earth', color: '#6B93D6', radius: 4, distance: 150, orbitalPeriod: 365, eccentricity: 0.017, angle: 0, dayLength: 1, rotationAngle: 0, mass: '5.972 × 10²⁴ kg', diameter: '12,756 km', info: 'Earth is the only known planet with life. It has liquid water and a protective atmosphere.' },
            { name: 'Mars', color: '#C1440E', radius: 3, distance: 228, orbitalPeriod: 687, eccentricity: 0.094, angle: 0, dayLength: 1.03, rotationAngle: 0, mass: '6.39 × 10²³ kg', diameter: '6,792 km', info: 'Mars is known as the Red Planet due to iron oxide on its surface.' },
            { name: 'Jupiter', color: '#D8CA9D', radius: 12, distance: 778, orbitalPeriod: 4333, eccentricity: 0.049, angle: 0, dayLength: 0.41, rotationAngle: 0, mass: '1.898 × 10²⁷ kg', diameter: '142,984 km', info: 'Jupiter is the largest planet and has a Great Red Spot storm.' },
            { name: 'Saturn', color: '#FAD5A5', radius: 10, distance: 1432, orbitalPeriod: 10759, eccentricity: 0.057, angle: 0, dayLength: 0.45, rotationAngle: 0, mass: '5.683 × 10²⁶ kg', diameter: '120,536 km', info: 'Saturn is famous for its ring system made of ice and rock.' },
            { name: 'Uranus', color: '#4FD0E7', radius: 6, distance: 2867, orbitalPeriod: 30687, eccentricity: 0.046, angle: 0, dayLength: -0.72, rotationAngle: 0, mass: '8.681 × 10²⁵ kg', diameter: '51,118 km', info: 'Uranus rotates on its side and has a unique magnetic field.' },
            { name: 'Neptune', color: '#4B70DD', radius: 6, distance: 4515, orbitalPeriod: 60190, eccentricity: 0.009, angle: 0, dayLength: 0.67, rotationAngle: 0, mass: '1.024 × 10²⁶ kg', diameter: '49,528 km', info: 'Neptune has the strongest winds in the solar system.' }
        ];

        // Trails storage
        this.trails = new Map();
        this.maxTrailPoints = 180;

        this.initializeEventListeners();
        this.animate();
    }

    initializeEventListeners() {
        // Speed control
        this.speedSlider.addEventListener('input', (e) => {
            this.speedValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
        });

        // Scale control
        this.scaleSlider.addEventListener('input', (e) => {
            this.scaleValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
        });

        // Pause/Resume button
        this.pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            this.pauseBtn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
        });

        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.time = 0;
            this.planets.forEach(planet => planet.angle = 0);
        });

        // Canvas mouse events for planet info
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.hidePlanetInfo());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();

        // Fullscreen toggle
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // View center change
        this.viewCenterSelect.addEventListener('change', () => {
            this.isTooltipLocked = false;
            this.hidePlanetInfo();
        });
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = this.dpr;
        this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    handleMouseMove(e) {
        if (this.isTooltipLocked) return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Find nearest planet within hover radius
        let nearest = null;
        let nearestDist = Infinity;
        for (const item of this.screenPositions) {
            if (item.planet.name === 'Sun') continue;
            const dx = mouseX - item.x;
            const dy = mouseY - item.y;
            const dist = Math.hypot(dx, dy);
            const hoverRadius = Math.max(item.radius + 6, 12);
            if (dist <= hoverRadius && dist < nearestDist) {
                nearest = item;
                nearestDist = dist;
            }
        }

        if (nearest) {
            this.hoveredPlanet = nearest.planet;
            this.showPlanetInfo(nearest.planet, rect.left + nearest.x, rect.top + nearest.y);
            return;
        }

        this.hidePlanetInfo();
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let clicked = null;
        for (const item of this.screenPositions) {
            if (item.planet.name === 'Sun') continue;
            const dist = Math.hypot(x - item.x, y - item.y);
            const hoverRadius = Math.max(item.radius + 6, 12);
            if (dist <= hoverRadius) { clicked = item; break; }
        }
        if (clicked) {
            this.isTooltipLocked = true;
            this.showPlanetInfo(clicked.planet, rect.left + clicked.x, rect.top + clicked.y);
        } else {
            this.isTooltipLocked = false;
            this.hidePlanetInfo();
        }
    }

    showPlanetInfo(planet, mouseX, mouseY) {
        this.planetInfo.classList.remove('hidden');
        this.planetInfo.classList.add('visible');

        document.getElementById('planet-name').textContent = planet.name;
        document.getElementById('planet-distance').textContent = `${planet.distance} million km`;
        document.getElementById('planet-period').textContent = `${planet.orbitalPeriod} days`;
        document.getElementById('planet-diameter').textContent = planet.diameter;
        document.getElementById('planet-mass').textContent = planet.mass;

        const infoRect = this.planetInfo.getBoundingClientRect();
        let left = mouseX + 16;
        let top = mouseY - infoRect.height / 2;
        if (left + infoRect.width > window.innerWidth) left = mouseX - infoRect.width - 16;
        if (top < 0) top = 10;
        if (top + infoRect.height > window.innerHeight) top = window.innerHeight - infoRect.height - 10;
        this.planetInfo.style.left = `${left}px`;
        this.planetInfo.style.top = `${top}px`;
    }

    hidePlanetInfo() {
        this.planetInfo.classList.remove('visible');
        this.planetInfo.classList.add('hidden');
        this.hoveredPlanet = null;
    }

    toggleFullscreen() {
        const container = document.body;
        const isActive = document.body.classList.contains('fullscreen-active');

        const applyFullscreenClass = (active) => {
            document.body.classList.toggle('fullscreen-active', active);
            this.resizeCanvas();
            this.fullscreenBtn.textContent = active ? '🡼 Exit Fullscreen' : '⛶ Fullscreen';
        };

        if (!document.fullscreenElement && !isActive) {
            (container.requestFullscreen ? container.requestFullscreen() : container.webkitRequestFullscreen && container.webkitRequestFullscreen());
            applyFullscreenClass(true);
        } else {
            (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen && document.webkitExitFullscreen());
            applyFullscreenClass(false);
        }
    }

    getPlanetPosition(planet, centerX, centerY, scale) {
        const speed = parseFloat(this.speedSlider.value);
        const angle = (planet.angle * speed) % (2 * Math.PI);

        const a = planet.distance * scale;
        const e = planet.eccentricity;
        const b = a * Math.sqrt(1 - e * e);

        const xHelio = a * Math.cos(angle) * (1 - e * e) / (1 + e * Math.cos(angle));
        const yHelio = b * Math.sin(angle);

        let x = centerX + xHelio;
        let y = centerY + yHelio;

        if (this.viewCenterSelect.value === 'earth') {
            const earth = this.planets.find(p => p.name === 'Earth');
            const earthAngle = (earth.angle * speed) % (2 * Math.PI);
            const ae = earth.distance * scale;
            const ee = earth.eccentricity;
            const be = ae * Math.sqrt(1 - ee * ee);
            const earthXHelio = ae * Math.cos(earthAngle) * (1 - ee * ee) / (1 + ee * Math.cos(earthAngle));
            const earthYHelio = be * Math.sin(earthAngle);
            x = centerX + (xHelio - earthXHelio);
            y = centerY + (yHelio - earthYHelio);
        }

        return { x, y };
    }

    drawStarfield() {
        // Realistic starfield with parallax and twinkle
        const time = Date.now() * 0.001;
        const seed = 1337;
        const rand = (i) => {
            const x = Math.sin(i * 12.9898 + seed) * 43758.5453;
            return x - Math.floor(x);
        };
        const count = 300;
        for (let i = 0; i < count; i++) {
            const depth = 0.2 + rand(i) * 0.8;
            const x = (rand(i + 1) * this.canvas.width / this.dpr + time * 5 * (1 - depth)) % (this.canvas.width / this.dpr);
            const y = rand(i + 2) * this.canvas.height / this.dpr;
            const size = depth < 0.4 ? 0.5 : depth < 0.7 ? 1 : 1.5;
            const twinkle = Math.sin(time * (0.5 + depth) + i) * 0.5 + 0.5;
            const opacity = 0.2 * depth + 0.3 * twinkle * depth;
            this.ctx.fillStyle = `rgba(255,255,255,${opacity})`;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    drawOrbit(planet, centerX, centerY, scale) {
        if (planet.name === 'Sun') return;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        const a = planet.distance * scale;
        const e = planet.eccentricity;
        const b = a * Math.sqrt(1 - e * e);

        for (let angle = 0; angle < 2 * Math.PI; angle += 0.01) {
            const x = centerX + a * Math.cos(angle) * (1 - e * e) / (1 + e * Math.cos(angle));
            const y = centerY + b * Math.sin(angle);

            if (angle === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
    }

    drawPlanet(planet, centerX, centerY, scale) {
        const planetPos = this.getPlanetPosition(planet, centerX, centerY, scale);
        const sizeMultiplier = this.sizeModeSelect.value === 'cartoon' ? 2 : 1;
        const radius = planet.radius * sizeMultiplier;

        // Glow
        const gradient = this.ctx.createRadialGradient(
            planetPos.x, planetPos.y, 0,
            planetPos.x, planetPos.y, radius * 2
        );
        gradient.addColorStop(0, planet.color + '80');
        gradient.addColorStop(1, planet.color + '00');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(planetPos.x, planetPos.y, radius * 2, 0, 2 * Math.PI);
        this.ctx.fill();

        // Body
        this.ctx.fillStyle = planet.color;
        this.ctx.beginPath();
        this.ctx.arc(planetPos.x, planetPos.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Day/Night shading based on sun direction
        const sunPos = this.getPlanetPosition(this.planets[0], centerX, centerY, scale);
        const dx = planetPos.x - sunPos.x;
        const dy = planetPos.y - sunPos.y;
        const dist = Math.hypot(dx, dy) || 1;
        const lx = dx / dist;
        const ly = dy / dist;
        const shadeGradient = this.ctx.createRadialGradient(
            planetPos.x - lx * radius * 0.4,
            planetPos.y - ly * radius * 0.4,
            radius * 0.2,
            planetPos.x,
            planetPos.y,
            radius
        );
        shadeGradient.addColorStop(0, 'rgba(255,255,255,0.15)');
        shadeGradient.addColorStop(0.6, 'rgba(0,0,0,0.0)');
        shadeGradient.addColorStop(1, 'rgba(0,0,0,0.55)');
        this.ctx.fillStyle = shadeGradient;
        this.ctx.beginPath();
        this.ctx.arc(planetPos.x, planetPos.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Rotation indicator (subtle): equator line rotating with day length
        if (planet.dayLength && isFinite(planet.dayLength)) {
            const rot = planet.rotationAngle || 0;
            this.ctx.save();
            this.ctx.translate(planetPos.x, planetPos.y);
            this.ctx.rotate(rot);
            this.ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(-radius * 0.9, 0);
            this.ctx.lineTo(radius * 0.9, 0);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Highlight
        const highlightGradient = this.ctx.createRadialGradient(
            planetPos.x - radius/3, planetPos.y - radius/3, 0,
            planetPos.x - radius/3, planetPos.y - radius/3, radius
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = highlightGradient;
        this.ctx.beginPath();
        this.ctx.arc(planetPos.x, planetPos.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(planet.name, planetPos.x, planetPos.y + radius + 15);

        // Track for hit detection
        this.screenPositions.push({ planet, x: planetPos.x, y: planetPos.y, radius });

        // Update and draw orbit trail
        if (planet.name !== 'Sun') {
            if (!this.trails.has(planet.name)) this.trails.set(planet.name, []);
            const trail = this.trails.get(planet.name);
            trail.push({ x: planetPos.x, y: planetPos.y });
            if (trail.length > this.maxTrailPoints) trail.shift();

            // Draw fading trail
            for (let i = 1; i < trail.length; i++) {
                const p0 = trail[i - 1];
                const p1 = trail[i];
                const t = i / trail.length;
                this.ctx.strokeStyle = `rgba(255,255,255,${0.05 + 0.25 * t})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(p0.x, p0.y);
                this.ctx.lineTo(p1.x, p1.y);
                this.ctx.stroke();
            }
        }
    }

    drawSun(centerX, centerY) {
        const sunRadius = 20 * (this.sizeModeSelect.value === 'cartoon' ? 2 : 1);
        const time = Date.now() * 0.001;

        // Glow
        const glowGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius * 3);
        glowGradient.addColorStop(0, 'rgba(255, 245, 200, 0.6)');
        glowGradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.35)');
        glowGradient.addColorStop(1, 'rgba(255, 120, 0, 0.1)');
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, sunRadius * 3, 0, 2 * Math.PI);
        this.ctx.fill();

        // Body with limb darkening
        const bodyGradient = this.ctx.createRadialGradient(centerX, centerY, sunRadius * 0.1, centerX, centerY, sunRadius);
        bodyGradient.addColorStop(0, '#fff2b3');
        bodyGradient.addColorStop(0.6, '#ffd166');
        bodyGradient.addColorStop(1, '#ff9e2a');
        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, sunRadius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Subtle animated corona
        this.ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            const angle = (i * Math.PI * 2) / 20 + time * 0.3;
            const startX = centerX + Math.cos(angle) * (sunRadius + 2);
            const startY = centerY + Math.sin(angle) * (sunRadius + 2);
            const endX = centerX + Math.cos(angle) * (sunRadius + 8 + Math.sin(time * 2 + i) * 2);
            const endY = centerY + Math.sin(angle) * (sunRadius + 8 + Math.sin(time * 2 + i) * 2);
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }

    drawAsteroidBelt(centerX, centerY, scale) {
        // Between Mars (228) and Jupiter (778). Pick a subset range for visibility.
        const inner = 320 * scale;
        const outer = 480 * scale;
        const sunPos = this.getPlanetPosition(this.planets[0], centerX, centerY, scale);
        const count = 400;
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.35)';
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2 + (i % 7) * 0.01;
            const r = inner + (outer - inner) * ((i * 9301 + 49297) % 233280) / 233280;
            const x = sunPos.x + Math.cos(a) * r;
            const y = sunPos.y + Math.sin(a) * r;
            const s = 0.5 + ((i * 1237) % 7) * 0.1;
            this.ctx.fillRect(x, y, s, s);
        }
    }

    drawDistanceIndicators(centerX, centerY, scale) {
        const majorPlanets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'];
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        majorPlanets.forEach(planetName => {
            const planet = this.planets.find(p => p.name === planetName);
            if (!planet) return;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, planet.distance * scale, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.font = '10px Inter';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${planet.distance}M km`, centerX + planet.distance * scale + 5, centerY);
        });
    }

    updatePlanetPositions() {
        if (this.isPaused) return;
        const speed = parseFloat(this.speedSlider.value);
        this.time += 0.01 * speed;
        this.planets.forEach(planet => {
            if (planet.name !== 'Sun') {
                planet.angle = (this.time * 2 * Math.PI) / planet.orbitalPeriod;
            }
            // Update rotation angle (convert dayLength in days to radians per tick)
            if (planet.dayLength && isFinite(planet.dayLength)) {
                const daysPerTick = 0.01 * speed; // same base step as orbital time but in days
                const rotPerDay = (2 * Math.PI) / Math.abs(planet.dayLength);
                const dir = planet.dayLength >= 0 ? 1 : -1;
                planet.rotationAngle = (planet.rotationAngle || 0) + dir * rotPerDay * daysPerTick;
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.screenPositions = [];

        const centerX = this.canvas.width / (2 * this.dpr);
        const centerY = this.canvas.height / (2 * this.dpr);
        const scale = parseFloat(this.scaleSlider.value);

        // Starfield
        this.drawStarfield();

        // Orbits only in Sun-centered view
        if (this.viewCenterSelect.value !== 'earth') {
            this.planets.forEach(planet => this.drawOrbit(planet, centerX, centerY, scale));
        }

        // Asteroid belt (around the Sun)
        this.drawAsteroidBelt(centerX, centerY, scale);

        // Planets
        this.planets.forEach(planet => {
            if (planet.name === 'Sun') this.drawSun(centerX, centerY);
            else this.drawPlanet(planet, centerX, centerY, scale);
        });

        // Distance indicators only in Sun-centered view
        if (this.viewCenterSelect.value !== 'earth') {
            this.drawDistanceIndicators(centerX, centerY, scale);
        }

        // Update positions
        this.updatePlanetPositions();

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const viz = new SolarSystemVisualizer();
    window.solarSystem = viz;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const visualizer = window.solarSystem;
    if (!visualizer) return;
    switch(e.key) {
        case ' ':
            e.preventDefault();
            visualizer.isPaused = !visualizer.isPaused;
            visualizer.pauseBtn.textContent = visualizer.isPaused ? '▶️ Resume' : '⏸️ Pause';
            break;
        case 'r':
        case 'R':
            visualizer.time = 0;
            visualizer.planets.forEach(planet => planet.angle = 0);
            break;
        case 'Escape':
            visualizer.isTooltipLocked = false;
            visualizer.hidePlanetInfo();
            break;
    }
});


