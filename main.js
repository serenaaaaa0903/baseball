/**
 * AIS Diagnostics - Main Engine
 * High-tech AI sports analytics dashboard logic with Professional Report Generation.
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
        const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•';
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }
                .card { background: rgba(12, 17, 29, 0.6); backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; transition: 0.3s; position: relative; overflow: hidden; }
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
    const reportBtn = document.getElementById('reportBtn');
    const fileInput = document.getElementById('fileInput');
    const videoOverlay = document.getElementById('videoOverlay');
    const inputVideo = document.getElementById('input_video');
    const outputCanvas = document.getElementById('output_canvas');
    const ctx = outputCanvas.getContext('2d');
    const kinematicToggle = document.getElementById('kinematicToggle');
    const kinematicStatusText = document.getElementById('kinematicStatusText');
    const verdictBox = document.getElementById('verdictBox');

    let sequenceChart;
    let isKinematicEnabled = true;
    let pose;

    const chartData = {
        labels: Array(50).fill(''),
        datasets: [
            { label: 'Pelvis', data: Array(50).fill(0), borderColor: '#00ffff', borderWidth: 3, tension: 0.4, pointRadius: 0, shadowBlur: 10, shadowColor: '#00ffff' },
            { label: 'Torso', data: Array(50).fill(0), borderColor: '#39ff14', borderWidth: 3, tension: 0.4, pointRadius: 0, shadowBlur: 10, shadowColor: '#39ff14' },
            { label: 'Arm', data: Array(50).fill(0), borderColor: '#ffcc33', borderWidth: 3, tension: 0.4, pointRadius: 0, shadowBlur: 10, shadowColor: '#ffcc33' },
            { label: 'Hand', data: Array(50).fill(0), borderColor: '#ff007f', borderWidth: 3, tension: 0.4, pointRadius: 0, shadowBlur: 10, shadowColor: '#ff007f' }
        ]
    };

    function resetDashboard() {
        chartData.datasets.forEach(d => d.data.fill(0));
        if (sequenceChart) sequenceChart.update('none');
        kinematicStatusText.innerHTML = "에너지 전달 시퀀스 대기 중...";
        verdictBox.innerHTML = "<p class='text-slate-500 italic'>영상을 분석하면 정밀 평가가 여기에 기록됩니다.</p>";
        peaks = [0, 0, 0, 0];
        peakTimings = [0, 0, 0, 0];
        frameCount = 0;
        lastAnalysisKey = "";
        analysisHistory = [];
        document.getElementById('metric-arm').setAttribute('value', '0.0');
        document.getElementById('metric-knee').setAttribute('value', '0.0');
        videoOverlay.style.opacity = '1';
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
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            },
            plugins: [{
                beforeDraw: (chart) => {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset) => { ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = dataset.borderColor; });
                },
                afterDraw: (chart) => { chart.ctx.restore(); }
            }]
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
        }
    });

    let prevLandmarks = null;
    let peaks = [0, 0, 0, 0];
    let peakTimings = [0, 0, 0, 0];
    let frameCount = 0;
    let lastAnalysisKey = "";
    let analysisHistory = [];

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

        document.getElementById('metric-arm').setAttribute('value', calculateAngle(landmarks[11], landmarks[13], landmarks[15]).toFixed(1));
        document.getElementById('metric-knee').setAttribute('value', calculateAngle(landmarks[24], landmarks[26], landmarks[28]).toFixed(1));
        prevLandmarks = landmarks;
    }

    function generateSharpAnalysis() {
        const isSequenceCorrect = peakTimings[0] < peakTimings[1] && peakTimings[1] < peakTimings[2] && peakTimings[2] < peakTimings[3];
        let currentAnalysis = "";
        let analysisKey = "";

        if (frameCount < 20) return;

        if (isSequenceCorrect) {
            analysisKey = "EFFICIENT";
            currentAnalysis = "하체에서 상체로 이어지는 에너지 전이가 매우 날카롭습니다. 회전력이 효율적으로 응집되고 있습니다.";
        } else if (peakTimings[1] < peakTimings[0]) {
            analysisKey = "EARLY_TORSO";
            currentAnalysis = "상체의 회전이 하체 리드보다 앞서고 있습니다. 'Spin-out' 현상이 감지되며, 하체 지지력이 상실되었습니다.";
        } else if (peakTimings[3] < peakTimings[2]) {
            analysisKey = "CASTING";
            currentAnalysis = "팔의 가속 전 손목이 먼저 풀리는 '캐스팅' 동작이 확인됩니다. 배트 헤드의 스피드가 임팩트 시점에 감속될 위험이 큽니다.";
        } else {
            analysisKey = "STALL";
            currentAnalysis = "에너지 전달 과정에 일시적인 정체가 발생합니다. 키네마틱 시퀀스의 유동성을 확보하십시오.";
        }

        kinematicStatusText.innerHTML = `<span class='font-bold text-blue-400'>[LIVE]</span> ${currentAnalysis}`;

        // Add to permanent verdict box if new
        if (analysisKey !== lastAnalysisKey) {
            const p = document.createElement('p');
            p.className = "mb-2 border-l-2 border-blue-500 pl-3 py-1 bg-blue-500/5 rounded-r-lg";
            p.innerHTML = `<span class='font-black text-[9px] uppercase tracking-widest text-blue-500 block mb-1'>Frame ${frameCount} Analysis</span>${currentAnalysis}`;
            if (verdictBox.firstChild && verdictBox.firstChild.classList.contains('italic')) verdictBox.innerHTML = "";
            verdictBox.prepend(p);
            lastAnalysisKey = analysisKey;
            analysisHistory.push({ frame: frameCount, text: currentAnalysis });
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

    kinematicToggle.addEventListener('change', (e) => {
        isKinematicEnabled = e.target.checked;
        if (!isKinematicEnabled) { kinematicStatusText.innerHTML = "시퀀스 분석 중지됨 (OFF)"; chartData.datasets.forEach(d => d.data.fill(0)); sequenceChart.update(); }
        else { kinematicStatusText.innerHTML = "에너지 전달 시퀀스 추적 중..."; }
    });

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

    // Professional PDF Report Generation
    reportBtn.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const dashboard = document.querySelector('main');
        
        reportBtn.innerHTML = "GENERATING...";
        reportBtn.disabled = true;

        try {
            const canvas = await html2canvas(dashboard, {
                backgroundColor: '#020408',
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.setProperties({ title: 'AIS Scouting Report', subject: 'Baseball Swing Analysis' });
            
            // Background
            pdf.setFillColor(2, 4, 8);
            pdf.rect(0, 0, pdfWidth, 297, 'F');
            
            pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
            
            // Header for PDF
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22);
            pdf.setTextColor(255, 255, 255);
            pdf.text("AIS PROFESSIONAL SCOUTING REPORT", 15, 15);
            
            pdf.setFontSize(10);
            pdf.setTextColor(100, 116, 139);
            pdf.text(`REPORT GENERATED: ${new Date().toLocaleString()}`, 15, 22);
            
            pdf.save(`AIS_Scouting_Report_${Date.now()}.pdf`);
        } catch (error) {
            console.error("Report generation failed:", error);
            alert("Report generation failed. Please try again.");
        } finally {
            reportBtn.innerHTML = "GENERATE REPORT";
            reportBtn.disabled = false;
        }
    });

    initChart();
    resetDashboard();
});
