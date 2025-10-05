<template>
  <section class="hero hero-seamless" aria-label="Space Biology Knowledge Engine">
    <!-- Starfield Background -->
    <div class="stars-background" aria-hidden="true"></div>
    
    <!-- 3D Globe -->
    <div class="globe-container" aria-hidden="true">
      <div class="globe-frame">
        <canvas 
          ref="globeCanvas" 
          class="globe-canvas"
          :class="{ 'reduced-motion': reducedMotion }"
        ></canvas>
        <div class="globe-glow"></div>
      </div>
    </div>

    <!-- Centered content -->
    <div class="hero-content">
      <div class="content-wrapper">
        <h1 class="title">
          <span class="title-space">TerraPaper</span>
          <span class="title-engine">Knowledge Engine</span>
        </h1>
        <p class="subtitle">
          intelligent dashboard that turns NASA’s bioscience papers and your own into simple insights.
        </p>
        <div class="cta">
          <RouterLink to="/search" class="btn btn--primary">
            <span class="btn-icon">🔍</span>
            <span>Start Searching</span>
          </RouterLink>
          <RouterLink to="/chat" class="btn btn--ghost">
            <span class="btn-icon">💬</span>
            <span>AI Assistant</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import createGlobe from 'cobe';

const globeCanvas = ref<HTMLCanvasElement | null>(null);

const reducedMotion = computed(() =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

let phi = 0;
let globe: any = null;

function resizeGlobe() {
  if (!globeCanvas.value) return;
  
  const canvas = globeCanvas.value;
  const frame = canvas.parentElement as HTMLElement;
  const rect = frame.getBoundingClientRect();
  const side = Math.floor(Math.min(rect.width, rect.height)); // enforce square
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Resize the canvas element
  canvas.style.width = side + 'px';
  canvas.style.height = side + 'px';
  canvas.width = Math.floor(side * dpr);
  canvas.height = Math.floor(side * dpr);

  // Update Cobe instance if it exists
  if (globe) {
    globe.destroy();
    initGlobe();
  }
}

function initGlobe() {
  if (!globeCanvas.value) return;
  
  const canvas = globeCanvas.value;
  const side = parseInt(canvas.style.width) || 600;
  
  globe = createGlobe(canvas, {
    devicePixelRatio: 2,
    width: side * 2,
    height: side * 2,
    phi: 0,
    theta: 0.3,
    dark: 1,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 6,
    baseColor: [0.004, 0.051, 0.627], // #0033A0 in RGB 0-1 range
    markerColor: [0.039, 0.506, 0.820], // #0A81D1 in RGB 0-1 range
    glowColor: [0.039, 0.506, 0.820], // #0A81D1 glow
    markers: [
      { location: [37.7595, -122.4367], size: 0.03 }, // San Francisco
      { location: [40.7128, -74.006], size: 0.03 }, // New York
      { location: [51.5074, -0.1278], size: 0.03 }, // London
      { location: [35.6762, 139.6503], size: 0.03 }, // Tokyo
      { location: [-33.8688, 151.2093], size: 0.03 }, // Sydney
    ],
    onRender: (state) => {
      if (!reducedMotion.value) {
        state.phi = phi;
        phi += 0.003;
      }
      const currentSide = parseInt(globeCanvas.value?.style.width || '600');
      state.width = currentSide * 2;
      state.height = currentSide * 2;
    }
  });
}

onMounted(() => {
  resizeGlobe();
  initGlobe();
  window.addEventListener('resize', resizeGlobe, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeGlobe);
  if (globe) {
    globe.destroy();
  }
});
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, 
    #000714 0%, 
    #001030 40%, 
    #001940 70%,
    #0033A0 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-seamless {
  margin: 0 !important;
  padding: 0 !important;
  margin-top: 0 !important;
  padding-top: 0 !important;
  border-top: none !important;
}

