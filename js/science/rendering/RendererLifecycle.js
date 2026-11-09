/**
 * SCIENCE UNIVERSE — THREE.JS RENDERER LIFECYCLE & PERFORMANCE MANAGER
 * Module: RendererLifecycle.js
 * 
 * Manages WebGLRenderer instances, frame loops, view visibility,
 * mobile devicePixelRatio capping, ResizeObserver synchronization,
 * WebGL context loss recovery, and memory leak prevention.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RendererLifecycle = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class RendererLifecycle {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - DOM container element
     * @param {Function} options.onRender - Callback called every active animation frame with (deltaTime, timestamp)
     * @param {Function} [options.onResize] - Optional callback on container resize with (width, height, aspect)
     * @param {boolean} [options.alpha=true] - WebGL clear alpha
     * @param {boolean} [options.antialias=true] - Antialiasing
     * @param {number} [options.maxPixelRatio=2.0] - Clamp devicePixelRatio to protect mobile GPUs
     */
    constructor(options) {
      if (!options || !options.container) {
        throw new Error('RendererLifecycle requires a valid container element');
      }

      this.container = options.container;
      this.onRender = options.onRender || (() => {});
      this.onResize = options.onResize || (() => {});
      this.alpha = options.alpha !== undefined ? options.alpha : true;
      this.antialias = options.antialias !== undefined ? options.antialias : true;
      this.maxPixelRatio = options.maxPixelRatio || 2.0;

      this.renderer = null;
      this.canvas = null;
      this.animFrameId = null;
      this.isRunning = false;
      this.isPaused = false;
      this.isContextLost = false;
      this.lastTimestamp = 0;

      this.resizeObserver = null;
      this._boundAnimate = this._animate.bind(this);
      this._boundOnContextLost = this._onContextLost.bind(this);
      this._boundOnContextRestored = this._onContextRestored.bind(this);
    }

    /**
     * Creates and configures the WebGLRenderer lazily
     */
    init() {
      if (this.renderer) return this.renderer;

      if (typeof THREE === 'undefined') {
        throw new Error('Three.js is not loaded. Ensure Three.js r128 is included before initializing renderer.');
      }

      const rect = this.container.getBoundingClientRect();
      const width = Math.max(100, Math.floor(rect.width || this.container.clientWidth || 400));
      const height = Math.max(100, Math.floor(rect.height || this.container.clientHeight || 300));

      this.canvas = document.createElement('canvas');
      this.canvas.style.display = 'block';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.container.appendChild(this.canvas);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: this.alpha,
        antialias: this.antialias,
        powerPreference: 'high-performance'
      });

      const pixelRatio = Math.min(window.devicePixelRatio || 1, this.maxPixelRatio);
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setSize(width, height, false);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.2;
      this.renderer.localClippingEnabled = true; // Crucial for GPU cross-section slicing

      // Context loss handlers
      this.canvas.addEventListener('webglcontextlost', this._boundOnContextLost, false);
      this.canvas.addEventListener('webglcontextrestored', this._boundOnContextRestored, false);

      // Container resize handling via ResizeObserver
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            this.handleResize(cr.width, cr.height);
          }
        });
        this.resizeObserver.observe(this.container);
      } else {
        window.addEventListener('resize', () => {
          const r = this.container.getBoundingClientRect();
          this.handleResize(r.width, r.height);
        });
      }

      return this.renderer;
    }

    /**
     * Resizes renderer and triggers callback
     */
    handleResize(width, height) {
      if (!this.renderer || !this.canvas) return;
      const w = Math.max(100, Math.floor(width || this.container.clientWidth));
      const h = Math.max(100, Math.floor(height || this.container.clientHeight));

      this.renderer.setSize(w, h, false);
      const aspect = w / h;
      this.onResize(w, h, aspect);
    }

    /**
     * Starts or resumes the render loop
     */
    start() {
      if (!this.renderer) {
        this.init();
      }
      this.isPaused = false;
      if (!this.isRunning) {
        this.isRunning = true;
        this.lastTimestamp = performance.now();
        this.animFrameId = requestAnimationFrame(this._boundAnimate);
      }
    }

    /**
     * Pauses the render loop to save CPU/GPU cycles when hidden
     */
    pause() {
      this.isPaused = true;
    }

    /**
     * Resumes a paused render loop
     */
    resume() {
      this.isPaused = false;
      if (!this.isRunning) {
        this.start();
      }
    }

    /**
     * Internal animation loop
     */
    _animate(timestamp) {
      if (!this.isRunning) return;

      if (!this.isPaused && !this.isContextLost) {
        const delta = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
        this.lastTimestamp = timestamp;

        try {
          this.onRender(delta, timestamp);
        } catch (err) {
          console.error('[RendererLifecycle] Render loop callback error:', err);
        }
      }

      this.animFrameId = requestAnimationFrame(this._boundAnimate);
    }

    _onContextLost(event) {
      event.preventDefault();
      console.warn('[RendererLifecycle] WebGL Context Lost! Pausing rendering.');
      this.isContextLost = true;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      this.isRunning = false;
    }

    _onContextRestored() {
      console.info('[RendererLifecycle] WebGL Context Restored! Reinitializing resources.');
      this.isContextLost = false;
      this.start();
    }

    /**
     * Full tear-down and resource disposal
     */
    dispose() {
      this.isRunning = false;
      this.isPaused = true;

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }

      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

      if (this.canvas) {
        this.canvas.removeEventListener('webglcontextlost', this._boundOnContextLost);
        this.canvas.removeEventListener('webglcontextrestored', this._boundOnContextRestored);
        if (this.canvas.parentElement) {
          this.canvas.parentElement.removeChild(this.canvas);
        }
      }

      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.forceContextLoss) {
          this.renderer.forceContextLoss();
        }
        this.renderer = null;
      }

      this.canvas = null;
    }
  }

  /**
   * Safe Three.js Object3D disposal helper
   */
  function disposeObject(obj) {
    if (!obj) return;

    if (obj.children && obj.children.length > 0) {
      while (obj.children.length > 0) {
        disposeObject(obj.children[0]);
        obj.remove(obj.children[0]);
      }
    }

    if (obj.geometry) {
      obj.geometry.dispose();
    }

    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => disposeMaterial(m));
      } else {
        disposeMaterial(obj.material);
      }
    }
  }

  function disposeMaterial(mat) {
    if (!mat) return;
    // Dispose attached textures
    ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'alphaMap'].forEach(key => {
      if (mat[key] && mat[key].dispose) {
        mat[key].dispose();
      }
    });
    mat.dispose();
  }

  return {
    RendererLifecycle,
    disposeObject,
    disposeMaterial
  };
}));
