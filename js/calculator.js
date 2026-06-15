// js/calculator.js

document.addEventListener('DOMContentLoaded', function () {
    const ACCESS_CODE_HASH = 1613105311;
    const ACCESS_SESSION_KEY = 'it365EstimateAccess';

    function hashAccessCode(value) {
        let hash = 2166136261;

        for (let index = 0; index < value.length; index += 1) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }

        return hash >>> 0;
    }

    function unlockEstimatePage() {
        document.body.classList.remove('is-locked');

        try {
            sessionStorage.setItem(ACCESS_SESSION_KEY, 'granted');
        } catch {
            // Session storage can be unavailable in strict privacy modes.
        }
    }

    function setupPasswordGate() {
        const passwordGateForm = document.getElementById('passwordGateForm');
        const passwordInput = document.getElementById('estimatePassword');
        const passwordGateMessage = document.getElementById('passwordGateMessage');

        if (!passwordGateForm || !passwordInput || !passwordGateMessage) {
            return;
        }

        try {
            if (sessionStorage.getItem(ACCESS_SESSION_KEY) === 'granted') {
                unlockEstimatePage();
                return;
            }
        } catch {
            // Keep the password gate visible if session storage cannot be read.
        }

        passwordInput.focus();

        passwordGateForm.addEventListener('submit', event => {
            event.preventDefault();

            if (hashAccessCode(passwordInput.value.trim()) === ACCESS_CODE_HASH) {
                passwordGateMessage.className = 'form-message';
                passwordGateMessage.textContent = '';
                passwordInput.value = '';
                unlockEstimatePage();
                return;
            }

            passwordGateMessage.className = 'form-message error';
            passwordGateMessage.textContent = 'That password is not recognised. Please check the details and try again.';
            passwordInput.select();
        });
    }

    setupPasswordGate();

    // Define price constants in a PRICES object for easy updates
    const PRICES = {
        site: 100,
        server: 30,
        serverBackup: 45,
        pc: 15,
        microsoftBackup: 3
    };

    // Get the total element and store the original color
    const totalElement = document.getElementById('total');
    const emailEstimate = document.getElementById('emailEstimate');
    let colorTimeout; // Variable to keep track of the timeout

    /**
     * Retrieves and validates the numerical input from a specified element ID.
     * @param {string} id - The ID of the input element.
     * @returns {number} - The validated numerical value or 0 if invalid.
     */
    function getInputValue(id) {
        const value = Number.parseInt(document.getElementById(id).value.trim(), 10);
        return Number.isNaN(value) || value < 0 ? 0 : value;
    }

    /**
     * Calculates individual costs based on quantities and unit prices.
     * @param {number} sites - The number of sites.
     * @param {number} servers - The number of servers.
     * @param {number} pcs - The number of PCs/Laptops/VMs.
     * @param {boolean} includeMicrosoftBackup - Whether Microsoft 365 backup is included.
     * @returns {object} - An object containing the calculated costs.
     */
    function calculateCosts(sites, servers, pcs, includeMicrosoftBackup) {
        return {
            siteCost: sites * PRICES.site,
            serverSupportCost: servers * PRICES.server,
            serverBackupCost: servers * PRICES.serverBackup,
            pcCost: pcs * PRICES.pc,
            microsoftBackupCost: includeMicrosoftBackup ? pcs * PRICES.microsoftBackup : 0,
        };
    }

    /**
     * Updates the displayed cost breakdown and total on the webpage.
     * @param {object} costs - An object containing individual costs.
     * @param {object} quantities - The input quantities used for the estimate.
     * @param {boolean} isValidEstimate - Whether the estimate has a supportable server or device count.
     */
    function updateDisplay(costs, quantities, isValidEstimate) {
        let total = costs.siteCost + costs.serverSupportCost + costs.serverBackupCost + costs.pcCost + costs.microsoftBackupCost;

        // Format options for currency display
        const formatOptions = { style: 'currency', currency: 'EUR' };

        // Update the DOM with formatted cost values
        document.getElementById('siteCost').textContent = costs.siteCost.toLocaleString('en-IE', formatOptions);
        document.getElementById('serverSupportCost').textContent = costs.serverSupportCost.toLocaleString('en-IE', formatOptions);
        document.getElementById('serverBackupCost').textContent = costs.serverBackupCost.toLocaleString('en-IE', formatOptions);
        document.getElementById('pcCost').textContent = costs.pcCost.toLocaleString('en-IE', formatOptions);
        document.getElementById('microsoftBackupCost').textContent = costs.microsoftBackupCost.toLocaleString('en-IE', formatOptions);
        totalElement.textContent = total.toLocaleString('en-IE', formatOptions);

        if (emailEstimate) {
            if (!isValidEstimate) {
                emailEstimate.href = '#calculator-form';
                emailEstimate.setAttribute('aria-disabled', 'true');
                emailEstimate.classList.add('is-disabled');
            } else {
                const formattedTotal = total.toLocaleString('en-IE', formatOptions);
                const body = [
                    'Hi it365.ie,',
                    '',
                    'I used the support plan estimate tool and would like to review a monthly support plan.',
                    '',
                    `Sites: ${quantities.sites}`,
                    `Servers: ${quantities.servers}`,
                    `PCs/Laptops/VMs: ${quantities.pcs}`,
                    `Server backup included: ${quantities.servers} x ${PRICES.serverBackup.toLocaleString('en-IE', formatOptions)}`,
                    `Microsoft 365 backup: ${quantities.includeMicrosoftBackup ? `Yes, ${quantities.pcs} accounts x ${PRICES.microsoftBackup.toLocaleString('en-IE', formatOptions)}` : 'No'}`,
                    `Estimated monthly total excluding VAT: ${formattedTotal}`,
                    '',
                    'Please contact me to confirm the details.'
                ].join('\n');

                emailEstimate.href = `mailto:help@it365.ie?subject=${encodeURIComponent('Monthly support plan estimate')}&body=${encodeURIComponent(body)}`;
                emailEstimate.setAttribute('aria-disabled', 'false');
                emailEstimate.classList.remove('is-disabled');
            }
        }

        // Clear any existing timeout to prevent overlap
        if (colorTimeout) {
            clearTimeout(colorTimeout);
            totalElement.classList.remove('highlight');
        }

        // Add the 'highlight' class to the total element
        totalElement.classList.add('highlight');

        // Remove the 'highlight' class after half a second
        colorTimeout = setTimeout(() => {
            totalElement.classList.remove('highlight');
            colorTimeout = null; // Reset the timeout variable
        }, 500);
    }

    /**
     * Main function to calculate the total cost and update the display.
     */
    function calculateTotal() {
        const sites = getInputValue('sites');
        const servers = getInputValue('servers');
        const pcs = getInputValue('pcs');
        const includeMicrosoftBackup = document.getElementById('microsoftBackup').checked;

        // Input validation and error handling
        const isValidEstimate = servers > 0 || pcs > 0;

        if (!isValidEstimate) {
            document.getElementById('error-message').textContent = 'Please enter at least one server or PC.';
        } else {
            document.getElementById('error-message').textContent = '';
        }

        const costs = calculateCosts(sites, servers, pcs, includeMicrosoftBackup);
        updateDisplay(costs, { sites, servers, pcs, includeMicrosoftBackup }, isValidEstimate);
    }

    // Event listeners for real-time calculation
    document.getElementById('sites').addEventListener('input', calculateTotal);
    document.getElementById('servers').addEventListener('input', calculateTotal);
    document.getElementById('pcs').addEventListener('input', calculateTotal);
    document.getElementById('microsoftBackup').addEventListener('change', calculateTotal);

    // Initialize calculation on page load
    calculateTotal();
});
