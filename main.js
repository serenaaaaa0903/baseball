/**
 * AIS Diagnostics - Main Engine
 * High-tech AI sports analytics dashboard with On-video Overlay & AI Prescription.
 */

// --- Web Components ---
class MetricCard extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
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
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }
                .card { background: rgba(12, 17, 29, 0.6); backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; transition: 0.3s; position: relative; overflow: hidden; }
                .label { font-size: 0.6rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.15em; }
                .data-row { display: flex; align-items: baseline; gap: 0.25rem; }
                .value { font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 800; color: #fff; }
                .unit { font-size: 0.75rem; font-weight: 600; color: #3b82f6; }
                .footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
                .trend { font-size: 0.65rem; font-weight: 800; color: ${trendColor}; }
                .inset-img { width: 40px; height: 40px; border-radius: 0.75rem; background: #000; border: 1px solid rgba(255,255,255,0.05); object-fit: cover; }
            </style>
            <div class="card">
                <span class="label">${label}</span>
                <div class="data-row"><span class="value">${value}</span><span class="unit">${unit}</span></div>
                <div class="footer"><span class="trend">${trend.toUpperCase()}</span>${insetImg ? `<img src="${insetImg}" class="inset-img" alt="${label}">` : ''}</div>
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
        const total = this.getAttribute('total') || '100';
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
    const reportBtn = document.getElementById('reportBtn');
    const fileInput = document.getElementById('fileInput');
    const videoOverlay = document.getElementById('videoOverlay');
    const inputVideo = document.getElementById('input_video');
    const outputCanvas = document.getElementById('output_canvas');
    const ctx = outputCanvas.getContext('2d');
    const kinematicToggle = document.getElementById('kinematicToggle');
    const kinematicStatusText = document.getElementById('kinematicStatusText');
    const verdictBox = document.getElementById('verdictBox');
    
    // Extensions
    const wellPerformedContainer = document.getElementById('wellPerformedContainer');
    const needsImprovementContainer = document.getElementById('needsImprovementContainer');
    const exerciseRec = document.getElementById('exerciseRec');
    const nutritionRec = document.getElementById('nutritionRec');
    const mainScoreEl = document.getElementById('mainScore');

    let sequenceChart;
    let isKinematicEnabled = true;
    let pose;

    const chartData = {
        labels: Array(50).fill(''),
        datasets: [
            { label: 'Pelvis', data: Array(50).fill(0), borderColor: '#00ffff', borderWidth: 3, tension: 0.4, pointRadius: 0 },
            { label: 'Torso', data: Array(50).fill(0), borderColor: '#39ff14', borderWidth: 3, tension: 0.4, pointRadius: 0 },
            { label: 'Arm', data: Array(50).fill(0), borderColor: '#ffcc33', borderWidth: 3, tension: 0.4, pointRadius: 0 },
            { label: 'Hand', data: Array(50).fill(0), borderColor: '#ff007f', borderWidth: 3, tension: 0.4, pointRadius: 0 }
        ]
    };

    function resetDashboard() {
        chartData.datasets.forEach(d => d.data.fill(0));
        if (sequenceChart) sequenceChart.update('none');
        kinematicStatusText.innerHTML = "에너지 전달 시퀀스 대기 중...";
        verdictBox.innerHTML = "<p class='text-slate-500 italic'>영상을 분석하면 정밀 평가가 여기에 기록됩니다.</p>";
        wellPerformedContainer.innerHTML = "";
        needsImprovementContainer.innerHTML = "";
        exerciseRec.innerHTML = "<p class='text-slate-500 italic'>분석 후 맞춤 운동이 추천됩니다.</p>";
        nutritionRec.innerHTML = "<p class='text-slate-500 italic'>분석 후 영양 식단이 추천됩니다.</p>";
        mainScoreEl.setAttribute('score', '0');
        
        peaks = [0, 0, 0, 0];
        peakTimings = [0, 0, 0, 0];
        frameCount = 0;
        lastAnalysisKey = "";
        highlightsCount = { well: 0, needs: 0 };
        document.getElementById('metric-arm').setAttribute('value', '0.0');
        document.getElementById('metric-knee').setAttribute('value', '0.0');
        document.getElementById('metric-torque').setAttribute('value', '0');
        document.getElementById('metric-foot').setAttribute('value', '0');
    }

    function initChart() {
        const canvas = document.getElementById('sequenceChart');
        sequenceChart = new Chart(canvas, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                scales: {
                    x: { display: false },
                    y: { display: true, grid: { color: 'rgba(255,255,255,0.02)' }, ticks: { color: '#64748b', font: { size: 8 } }, min: 0, max: 100 }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    
    pose.onResults((results) => {
        ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        ctx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);
        
        if (results.poseLandmarks) {
            drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: 'rgba(59, 130, 246, 0.4)', lineWidth: 3 });
            drawLandmarks(ctx, results.poseLandmarks, { color: '#fff', lineWidth: 1, radius: 2 });
            
            if (isKinematicEnabled) analyzeKinematics(results.poseLandmarks);
            drawOnVideoOverlay(results.poseLandmarks);
        }
    });

    let prevLandmarks = null;
    let peaks = [0, 0, 0, 0];
    let peakTimings = [0, 0, 0, 0];
    let frameCount = 0;
    let lastAnalysisKey = "";
    let highlightsCount = { well: 0, needs: 0 };

    function analyzeKinematics(landmarks) {
        if (!prevLandmarks) { prevLandmarks = landmarks; return; }
        frameCount++;
        
        const velocities = [
            (Math.abs(landmarks[23].x - prevLandmarks[23].x) + Math.abs(landmarks[24].x - prevLandmarks[24].x)) * 5000,
            (Math.abs(landmarks[11].x - prevLandmarks[11].x) + Math.abs(landmarks[12].x - prevLandmarks[12].x)) * 5500,
            (Math.abs(landmarks[13].x - prevLandmarks[13].x) + Math.abs(landmarks[14].x - prevLandmarks[14].x)) * 6500,
            (Math.abs(landmarks[15].x - prevLandmarks[15].x) + Math.abs(landmarks[16].x - prevLandmarks[16].x)) * 8000
        ];

        velocities.forEach((vel, i) => { if (vel > peaks[i]) { peaks[i] = vel; peakTimings[i] = frameCount; } });
        updateChart(velocities.map(v => Math.min(100, v)));
        
        if (frameCount % 10 === 0) generateSharpAnalysis();

        // Update real-time metrics
        const armAng = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
        const kneeAng = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
        const footStability = (1 - Math.abs(landmarks[27].x - prevLandmarks[27].x) - Math.abs(landmarks[28].x - prevLandmarks[28].x)) * 100;
        const coreTorque = Math.abs(calculateAngle(landmarks[11], landmarks[12], landmarks[24]) - calculateAngle(landmarks[12], landmarks[11], landmarks[23]));

        document.getElementById('metric-arm').setAttribute('value', armAng.toFixed(1));
        document.getElementById('metric-knee').setAttribute('value', kneeAng.toFixed(1));
        document.getElementById('metric-torque').setAttribute('value', (coreTorque * 15).toFixed(0));
        document.getElementById('metric-foot').setAttribute('value', Math.max(0, Math.min(100, footStability)).toFixed(0));

        // Update Final Score (100pt Scale)
        const score = calculateScore(armAng, kneeAng, footStability, coreTorque);
        mainScoreEl.setAttribute('score', score);

        prevLandmarks = landmarks;
    }

    function calculateScore(arm, knee, foot, torque) {
        // Ideal: Arm ~140, Knee ~90, Foot ~100, Torque high
        const armScore = Math.max(0, 25 - Math.abs(140 - arm) * 0.5);
        const kneeScore = Math.max(0, 25 - Math.abs(90 - knee) * 0.5);
        const footScore = Math.max(0, foot * 0.25);
        const torqueScore = Math.min(25, torque * 2);
        return Math.min(100, (armScore + kneeScore + footScore + torqueScore)).toFixed(0);
    }

    function drawOnVideoOverlay(landmarks) {
        const score = mainScoreEl.getAttribute('score');
        const arm = document.getElementById('metric-arm').getAttribute('value');
        const knee = document.getElementById('metric-knee').getAttribute('value');
        const torque = document.getElementById('metric-torque').getAttribute('value');
        const foot = document.getElementById('metric-foot').getAttribute('value');

        ctx.save();
        ctx.font = "bold 20px Orbitron";
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0,0,0,0.5)";

        // Score
        ctx.fillStyle = "#3b82f6";
        ctx.fillText(`SCORE: ${score}/100`, 30, 50);

        // Metrics Overlay
        ctx.font = "bold 12px Inter";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        const metrics = [
            `ARM: ${arm}°`,
            `KNEE: ${knee}°`,
            `TORQUE: ${torque} N/m`,
            `FOOT: ${foot}%`,
            `CORE: ${(torque/10).toFixed(1)}`
        ];
        
        metrics.forEach((m, i) => {
            ctx.fillText(m, 30, 80 + (i * 20));
        });
        ctx.restore();
    }

    function generateSharpAnalysis() {
        const isSequenceCorrect = peakTimings[0] < peakTimings[1] && peakTimings[1] < peakTimings[2] && peakTimings[2] < peakTimings[3];
        let analysis = "";
        let type = "";

        if (isSequenceCorrect) {
            type = "well";
            analysis = "하체 리드가 완벽하며 에너지가 손실 없이 상체로 전달됩니다.";
        } else if (peakTimings[1] < peakTimings[0]) {
            type = "needs";
            analysis = "상체가 하체보다 먼저 회전하여 힘의 손실이 발생합니다.";
        } else if (peakTimings[3] < peakTimings[2]) {
            type = "needs";
            analysis = "팔보다 손목이 먼저 풀리는 캐스팅 동작이 관찰됩니다.";
        }

        if (analysis && type !== lastAnalysisKey) {
            captureHighlight(type, analysis);
            updatePrescriptions(type);
            
            const p = document.createElement('p');
            p.className = `mb-2 border-l-2 ${type==='well'?'border-emerald-500':'border-rose-500'} pl-3 py-1 bg-white/5 rounded-r-lg`;
            p.innerHTML = `<span class='font-black text-[9px] uppercase tracking-widest block mb-1'>Frame ${frameCount}</span>${analysis}`;
            if (verdictBox.firstChild && verdictBox.firstChild.classList.contains('italic')) verdictBox.innerHTML = "";
            verdictBox.prepend(p);
            lastAnalysisKey = type;
        }
    }

    function captureHighlight(type, comment) {
        if (highlightsCount[type] >= 2) return;
        
        const container = type === 'well' ? wellPerformedContainer : needsImprovementContainer;
        if (container.querySelector('p.italic')) container.innerHTML = "";

        const capture = document.createElement('div');
        capture.className = "bg-white/5 border border-white/5 rounded-xl overflow-hidden";
        
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const cctx = canvas.getContext('2d');
        cctx.drawImage(outputCanvas, 0, 0, 160, 90);

        capture.innerHTML = `
            <img src="${canvas.toDataURL()}" class="w-full h-auto">
            <div class="p-2">
                <p class="text-[9px] text-slate-400 leading-tight">${comment}</p>
            </div>
        `;
        container.appendChild(capture);
        highlightsCount[type]++;
    }

    function updatePrescriptions(type) {
        if (type === 'well') {
            exerciseRec.innerHTML = `
                <ul class="space-y-2">
                    <li class="flex gap-2"><span>•</span> <strong>Medicine Ball Slams:</strong> 폭발적인 파워 유지</li>
                    <li class="flex gap-2"><span>•</span> <strong>Single-leg Stability:</strong> 하체 고정력 강화</li>
                </ul>
            `;
            nutritionRec.innerHTML = `
                <ul class="space-y-2">
                    <li class="flex gap-2"><span>•</span> <strong>Whey Protein:</strong> 근육 회복 및 합성</li>
                    <li class="flex gap-2"><span>•</span> <strong>Banana:</strong> 즉각적인 에너지 공급</li>
                </ul>
            `;
        } else {
            exerciseRec.innerHTML = `
                <ul class="space-y-2">
                    <li class="flex gap-2"><span>•</span> <strong>Plank Rotations:</strong> 코어 분리 능력 향상</li>
                    <li class="flex gap-2"><span>•</span> <strong>Wrist Curls:</strong> 손목 조절력 강화</li>
                </ul>
            `;
            nutritionRec.innerHTML = `
                <ul class="space-y-2">
                    <li class="flex gap-2"><span>•</span> <strong>Tart Cherry Juice:</strong> 염증 감소 및 회복</li>
                    <li class="flex gap-2"><span>•</span> <strong>BCAA:</strong> 피로도 감소 및 근손실 방지</li>
                </ul>
            `;
        }
    }

    function calculateAngle(a, b, c) {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    }

    function updateChart(newData) {
        chartData.datasets.forEach((dataset, i) => { dataset.data.shift(); dataset.data.push(newData[i]); });
        sequenceChart.update('none');
    }

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            resetDashboard();
            const url = URL.createObjectURL(file);
            inputVideo.src = url;
            videoOverlay.style.opacity = '0';
            inputVideo.onloadedmetadata = () => { outputCanvas.width = inputVideo.videoWidth; outputCanvas.height = inputVideo.videoHeight; inputVideo.play(); processVideo(); };
        }
    });

    async function processVideo() {
        if (!inputVideo.paused && !inputVideo.ended) { await pose.send({ image: inputVideo }); requestAnimationFrame(processVideo); }
    }

    reportBtn.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const dashboard = document.querySelector('body');
        reportBtn.innerHTML = "GENERATING...";
        reportBtn.disabled = true;

        try {
            const canvas = await html2canvas(dashboard, { backgroundColor: '#020408', scale: 1.5, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            pdf.save(`AIS_Full_Scouting_Report_${Date.now()}.pdf`);
        } catch (error) { console.error(error); } 
        finally { reportBtn.innerHTML = "GENERATE REPORT"; reportBtn.disabled = false; }
    });

    initChart();
    resetDashboard();
});
