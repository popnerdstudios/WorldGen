import React, { useRef, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

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

class WorleyNoise {
    constructor(seed, gridResolution = 10) {
        this.seed = seed;
        this.gridResolution = gridResolution;
        this.random = this.seededRandom(seed);
    }

    seededRandom(seed) {
        const mask = 0xffffffff;
        let m_w = (123456789 + seed) & mask;
        let m_z = (987654321 - seed) & mask;

        return function() {
            m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
            m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;

            let result = ((m_z << 16) + m_w) & mask;
            result /= 4294967296;
            return result + 0.5;
        };
    }

    noise(x, y, z) {
        let minDist = Infinity;
        const cellX = Math.floor(x / this.gridResolution);
        const cellY = Math.floor(y / this.gridResolution);
        const cellZ = Math.floor(z / this.gridResolution);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const seed = this.seed + cellX + dx + (cellY + dy) * 997 + (cellZ + dz) * 991;
                    const pointX = (cellX + dx) * this.gridResolution + this.random(seed) * this.gridResolution;
                    const pointY = (cellY + dy) * this.gridResolution + this.random(seed + 1) * this.gridResolution;
                    const pointZ = (cellZ + dz) * this.gridResolution + this.random(seed + 2) * this.gridResolution;
                    const dist = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2 + (z - pointZ) ** 2);
                    minDist = Math.min(minDist, dist);
                }
            }
        }

        return minDist;
    }
}


