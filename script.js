class FractalGame {
    constructor() {
        this.canvas = document.getElementById('fractalCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.tokens = 0;
        this.xp = 0;
        this.level = 1;
        this.skillPoints = 0;
        this.fractalLevel = 1;
        this.prestige = 1;
        this.autoExpand = false;

        this.upgrades = {
            tokenGeneration: 1,
            fractalComplexity: 1,
            prestigeMultiplier: 1,
            autoExpandEfficiency: 1
        };

        this.initializeEventListeners();
        this.startGameLoop();
    }

    get tokenRate() {
        const baseRate = 10 * Math.pow(this.fractalLevel, 1.2) * this.prestige;
        const upgradeMultiplier = this.upgrades.tokenGeneration;
        return Math.floor(baseRate * upgradeMultiplier);
    }

    get upgradeCost() {
        const baseCost = 10 * Math.pow(1.5, this.fractalLevel);
        const complexityReduction = this.upgrades.fractalComplexity;
        return Math.floor(baseCost / complexityReduction);
    }

    get prestigeCost() {
        // Prestige cost increases based on cumulative prestige levels
        const basePrestigeCost = Math.floor(100 * (1 + this.prestige));
        const prestigeMultiplier = this.upgrades.prestigeMultiplier;
        return Math.floor(basePrestigeCost / prestigeMultiplier);
    }

    initializeEventListeners() {
        document.getElementById('expandButton').addEventListener('click', () => this.handleExpand());
        document.getElementById('prestigeButton').addEventListener('click', () => this.handlePrestige());
        document.getElementById('autoExpandButton').addEventListener('click', () => this.toggleAutoExpand());
        
        // Skill Popup Listeners
        document.getElementById('skillPopupButton').addEventListener('click', () => this.openSkillPopup());
        document.getElementById('skillPopupClose').addEventListener('click', () => this.closeSkillPopup());
        document.getElementById('skillPopupOverlay').addEventListener('click', () => this.closeSkillPopup());

        this.createSkillButtons();
    }

    createSkillButtons() {
        const skillPopupGrid = document.getElementById('skillPopupGrid');
        const skills = [
            { 
                name: 'Greed', 
                type: 'tokenGeneration', 
                effect: 'x1.2 Token Rate',
                color: 'blue'
            },
            { 
                name: 'Efficiency', 
                type: 'fractalComplexity', 
                effect: 'x0.9 Upgrade Cost',
                color: 'green'
            },
            { 
                name: 'Bargaining', 
                type: 'prestigeMultiplier', 
                effect: 'x0.9 Prestige Cost',
                color: 'purple'
            }
        ];

        skills.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = `bg-gray-800 p-4 rounded flex flex-col items-center`;
            skillElement.innerHTML = `
                <h3 class="flex items-center mb-2">
                    ${skill.name}
                    <span class="ml-2 text-sm text-gray-400" id="${skill.type}SkillLevel">
                        (Level: 1)
                    </span>
                </h3>
                <button 
                    id="${skill.type}SkillButton"
                    class="bg-${skill.color}-600 p-2 rounded w-full"
                >
                    Upgrade (${skill.effect})
                </button>
            `;
            skillPopupGrid.appendChild(skillElement);

            document.getElementById(`${skill.type}SkillButton`).addEventListener('click', 
                () => this.handleUpgrade(skill.type)
            );
        });
    }

    openSkillPopup() {
        document.getElementById('skillPopup').style.display = 'block';
        document.getElementById('skillPopupOverlay').style.display = 'block';
    }

    closeSkillPopup() {
        document.getElementById('skillPopup').style.display = 'none';
        document.getElementById('skillPopupOverlay').style.display = 'none';
    }

    handleUpgrade(upgradeType) {
        if (this.skillPoints > 0) {
            // Multiplicative upgrade
            this.upgrades[upgradeType] *= 1.2;
            this.skillPoints--;
            this.updateDisplay();
        }
    }

    handleExpand() {
        if (this.tokens >= this.upgradeCost) {
            this.tokens -= this.upgradeCost;
            this.fractalLevel++;
            this.updateDisplay();
        }
    }

    handlePrestige() {
        if (this.level >= this.prestigeCost) {
            this.tokens = 0;
            this.fractalLevel = 1;
            this.xp = 0;
            this.level = 1;
            this.skillPoints = 0;
            this.upgrades = {
                tokenGeneration: 1,
                fractalComplexity: 1,
                prestigeMultiplier: 1,
                autoExpandEfficiency: 1
            };
            this.prestige *= (1.5 + (this.upgrades.prestigeMultiplier - 1) * 0.1);
            this.updateDisplay();
        }
    }

    toggleAutoExpand() {
        this.autoExpand = !this.autoExpand;
        document.getElementById('autoExpandButton').textContent = 
            this.autoExpand ? 'Auto Expand: ON' : 'Auto Expand: OFF';
        document.getElementById('autoExpandButton').className = 
            this.autoExpand 
            ? 'button green-button'
            : 'button gray-button';
    }

    drawFractal() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;

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

            const thirdX = x1 + dx / 2 + Math.sqrt(3) / 2 * (unitY * dist / 3);
            const thirdY = y1 + dy / 2 - Math.sqrt(3) / 2 * (unitX * dist / 3);

            drawKochSnowflake(x1, y1, x1 + dx / 3, y1 + dy / 3, depth - 1);
            drawKochSnowflake(x1 + dx / 3, y1 + dy / 3, thirdX, thirdY, depth - 1);
            drawKochSnowflake(thirdX, thirdY, x1 + 2 * dx / 3, y1 + 2 * dy / 3, depth - 1);
            drawKochSnowflake(x1 + 2 * dx / 3, y1 + 2 * dy / 3, x2, y2, depth - 1);
        };

        const size = 400 * Math.sqrt(this.fractalLevel);
        const centerX = width / 2;
        const centerY = height / 2;

        const maxDepth = Math.min(this.fractalLevel, 6);

        drawKochSnowflake(
            centerX - size / 2, 
            centerY + size / (2 * Math.sqrt(3)), 
            centerX + size / 2, 
            centerY + size / (2 * Math.sqrt(3)), 
            maxDepth
        );
    }

    gameLoop() {
        this.tokens += this.tokenRate / 10;

        this.drawFractal();

        // XP and Leveling
        const xpGain = Math.floor(this.tokenRate / 10);
        const nextLevelXp = this.level * 100;

        if (this.xp + xpGain >= nextLevelXp) {
            this.level++;
            this.skillPoints++;
            this.xp = 0;
        } else {
            this.xp += xpGain;
        }

        // Auto-expand logic
        const autoExpandMultiplier = this.upgrades.autoExpandEfficiency;
        if (this.autoExpand && this.tokens >= this.upgradeCost * autoExpandMultiplier) {
            this.tokens -= this.upgradeCost * autoExpandMultiplier;
            this.fractalLevel++;
        }

        this.updateDisplay();
    }

    updateDisplay() {
        document.getElementById('tokensDisplay').textContent = `Tokens: ${Math.floor(this.tokens)}`;
        document.getElementById('tokenRateDisplay').textContent = `Rate: ${this.tokenRate}/s`;
        document.getElementById('fractalLevelDisplay').textContent = `Fractal Level: ${this.fractalLevel}`;
        document.getElementById('prestigeDisplay').textContent = `Prestige: ${this.prestige.toFixed(2)}x`;
        
        document.getElementById('xpDisplay').textContent = `XP: ${Math.floor(this.xp)}/${this.level * 100}`;
        document.getElementById('levelDisplay').textContent = `Level: ${this.level}`;
        document.getElementById('skillPointsDisplay').textContent = `Skill Points: ${this.skillPoints}`;

        // Update skill levels in popup
        Object.keys(this.upgrades).forEach(upgradeName => {
            const skillLevelElement = document.getElementById(`${upgradeName}SkillLevel`);
            if (skillLevelElement) {
                skillLevelElement.textContent = `(Level: ${Math.round(this.upgrades[upgradeName] * 10) / 10})`;
            }
        });

        // Update expand and prestige buttons
        document.getElementById('expandButton').textContent = `Expand Fractal (Cost: ${this.upgradeCost})`;
        document.getElementById('prestigeButton').textContent = `Prestige (Req: Level ${this.prestigeCost})`;
    }

    startGameLoop() {
        setInterval(() => this.gameLoop(), 100);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new FractalGame();
});
