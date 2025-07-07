// Minimal touch drag-and-drop polyfill for iOS devices.
// Inspired by the drag-drop-touch library (MIT licensed).

interface DragContext {
  source: HTMLElement | null;
  lastTarget: HTMLElement | null;
  dataTransfer: DataTransfer | null;
  startX: number;
  startY: number;
  dragging: boolean;
}

const ctx: DragContext = {
  source: null,
  lastTarget: null,
  dataTransfer: null,
  startX: 0,
  startY: 0,
  dragging: false,
};

function dispatch(node: HTMLElement | null, type: string, touch: Touch) {
  if (!node) return;
  const evt = new CustomEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(evt, 'dataTransfer', {
    value: ctx.dataTransfer,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (evt as any).clientX = touch.clientX;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (evt as any).clientY = touch.clientY;
  node.dispatchEvent(evt);
}

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0];
  const target = (e.target as HTMLElement).closest('[draggable="true"]') as HTMLElement | null;
  if (!touch || !target) return;
  ctx.source = target;
  ctx.startX = touch.clientX;
  ctx.startY = touch.clientY;
  ctx.dragging = false;
  ctx.dataTransfer = new DataTransfer();
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);
}

function onTouchMove(e: TouchEvent) {
  const touch = e.touches[0];
  if (!touch || !ctx.source) return;
  if (!ctx.dragging) {
    const dx = Math.abs(touch.clientX - ctx.startX);
    const dy = Math.abs(touch.clientY - ctx.startY);
    if (dx + dy < 5) return;
    ctx.dragging = true;
    dispatch(ctx.source, 'dragstart', touch);
  }
  e.preventDefault();
  const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
  if (target !== ctx.lastTarget) {
    if (ctx.lastTarget) dispatch(ctx.lastTarget, 'dragleave', touch);
    if (target) dispatch(target, 'dragenter', touch);
    ctx.lastTarget = target;
  }
  dispatch(target, 'dragover', touch);
}

function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0];
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
  if (!ctx.source || !ctx.dragging || !touch) {
    ctx.source = null;
    ctx.lastTarget = null;
    return;
  }
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
  dispatch(dropTarget, 'drop', touch);
  dispatch(ctx.source, 'dragend', touch);
  ctx.source = null;
  ctx.lastTarget = null;
  ctx.dragging = false;
}

if (
  typeof window !== 'undefined' &&
  'ontouchstart' in window &&
  !('draggable' in document.createElement('div'))
) {
  document.addEventListener('touchstart', onTouchStart);
}
