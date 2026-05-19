// Persistent Session Storage Array Matrix
let vendorRecords = [];

// Sourcing Currencies Profile Arrays
const TradeCurrencies = [
    { code: "USD", name: "US Dollar" }, { code: "EUR", name: "Euro" },
    { code: "CNY", name: "Chinese Yuan" }, { code: "JPY", name: "Japanese Yen" },
    { code: "GBP", name: "British Pound" }, { code: "CAD", name: "Canadian Dollar" },
    { code: "MXN", name: "Mexican Peso" }, { code: "CHF", name: "Swiss Franc" },
    { code: "SGD", name: "Singapore Dollar" }, { code: "HKD", name: "Hong Kong Dollar" },
    { code: "INR", name: "Indian Rupee" }, { code: "KRW", name: "South Korean Won" },
    { code: "AUD", name: "Australian Dollar" }, { code: "BRL", name: "Brazilian Real" },
    { code: "AED", name: "UAE Dirham" }, { code: "SAR", name: "Saudi Riyal" },
    { code: "TRY", name: "Turkish Lira" }, { code: "THB", name: "Thai Baht" },
    { code: "VND", name: "Vietnamese Dong" }, { code: "TWD", name: "Taiwan Dollar" }
];

const TradeUOMs = [
    { code: "EA", desc: "Each" }, { code: "PC", desc: "Piece" }, { code: "UNIT", desc: "Unit" },
    { code: "CT", desc: "Count" }, { code: "PR", desc: "Pair" }, { code: "DZ", desc: "Dozen" },
    { code: "SET", desc: "Set" }, { code: "KIT", desc: "Kit" }, { code: "PK", desc: "Pack" },
    { code: "CS", desc: "Case" }, { code: "BX", desc: "Box" }, { code: "BG", desc: "Bag" },
    { code: "RL", desc: "Roll" }, { code: "PLT", desc: "Pallet" }, { code: "SKD", desc: "Skid" },
    { code: "CRT", desc: "Carton" }, { code: "TUB", desc: "Tub" }, { code: "CAN", desc: "Can" },
    { code: "BOT", desc: "Bottle" }, { code: "JAR", desc: "Jar" }, { code: "DR", desc: "Drum" },
    { code: "TOTE", desc: "Tote" }, { code: "LB", desc: "Pound" }, { code: "LBS", desc: "Pounds" },
    { code: "OZ", desc: "Ounce" }, { code: "TON", desc: "Ton" }, { code: "ST", desc: "Short Ton" },
    { code: "LT", desc: "Long Ton" }, { code: "MT", desc: "Metric Ton" }, { code: "G", desc: "Gram" },
    { code: "KG", desc: "Kilogram" }, { code: "MG", desc: "Milligram" }
];

const GlobalUOMConversions = {
    "CRT": { "PC": 24, "EA": 24, "UNIT": 24, "PR": 12 },
    "DZ":  { "PC": 12, "EA": 12, "UNIT": 12 },
    "CS":  { "PC": 48, "EA": 48, "UNIT": 48, "BX": 4 },
    "BX":  { "PC": 10, "EA": 10, "UNIT": 10 },
    "PK":  { "PC": 6,  "EA": 6,  "UNIT": 6  },
    "SET": { "PC": 1,  "EA": 1,  "UNIT": 1  },
    "PLT": { "CRT": 40, "CS": 30, "BX": 120, "PC": 1000 },
    "SKD": { "CRT": 40, "CS": 30, "BX": 120, "PC": 1000 },
    "MT":  { "KG": 1000, "G": 1000000, "LB": 2204.62, "LBS": 2204.62 },
    "KG":  { "G": 1000, "MG": 1000000, "LB": 2.20462, "LBS": 2.20462, "OZ": 35.274 },
    "LB":  { "OZ": 16, "G": 453.592, "KG": 0.453592 },
    "LBS": { "OZ": 16, "G": 453.592, "KG": 0.453592 },
    "TON": { "LB": 2000, "LBS": 2000, "KG": 907.185 }
};

const countryMap = {
    "australia": "AU", "au": "AU", "aud": "AU",
    "united states": "US", "us": "US", "usa": "US", "america": "US",
    "canada": "CA", "ca": "CA",
    "united kingdom": "GB", "gb": "GB", "uk": "GB", "england": "GB",
    "germany": "DE", "de": "DE", "deutschland": "DE",
    "france": "FR", "fr": "FR", "singapore": "SG", "sg": "SG",
    "new zealand": "NZ", "nz": "NZ", "mexico": "MX", "mx": "MX", "south africa": "ZA", "za": "ZA"
};

const RegionalLogisticsBases = {
    "US": { ocean: 3200, handling: 450 }, "AU": { ocean: 2100, handling: 380 },
    "CA": { ocean: 3400, handling: 420 }, "GB": { ocean: 2800, handling: 390 },
    "DE": { ocean: 2900, handling: 400 }, "FR": { ocean: 2950, handling: 410 },
    "SG": { ocean: 1600, handling: 300 }, "NZ": { ocean: 2300, handling: 390 },
    "MX": { ocean: 3100, handling: 440 }, "ZA": { ocean: 2700, handling: 380 }
};

let activeLocationDescription = "Not Verified";

document.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    attachEventListeners();
    automateUOMRatioLookup();
});

