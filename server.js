const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Server static file from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Add root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Conversion function
const conversionFunctions = {
    // Length conversions
    length: {
        mm: 1,
        cm: 10,
        m: 1000,
        km: 1000000,
        inch: 25.4,
        ft: 304.8,
        yard: 914.4,
        mile: 1609344
    },

    // Weight conversions
    weight: {
        mg: 1,
        g: 1000,
        kg: 1000000,
        ounce: 28349.5,
        pound: 453592
    },

    // Temperature conversions
    temperature: {
        celsius: 'celsius',
        fahrenheit: 'fahrenheit',
        kelvin: 'kelvin'
    }
};

// Helper function for temperature conversion
function converTemperature(value, fromUnit, toUnit) {
    let celsuisValue;
    
    // Convert to Celsius first
    switch(fromUnit) {
        case 'celsius':
            celsuisValue = parseFloat(value);
            break;
        case 'fahrenheit':
            celsuisValue = (parseFloat(value) - 32) * 5/9;
            break;
        case 'kelvin':
            celsuisValue = parseFloat(value) - 273.15;
            break;
        default:
            return 0;
    }

    // Convert from Celsius to target unit
    switch(toUnit) {
        case 'celsius':
            return celsuisValue;
        case 'fahrenheit':
            return (celsuisValue * 9/5) + 32;
        case 'kelvin':
            return celsuisValue + 273.15;
        default:
            return 0;
    }
}

// API endpoint for conversion
app.post('/convert', (req, res) => {
    const { value, category, fromUnit, toUnit } = req.body;

    if (!value || !category || !fromUnit || !toUnit) {
        return res.status(400).json({ error: 'Missing required fields'});
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
        return res.status(400).json({ error: 'Invaild number value'});
    }

    let result;

    if (category === 'temperature') {
        result = converTemperature(numValue, fromUnit, toUnit);
    } else {
        // Handle length and weight conversions
        const fromFactor = conversionFunctions[category][fromUnit];
        const toFactor = conversionFunctions[category][toUnit];

        if (!fromFactor || !toFactor) {
            return res.status(400).json({ error : 'Invaild units selected'});
        }

        // Convert to base unit (mm for length, mg for weight) then to target unit
        result = (numValue * fromFactor) / toFactor;
    }

    // From result to 2 decimal places
    const formattedResult = Math.round(result * 100) / 100;

    res.json({
        originalVaule: numValue,
        fromUnit,
        toUnit,
        result: formattedResult,
        formattedString: `${numValue} ${fromUnit} = ${formattedResult} ${toUnit}`
    });
});

app.listen(port, () => {
    console.log(`Unit Converter app listening at http://localhost:${port}`);
});