"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export type FaceKey = "U" | "D" | "L" | "R" | "F" | "B";
export type RubikColorKey = "W" | "Y" | "R" | "O" | "G" | "B" | "K";

type Vec3i = { x: -1 | 0 | 1; y: -1 | 0 | 1; z: -1 | 0 | 1 };

type Cubie = {
  id: string;
  p: Vec3i;
  stickers: Partial<Record<FaceKey, RubikColorKey>>;
};

type TurnFaceDetail = { face: FaceKey; dir: 1 | -1 };

const FACE_NORMALS: Record<FaceKey, THREE.Vector3> = {
  U: new THREE.Vector3(0, 1, 0),
  D: new THREE.Vector3(0, -1, 0),
  L: new THREE.Vector3(-1, 0, 0),
  R: new THREE.Vector3(1, 0, 0),
  F: new THREE.Vector3(0, 0, 1),
  B: new THREE.Vector3(0, 0, -1),
};

const COLOR_HEX: Record<RubikColorKey, string> = {
  W: "#ffffff",
  Y: "#ffd500",
  R: "#c41e3a",
  O: "#ff5800",
  G: "#009b48",
  B: "#0051ba",
  K: "#101114",
};

function vecToFace(v: THREE.Vector3): FaceKey {
  const ax = Math.abs(v.x);
  const ay = Math.abs(v.y);
  const az = Math.abs(v.z);
  if (ay >= ax && ay >= az) return v.y >= 0 ? "U" : "D";
  if (ax >= ay && ax >= az) return v.x >= 0 ? "R" : "L";
  return v.z >= 0 ? "F" : "B";
}

function roundToInt(n: number): -1 | 0 | 1 {
  if (n > 0.5) return 1;
  if (n < -0.5) return -1;
  return 0;
}

function rotateVec90(v: THREE.Vector3, axis: "x" | "y" | "z", dir: 1 | -1) {
  const m = new THREE.Matrix4();
  const angle = (Math.PI / 2) * dir;
  if (axis === "x") m.makeRotationX(angle);
  if (axis === "y") m.makeRotationY(angle);
  if (axis === "z") m.makeRotationZ(angle);
  return v.clone().applyMatrix4(m);
}

function rotateCubiePos(p: Vec3i, axis: "x" | "y" | "z", dir: 1 | -1): Vec3i {
  const v = rotateVec90(new THREE.Vector3(p.x, p.y, p.z), axis, dir);
  return { x: roundToInt(v.x), y: roundToInt(v.y), z: roundToInt(v.z) };
}

function rotateStickers(
  stickers: Partial<Record<FaceKey, RubikColorKey>>,
  axis: "x" | "y" | "z",
  dir: 1 | -1
) {
  const next: Partial<Record<FaceKey, RubikColorKey>> = {};
  for (const [face, col] of Object.entries(stickers) as Array<[FaceKey, RubikColorKey]>) {
    const n = FACE_NORMALS[face];
    const n2 = rotateVec90(n, axis, dir);
    next[vecToFace(n2)] = col;
  }
  return next;
}

function faceToAxisLayer(face: FaceKey): { axis: "x" | "y" | "z"; layer: -1 | 1; invertDir: boolean } {
  if (face === "U") return { axis: "y", layer: 1, invertDir: false };
  if (face === "D") return { axis: "y", layer: -1, invertDir: true };
  if (face === "R") return { axis: "x", layer: 1, invertDir: false };
  if (face === "L") return { axis: "x", layer: -1, invertDir: true };
  if (face === "F") return { axis: "z", layer: 1, invertDir: false };
  return { axis: "z", layer: -1, invertDir: true }; // B
}

function createInitialCube(): Cubie[] {
  const cubies: Cubie[] = [];
  for (const x of [-1, 0, 1] as const) {
    for (const y of [-1, 0, 1] as const) {
      for (const z of [-1, 0, 1] as const) {
        const stickers: Partial<Record<FaceKey, RubikColorKey>> = {};
        if (y === 1) stickers.U = "W";
        if (y === -1) stickers.D = "Y";
        if (x === -1) stickers.L = "O";
        if (x === 1) stickers.R = "R";
        if (z === 1) stickers.F = "G";
        if (z === -1) stickers.B = "B";
        cubies.push({
          id: `${x}${y}${z}`,
          p: { x, y, z },
          stickers,
        });
      }
    }
  }
  return cubies;
}

type TurnState = {
  axis: "x" | "y" | "z";
  layer: -1 | 1;
  dir: 1 | -1;
  progress: number; // 0..1
  label: string;
};

