const CLI_PANEL_HTML = `
<div id="cli-panel" class="hidden">
    <div id="cli-output"></div>
    <div class="cli-input-container">
        <span class="cli-prompt">&gt;</span>
        <input type="text" id="cli-input" placeholder="Enter command..." autocomplete="off">
    </div>
</div>
`;

export class CLI {
    constructor(renderModelCallback) {
        this.renderModel = renderModelCallback;
        this.panel = null;
        this.output = null;
        this.input = null;
        this.history = [];
        this.historyIndex = -1;
        
        this.init();
    }

    init() {
        // Inject HTML
        const mainContainer = document.getElementById('main-container');
        mainContainer.insertAdjacentHTML('beforeend', CLI_PANEL_HTML);

        this.panel = document.getElementById('cli-panel');
        this.output = document.getElementById('cli-output');
        this.input = document.getElementById('cli-input');
        
        // UI Button
        const cliBtn = document.getElementById('cli-btn');
        if (cliBtn) {
            cliBtn.addEventListener('click', () => {
                this.toggle();
            });
        }

        // Event listeners
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Toggle shortcut (~)
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.toggle();
            }
        });
        
        this.log("Geometor CLI initialized. Press '~' to toggle.", "info");
    }

    toggle() {
        this.panel.classList.toggle('hidden');
        if (!this.panel.classList.contains('hidden')) {
            this.input.focus();
        }
    }

    log(message, type = 'normal') {
        const line = document.createElement('div');
        line.className = `cli-line cli-${type}`;
        line.textContent = message;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    async handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            if (!command) return;

            this.log(`> ${command}`, 'command');
            this.history.push(command);
            this.historyIndex = this.history.length;
            this.input.value = '';

            if (command.toLowerCase() === 'clear') {
                this.output.innerHTML = '';
                return;
            }

            try {
                const response = await fetch('/api/cli/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command })
                });

                const data = await response.json();
                
                if (data.success) {
                    this.log(data.message || 'Done', 'success');
                    if (this.renderModel) {
                        this.renderModel(data);
                    }
                } else {
                    this.log(data.message, 'error');
                }
            } catch (err) {
                this.log(`Error: ${err.message}`, 'error');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        }
    }
}