const MapGen = () => {
    const canvasRef = useRef(null);
    const heightmapCanvasRef = useRef(null); 
    const thirdMapCanvasRef = useRef(null); 
    const fourthMapCanvasRef = useRef(null); 

    const [noiseGenerator, setNoiseGenerator] = useState(new PerlinNoise(0));
    const [noiseType, setNoiseType] = useState('fractal'); 
    const [seed, setSeed] = useState(0);
    const [scale, setScale] = useState(0.01);
    const [sharpness, setSharpness] = useState(5);
    const [landThreshold] = useState(0.1);
    const [detailScale] = useState(0.05);
    const [detailIntensity, setDetailIntensity] = useState(0.25);
    const [elevationLines, setElevationLines] = useState(false);
    const [waterFalloff, setWaterFalloff] = useState(50); 
    const [waterIntensity, setWaterIntensity] = useState(500);
    const [minElevationIntensity, setMinElevationIntensity] = useState(0.9); 
    const [edgesAsWater, setEdgesAsWater] = useState(true);
    const [edgeWidth, setEdgeWidth] = useState(60); // Default width of the water edge
    const [edgeHeight, setEdgeHeight] = useState(60);
    const [falloffStrength, setFalloffStrength] = useState(0.3); // Default falloff strength
    const [colorRangeScaling, setColorRangeScaling] = useState(3); // Default value of 1
    const [waterColorRangeScaling, setWaterColorRangeScaling] = useState(1); // Default value of 1
    const [activeControlSet, setActiveControlSet] = useState('landGeneration'); // Default to 'landGeneration'
    const [fourthSeed, setFourthSeed] = useState(1); // Use a different initial seed value


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
        const fourthMapCanvas = fourthMapCanvasRef.current;
    
        const context = canvas.getContext('2d');
        const heightmapContext = heightmapCanvas.getContext('2d'); 
        const thirdMapContext = thirdMapCanvas.getContext('2d');
        const fourthMapContext = fourthMapCanvas.getContext('2d');
    
        const imageData = context.createImageData(canvas.width, canvas.height);
        const heightmapImageData = heightmapContext.createImageData(heightmapCanvas.width, heightmapCanvas.height);
        const thirdMapImageData = thirdMapContext.createImageData(thirdMapCanvas.width, thirdMapCanvas.height);
        const fourthMapImageData = fourthMapContext.createImageData(fourthMapCanvas.width, fourthMapCanvas.height);

        const fourthNoiseGenerator = new PerlinNoise(fourthSeed);

        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                let baseNoise, detailNoise;
                let isEdge = false;

                const distanceToEdge = Math.min(
                    x, y, 
                    canvas.width - x - 1, 
                    canvas.height - y - 1
                );

                if (edgesAsWater) {
                    isEdge = true;
                    
                    const distanceToHorizontalEdge = Math.min(x, canvas.width - x - 1);
                    const distanceToVerticalEdge = Math.min(y, canvas.height - y - 1);
        
                    let horizontalEdgeFalloff = distanceToHorizontalEdge < edgeWidth ? Math.pow(distanceToHorizontalEdge / edgeWidth, falloffStrength) : 1;
                    let verticalEdgeFalloff = distanceToVerticalEdge < edgeHeight ? Math.pow(distanceToVerticalEdge / edgeHeight, falloffStrength) : 1;
        
                    const edgeFalloff = Math.min(horizontalEdgeFalloff, verticalEdgeFalloff);
        
        
                    // Apply edge falloff to the noise values
                    if (noiseType === 'ridged') {
                        baseNoise = noiseGenerator.ridgedNoise(x * scale, y * scale, 0) * edgeFalloff;
                        detailNoise = noiseGenerator.ridgedNoise(x * detailScale, y * detailScale, 0) * edgeFalloff;
                    } else if (noiseType === 'warped') {
                        baseNoise = noiseGenerator.warpedNoise(x * scale, y * scale, 0) * edgeFalloff;
                        detailNoise = noiseGenerator.warpedNoise(x * detailScale, y * detailScale, 0) * edgeFalloff;
                    } else if (noiseType === 'fractal') {
                        baseNoise = noiseGenerator.fractalNoise(x * scale, y * scale, 0, 5, 2.0, 0.5) * edgeFalloff;
                        detailNoise = noiseGenerator.fractalNoise(x * detailScale, y * detailScale, 0, 5, 2.0, 0.5) * edgeFalloff;
                    } else {
                        baseNoise = noiseGenerator.noise(x * scale, y * scale, 0) * edgeFalloff;
                        detailNoise = noiseGenerator.noise(x * detailScale, y * detailScale, 0) * edgeFalloff;
                    }
                } else {
                    if (noiseType === 'ridged') {
                        baseNoise = noiseGenerator.ridgedNoise(x * scale, y * scale, 0);
                        detailNoise = noiseGenerator.ridgedNoise(x * detailScale, y * detailScale, 0);
                    } else if (noiseType === 'warped') {
                        baseNoise = noiseGenerator.warpedNoise(x * scale, y * scale, 0);
                        detailNoise = noiseGenerator.warpedNoise(x * detailScale, y * detailScale, 0);
                    } else if (noiseType === 'fractal') {
                        baseNoise = noiseGenerator.fractalNoise(x * scale, y * scale, 0, 5, 2.0, 0.5);
                        detailNoise = noiseGenerator.fractalNoise(x * detailScale, y * detailScale, 0, 5, 2.0, 0.5);
                    } else {
                        baseNoise = noiseGenerator.noise(x * scale, y * scale, 0);
                        detailNoise = noiseGenerator.noise(x * detailScale, y * detailScale, 0);
                    }
                }

                let noiseValue = baseNoise + (detailNoise * detailIntensity);
                noiseValue = Math.pow(noiseValue, sharpness);

    
                let r = 0, g = 0, b = 0;
                let thirdMapColorValue;
                if (noiseValue < landThreshold) {
                    // Water
                    let waterDepth = (landThreshold - noiseValue) / landThreshold; 
                    let waterColorIndex = Math.floor(waterDepth * waterColors.length * waterColorRangeScaling);
                    waterColorIndex = Math.min(waterColorIndex, waterColors.length - 1); 
                    [r, g, b] = hexToRgb(waterColors[waterColorIndex]);
    
                    thirdMapColorValue = 50;
                } else {
                    // Land
                    let landShadeIntensity = (noiseValue - landThreshold) / (1 - landThreshold);
                    landShadeIntensity = Math.max(0, Math.min(1, landShadeIntensity));
    
                    let elevationIntensity = (noiseValue - landThreshold) / (1 - landThreshold);
                    elevationIntensity = 1 - elevationIntensity;
                    elevationIntensity = Math.max(elevationIntensity, minElevationIntensity); 
    
                    let elevationIndex = Math.floor(
                        ((noiseValue - landThreshold) / (1 - landThreshold)) * elevationColors.length * colorRangeScaling
                    );
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

                // Use higher frequency noise for more jaggedness
                const highFrequencyScale = 0.1; // Adjust this value to control jaggedness
                const fourthMapNoiseValue = fourthNoiseGenerator.noise(x * highFrequencyScale, y * highFrequencyScale, 0);

                // Threshold to create sharp divisions
                const threshold = 0.5; // Adjust this value to control the density of the lines
                const isBorder = fourthMapNoiseValue > threshold;

                const fourthMapColorValue = isBorder ? 0 : 255; // Black for borders, white otherwise

                const fourthMapIndex = (y * fourthMapCanvas.width + x) * 4;
                fourthMapImageData.data[fourthMapIndex + 0] = fourthMapColorValue;
                fourthMapImageData.data[fourthMapIndex + 1] = fourthMapColorValue;
                fourthMapImageData.data[fourthMapIndex + 2] = fourthMapColorValue;
                fourthMapImageData.data[fourthMapIndex + 3] = 255; // Opaque
            }
        }
        context.putImageData(imageData, 0, 0);
        heightmapContext.putImageData(heightmapImageData, 0, 0);
        thirdMapContext.putImageData(thirdMapImageData, 0, 0);
        fourthMapContext.putImageData(fourthMapImageData, 0, 0);
    }, [noiseGenerator, noiseType, scale, sharpness, landThreshold, detailScale, detailIntensity, elevationLines, waterFalloff, waterIntensity, waterColor, landColor, minElevationIntensity, falloffStrength, edgesAsWater, edgeWidth, edgeHeight, colorRangeScaling, waterColorRangeScaling, fourthSeed]);
    

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
                <canvas ref={fourthMapCanvasRef} width="600" height="300" className="canvas-overlay fourthmap" />
            </div>
            <div className="control-panel">

                <ButtonGroup className="land-buttons" variant="contained" aria-label="outlined primary button group">
                    <Button onClick={() => setActiveControlSet('landGeneration')}>Terrain</Button>
                    <Button onClick={() => setActiveControlSet('landEdges')}>Edges</Button>
                    <Button onClick={() => setActiveControlSet('landColors')}>Colors</Button>
                    <Button onClick={() => setActiveControlSet('landDetails')}>Details</Button>
                </ButtonGroup>

                {activeControlSet === 'landGeneration' && (
                    <div className="land-generation">
                        <label className="noise-type">
                            Noise Type:
                            <select value={noiseType} onChange={e => setNoiseType(e.target.value)}>
                                <option value="fractal">Fractal</option>
                                <option value="normal">Simple</option>
                                <option value="ridged">Ridged</option>
                                <option value="warped">Warped</option>
                            </select>
                        </label>
                        <br></br>
                        <label>Seed: <input type="range" min="0" max="100" value={seed} onChange={(e) => setSeed(parseInt(e.target.value))} /></label>
                        <label>Scale: <input type="range" min="0.001" max="0.02" step="0.0001" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} /></label>
                        <br></br>
                        <label>Detail: <input type="range" min="0" max="0.5" step="0.01" value={detailIntensity} onChange={(e) => setDetailIntensity(parseFloat(e.target.value))} /></label>
                        <label>Elevation: <input type="range" min="0" max="7" step="0.1" value={sharpness} onChange={(e) => setSharpness(parseFloat(e.target.value))} /></label>
                    </div>
                )}

                {activeControlSet === 'landEdges' && (
                    <div className="land-edges">
                        <label>Edges as Water: <input type="checkbox" checked={edgesAsWater} onChange={(e) => setEdgesAsWater(e.target.checked)} />
                            <label>
                                Edge Width: 
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="200" 
                                    value={edgeWidth} 
                                    onChange={(e) => setEdgeWidth(parseInt(e.target.value))} 
                                />
                            </label>
                            <label>
                                Edge Height: 
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="200" 
                                    value={edgeHeight} 
                                    onChange={(e) => setEdgeHeight(parseInt(e.target.value))} 
                                />
                            </label>
                        </label>
                        <label>
                            Falloff Strength: 
                            <input 
                                type="range" 
                                min="0.1" 
                                max="5" 
                                step="0.1" 
                                value={falloffStrength} 
                                onChange={(e) => setFalloffStrength(parseFloat(e.target.value))} 
                            />
                        </label>
                    </div>
                )}

                {activeControlSet === 'landColors' && (
                    <div className="land-colors">
                        <label>
                            Color Range Scaling: 
                            <input 
                                type="range" 
                                min="0.1" 
                                max="5" 
                                step="0.1" 
                                value={colorRangeScaling} 
                                onChange={(e) => setColorRangeScaling(parseFloat(e.target.value))}
                            />
                        </label>
                        <div>Current Scaling: {colorRangeScaling}</div>
                        <label>
                            Water Color Range Scaling: 
                            <input 
                                type="range" 
                                min="0.1" 
                                max="5" 
                                step="0.1" 
                                value={waterColorRangeScaling} 
                                onChange={(e) => setWaterColorRangeScaling(parseFloat(e.target.value))}
                            />
                        </label>
                        <div>Current Water Scaling: {waterColorRangeScaling}</div>
                        <label>Contours: <input type="checkbox" checked={elevationLines} onChange={(e) => setElevationLines(e.target.checked)} /></label>
                    </div>
                )} 
                {activeControlSet === 'landDetails' && (
                    <div className="land-details">
                        <label>Fourth Seed: <input type="range" min="0" max="100" value={fourthSeed} onChange={(e) => setFourthSeed(parseInt(e.target.value))} /></label>
                    </div>
                )} 
            </div>
        </div>
    );
};

export default MapGen;