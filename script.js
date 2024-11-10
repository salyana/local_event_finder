const map = L.map('map', {
    zoom: 12,
    center: [33.73, 73.08],
});

// Tile layer options
const tileLayers = {
    "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
    }),
    "Satellite": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; OpenStreetMap contributors'
    }),
    "Dark Mode": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; CartoDB'
    }),
};
tileLayers["OpenStreetMap"].addTo(map); // Default tile layer

// Toggle between tile layers
L.control.layers(tileLayers).addTo(map);

const fetchEvents = async () => {
    const url = './events.json';
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Response Status: ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error(`Error message: ${error.message}`);
        return null;
    }
};

// Create a marker cluster group
const markersCluster = L.markerClusterGroup();

const addMarkersAndPopups = (events) => {
    events.forEach((event) => {
        const marker = L.marker(event.location);
        
        const popupContent = `<h4>${event.name}</h4><p> On: ${event.date}</p> 
                              <p>At: ${event.time}</p><p>${event.description}</p>`;
        
        marker.bindPopup(popupContent);
        marker.on('mouseover', function () {
            this.openPopup();
        });
        marker.on('mouseout', function () {
            this.closePopup();
        });

        markersCluster.addLayer(marker); // Add each marker to the cluster group
    });
};

// Dropdown elements for category selection
const dropdownButton = document.querySelector('.dropdown-button');
const dropdownContent = document.querySelector('.dropdown-content');

// Toggle dropdown visibility
dropdownButton.addEventListener('click', () => {
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});

// Close dropdown on clicking outside
document.addEventListener('click', (event) => {
    if (!dropdownButton.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdownContent.style.display = 'none';
    }
});

// Close dropdown on mouse leave
dropdownContent.addEventListener('mouseleave', () => {
    dropdownContent.style.display = 'none';
});

// Fetch events and set up category filtering
fetchEvents()
    .then((events) => {
        if (events) {
            addMarkersAndPopups(events);
            map.addLayer(markersCluster); // Add cluster layer to the map

            // Listen for clicks on dropdown items
            dropdownContent.addEventListener('click', (e) => {
                if (e.target.tagName === 'P') {
                    markersCluster.clearLayers(); // Clear existing markers in cluster
                    const selectedCategory = e.target.dataset.category;
                    const filteredEvents = selectedCategory === 'all'
                        ? events
                        : events.filter(event => event.category === selectedCategory);

                    addMarkersAndPopups(filteredEvents);
                }
            });
        }
    })
    .catch(error => console.error(`Error fetching the events: ${error.message}`));