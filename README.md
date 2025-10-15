# Solar System Visualizer

An interactive, real-time visualization of our solar system with realistic orbital mechanics and smooth animations.

## Features

### Realistic Orbital Mechanics
- Elliptical orbits with appropriate eccentricity
- Relative orbital periods that reflect real speeds
- Distances based on astronomical data (in millions of kilometers)

### Interactive Controls
- Speed control: 0.1x to 5x
- Scale control: 0.5x to 10x for visibility
- Size modes: realistic or simplified
- View centers: Sun-centered or Earth-centered
- Pause/Resume and Reset

### Interactive Elements
- Planet information on hover: distance from Sun, orbital period, diameter, mass, and quick facts
- Responsive design for desktop, tablet, and mobile

### Visual Enhancements
- Animated starfield background
- Subtle solar glow
- Shaded planet rendering
- Orbit trails and distance indicators
- Clean, modern UI

## Getting Started

1. Get the project files (clone or download).
2. Open `index.html` in any modern web browser.
3. Use the on-screen controls to explore the solar system.

No installation is required; this is a plain HTML/CSS/JavaScript project.

## Controls

### Keyboard Shortcuts
- Space: Pause/Resume animation
- R: Reset to starting positions

### Mouse Controls
- Hover: Display planet information
- Click: Show detailed information

### Sliders and Buttons
- Animation Speed: 0.1x – 5x
- Scale: 0.5x – 10x
- Planet Size Mode: Realistic or simplified
- View Center: Sun or Earth
- Pause/Resume and Reset

## Planet Data

The visualizer includes the Sun and all eight planets with representative data:

| Planet | Distance (M km) | Orbital Period (days) | Eccentricity |
|--------|------------------|-----------------------|--------------|
| Mercury | 58 | 88 | 0.205 |
| Venus | 108 | 225 | 0.007 |
| Earth | 150 | 365 | 0.017 |
| Mars | 228 | 687 | 0.094 |
| Jupiter | 778 | 4,333 | 0.049 |
| Saturn | 1,432 | 10,759 | 0.057 |
| Uranus | 2,867 | 30,687 | 0.046 |
| Neptune | 4,515 | 60,190 | 0.009 |

## Technical Details

### Technologies
- HTML5 Canvas for 2D rendering
- CSS3 for layout, animations, and styling
- Vanilla JavaScript for performance and simplicity
- Web fonts for typography

### Performance
- requestAnimationFrame for smooth animations
- Efficient drawing and updates
- Responsive canvas sizing
- Memory-conscious rendering

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Customization

The visualizer is designed to be easy to extend:

### Adding Bodies
Edit the `planets` array in `script.js` to add new objects.

### Colors and Styles
Adjust each planet's `color` property and update `styles.css` for theme changes.

### Physics Parameters
Adjust orbital calculations in `getPlanetPosition()` as needed.

## Educational Use

Useful for:
- Students learning planetary motion and orbital mechanics
- Teachers demonstrating astronomical concepts
- Enthusiasts exploring the solar system interactively
- Developers studying canvas-based animations

## License

This project is open source under the MIT License.


Enjoy exploring our solar system.

