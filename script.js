const expressionLine = document.querySelector('.expression-line');
const previewLine = document.querySelector('.preview-line');
const buttons = document.querySelectorAll('.keys button');

// History elements
const historyToggle = document.getElementById('history-toggle');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

let currentInput = '0';
let resetNext = false;
let history = [];

// Toggle history panel
historyToggle.addEventListener('click', () => {
    historyPanel.classList.toggle('active');
});

// Clear history
clearHistoryBtn.addEventListener('click', () => {
    history = [];
    renderHistory();
});

// Handle button clicks
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.id;
        const text = button.innerText.trim();

        if (id === 'ac') {
            currentInput = '0';
            resetNext = false;
            updateDisplay();
            return;
        }

        if (id === 'del') {
            if (currentInput.length > 1 && currentInput !== 'Error') {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            updateDisplay();
            return;
        }

        if (id === 'equal') {
            executeEqual();
            return;
        }

        if (id === 'per') {
            try {
                const val = parseFloat(currentInput);
                if (!isNaN(val)) {
                    currentInput = (val / 100).toString();
                }
            } catch {
                currentInput = 'Error';
            }
            updateDisplay();
            return;
        }

        if (id === 'dec') {
            const parts = currentInput.split(/[\+\−\×\÷]/);
            const currentPart = parts[parts.length - 1];
            if (!currentPart.includes('.')) {
                currentInput += '.';
            }
            updateDisplay();
            return;
        }

        // Handle operators
        if (button.classList.contains('oprator')) {
            if (currentInput === 'Error') currentInput = '0';

            const lastChar = currentInput.slice(-1);
            if (['+', '−', '×', '÷'].includes(lastChar)) {
                currentInput = currentInput.slice(0, -1) + text;
            } else {
                currentInput += text;
            }
            resetNext = false;
            updateDisplay();
            return;
        }

        // Handle digits (0-9)
        if (currentInput === '0' || resetNext || currentInput === 'Error') {
            currentInput = text;
            resetNext = false;
        } else {
            currentInput += text;
        }

        updateDisplay();
    });
});

// Calculate helper
function evaluateExpression(str) {
    let cleanExp = str
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

    // Remove trailing operator for safe evaluation
    if (['+', '-', '*', '/'].includes(cleanExp.slice(-1))) {
        cleanExp = cleanExp.slice(0, -1);
    }

    if (!cleanExp) return null;

    let res = new Function(`return ${cleanExp}`)();
    if (!isFinite(res) || isNaN(res)) return 'Error';

    // Fix precision
    return (Math.round(res * 100000000) / 100000000).toString();
}

// Live Preview
function updateDisplay() {
    expressionLine.innerText = currentInput;

    const hasOperator = /[\+\−\×\÷]/.test(currentInput);
    const lastCharIsOperator = /[\+\−\×\÷]$/.test(currentInput);

    // Only show preview if there is an active mathematical operation
    if (hasOperator && !lastCharIsOperator && currentInput !== 'Error') {
        try {
            const previewVal = evaluateExpression(currentInput);
            previewLine.innerText = previewVal ? `= ${previewVal}` : '';
        } catch {
            previewLine.innerText = '';
        }
    } else {
        previewLine.innerText = '';
    }
}

// Execute on =
function executeEqual() {
    try {
        const result = evaluateExpression(currentInput);
        if (result && result !== 'Error') {
            // Save to History
            history.unshift({ exp: currentInput, res: result });
            if (history.length > 20) history.pop();
            renderHistory();

            currentInput = result;
        } else {
            currentInput = 'Error';
        }
        resetNext = true;
    } catch {
        currentInput = 'Error';
        resetNext = true;
    }
    updateDisplay();
}

// Render history panel
function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = `<div class="empty-history">No history yet</div>`;
        return;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
        const row = document.createElement('div');
        row.className = 'history-item';
        row.innerHTML = `
            <div class="history-item-exp">${item.exp} =</div>
            <div class="history-item-res">${item.res}</div>
        `;
        // Click to load previous result back onto the display
        row.addEventListener('click', () => {
            currentInput = item.res;
            resetNext = false;
            updateDisplay();
            historyPanel.classList.remove('active');
        });
        historyList.appendChild(row);
    });
}