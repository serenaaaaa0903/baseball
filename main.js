/**
 * AIS Diagnostics - Main Engine
 * High-tech AI sports analytics dashboard logic.
 */

// --- Web Components ---

class MetricCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['label', 'value', 'unit', 'trend', 'inset-img'];
    }

    attributeChangedCallback() {
        this.render();
    }

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
                .card:hover { border-color: rgba(255, 255, 255, 0.1); }
                .label {
                    font-size: 0.6rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                }
                .data-row {
                    display: flex;
                    align-items: baseline;
                    gap: 0.25rem;
                }
                .value {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #fff;
                }
                .unit {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #3b82f6;
                }
                .footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: auto;
                }
                .trend {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: ${trendColor};
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .inset-img {
                    width: 40px;
                    height: 40px;
                    border-radius: 0.75rem;
                    background: #000;
                    border: 1px solid rgba(255,255,255,0.05);
                    object-fit: cover;
                }
            </style>
            <div class="card">
                <span class="label">${label}</span>
                <div class="data-row">
                    <span class="value">${value}</span>
                    <span class="unit">${unit}</span>
                </div>
                <div class="footer">
                    <span class="trend">${trendIcon} ${trend.toUpperCase()}</span>
                    ${insetImg ? `<img src="${insetImg}" class="inset-img" alt="${label} visualization">` : ''}
                </div>
            </div>
        `;
    }
}

class ScoutingGrade extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['score', 'total'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const score = this.getAttribute('score') || '--';
        const total = this.getAttribute('total') || '80';

        this.shadowRoot.innerHTML = `
            <style>
                .grade-container {
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                }
                .score {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 5rem;
                    font-weight: 900;
                    color: #fff;
                    line-height: 1;
                    text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
                }
                .total {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #64748b;
                }
            </style>
            <div class="grade-container">
                <span class="score">${score}</span>
                <span class="total">/ ${total}</span>
            </div>
        `;
    }
}

customElements.define('metric-card', MetricCard);
customElements.define('scouting-grade', ScoutingGrade);

// --- Dashboard Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const videoOverlay = document.getElementById('videoOverlay');
    const inputVideo = document.getElementById('input_video');
    const outputCanvas = document.getElementById('output_canvas');
    const ctx = outputCanvas.getContext('2d');

    // Handle Upload
    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            inputVideo.src = url;
            videoOverlay.style.opacity = '0';
            
            // Basic video playback for visualization
            inputVideo.onloadedmetadata = () => {
                outputCanvas.width = inputVideo.videoWidth;
                outputCanvas.height = inputVideo.videoHeight;
                inputVideo.play();
                drawFrame();
            };
        }
    });

    function drawFrame() {
        if (!inputVideo.paused && !inputVideo.ended) {
            ctx.drawImage(inputVideo, 0, 0, outputCanvas.width, outputCanvas.height);
            // Mock Skeletal Tracking Overlay
            drawMockSkeleton();
            requestAnimationFrame(drawFrame);
        }
    }

    function drawMockSkeleton() {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3b82f6';

        // Mock points
        const w = outputCanvas.width;
        const h = outputCanvas.height;
        
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.3); // Head
        ctx.lineTo(w * 0.5, h * 0.6); // Spine
        ctx.lineTo(w * 0.4, h * 0.8); // Left Leg
        ctx.moveTo(w * 0.5, h * 0.6);
        ctx.lineTo(w * 0.6, h * 0.8); // Right Leg
        ctx.moveTo(w * 0.4, h * 0.4); // Left Arm
        ctx.lineTo(w * 0.6, h * 0.4); // Right Arm
        ctx.stroke();
    }

    // Mock Report Generation
    document.getElementById('reportBtn').addEventListener('click', () => {
        alert('Generating scouting report PDF...');
    });
});
