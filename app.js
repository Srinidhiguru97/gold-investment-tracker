// Application Data
const goldData = {
    currentPrices: {
        "24K": 11831,
        "22K": 10845,
        "18K": 8873,
        lastUpdated: "2025-09-30"
    },
    historicalPrices: [
        {"date": "2022-12-12", "price_24k": 4761, "price_22k": 4363, "price_18k": 3571},
        {"date": "2023-01-15", "price_24k": 4950, "price_22k": 4537, "price_18k": 3713},
        {"date": "2023-03-15", "price_24k": 5200, "price_22k": 4767, "price_18k": 3900},
        {"date": "2023-06-15", "price_24k": 5800, "price_22k": 5317, "price_18k": 4350},
        {"date": "2023-09-15", "price_24k": 6200, "price_22k": 5683, "price_18k": 4650},
        {"date": "2023-12-15", "price_24k": 6800, "price_22k": 6234, "price_18k": 5100},
        {"date": "2024-03-15", "price_24k": 7200, "price_22k": 6600, "price_18k": 5400},
        {"date": "2024-06-15", "price_24k": 8500, "price_22k": 7792, "price_18k": 6375},
        {"date": "2024-09-15", "price_24k": 9800, "price_22k": 8984, "price_18k": 7350},
        {"date": "2024-12-15", "price_24k": 10500, "price_22k": 9625, "price_18k": 7875},
        {"date": "2025-03-15", "price_24k": 10800, "price_22k": 9900, "price_18k": 8100},
        {"date": "2025-06-15", "price_24k": 11200, "price_22k": 10267, "price_18k": 8400},
        {"date": "2025-09-30", "price_24k": 11831, "price_22k": 10845, "price_18k": 8873}
    ]
};

// Application State
let appState = {
    currentScreen: 'loading',
    user: {
        name: '',
        holdings: []
    },
    holdingCounter: 1
};

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function getHistoricalPrice(date, purity) {
    const targetDate = new Date(date);
    let closestPrice = null;
    let smallestDiff = Infinity;

    goldData.historicalPrices.forEach(priceData => {
        const priceDate = new Date(priceData.date);
        const diff = Math.abs(targetDate - priceDate);
        
        if (diff < smallestDiff) {
            smallestDiff = diff;
            const priceKey = `price_${purity.toLowerCase()}`;
            closestPrice = priceData[priceKey];
        }
    });

    return closestPrice || goldData.currentPrices[purity];
}

function calculateInvestmentValue(holding) {
    const purchasePrice = getHistoricalPrice(holding.date, holding.purity);
    const currentPrice = goldData.currentPrices[holding.purity];
    const investmentAmount = holding.grams * purchasePrice;
    const currentValue = holding.grams * currentPrice;
    const gainLoss = currentValue - investmentAmount;
    const gainLossPercentage = ((gainLoss / investmentAmount) * 100).toFixed(2);

    return {
        investmentAmount,
        currentValue,
        gainLoss,
        gainLossPercentage,
        purchasePrice,
        currentPrice
    };
}

// Screen Management - Fixed for proper navigation
function showScreen(screenName) {
    console.log(`Navigating from ${appState.currentScreen} to ${screenName}`);
    
    // Get all screens
    const allScreens = ['loading-screen', 'welcome-screen', 'dashboard-screen'];
    
    // Hide all screens first
    allScreens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    // Show target screen
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState.currentScreen = screenName;
        console.log(`Successfully navigated to ${screenName}`);
    } else {
        console.error(`Screen ${screenName}-screen not found`);
    }
}

// Form Validation
function validateWelcomeForm() {
    const usernameInput = document.getElementById('username');
    const seeInvestmentBtn = document.getElementById('see-investment-btn');
    
    if (!usernameInput || !seeInvestmentBtn) return false;
    
    const username = usernameInput.value.trim();
    const holdingEntries = document.querySelectorAll('.holding-entry');
    
    if (!username) {
        seeInvestmentBtn.disabled = true;
        return false;
    }

    let allValid = true;
    holdingEntries.forEach(entry => {
        const grams = entry.querySelector('.grams-input').value;
        const purity = entry.querySelector('.purity-input').value;
        const date = entry.querySelector('.date-input').value;
        
        if (!grams || !purity || !date) {
            allValid = false;
        }
    });

    seeInvestmentBtn.disabled = !allValid;
    return allValid;
}

