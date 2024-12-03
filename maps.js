const chicago = [41.84, -87.6298];
const initialZoom = 11;

const map = L.map("map-goes-here").setView(chicago, initialZoom);

// OSM bright layer
const osmbURL = 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png?key=48ca86c8-eae0-4b72-9fbd-1898be6aeebc';
L.tileLayer(osmbURL, {
  maxZoom: 20,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
}).addTo(map);

// Load GeoJSON
const geojsonFile = "./community_areas.geojson";

const getColorPopulation = value => value > 50000 ? "#b30000" :
value > 30000 ? "#e34a33" : value > 20000 ? "#fc8d59" :
value > 10000 ? "#fdcc8a" : "#fef0d9";

const getColorHousing = value => value == null ? "#d3d3d3" : 
value > 500000 ? "#b30000" :
value > 350000 ? "#e34a33" : value > 250000 ? "#fc8d59" :
value > 150000 ? "#fdcc8a" : "#fef0d9";

const getColorGraduation = value => value == null ? "#d3d3d3" :
value > 90 ? "#b30000" :
value > 80 ? "#e34a33" : value > 70 ? "#fc8d59" :
value > 60 ? "#fdcc8a" : "#fef0d9";


// Define choropleth layers
let currentLayer;

function addChoropleth(property, getColorFn) {
if (currentLayer) {
  map.removeLayer(currentLayer); // Remove the current layer
}
fetch(geojsonFile)
  .then(response => response.json())
  .then(data => {
    currentLayer = L.geoJSON(data, {
      style: feature => ({
        fillColor: getColorFn(feature.properties[property]),
        weight: 1,
        opacity: 1,
        color: "white",
        dashArray: '3',
        fillOpacity: 0.7,
      }),
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name;
        const salePrice = feature.properties.median_sale_price 
         ? `$${(Number(feature.properties.median_sale_price) / 1000).toFixed(0)}k`
        : "N/A";
        const graduationRate = feature.properties.graduation_rate
         ? feature.properties.graduation_rate.toFixed(2): "N/A";
         const population = new Intl.NumberFormat().format(feature.properties.population);


        // Add a popup with dynamic hyperlink
        const popupContent = `
          <strong>${name}</strong><br>
          Median Sale Price: ${salePrice}<br>
          Graduation Rate: ${graduationRate}%<br>
          Population: ${population}<br>
        <a href="#charts-container" class="has-text-link" onclick="loadGraphs('${name}')">
      More about this area</a>
        `;
        layer.bindPopup(popupContent);
        // console.log(feature.properties);
      },
    }).addTo(map);
  }).catch((error) => console.error("Error loading GeoJSON:", error));
}


document.getElementById("map-selector").addEventListener("change", e => {
  const selected = e.target.value;
  if (selected === "population") {
    addChoropleth("population", getColorPopulation);
  } else if (selected === "housing") {
    addChoropleth("median_sale_price", getColorHousing);
  } else if (selected === "graduation") {
    addChoropleth("graduation_rate", getColorGraduation);
  }
});

function loadGraphs(areaName) {
    // Update the charts container with the selected area's name
    document.getElementById("charts-container").innerHTML = `
      <h2 class="title is-4">${areaName}</h2>
      <h2 class="title is-6">Race and Ethnicity</h2>
      <div id="pie-chart" style="height: 300px;"></div>
    `;
  
    // Call D3 functions to render the charts
    renderPieChart(areaName);
  }


// Initialize with the default map
addChoropleth("population", getColorPopulation);
