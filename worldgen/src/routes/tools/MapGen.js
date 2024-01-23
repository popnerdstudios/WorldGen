import React, { useRef, useEffect, useState } from 'react';

class PerlinNoise {
    constructor(seed) {
        this.seed = seed;
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    scale(n) {
        return (1 + n) / 2; // Scale to 0-1
    }

    noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.p[X] + Y;
        const AA = this.p[A] + Z;
        const AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y;
        const BA = this.p[B] + Z;
        const BB = this.p[B + 1] + Z;

        return this.scale(
            this.lerp(
                this.lerp(
                    this.lerp(this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z), u),
                    this.lerp(this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z), u),
                    v
                ),
                this.lerp(
                    this.lerp(this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1), u),
                    this.lerp(this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1), u),
                    v
                ),
                w
            )
        );
    }

    ridgedNoise(x, y, z) {
        let oldHeight = this.noise(x, y, z);
        let newHeight = Math.abs((oldHeight - 0.5) * 2);
        return newHeight;
    }

    warpedNoise(x, y, z) {
        const offsetX = 5.0;
        const offsetY = 10.0;
        const offsetZ = 15.0;

        const warpedX = x + offsetX;
        const warpedY = y + offsetY;
        const warpedZ = z + offsetZ;

        return this.noise(warpedX, warpedY, warpedZ);
    }
}


const MapGen = () => {
    const canvasRef = useRef(null);
    const [noiseGenerator, setNoiseGenerator] = useState(new PerlinNoise(0));
    const [seed, setSeed] = useState(0);
    const [scale, setScale] = useState(0.01);
    const [sharpness, setSharpness] = useState(4);
    const [landThreshold] = useState(0.1);
    const [detailScale] = useState(0.05);
    const [detailIntensity, setDetailIntensity] = useState(0.25);
    const [elevationLines, setElevationLines] = useState(false);
    const [waterFalloff, setWaterFalloff] = useState(50); 
    const [waterIntensity, setWaterIntensity] = useState(500);
    const [minElevationIntensity, setMinElevationIntensity] = useState(0.9); 


    const [landColor, setLandColor] = useState("#24c224");
    const [waterColor, setWaterColor] = useState("#0062ff");
    const elevationColors = ['#A1D68B', '#89C079', '#71AA68', '#598455', '#416042']; // Example colors

    useEffect(() => {
        setNoiseGenerator(new PerlinNoise(seed));
    }, [seed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(canvas.width, canvas.height);
    
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                let baseNoise = noiseGenerator.noise(x * scale, y * scale, 0);
                let detailNoise = noiseGenerator.noise(x * detailScale, y * detailScale, 0);
                let noiseValue = baseNoise + (detailNoise * detailIntensity);
                noiseValue = Math.pow(noiseValue, sharpness);
    
                let r = 0, g = 0, b = 0;
                if (noiseValue < landThreshold) {
                    let closenessToLand = (landThreshold - noiseValue) / (landThreshold - 0); 
                    let waterShadeIntensity = 1 - Math.min(1, closenessToLand * waterFalloff / 255);
    
                    [r, g, b] = hexToRgb(waterColor).map(value => Math.floor(value * waterShadeIntensity));
                } else {
                    let landShadeIntensity = (noiseValue - landThreshold) / (1 - landThreshold);
                    landShadeIntensity = Math.max(0, Math.min(1, landShadeIntensity));

                    let elevationIntensity = (noiseValue - landThreshold) / (1 - landThreshold);
                    elevationIntensity = 1 - elevationIntensity;
                    elevationIntensity = Math.max(elevationIntensity, minElevationIntensity); 

                    let elevationIndex = Math.floor(((noiseValue - landThreshold) / (1 - landThreshold)) * elevationColors.length);
                    elevationIndex = Math.min(elevationIndex, elevationColors.length - 1); // Ensure index is within the array bounds
                    [r, g, b] = hexToRgb(elevationColors[elevationIndex]);
    
                    if (elevationLines && Math.abs(noiseValue % 0.1) < 0.01) {
                        r = g = b = 255; // Elevation lines
                    }
                }
    
                const index = (y * canvas.width + x) * 4;
                imageData.data[index + 0] = r;
                imageData.data[index + 1] = g;
                imageData.data[index + 2] = b;
                imageData.data[index + 3] = 255;
            }
        }
        context.putImageData(imageData, 0, 0);
    }, [noiseGenerator, scale, sharpness, landThreshold, detailScale, detailIntensity, elevationLines, waterFalloff, waterIntensity, waterColor, landColor, minElevationIntensity]);
    

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    };

    return (
        <div>
            <canvas ref={canvasRef} width={600} height={300} />
            <div>
                <label>Land Color: 
                    <input type="color" value={landColor} onChange={(e) => setLandColor(e.target.value)} />
                </label>
                <label>Water Color: 
                    <input type="color" value={waterColor} onChange={(e) => setWaterColor(e.target.value)} />
                </label>
                <label>Seed: <input type="range" min="0" max="100" value={seed} onChange={(e) => setSeed(parseInt(e.target.value))} /></label>
                <label>Scale: <input type="range" min="0.001" max="0.02" step="0.0001" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} /></label>
                <label>Landmass: <input type="range" min="1" max="7" step="0.1" value={sharpness} onChange={(e) => setSharpness(parseFloat(e.target.value))} /></label>
                <label>Detail: <input type="range" min="0" max="0.5" step="0.01" value={detailIntensity} onChange={(e) => setDetailIntensity(parseFloat(e.target.value))} /></label>
               <label>Water Depth: <input type="range" min="0" max="200" step="50" value={waterFalloff} onChange={(e) => setWaterFalloff(parseInt(e.target.value))} /></label>
               <label>Elevation Intensity: <input type="range" min="0.5" max="1" step="0.01" value={minElevationIntensity} onChange={(e) => setMinElevationIntensity(parseFloat(e.target.value))} /></label>
               <label>Elevation Lines: <input type="checkbox" checked={elevationLines} onChange={(e) => setElevationLines(e.target.checked)} /></label>
            </div>
        </div>
    );
};

export default MapGen;