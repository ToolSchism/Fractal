import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Minus, Plus, Sparkles, Zap, Shield, Rocket } from 'lucide-react';

const FractalGame = () => {
  // Game state
  const [tokens, setTokens] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [skillPoints, setSkillPoints] = useState(0);
  const [fractalLevel, setFractalLevel] = useState(1);
  const [prestige, setPrestige] = useState(1);
  const [autoExpand, setAutoExpand] = useState(false);

  // Upgrade states
  const [upgrades, setUpgrades] = useState({
    tokenGeneration: 0,
    fractalComplexity: 0,
    prestigeMultiplier: 0,
    autoExpandEfficiency: 0,
    renderQuality: 0
  });

  // Rendering optimization
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Calculation functions
  const tokenRate = useMemo(() => {
    // Base rate with upgrade multiplier
    const baseRate = 10 * Math.pow(fractalLevel, 1.2) * prestige;
    const upgradeMultiplier = 1 + (upgrades.tokenGeneration * 0.2);
    return Math.floor(baseRate * upgradeMultiplier);
  }, [fractalLevel, prestige, upgrades.tokenGeneration]);

  const upgradeCost = useMemo(() => {
    // Exponential upgrade cost with complexity reduction from upgrades
    const baseCost = 10 * Math.pow(1.5, fractalLevel);
    const complexityReduction = 1 - (upgrades.fractalComplexity * 0.1);
    return Math.floor(baseCost * complexityReduction);
  }, [fractalLevel, upgrades.fractalComplexity]);

  const prestigeCost = useMemo(() => {
    // Prestige becomes available after reaching a high fractal level
    const basePrestigeCost = Math.floor(100 * Math.pow(fractalLevel, 2));
    const prestigeMultiplier = 1 - (upgrades.prestigeMultiplier * 0.05);
    return Math.floor(basePrestigeCost * prestigeMultiplier);
  }, [fractalLevel, upgrades.prestigeMultiplier]);

  // XP and Leveling System
  useEffect(() => {
    // Simple XP calculation based on tokens and fractal level
    const xpGain = Math.floor(tokenRate / 10);
    const nextLevelXp = level * 100;

    if (xp + xpGain >= nextLevelXp) {
      setLevel(prev => prev + 1);
      setSkillPoints(prev => prev + 1);
      setXp(0);
    } else {
      setXp(prev => prev + xpGain);
    }
  }, [tokenRate, level]);

  // Fractal rendering function
  const drawFractal = useCallback((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'white';
    
    // Adjust line width based on render quality upgrade
    ctx.lineWidth = 1 + (upgrades.renderQuality * 0.5);

    const drawKochSnowflake = (x1, y1, x2, y2, depth) => {
      if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
      }

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / dist;
      const unitY = dy / dist;

      // Calculate third point for equilateral triangle
      const thirdX = x1 + dx / 2 + Math.sqrt(3) / 2 * (unitY * dist / 3);
      const thirdY = y1 + dy / 2 - Math.sqrt(3) / 2 * (unitX * dist / 3);

      drawKochSnowflake(x1, y1, x1 + dx / 3, y1 + dy / 3, depth - 1);
      drawKochSnowflake(x1 + dx / 3, y1 + dy / 3, thirdX, thirdY, depth - 1);
      drawKochSnowflake(thirdX, thirdY, x1 + 2 * dx / 3, y1 + 2 * dy / 3, depth - 1);
      drawKochSnowflake(x1 + 2 * dx / 3, y1 + 2 * dy / 3, x2, y2, depth - 1);
    };

    // Center the fractal
    const size = 400 * Math.sqrt(fractalLevel);
    const centerX = width / 2;
    const centerY = height / 2;

    // Cap complexity, but allow more complexity with render quality upgrade
    const maxDepth = Math.min(fractalLevel, 6 + upgrades.renderQuality);

    // Draw Koch snowflake
    drawKochSnowflake(
      centerX - size / 2, 
      centerY + size / (2 * Math.sqrt(3)), 
      centerX + size / 2, 
      centerY + size / (2 * Math.sqrt(3)), 
      maxDepth
    );
  }, [fractalLevel, upgrades.renderQuality]);

  // Game loop for token generation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!ctx) return;

    const gameLoop = () => {
      // Generate tokens
      setTokens(prev => prev + tokenRate / 10);

      // Render fractal
      drawFractal(ctx, canvas.width, canvas.height);

      // Auto-expand if enabled with efficiency upgrade
      const autoExpandMultiplier = 1 + (upgrades.autoExpandEfficiency * 0.2);
      if (autoExpand && tokens >= upgradeCost * autoExpandMultiplier) {
        setTokens(prev => prev - (upgradeCost * autoExpandMultiplier));
        setFractalLevel(prev => prev + 1);
      }

      // Schedule next frame
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    // Start game loop
    animationRef.current = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [tokens, tokenRate, drawFractal, autoExpand, upgradeCost, upgrades.autoExpandEfficiency]);

  // Upgrade handlers
  const handleUpgrade = (upgradeType) => {
    if (skillPoints > 0) {
      setUpgrades(prev => ({
        ...prev,
        [upgradeType]: prev[upgradeType] + 1
      }));
      setSkillPoints(prev => prev - 1);
    }
  };

  // Handlers
  const handleExpand = () => {
    if (tokens >= upgradeCost) {
      setTokens(prev => prev - upgradeCost);
      setFractalLevel(prev => prev + 1);
    }
  };

  const handlePrestige = () => {
    if (fractalLevel >= prestigeCost) {
      // Reset progress, increase multiplier
      setTokens(0);
      setFractalLevel(1);
      setXp(0);
      setLevel(1);
      setSkillPoints(0);
      setUpgrades({
        tokenGeneration: 0,
        fractalComplexity: 0,
        prestigeMultiplier: 0,
        autoExpandEfficiency: 0,
        renderQuality: 0
      });
      setPrestige(prev => prev * (1.5 + upgrades.prestigeMultiplier * 0.1));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className="w-full max-h-[60vh] aspect-video border border-white rounded-lg mb-4 mx-auto"
        />
        
        <div className="flex flex-wrap justify-center gap-2 mb-4 text-sm sm:text-base">
          <span className="bg-gray-800 p-2 rounded">Tokens: {Math.floor(tokens)}</span>
          <span className="bg-gray-800 p-2 rounded">Rate: {tokenRate}/s</span>
          <span className="bg-gray-800 p-2 rounded">Fractal Level: {fractalLevel}</span>
          <span className="bg-gray-800 p-2 rounded">Prestige: {prestige.toFixed(2)}x</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4 text-sm sm:text-base">
          <span className="bg-gray-800 p-2 rounded">XP: {Math.floor(xp)}/({level * 100})</span>
          <span className="bg-gray-800 p-2 rounded">Level: {level}</span>
          <span className="bg-gray-800 p-2 rounded">Skill Points: {skillPoints}</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button 
            onClick={handleExpand} 
            disabled={tokens < upgradeCost}
            className="bg-blue-500 p-2 rounded disabled:opacity-50 flex-grow basis-0 min-w-[150px] max-w-[250px]"
          >
            Expand Fractal (Cost: {upgradeCost})
          </button>
          
          <button 
            onClick={handlePrestige} 
            disabled={fractalLevel < prestigeCost}
            className="bg-purple-500 p-2 rounded disabled:opacity-50 flex-grow basis-0 min-w-[150px] max-w-[250px]"
          >
            Prestige (Req: Level {prestigeCost})
          </button>
          
          <button 
            onClick={() => setAutoExpand(prev => !prev)}
            className={`p-2 rounded flex-grow basis-0 min-w-[150px] max-w-[250px] ${autoExpand ? 'bg-green-500' : 'bg-gray-500'}`}
          >
            {autoExpand ? 'Auto Expand: ON' : 'Auto Expand: OFF'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
            <h3 className="flex items-center mb-2">
              <Zap className="mr-2" /> Token Generation
              <span className="ml-2 text-sm text-gray-400">
                (Level: {upgrades.tokenGeneration})
              </span>
            </h3>
            <button 
              onClick={() => handleUpgrade('tokenGeneration')}
              disabled={skillPoints === 0}
              className="bg-blue-600 p-2 rounded disabled:opacity-50 w-full"
            >
              Upgrade (+20% Token Rate)
            </button>
          </div>

          <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
            <h3 className="flex items-center mb-2">
              <Rocket className="mr-2" /> Fractal Complexity
              <span className="ml-2 text-sm text-gray-400">
                (Level: {upgrades.fractalComplexity})
              </span>
            </h3>
            <button 
              onClick={() => handleUpgrade('fractalComplexity')}
              disabled={skillPoints === 0}
              className="bg-green-600 p-2 rounded disabled:opacity-50 w-full"
            >
              Upgrade (-10% Upgrade Cost)
            </button>
          </div>

          <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
            <h3 className="flex items-center mb-2">
              <Sparkles className="mr-2" /> Prestige Multiplier
              <span className="ml-2 text-sm text-gray-400">
                (Level: {upgrades.prestigeMultiplier})
              </span>
            </h3>
            <button 
              onClick={() => handleUpgrade('prestigeMultiplier')}
              disabled={skillPoints === 0}
              className="bg-purple-600 p-2 rounded disabled:opacity-50 w-full"
            >
              Upgrade (-5% Prestige Requirement)
            </button>
          </div>

          <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
            <h3 className="flex items-center mb-2">
              <Shield className="mr-2" /> Auto Expand Efficiency
              <span className="ml-2 text-sm text-gray-400">
                (Level: {upgrades.autoExpandEfficiency})
              </span>
            </h3>
            <button 
              onClick={() => handleUpgrade('autoExpandEfficiency')}
              disabled={skillPoints === 0}
              className="bg-yellow-600 p-2 rounded disabled:opacity-50 w-full"
            >
              Upgrade (+20% Auto Expand)
            </button>
          </div>

          <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
            <h3 className="flex items-center mb-2">
              <Minus className="mr-2" /> Render Quality
              <span className="ml-2 text-sm text-gray-400">
                (Level: {upgrades.renderQuality})
              </span>
            </h3>
            <button 
              onClick={() => handleUpgrade('renderQuality')}
              disabled={skillPoints === 0}
              className="bg-red-600 p-2 rounded disabled:opacity-50 w-full"
            >
              Upgrade (+Fractal Detail)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FractalGame;
