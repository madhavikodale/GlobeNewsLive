'use client';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const MARKERS = [
  { lat: 37.6, lon: -122.1, label: 'Silicon Valley', color: '#00ffff', size: 0.028 },
  { lat: 51.5, lon: -0.1, label: 'London', color: '#00ffff', size: 0.022 },
  { lat: 35.7, lon: 139.7, label: 'Tokyo', color: '#00ffff', size: 0.022 },
  { lat: 1.3, lon: 103.8, label: 'Singapore', color: '#00ffff', size: 0.020 },
  { lat: 25.2, lon: 55.3, label: 'Dubai', color: '#ffaa00', size: 0.018 },
];

const CONNECTIONS = [
  { from: { lat: 37.6, lon: -122.1 }, to: { lat: 51.5, lon: -0.1 }, color: '#00ffff', speed: 1.2 },
  { from: { lat: 37.6, lon: -122.1 }, to: { lat: 35.7, lon: 139.7 }, color: '#00ffff', speed: 1.0 },
  { from: { lat: 51.5, lon: -0.1 }, to: { lat: 25.2, lon: 55.3 }, color: '#00ffff', speed: 1.5 },
];

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createArcPoints(from: THREE.Vector3, to: THREE.Vector3, numPoints = 100, arcHeight = 0.4) {
  const points: THREE.Vector3[] = [];
  const mid = from.clone().add(to).multiplyScalar(0.5);
  const dist = from.distanceTo(to);
  mid.normalize().multiplyScalar(from.length() + dist * arcHeight);
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const point = new THREE.Vector3().addVectors(
      from.clone().multiplyScalar((1 - t) * (1 - t)),
      mid.clone().multiplyScalar(2 * t * (1 - t))
    ).add(to.clone().multiplyScalar(t * t));
    points.push(point);
  }
  return points;
}

export default function TechGlobe3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<{ mesh: THREE.Mesh; pts: THREE.Vector3[]; progress: number; speed: number }[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020818);
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 3.5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Globe
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x020818, emissive: 0x000511, shininess: 10 })
    );
    group.add(globe);
    scene.add(new THREE.AmbientLight(0x4488ff, 1));

    // Connections & Particles
    CONNECTIONS.forEach(conn => {
      const from = latLonToVec3(conn.from.lat, conn.from.lon, 1.01);
      const to = latLonToVec3(conn.to.lat, conn.to.lon, 1.01);
      const pts = createArcPoints(from, to);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: conn.color, transparent: true, opacity: 0.3 }));
      group.add(line);

      const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), new THREE.MeshBasicMaterial({ color: conn.color }));
      group.add(pMesh);
      particlesRef.current.push({ mesh: pMesh, pts, progress: Math.random(), speed: conn.speed * 0.005 });
    });

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.y += 0.002;
      particlesRef.current.forEach(p => {
        p.progress = (p.progress + p.speed) % 1;
        const idx = Math.floor(p.progress * (p.pts.length - 1));
        p.mesh.position.copy(p.pts[idx]);
      });
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  return <div ref={mountRef} className="w-full h-full bg-[#020818]" />;
}
