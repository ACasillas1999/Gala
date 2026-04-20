import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import Stack from './Stack.jsx';

const DEFAULT_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop',
    alt: 'Abstract art'
  },
  {
    src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop',
    alt: 'Modern sculpture'
  },
  {
    src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop',
    alt: 'Digital artwork'
  },
  {
    src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop',
    alt: 'Contemporary art'
  },
  {
    src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop',
    alt: 'Geometric pattern'
  },
  {
    src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop',
    alt: 'Textured surface'
  },
  { src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large', alt: 'Social media image' }
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = d => ((d % 360) + 360) % 360;
const wrapAngleSigned = deg => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el, name, fallback) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(coords, pool, segments = 35) {
  // To cover 360 degrees with sizeX=2 items, we need 'segments' columns
  // because each item width is (360 / segments / 2) * 2 = 360 / segments.
  const xCols = Array.from({ length: segments }, (_, i) => -segments + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  if (!coords) {
    coords = xCols.flatMap((x, c) => {
      const ys = c % 2 === 0 ? evenYs : oddYs;
      return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
    });
  }

  const totalSlots = coords.length;
  if (pool.length === 0) return coords.map(c => ({ ...c, src: '', alt: '' }));

  const normalizedAlbums = pool.map((album, idx) => {
    if (album.guest_name && album.photos) {
      return {
        guest_name: album.guest_name,
        photos: album.photos,
        photoCount: album.photos.length,
        coverSrc: album.photos[0]?.src || '',
        coverType: album.photos[0]?.type || 'image',
        albumIndex: idx
      };
    }
    // Fallback for flat images
    const type = typeof album === 'string' ? 'image' : (album.type || 'image');
    const src = typeof album === 'string' ? album : (album.src || '');
    return {
      guest_name: 'Anónimo',
      photos: [{ src, type }],
      photoCount: 1,
      coverSrc: src,
      coverType: type,
      albumIndex: idx,
      photo: album.photo || null // Pass back original photo object if exists
    };
  });

  // Randomize the distribution to avoid visible patterns when there are few images
  const usedAlbums = [];
  while (usedAlbums.length < totalSlots) {
    const batch = [...normalizedAlbums].sort(() => Math.random() - 0.5);
    usedAlbums.push(...batch);
  }
  // Trim to exact length
  usedAlbums.length = totalSlots;

  return coords.map((c, i) => ({
    ...c,
    guest_name: usedAlbums[i].guest_name,
    photos: usedAlbums[i].photos,
    photoCount: usedAlbums[i].photoCount,
    src: usedAlbums[i].coverSrc,
    type: usedAlbums[i].coverType,
    albumIndex: usedAlbums[i].albumIndex,
    photo: usedAlbums[i].photo
  }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images,
  userAlbums,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#120F17',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = '400px',
  openedImageHeight = '400px',
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = false,
  autoRotate = false,
  autoRotateSpeed = 0.05,
  onMediaClick = null
}) {
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const sphereRef = useRef(null);
  const frameRef = useRef(null);
  const viewerRef = useRef(null);
  const scrimRef = useRef(null);
  const focusedElRef = useRef(null);
  const originalTilePositionRef = useRef(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef(null);
  const draggingRef = useRef(false);
  const cancelTapRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef(null);
  const pointerTypeRef = useRef('mouse');
  const tapTargetRef = useRef(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const scrollLockedRef = useRef(false);
  const autoRotateRAF = useRef(null);
  
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const focusedAlbumDataRef = useRef(null);

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  }, []);

  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  }, []);

  const items = useMemo(() => buildItems(null, userAlbums || images || DEFAULT_IMAGES, segments), [userAlbums, images, segments]);

  const applyTransform = (xDeg, yDeg) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
      const minDim = Math.min(w, h), maxDim = Math.max(w, h), aspect = w / h;
      let basis;
      switch (fitBasis) {
        case 'min': basis = minDim; break;
        case 'max': basis = maxDim; break;
        case 'width': basis = w; break;
        case 'height': basis = h; break;
        default: basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      const heightGuard = h * 3.0;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector('.enlarge');
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR = mainRef.current.getBoundingClientRect();
        enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
        enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
        enlargedOverlay.style.width = `${frameR.width}px`;
        enlargedOverlay.style.height = `${frameR.height}px`;
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, fitBasis, minRadius, maxRadius, padFactor]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  useEffect(() => {
    if (!autoRotate) {
      if (autoRotateRAF.current) cancelAnimationFrame(autoRotateRAF.current);
      return;
    }
    
    const step = () => {
      if (!draggingRef.current && !inertiaRAF.current && !focusedElRef.current && !openingRef.current) {
        const nextY = wrapAngleSigned(rotationRef.current.y + autoRotateSpeed);
        rotationRef.current.y = nextY;
        applyTransform(rotationRef.current.x, nextY);
      }
      autoRotateRAF.current = requestAnimationFrame(step);
    };
    
    autoRotateRAF.current = requestAnimationFrame(step);
    
    return () => {
      if (autoRotateRAF.current) cancelAnimationFrame(autoRotateRAF.current);
    };
  }, [autoRotate, autoRotateSpeed]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback((vx, vy) => {
    const MAX_V = 1.4;
    let vX = clamp(vx, -MAX_V, MAX_V) * 80;
    let vY = clamp(vy, -MAX_V, MAX_V) * 80;
    let frames = 0;
    const d = clamp(dragDampening ?? 0.6, 0, 1);
    const frictionMul = 0.94 + 0.055 * d;
    const stopThreshold = 0.015 - 0.01 * d;
    const maxFrames = Math.round(90 + 270 * d);
    
    const step = () => {
      vX *= frictionMul;
      vY *= frictionMul;
      if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
        inertiaRAF.current = null;
        return;
      }
      if (++frames > maxFrames) {
        inertiaRAF.current = null;
        return;
      }
      const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaRAF.current = requestAnimationFrame(step);
    };
    stopInertia();
    inertiaRAF.current = requestAnimationFrame(step);
  }, [dragDampening, maxVerticalRotationDeg, stopInertia]);

  useGesture({
    onDragStart: ({ event }) => {
      if (focusedElRef.current) return;
      stopInertia();
      const evt = event;
      pointerTypeRef.current = evt.pointerType || 'mouse';
      if (pointerTypeRef.current === 'touch') lockScroll();
      draggingRef.current = true;
      cancelTapRef.current = false;
      movedRef.current = false;
      startRotRef.current = { ...rotationRef.current };
      startPosRef.current = { x: evt.clientX, y: evt.clientY };
      const potential = evt.target.closest?.('.item__image');
      tapTargetRef.current = potential || null;
    },
    onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement }) => {
      if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
      const evt = event;
      const dxTotal = evt.clientX - startPosRef.current.x;
      const dyTotal = evt.clientY - startPosRef.current.y;

      if (!movedRef.current) {
        if (dxTotal * dxTotal + dyTotal * dyTotal > 16) movedRef.current = true;
      }

      const nextX = clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);

      if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
      }

      if (last) {
        draggingRef.current = false;
        let isTap = false;
        if (startPosRef.current) {
          const dx = evt.clientX - startPosRef.current.x;
          const dy = evt.clientY - startPosRef.current.y;
          const TAP_THRESH_PX = pointerTypeRef.current === 'touch' ? 10 : 6;
          if (dx * dx + dy * dy <= TAP_THRESH_PX * TAP_THRESH_PX) isTap = true;
        }

        let [vMagX, vMagY] = velArr;
        const [dirX, dirY] = dirArr;
        let vx = vMagX * dirX, vy = vMagY * dirY;
        
        if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
          const [mx, my] = movement;
          vx = (mx / dragSensitivity) * 0.02;
          vy = (my / dragSensitivity) * 0.02;
        }
        
        if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) startInertia(vx, vy);
        
        startPosRef.current = null;
        cancelTapRef.current = !isTap;
        
        if (isTap && tapTargetRef.current && !focusedElRef.current) {
          const itemIdx = getDataNumber(tapTargetRef.current.parentElement, 'item-index', -1);
          const it = items[itemIdx];
          if (onMediaClick && it?.photo) {
            onMediaClick(it.photo);
          } else {
            openItemFromElement(tapTargetRef.current);
          }
        }
        tapTargetRef.current = null;
        if (cancelTapRef.current) setTimeout(() => (cancelTapRef.current = false), 120);
        if (pointerTypeRef.current === 'touch') unlockScroll();
        if (movedRef.current) lastDragEndAt.current = performance.now();
        movedRef.current = false;
      }
    }
  }, { target: mainRef, eventOptions: { passive: false } });

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;
    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement;
      const overlay = viewerRef.current?.querySelector('.enlarge');
      if (!overlay) return;

      const refDiv = parent.querySelector('.item__image--reference');
      const originalPos = originalTilePositionRef.current;
      
      if (!originalPos) {
        overlay.remove();
        if (refDiv) refDiv.remove();
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        el.style.visibility = '';
        el.style.zIndex = 0;
        focusedElRef.current = null;
        rootRef.current?.removeAttribute('data-enlarging');
        openingRef.current = false;
        unlockScroll();
        return;
      }

      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      
      const animatingOverlay = document.createElement('div');
      animatingOverlay.className = 'enlarge-closing';
      animatingOverlay.style.cssText = `position:absolute;left:${currentRect.left - rootRect.left}px;top:${currentRect.top - rootRect.top}px;width:${currentRect.width}px;height:${currentRect.height}px;z-index:9999;border-radius:${openedImageBorderRadius};overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;transform:none;filter:${grayscale ? 'grayscale(1)' : 'none'};`;
      
      if (focusedAlbumDataRef.current) {
        const rawType = focusedAlbumDataRef.current.coverType;
        const rawSrc = focusedAlbumDataRef.current.coverSrc;
        
        let mediaEl;
        if (rawType === 'video') {
          mediaEl = document.createElement('video');
          mediaEl.src = rawSrc;
          mediaEl.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        } else {
          mediaEl = document.createElement('img');
          mediaEl.src = rawSrc;
          mediaEl.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        }
        animatingOverlay.appendChild(mediaEl);
      }
      
      setSelectedAlbum(null);
      focusedAlbumDataRef.current = null;
      
      overlay.remove();
      rootRef.current.appendChild(animatingOverlay);
      void animatingOverlay.getBoundingClientRect();

      requestAnimationFrame(() => {
        animatingOverlay.style.left = originalPos.left - rootRect.left + 'px';
        animatingOverlay.style.top = originalPos.top - rootRect.top + 'px';
        animatingOverlay.style.width = originalPos.width + 'px';
        animatingOverlay.style.height = originalPos.height + 'px';
        animatingOverlay.style.opacity = '0';
      });

      const cleanup = () => {
        animatingOverlay.remove();
        originalTilePositionRef.current = null;
        if (refDiv) refDiv.remove();
        parent.style.transition = 'none';
        el.style.transition = 'none';
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');

        requestAnimationFrame(() => {
          el.style.visibility = '';
          el.style.opacity = '0';
          el.style.zIndex = 0;
          focusedElRef.current = null;
          rootRef.current?.removeAttribute('data-enlarging');
          requestAnimationFrame(() => {
            parent.style.transition = '';
            el.style.transition = 'opacity 300ms ease-out';
            requestAnimationFrame(() => {
              el.style.opacity = '1';
              setTimeout(() => {
                el.style.transition = '';
                el.style.opacity = '';
                openingRef.current = false;
                unlockScroll();
              }, 300);
            });
          });
        });
      };
      animatingOverlay.addEventListener('transitionend', cleanup, { once: true });
    };

    scrim.addEventListener('click', close);
    const onKey = e => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => {
      scrim.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [enlargeTransitionMs, openedImageBorderRadius, grayscale, unlockScroll]);

  const openItemFromElement = el => {
    if (openingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = performance.now();
    lockScroll();
    const parent = el.parentElement;
    focusedElRef.current = el;
    el.setAttribute('data-focused', 'true');
    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(rotationRef.current.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - rotationRef.current.x;
    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference';
    refDiv.style.cssText = `position:absolute;inset:10px;pointer-events:none;transform:rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg);opacity:0;`;
    parent.appendChild(refDiv);
    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainRef.current?.getBoundingClientRect();
    const frameR = frameRef.current?.getBoundingClientRect();

    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      openingRef.current = false;
      focusedElRef.current = null;
      parent.removeChild(refDiv);
      unlockScroll();
      return;
    }

    originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
    el.style.visibility = 'hidden';
    el.style.zIndex = 0;

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.cssText = `position:absolute;left:${frameR.left - mainR.left}px;top:${frameR.top - mainR.top}px;width:${frameR.width}px;height:${frameR.height}px;opacity:0;z-index:30;will-change:transform,opacity;transform-origin:top left;transition:transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease;border-radius:${openedImageBorderRadius};overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);`;
    const rawType = parent.dataset.type || 'image';
    const rawSrc = parent.dataset.src || (rawType === 'video' ? el.querySelector('video')?.src : el.querySelector('img')?.src) || '';
    
    // Almacenar ref para el cierre
    const albumIndex = parseInt(parent.dataset.albumIdx, 10);
    const albumData = items.find(it => it.albumIndex === albumIndex);
    focusedAlbumDataRef.current = albumData;
    
    
    let mediaEl;
    if (rawType === 'video') {
      mediaEl = document.createElement('video');
      mediaEl.src = rawSrc;
      mediaEl.muted = true;
      mediaEl.loop = true;
      mediaEl.autoplay = true;
      mediaEl.playsInline = true;
    } else {
      mediaEl = document.createElement('img');
      mediaEl.src = rawSrc;
      mediaEl.alt = rawAlt;
    }
    mediaEl.style.cssText = `width:100%;height:100%;object-fit:cover;filter:${grayscale ? 'grayscale(1)' : 'none'};`;
    overlay.appendChild(mediaEl);
    viewerRef.current.appendChild(overlay);

    const tx0 = tileR.left - frameR.left;
    const ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width;
    const sy0 = tileR.height / frameR.height;
    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${isFinite(sx0) && sx0 > 0 ? sx0 : 1}, ${isFinite(sy0) && sy0 > 0 ? sy0 : 1})`;

    setTimeout(() => {
      if (!overlay.parentElement) return;
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      rootRef.current?.setAttribute('data-enlarging', 'true');
    }, 16);

    const onFlyEnd = ev => {
      if (ev.propertyName !== 'transform') return;
      overlay.removeEventListener('transitionend', onFlyEnd);
      // Ocultar cover temporal y montar Stack React
      const med = overlay.children[0];
      if (med) med.style.opacity = '0';
      overlay.style.background = 'transparent';
      overlay.style.boxShadow = 'none';
      if (albumData) setSelectedAlbum(albumData);
    };
    overlay.addEventListener('transitionend', onFlyEnd);
  };

  const cssStyles = `
    .sphere-root * { box-sizing: border-box; }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    .stage {
      width: 100%; height: 100%; display: grid; place-items: center;
      position: absolute; inset: 0; margin: auto;
      perspective: calc(var(--radius, 520px) * 2);
      perspective-origin: 50% 50%;
    }
    .sphere {
      transform: translateZ(calc(var(--radius, 520px) * -1));
      will-change: transform; position: absolute;
    }
    .sphere-item {
      position: absolute; top: -999px; bottom: -999px; left: -999px; right: -999px; margin: auto;
      transform-origin: 50% 50%; backface-visibility: hidden; transition: transform 300ms;
    }
    .sphere-root[data-enlarging="true"] .scrim { opacity: 1 !important; pointer-events: all !important; }
    @media (max-aspect-ratio: 1/1) { .viewer-frame { height: auto !important; width: 100% !important; } }
    .item__image {
      position: absolute; inset: 10px; border-radius: var(--tile-radius, 12px); overflow: hidden;
      cursor: pointer; backface-visibility: hidden; -webkit-backface-visibility: hidden;
      transition: transform 300ms; pointer-events: auto; -webkit-transform: translateZ(0); transform: translateZ(0);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div ref={rootRef} className="sphere-root" style={{ width: '100%', height: '100%', position: 'relative' }}>
        <main ref={mainRef} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', overflow: 'hidden', userSelect: 'none', touchAction: 'none' }}>
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => {
                const rotYBase = 360 / segments / 2;
                const rotXBase = 360 / segments / 2;
                return (
                  <div
                    key={i}
                    className="sphere-item"
                    data-item-index={i}
                    data-src={it.src}
                    data-type={it.type}
                    data-album-idx={it.albumIndex}
                    data-offset-x={it.x}
                    data-offset-y={it.y}
                    data-size-x={it.sizeX}
                    data-size-y={it.sizeY}
                    style={{
                      width: `calc(${3.14 / segments * it.sizeX} * var(--radius, 520px))`,
                      height: `calc(${3.14 / segments * it.sizeY} * var(--radius, 520px))`,
                      transform: `rotateY(calc(${rotYBase * (it.x + (it.sizeX - 1) / 2)}deg + var(--rot-y-delta, 0deg))) rotateX(calc(${rotXBase * (it.y - (it.sizeY - 1) / 2)}deg + var(--rot-x-delta, 0deg))) translateZ(var(--radius, 520px))`
                    }}
                  >
                    {/* Background stacked cards for visual effect */}
                    {it.photos && it.photoCount > 1 && (
                      it.photos.slice(1, Math.min(it.photos.length, 4)).reverse().map((bgPhoto, idx, arr) => {
                        const distance = arr.length - idx;
                        const shiftXY = distance * 4; 
                        const scale = 1 - (distance * 0.05); 
                        return (
                          <div 
                            key={`bg-${idx}`} 
                            className="mini-stack-bg"
                            style={{
                              position: 'absolute', 
                              inset: '10px', 
                              borderRadius: imageBorderRadius,
                              overflow: 'hidden',
                              pointerEvents: 'none',
                              transform: `translate(${shiftXY}px, -${shiftXY}px) scale(${scale})`,
                              zIndex: -1,
                              backgroundColor: '#111',
                              border: '1px solid rgba(255,255,255,0.15)',
                              boxShadow: '-4px 4px 12px rgba(0,0,0,0.4)'
                            }}
                          >
                            {bgPhoto.type === 'video' ? (
                              <video src={bgPhoto.src} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: grayscale ? 'grayscale(1)' : 'none' }} />
                            ) : (
                              <img src={bgPhoto.src} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: grayscale ? 'grayscale(1)' : 'none' }} />
                            )}
                          </div>
                        );
                      })
                    )}

                    <div
                      className="item__image"
                      onClick={e => {
                        if (draggingRef.current || movedRef.current || performance.now() - lastDragEndAt.current < 80 || openingRef.current) return;
                        if (onMediaClick && it.photo) {
                          onMediaClick(it.photo);
                        } else {
                          openItemFromElement(e.currentTarget);
                        }
                      }}
                      style={{ borderRadius: imageBorderRadius, zIndex: 1, backgroundColor: '#111' }}
                    >
                      {it.type === 'video' ? (
                        <video src={it.src} muted loop playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: grayscale ? 'grayscale(1)' : 'none' }} />
                      ) : (
                        <img src={it.src} alt={it.guest_name} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: grayscale ? 'grayscale(1)' : 'none' }} />
                      )}
                      
                      {it.photoCount > 1 && (
                        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
                          📸 {it.photoCount}
                        </div>
                      )}
                      
                      {it.guest_name && (
                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: '#D4AF37', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
                          {it.guest_name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ position: 'absolute', inset: 0, margin: 'auto', zIndex: 3, pointerEvents: 'none', backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, ${overlayBlurColor} 100%)` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 120, zIndex: 5, pointerEvents: 'none', transform: 'rotate(180deg)', background: `linear-gradient(to bottom, transparent, ${overlayBlurColor})` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, zIndex: 5, pointerEvents: 'none', background: `linear-gradient(to bottom, transparent, ${overlayBlurColor})` }} />
          <div ref={viewerRef} style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--viewer-pad)' }}>
            <div ref={scrimRef} className="scrim" style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', opacity: 0, transition: 'opacity 500ms', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div ref={frameRef} className="viewer-frame" style={{ width: openedImageWidth, height: openedImageWidth, maxWidth: '90vw', maxHeight: '90vw', display: 'flex', borderRadius: openedImageBorderRadius, position: 'relative' }}>
              {selectedAlbum && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'auto' }}>
                  <Stack 
                    sendToBackOnClick={true}
                    sensitivity={120}
                    cards={[...selectedAlbum.photos].reverse().map((p, idx) => (
                      p.type === 'video' ? 
                        <video key={idx} src={p.src} autoPlay muted loop playsInline style={{width:'100%',height:'100%',objectFit:'cover', borderRadius: openedImageBorderRadius, pointerEvents:'none'}}/>
                      : 
                        <img key={idx} src={p.src} style={{width:'100%',height:'100%',objectFit:'cover', borderRadius: openedImageBorderRadius, pointerEvents:'none'}}/>
                    ))} 
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