// Holdings Management
function addHoldingEntry() {
    const holdingsContainer = document.getElementById('holdings-container');
    if (!holdingsContainer) return;
    
    appState.holdingCounter++;
    const index = appState.holdingCounter;
    
    const holdingHTML = `
        <div class="holding-entry" data-index="${index}">
            <div class="holding-header">
                <h4>Purchase #${index}</h4>
                <button type="button" class="remove-holding-btn" onclick="removeHoldingEntry(${index})">Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Grams</label>
                    <input type="number" class="form-control grams-input" placeholder="10" step="0.1" min="0.1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Purity</label>
                    <select class="form-control purity-input" required>
                        <option value="">Select</option>
                        <option value="24K">24K</option>
                        <option value="22K">22K</option>
                        <option value="18K">18K</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Purchase Date</label>
                <input type="date" class="form-control date-input" min="2022-01-01" max="2025-09-30" value="2024-01-01" required>
            </div>
        </div>
    `;
    
    holdingsContainer.insertAdjacentHTML('beforeend', holdingHTML);
    
    // Add event listeners to new inputs
    const newEntry = holdingsContainer.querySelector(`[data-index="${index}"]`);
    const inputs = newEntry.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', validateWelcomeForm);
        input.addEventListener('change', validateWelcomeForm);
    });
    
    // Trigger validation after adding new entry
    validateWelcomeForm();
}

function removeHoldingEntry(index) {
    const entry = document.querySelector(`[data-index="${index}"]`);
    if (entry) {
        entry.remove();
        validateWelcomeForm();
    }
}

// Dashboard Functions
function updateDashboard() {
    const userGreeting = document.getElementById('user-greeting');
    const totalInvestmentEl = document.getElementById('total-investment');
    const currentValueEl = document.getElementById('current-value');
    const totalGainLossEl = document.getElementById('total-gain-loss');
    
    if (!userGreeting || !totalInvestmentEl || !currentValueEl || !totalGainLossEl) return;
    
    // Update greeting
    userGreeting.textContent = `Hi ${appState.user.name}!`;
    
    // Calculate totals
    let totalInvestment = 0;
    let totalCurrentValue = 0;
    
    appState.user.holdings.forEach(holding => {
        const calc = calculateInvestmentValue(holding);
        totalInvestment += calc.investmentAmount;
        totalCurrentValue += calc.currentValue;
    });
    
    const totalGainLoss = totalCurrentValue - totalInvestment;
    const totalGainLossPercentage = totalInvestment > 0 ? ((totalGainLoss / totalInvestment) * 100).toFixed(2) : 0;
    
    // Update summary
    totalInvestmentEl.textContent = formatCurrency(totalInvestment);
    currentValueEl.textContent = formatCurrency(totalCurrentValue);
    
    const gainLossText = `${formatCurrency(totalGainLoss)} (${totalGainLossPercentage}%)`;
    totalGainLossEl.textContent = gainLossText;
    totalGainLossEl.className = `summary-value ${totalGainLoss >= 0 ? 'gain' : 'loss'}`;
    
    // Update holdings list
    renderHoldingsList();
}

function renderHoldingsList() {
    const holdingsList = document.getElementById('holdings-list');
    if (!holdingsList) return;
    
    if (appState.user.holdings.length === 0) {
        holdingsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>No holdings yet. Add your first gold purchase!</p>
            </div>
        `;
        return;
    }
    
    holdingsList.innerHTML = '';
    
    appState.user.holdings.forEach((holding, index) => {
        const calc = calculateInvestmentValue(holding);
        
        const holdingHTML = `
            <div class="holding-item">
                <div class="holding-item-header">
                    <div class="holding-info">
                        <h4>${holding.grams}g ${holding.purity} Gold</h4>
                        <div class="holding-details">
                            Purchased on ${formatDate(holding.date)} at ${formatCurrency(calc.purchasePrice)}/gram
                        </div>
                    </div>
                    <div class="holding-actions">
                        <button class="btn btn--danger btn--sm" onclick="deleteHolding(${index})">Delete</button>
                    </div>
                </div>
                <div class="holding-performance">
                    <div class="performance-item">
                        <div class="performance-label">Investment</div>
                        <div class="performance-value">${formatCurrency(calc.investmentAmount)}</div>
                    </div>
                    <div class="performance-item">
                        <div class="performance-label">Current Value</div>
                        <div class="performance-value">${formatCurrency(calc.currentValue)}</div>
                    </div>
                    <div class="performance-item">
                        <div class="performance-label">Gain/Loss</div>
                        <div class="performance-value ${calc.gainLoss >= 0 ? 'gain' : 'loss'}">
                            ${formatCurrency(calc.gainLoss)} (${calc.gainLossPercentage}%)
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        holdingsList.insertAdjacentHTML('beforeend', holdingHTML);
    });
}

