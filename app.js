let appsList = [];   // array of apps for display/paging
let appsMap = {};    // map by app name for quick lookup
let arrowsData = {};  // Store arrow data (Shared, Collected, Both)
let dataTypes = {};  // To hold data types (Personal Info, Calendar, Audio)
let dataSafety = {}; // Combined shared/collected info per app per datatype
let currentPage = 0;  // Keeps track of the current page (set of apps displayed)

// CHANGED: 6 apps per page instead of 5
const appsPerPage = 6;

// Helper: normalize names for matching (remove punctuation, convert & -> and)
function normalizeName(s = '') {
    return s.toString().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
}

// Load Apps Data (from Apps-icons.json)
function loadAppsData() {
    fetch('data/Apps-icons.json')
        .then(response => response.json())
        .then(data => {
            appsMap = data || {};
            // Build array for paging/display
            appsList = Object.keys(appsMap).map(name => ({ name, icon: appsMap[name].icon }));
            displayAppList();
        })
        .catch(error => console.error('Error loading apps data:', error));
}

// Load Arrows Data (from Arrows.json)
function loadArrowsData() {
    fetch('data/Arrows.json')
        .then(response => response.json())
        .then(data => {
            arrowsData = data || {};
        })
        .catch(error => console.error('Error loading arrows data:', error));
}

// Load Data Types (from datatype.json)
function loadDataTypes() {
    fetch('data/datatype.json')
        .then(response => response.json())
        .then(data => {
            dataTypes = data || {};
        })
        .catch(error => console.error('Error loading data types:', error));
}

// Load Data Safety Details (from CSV - Shared and Collected)
function loadDataSafetyDetails() {
    // parse shared
    Papa.parse('data/Shared_Mapped (1).csv', {
        download: true,
        header: true,
        dynamicTyping: false,
        complete: function(results) {
            processCSV(results.data, 'shared');
        },
        error: function(err) { console.error('Error parsing shared CSV', err); }
    });

    // parse collected
    Papa.parse('data/Collected_Mapped (1).csv', {
        download: true,
        header: true,
        dynamicTyping: false,
        complete: function(results) {
            processCSV(results.data, 'collected');
        },
        error: function(err) { console.error('Error parsing collected CSV', err); }
    });
}

// Process CSV rows into dataSafety map
function processCSV(rows, type) {
    rows.forEach(row => {
        const appName = (row['Applications'] || row['App Name'] || '').toString().trim();
        if (!appName) return;
        
        // Try to find matching app in appsMap using normalized names
        let matchedAppName = appName;
        const normalizedCSVName = normalizeName(appName);
        
        // Search through appsMap to find a matching app by normalized name
        for (const key in appsMap) {
            if (normalizeName(key) === normalizedCSVName) {
                matchedAppName = key;
                break;
            }
        }
        
        if (!dataSafety[matchedAppName]) dataSafety[matchedAppName] = {};

        Object.keys(row).forEach(col => {
            if (col === 'Applications' || col === 'App Name') return;
            const val = row[col];
            const dtypeRaw = col.toString().trim();
            if (!dtypeRaw) return;

            if (!dataSafety[matchedAppName][dtypeRaw]) {
                dataSafety[matchedAppName][dtypeRaw] = { shared: false, collected: false };
            }
            const yes = (val === 'Y' || val === 'y' || val === true);
            if (type === 'shared' && yes) dataSafety[matchedAppName][dtypeRaw].shared = true;
            if (type === 'collected' && yes) dataSafety[matchedAppName][dtypeRaw].collected = true;
        });
    });
}

// Display App List (Icons) - now shows 6 apps centered
function displayAppList() {
    const appListContainer = document.getElementById('app-list');
    appListContainer.innerHTML = '';  // Clear previous app icons

    // Get the subset of apps to display for the current page
    const startIndex = currentPage * appsPerPage;
    const endIndex = startIndex + appsPerPage;
    const appsToDisplay = appsList.slice(startIndex, endIndex);

    // Loop through the apps to display them
    appsToDisplay.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.classList.add('app');
        appDiv.onclick = function () {
            showAppDetails(app.name);  // Show data safety modal when app is clicked
        };

        const appIcon = document.createElement('img');
        appIcon.src = app.icon;  // Set the app's icon from JSON
        appIcon.alt = app.name;

        const appLabel = document.createElement('p');
        appLabel.innerText = app.name;

        appDiv.appendChild(appIcon);
        appDiv.appendChild(appLabel);

        appListContainer.appendChild(appDiv);  // Add the app to the list
    });
}

// helper: attempt to find the best matching key from datatype.json
function matchDataTypeKey(dtypeRaw, typeLookup) {
    const raw = (dtypeRaw || '').toString().trim();
    if (!raw) return null;

    const norm = normalizeName(raw);

    // direct match
    if (typeLookup[norm]) return typeLookup[norm];

    // try adding 'data' suffix (e.g., "location" -> "locationdata")
    if (typeLookup[norm + 'data']) return typeLookup[norm + 'data'];

    // try removing trailing 'data' (e.g., "locationdata" -> "location")
    if (norm.endsWith('data')) {
        const noData = norm.replace(/data$/, '');
        if (typeLookup[noData]) return typeLookup[noData];
    }

    // try replacing 'or' with 'and' (e.g., "deviceorotherids" -> "deviceandotherids")
    const andVariant = normalizeName(raw.replace(/\bor\b/gi, 'and'));
    if (typeLookup[andVariant]) return typeLookup[andVariant];

    // try removing 'other' or 'otherids'
    const noOther = norm.replace(/other/g, '').replace(/ids$/, 'ids');
    if (typeLookup[noOther]) return typeLookup[noOther];

    // try lightweight fuzzy fallback: check each datatype key if it contains the main token
    const token = norm.replace(/data|ids|device|other|and|or/g, '');
    if (token) {
        for (const k in typeLookup) {
            if (k.includes(token) && typeLookup[k]) return typeLookup[k];
        }
    }

    return null;
}

