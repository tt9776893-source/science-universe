/**
 * Science Universe — Mobile Bridge for Capacitor Android & iOS
 * Handles native hardware back button, status bar, splash screen, and lifecycle.
 */
(function () {
  'use strict';

  function initMobileBridge() {
    // Check if Capacitor native bridge is available
    if (typeof window.Capacitor === 'undefined' || !window.Capacitor.isNativePlatform()) {
      console.info('[SU-MOBILE] Running in web browser environment. Native bridge idle.');
      return;
    }

    console.info('[SU-MOBILE] Initializing Capacitor native mobile bridge on ' + window.Capacitor.getPlatform() + '...');

    const { App, StatusBar, SplashScreen } = window.Capacitor.Plugins || {};

    // 1. Configure Status Bar
    if (StatusBar) {
      try {
        StatusBar.setStyle({ style: 'DARK' }).catch(() => {});
        StatusBar.setBackgroundColor({ color: '#05060f' }).catch(() => {});
        StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      } catch (e) {
        console.warn('[SU-MOBILE] StatusBar config notice:', e);
      }
    }

    // 2. Hide Splash Screen after app loads
    if (SplashScreen) {
      setTimeout(() => {
        SplashScreen.hide({ fadeOutDuration: 400 }).catch(() => {});
      }, 800);
    }

    // 3. Android Hardware Back Button Handling (Centralized SU_NAV Architecture)
    if (App && typeof App.addListener === 'function') {
      App.addListener('backButton', () => {
        console.info('[SU-MOBILE] Native back button pressed.');

        // Route through centralized navigation controller
        if (window.SU_NAV && typeof window.SU_NAV.back === 'function') {
          const handled = window.SU_NAV.back({ fromNative: true });
          if (handled) {
            console.info('[SU-MOBILE] Native back handled by SU_NAV');
            return;
          }
        }

        // If at root Welcome Screen -> exit the native application cleanly
        const phone = document.getElementById('phone');
        if (phone && !phone.classList.contains('in')) {
          if (typeof App.exitApp === 'function') {
            console.info('[SU-MOBILE] Exiting application from root Welcome Screen');
            App.exitApp();
          }
        }
      });

      // 4. Lifecycle management: Pause/Resume heavy 3D rendering
      App.addListener('appStateChange', (state) => {
        console.info('[SU-MOBILE] App state changed:', state.isActive ? 'ACTIVE' : 'BACKGROUND');
        if (!state.isActive) {
          // App backgrounded: suspend active section if present
          if (window.SU && window.SU.state && window.SU.state.sandbox) {
            try { window.SU.state.sandbox.suspend(); } catch (e) {}
          }
        } else {
          // App resumed: restore active section and trigger canvas resize
          if (window.SU && window.SU.state && window.SU.state.sandbox) {
            try { window.SU.state.sandbox.resume(); } catch (e) {}
          }
          window.dispatchEvent(new Event('resize'));
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileBridge);
  } else {
    initMobileBridge();
  }
})();

