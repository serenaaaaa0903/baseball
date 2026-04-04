/**
 * AIS Diagnostics - Main Engine
 * High-tech AI sports analytics dashboard logic with Professional Kinematic Analysis.
 */

// --- Web Components ---
class MetricCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() { this.render(); }
    static get observedAttributes() { return ['label', 'value', 'unit', 'trend', 'inset-img']; }
    attributeChangedCallback() { this.render(); }
    render() {
        const label = this.getAttribute('label') || '--';
        const value = this.getAttribute('value') || '0';
        const unit = this.getAttribute('unit') || '';
        const trend = this.getAttribute('trend') || 'stable';
        const insetImg = this.getAttribute('inset-img') || '';
        const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b';
        const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•';
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }
                .card {
                    background: rgba(12, 17, 29, 0.6);
                    backdrop-filter: blur(30px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1.5rem;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    transition: 0.3s;
                    position: relative;
                    overflow: hidden;
                }
                .label { font-size: 0.6rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.15em; }
                .data-row { display: flex; align-items: baseline; gap: 0.25rem; }
                .value { font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 800; color: #fff; }
                .unit { font-size: 0.75rem; font-weight: 600; color: #3b82f6; }
                .footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
                .trend { font-size: 0.65rem; font-weight: 800; color: ${trendColor}; display: flex; align-items: center; gap: 0.25rem; }
                .inset-img { width: 40px; height: 40px; border-radius: 0.75rem; background: #000; border: 1px solid rgba(255,255,255,0.05); object-fit: cover; }
            </style>
            <div class="card">
                <span class="label">${label}</span>
                <div class="data-row"><span class="value">${value}</span><span class="unit">${unit}</span></div>
                <div class="footer">
                    <span class="trend">${trendIcon} ${trend.toUpperCase()}</span>
                    ${insetImg ? `<img src="${insetImg}" class="inset-img" alt="${label}">` : ''}
                </div>
            </div>
        `;
    }
}

class ScoutingGrade extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() { this.render(); }
    static get observedAttributes() { return ['score', 'total']; }
    attributeChangedCallback() { this.render(); }
    render() {
        const score = this.getAttribute('score') || '--';
        const total = this.getAttribute('total') || '80';
        this.shadowRoot.innerHTML = `
            <style>
                .grade-container { display: flex; align-items: baseline; gap: 0.5rem; }
                .score { font-family: 'Orbitron', sans-serif; font-size: 5rem; font-weight: 900; color: #fff; line-height: 1; text-shadow: 0 0 30px rgba(255, 255, 255, 0.1); }
                .total { font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 700; color: #64748b; }
            </style>
            <div class="grade-container"><span class="score">${score}</span><span class="total">/ ${total}</span></div>
        `;
    }
}

customElements.define('metric-card', MetricCard);
customElements.define('scouting-grade', ScoutingGrade);

// --- Analytics Engine ---

document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const videoOverlay = document.getElementById('videoOverlay');
    const inputVideo = document.getElementById('input_video');
    const outputCanvas = document.getElementById('output_canvas');
    const ctx = outputCanvas.getContext('2d');
    const kinematicToggle = document.getElementById('kinematicToggle');
    const kinematicStatusText = document.getElementById('kinematicStatusText');

    let sequenceChart;
    let isKinematicEnabled = true;

    const chartData = {
        labels: Array(50).fill(''),
        datasets: [
            { label: 'Pelvis', data: Array(50).fill(0), borderColor: '#00ffff', borderWidth: 3, tension: 0.4, pointRadius: 0, shadowBlur: 10, shadowColor: '#00ffff' },
            { label: 'Torso', data: Array(50).fill(0), borderColor: '#39ff14', borderWidth: 3, tension: 0.4, pointRadius: 0, shadowBlur: 10, shadowColor: '#39ff14' },
            { label: 'Arm', data: Array(50).fill(0), borderColor: '#ffcc33', borderWidth: 3, tension: 0.4, pointRadius: 0, shadowBlur: 10, shadowColor: '#ffcc33' },
            { label: 'Hand', data: Array(50).fill(0), borderColor: '#ff007f', borderWidth: 3, tension: 0.4, pointRadius: 0, shadowBlur: 10, shadowColor: '#ff007f' }
        ]
    };

    function initChart() {
        const canvas = document.getElementById('sequenceChart');
        sequenceChart = new Chart(canvas, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: { display: false },
                    y: { 
                        display: true, 
                        grid: { color: 'rgba(255,255,255,0.02)' },
                        ticks: { color: '#64748b', font: { size: 8 } },
                        min: 0, max: 100
                    }
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            },
            plugins: [{
                beforeDraw: (chart) => {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset, i) => {
                        ctx.save();
                        ctx.shadowBlur = dataset.shadowBlur;
                        ctx.shadowColor = dataset.shadowColor;
                    });
                },
                afterDraw: (chart) => { chart.ctx.restore(); }
            }]
        });
    }

    // MediaPipe Pose Setup
    const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults((results) => {
        ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        ctx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);
        
        if (results.poseLandmarks) {
            // Neon Skeleton
            drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: 'rgba(59, 130, 246, 0.4)', lineWidth: 3 });
            drawLandmarks(ctx, results.poseLandmarks, { color: '#fff', lineWidth: 1, radius: 2 });
            
            if (isKinematicEnabled) {
                analyzeKinematics(results.poseLandmarks);
            }
        }
    });

    let prevLandmarks = null;
    let peaks = [0, 0, 0, 0]; // Pelvis, Torso, Arm, Hand
    let peakTimings = [0, 0, 0, 0];
    let frameCount = 0;

    function analyzeKinematics(landmarks) {
        if (!prevLandmarks) {
            prevLandmarks = landmarks;
            return;
        }

        frameCount++;

        // 1. Pelvis (Hips)
        const pelvisVel = (Math.abs(landmarks[23].x - prevLandmarks[23].x) + Math.abs(landmarks[24].x - prevLandmarks[24].x)) * 5000;
        // 2. Torso (Shoulders)
        const torsoVel = (Math.abs(landmarks[11].x - prevLandmarks[11].x) + Math.abs(landmarks[12].x - prevLandmarks[12].x)) * 5500;
        // 3. Arm (Elbow)
        const armVel = (Math.abs(landmarks[13].x - prevLandmarks[13].x) + Math.abs(landmarks[14].x - prevLandmarks[14].x)) * 6500;
        // 4. Hand (Wrist)
        const handVel = (Math.abs(landmarks[15].x - prevLandmarks[15].x) + Math.abs(landmarks[16].x - prevLandmarks[16].x)) * 8000;

        const currentVelocities = [pelvisVel, torsoVel, armVel, handVel];

        // Track Peaks for Professional Analysis
        currentVelocities.forEach((vel, i) => {
            if (vel > peaks[i]) {
                peaks[i] = vel;
                peakTimings[i] = frameCount;
            }
        });

        updateChart(currentVelocities.map(v => Math.min(100, v)));
        generateKinematicAnalysis();

        // Update real-time metrics
        const armAng = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
        document.getElementById('metric-arm').setAttribute('value', armAng.toFixed(1));
        
        const kneeAng = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
        document.getElementById('metric-knee').setAttribute('value', kneeAng.toFixed(1));

        prevLandmarks = landmarks;
    }

    function generateKinematicAnalysis() {
        // Professional Logic: Efficient Sequence is Pelvis -> Torso -> Arm -> Hand
        const isSequenceCorrect = peakTimings[0] < peakTimings[1] && peakTimings[1] < peakTimings[2] && peakTimings[2] < peakTimings[3];
        
        if (frameCount < 30) return; // Wait for enough data

        let analysisText = "";
        if (isSequenceCorrect) {
            analysisText = "<span class='text-emerald-400 font-bold'>[EFFICIENT]</span> 하체-상체-팔-손의 에너지 전달 순서가 매우 이상적입니다. 운동 에너지가 손실 없이 배트에 전달되고 있습니다.";
        } else {
            // Find breakdown
            if (peakTimings[1] < peakTimings[0]) {
                analysisText = "<span class='text-rose-400 font-bold'>[INNEFICIENT]</span> 상체(Torso)가 하체(Pelvis)보다 먼저 반응하고 있습니다. 하체 고정력이 부족하여 비거리 손실이 예상됩니다.";
            } else if (peakTimings[3] < peakTimings[2]) {
                analysisText = "<span class='text-amber-400 font-bold'>[ADJUST]</span> 팔보다 손목의 회전이 빨라 '캐스팅' 동작이 발생하고 있습니다. 임팩트 시 정확도가 떨어질 수 있습니다.";
            } else {
                analysisText = "가속 타이밍 분석 중... 하체 중심 이동에 집중하십시오.";
            }
        }
        kinematicStatusText.innerHTML = analysisText;
    }

    function calculateAngle(a, b, c) {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    }

    function updateChart(newData) {
        chartData.datasets.forEach((dataset, i) => {
            dataset.data.shift();
            dataset.data.push(newData[i]);
        });
        sequenceChart.update('none');
    }

    // Toggle Kinematic Analysis
    kinematicToggle.addEventListener('change', (e) => {
        isKinematicEnabled = e.target.checked;
        if (!isKinematicEnabled) {
            kinematicStatusText.innerHTML = "시퀀스 분석 중지됨 (OFF)";
            chartData.datasets.forEach(d => d.data.fill(0));
            sequenceChart.update();
        } else {
            kinematicStatusText.innerHTML = "에너지 전달 시퀀스 추적 중...";
        }
    });

    // Handle Upload
    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            inputVideo.src = url;
            videoOverlay.style.opacity = '0';
            
            // Reset peaks
            peaks = [0,0,0,0];
            peakTimings = [0,0,0,0];
            frameCount = 0;

            inputVideo.onloadedmetadata = () => {
                outputCanvas.width = inputVideo.videoWidth;
                outputCanvas.height = inputVideo.videoHeight;
                inputVideo.play();
                processVideo();
            };
        }
    });

    async function processVideo() {
        if (!inputVideo.paused && !inputVideo.ended) {
            await pose.send({ image: inputVideo });
            requestAnimationFrame(processVideo);
        }
    }

    initChart();
});
