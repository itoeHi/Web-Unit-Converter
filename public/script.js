document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabs = document.querySelectorAll('.tab');
    const valueInput = document.getElementById('value');
    const valueLabel = document.getElementById('value-label');
    const fromUnitSelect = document.getElementById('from-unit');
    const toUnitSelect = document.getElementById('to-unit');
    const convertBtn = document.getElementById('convert-btn');
    const resultContainer = document.getElementById('result-container');
    const resultValue = document.getElementById('result-value');
    const resetBtn = document.getElementById('reset-btn');
    const errorMessage = document.getElementById('error-message');
    
    // Units for each category
    const units = {
        length: [
            { value: 'mm', label: 'Millimeter (mm)' },
            { value: 'cm', label: 'Centimeter (cm)' },
            { value: 'm', label: 'Meter (m)' },
            { value: 'km', label: 'Kilometer (km)' },
            { value: 'inch', label: 'Inch' },
            { value: 'ft', label: 'Foot (ft)' },
            { value: 'yard', label: 'Yard' },
            { value: 'mile', label: 'Mile' }
        ],
        weight: [
            { value: 'mg', label: 'Milligram (mg)' },
            { value: 'g', label: 'Gram (g)' },
            { value: 'kg', label: 'Kilogram (kg)' },
            { value: 'ounce', label: 'Ounce' },
            { value: 'pound', label: 'Pound (lb)' }
        ],
        temperature: [
            { value: 'celsius', label: 'Celsius (°C)' },
            { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
            { value: 'kelvin', label: 'Kelvin (K)' }
        ]
    };
    
    // Category labels for the input label
    const categoryLabels = {
        length: 'length',
        weight: 'weight',
        temperature: 'temperature'
    };
    
    // Current active category
    let currentCategory = 'length';
    
    // Initialize the app
    function init() {
        // Set up tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Update current category
                currentCategory = this.getAttribute('data-category');
                
                // Update input label based on category
                updateInputLabel();
                
                // Update unit dropdowns
                updateUnitDropdowns();
                
                // Clear result
                clearResult();
            });
        });
        
        // Set up convert button
        convertBtn.addEventListener('click', performConversion);
        
        // Set up reset button
        resetBtn.addEventListener('click', resetConverter);
        
        // Set up Enter key for conversion
        valueInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performConversion();
            }
        });
        
        // Initialize input label and unit dropdowns
        updateInputLabel();
        updateUnitDropdowns();
    }
    
    // Update the input label based on current category
    function updateInputLabel() {
        const labelText = `Enter the ${categoryLabels[currentCategory]} to convert`;
        valueLabel.textContent = labelText;
    }
    
    // Update the unit dropdowns based on current category
    function updateUnitDropdowns() {
        const currentUnits = units[currentCategory];
        
        // Clear existing options
        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';
        
        // Add new options
        currentUnits.forEach(unit => {
            const fromOption = document.createElement('option');
            fromOption.value = unit.value;
            fromOption.textContent = unit.label;
            
            const toOption = document.createElement('option');
            toOption.value = unit.value;
            toOption.textContent = unit.label;
            
            fromUnitSelect.appendChild(fromOption);
            toUnitSelect.appendChild(toOption);
        });
        
        // Set default selections
        if (currentCategory === 'length') {
            fromUnitSelect.value = 'ft';
            toUnitSelect.value = 'cm';
        } else if (currentCategory === 'weight') {
            fromUnitSelect.value = 'kg';
            toUnitSelect.value = 'pound';
        } else if (currentCategory === 'temperature') {
            fromUnitSelect.value = 'celsius';
            toUnitSelect.value = 'fahrenheit';
        }
    }
    
    // Perform the conversion
    async function performConversion() {
        // Get input values
        const value = valueInput.value.trim();
        const fromUnit = fromUnitSelect.value;
        const toUnit = toUnitSelect.value;
        
        // Validate input
        if (!value) {
            showError('Please enter a value to convert');
            return;
        }
        
        if (isNaN(parseFloat(value))) {
            showError('Please enter a valid number');
            return;
        }
        
        if (fromUnit === toUnit) {
            showError('Please select different units for conversion');
            return;
        }
        
        // Clear any previous error
        hideError();
        
        // Prepare data for API request
        const requestData = {
            value: value,
            category: currentCategory,
            fromUnit: fromUnit,
            toUnit: toUnit
        };
        
        try {
            // Send request to server
            const response = await fetch('/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error('Server error');
            }
            
            const result = await response.json();
            
            // Display result
            resultValue.textContent = result.formattedString;
            resultContainer.classList.add('active');
            
        } catch (error) {
            console.error('Conversion error:', error);
            showError('Failed to perform conversion. Please try again.');
        }
    }
    
    // Clear the result display
    function clearResult() {
        resultContainer.classList.remove('active');
        hideError();
    }
    
    // Reset the converter
    function resetConverter() {
        valueInput.value = '';
        updateUnitDropdowns();
        clearResult();
        valueInput.focus();
    }
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    // Hide error message
    function hideError() {
        errorMessage.style.display = 'none';
    }
    
    // Initialize the app
    init();
});