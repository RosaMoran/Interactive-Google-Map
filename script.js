let map, markers = [];

// Define markers data
const locations = [
    { name: "Amsterdam Cafe", lat: 52.38419, lng: 4.86842, country: "Netherlands", category: "Restaurant" },
    { name: "Amsterdam Fine Dining", lat: 52.38023, lng: 4.89194, country: "Netherlands", category: "Restaurant" },
    { name: "Strandhotel Vigilante Makkum", lat: 53.05152, lng: 5.37997, country: "Netherlands", category: "Hotel" },
    { name: "Anne Frank Huis", lat: 52.37523, lng: 4.88387, country: "Netherlands", category: "Museum" },
    { name: "Restaurant Maximilians Berlin", lat: 52.51141, lng: 13.38926, country: "Germany", category: "Restaurant" },
    { name: "Hotel Berlin Gendarmenmarkt", lat: 52.51098, lng: 13.39156, country: "Germany", category: "Hotel" },
    { name: "German Spy Museum", lat: 52.50893, lng: 13.37931, country: "Germany", category: "Museum" },
    { name: "Pizza Florida", lat: 41.89485, lng: 12.47674, country: "Italy", category: "Restaurant" },
    { name: "Museo Ferrari", lat: 44.52975, lng: 10.86150, country: "Italy", category: "Museum" },
    { name: "Otivm Hotel", lat: 41.89502, lng: 12.48030, country: "Italy", category: "Hotel" },
    { name: "La Taberna Sanlúcar", lat: 40.41483, lng: -3.70804, country: "Spain", category: "Restaurant" },
    { name: "Hotel Diaa Plus", lat: 40.36636, lng: -3.65418, country: "Spain", category: "Hotel" },
    { name: "Casa-Museu Salvador Dalí", lat: 42.29312, lng: 3.28617, country: "Spain", category: "Museum" },
    { name: "Glacis Beisl", lat: 48.20315, lng: 16.35714, country: "Austria", category: "Restaurant" },
    { name: "Geboortehuis van Mozart", lat: 47.80012, lng: 13.04354, country: "Austria", category: "Museum" },
    { name: "MONDI Hotel am Grundlsee", lat: 47.61959, lng: 13.82778, country: "Austria", category: "Hotel" },
    { name: "Takumi Ramen Kitchen", lat: 51.22112, lng: 4.40094, country: "Belgium", category: "Restaurant" },
    { name: "Koninklijk Museum van het Leger en de Krijgsgeschiedenis", lat: 50.84082, lng: 4.39336, country: "Belgium", category: "Museum" },
    { name: "Hotel Derby", lat: 50.83941, lng: 4.39984, country: "Belgium", category: "Hotel" },
    { name: "El Pulgarcito", lat: 50.83712, lng: 4.39926, country: "Belgium", category: "Restaurant" }
];

let geocoder;  // Google Maps Geocoder
let marker;    // For showing the user-selected location
let infoWindow; // InfoWindow for displaying location details

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.1657, lng: 10.4515 },
        zoom: 4,
    });

    geocoder = new google.maps.Geocoder();
    infoWindow = new google.maps.InfoWindow();  // Initialize the InfoWindow
    setupMarkers();
    setupFilters();
}

// Setup markers from locations
function setupMarkers() {
    markers = locations.map((location) => {
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.name,
        });
        marker.locationData = location;

        // Add click event to each marker
        marker.addListener("click", () => {
            showInfoWindow(marker);
        });

        return marker;
    });
}

// Show InfoWindow with location details when a marker is clicked
function showInfoWindow(marker) {
    const locationData = marker.locationData;
    
    // Content for the InfoWindow (this can be customized further)
    const contentString = `
        <div id="infowindow">
            <h3>${locationData.name}</h3>
            <p><strong>Category:</strong> ${locationData.category}</p>
            <p><strong>Country:</strong> ${locationData.country}</p>
        </div>
    `;
    
    // Set the content and position of the InfoWindow, then open it
    infoWindow.setContent(contentString);
    infoWindow.open(map, marker);  // Open InfoWindow above the clicked marker
}

