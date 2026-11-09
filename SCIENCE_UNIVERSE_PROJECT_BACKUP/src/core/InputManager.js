/**
 * Unified Input Manager supporting Mouse+Keyboard (Desktop) and Touch (Mobile).
 * Expanded for 10-slot Hotbar, Building Mode, and Vehicle Driving.
 */
export class InputManager {
  constructor() {
    this.keys = {};
    this.mouseButtons = { 0: false, 1: false, 2: false };
    this.mouseDelta = { x: 0, y: 0 };
    this.isPointerLocked = false;
    this.wheelDelta = 0;
    this._boundHandlers = null;
    this._initialized = false;
    
    // Virtual touch joystick
    this.touchMove = { x: 0, y: 0 };
    this.touchLook = { x: 0, y: 0 };
    this.isTouchDevice = false;
    this.touchMoveSensitivity = 1;
    this.touchLookSensitivity = 1;

    // Callbacks
    this.onHotbarSelect = null;
    this.onInventoryToggle = null;
    this.onFlashlightToggle = null;
    this.onInteract = null;
    this.onBuildingRotate = null;
    this.onQuickSave = null;
    this.onQuickLoad = null;
    this.onPauseToggle = null;
    this.onPrimaryActionStart = null;
    this.onPrimaryActionEnd = null;
  }

  init(domElement) {
    if (!domElement) return;
    this.domElement = domElement;
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (this._initialized && this._boundHandlers) {
      return;
    }

    const onKeyDown = (e) => this._onKeyDown(e);
    const onKeyUp = (e) => this._onKeyUp(e);
    const onMouseDown = (e) => {
      this.mouseButtons[e.button] = true;
      if (e.button === 0 && this.onPrimaryActionStart) {
        this.onPrimaryActionStart();
      }
    };
    const onMouseUp = (e) => {
      this.mouseButtons[e.button] = false;
      if (e.button === 0 && this.onPrimaryActionEnd) {
        this.onPrimaryActionEnd();
      }
    };
    const onMouseMove = (e) => {
      if (this.isPointerLocked) {
        this.mouseDelta.x += e.movementX || 0;
        this.mouseDelta.y += e.movementY || 0;
      }
    };
    const onWheel = (e) => {
      if (!this.isPointerLocked) return;
      this.wheelDelta = Math.sign(e.deltaY);
    };
    const onPointerLockChange = () => {
      this.isPointerLocked = (document.pointerLockElement === this.domElement);
      if (!this.isPointerLocked && this.onPauseToggle && !this._preventPauseOnce) {
        this._lastPointerUnlockPauseAt = performance.now();
        this.onPauseToggle(true);
      }
      this._preventPauseOnce = false;
    };
    const onBlur = () => this.resetState();

    this._boundHandlers = { onKeyDown, onKeyUp, onMouseDown, onMouseUp, onMouseMove, onWheel, onPointerLockChange, onBlur };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    this.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onWheel, { passive: true });
    document.addEventListener('pointerlockchange', onPointerLockChange);
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('blur', onBlur);
    this._initialized = true;
  }

  resetState() {
    for (const k of Object.keys(this.keys)) {
      this.keys[k] = false;
    }
    this.mouseButtons[0] = false;
    this.mouseButtons[1] = false;
    this.mouseButtons[2] = false;
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.wheelDelta = 0;
    this.touchMove.x = 0;
    this.touchMove.y = 0;
    this.touchLook.x = 0;
    this.touchLook.y = 0;
    this.touchMining = false;
    this.touchJump = false;
    this.touchSprint = false;
    this.touchCrouch = false;
  }

  resetTouchState() {
    this.touchMove.x = 0;
    this.touchMove.y = 0;
    this.touchLook.x = 0;
    this.touchLook.y = 0;
    this.touchJump = false;
    // touchMining is NOT cleared here: it is a held state managed by
    // touchstart/touchend on the mine button (continuous mining while held).
    // touchSprint and touchCrouch are also held states, not cleared here.
  }

  setTouchMoveSensitivity(value) {
    this.touchMoveSensitivity = Math.max(0.5, Math.min(1.5, Number(value) || 1));
  }

  setTouchLookSensitivity(value) {
    this.touchLookSensitivity = Math.max(0.5, Math.min(2, Number(value) || 1));
  }

  requestPointerLock() {
    if (!this.isTouchDevice && !this.isPointerLocked && this.domElement) {
      this.domElement.requestPointerLock().catch(() => {});
    }
  }

  exitPointerLock() {
    if (this.isPointerLocked) {
      this._preventPauseOnce = true;
      document.exitPointerLock();
    }
  }

  _onKeyDown(e) {
    const code = e.code;
    this.keys[code] = true;

    // Number keys 1-9 and 0 (Digit0 = 10th slot)
    if (code.startsWith('Digit')) {
      const numStr = code.replace('Digit', '');
      let slotIdx = -1;
      if (numStr === '0') {
        slotIdx = 9; // 10th slot
      } else {
        const num = parseInt(numStr, 10);
        if (num >= 1 && num <= 9) {
          slotIdx = num - 1;
        }
      }
      if (slotIdx !== -1 && this.onHotbarSelect) {
        this.onHotbarSelect(slotIdx);
      }
    }

    if (code === 'KeyE' || e.key === 'e' || e.key === 'E') {
      if (this.onInteract) this.onInteract();
    }

    if (code === 'KeyR') {
      if (this.onBuildingRotate) this.onBuildingRotate();
    }

    if (code === 'KeyI' || code === 'Tab') {
      e.preventDefault();
      if (this.onInventoryToggle) this.onInventoryToggle();
    }

    if (code === 'KeyF') {
      if (this.onFlashlightToggle) this.onFlashlightToggle();
    }

    if (code === 'KeyL') {
      if (this.onDeployWorkLight) this.onDeployWorkLight();
    }

    if (code === 'F3') {
      e.preventDefault();
      if (this.onPerformanceToggle) this.onPerformanceToggle();
    }

    if (code === 'F5') {
      e.preventDefault();
      if (this.onQuickSave) this.onQuickSave();
    }

    if (code === 'F9') {
      e.preventDefault();
      if (this.onQuickLoad) this.onQuickLoad();
    }

    if (code === 'Escape') {
      if (performance.now() - (this._lastPointerUnlockPauseAt || 0) < 180) return;
      if (this.onPauseToggle) this.onPauseToggle();
    }
  }

  _onKeyUp(e) {
    this.keys[e.code] = false;
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  isPrimaryActionActive() {
    return !!this.mouseButtons[0] || !!this.touchMining;
  }

  isSecondaryActionActive() {
    return !!this.mouseButtons[2];
  }

  getMovementVector() {
    let forward = 0;
    let right = 0;

    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) forward += 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) forward -= 1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) right += 1;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) right -= 1;

    forward += this.touchMove.y * this.touchMoveSensitivity;
    right += this.touchMove.x * this.touchMoveSensitivity;

    const len = Math.hypot(forward, right);
    if (len > 1) {
      forward /= len;
      right /= len;
    }

    return { forward, right };
  }

  consumeMouseDelta() {
    const delta = {
      x: this.mouseDelta.x + this.touchLook.x * this.touchLookSensitivity,
      y: this.mouseDelta.y + this.touchLook.y * this.touchLookSensitivity
    };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.touchLook.x = 0;
    this.touchLook.y = 0;
    return delta;
  }

  consumeWheelDelta() {
    const w = this.wheelDelta;
    this.wheelDelta = 0;
    return w;
  }
}

export const input = new InputManager();
