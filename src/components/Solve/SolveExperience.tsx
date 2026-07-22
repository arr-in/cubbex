"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Rotate3D,
  Camera,
  Grid3x3,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Shuffle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { CubeView, PALETTE, invert } from "./Cube3DView";
import styles from "./SolveExperience.module.css";

/* ───────────────────── CONSTANTS ───────────────────── */
const SCAN_STEPS = [
  { letter: "F", face: "GREEN", hold: "WHITE on top" },
  { letter: "R", face: "RED", hold: "WHITE on top" },
  { letter: "B", face: "BLUE", hold: "WHITE on top" },
  { letter: "L", face: "ORANGE", hold: "WHITE on top" },
  { letter: "U", face: "WHITE", hold: "tip cube toward you — GREEN faces the floor" },
  { letter: "D", face: "YELLOW", hold: "tip cube away — GREEN faces the ceiling" },
];

const FACE_ORDER = ["U", "R", "F", "D", "L", "B"];
const CYCLE = ["U", "R", "F", "D", "L", "B"];

const NET_ORIGIN: Record<string, [number, number]> = {
  U: [1, 4],
  L: [4, 1],
  F: [4, 4],
  R: [4, 7],
  B: [4, 10],
  D: [7, 4],
};

const DEFAULT_SOLVED =
  "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

const INVALID_HINTS: Record<string, string> = {
  pieces:
    "at least one corner or edge has an impossible color combination — find the cubie that couldn't exist on a real cube",
  twist:
    "one corner looks twisted — the three stickers around a single corner are misread",
  flip:
    "one edge looks flipped — the two stickers of an edge piece are swapped",
  parity: "two stickers appear swapped somewhere",
};

const SOLVE_TIMEOUT = 15000;

