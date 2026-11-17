import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useMine } from '../../context/MineContext';
import {
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
  Compass,
  Play,
  Pause,
  FastForward,
  Info,
  Maximize2,
  Calendar,
  Radio,
  AlertTriangle,
  Sliders,
  ChevronDown,
  Sparkles,
  Zap,
  Box
} from 'lucide-react';
import { SensorNode } from '../../types';

export const DigitalTwinView: React.FC = () => {
  const {
    nodes,
    aiRisk,
    activeScenario,
    timelineIndex,
    setTimelineIndex,
    isPlayingTimeline,
    setIsPlayingTimeline,
    simulationSpeed,
    setSimulationSpeed,
    setActiveNodeId,
    activeNodeId,
    zones
  } = useMine();

  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<SensorNode | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cameraMode, setCameraMode] = useState<'perspective' | 'top' | 'side' | 'underground'>('perspective');
  const [isCrossSection, setIsCrossSection] = useState<boolean>(false);

  // 10 Visualization Layers Toggles
  const [layers, setLayers] = useState({
    terrain: true,
    tunnels: true,
    minePanels: true,
    sensorNodes: true,
    wirelessLinks: true,
    subsidenceZones: true,
    landslideZones: true,
    displacementHeatmap: true,
    moistureRadar: false,
    infrastructure: true
  });

  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const linksGroupRef = useRef<THREE.Group | null>(null);
  const tunnelsGroupRef = useRef<THREE.Group | null>(null);
  const panelsGroupRef = useRef<THREE.Group | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const heatmapMeshRef = useRef<THREE.Mesh | null>(null);
  const subsidenceZoneMeshRef = useRef<THREE.Mesh | null>(null);
  const landslideZoneMeshRef = useRef<THREE.Mesh | null>(null);
  const infraGroupRef = useRef<THREE.Group | null>(null);

  // Compute procedural terrain elevation function: y = f(x, z)
  const getElevation = (x: number, z: number) => {
    // Overburden dump hill on North (x: -40 to -20, z: -55 to -25)
    const distToDump = Math.hypot(x - (-30), z - (-40));
    const dumpElevation = Math.max(0, 18 - distToDump * 0.45);

    // Open pit depression on West (x: -50 to -25, z: 10 to 40)
    const distToPit = Math.hypot(x - (-40), z - 25);
    const pitDepth = Math.max(0, 14 - distToPit * 0.55);

    // Subsidence trough on Panel 04 (x: 10 to 30, z: -25 to -5)
    // Deepens if subsidence scenario is active
    const distToSub = Math.hypot(x - 18, z - 15);
    const subDepth = (activeScenario === 'subsidence_event' ? 3.5 : 1.2) * Math.max(0, 1 - distToSub / 25);

    // Natural undulating topography
    const naturalHill = Math.sin(x * 0.04) * 3.5 + Math.cos(z * 0.04) * 3.0;

    return Math.max(-12, naturalHill + dumpElevation - pitDepth - subDepth + 6);
  };

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f17);
    scene.fog = new THREE.FogExp2(0x0b0f17, 0.004);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(70, 60, 95);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.08; // Allow slight underground tilt
    controls.minDistance = 15;
    controls.maxDistance = 260;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Ambient & Directional Sun Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 0.5);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(80, 120, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    const d = 110;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Accent Rim Light (Cyan tone for industrial technology feel)
    const cyanRim = new THREE.DirectionalLight(0x06b6d4, 0.6);
    cyanRim.position.set(-90, 40, -90);
    scene.add(cyanRim);

    // ==========================================
    // 1. PROCEDURAL TERRAIN GEOMETRY
    // ==========================================
    const terrainSize = 180;
    const segments = 120;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const count = posAttr.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = getElevation(x, z);
      posAttr.setY(i, y);

      // Procedural color coding:
      // High overburden dump = darker shale/rock brown
      // Pit floor = exposed deep coal/shale
      // Natural slopes = muted slate green/grey
      let r = 0.16, g = 0.20, b = 0.26; // base slate
      if (y > 12) {
        // Overburden dump crest
        r = 0.28; g = 0.24; b = 0.20;
      } else if (y < 0) {
        // Pit floor
        r = 0.10; g = 0.11; b = 0.14;
      } else if (x > 0 && z < 0) {
        // Panel 04 surface
        r = 0.18; g = 0.22; b = 0.28;
      }
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.12,
      flatShading: true
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // Grid wireframe overlay for precision engineering feel
    const wireframeGeo = new THREE.WireframeGeometry(terrainGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.18 });
    const wireframeLine = new THREE.LineSegments(wireframeGeo, wireframeMat);
    terrainMesh.add(wireframeLine);

    // ==========================================
    // 2. DISPLACEMENT & RISK HEATMAP OVERLAY
    // ==========================================
    const heatmapGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, 80, 80);
    heatmapGeo.rotateX(-Math.PI / 2);
    const hPos = heatmapGeo.attributes.position;
    const hColors = new Float32Array(hPos.count * 3);

    for (let i = 0; i < hPos.count; i++) {
      const x = hPos.getX(i);
      const z = hPos.getZ(i);
      const y = getElevation(x, z) + 0.15; // slightly above terrain
      hPos.setY(i, y);

      // Calculate risk heat:
      // High in Zone A (Dump crest) and Zone B (Panel 04 center)
      const distZoneA = Math.hypot(x - (-32), z - (-42));
      const distZoneB = Math.hypot(x - 18, z - (-15));
      
      const heatA = Math.max(0, 1 - distZoneA / 28) * (aiRisk.landslideScore / 100);
      const heatB = Math.max(0, 1 - distZoneB / 26) * (aiRisk.subsidenceScore / 100);
      const totalHeat = Math.min(1.0, heatA + heatB);

      // Color from Green (0) -> Yellow (0.4) -> Orange (0.7) -> Red (1.0)
      let hr = 0.05, hg = 0.8, hb = 0.4;
      if (totalHeat > 0.65) {
        hr = 0.95; hg = 0.15; hb = 0.15; // Red
      } else if (totalHeat > 0.35) {
        hr = 0.95; hg = 0.65; hb = 0.1; // Orange/Yellow
      } else if (totalHeat > 0.1) {
        hr = 0.2; hg = 0.85; hb = 0.3; // Greenish
      }

      hColors[i * 3] = hr;
      hColors[i * 3 + 1] = hg;
      hColors[i * 3 + 2] = hb;
    }
    heatmapGeo.setAttribute('color', new THREE.BufferAttribute(hColors, 3));
    heatmapGeo.computeVertexNormals();

    const heatmapMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const heatmapMesh = new THREE.Mesh(heatmapGeo, heatmapMat);
    scene.add(heatmapMesh);
    heatmapMeshRef.current = heatmapMesh;

    // ==========================================
    // 3. UNDERGROUND LONGWALL PANELS & TUNNELS
    // ==========================================
    const panelsGroup = new THREE.Group();
    const tunnelsGroup = new THREE.Group();

    // Underground Coal Seam IV Panel 04 (Extraction seam at Y = -18)
    const panelGeo = new THREE.BoxGeometry(45, 3.5, 30);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.65,
      roughness: 0.5,
      metalness: 0.4,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.4
    });
    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    panelMesh.position.set(20, -18, -15);
    panelsGroup.add(panelMesh);

    // Extraction Boundary Rib Wireframe
    const panelWireGeo = new THREE.WireframeGeometry(panelGeo);
    const panelWireMat = new THREE.LineBasicMaterial({ color: 0xc084fc, linewidth: 2 });
    const panelWire = new THREE.LineSegments(panelWireGeo, panelWireMat);
    panelMesh.add(panelWire);

    // Underground Roadways / Tunnels (Maingate, Tailgate, Central Drift)
    const tunnelMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.6,
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85
    });

    // Main Intake Decline (Sloping from surface at x=0, z=0 to y=-18)
    const tunnel1Geo = new THREE.CylinderGeometry(2.0, 2.0, 65, 16);
    tunnel1Geo.rotateZ(Math.PI / 2.3);
    const tunnel1 = new THREE.Mesh(tunnel1Geo, tunnelMat);
    tunnel1.position.set(0, -9, -5);
    tunnelsGroup.add(tunnel1);

    // Panel 04 Maingate crosscut
    const tunnel2Geo = new THREE.CylinderGeometry(1.8, 1.8, 55, 16);
    tunnel2Geo.rotateX(Math.PI / 2);
    const tunnel2 = new THREE.Mesh(tunnel2Geo, tunnelMat);
    tunnel2.position.set(38, -18, -15);
    tunnelsGroup.add(tunnel2);

    // Panel 04 Tailgate return airway
    const tunnel3 = tunnel2.clone();
    tunnel3.position.set(2, -18, -15);
    tunnelsGroup.add(tunnel3);

    scene.add(panelsGroup);
    scene.add(tunnelsGroup);
    panelsGroupRef.current = panelsGroup;
    tunnelsGroupRef.current = tunnelsGroup;

    // Strata Subsidence Projection Cone (Showing zone of draw / angle of break ~65°)
    const coneGeo = new THREE.CylinderGeometry(35, 20, 24, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
      side: THREE.DoubleSide
    });
    const subCone = new THREE.Mesh(coneGeo, coneMat);
    subCone.position.set(20, -6, -15);
    panelsGroup.add(subCone);

    // ==========================================
    // 4. MINE INFRASTRUCTURE & ACCESS ROADS
    // ==========================================
    const infraGroup = new THREE.Group();

    // Main Substation & Control Building
    const buildingGeo = new THREE.BoxGeometry(10, 6, 8);
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const building = new THREE.Mesh(buildingGeo, buildingMat);
    const bY = getElevation(0, 0);
    building.position.set(0, bY + 3, 0);
    building.castShadow = true;
    building.receiveShadow = true;
    infraGroup.add(building);

    // Gateway Mast Alpha
    const mastGeo = new THREE.CylinderGeometry(0.3, 0.4, 12, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.3 });
    const mastAlpha = new THREE.Mesh(mastGeo, mastMat);
    mastAlpha.position.set(-5, getElevation(-5, -5) + 6, -5);
    infraGroup.add(mastAlpha);

    // Gateway Mast Alpha Solar Dish
    const dishGeo = new THREE.BoxGeometry(2, 0.2, 2);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 5.8, 0);
    dish.rotateX(0.4);
    mastAlpha.add(dish);

    scene.add(infraGroup);
    infraGroupRef.current = infraGroup;

    // ==========================================
    // 5. WIRELESS COMMUNICATION MESH LINKS GROUP
    // ==========================================
    const linksGroup = new THREE.Group();
    scene.add(linksGroup);
    linksGroupRef.current = linksGroup;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle pulsating effect for critical nodes
      nodeMeshesRef.current.forEach((group, id) => {
        const halo = group.getObjectByName('halo');
        if (halo) {
          halo.scale.setScalar(1.0 + Math.sin(time * 4) * 0.25);
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Raycasting for Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      setMousePos({ x: e.clientX, y: e.clientY });

      raycaster.setFromCamera(mouse, camera);

      // Check intersection against node hitboxes
      const interactiveObjects: THREE.Object3D[] = [];
      nodeMeshesRef.current.forEach(group => {
        const marker = group.getObjectByName('marker');
        if (marker) interactiveObjects.push(marker);
      });

      const intersects = raycaster.intersectObjects(interactiveObjects, false);
      if (intersects.length > 0) {
        const hitGroup = intersects[0].object.parent;
        if (hitGroup && hitGroup.userData.node) {
          setHoveredNode(hitGroup.userData.node as SensorNode);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredNode(null);
      container.style.cursor = 'default';
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveObjects: THREE.Object3D[] = [];
      nodeMeshesRef.current.forEach(group => {
        const marker = group.getObjectByName('marker');
        if (marker) interactiveObjects.push(marker);
      });

      const intersects = raycaster.intersectObjects(interactiveObjects, false);
      if (intersects.length > 0) {
        const hitGroup = intersects[0].object.parent;
        if (hitGroup && hitGroup.userData.node) {
          setActiveNodeId((hitGroup.userData.node as SensorNode).id);
        }
      }
    };

    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Update 3D Sensor Nodes in the Scene
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clear existing node markers
    nodeMeshesRef.current.forEach(group => scene.remove(group));
    nodeMeshesRef.current.clear();

    nodes.forEach(node => {
      const group = new THREE.Group();
      group.userData = { node };

      // Node coordinates
      const [x, , z] = node.position3D;
      const y = getElevation(x, z);
      group.position.set(x, y + 0.4, z);

      // Determine color by status
      let colorHex = 0x10b981; // Normal Green
      if (node.status === 'critical') colorHex = 0xef4444; // Critical Red
      else if (node.status === 'warning') colorHex = 0xf59e0b; // Warning Amber
      else if (node.status === 'offline') colorHex = 0x64748b; // Offline Slate

      // Marker shape (Puck base + upper dome)
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.6, 16);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.castShadow = true;
      group.add(base);

      // Status indicator sphere / beacon
      const sphereGeo = new THREE.SphereGeometry(0.85, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: node.status === 'offline' ? 0.0 : 0.85,
        roughness: 0.2
      });
      const marker = new THREE.Mesh(sphereGeo, sphereMat);
      marker.name = 'marker';
      marker.position.y = 0.9;
      marker.castShadow = true;
      group.add(marker);

      // Pulsing radar ring / halo for critical or warning nodes
      if (node.status === 'critical' || node.status === 'warning') {
        const ringGeo = new THREE.RingGeometry(1.4, 2.2, 24);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        });
        const halo = new THREE.Mesh(ringGeo, ringMat);
        halo.name = 'halo';
        halo.position.y = 0.1;
        group.add(halo);
      }

      // Small solar stick antenna mast
      const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.set(0.6, 1.2, 0);
      group.add(mast);

      scene.add(group);
      nodeMeshesRef.current.set(node.id, group);
    });

    // Update Wireless Mesh Links
    if (linksGroupRef.current) {
      const linksGroup = linksGroupRef.current;
      while (linksGroup.children.length > 0) {
        linksGroup.remove(linksGroup.children[0]);
      }

      if (layers.wirelessLinks) {
        // Draw lines from nodes to their parent gateways or relays
        nodes.forEach(node => {
          if (node.status === 'offline') return;
          const parent = nodes.find(n => n.id === node.parentGatewayId) || nodes.find(n => n.id === 'GW-ALPHA');
          if (!parent) return;

          const start = new THREE.Vector3(node.position3D[0], getElevation(node.position3D[0], node.position3D[2]) + 1.2, node.position3D[2]);
          const end = new THREE.Vector3(parent.position3D[0], getElevation(parent.position3D[0], parent.position3D[2]) + 2.0, parent.position3D[2]);

          const points = [start, end];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const linkColor = node.packetLoss > 5 ? 0xef4444 : node.signalRssi < -95 ? 0xf59e0b : 0x06b6d4;

          const lineMat = new THREE.LineDashedMaterial({
            color: linkColor,
            dashSize: 2,
            gapSize: 1,
            transparent: true,
            opacity: 0.4
          });
          const line = new THREE.Line(lineGeo, lineMat);
          line.computeLineDistances();
          linksGroup.add(line);
        });
      }
    }
  }, [nodes, layers.wirelessLinks, activeScenario, aiRisk]);

  // Handle Layer Visibility Toggles
  useEffect(() => {
    if (terrainMeshRef.current) terrainMeshRef.current.visible = layers.terrain;
    if (heatmapMeshRef.current) heatmapMeshRef.current.visible = layers.displacementHeatmap;
    if (panelsGroupRef.current) panelsGroupRef.current.visible = layers.minePanels;
    if (tunnelsGroupRef.current) tunnelsGroupRef.current.visible = layers.tunnels;
    if (linksGroupRef.current) linksGroupRef.current.visible = layers.wirelessLinks;
    if (infraGroupRef.current) infraGroupRef.current.visible = layers.infrastructure;
    nodeMeshesRef.current.forEach(group => {
      group.visible = layers.sensorNodes;
    });
  }, [layers]);

  // Camera Presets
  const setCameraView = (mode: 'perspective' | 'top' | 'side' | 'underground') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    setCameraMode(mode);

    if (mode === 'top') {
      camera.position.set(0, 160, 0);
      controls.target.set(0, 0, 0);
    } else if (mode === 'side') {
      camera.position.set(160, 20, 0);
      controls.target.set(0, 5, 0);
    } else if (mode === 'underground') {
      // Look straight at underground seam & Panel 04
      camera.position.set(40, -14, 35);
      controls.target.set(20, -18, -15);
    } else {
      camera.position.set(70, 60, 95);
      controls.target.set(0, 2, 0);
    }
    controls.update();
  };

  const toggleCrossSection = () => {
    setIsCrossSection(!isCrossSection);
    if (!isCrossSection) {
      setCameraView('underground');
    } else {
      setCameraView('perspective');
    }
  };

  return (
    <div className="relative h-[calc(100vh-7rem)] w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0b0f17] flex flex-col select-none">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing" />

      {/* Floating Left: View Mode & Camera Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center space-x-1 text-xs">
          <button
            onClick={() => setCameraView('perspective')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              cameraMode === 'perspective' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Perspective
          </button>
          <button
            onClick={() => setCameraView('top')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              cameraMode === 'top' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Top (GIS)
          </button>
          <button
            onClick={() => setCameraView('side')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              cameraMode === 'side' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Side Profile
          </button>
          <button
            onClick={toggleCrossSection}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1 ${
              cameraMode === 'underground' ? 'bg-purple-600 text-white font-bold shadow' : 'text-purple-300 hover:text-white hover:bg-purple-950/60'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Underground Seam</span>
          </button>
        </div>

        <button
          onClick={() => setCameraView('perspective')}
          className="self-start px-2.5 py-1.5 rounded-lg bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 flex items-center space-x-1.5 shadow-lg transition-colors"
          title="Reset Camera Target and Zoom"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Camera</span>
        </button>
      </div>

      {/* Floating Right: 10 Visualization Layers Dropdown */}
      <div className="absolute top-4 right-4 z-20">
        <div className="relative">
          <button
            onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#0f172a]/95 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 text-xs font-semibold text-white shadow-xl transition-all"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Visualization Layers (10)</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isLayersMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLayersMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-3 z-30 text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                <span>Toggle 3D Layers</span>
                <span className="text-cyan-400 font-mono">Independent</span>
              </div>

              {[
                { key: 'terrain', label: '1. Surface Terrain & Contours' },
                { key: 'tunnels', label: '2. Underground Mine Tunnels' },
                { key: 'minePanels', label: '3. Longwall Panels (-180m)' },
                { key: 'sensorNodes', label: '4. 3D Sensor Node Markers' },
                { key: 'wirelessLinks', label: '5. Wireless Mesh LoRa Links' },
                { key: 'subsidenceZones', label: '6. Subsidence Hazard Basin' },
                { key: 'landslideZones', label: '7. Landslide Creep Overburden' },
                { key: 'displacementHeatmap', label: '8. Cumulative Displacement Heatmap' },
                { key: 'infrastructure', label: '9. Mine Infrastructure & Mast' },
                { key: 'moistureRadar', label: '10. Rainfall Radar Saturation' },
              ].map(({ key, label }) => {
                const k = key as keyof typeof layers;
                return (
                  <button
                    key={key}
                    onClick={() => setLayers(prev => ({ ...prev, [k]: !prev[k] }))}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
                  >
                    <span className={layers[k] ? 'text-white font-medium' : 'text-slate-500'}>{label}</span>
                    {layers[k] ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-slate-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom-Right: Risk Heatmap Legend */}
      <div className="absolute bottom-20 right-4 z-20 bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-2 pointer-events-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Terrain Risk Heatmap Legend
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Moderate</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">High</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-slate-300 font-bold">Critical</span>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip (Section 5 Hover Requirement) */}
      {hoveredNode && (
        <div
          className="fixed pointer-events-none z-50 bg-[#0f172a]/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl p-3 shadow-2xl text-xs max-w-xs animate-in fade-in duration-100"
          style={{
            left: `${mousePos.x + 16}px`,
            top: `${mousePos.y - 40}px`
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                hoveredNode.status === 'critical' ? 'bg-red-500' :
                hoveredNode.status === 'warning' ? 'bg-amber-400' :
                hoveredNode.status === 'offline' ? 'bg-slate-500' : 'bg-emerald-400'
              }`} />
              <span className="font-mono font-bold text-white text-sm">{hoveredNode.id}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300">
              {hoveredNode.zone}
            </span>
          </div>

          <div className="space-y-1 text-slate-300 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold capitalize text-white">{hoveredNode.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Battery / Health:</span>
              <span className="font-mono font-bold text-emerald-400">{hoveredNode.battery}% ({hoveredNode.health}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Displacement:</span>
              <span className="font-mono font-bold text-cyan-400">{hoveredNode.measurements.displacement} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tilt Angle:</span>
              <span className="font-mono font-bold text-purple-400">{hoveredNode.measurements.tiltAngle}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pore Pressure:</span>
              <span className="font-mono font-bold text-blue-400">{hoveredNode.measurements.porePressure} kPa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Soil Moisture:</span>
              <span className="font-mono font-bold text-emerald-300">{hoveredNode.measurements.soilMoisture}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AI Hazard Impact:</span>
              <span className="font-mono font-bold text-amber-400">{hoveredNode.aiRiskContribution}/100</span>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-cyan-400 font-semibold flex items-center justify-between">
            <span>Click to inspect sensor panel</span>
            <span className="text-slate-500 font-normal">{hoveredNode.lastCommunication}</span>
          </div>
        </div>
      )}

      {/* Historical Playback Timeline (Section 5 Historical Playback Requirement) */}
      <div className="h-16 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 px-6 flex items-center justify-between z-20 gap-4">
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
            className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow"
            title={isPlayingTimeline ? "Pause timeline replay" : "Play historical timeline"}
          >
            {isPlayingTimeline ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
          </button>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Historical Timeline Replay</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded text-cyan-400">
                {timelineIndex === 24 ? 'LIVE' : `-${24 - timelineIndex}h`}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Scrub to compare deformation progression over past 24 hours
            </div>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 max-w-xl flex items-center space-x-3">
          <span className="text-[10px] font-mono text-slate-500">-24h</span>
          <input
            type="range"
            min="0"
            max="24"
            value={timelineIndex}
            onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] font-mono text-cyan-400 font-bold">NOW</span>
        </div>

        {/* Speed & Comparison */}
        <div className="hidden sm:flex items-center space-x-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium">Replay:</span>
          {[1, 2, 5].map(sp => (
            <button
              key={sp}
              onClick={() => setSimulationSpeed(sp)}
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                simulationSpeed === sp ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sp}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
