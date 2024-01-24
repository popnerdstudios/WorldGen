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
        // First layer of noise to perturb the coordinates
        const warpX = this.noise(x + 1000, y, z); // Offset by 1000 to get a different noise pattern
        const warpY = this.noise(x, y + 1000, z);
        const warpZ = this.noise(x, y, z + 1000);
    
        // Scale and apply the perturbation
        const warpedX = x + warpX * 10; // 10 is a scaling factor for the warp
        const warpedY = y + warpY * 10;
        const warpedZ = z + warpZ * 10;
    
        // Calculate the final noise value with the warped coordinates
        return this.noise(warpedX, warpedY, warpedZ);
    }

    fractalNoise(x, y, z, octaves, lacunarity, persistence) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;

            maxValue += amplitude;

            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }
    
}


const MapGen = () => {
    const canvasRef = useRef(null);
    const heightmapCanvasRef = useRef(null); 
    const thirdMapCanvasRef = useRef(null); // Ref for the third map

    const [noiseGenerator, setNoiseGenerator] = useState(new PerlinNoise(0));
    const [noiseType, setNoiseType] = useState('normal'); 
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
    const [waterColors, setWaterColors] = useState(['#66B2FF', '#3399FF', '#0080FF', '#0066CC', '#004C99']); // Example colors


    useEffect(() => {
        setNoiseGenerator(new PerlinNoise(seed));
    }, [seed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const heightmapCanvas = heightmapCanvasRef.current; 
        const thirdMapCanvas = thirdMapCanvasRef.current;
    
        const context = canvas.getContext('2d');
        const heightmapContext = heightmapCanvas.getContext('2d'); 
        const thirdMapContext = thirdMapCanvas.getContext('2d');
    
        const imageData = context.createImageData(canvas.width, canvas.height);
        const heightmapImageData = heightmapContext.createImageData(heightmapCanvas.width, heightmapCanvas.height);
        const thirdMapImageData = thirdMapContext.createImageData(thirdMapCanvas.width, thirdMapCanvas.height);
    
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                let baseNoise, detailNoise;

                if (noiseType === 'ridged') {
                    baseNoise = noiseGenerator.ridgedNoise(x * scale, y * scale, 0);
                    detailNoise = noiseGenerator.ridgedNoise(x * detailScale, y * detailScale, 0);
                } else if (noiseType === 'warped') {
                    baseNoise = noiseGenerator.warpedNoise(x * scale, y * scale, 0);
                    detailNoise = noiseGenerator.warpedNoise(x * detailScale, y * detailScale, 0);
                } else if (noiseType === 'fractal') {
                    // For fractal noise, baseNoise and detailNoise can be the same
                    // or you can apply different octaves, lacunarity, and persistence values for each
                    baseNoise = noiseGenerator.fractalNoise(x * scale, y * scale, 0, 5, 2.0, 0.5);
                    detailNoise = noiseGenerator.fractalNoise(x * detailScale, y * detailScale, 0, 5, 2.0, 0.5);
                } else {
                    // Default to normal Perlin noise
                    baseNoise = noiseGenerator.noise(x * scale, y * scale, 0);
                    detailNoise = noiseGenerator.noise(x * detailScale, y * detailScale, 0);
                }
        
                let noiseValue = baseNoise + (detailNoise * detailIntensity);
                noiseValue = Math.pow(noiseValue, sharpness);
    
                let r = 0, g = 0, b = 0;
                let thirdMapColorValue;
                if (noiseValue < landThreshold) {
                    // Water
                    let waterDepth = (landThreshold - noiseValue) / landThreshold; 
                    let waterColorIndex = Math.floor(waterDepth * waterColors.length);
                    waterColorIndex = Math.min(waterColorIndex, waterColors.length - 1); 
                    [r, g, b] = hexToRgb(waterColors[waterColorIndex]);
    
                    // Third Map - darker value for water
                    thirdMapColorValue = 50;
                } else {
                    // Land
                    let landShadeIntensity = (noiseValue - landThreshold) / (1 - landThreshold);
                    landShadeIntensity = Math.max(0, Math.min(1, landShadeIntensity));
    
                    let elevationIntensity = (noiseValue - landThreshold) / (1 - landThreshold);
                    elevationIntensity = 1 - elevationIntensity;
                    elevationIntensity = Math.max(elevationIntensity, minElevationIntensity); 
    
                    let elevationIndex = Math.floor(((noiseValue - landThreshold) / (1 - landThreshold)) * elevationColors.length);
                    elevationIndex = Math.min(elevationIndex, elevationColors.length - 1);
                    [r, g, b] = hexToRgb(elevationColors[elevationIndex]);

                    let elevationIndexForThirdMap = Math.floor(((noiseValue - landThreshold) / (1 - landThreshold)) * elevationColors.length);
                    elevationIndexForThirdMap = Math.min(elevationIndexForThirdMap, elevationColors.length - 1);
        
                    let grayscaleRange = [120, 140, 160, 180, 200]; // Example grayscale values for different elevations
                    thirdMapColorValue = grayscaleRange[elevationIndexForThirdMap];
    
                    let borderThreshold = 0.02; 
                    if (Math.abs(noiseValue - landThreshold) < borderThreshold) {
                        [r, g, b] = [242, 201, 131];
                    }
    
                    if (elevationLines && Math.abs(noiseValue % 0.1) < 0.01) {
                        r = g = b = 255; // Elevation lines
                    }
                }
    
                // Set color for main map
                const index = (y * canvas.width + x) * 4;
                imageData.data[index + 0] = r;
                imageData.data[index + 1] = g;
                imageData.data[index + 2] = b;
                imageData.data[index + 3] = 255;
    
                // Set grayscale value for heightmap
                let heightValue = Math.floor(noiseValue * 255);
                heightmapImageData.data[index + 0] = heightValue;
                heightmapImageData.data[index + 1] = heightValue;
                heightmapImageData.data[index + 2] = heightValue;
                heightmapImageData.data[index + 3] = 255; // Alpha (opaque)
    
                // Set grayscale value for the third map
                thirdMapImageData.data[index + 0] = thirdMapColorValue;
                thirdMapImageData.data[index + 1] = thirdMapColorValue;
                thirdMapImageData.data[index + 2] = thirdMapColorValue;
                thirdMapImageData.data[index + 3] = 255; // Alpha (opaque)
            }
        }
        context.putImageData(imageData, 0, 0);
        heightmapContext.putImageData(heightmapImageData, 0, 0);
        thirdMapContext.putImageData(thirdMapImageData, 0, 0);
    }, [noiseGenerator, noiseType, scale, sharpness, landThreshold, detailScale, detailIntensity, elevationLines, waterFalloff, waterIntensity, waterColor, landColor, minElevationIntensity]);
    

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    };

    return (
        <div className="map-gen">
            <div className="map-container">
                <canvas ref={canvasRef}  width="600" height="300" className="canvas-main" />
                <canvas ref={heightmapCanvasRef}  width="600" height="300" className="canvas-overlay heightmap" />
                <canvas ref={thirdMapCanvasRef}  width="600" height="300" className="canvas-overlay thirdmap" />
            </div>
            <div className="control-panel">
                <label>
                    Noise Type:
                    <select value={noiseType} onChange={e => setNoiseType(e.target.value)}>
                        <option value="normal">Normal</option>
                        <option value="ridged">Ridged</option>
                        <option value="warped">Warped</option>
                        <option value="fractal">Fractal</option>
                    </select>
                </label>
                <label>Contours: <input type="checkbox" checked={elevationLines} onChange={(e) => setElevationLines(e.target.checked)} /></label>
                <br></br>
                <label>Seed: <input type="range" min="0" max="100" value={seed} onChange={(e) => setSeed(parseInt(e.target.value))} /></label>
                <label>Scale: <input type="range" min="0.001" max="0.02" step="0.0001" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} /></label>
                <br></br>
                <label>Detail: <input type="range" min="0" max="0.5" step="0.01" value={detailIntensity} onChange={(e) => setDetailIntensity(parseFloat(e.target.value))} /></label>
                <label>Elevation: <input type="range" min="0" max="7" step="0.1" value={sharpness} onChange={(e) => setSharpness(parseFloat(e.target.value))} /></label>
            </div>
        </div>
    );
};

export default MapGen;