/* ───────────────────── COLOR SCIENCE ───────────────────── */
function rgb2lab([r, g, b]: [number, number, number]): [number, number, number] {
  const [x, y, z] = [r, g, b].map((v) => {
    v /= 255;
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  });
  const X = (x * 0.4124 + y * 0.3576 + z * 0.1805) / 0.95047;
  const Y = (x * 0.2126 + y * 0.7152 + z * 0.0722) / 1.0;
  const Z = (x * 0.0193 + y * 0.1192 + z * 0.9505) / 1.08883;
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const [fx, fy, fz] = [f(X), f(Y), f(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const wdist = (a: [number, number, number], b: [number, number, number]) =>
  Math.hypot((a[0] - b[0]) * 0.6, a[1] - b[1], a[2] - b[2]);

const hex = (n: number) => "#" + n.toString(16).padStart(6, "0");

/* ───────────────────── BALANCED ASSIGN ───────────────────── */
function balancedAssign(
  items: { f: string; i: number; lab: [number, number, number] }[],
  cents: [number, number, number][],
  pinned: Map<number, number>
) {
  const cap = Array(cents.length).fill(9);
  const out = Array(items.length).fill(-1);
  for (const [idx, k] of pinned) {
    out[idx] = k;
    cap[k]--;
  }
  const edges: [number, number, number][] = [];
  items.forEach((it, i) => {
    if (out[i] >= 0) return;
    cents.forEach((c, k) => edges.push([wdist(it.lab, c), i, k]));
  });
  edges.sort((a, b) => a[0] - b[0]);
  let left = items.length - pinned.size;
  for (const [, i, k] of edges) {
    if (!left) break;
    if (out[i] >= 0 || !cap[k]) continue;
    out[i] = k;
    cap[k]--;
    left--;
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function SolveExperience() {
  /* ── State ── */
  const [tab, setTab] = useState<"3d" | "scan" | "review">("3d");
  const [solverStatus, setSolverStatus] = useState<
    "warming" | "ready" | "thinking" | "error"
  >("warming");
  const [solverMsg, setSolverMsg] = useState("Initializing solver tables…");

  const [startFacelets, setStartFacelets] = useState(DEFAULT_SOLVED);
  const [letters, setLetters] = useState<Record<string, string[]>>(() => {
    const res: Record<string, string[]> = {};
    FACE_ORDER.forEach((f, fi) => {
      res[f] = DEFAULT_SOLVED.slice(fi * 9, fi * 9 + 9).split("");
    });
    return res;
  });
  const [uncertain, setUncertain] = useState<Record<string, boolean[]>>({});
  const [moves, setMoves] = useState<string[]>([]);
  const [moveIdx, setMoveIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Scanner
  const [scanIdx, setScanIdx] = useState(0);
  const [captured, setCaptured] = useState<
    Record<string, [number, number, number][]>
  >({});
  const [reviewErr, setReviewErr] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cubeRef = useRef<CubeView | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sampleCvs = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ───────────────────── WORKER RPC ───────────────────── */
  const rpc = useCallback(
    (type: string, payload?: string) =>
      new Promise<any>((res, rej) => {
        const w = workerRef.current;
        if (!w) return rej(new Error("Worker not ready"));
        const id = Math.random().toString(36).slice(2);
        const onMsg = (e: MessageEvent) => {
          if (e.data.id !== id) return;
          w.removeEventListener("message", onMsg);
          e.data.error ? rej(new Error(e.data.error)) : res(e.data.result);
        };
        w.addEventListener("message", onMsg);
        w.postMessage({ id, type, payload });
      }),
    []
  );

  const spawnWorker = useCallback(() => {
    workerRef.current?.terminate();
    const w = new Worker("/solver/worker.js");
    workerRef.current = w;
    setSolverStatus("warming");
    setSolverMsg("Generating solver tables…");
    rpc("init")
      .then(() => {
        setSolverStatus("ready");
        setSolverMsg("Solver ready");
      })
      .catch((e) => {
        setSolverStatus("error");
        setSolverMsg("Init failed: " + e.message);
      });
  }, [rpc]);

  useEffect(() => {
    spawnWorker();
    return () => {
      workerRef.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────────────────── THREE.JS INIT ───────────────────── */
  useEffect(() => {
    if (tab === "3d" && canvasRef.current && !cubeRef.current) {
      try {
        cubeRef.current = new CubeView(canvasRef.current);
        cubeRef.current.setState(startFacelets);
      } catch (e: any) {
        console.error("WebGL init error:", e);
      }
    }
    return () => {
      if (tab !== "3d" && cubeRef.current) {
        cubeRef.current.dispose();
        cubeRef.current = null;
      }
    };
  }, [tab, startFacelets]);

  /* ───────────────────── MOVE NAVIGATION ───────────────────── */
  const doNext = useCallback(async () => {
    if (busy || moveIdx >= moves.length) return;
    setBusy(true);
    const m = moves[moveIdx];
    if (cubeRef.current) await cubeRef.current.turn(m, 280 / speed);
    setMoveIdx((i) => i + 1);
    setBusy(false);
  }, [busy, moveIdx, moves, speed]);

  const doPrev = useCallback(async () => {
    if (busy || moveIdx === 0) return;
    setAutoPlay(false);
    setBusy(true);
    const prev = moves[moveIdx - 1];
    if (cubeRef.current) await cubeRef.current.turn(invert(prev), 280 / speed);
    setMoveIdx((i) => i - 1);
    setBusy(false);
  }, [busy, moveIdx, moves, speed]);

  // Auto-play loop
  useEffect(() => {
    if (!autoPlay || moveIdx >= moves.length || busy) return;
    const t = setTimeout(() => doNext(), 160);
    return () => clearTimeout(t);
  }, [autoPlay, moveIdx, moves.length, busy, doNext]);

  useEffect(() => {
    if (moveIdx >= moves.length && moves.length > 0) setAutoPlay(false);
  }, [moveIdx, moves.length]);

  const handleRestart = () => {
    if (busy) return;
    setAutoPlay(false);
    setMoveIdx(0);
    cubeRef.current?.setState(startFacelets);
  };

  /* ───────────────────── SCRAMBLE & SOLVE ───────────────────── */
  const handleScramble = async () => {
    if (busy) return;
    try {
      setSolverStatus("thinking");
      setSolverMsg("Generating scramble…");
      const facelets: string = await rpc("random");
      setStartFacelets(facelets);
      const res: Record<string, string[]> = {};
      FACE_ORDER.forEach((f, fi) => {
        res[f] = facelets.slice(fi * 9, fi * 9 + 9).split("");
      });
      setLetters(res);
      setMoves([]);
      setMoveIdx(0);
      setAutoPlay(false);
      cubeRef.current?.setState(facelets);
      setSolverStatus("ready");
      setSolverMsg("Cube scrambled");
    } catch (err: any) {
      setSolverStatus("error");
      setSolverMsg("Scramble failed: " + err.message);
    }
  };

  const handleSolve = async (faceletStr: string) => {
    setReviewErr(null);
    setSolverStatus("thinking");
    setSolverMsg("Computing optimal solution…");
    try {
      const res = await Promise.race([
        rpc("solve", faceletStr),
        new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error("timeout")), SOLVE_TIMEOUT)
        ),
      ]);
      const moveList = res.solution.split(/\s+/).filter(Boolean);
      const facelets: string = res.facelets;

      // Adopt the (possibly auto-corrected) facelets
      const newLetters: Record<string, string[]> = {};
      FACE_ORDER.forEach((f, fi) => {
        newLetters[f] = facelets.slice(fi * 9, fi * 9 + 9).split("");
      });
      setLetters(newLetters);
      setStartFacelets(facelets);
      setMoves(moveList);
      setMoveIdx(0);
      setAutoPlay(false);
      setSolverStatus("ready");
      setSolverMsg(`Solved in ${moveList.length} moves`);
      setTab("3d");

      // Give React a tick to render the canvas, then set state
      setTimeout(() => {
        if (cubeRef.current) {
          cubeRef.current.setState(facelets);
        }
      }, 60);
    } catch (err: any) {
      let msg: string;
      if (err.message === "timeout") {
        // Recover hung worker
        spawnWorker();
        msg =
          "Solver got stuck — usually a misread sticker. Check the colors (especially corners), then try again.";
      } else if (err.message.startsWith("invalid:")) {
        const why = err.message.slice(8);
        msg = `Invalid cube: ${INVALID_HINTS[why] || "a sticker is misread"}. Fix colors in the net, then retry.`;
        setSolverStatus("ready");
        setSolverMsg("Fix errors and retry");
      } else {
        msg = `Solver error: ${err.message}`;
        setSolverStatus("error");
        setSolverMsg(err.message);
      }
      setReviewErr(msg);
    }
  };

  /* ───────────────────── CAMERA SCANNER ───────────────────── */
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
        // Mirror for front cameras
        const facing = s
          .getVideoTracks()[0]
          ?.getSettings?.().facingMode;
        if (videoRef.current && facing !== "environment") {
          videoRef.current.classList.add(styles.mirror);
        }
      }
      startLive();
    } catch (e: any) {
      alert("Camera unavailable: " + e.message);
    }
  };

  const stopCamera = () => {
    stopLive();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const sampleFrame = (): [number, number, number][] => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return [];
    if (!sampleCvs.current) {
      sampleCvs.current = document.createElement("canvas");
    }
    const c = sampleCvs.current;
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return [];
    ctx.drawImage(video, 0, 0);

    const S = Math.min(c.width, c.height) * 0.62;
    const x0 = (c.width - S) / 2;
    const y0 = (c.height - S) / 2;
    const cell = S / 3;
    const patch = Math.max(8, Math.round(cell * 0.36));
    const med = (a: number[]) => {
      a.sort((x, y) => x - y);
      return a[a.length >> 1];
    };
    const out: [number, number, number][] = [];
    for (let r = 0; r < 3; r++) {
      for (let col = 0; col < 3; col++) {
        const cx = x0 + col * cell + cell / 2;
        const cy = y0 + r * cell + cell / 2;
        const d = ctx.getImageData(
          cx - patch / 2,
          cy - patch / 2,
          patch,
          patch
        ).data;
        const rs: number[] = [],
          gs: number[] = [],
          bs: number[] = [];
        for (let i = 0; i < d.length; i += 4) {
          rs.push(d[i]);
          gs.push(d[i + 1]);
          bs.push(d[i + 2]);
        }
        out.push([med(rs), med(gs), med(bs)]);
      }
    }
    return out;
  };

  const startLive = () => {
    stopLive();
    liveRef.current = setInterval(() => {
      if (!streamRef.current || !videoRef.current?.videoWidth) return;
      try {
        const s = sampleFrame();
        const cells = document.querySelectorAll<HTMLElement>(
          `.${styles.gridCell}`
        );
        cells.forEach((el, i) => {
          if (s[i]) {
            el.style.borderColor = `rgb(${s[i].map(Math.round).join(",")})`;
            el.style.borderStyle = "solid";
          }
        });
      } catch {
        /* frame not ready */
      }
    }, 250);
  };

  const stopLive = () => {
    if (liveRef.current) {
      clearInterval(liveRef.current);
      liveRef.current = null;
    }
  };

  const sampleFace = async (): Promise<[number, number, number][]> => {
    const frames: [number, number, number][][] = [];
    for (let f = 0; f < 3; f++) {
      frames.push(sampleFrame());
      if (f < 2) await new Promise((r) => setTimeout(r, 70));
    }
    return Array.from({ length: 9 }, (_, i) =>
      [0, 1, 2].map((ch) => {
        const v = [frames[0][i]?.[ch] ?? 0, frames[1][i]?.[ch] ?? 0, frames[2][i]?.[ch] ?? 0].sort(
          (a, b) => a - b
        );
        return v[1];
      }) as [number, number, number]
    );
  };

  const handleCapture = async () => {
    const sampled = await sampleFace();
    if (!sampled.length) return;
    const stepLetter = SCAN_STEPS[scanIdx].letter;
    const newCap = { ...captured, [stepLetter]: sampled };
    setCaptured(newCap);

    if (scanIdx + 1 >= 6) {
      stopCamera();
      classify(newCap);
      setTab("review");
    } else {
      setScanIdx((i) => i + 1);
    }
  };

  const classify = (cap: Record<string, [number, number, number][]>) => {
    const items: { f: string; i: number; lab: [number, number, number] }[] = [];
    SCAN_STEPS.forEach((s) => {
      if (cap[s.letter]) {
        cap[s.letter].forEach((rgb, i) =>
          items.push({ f: s.letter, i, lab: rgb2lab(rgb) })
        );
      }
    });

    const pinned = new Map<number, number>();
    items.forEach((it, idx) => {
      if (it.i === 4)
        pinned.set(
          idx,
          SCAN_STEPS.findIndex((s) => s.letter === it.f)
        );
    });

    let cents = SCAN_STEPS.map((s) => rgb2lab(cap[s.letter][4]));
    let assign: number[] = [];

    for (let iter = 0; iter < 3; iter++) {
      assign = balancedAssign(items, cents, pinned);
      cents = cents.map((c, k) => {
        const members = items.filter((_, idx) => assign[idx] === k);
        if (!members.length) return c;
        const sum = members.reduce(
          (a, it) =>
            [a[0] + it.lab[0], a[1] + it.lab[1], a[2] + it.lab[2]] as [
              number,
              number,
              number
            ],
          [0, 0, 0] as [number, number, number]
        );
        return sum.map((v) => v / members.length) as [number, number, number];
      });
    }

    const newLetters: Record<string, string[]> = {};
    const newUncertain: Record<string, boolean[]> = {};
    SCAN_STEPS.forEach((s) => {
      newLetters[s.letter] = Array(9);
      newUncertain[s.letter] = Array(9).fill(false);
    });

    items.forEach((it, idx) => {
      const k = assign[idx];
      newLetters[it.f][it.i] = SCAN_STEPS[k].letter;
      if (it.i !== 4) {
        const d1 = wdist(it.lab, cents[k]);
        let d2 = Infinity;
        cents.forEach((c, j) => {
          if (j !== k) d2 = Math.min(d2, wdist(it.lab, c));
        });
        newUncertain[it.f][it.i] = d2 - d1 < 7 || d1 > 30;
      }
    });

    setLetters(newLetters);
    setUncertain(newUncertain);
  };

  /* ───────────────────── REVIEW HELPERS ───────────────────── */
  const handleStickerClick = (face: string, idx: number) => {
    if (idx === 4) return;
    const cur = letters[face][idx];
    const next = CYCLE[(CYCLE.indexOf(cur) + 1) % 6];
    setLetters((prev) => ({
      ...prev,
      [face]: prev[face].map((v, i) => (i === idx ? next : v)),
    }));
  };

  const getFaceletString = () =>
    FACE_ORDER.map((f) => letters[f].join("")).join("");

  const colorCounts = FACE_ORDER.reduce(
    (acc, f) => {
      acc[f] = 0;
      FACE_ORDER.forEach((fk) => {
        letters[fk]?.forEach((l) => {
          if (l === f) acc[f]++;
        });
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const isNetValid = FACE_ORDER.every((f) => colorCounts[f] === 9);

  /* ═══════════════════════════════════════════════════════════ */
  /*                          RENDER                            */
  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className={styles.root}>
      {/* Ambient orbs */}
      <div className={`${styles.bgOrb} ${styles.bgOrb1}`} aria-hidden />
      <div className={`${styles.bgOrb} ${styles.bgOrb2}`} aria-hidden />
      <div className={`${styles.bgOrb} ${styles.bgOrb3}`} aria-hidden />

      {/* ── Top Bar ── */}
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <Link href="/" className={styles.backLink} aria-label="Back">
            <ArrowLeft size={14} />
            HOME
          </Link>
          <div className={styles.brandBlock}>
            <h1 className={styles.brandTitle}>
              CUBEX <span>SOLVER</span>
            </h1>
            <span className={styles.chip}>
              <span
                className={`${styles.chipDot} ${
                  solverStatus === "ready"
                    ? styles.chipReady
                    : solverStatus === "thinking" || solverStatus === "warming"
                    ? styles.chipBusy
                    : styles.chipErr
                }`}
              />
              {solverMsg}
            </span>
          </div>
        </div>

        <div className={styles.modeTabs}>
          <button
            className={`${styles.modeTab} ${tab === "3d" ? styles.modeTabActive : ""}`}
            onClick={() => setTab("3d")}
          >
            <Rotate3D size={14} />
            3D SOLVER
          </button>
          <button
            className={`${styles.modeTab} ${tab === "scan" ? styles.modeTabActive : ""}`}
            onClick={() => {
              setTab("scan");
              startCamera();
            }}
          >
            <Camera size={14} />
            AI SCANNER
          </button>
          <button
            className={`${styles.modeTab} ${tab === "review" ? styles.modeTabActive : ""}`}
            onClick={() => setTab("review")}
          >
            <Grid3x3 size={14} />
            REVIEW NET
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className={styles.contentArea}>
        {/* ═══ MODE 1: 3D SOLVER ═══ */}
        {tab === "3d" && (
          <div className={styles.solveLayout}>
            <div className={styles.cubeStage}>
              <canvas ref={canvasRef} className={styles.cubeCanvas} />

              {/* Move strip */}
              <div className={styles.moveStrip}>
                {moves.length > 0 ? (
                  <div className={styles.moveList}>
                    {moves.map((m, i) => (
                      <span
                        key={i}
                        className={`${styles.moveChip} ${
                          i < moveIdx
                            ? styles.moveChipDone
                            : i === moveIdx
                            ? styles.moveChipCur
                            : ""
                        }`}
                      >
                        {m}
                        {m.includes("2") && (
                          <small className={styles.moveDeg}>180°</small>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={styles.moveEmpty}>
                    <Sparkles size={14} />
                    Click Scramble or Scan to generate a solve path
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              {/* Telemetry */}
              <div className={styles.sideSection}>
                <div className={styles.sideSectionHead}>
                  <Zap size={16} />
                  <h3>SOLVER TELEMETRY</h3>
                </div>
                <div className={styles.statsRow}>
                  <div className={styles.statCard}>
                    <span className={styles.statVal}>
                      {moves.length
                        ? `${moveIdx} / ${moves.length}`
                        : "0 / 0"}
                    </span>
                    <span className={styles.statLbl}>MOVES EXECUTED</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statVal}>
                      {moves.length
                        ? moves[moveIdx] || "DONE"
                        : "—"}
                    </span>
                    <span className={styles.statLbl}>CURRENT MOVE</span>
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className={styles.sideSection}>
                <div className={styles.sideSectionHead}>
                  <Play size={16} />
                  <h3>PLAYBACK</h3>
                </div>
                <div className={styles.playerRow}>
                  <button
                    className={styles.ctrlBtn}
                    onClick={handleRestart}
                    disabled={!moves.length || busy}
                    title="Restart"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    className={styles.ctrlBtn}
                    onClick={doPrev}
                    disabled={moveIdx === 0 || busy}
                    title="Previous"
                  >
                    <SkipBack size={15} />
                  </button>
                  <button
                    className={`${styles.ctrlBtn} ${styles.ctrlBtnPlay}`}
                    onClick={() => setAutoPlay((a) => !a)}
                    disabled={!moves.length || moveIdx >= moves.length}
                    title={autoPlay ? "Pause" : "Play"}
                  >
                    {autoPlay ? <Pause size={17} /> : <Play size={17} />}
                  </button>
                  <button
                    className={styles.ctrlBtn}
                    onClick={doNext}
                    disabled={
                      !moves.length || moveIdx >= moves.length || busy
                    }
                    title="Next"
                  >
                    <SkipForward size={15} />
                  </button>
                </div>

                <div className={styles.speedRow}>
                  <span className={styles.speedLbl}>SPEED</span>
                  {[0.5, 1, 2].map((s) => (
                    <button
                      key={s}
                      className={`${styles.speedBtn} ${speed === s ? styles.speedBtnOn : ""}`}
                      onClick={() => setSpeed(s)}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className={styles.sideSection}>
                <div className={styles.actions}>
                  <button
                    className={`${styles.btnMain} ${styles.btnScramble}`}
                    onClick={handleScramble}
                    disabled={busy}
                  >
                    <Shuffle size={15} />
                    RANDOM SCRAMBLE
                  </button>
                  <button
                    className={`${styles.btnMain} ${styles.btnSolve}`}
                    onClick={() => handleSolve(getFaceletString())}
                    disabled={busy}
                  >
                    <Sparkles size={15} />
                    SOLVE CUBE
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ═══ MODE 2: AI CAMERA SCANNER ═══ */}
        {tab === "scan" && (
          <div className={styles.scanLayout}>
            <div className={styles.camBox}>
              <video
                ref={videoRef}
                className={styles.camVideo}
                autoPlay
                playsInline
                muted
              />
              <div className={styles.gridOverlay}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={styles.gridCell} />
                ))}
              </div>
              <div className={styles.scanHud}>
                <span className={styles.scanStep}>
                  STEP {scanIdx + 1} OF 6
                </span>
                <p className={styles.scanInstr}>
                  Show <b>{SCAN_STEPS[scanIdx].face}</b> center ·{" "}
                  {SCAN_STEPS[scanIdx].hold}
                </p>
              </div>
            </div>

            {/* Thumbnails */}
            <div className={styles.thumbRow}>
              {SCAN_STEPS.slice(0, scanIdx).map((s) => (
                <div key={s.letter} className={styles.thumb}>
                  {captured[s.letter]?.map((rgb, i) => (
                    <i
                      key={i}
                      style={{
                        background: `rgb(${rgb.map(Math.round).join(",")})`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className={styles.scanBtns}>
              <button
                className={`${styles.btnMain} ${styles.btnScramble}`}
                onClick={() => {
                  if (scanIdx > 0) setScanIdx((i) => i - 1);
                }}
                disabled={scanIdx === 0}
              >
                RETAKE PREV
              </button>
              <button
                className={`${styles.btnMain} ${styles.btnSolve}`}
                onClick={handleCapture}
              >
                <Camera size={16} />
                CAPTURE ({SCAN_STEPS[scanIdx].letter})
              </button>
              <button
                className={`${styles.btnMain} ${styles.btnScramble}`}
                onClick={() => {
                  stopCamera();
                  setTab("3d");
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* ═══ MODE 3: REVIEW NET ═══ */}
        {tab === "review" && (
          <div className={styles.reviewLayout}>
            <div className={styles.reviewHead}>
              <h2>CUBE NET CONFIGURATION</h2>
              <p>
                Tap any sticker to cycle its color. Amber-ringed stickers
                were low-confidence — check those first. Centers are locked.
              </p>
            </div>

            {reviewErr && (
              <div className={styles.errMsg}>
                <AlertTriangle size={16} />
                <span>{reviewErr}</span>
              </div>
            )}

            <div className={styles.cubeNet}>
              {FACE_ORDER.map((f) => {
                const [gr, gc] = NET_ORIGIN[f];
                return letters[f]?.map((l, i) => {
                  const r = (i / 3) | 0;
                  const c = i % 3;
                  const isCenter = i === 4;
                  const colorHex = hex(PALETTE[l] ?? 0x14171e);
                  const isWarn = uncertain[f]?.[i];
                  return (
                    <button
                      key={`${f}-${i}`}
                      className={`${styles.netBtn} ${isWarn ? styles.netWarn : ""}`}
                      style={{
                        gridRow: gr + r,
                        gridColumn: gc + c,
                        background: colorHex,
                      }}
                      onClick={() => handleStickerClick(f, i)}
                      disabled={isCenter}
                      title={`${f} sticker ${i + 1}`}
                    />
                  );
                });
              })}
            </div>

            <div className={styles.countsBar}>
              {FACE_ORDER.map((f) => {
                const cnt = colorCounts[f] || 0;
                const ok = cnt === 9;
                return (
                  <div
                    key={f}
                    className={`${styles.countItem} ${ok ? styles.countOk : styles.countBad}`}
                  >
                    <span
                      className={styles.countDot}
                      style={{ background: hex(PALETTE[f] ?? 0x14171e) }}
                    />
                    {f}: {cnt}/9
                  </div>
                );
              })}
            </div>

            <div className={styles.reviewBtns}>
              <button
                className={`${styles.btnMain} ${styles.btnSolve}`}
                onClick={() => handleSolve(getFaceletString())}
                disabled={!isNetValid}
              >
                <CheckCircle2 size={16} />
                SOLVE THIS CUBE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
