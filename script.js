// Define markers data
const locations = [
    { name: "Amsterdam Cafe", lat: 52.38419, lng: 4.86842, country: "Netherlands", category: "Restaurant" },
    { name: "Amsterdam Fine Dining", lat: 52.38023, lng: 4.89194, country: "Netherlands", category: "Restaurant" },
    { name: "Hotel Berlin Gendarmenmarkt", lat: 52.51098, lng: 13.39156, country: "Germany", category: "Hotel" },
    { name: "Hilton Berlin", lat: 52.51240, lng: 13.39279, country: "Germany", category: "Hotel" },
    { name: "Pizza Florida", lat: 41.89485, lng: 12.47674, country: "Italy", category: "Restaurant" },
    { name: "Otivm Hotel", lat: 41.89502, lng: 12.48030, country: "Italy", category: "Hotel" },
    { name: "La Taberna Sanlúcar", lat: 40.41483, lng: -3.70804, country: "Spain", category: "Restaurant" },
    { name: "Hotel Diaa Plus", lat: 40.36636, lng: -3.65418, country: "Spain", category: "Hotel" },
    { name: "Kunsthistorisches Museum Wien", lat: 48.20389, lng: 16.36177, country: "Austria", category: "Museum" },
    { name: "Geboortehuis van Mozart", lat: 47.80012, lng: 13.04354, country: "Austria", category: "Museum" }
];


function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.1657, lng: 10.4515 },
        zoom: 5,
    });
    setupMarkers();
    setupFilters();
}

function setupMarkers() {
    markers = locations.map((location) => {
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: 'blue', // Default color
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2
            }
        });
        marker.locationData = location;
        return marker;
    });
} 

function setupFilters() {
    const countryFilter = document.getElementById("country-filter");
    const locationSearch = document.getElementById("location-search");
    const categoryFilter = document.getElementById("category-filter");
    const resetButton = document.getElementById("reset-button");

    // Populate country filter
    const uniqueCountries = [...new Set(locations.map(loc => loc.country))];
    uniqueCountries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });

    // Event listeners for filters
    locationSearch.addEventListener("input", () => filterMarkers("location"));
    countryFilter.addEventListener("change", () => filterMarkers("country"));
    categoryFilter.addEventListener("change", () => filterMarkers("category"));
    resetButton.addEventListener("click", resetFilters);
}

function filterMarkers(type) {
    let filteredMarkers = markers;
    const locationSearch = document.getElementById("location-search").value.toLowerCase();
    const countryFilter = document.getElementById("country-filter").value;
    const categoryFilter = document.getElementById("category-filter").value;

    if (type === "location" && locationSearch) {
        filteredMarkers = filteredMarkers.filter(
            marker => marker.locationData.name.toLowerCase().includes(locationSearch) ||  marker.locationData.country.toLowerCase().includes(locationSearch) || marker.locationData.category.toLowerCase().includes(locationSearch)
        );
    }
    if (countryFilter) {
        filteredMarkers = filteredMarkers.filter(marker => marker.locationData.country === countryFilter);
    }
    if (categoryFilter) {
        filteredMarkers = filteredMarkers.filter(marker => marker.locationData.category === categoryFilter);
    }

    // Set random color for the filtered markers
    const randomColor = getRandomColor();
    filteredMarkers.forEach(marker => {
        marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: randomColor,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2
        });
    });

    setMapBounds(filteredMarkers);
    animateMarkers(filteredMarkers);
}

function setMapBounds(markers) {
    const bounds = new google.maps.LatLngBounds();
    markers.forEach(marker => bounds.extend(marker.getPosition()));
    map.fitBounds(bounds);
}





function animateMarkers(markers) {
    markers.forEach(marker => marker.setAnimation(google.maps.Animation.BOUNCE));
    setTimeout(() => markers.forEach(marker => marker.setAnimation(null)), 1400);
}

function resetFilters() {
    document.getElementById("location-search").value = "";
    document.getElementById("country-filter").selectedIndex = 0;
    document.getElementById("category-filter").selectedIndex = 0;
    setMapBounds(markers);
    animateMarkers(markers);
}

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// dark mode 

// Check if the user has a preference for dark mode
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Function to apply the appropriate theme
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

// Apply the theme based on the user's preference
if (mediaQuery.matches) {
    applyTheme(true); // User prefers dark mode
} else {
    applyTheme(false); // Default to light mode
}

// Add event listener for changes in the preference
mediaQuery.addEventListener('change', (event) => {
    applyTheme(event.matches); // Update theme based on the new preference
});

// Button to toggle dark mode
const toggleButton = document.getElementById("toggle-dark-mode");
toggleButton.addEventListener("click", () => {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    
    // Save the user's preference in local storage
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});

// Load the user's theme preference on page load
window.onload = () => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        applyTheme(true);
    } else {
        applyTheme(false);
    }
};


window.onload = initMap;

