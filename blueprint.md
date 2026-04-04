# **AIS (AI Scouting) - Project Blueprint**

## **1. Project Overview**
AIS는 야구 선수의 투구 및 타격 폼을 AI로 분석하여 전문적인 스카우팅 리포트를 제공하는 최첨단 플랫폼입니다. 기존의 'Baseball Self-Diagnosis'를 기반으로 하며, 2026년 최신 웹 트렌드인 'AI-Native Design'을 적용하여 사용자에게 혁신적인 경험을 제공합니다.

## **2. Design & Aesthetics**
*   **Theme:** Modern Adaptive Dark Mode (True Black + Slate + Electric Blue).
*   **Layout:** Responsive Bento Grid for feature showcasing and analytics.
*   **Visual Effects:** Glassmorphism, subtle noise textures, and layered drop shadows for depth.
*   **Typography:** Expressive 'Inter' font with kinetic 'Orbitron' accents for a futuristic feel.
*   **Iconography:** High-contrast interactive icons with "glow" effects on hover.

## **3. Key Features**
*   **Real-time AI Motion Analysis:** Using MediaPipe for skeletal tracking and pose estimation.
*   **Tiered Access System:**
    *   **Basic:** Video analysis, AI feedback, **Expert Director's Commentary (Non-duplicate)**, Ad-supported.
    *   **Pro:** Adds **Personalized Diet Plan**, **Pro-level Drills**, and **PDF Report Export**.
    *   **Super Pro:** Adds **Daily Performance Chart**, **Detailed Healthy Recipes**, and **Shareable Web Link**.
*   **Viral Benefits (Free Pro Pass):**
    *   **Invite Process:** Mobile number entry modal -> Link sharing -> **1-time Free Pro Pass** activation.
    *   **Usage:** Automatically applies Pro analysis features to Basic users for one session, then reverts.
*   **Ad & Social Proof:**
    *   **Review-based Ads:** Testimonials from diverse users (Age 18-50: Students, Clubs, Office workers).
*   **Payment System:** Integrated checkout for seamless tier upgrades.

## **4. Current Implementation Plan (Monetization Update)**
1.  **Tier Switcher Implementation:** A UI component to simulate/select user tiers (Basic/Pro/Super Pro).
2.  **Feature Gate Logic:** JavaScript logic to enable/disable specific Bento cards and buttons based on the active tier.
3.  **Ad Section Design:** A dedicated Bento card for advertisements, visible only to Basic users.
4.  **Advanced Analytics (Super Pro):** Integration of `Chart.js` for daily score tracking.
5.  **Recipe & Sharing Module:** Content sections for premium recipes and a mock link sharing system.

---

*Last Updated: 2026-04-04*