// Build table rows for datatypes and arrows
function buildDataSafetyTableForApp(appName) {
    const details = dataSafety[appName] || {};
    // Build a lookup map for datatype.json normalized keys
    const typeLookup = {};
    Object.keys(dataTypes).forEach(k => {
        typeLookup[normalizeName(k)] = k;
    });

    // Collect rows only for datatypes which are shared or collected
    const rows = [];
    Object.keys(details).forEach(dtypeRaw => {
        const entry = details[dtypeRaw];
        if (!entry) return;
        const shared = !!entry.shared;
        const collected = !!entry.collected;
        if (!shared && !collected) return; // skip types with no Y

        // find matching datatype.json key using the matcher
        const matchedKey = matchDataTypeKey(dtypeRaw, typeLookup);
        let icon = '';
        let displayName = dtypeRaw;
        if (matchedKey) {
            icon = dataTypes[matchedKey].icon || '';
            displayName = dataTypes[matchedKey].name || matchedKey;
        } else {
            // fallback keep raw header as display name
        }

        // choose arrow icon(s)
        let arrowHtml = '';
        if (shared && collected) {
            if (arrowsData.Both && arrowsData.Both.icon) {
                arrowHtml = `<img class="arrow" src="${arrowsData.Both.icon}" alt="Both" />`;
            } else {
                if (arrowsData.Shared && arrowsData.Shared.icon) arrowHtml += `<img class="arrow" src="${arrowsData.Shared.icon}" alt="Shared" />`;
                if (arrowsData.Collected && arrowsData.Collected.icon) arrowHtml += `<img class="arrow" src="${arrowsData.Collected.icon}" alt="Collected" />`;
            }
        } else if (shared) {
            if (arrowsData.Shared && arrowsData.Shared.icon) arrowHtml = `<img class="arrow" src="${arrowsData.Shared.icon}" alt="Shared" />`;
        } else if (collected) {
            if (arrowsData.Collected && arrowsData.Collected.icon) arrowHtml = `<img class="arrow" src="${arrowsData.Collected.icon}" alt="Collected" />`;
        }

        rows.push({ icon, displayName, arrowHtml });
    });

    if (rows.length === 0) return '<div class="no-details">No data safety details available for this app.</div>';

    // build compact table HTML (uses CSS classes in Style.css)
    let table = `<table class="data-table">`;
    table += `<thead><tr><th>Data type</th><th></th></tr></thead><tbody>`;
    rows.forEach(r => {
        const dtIconHtml = r.icon ? `<img src="${r.icon}" alt="${r.displayName}" />` : '';
        table += `<tr>`;
        table += `<td><div class="data-type-cell">${dtIconHtml}<div>${r.displayName}</div></div></td>`;
        table += `<td class="direction-cell">${r.arrowHtml}</td>`;
        table += `</tr>`;
    });
    table += `</tbody></table>`;
    return table;
}

// Show Data Safety Details in the Modal
function showAppDetails(appName) {
    const dssModal = document.getElementById('dss-modal');
    const appData = appsMap[appName] || {};
    const appIcon = appData.icon || '';

    // Set up the modal content - keep modal header area compact and use modal-header class
    document.getElementById('dss-app-name').innerText = appName;
    document.getElementById('dss-app-icon').src = appIcon;  // Set the app icon

    const detailsHtml = buildDataSafetyTableForApp(appName);
    document.getElementById('data-safety-details').innerHTML = detailsHtml;

    dssModal.style.display = 'flex';  // Show the modal
}

// Close the DSS Modal
function closeDSSModal() {
    const dssModal = document.getElementById('dss-modal');
    dssModal.style.display = 'none';  // Close the modal
}

// Previous App Button
function prevApp() {
    const totalPages = Math.ceil(appsList.length / appsPerPage) || 1;
    currentPage = (currentPage - 1 + totalPages) % totalPages;
    displayAppList();
}

// Next App Button (Cycle Through Apps)
function nextApp() {
    const totalPages = Math.ceil(appsList.length / appsPerPage) || 1;
    currentPage = (currentPage + 1) % totalPages;
    displayAppList();  // Show the next page of apps
}

// Initialize the page by loading all necessary data
window.onload = function () {
    loadAppsData();  // Load app data
    loadArrowsData(); // Load arrow data
    loadDataTypes();  // Load data types
    loadDataSafetyDetails(); // Load shared and collected data from CSV

    // close modal when clicking outside content
    window.addEventListener('click', function(e) {
        const dssModal = document.getElementById('dss-modal');
        if (e.target === dssModal) closeDSSModal();
    });
};