function populateDropdowns() {
    const currencyDropdowns = document.querySelectorAll('.currency-dropdown');
    const uomDropdowns = document.querySelectorAll('.uom-dropdown');

    currencyDropdowns.forEach(dropdown => {
        TradeCurrencies.forEach(curr => {
            const opt = document.createElement('option');
            opt.value = curr.code;
            opt.textContent = ${curr.code} - ${curr.name};
            if(dropdown.id === 'source-currency' && curr.code === 'USD') opt.selected = true;
            if(dropdown.id === 'target-currency' && curr.code === 'AUD') opt.selected = true;
            dropdown.appendChild(opt);
        });
    });

    uomDropdowns.forEach(dropdown => {
        TradeUOMs.forEach(uom => {
            const opt = document.createElement('option');
            opt.value = uom.code;
            opt.textContent = ${uom.code} [${uom.desc}];
            if(dropdown.id === 'source-uom' && uom.code === 'CRT') opt.selected = true;
            if(dropdown.id === 'target-uom' && uom.code === 'PC') opt.selected = true;
            dropdown.appendChild(opt);
        });
    });
    syncLabels();
}

function attachEventListeners() {
    document.getElementById('incoterm').addEventListener('change', handleIncotermSwitch);
    document.getElementById('dest-zip').addEventListener('blur', fetchInlandLogisticsEstimates);

    document.getElementById('country-destination').addEventListener('blur', () => {
        fetchInlandLogisticsEstimates();
        fetchCustomsAndFTARates();
        evaluateBaselineFreightSchedules();
    });

    document.getElementById('hs-code').addEventListener('blur', fetchCustomsAndFTARates);
    document.getElementById('country-origin').addEventListener('blur', fetchCustomsAndFTARates);
    document.getElementById('container-spec').addEventListener('change', evaluateBaselineFreightSchedules);

    document.getElementById('source-currency').addEventListener('change', syncLabels);
    document.getElementById('source-uom').addEventListener('change', () => { syncLabels(); automateUOMRatioLookup(); });
    document.getElementById('target-uom').addEventListener('change', () => { syncLabels(); automateUOMRatioLookup(); });

    document.getElementById('calculate-btn').addEventListener('click', processLandedCosts);
    document.getElementById('clear-matrix-btn').addEventListener('click', clearMasterMatrixData);
    document.getElementById('reset-form-btn').addEventListener('click', resetCurrentInputFormOnly);

    // Pop-Up Window Event Listeners
    document.getElementById('close-modal-btn').addEventListener('click', closeBreakdownModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('breakdown-modal');
        if (e.target === modal) closeBreakdownModal();
    });
}

function syncLabels() {
    const srcCurr = document.getElementById('source-currency').value;
    const srcUom = document.getElementById('source-uom').value;
    const tgtUom = document.getElementById('target-uom').value;

    document.querySelectorAll('.lbl-src-curr-symbol').forEach(el => el.textContent = (${srcCurr}));
    document.querySelectorAll('.lbl-src-uom').forEach(el => el.textContent = (${srcUom}));
    document.querySelectorAll('.lbl-tgt-uom').forEach(el => el.textContent = (${tgtUom}));
}

function automateUOMRatioLookup() {
    const srcUom = document.getElementById('source-uom').value;
    const tgtUom = document.getElementById('target-uom').value;
    const ratioInput = document.getElementById('uom-ratio');
    const statusNote = document.getElementById('ratio-status-note');

    if (srcUom === tgtUom) {
        ratioInput.value = "1";
        statusNote.textContent = "(Identity Match: 1:1)";
        return;
    }
    if (GlobalUOMConversions[srcUom] && GlobalUOMConversions[srcUom][tgtUom] !== undefined) {
        ratioInput.value = GlobalUOMConversions[srcUom][tgtUom];
        statusNote.textContent = "(Automated lookup)";
        return;
    }
    if (GlobalUOMConversions[tgtUom] && GlobalUOMConversions[tgtUom][srcUom] !== undefined) {
        ratioInput.value = parseFloat((1 / GlobalUOMConversions[tgtUom][srcUom]).toFixed(5));
        statusNote.textContent = "(Automated Inverse calc)";
        return;
    }
    ratioInput.value = "1";
    statusNote.textContent = "(Unknown configuration)";
}

function handleIncotermSwitch(e) {
    const portBox = document.getElementById('port-fields-box');
    const freightWrapper = document.getElementById('freight-inputs-wrapper');
    const oceanStatusNote = document.getElementById('ocean-status-note');
    const value = e.target.value;

    if (value === 'FOB' || value === 'EXW') {
        portBox.classList.remove('hidden');
        freightWrapper.classList.remove('hidden');
        oceanStatusNote.textContent = "(Auto-estimated port-to-port)";
        evaluateBaselineFreightSchedules();
    } else if (value === 'CFR') {
        portBox.classList.add('hidden');
        freightWrapper.classList.add('hidden');
        document.getElementById('ocean-freight').value = 0;
        oceanStatusNote.textContent = "(Bundled inside Invoiced base)";
    }
}

function resolveCountryISO(inputString) {
    const clean = inputString.trim().toLowerCase();
    if (!clean) return "US";
    if (countryMap[clean]) return countryMap[clean];
    return clean.substring(0, 2).toUpperCase();
}

async function evaluateBaselineFreightSchedules() {
    if (document.getElementById('incoterm').value === 'CFR') return;
    const countryISO = resolveCountryISO(document.getElementById('country-destination').value);
    const containerSpec = document.getElementById('container-spec').value;
    const oceanFreightInput = document.getElementById('ocean-freight');
    const handlingInput = document.getElementById('handling-fee');
    const oceanStatusNote = document.getElementById('ocean-status-note');

    oceanStatusNote.textContent = "(Querying Freight Indices API...)";
    try {
        await fetch(https://open.er-api.com/v6/latest/USD);
        let profile = RegionalLogisticsBases[countryISO] || { ocean: 2600, handling: 360 };
        let baseOcean = profile.ocean;
        let baseHandling = profile.handling;

        if (containerSpec === '40FT') { baseOcean *= 1.45; baseHandling *...