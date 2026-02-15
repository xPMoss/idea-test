import { useRef, useState, useEffect } from 'react';

interface AvatarConfig {
  skinColor: string;
  clothingColor: string;
  eyeSize: number;
  eyeY: number;
  eyeSpacing: number;
  mouthWidth: number;
  mouthY: number;
  earSize: number;
  earY: number;
  noseSize: number;
  noseType: string;
  noseY: number;
  hairStyle: string;
  hairColor: string;
}

export default function AvatarGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State för alla parametrar
  const [config, setConfig] = useState<AvatarConfig>({
    skinColor: '#ffdbac',
    clothingColor: '#3498db',
    eyeSize: 12,
    eyeY: 110,
    eyeSpacing: 40,
    mouthWidth: 50,
    mouthY: 190,
    earSize: 20,
    earY: 150,
    noseSize: 15,
    noseType: 'triangle',
    noseY: 160,
    hairStyle: 'bowl',
    hairColor: '#2c3e50',
  });

  // Rita funktionen som körs varje gång config ändras
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Rensa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 0. Rita Hals & Kropp (Ritas först så de hamnar bakom huvudet)
    // Hals
    ctx.fillStyle = config.skinColor;
    ctx.fillRect(centerX - 25, centerY + 50, 50, 100);

    // Kropp (Tröja)
    ctx.beginPath();
    ctx.ellipse(centerX, canvas.height + 60, 160, 90, 0, Math.PI, 2 * Math.PI);
    ctx.fillStyle = config.clothingColor;
    ctx.fill();

    // Hjälpfunktion för att rita cirklar
    const drawCircle = (x: number, y: number, radius: number, color: string, stroke: boolean = false) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      if (stroke) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#333';
        ctx.stroke();
      }
    };

    // 0.5. Rita Öron (Ritas före huvudet)
    drawCircle(centerX - 100, config.earY, config.earSize, config.skinColor, true);
    drawCircle(centerX + 100, config.earY, config.earSize, config.skinColor, true);

    // 0.75. Rita Hår (Bakom huvudet men framför öronen)
    ctx.fillStyle = config.hairColor;
    if (config.hairStyle === 'bowl') {
      ctx.beginPath();
      // Justera hårfästet så det alltid är ovanför ögonen, men inte för högt upp
      const hairBottom = Math.max(50, config.eyeY - config.eyeSize - 10);
      // Begränsa höjden så att den inte sticker upp för mycket (max 15px ovanför huvudet)
      const hairHeight = Math.max(0, hairBottom - (centerY - 100 - 15));
      ctx.ellipse(centerX, hairBottom, 105, hairHeight, 0, Math.PI, 0);
      ctx.fill();
    } else if (config.hairStyle === 'curly') {
      ctx.beginPath();
      // Justera topp-bullen så den inte täcker ögonen om de sitter högt, men inte för högt upp
      const topBunRadius = 40;
      const topBunY = Math.max(40, config.eyeY - config.eyeSize - 10 - topBunRadius);
      
      ctx.arc(centerX, topBunY, topBunRadius, 0, Math.PI * 2);
      ctx.arc(centerX - 50, centerY - 60, 35, 0, Math.PI * 2);
      ctx.arc(centerX + 50, centerY - 60, 35, 0, Math.PI * 2);
      ctx.arc(centerX - 80, centerY - 20, 30, 0, Math.PI * 2);
      ctx.arc(centerX + 80, centerY - 20, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. Rita Huvud
    drawCircle(centerX, centerY, 100, config.skinColor, true);

    // 2. Rita Ögon
    const eyeXOffset = config.eyeSpacing;

    // Vänster öga (Sclera/Ögonvita)
    drawCircle(centerX - eyeXOffset, config.eyeY, config.eyeSize, 'white', true);
    // Höger öga
    drawCircle(centerX + eyeXOffset, config.eyeY, config.eyeSize, 'white', true);

    // Pupiller
    const pupilSize = Math.max(2, config.eyeSize / 2.5);
    drawCircle(centerX - eyeXOffset, config.eyeY, pupilSize, 'black');
    drawCircle(centerX + eyeXOffset, config.eyeY, pupilSize, 'black');

    // 2.5. Rita Ögonbryn
    const eyebrowY = config.eyeY - (config.eyeSize + 15);
    const eyebrowWidth = config.eyeSize * 2.5;
    const eyebrowHeight = 5;
    
    ctx.fillStyle = '#4a3b2a'; // Mörkbrun färg
    ctx.fillRect(centerX - eyeXOffset - eyebrowWidth / 2, eyebrowY, eyebrowWidth, eyebrowHeight);
    ctx.fillRect(centerX + eyeXOffset - eyebrowWidth / 2, eyebrowY, eyebrowWidth, eyebrowHeight);

    // 3. Rita Näsa
    // Gör näsan mörkare än huden men inte transparent
    const darkenColor = (hex: string, percent: number) => {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };
    ctx.fillStyle = darkenColor(config.skinColor, 20);
    ctx.beginPath();

    if (config.noseType === 'round') {
      ctx.arc(centerX, config.noseY, config.noseSize, 0, Math.PI * 2);
      ctx.fill();
    } else if (config.noseType === 'square') {
      const w = config.noseSize * 1.6;
      const h = config.noseSize * 1.2;
      ctx.fillRect(centerX - w / 2, config.noseY - h / 2, w, h);
    } else {
      // Triangle (default)
      ctx.moveTo(centerX, config.noseY - config.noseSize);
      ctx.lineTo(centerX - config.noseSize, config.noseY + config.noseSize);
      ctx.lineTo(centerX + config.noseSize, config.noseY + config.noseSize);
      ctx.fill();
    }

    // 4. Rita Mun
    ctx.beginPath();
    ctx.moveTo(centerX - config.mouthWidth / 2, config.mouthY);
    ctx.quadraticCurveTo(centerX, config.mouthY + 20, centerX + config.mouthWidth / 2, config.mouthY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#5a3a2a';
    ctx.lineCap = 'round';
    ctx.stroke();

  }, [config]);

  // Hantera input-ändringar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setConfig(prev => {
      let newValue: string | number = (name === 'skinColor' || name === 'clothingColor' || name === 'noseType' || name === 'hairStyle' || name === 'hairColor') ? value : parseInt(value, 10);
      
      // Validera att näsan inte hamnar under munnen (minst 10px avstånd)
      if (name === 'noseY' && typeof newValue === 'number') {
        newValue = Math.min(newValue, prev.mouthY - 10);
      } else if (name === 'mouthY' && typeof newValue === 'number') {
        newValue = Math.max(newValue, prev.noseY + 10);
      }

      return { ...prev, [name]: newValue };
    });
  };

  // Slumpa fram nya värden
  const handleRandomize = () => {
    const skinTones = ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642', '#573719', '#ffcc99', '#3e2723'];
    const clothingColors = ['#e74c3c', '#3498db', '#9b59b6', '#2ecc71', '#f1c40f', '#34495e', '#95a5a6'];
    const hairColors = ['#2c3e50', '#8e44ad', '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#000000', '#5a3a2a'];
    const hairStyles = ['bald', 'bowl', 'curly'];
    const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const newNoseY = randomRange(140, 170);
    const newMouthY = randomRange(newNoseY + 15, 230); // Säkerställ att munnen är under näsan

    setConfig({
      skinColor: skinTones[Math.floor(Math.random() * skinTones.length)],
      clothingColor: clothingColors[Math.floor(Math.random() * clothingColors.length)],
      eyeSize: randomRange(5, 30),
      eyeY: randomRange(80, 140),
      eyeSpacing: randomRange(20, 70),
      mouthWidth: randomRange(10, 90),
      mouthY: newMouthY,
      earSize: randomRange(15, 35),
      earY: randomRange(130, 170),
      noseSize: randomRange(10, 25),
      noseType: ['triangle', 'round', 'square'][Math.floor(Math.random() * 3)],
      noseY: newNoseY,
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
    });
  };

  // Spara bild
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `avatar-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Avatar Generator</h1>
      
      <canvas ref={canvasRef} width={300} height={300} style={{ border: '2px solid #333', borderRadius: '8px', backgroundColor: 'white' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={handleRandomize} style={{ flex: 1, padding: '10px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>Slumpa</button>
          <button onClick={handleSave} style={{ flex: 1, padding: '10px', cursor: 'pointer', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px' }}>Spara</button>
        </div>
        
        <label>Hudfärg <input type="color" name="skinColor" value={config.skinColor} onChange={handleChange} style={{ float: 'right' }} /></label>
        <label>Klädfärg <input type="color" name="clothingColor" value={config.clothingColor} onChange={handleChange} style={{ float: 'right' }} /></label>
        <label>Hårfärg <input type="color" name="hairColor" value={config.hairColor} onChange={handleChange} style={{ float: 'right' }} /></label>
        <label>Frisyr
          <select name="hairStyle" value={config.hairStyle} onChange={handleChange} style={{ float: 'right', height: '25px' }}>
            <option value="bald">Flintskallig</option>
            <option value="bowl">Potta</option>
            <option value="curly">Lockig</option>
          </select>
        </label>
        <label>Öronstorlek <input type="range" name="earSize" min="15" max="35" value={config.earSize} onChange={handleChange} style={{ width: '100%' }} /></label>
        <label>Öronhöjd <input type="range" name="earY" min="130" max="170" value={config.earY} onChange={handleChange} style={{ width: '100%' }} /></label>
        
        <label>Nästyp 
          <select name="noseType" value={config.noseType} onChange={handleChange} style={{ float: 'right', height: '25px' }}>
            <option value="triangle">Triangel</option>
            <option value="round">Rund</option>
            <option value="square">Fyrkantig</option>
          </select>
        </label>
        <label>Nässtorlek <input type="range" name="noseSize" min="10" max="30" value={config.noseSize} onChange={handleChange} style={{ width: '100%' }} /></label>
        <label>Näsposition <input type="range" name="noseY" min="140" max="180" value={config.noseY} onChange={handleChange} style={{ width: '100%' }} /></label>

        <label>Ögonstorlek <input type="range" name="eyeSize" min="5" max="30" value={config.eyeSize} onChange={handleChange} style={{ width: '100%' }} /></label>
        <label>Ögonhöjd <input type="range" name="eyeY" min="80" max="140" value={config.eyeY} onChange={handleChange} style={{ width: '100%' }} /></label>
        <label>Ögonavstånd <input type="range" name="eyeSpacing" min="20" max="70" value={config.eyeSpacing} onChange={handleChange} style={{ width: '100%' }} /></label>
        <label>Munbredd <input type="range" name="mouthWidth" min="10" max="90" value={config.mouthWidth} onChange={handleChange} style={{ width: '100%' }} /></label>
        <label>Munhöjd <input type="range" name="mouthY" min="160" max="230" value={config.mouthY} onChange={handleChange} style={{ width: '100%' }} /></label>

      </div>
    </div>
  );
}