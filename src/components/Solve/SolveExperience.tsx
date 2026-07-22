"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rotate3D, Palette, Sparkles, ChevronRight, ChevronLeft, RotateCcw, Wand2 } from "lucide-react";
import RubiksCube3D, { FaceKey, RubikColorKey } from "./RubiksCube3D";
import styles from "./SolveExperience.module.css";

const PALETTE: Array<{ key: RubikColorKey; label: string; hex: string }> = [
  { key: "W", label: "White", hex: "#ffffff" },
  { key: "Y", label: "Yellow", hex: "#ffd500" },
  { key: "R", label: "Red", hex: "#c41e3a" },
  { key: "O", label: "Orange", hex: "#ff5800" },
  { key: "G", label: "Green", hex: "#009b48" },
  { key: "B", label: "Blue", hex: "#0051ba" },
  { key: "K", label: "Erase", hex: "#101114" },
];

type SolveMove = {
  id: number;
  notation: string;
  title: string;
  hint: string;
};

const MOCK_SOLVE: SolveMove[] = [
  { id: 0, notation: "R", title: "Align the right edge", hint: "Turn the right face clockwise." },
  { id: 1, notation: "U", title: "Lift the buffer", hint: "Rotate the top layer towards you." },
  { id: 2, notation: "R'", title: "Lock the pair", hint: "Undo the right turn to restore the side." },
  { id: 3, notation: "U'", title: "Re-center top", hint: "Bring the top layer back." },
  { id: 4, notation: "F2", title: "Flip the front", hint: "Double-turn the front layer." },
  { id: 5, notation: "U", title: "Prepare last layer", hint: "Rotate the top for the next insertion." },
  { id: 6, notation: "L'", title: "Left-side insertion", hint: "Turn the left face counter-clockwise." },
  { id: 7, notation: "U", title: "Reposition edge", hint: "Adjust the top buffer position." },
  { id: 8, notation: "L", title: "Reconnect left", hint: "Return the left face to alignment." },
  { id: 9, notation: "U2", title: "Last layer alignment", hint: "Double-turn the top to line up corners." },
  { id: 10, notation: "F", title: "Final orientation", hint: "Tip the front layer once." },
  { id: 11, notation: "R", title: "Tighten right block", hint: "Lock in the final right block." },
  { id: 12, notation: "U'", title: "Last tweak", hint: "Nudge the top into place." },
  { id: 13, notation: "R'", title: "Confirm solved", hint: "Return the right face — cube solved." },
];

function notationToTurns(notation: string): Array<{ face: FaceKey; dir: 1 | -1 }> {
  const face = notation[0] as FaceKey;
  if (!face) return [];
  const suffix = notation.slice(1);
  if (suffix === "'") return [{ face, dir: -1 }];
  if (suffix === "2")
    return [
      { face, dir: 1 },
      { face, dir: 1 },
    ];
  if (suffix === "2'")
    return [
      { face, dir: -1 },
      { face, dir: -1 },
    ];
  return [{ face, dir: 1 }];
}

function invertNotation(notation: string): string {
  const face = notation[0];
  const suffix = notation.slice(1);
  if (!face) return notation;
  if (suffix === "'") return face;
  if (suffix === "2" || suffix === "2'") return face + "2";
  return face + "'";
}