function deleteHolding(index) {
    if (confirm('Are you sure you want to delete this holding?')) {
        appState.user.holdings.splice(index, 1);
        updateDashboard();
    }
}

// Modal Functions
function showModal() {
    const modal = document.getElementById('add-purchase-modal');
    const newPurchaseForm = document.getElementById('new-purchase-form');
    
    if (modal && newPurchaseForm) {
        modal.classList.remove('hidden');
        newPurchaseForm.reset();
        // Set default date for new purchases
        const newDateInput = document.getElementById('new-date');
        if (newDateInput) {
            newDateInput.value = '2024-01-01';
        }
    }
}

function hideModal() {
    const modal = document.getElementById('add-purchase-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Global functions for onclick handlers
window.removeHoldingEntry = removeHoldingEntry;
window.deleteHolding = deleteHolding;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing...');
    
    // Start with loading screen - ensure it's visible
    showScreen('loading');
    
    // Transition to welcome screen after 2 seconds
    setTimeout(function() {
        console.log('Loading complete, transitioning to welcome screen');
        showScreen('welcome');
    }, 2000);
    
    // Initialize form validation
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', validateWelcomeForm);
        usernameInput.addEventListener('change', validateWelcomeForm);
    }
    
    // Initialize holding inputs with proper event listeners
    const initialInputs = document.querySelectorAll('.holding-entry input, .holding-entry select');
    initialInputs.forEach(input => {
        input.addEventListener('input', validateWelcomeForm);
        input.addEventListener('change', validateWelcomeForm);
    });
    
    // Initial validation check
    setTimeout(validateWelcomeForm, 100);
    
    // Add holding button
    const addHoldingBtn = document.getElementById('add-holding-btn');
    if (addHoldingBtn) {
        addHoldingBtn.addEventListener('click', addHoldingEntry);
    }
    
    // Welcome form submission
    const welcomeForm = document.getElementById('welcome-form');
    if (welcomeForm) {
        welcomeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Welcome form submitted');
            
            const usernameInput = document.getElementById('username');
            if (!usernameInput || !validateWelcomeForm()) return;
            
            // Collect user data
            appState.user.name = usernameInput.value.trim();
            appState.user.holdings = [];
            
            const holdingEntries = document.querySelectorAll('.holding-entry');
            holdingEntries.forEach(entry => {
                const grams = parseFloat(entry.querySelector('.grams-input').value);
                const purity = entry.querySelector('.purity-input').value;
                const date = entry.querySelector('.date-input').value;
                
                appState.user.holdings.push({
                    grams,
                    purity,
                    date
                });
            });
            
            console.log('User data collected:', appState.user);
            
            // Update dashboard and navigate
            updateDashboard();
            showScreen('dashboard');
        });
    }
    
    // Dashboard buttons
    const addNewPurchaseBtn = document.getElementById('add-new-purchase-btn');
    if (addNewPurchaseBtn) {
        addNewPurchaseBtn.addEventListener('click', showModal);
    }
    
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }
    
    const cancelPurchaseBtn = document.getElementById('cancel-purchase');
    if (cancelPurchaseBtn) {
        cancelPurchaseBtn.addEventListener('click', hideModal);
    }
    
    // Modal background click
    const modal = document.getElementById('add-purchase-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
    }
    
    // New purchase form submission
    const newPurchaseForm = document.getElementById('new-purchase-form');
    if (newPurchaseForm) {
        newPurchaseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const grams = parseFloat(document.getElementById('new-grams').value);
            const purity = document.getElementById('new-purity').value;
            const date = document.getElementById('new-date').value;
            
            // Add new holding
            appState.user.holdings.push({
                grams,
                purity,
                date
            });
            
            // Update dashboard
            updateDashboard();
            hideModal();
        });
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('add-purchase-modal');
            if (modal && !modal.classList.contains('hidden')) {
                hideModal();
            }
        }
    });
    
    console.log('Application initialization complete');
});