type PaintHit = { face: FaceKey; point: THREE.Vector3; object: THREE.Object3D };

function TurnAnimator({
  cubies,
  setCubies,
  selectedColor,
  onMove,
}: {
  cubies: Cubie[];
  setCubies: React.Dispatch<React.SetStateAction<Cubie[]>>;
  selectedColor: RubikColorKey;
  onMove: (move: string) => void;
}) {
  const [turn, setTurn] = useState<TurnState | null>(null);
  const queueRef = useRef<TurnFaceDetail[]>([]);
  const historyRef = useRef<TurnFaceDetail[]>([]);

  const beginTurn = useCallback(
    (face: FaceKey, dir: 1 | -1) => {
      if (turn) {
        queueRef.current.push({ face, dir });
        return;
      }
      const { axis, layer, invertDir } = faceToAxisLayer(face);
      const worldDir = (invertDir ? (dir === 1 ? -1 : 1) : dir) as 1 | -1;
      setTurn({
        axis,
        layer,
        dir: worldDir,
        progress: 0,
        label: `${face}${dir === -1 ? "'" : ""}`,
      });
    },
    [turn]
  );

  useEffect(() => {
    const onTurn = (e: Event) => {
      const ce = e as CustomEvent<TurnFaceDetail>;
      const face = ce.detail?.face;
      const dir = ce.detail?.dir;
      if (!face || (dir !== 1 && dir !== -1)) return;
      beginTurn(face, dir);
    };
    const onReset = () => {
      queueRef.current = [];
      historyRef.current = [];
      setTurn(null);
      setCubies(createInitialCube());
      onMove("Reset");
    };
    const onUndo = () => {
      if (turn) return;
      const last = historyRef.current.pop();
      if (!last) return;
      beginTurn(last.face, (last.dir === 1 ? -1 : 1) as 1 | -1);
      onMove(`Undo ${last.face}${last.dir === -1 ? "'" : ""}`);
    };
    window.addEventListener("cubex:cubeTurn", onTurn);
    window.addEventListener("cubex:cubeReset", onReset);
    window.addEventListener("cubex:cubeUndo", onUndo);
    return () => {
      window.removeEventListener("cubex:cubeTurn", onTurn);
      window.removeEventListener("cubex:cubeReset", onReset);
      window.removeEventListener("cubex:cubeUndo", onUndo);
    };
  }, [beginTurn, onMove, setCubies, turn]);

  useFrame((_, dt) => {
    if (!turn) return;
    const speed = 3.2; // higher = snappier
    const next = Math.min(1, turn.progress + dt * speed);
    if (next !== turn.progress) setTurn({ ...turn, progress: next });
    if (next < 1) return;

    setCubies((prev) => {
      const nextCubies = prev.map((c) => {
        const match = (turn.axis === "x" && c.p.x === turn.layer) ||
          (turn.axis === "y" && c.p.y === turn.layer) ||
          (turn.axis === "z" && c.p.z === turn.layer);
        if (!match) return c;
        return {
          ...c,
          p: rotateCubiePos(c.p, turn.axis, turn.dir),
          stickers: rotateStickers(c.stickers, turn.axis, turn.dir),
        };
      });
      return nextCubies;
    });

    if (turn.label[0] && (turn.label[0] as FaceKey)) {
      historyRef.current.push({
        face: turn.label[0] as FaceKey,
        dir: turn.label.includes("'") ? -1 : 1,
      });
    }
    onMove(turn.label);
    setTurn(null);
    const nextCmd = queueRef.current.shift();
    if (nextCmd) beginTurn(nextCmd.face, nextCmd.dir);
  });

  const onPaint = useCallback(
    (cubieId: string, face: FaceKey) => {
      setCubies((prev) =>
        prev.map((c) => {
          if (c.id !== cubieId) return c;
          const stickers = { ...c.stickers, [face]: selectedColor };
          return { ...c, stickers };
        })
      );
    },
    [selectedColor, setCubies]
  );

  const onPaintHit = useCallback(
    ({ face, point, object }: PaintHit) => {
      // Convert world point -> local point of the hit plane
      const local = point.clone();
      object.worldToLocal(local);

      // Planes are 3x3 in local space: x,y in [-1.5..1.5]
      const size = 3;
      const cell = size / 3;
      const clamp01 = (v: number) => Math.max(0, Math.min(2, v));
      const col = clamp01(Math.floor((local.x + size / 2) / cell));
      const row = clamp01(Math.floor((size / 2 - local.y) / cell)); // top -> 0

      // Convert plane-local (u=+x, v=+y) into cube coords depending on face.
      const u = -1 + col; // -1,0,1
      const v = 1 - row; // 1,0,-1

      const pos: Vec3i =
        face === "F"
          ? { x: u as -1 | 0 | 1, y: v as -1 | 0 | 1, z: 1 }
          : face === "B"
            ? { x: (-u) as -1 | 0 | 1, y: v as -1 | 0 | 1, z: -1 }
            : face === "R"
              ? { x: 1, y: v as -1 | 0 | 1, z: (-u) as -1 | 0 | 1 }
              : face === "L"
                ? { x: -1, y: v as -1 | 0 | 1, z: u as -1 | 0 | 1 }
                : face === "U"
                  ? { x: u as -1 | 0 | 1, y: 1, z: (-v) as -1 | 0 | 1 }
                  : { x: u as -1 | 0 | 1, y: -1, z: v as -1 | 0 | 1 }; // D

      setCubies((prev) =>
        prev.map((c) => {
          if (c.p.x !== pos.x || c.p.y !== pos.y || c.p.z !== pos.z) return c;
          const stickers = { ...c.stickers, [face]: selectedColor };
          return { ...c, stickers };
        })
      );
    },
    [selectedColor, setCubies]
  );

  return <RubiksCubeScene cubies={cubies} turn={turn} onPaint={onPaint} onPaintHit={onPaintHit} />;
}

