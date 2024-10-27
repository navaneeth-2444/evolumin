const azureMapsKey = 'DRLiFA8AsiDNIqZGMudUROls9EmTi5P46QPeEvYix3tDmm9bMW6nJQQJ99AJACYeBjFh5ej6AAAgAZMP4WLh';

const azureMap = new atlas.Map('map', {
    center: [77.2090, 28.6139],
    style: "dark", 
    zoom: 12,
    authOptions: {
        authType: 'subscriptionKey',
        subscriptionKey: azureMapsKey
    }
});

const styleMap = new atlas.control.StyleControl({
    mapStyles: ["grayscale_light", "road", "high_contrast_dark", "satellite", "grayscale_dark", "night"]
});

azureMap.controls.add(styleMap, {
    position: 'top-right'
});

let activeMarkers = [];
let userLocation = null;
let currentRouteLayer = null;

// Get DOM elements
const searchInput = document.getElementById('searchInput');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const sidebar = document.getElementById('sidebar');

navigator.geolocation.getCurrentPosition(
    (position) => {
        userLocation = [position.coords.longitude, position.coords.latitude];
        azureMap.setCamera({ center: userLocation, zoom: 12 });
        addCurrentLocationMarker(userLocation);
        searchHospitals(userLocation[1], userLocation[0]);
    },
    (error) => {
        console.error("Error obtaining location:", error);
        showError("Unable to fetch current location.");
    }
);

function addCurrentLocationMarker(location) {
    const marker = new atlas.HtmlMarker({
        position: location,
        color: 'Red',
        text: 'Me'
    });
    azureMap.markers.add(marker);
}

// Add event listener for Enter key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
    }
});

async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        resetUI();
        azureMap.setCamera({ center: userLocation, zoom: 12 });
        searchHospitals(userLocation[1], userLocation[0]);

        if (currentRouteLayer) {
            azureMap.layers.remove(currentRouteLayer);
            currentRouteLayer = null;
        }
        
        return;
    }

    resetUI();

    try {
        const geocodeResponse = await fetch(`https://atlas.microsoft.com/search/address/json?api-version=1.0&query=${encodeURIComponent(query)}&subscription-key=${azureMapsKey}`);
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].position;
            azureMap.setCamera({ center: [location.lon, location.lat], zoom: 12 });
            searchHospitals(location.lat, location.lon);
        } else {
            showError('Location not found. Please try another search.');
        }
    } catch (error) {
        showError('An error occurred. Please try again.');
        console.error('Search error:', error);
    }
}

async function searchHospitals(lat, lon) {
    const radius = 10000; // 10km radius
    const url = `https://atlas.microsoft.com/search/poi/category/json?api-version=1.0&query=hospital&lat=${lat}&lon=${lon}&radius=${radius}&subscription-key=${azureMapsKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            displayHospitals(data.results);
        } else {
            showError('No hospitals found in this area.');
        }
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        showError('An error occurred while fetching hospitals.');
    }
}

function displayHospitals(hospitals) {
    sidebar.style.display = 'block';
    sidebar.innerHTML = '<h2 style="padding: 15px;">Nearby Hospitals</h2>';
    clearMarkers();

    hospitals.forEach(hospital => {
        const position = [hospital.position.lon, hospital.position.lat];

        const hospitalCard = document.createElement('div');
        hospitalCard.className = 'hospital-card';
        hospitalCard.innerHTML = `
            <div class="hospital-name">${hospital.poi.name}</div>
            <div class="hospital-address">${hospital.address.freeformAddress}</div>
            <div class="eta-info">Loading ETA...</div>
        `;
        sidebar.appendChild(hospitalCard);

        const marker = new atlas.HtmlMarker({
            position: position,
            color: 'DodgerBlue',
            text: 'H'
        });
        azureMap.markers.add(marker);

        hospitalCard.addEventListener('click', async () => {
            azureMap.setCamera({ center: position, zoom: 15 });
            await showRouteToHospital(position);
            const eta = await getETA(position);
            hospitalCard.querySelector('.eta-info').textContent = eta;
        });

        activeMarkers.push(marker);
    });

    loading.style.display = 'none';
}

function clearMarkers() {
    activeMarkers.forEach(marker => azureMap.markers.remove(marker));
    activeMarkers = [];
}

function resetUI() {
    errorMessage.style.display = 'none';
    sidebar.style.display = 'none';
    loading.style.display = 'block';
    clearMarkers();
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    loading.style.display = 'none';
    sidebar.style.display = 'none';
}

async function showRouteToHospital(hospitalLocation) {
    if (currentRouteLayer) {
        azureMap.layers.remove(currentRouteLayer);
        currentRouteLayer = null;
    }

    const url = `https://atlas.microsoft.com/route/directions/json?api-version=1.0&subscription-key=${azureMapsKey}&query=${userLocation[1]},${userLocation[0]}:${hospitalLocation[1]},${hospitalLocation[0]}`;
    const response = await fetch(url);
    const routeData = await response.json();

    if (routeData.routes && routeData.routes.length > 0) {
        const routeLine = new atlas.data.LineString(routeData.routes[0].legs[0].points.map(point => [point.longitude, point.latitude]));
        const dataSource = new atlas.source.DataSource();
        dataSource.add(routeLine);
        azureMap.sources.add(dataSource);

        currentRouteLayer = new atlas.layer.LineLayer(dataSource, null, {
            strokeColor: 'blue',
            strokeWidth: 5
        });
        azureMap.layers.add(currentRouteLayer);
    }
}

async function getETA(hospitalLocation) {
    const response = await fetch(`https://atlas.microsoft.com/route/directions/json?api-version=1.0&query=${userLocation[1]},${userLocation[0]}:${hospitalLocation[1]},${hospitalLocation[0]}&subscription-key=${azureMapsKey}`);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
        const eta = data.routes[0].summary.travelTimeInSeconds / 60;
        return `ETA: ${Math.round(eta)} mins`;
    }
    return "ETA unavailable";
}

// Add map controls
azureMap.controls.add(new atlas.control.ZoomControl(), { position: 'top-right' });