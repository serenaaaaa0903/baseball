# **AIS (AI Scouting) - Project Blueprint**

## **1. Project Overview**
AIS는 야구 선수의 투구 및 타격 폼을 AI로 분석하여 전문적인 스카우팅 리포트를 제공하는 최첨단 플랫폼입니다. 2026년형 **High-Tech AI Sports Analytics Dashboard** UI를 통해 프로 수준의 분석 경험을 제공합니다.

## **2. Design & Aesthetics**
*   **Theme:** Dark Mode, Futuristic, and Professional.
*   **Color Palette:**
    *   **Background:** Obsidian Black (#020408)
    *   **Cards/Panels:** Deep Slate (#0c111d) with Glassmorphism (30px blur, 1px borders).
    *   **Accent Colors:** Electric Blue (#3b82f6) for metrics, White for primary text.
*   **Typography:** 'Inter' for technical data, 'Orbitron' for kinetic branding and scores.
*   **Visual Effects:** Multi-layered drop shadows, subtle noise texture, ambient glow.

## **3. Layout Structure**
*   **Left Section:** Large Video Playback area with skeletal motion tracking overlay.
*   **Right Section:** Detailed Data Panel.
    *   **Header:** "Final Scouting Grade" (e.g., 59/80).
    *   **Metrics Grid:** Cards for ARM-ANG, KNEE-DRV, TORQUE, and FOOT-FIX.
    *   **Inset Images:** Small skeletal motion tracking thumbnails within data cards.
*   **Bottom Section:** "Director's Verdict" text box with Korean commentary.
*   **Controls:** Sleek "UPLOAD VIDEO" and "GENERATE REPORT" buttons.

## **4. Current Implementation Plan**
1.  **Dashboard Simplification:** Refactor `index.html` to a clean 2-column layout.
2.  **Web Component Integration:** Create `<metric-card>` and `<scouting-grade>` components.
3.  **Refined Styling:** Apply Obsidian/Deep Slate theme and glassmorphism across all panels.
4.  **Logic Update:** Ensure the buttons and data fields are properly linked in `main.js`.
5.  **Korean Localization:** Implement the "Director's Verdict" with professional Korean scouting terminology.

---

*Last Updated: 2026-04-04*