function RubiksCubeScene({
  cubies,
  turn,
  onPaint,
  onPaintHit,
}: {
  cubies: Cubie[];
  turn: TurnState | null;
  onPaint: (cubieId: string, face: FaceKey) => void;
  onPaintHit: (hit: PaintHit) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const angle = turn ? (Math.PI / 2) * turn.dir * easeOutCubic(turn.progress) : 0;
  const axisVec = useMemo(() => {
    if (!turn) return new THREE.Vector3(0, 1, 0);
    if (turn.axis === "x") return new THREE.Vector3(1, 0, 0);
    if (turn.axis === "y") return new THREE.Vector3(0, 1, 0);
    return new THREE.Vector3(0, 0, 1);
  }, [turn]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Soft “table” glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.05, 0]}>
        <circleGeometry args={[3.8, 64]} />
        <meshStandardMaterial color="#0b0d12" emissive="#101625" emissiveIntensity={0.6} roughness={0.95} />
      </mesh>

      {/* Invisible hit-planes so "black gaps" are paintable */}
      <HitPlanes onPaintHit={onPaintHit} />

      {/* Cube */}
      {cubies.map((c) => {
        const inTurn =
          !!turn &&
          ((turn.axis === "x" && c.p.x === turn.layer) ||
            (turn.axis === "y" && c.p.y === turn.layer) ||
            (turn.axis === "z" && c.p.z === turn.layer));

        const basePos: [number, number, number] = [c.p.x * 1.06, c.p.y * 1.06, c.p.z * 1.06];
        return (
          <group key={c.id} position={basePos} quaternion={inTurn ? new THREE.Quaternion().setFromAxisAngle(axisVec, angle) : undefined}>
            <CubieMesh cubie={c} onPaint={onPaint} />
          </group>
        );
      })}
    </group>
  );
}

function HitPlanes({ onPaintHit }: { onPaintHit: (hit: PaintHit) => void }) {
  const planeGeom = useMemo(() => new THREE.PlaneGeometry(3, 3, 1, 1), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.001,
        depthWrite: false,
      }),
    []
  );

  const planes = useMemo(
    () =>
      [
        { face: "F" as const, pos: [0, 0, 1.58] as const, rot: [0, 0, 0] as const },
        { face: "B" as const, pos: [0, 0, -1.58] as const, rot: [0, Math.PI, 0] as const },
        { face: "R" as const, pos: [1.58, 0, 0] as const, rot: [0, -Math.PI / 2, 0] as const },
        { face: "L" as const, pos: [-1.58, 0, 0] as const, rot: [0, Math.PI / 2, 0] as const },
        { face: "U" as const, pos: [0, 1.58, 0] as const, rot: [-Math.PI / 2, 0, 0] as const },
        { face: "D" as const, pos: [0, -1.58, 0] as const, rot: [Math.PI / 2, 0, 0] as const },
      ] as const,
    []
  );

  return (
    <group>
      {planes.map((p) => (
        <mesh
          key={p.face}
          geometry={planeGeom}
          material={mat}
          position={p.pos}
          rotation={p.rot}
          onPointerDown={(e) => {
            e.stopPropagation();
            onPaintHit({ face: p.face, point: e.point.clone(), object: e.object });
          }}
        />
      ))}
    </group>
  );
}