/* Animated Starfield Background */
.stars-background {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(2px 2px at 90% 60%, #0A81D1, transparent),
    radial-gradient(1px 1px at 33% 85%, white, transparent),
    radial-gradient(1px 1px at 15% 70%, white, transparent);
  background-size: 200% 200%, 200% 200%, 300% 300%, 250% 250%, 200% 200%, 280% 280%, 220% 220%;
  background-position: 0% 0%;
  animation: twinkle 8s ease-in-out infinite;
  opacity: 0.6;
  z-index: 1;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* Globe Container - fills hero and centers child */
.globe-container {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 1;
}

/* Square frame that defines globe's size */
.globe-frame {
  position: relative;
  width: min(90vmin, 800px);
  aspect-ratio: 1 / 1;
}

/* Canvas fills the frame exactly */
.globe-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  overflow: hidden;
}

.globe-canvas.reduced-motion {
  animation: none !important;
}

/* Blue atmospheric glow */
.globe-glow {
  position: absolute;
  inset: -8%;
  border-radius: 50%;
  background: radial-gradient(50% 50% at 50% 60%,
    rgba(10, 129, 209, 0.35) 0%,
    rgba(10, 129, 209, 0.10) 60%,
    rgba(10, 129, 209, 0) 100%);
  filter: blur(22px);
  z-index: -1;
  animation: pulse-glow 4s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Content Styling */
.hero-content {
  position: relative;
  z-index: 3;
  max-width: 1400px;
  padding: clamp(2rem, 5vw, 4rem);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.content-wrapper {
  max-width: 900px;
  text-align: center;
  padding: 2rem;
  background: radial-gradient(ellipse at center, rgba(0, 8, 20, 0.7) 0%, rgba(0, 8, 20, 0.3) 50%, transparent 70%);
  border-radius: 20px;
}

.title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 1.1;
  margin-bottom: 1.5rem;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
}

.title-space {
  background: linear-gradient(135deg, #ffffff 0%, #e0f2ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(255, 255, 255, 0.1);
  animation: float 3s ease-in-out infinite;
}

.title-engine {
  background: linear-gradient(135deg, #0A81D1 0%, #69C6FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(10, 129, 209, 0.5));
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(10, 129, 209, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(10, 129, 209, 0.8));
  }
}

.subtitle {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  line-height: 1.6;
  color: #b8d4f5;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

/* CTA Buttons */
.cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-icon {
  font-size: 1.2rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.btn--primary {
  background: linear-gradient(135deg, #0A81D1 0%, #0066cc 100%);
  color: white;
  border: 2px solid #0A81D1;
  box-shadow: 0 10px 30px rgba(10, 129, 209, 0.4);
}

.btn--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(10, 129, 209, 0.6);
}

.btn--primary:hover .btn-icon {
  transform: scale(1.2) rotate(5deg);
}

.btn--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn--primary:hover::before {
  left: 100%;
}

.btn--ghost {
  background: rgba(10, 129, 209, 0.1);
  color: #69C6FF;
  border: 2px solid #0A81D1;
  backdrop-filter: blur(10px);
}

.btn--ghost:hover {
  background: rgba(10, 129, 209, 0.2);
  border-color: #69C6FF;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(10, 129, 209, 0.3);
}

.btn--ghost:hover .btn-icon {
  transform: scale(1.2);
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .globe-frame {
    width: min(85vmin, 650px);
  }
  
  .globe-container {
    opacity: 0.35;
  }
  
  .content-wrapper {
    max-width: 700px;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .globe-frame {
    width: min(80vmin, 500px);
  }
  
  .globe-container {
    opacity: 0.25;
  }
  
  .content-wrapper {
    max-width: 90%;
    padding: 1rem;
    background: radial-gradient(ellipse at center, rgba(0, 8, 20, 0.85) 0%, rgba(0, 8, 20, 0.5) 50%, transparent 70%);
  }
  
  .hero-content {
    padding: clamp(1rem, 3vw, 2rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stars-background,
  .title-space,
  .title-engine,
  .globe-glow,
  .btn::before {
    animation: none !important;
  }
}
</style>

