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
    { name: "Geboortehuis van Mozart", lat: 47.80012, lng: 13.04354, country: "Austria", category: "Museum" },
    { name: "Takumi Ramen Kitchen", lat: 51.22112, lng: 4.40094, country: "Belgium", category: "Restaurant" },
    {name: "El Pulgarcito", lat: 50.83712, lng: 4.39926, country: "Belgium", category: "Restaurant" }
];


function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.1657, lng: 10.4515 },
        zoom: 4,
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

    // Initialize Google Autocomplete on the location search input
    const autocomplete = new google.maps.places.Autocomplete(locationSearch);
    autocomplete.setFields(["addres_components", "geometry"])

    // Listen for place changes
    autocomplete.addListener("place_changed"), ()=> {
        const place = autocomplete.getPlace();
        if (place.geometry){
            map.setCenter(place.geometry.location);
            map.setZoom(14); // adjust zoom to fit the selected place
            filterMarkers("location");
        }
    }

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
            marker => marker.locationData.name.toLowerCase().includes(locationSearch) || 
                      marker.locationData.country.toLowerCase().includes(locationSearch) || 
                      marker.locationData.category.toLowerCase().includes(locationSearch)
        );
    }
    if (countryFilter) {
        filteredMarkers = filteredMarkers.filter(marker => marker.locationData.country === countryFilter);
    }
    if (categoryFilter) {
        filteredMarkers = filteredMarkers.filter(marker => marker.locationData.category === categoryFilter);
    }

    setMapBounds(filteredMarkers); // Adjust map zoom and bounds based on the filtered markers
    animateMarkers(filteredMarkers);
}



function setMapBounds(markers) {
    const bounds = new google.maps.LatLngBounds();
    if(markers.length === 0)return; // do nothing if markers are avialable 


    markers.forEach(marker => bounds.extend(marker.getPosition()));
    map.fitBounds(bounds);

    const zoomLevel = map.getZoom();
    if (zoomLevel > 14 ){
        map.setZoom(14);
    }
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




window.onload = initMap;

