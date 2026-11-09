/**
 * SCIENCE UNIVERSE — REUSABLE THREE.JS PLANET RENDERER
 * Module: PlanetRenderer.js
 * 
 * Coordinates:
 * - Scene graph, lighting, starfield background, camera projection.
 * - Touch and mouse orbital interaction with damping/inertia.
 * - Integration with RendererLifecycle for mobile-safe lifecycle management.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./RendererLifecycle', './PlanetMaterials'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./RendererLifecycle'), require('./PlanetMaterials'));
  } else {
    root.PlanetRenderer = factory(root.RendererLifecycle, root.PlanetMaterials);
  }
}(typeof self !== 'undefined' ? self : this, function (RendererLifecycleModule, PlanetMaterials) {
  'use strict';

  const { RendererLifecycle, disposeObject } = RendererLifecycleModule;

  class PlanetRenderer {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - DOM container to attach canvas
     * @param {number} [options.fov=40]
     * @param {number} [options.cameraDistance=7.0]
     */
    constructor(options) {
      if (!options || !options.container) {
        throw new Error('PlanetRenderer requires a valid container element');
      }

      this.container = options.container;
      this.fov = options.fov || 40;
      this.cameraDistance = options.cameraDistance || 7.0;
      this.minCameraDistance = 3.5;
      this.maxCameraDistance = 18.0;

      this.scene = null;
      this.camera = null;
      this.lifecycle = null;
      this.planetGroup = null;
      this.starfield = null;

      // Orbit interaction state
      this.isDragging = false;
      this.prevMousePos = { x: 0, y: 0 };
      this.rotationVelocity = { x: 0, y: 0 };
      this.userRotation = { x: 0.15, y: -0.4 };
      this.autoRotationSpeed = 0.0015; // Slow natural spin
      this.isAutoRotating = true;

      this._boundOnPointerDown = this._onPointerDown.bind(this);
      this._boundOnPointerMove = this._onPointerMove.bind(this);
      this._boundOnPointerUp = this._onPointerUp.bind(this);
      this._boundOnWheel = this._onWheel.bind(this);
      this._boundRenderTick = this._renderTick.bind(this);
      this._boundOnResize = this._onResize.bind(this);
    }

    /**
     * Initializes Scene, Camera, Lighting, and starts the render loop
     */
    init() {
      if (this.scene) return;

      this.scene = new THREE.Scene();

      // Camera
      const rect = this.container.getBoundingClientRect();
      const aspect = Math.max(0.1, (rect.width || 400) / (rect.height || 300));
      this.camera = new THREE.PerspectiveCamera(this.fov, aspect, 0.1, 1000);
      this.camera.position.set(0, 0, this.cameraDistance);

      // Lifecycle manager
      this.lifecycle = new RendererLifecycle({
        container: this.container,
        alpha: true,
        antialias: true,
        onRender: this._boundRenderTick,
        onResize: this._boundOnResize
      });
      this.lifecycle.init();

      // Add deep space starfield
      this._setupStarfield();

      // Lighting setup
      this._setupLighting();

      // Planet main root group
      this.planetGroup = new THREE.Group();
      this.scene.add(this.planetGroup);

      // Setup interaction controls
      this._setupControls();

      // Start render loop
      this.lifecycle.start();
    }

    _setupStarfield() {
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1000;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 500;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 500;
        positions[i * 3 + 2] = -100 - Math.random() * 200;

        const brightness = 0.5 + Math.random() * 0.5;
        colors[i * 3 + 0] = brightness;
        colors[i * 3 + 1] = brightness;
        colors[i * 3 + 2] = brightness * 1.1; // Subtle stellar blue tint
      }

      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const starMat = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      });
      this.starfield = new THREE.Points(starGeo, starMat);
      this.scene.add(this.starfield);
    }

    _setupLighting() {
      // Primary Sun directional light
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.85);
      sunLight.position.set(-6, 3, 5);
      this.scene.add(sunLight);

      // Deep space ambient fill
      const ambientLight = new THREE.AmbientLight(0x0f172a, 0.45);
      this.scene.add(ambientLight);

      // Cyan / cool blue rim light for realistic planetary terminator
      const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
      rimLight.position.set(5, -2, -4);
      this.scene.add(rimLight);
    }

    _setupControls() {
      const canvas = this.lifecycle.canvas;
      if (!canvas) return;

      canvas.addEventListener('mousedown', this._boundOnPointerDown, { passive: true });
      window.addEventListener('mousemove', this._boundOnPointerMove, { passive: true });
      window.addEventListener('mouseup', this._boundOnPointerUp, { passive: true });

      canvas.addEventListener('touchstart', this._boundOnPointerDown, { passive: true });
      window.addEventListener('touchmove', this._boundOnPointerMove, { passive: true });
      window.addEventListener('touchend', this._boundOnPointerUp, { passive: true });

      canvas.addEventListener('wheel', this._boundOnWheel, { passive: false });
    }

    _onPointerDown(e) {
      this.isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.prevMousePos = { x: clientX, y: clientY };
      this.rotationVelocity = { x: 0, y: 0 };
    }

    _onPointerMove(e) {
      if (!this.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - this.prevMousePos.x;
      const dy = clientY - this.prevMousePos.y;

      this.userRotation.y += dx * 0.007;
      this.userRotation.x += dy * 0.007;

      // Clamp vertical pitch to avoid gimbal flip
      this.userRotation.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.userRotation.x));

      this.rotationVelocity = { x: dy * 0.0015, y: dx * 0.0015 };
      this.prevMousePos = { x: clientX, y: clientY };
    }

    _onPointerUp() {
      this.isDragging = false;
    }

    _onWheel(e) {
      e.preventDefault();
      this.cameraDistance += e.deltaY * 0.005;
      this.cameraDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, this.cameraDistance));
      if (this.camera) {
        this.camera.position.z = this.cameraDistance;
      }
    }

    _onResize(width, height, aspect) {
      if (!this.camera) return;
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
    }

    _renderTick(deltaTime) {
      if (!this.planetGroup || !this.camera) return;

      // Apply drag inertia decay
      if (!this.isDragging) {
        this.userRotation.y += this.rotationVelocity.y;
        this.userRotation.x += this.rotationVelocity.x;
        this.rotationVelocity.x *= 0.94;
        this.rotationVelocity.y *= 0.94;

        if (this.isAutoRotating) {
          this.userRotation.y += this.autoRotationSpeed;
        }
      }

      this.planetGroup.rotation.x = this.userRotation.x;
      this.planetGroup.rotation.y = this.userRotation.y;

      this.lifecycle.renderer.render(this.scene, this.camera);
    }

    /**
     * Clears all meshes currently attached to the planetary root group
     */
    clearPlanetGroup() {
      if (!this.planetGroup) return;
      while (this.planetGroup.children.length > 0) {
        const child = this.planetGroup.children[0];
        this.planetGroup.remove(child);
        disposeObject(child);
      }
    }

    pause() {
      if (this.lifecycle) this.lifecycle.pause();
    }

    resume() {
      if (this.lifecycle) this.lifecycle.resume();
    }

    dispose() {
      const canvas = this.lifecycle ? this.lifecycle.canvas : null;
      if (canvas) {
        canvas.removeEventListener('mousedown', this._boundOnPointerDown);
        window.removeEventListener('mousemove', this._boundOnPointerMove);
        window.removeEventListener('mouseup', this._boundOnPointerUp);
        canvas.removeEventListener('touchstart', this._boundOnPointerDown);
        window.removeEventListener('touchmove', this._boundOnPointerMove);
        window.removeEventListener('touchend', this._boundOnPointerUp);
        canvas.removeEventListener('wheel', this._boundOnWheel);
      }

      this.clearPlanetGroup();

      if (this.starfield) {
        this.scene.remove(this.starfield);
        disposeObject(this.starfield);
        this.starfield = null;
      }

      if (this.lifecycle) {
        this.lifecycle.dispose();
        this.lifecycle = null;
      }

      this.scene = null;
      this.camera = null;
      this.planetGroup = null;
    }
  }

  return PlanetRenderer;
}));
