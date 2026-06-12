"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Globe3D({ size = 220 }: { size?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Main wireframe globe
    const geo = new THREE.SphereGeometry(1, 32, 32);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wire = new THREE.Mesh(geo, wireMat);
    scene.add(wire);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(0.97, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x000814,
      transparent: true,
      opacity: 0.85,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    scene.add(inner);

    // Latitude/longitude rings
    const ringColor = new THREE.Color(0x00d4ff);
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = Math.sin((lat * Math.PI) / 180);
      const r = Math.cos((lat * Math.PI) / 180);
      const ringGeo = new THREE.TorusGeometry(r, 0.003, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = y;
      scene.add(ring);
    }
    for (let lon = 0; lon < 360; lon += 30) {
      const ringGeo = new THREE.TorusGeometry(1, 0.002, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.2 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.y = (lon * Math.PI) / 180;
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    }

    // Glowing dots on surface
    const dotGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const positions = [
      [0.5, 0.7, 0.52], [-0.7, 0.3, 0.65], [0.1, -0.6, 0.8],
      [-0.3, 0.8, 0.5], [0.8, -0.2, 0.56], [-0.5, -0.5, 0.7],
      [0.6, 0.5, -0.62], [-0.4, 0.6, -0.7], [0.2, -0.8, -0.57],
    ];
    positions.forEach(([x, y, z]) => {
      const dot = new THREE.Mesh(dotGeo, dotMat.clone());
      const len = Math.sqrt(x * x + y * y + z * z);
      dot.position.set(x / len, y / len, z / len);
      scene.add(dot);
    });

    // Outer glow ring
    const outerRingGeo = new THREE.TorusGeometry(1.15, 0.01, 8, 128);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x7b2fff,
      transparent: true,
      opacity: 0.5,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    scene.add(outerRing);

    // Orbital ring 2
    const orb2Geo = new THREE.TorusGeometry(1.3, 0.006, 8, 128);
    const orb2Mat = new THREE.MeshBasicMaterial({
      color: 0x00fff5,
      transparent: true,
      opacity: 0.25,
    });
    const orb2 = new THREE.Mesh(orb2Geo, orb2Mat);
    orb2.rotation.x = Math.PI / 4;
    orb2.rotation.z = Math.PI / 6;
    scene.add(orb2);

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / size - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / size - 0.5) * 2;
    };
    mount.addEventListener("mousemove", handleMouse);

    // Animation loop
    let frameId: number;
    let t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.005;

      // Auto-rotate + mouse tilt
      wire.rotation.y = t;
      wire.rotation.x = mouseY * 0.3;
      inner.rotation.y = t;
      inner.rotation.x = mouseY * 0.3;
      outerRing.rotation.z = t * 0.5;
      outerRing.rotation.x = Math.PI / 2 + mouseY * 0.15;
      orb2.rotation.y = -t * 0.7;

      // Pulse wireframe opacity
      wireMat.opacity = 0.15 + Math.sin(t * 2) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      mount.removeEventListener("mousemove", handleMouse);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size, flexShrink: 0, cursor: "grab" }}
    />
  );
}
