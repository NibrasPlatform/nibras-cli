'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type LogoVariant = 'surface' | 'inverse' | 'theme';

export default function NibrasLogoThree({
  variant = 'inverse',
  width = 90,
  className = '',
}: {
  variant?: LogoVariant;
  width?: number;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Icon takes ~42% of total width so the full wordmark stays proportional
  const iconSize = Math.round(width * 0.42);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ─────────────────────────────── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(iconSize, iconSize);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* ─────────────────────────────── Scene & Camera ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    // ~22° elevation matches the SVG's tilted-ring perspective (atan(1.0/2.6) ≈ 21°)
    camera.position.set(0, 1.0, 2.6);
    camera.lookAt(0, 0, 0);

    /* ─────────────────────────────── Lighting ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    // Indigo rim light for depth
    const rimLight = new THREE.PointLight(0x818cf8, 0.9, 6);
    rimLight.position.set(-2, -0.5, -1.5);
    scene.add(rimLight);

    /* ─────────────────────────────── Globe (sphere) ── */
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.63, 48, 48),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.45,
        metalness: 0.12,
      })
    );
    scene.add(sphere);

    /* ─────────────────────────────── Animated group (rings + crosshair) ── */
    const group = new THREE.Group();
    scene.add(group);

    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      opacity: 0.72,
      transparent: true,
      roughness: 0.25,
    });

    // Ring 1 — Equatorial (XZ plane)
    // TorusGeometry lies in XY by default; rotating 90° around X puts it in XZ.
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.019, 16, 120), ringMat);
    ring1.rotation.x = Math.PI / 2;
    group.add(ring1);

    // Ring 2 — Meridional (XY plane, vertical)
    // Appears as the tall ellipse when viewed from the camera angle above.
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.019, 16, 120), ringMat.clone());
    group.add(ring2);

    /* ─────────────────────────────── Crosshair lines ── */
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      opacity: 0.28,
      transparent: true,
    });
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-1.05, 0, 0),
          new THREE.Vector3(1.05, 0, 0),
        ]),
        lineMat
      )
    );
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -1.05, 0),
          new THREE.Vector3(0, 1.05, 0),
        ]),
        lineMat
      )
    );

    /* ─────────────────────────────── Outer border ring ── */
    // Mimics the faint outer stroke circle in the SVG icon
    const border = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.007, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.17, transparent: true })
    );
    border.rotation.x = Math.PI / 2;
    scene.add(border);

    /* ─────────────────────────────── Animation loop ── */
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.55; // orbital rings spin
      sphere.rotation.y = t * 0.12; // globe turns slowly
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [iconSize]);

  /* ─────────────────────────────── Text colour per variant ── */
  const textColor =
    variant === 'surface' ? '#0f172a' : variant === 'inverse' ? '#fafafa' : 'inherit';

  const fontSize = Math.round(iconSize * 0.66);
  const gap = Math.round(iconSize * 0.2);

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {/* Three.js canvas mount point */}
      <div
        ref={mountRef}
        style={{ width: iconSize, height: iconSize, flexShrink: 0, lineHeight: 0 }}
      />

      {/* Wordmark text */}
      <span
        style={{
          fontFamily: '"Red Hat Display", system-ui, sans-serif',
          fontWeight: 800,
          fontSize,
          letterSpacing: '-0.025em',
          color: textColor,
        }}
      >
        Nibras
      </span>
    </span>
  );
}