function CubieMesh({
  cubie,
  onPaint,
}: {
  cubie: Cubie;
  onPaint: (cubieId: string, face: FaceKey) => void;
}) {
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#07080b", roughness: 0.65, metalness: 0.1 }), []);

  // Slightly larger sticker so the "black border" is easier to hit,
  // but keep a thin plastic rim for realism.
  const stickerGeom = useMemo(() => new THREE.PlaneGeometry(0.94, 0.94), []);
  const cubeGeom = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  const stickerMats = useMemo(() => {
    const mk = (col: RubikColorKey | undefined) => {
      const c = col ? COLOR_HEX[col] : "#05060a";
      const emissive = col && col !== "K" ? c : "#000000";
      return new THREE.MeshStandardMaterial({
        color: c,
        emissive,
        emissiveIntensity: col && col !== "K" ? 0.12 : 0,
        roughness: 0.45,
        metalness: 0.08,
      });
    };
    return {
      empty: mk(undefined),
      W: mk("W"),
      Y: mk("Y"),
      R: mk("R"),
      O: mk("O"),
      G: mk("G"),
      B: mk("B"),
      K: mk("K"),
    } as const;
  }, []);

  const stickers = cubie.stickers;

  const isOuterFace = useCallback((face: FaceKey) => {
    if (face === "U") return cubie.p.y === 1;
    if (face === "D") return cubie.p.y === -1;
    if (face === "R") return cubie.p.x === 1;
    if (face === "L") return cubie.p.x === -1;
    if (face === "F") return cubie.p.z === 1;
    return cubie.p.z === -1; // B
  }, [cubie.p.x, cubie.p.y, cubie.p.z]);

  const normalToFace = useCallback((n: THREE.Vector3): FaceKey => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    if (ay >= ax && ay >= az) return n.y >= 0 ? "U" : "D";
    if (ax >= ay && ax >= az) return n.x >= 0 ? "R" : "L";
    return n.z >= 0 ? "F" : "B";
  }, []);

  const faces: Array<{ face: FaceKey; pos: [number, number, number]; rot: [number, number, number] }> = useMemo(
    () => [
      { face: "U", pos: [0, 0.505, 0], rot: [-Math.PI / 2, 0, 0] },
      { face: "D", pos: [0, -0.505, 0], rot: [Math.PI / 2, 0, 0] },
      { face: "R", pos: [0.505, 0, 0], rot: [0, -Math.PI / 2, 0] },
      { face: "L", pos: [-0.505, 0, 0], rot: [0, Math.PI / 2, 0] },
      { face: "F", pos: [0, 0, 0.505], rot: [0, 0, 0] },
      { face: "B", pos: [0, 0, -0.505], rot: [0, Math.PI, 0] },
    ],
    []
  );

  return (
    <group>
      <mesh
        geometry={cubeGeom}
        material={baseMat}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          // Let users paint even when they click the plastic border.
          e.stopPropagation();
          const n = e.face?.normal;
          if (!n) return;
          const face = normalToFace(n);
          if (!isOuterFace(face)) return;
          onPaint(cubie.id, face);
        }}
      />
      {faces.map((f) => (
        <mesh
          key={f.face}
          geometry={stickerGeom}
          material={stickers[f.face] ? stickerMats[stickers[f.face]!] : stickerMats.empty}
          position={f.pos}
          rotation={f.rot}
          onPointerDown={(e) => {
            e.stopPropagation();
            onPaint(cubie.id, f.face);
          }}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function RubiksCube3D({
  selectedColor,
  onMove,
}: {
  selectedColor: RubikColorKey;
  onMove: (move: string) => void;
}) {
  const [cubies, setCubies] = useState<Cubie[]>(() => createInitialCube());

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [4.2, 3.2, 4.5], fov: 42 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <color attach="background" args={["#000000"]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        intensity={1.15}
        position={[6, 8, 6]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight intensity={0.6} position={[-6, 2, -5]} color={"#48D1FF"} />
      <pointLight intensity={0.45} position={[3, -2, 6]} color={"#B8A9FF"} />

      <TurnAnimator cubies={cubies} setCubies={setCubies} selectedColor={selectedColor} onMove={onMove} />

      <OrbitControls
        enableDamping={false}
        rotateSpeed={0.38}
        enablePan={false}
        minDistance={3.2}
        maxDistance={9}
      />
    </Canvas>
  );
}

