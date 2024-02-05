import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

const ipcRenderer = window.require("electron").ipcRenderer;


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
    const thirdMapCanvasRef = useRef(null); 

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

    const [landColor, setLandColor] = useState("#A1D68B");
    const [waterColor, setWaterColor] = useState("#66B2FF");
    const [elevationColors, setElevationColors] = useState(['#A1D68B', '#89C079', '#71AA68', '#598455', '#416042']); // Example colors
    const [waterColors, setWaterColors] = useState(['#66B2FF', '#3399FF', '#0080FF', '#0066CC', '#004C99']); // Example colors
    
    const handleDownload = () => {
        const zip = new JSZip();
        const mainCanvas = canvasRef.current;
        const heightmapCanvas = heightmapCanvasRef.current;
        const thirdMapCanvas = thirdMapCanvasRef.current;
    
        if (mainCanvas && heightmapCanvas && thirdMapCanvas) {
            zip.file('main-map.png', mainCanvas.toDataURL('image/png').split(',')[1], {base64: true});
            zip.file('heightmap.png', heightmapCanvas.toDataURL('image/png').split(',')[1], {base64: true});
            zip.file('third-map.png', thirdMapCanvas.toDataURL('image/png').split(',')[1], {base64: true});
    
            zip.generateAsync({type: 'blob'}).then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'worldgen-map.zip';
                link.click();
            });
        }
    };

    const handleNext = () => {
        const mainCanvas = canvasRef.current.toDataURL('image/png');
        const heightmapCanvas = heightmapCanvasRef.current.toDataURL('image/png');
        const thirdMapCanvas = thirdMapCanvasRef.current.toDataURL('image/png');
    
        ipcRenderer.send('save-canvas-images', {
            mainCanvas,
            heightmapCanvas,
            thirdMapCanvas,
            folderPath: './build/temp/' 
        });

    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            console.warn(`Invalid hex color: ${hex}`);
            return [0, 0, 0]; // Default to black or any other default color
        }
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ];
    };
    

    const adjustColor = (color, adjustment) => {
        return color.map((c, i) => Math.max(0, Math.min(255, c + adjustment[i])));
    };

    const generateElevationColors = (startColor) => {
        const adjustments = [[-24, -22, -18], [-24, -22, -17], [-24, -38, -19], [-24, -36, -19]];
        let colors = [startColor];
        adjustments.forEach(adj => {
            colors.push(adjustColor(colors[colors.length - 1], adj));
        });
        return colors;
    };

    const generateWaterColors = (startColor) => {
        const adjustments = [[-51, -25, 0], [-51, -25, 0], [0, -26, -51], [0, -26, -51]];
        let colors = [startColor];
        adjustments.forEach(adj => {
            colors.push(adjustColor(colors[colors.length - 1], adj));
        });
        return colors;
    };

    useEffect(() => {
        const startElevationColor = hexToRgb(landColor); 
        const startWaterColor = hexToRgb(waterColor);

        setElevationColors(generateElevationColors(startElevationColor));
        setWaterColors(generateWaterColors(startWaterColor));
    }, [landColor, waterColor]);

    // Event handlers for color pickers
    const handleLandColorChange = (event) => {
        setLandColor(event.target.value);
    };

    const handleWaterColorChange = (event) => {
        setWaterColor(event.target.value);
    };
    
    
    
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
                    [r, g, b] = waterColors[waterColorIndex];
                    
    
                    thirdMapColorValue = 50;
                } else {
                    // Land
                    let landShadeIntensity = (noiseValue - landThreshold) / (1 - landThreshold);
                    landShadeIntensity = Math.max(0, Math.min(1, landShadeIntensity));
    
                    let elevationIntensity = (noiseValue - landThreshold) / (1 - landThreshold);
                    elevationIntensity = 1 - elevationIntensity;
                    elevationIntensity = Math.max(elevationIntensity, minElevationIntensity); 
    
                    let elevationIndex = Math.floor(((noiseValue - landThreshold) / (1 - landThreshold)) * elevationColors.length * colorRangeScaling);
                    elevationIndex = Math.min(elevationIndex, elevationColors.length - 1);
                    [r, g, b] = elevationColors[elevationIndex];
                    

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
        const topLeftPixel = context.getImageData(0, 0, 1, 1).data;
        const rgbaColor = `rgba(${topLeftPixel[0]}, ${topLeftPixel[1]}, ${topLeftPixel[2]}, ${topLeftPixel[3] / 255})`;

        const mapGenDiv = document.querySelector('.map-gen');
        if (mapGenDiv) {
            mapGenDiv.style.backgroundColor = rgbaColor;
        }
        heightmapContext.putImageData(heightmapImageData, 0, 0);
        thirdMapContext.putImageData(thirdMapImageData, 0, 0);
    }, [noiseGenerator, noiseType, scale, sharpness, landThreshold, detailScale, detailIntensity, elevationLines, waterFalloff, waterIntensity, waterColor, landColor, minElevationIntensity, falloffStrength, edgesAsWater, edgeWidth, edgeHeight, colorRangeScaling, waterColorRangeScaling, landColor, waterColor]);

    return (
        <div className="map-gen">
            <div className="map-container">
                <canvas ref={canvasRef}  width="800" height="400" className="canvas-main" />
                <canvas ref={heightmapCanvasRef}  width="600" height="300" className="canvas-overlay heightmap" />
                <canvas ref={thirdMapCanvasRef}  width="600" height="300" className="canvas-overlay thirdmap" />
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
                        <label>Land: <input type="range" min="0" max="7" step="0.1" value={sharpness} onChange={(e) => setSharpness(parseFloat(e.target.value))} /></label>
                    </div>
                )}

                {activeControlSet === 'landEdges' && (
                    <div className="land-edges">
                        <label>Edges as Water: <input type="checkbox" checked={edgesAsWater} onChange={(e) => setEdgesAsWater(e.target.checked)} />
                            <br></br>
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
                        <label>Contours: <input type="checkbox" checked={elevationLines} onChange={(e) => setElevationLines(e.target.checked)} /></label>
                        <br></br>
                        <label>
                            Land Color: 
                            <input 
                                type="color" 
                                value={landColor} 
                                onChange={handleLandColorChange} 
                            />
                        </label>

                        <label>
                            Water Color: 
                            <input 
                                type="color" 
                                value={waterColor} 
                                onChange={handleWaterColorChange} 
                            />
                        </label>
                        <label>
                            Terrain Color Intensity: 
                            <input 
                                type="range" 
                                min="0.1" 
                                max="5" 
                                step="0.1" 
                                value={colorRangeScaling} 
                                onChange={(e) => setColorRangeScaling(parseFloat(e.target.value))}
                            />
                        </label>
                        <label>
                            Water Color Intensity: 
                            <input 
                                type="range" 
                                min="0.1" 
                                max="5" 
                                step="0.1" 
                                value={waterColorRangeScaling} 
                                onChange={(e) => setWaterColorRangeScaling(parseFloat(e.target.value))}
                            />
                        </label>
                    </div>
                )} 
            </div>
            <div className="map-options">
                <Link to="/tools" style={{ textDecoration: 'none' }}>
                    <button class="cancel-button" id="map-cancel">Cancel</button>
                </Link>
                <button class="create-button" id="map-download" onClick={handleDownload}>Download</button>
                <Link to="/3d-map" style={{ textDecoration: 'none' }} onClick={handleNext}>
                    <button class="create-button" id="map-next">Next</button>
                </Link>
            </div>
        </div>
    );
};

export default MapGen;