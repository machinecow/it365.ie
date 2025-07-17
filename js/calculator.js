// js/calculator.js

document.addEventListener('DOMContentLoaded', function () {
    // Define price constants in a PRICES object for easy updates
    const PRICES = {
        site: 100,
        server: 30,
        pc: 15
    };

    // Get the total element and store the original color
    const totalElement = document.getElementById('total');
    let colorTimeout; // Variable to keep track of the timeout

    /**
     * Retrieves and validates the numerical input from a specified element ID.
     * @param {string} id - The ID of the input element.
     * @returns {number} - The validated numerical value or 0 if invalid.
     */
    function getInputValue(id) {
        const value = Number(document.getElementById(id).value);
        return isNaN(value) || value < 0 ? 0 : value;
    }

    /**
     * Calculates individual costs based on quantities and unit prices.
     * @param {number} sites - The number of sites.
     * @param {number} servers - The number of servers.
     * @param {number} pcs - The number of PCs/Laptops/VMs.
     * @returns {object} - An object containing the calculated costs.
     */
    function calculateCosts(sites, servers, pcs) {
        return {
            siteCost: sites * PRICES.site,
            serverCost: servers * PRICES.server,
            pcCost: pcs * PRICES.pc,
        };
    }

    /**
     * Updates the displayed cost breakdown and total on the webpage.
     * @param {object} costs - An object containing individual costs.
     */
    function updateDisplay(costs) {
        let total = costs.siteCost + costs.serverCost + costs.pcCost;

        // Format options for currency display
        const formatOptions = { style: 'currency', currency: 'EUR' };

        // Update the DOM with formatted cost values
        document.getElementById('siteCost').textContent = costs.siteCost.toLocaleString('en-IE', formatOptions);
        document.getElementById('serverCost').textContent = costs.serverCost.toLocaleString('en-IE', formatOptions);
        document.getElementById('pcCost').textContent = costs.pcCost.toLocaleString('en-IE', formatOptions);
        totalElement.textContent = total.toLocaleString('en-IE', formatOptions);

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

        // Input validation and error handling
        if (servers === 0 && pcs === 0) {
            document.getElementById('error-message').textContent = 'Please enter at least one server or PC.';
        } else {
            document.getElementById('error-message').textContent = '';
        }

        const costs = calculateCosts(sites, servers, pcs);
        updateDisplay(costs);
    }

    // Event listeners for real-time calculation
    document.getElementById('sites').addEventListener('input', calculateTotal);
    document.getElementById('servers').addEventListener('input', calculateTotal);
    document.getElementById('pcs').addEventListener('input', calculateTotal);

    // Initialize calculation on page load
    calculateTotal();
});