function setupFilters() {
    const countryFilter = document.getElementById("country-filter");
    const locationSearch = document.getElementById("location-search");
    const categoryFilter = document.getElementById("category-filter");
    const resetButton = document.getElementById("reset-button");

    // Initialize Google Autocomplete on the location search input
    const autocomplete = new google.maps.places.Autocomplete(locationSearch);
    autocomplete.setFields(["address_components", "geometry", "name"]);

    // Listen for place changes
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            // Zoom in and center the map to the selected place
            map.setCenter(place.geometry.location);
            map.setZoom(14); // adjust zoom to fit the selected place
            filterMarkers("location");
        }
    });

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

// Filter markers based on search and filters
function filterMarkers(type) {
    let filteredMarkers = markers;
    const locationSearch = document.getElementById("location-search").value.toLowerCase();
    const countryFilter = document.getElementById("country-filter").value;
    const categoryFilter = document.getElementById("category-filter").value;

    // First filter: location search (if applicable)
    if (type === "location" && locationSearch) {
        filteredMarkers = filteredMarkers.filter(
            marker => marker.locationData.name.toLowerCase().includes(locationSearch) ||
                      marker.locationData.country.toLowerCase().includes(locationSearch) ||
                      marker.locationData.category.toLowerCase().includes(locationSearch)
        );

        // If no match found in the predefined locations, try geocoding
        if (filteredMarkers.length === 0) {
            geocodeLocation(locationSearch); // Geocode user input if no markers match
        }
    }

    // Second filter: country (if selected)
    if (countryFilter) {
        filteredMarkers = filteredMarkers.filter(marker => marker.locationData.country === countryFilter);
    }

    // Third filter: category (if selected)
    if (categoryFilter) {
        filteredMarkers = filteredMarkers.filter(marker => marker.locationData.category === categoryFilter);
    }

    // Set map bounds based on filtered markers
    setMapBounds(filteredMarkers);

    // Optional: animate markers
    animateMarkers(filteredMarkers);
}

// Handle geocoding for user input that is not in predefined locations
function geocodeLocation(userInput) {
    if (userInput) {
        geocoder.geocode({ 'address': userInput }, function(results, status) {
            if (status === 'OK') {
                // Zoom the map to the location
                map.setCenter(results[0].geometry.location);
                map.setZoom(14);
                // Optionally, add a marker for the user-inputted location
                if (!marker) {
                    marker = new google.maps.Marker({
                        map: map
                    });
                }
                marker.setPosition(results[0].geometry.location);
                marker.setMap(map);
                
                // Create and open an InfoWindow for the user-selected location
                const contentString = `
                    <div>
                        <h3>${userInput}</h3>
                        <p><strong>Location:</strong> ${results[0].formatted_address}</p>
                    </div>
                `;
                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }
}

// Set the map bounds based on the filtered markers
function setMapBounds(filteredMarkers) {
    const bounds = new google.maps.LatLngBounds();
    filteredMarkers.forEach(marker => bounds.extend(marker.getPosition()));
    map.fitBounds(bounds);

    // Optional: prevent zooming too much
    const zoomLevel = map.getZoom();
    if (zoomLevel > 16) {
        map.setZoom(16);
    }
}

// Animate markers (if needed)
function animateMarkers(filteredMarkers) {
    filteredMarkers.forEach(marker => marker.setAnimation(google.maps.Animation.BOUNCE));
    setTimeout(() => filteredMarkers.forEach(marker => marker.setAnimation(null)), 1400);
}

// Reset all filters
function resetFilters() {
    document.getElementById("location-search").value = '';
    document.getElementById("country-filter").selectedIndex = 0;
    document.getElementById("category-filter").selectedIndex = 0;
    setMapBounds(markers);
    animateMarkers(markers);
}

window.onload = initMap;