export default function SolveExperience() {
  const [selected, setSelected] = useState<RubikColorKey>("W");
  const [lastMove, setLastMove] = useState<string>("—");
  const [pendingMoves, setPendingMoves] = useState(0);
  const [solveMoves, setSolveMoves] = useState<SolveMove[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const hint = useMemo(
    () => "Drag to orbit. Paint stickers to match your cube. When it matches, generate a solve path.",
    []
  );

  const hasSolve = !!solveMoves && solveMoves.length > 0;
  const totalMoves = hasSolve ? solveMoves!.length : 0;
  const currentMove = hasSolve && currentIndex >= 0 ? solveMoves![currentIndex] : null;

  const canStep = hasSolve && pendingMoves === 0;

  const enqueueTurn = useCallback(
    (face: FaceKey, dir: 1 | -1) => {
      window.dispatchEvent(new CustomEvent("cubex:cubeTurn", { detail: { face, dir } }));
      setPendingMoves((c) => c + 1);
    },
    []
  );

  const playNotation = useCallback(
    (notation: string) => {
      const turns = notationToTurns(notation);
      turns.forEach((t) => enqueueTurn(t.face, t.dir));
    },
    [enqueueTurn]
  );

  const handleGenerateSolve = () => {
    setSolveMoves(MOCK_SOLVE);
    setCurrentIndex(-1);
  };

  const handleNext = () => {
    if (!hasSolve || !canStep) return;
    if (currentIndex + 1 >= totalMoves) return;
    const nextIndex = currentIndex + 1;
    const move = solveMoves![nextIndex];
    playNotation(move.notation);
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (!hasSolve || !canStep) return;
    if (currentIndex < 0) return;
    const move = solveMoves![currentIndex];
    const inverse = invertNotation(move.notation);
    playNotation(inverse);
    setCurrentIndex((i) => i - 1);
  };

  const handleRestart = () => {
    if (!hasSolve || !canStep) return;
    for (let i = currentIndex; i >= 0; i -= 1) {
      const move = solveMoves![i];
      const inverse = invertNotation(move.notation);
      playNotation(inverse);
    }
    setCurrentIndex(-1);
  };

  const handleCubeMove = (m: string) => {
    setLastMove(m);
    setPendingMoves((c) => Math.max(0, c - 1));
  };

  return (
    <main className={styles.root}>
      <div className={styles.bg} aria-hidden="true" />

      <header className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            <Sparkles size={16} />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>CUBEX / Solve</div>
            <div className={styles.brandSub}>Recreate your scramble. Then follow each guided move in real time.</div>
          </div>
        </div>

        <div className={styles.status}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Brush</span>
            <span className={styles.statusValue}>
              <span className={styles.swatch} style={{ background: PALETTE.find((p) => p.key === selected)?.hex }} />
              {PALETTE.find((p) => p.key === selected)?.label}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Solve</span>
            {hasSolve ? (
              <span className={styles.statusValueMono}>
                Move {Math.max(0, currentIndex + 1)} / {totalMoves}
              </span>
            ) : (
              <span className={styles.statusValueMono}>Not generated</span>
            )}
          </div>
        </div>
      </header>

      <section className={styles.stage}>
        <aside className={styles.panelLeft}>
          <div className={styles.panelTitle}>
            <Palette size={16} />
            Paint
          </div>
          <div className={styles.panelBody}>
            <div className={styles.palette}>
              {PALETTE.map((p) => (
                <motion.button
                  key={p.key}
                  type="button"
                  className={styles.colorButton}
                  onClick={() => setSelected(p.key)}
                  data-active={selected === p.key ? "true" : "false"}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={styles.colorDot} style={{ background: p.hex }} aria-hidden="true" />
                  <span className={styles.colorLabel}>{p.label}</span>
                </motion.button>
              ))}
            </div>

            <div className={styles.hintBox}>
              <div className={styles.hintTitle}>
                <Rotate3D size={16} />
                Quick hint
              </div>
              <p className={styles.hintText}>{hint}</p>
            </div>
          </div>
        </aside>

        <div className={styles.canvasWrap}>
          <RubiksCube3D selectedColor={selected} onMove={handleCubeMove} />

          <AnimatePresence>
            {hasSolve && (
              <motion.div
                className={styles.solveOverlay}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.solveHeader}>
                  <span className={styles.solveTitle}>Guided solve</span>
                  <span className={styles.solveBadge}>
                    {totalMoves} moves<span className={styles.solveDot} />CFOP-inspired
                  </span>
                </div>

                <div className={styles.solveMain}>
                  <div className={styles.solveNotation}>
                    <span className={styles.solveMoveLabel}>
                      Move {Math.max(1, currentIndex + 1)} / {totalMoves}
                    </span>
                    <span className={styles.solveNotationGlyph}>{currentMove ? currentMove.notation : "—"}</span>
                  </div>
                  <div className={styles.solveCopy}>
                    <div className={styles.solveStepTitle}>
                      {currentMove ? currentMove.title : "Follow each move in order."}
                    </div>
                    <div className={styles.solveStepHint}>
                      {currentMove
                        ? currentMove.hint
                        : "When you advance, the digital cube will animate the exact face to turn."}
                    </div>
                  </div>
                </div>

                <div className={styles.solveProgressTrack}>
                  <div
                    className={styles.solveProgressBar}
                    style={{
                      width: `${hasSolve ? ((currentIndex + 1) / totalMoves) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className={styles.solveControls}>
                  <motion.button
                    type="button"
                    className={styles.solveControlButton}
                    onClick={handlePrev}
                    disabled={!canStep || currentIndex < 0}
                    whileHover={canStep && currentIndex >= 0 ? { scale: 1.03 } : {}}
                    whileTap={canStep && currentIndex >= 0 ? { scale: 0.97 } : {}}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </motion.button>
                  <motion.button
                    type="button"
                    className={styles.solveControlButtonPrimary}
                    onClick={handleNext}
                    disabled={!canStep || currentIndex + 1 >= totalMoves}
                    whileHover={canStep && currentIndex + 1 < totalMoves ? { scale: 1.04 } : {}}
                    whileTap={canStep && currentIndex + 1 < totalMoves ? { scale: 0.97 } : {}}
                  >
                    Next move
                    <ChevronRight size={16} />
                  </motion.button>
                  <motion.button
                    type="button"
                    className={styles.solveControlButtonGhost}
                    onClick={handleRestart}
                    disabled={!canStep || currentIndex < 0}
                    whileHover={canStep && currentIndex >= 0 ? { scale: 1.03 } : {}}
                    whileTap={canStep && currentIndex >= 0 ? { scale: 0.97 } : {}}
                  >
                    <RotateCcw size={16} />
                    Restart
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.lastMoveBadge}>
            <span className={styles.lastMoveLabel}>Last cube motion</span>
            <span className={styles.lastMoveValue}>{lastMove}</span>
          </div>
        </div>

        <aside className={styles.panelRight}>
          <div className={styles.panelTitle}>
            <Wand2 size={16} />
            Generate solve
          </div>
          <div className={styles.panelBody}>
            <p className={styles.solveIntro}>
              Once the digital cube matches your real one, generate a step-by-step path that you can follow in real time.
            </p>

            <div className={styles.modePills}>
              <div className={styles.modePill} data-active="true">
                <span className={styles.modeLabel}>Fastest</span>
                <span className={styles.modeSub}>Mocked optimal-like path</span>
              </div>
              <div className={styles.modePill} data-active="false">
                <span className={styles.modeLabel}>Human-style</span>
                <span className={styles.modeSub}>CFOP-inspired explanation</span>
              </div>
            </div>

            <motion.button
              type="button"
              className={styles.generateButton}
              onClick={handleGenerateSolve}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Generate Solve</span>
              <ChevronRight size={18} />
            </motion.button>

            <p className={styles.solveFootnote}>
              Solving logic is mocked for now. In production, this will be replaced with the live CUBEX engine output.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

