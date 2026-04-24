# Gamified Apple Fitness UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize the Mime Flow UI into a premium, gamified Apple Fitness+ experience utilizing a Burn Bar, Flow State color shifts, and a comprehensive Analytics Dashboard.

**Architecture:** We will leverage the Stitch MCP server to rapidly prototype and generate discrete frontend components: a `BurnBar`, a `FlowStateOverlay`, and an `AnalyticsDashboard`. These components will be injected into the existing Vite React architecture, subscribing to the `Game.tsx` similarity context to trigger CSS-based aesthetic shifts without interrupting the 60fps tracking pipeline.

**Tech Stack:** React, Styled Components, Stitch MCP, IndexedDB

---

### Task 1: Generate and Implement Stitch Burn Bar Component

**Files:**
- Create: `src/app/components/ui/BurnBar.tsx`

**Step 1: Create the Component Skeleton**
```tsx
import styled from "styled-components";
export const BurnBar = ({ momentum }: { momentum: number }) => {
  return (
    <Container>
      <Fill $momentum={momentum} />
    </Container>
  );
};
```

**Step 2: Implement Glassmorphic CSS Logic**
Implement absolute positioning, smooth transitions, and a glow effect based on high momentum.

**Step 3: Commit**
```bash
git add src/app/components/ui/BurnBar.tsx
git commit -m "feat: implement glassmorphic BurnBar component"
```

---

### Task 2: Inject Burn Bar and Flow State into Tracking Window

**Files:**
- Modify: `src/app/components/tracking/YoutubePoseTracking.tsx`

**Step 1: Hook into Context and Thresholds**
Read `score` and `similarity` from `useGameViews()`. Maintain a local state `momentum` that increments when `similarity` > 0.8 and decrements otherwise.

**Step 2: Implement the Flow State Aesthetic Switch**
```tsx
const isFlowState = momentum > 90;
<Overlay style={{ background: isFlowState ? 'rgba(255,100,0,0.3)' : 'rgba(0,0,0,0.7)' }}>
  <BurnBar momentum={momentum} />
...
```

**Step 3: Test Visual Overlay**
Ensure running the `npm run dev` server shows the Burn Bar filling properly. 

**Step 4: Commit**
```bash
git add src/app/components/tracking/YoutubePoseTracking.tsx
git commit -m "feat: integrate dynamic Flow State momentum tracker"
```

---

### Task 3: Generate and Build the Post-Game Analytics Dashboard

**Files:**
- Create: `src/app/components/score/AnalyticsDashboard.tsx`
- Modify: `src/app/components/score/ResultScreen.tsx`

**Step 1: Create the Analytics Component**
Construct a sleek modular UI showing "Final Score", "Max Streak", and a styled line graph mapping the `history` array from the Game context.

**Step 2: Integrate into ResultScreen**
Replace the basic `ResultScreen.tsx` layout with the new robust dashboard.

**Step 3: Commit**
```bash
git add src/app/components/score/*
git commit -m "feat: add premium Post-Game Analytics dashboard"
```

---

### Task 4: Completely Overhaul the README.md

**Files:**
- Modify: `README.md`

**Step 1: Delete Stale Mathematical References**
Remove all mentions of "Sigmoid Transformations", "5-Dimensional Vectors", and "Pixel Resizing". 

**Step 2: Document New Engine and Mechanics**
Write engaging copy emphasizing the new "Unit Bone Vectors", "Key Joint Weighting", the "Flow State Burn Bar", and the Apple Fitness+ inspired UI flow. 

**Step 3: Commit**
```bash
git add README.md
git commit -m "docs: overhaul README with new algorithms and gamification details"
```
