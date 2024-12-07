const chicago = [41.84, -87.74];
const initialZoom = 11;

const map1 = L.map("map-goes-here-1").setView(chicago, initialZoom);
const map2 = L.map("map-goes-here-2").setView(chicago, initialZoom);

// OSM bright layer
const osmbURL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?key=48ca86c8-eae0-4b72-9fbd-1898be6aeebc';
L.tileLayer(osmbURL, {
  maxZoom: 20,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
}).addTo(map1);

L.tileLayer(osmbURL, {
  maxZoom: 20,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
}).addTo(map2);

// Load GeoJSON
const geojsonFile = "./community_areas.geojson";

const getColorPopulation = value => value > 50000 ? "#b30000" :
value > 30000 ? "#e34a33" : value > 20000 ? "#fc8d59" :
value > 10000 ? "#fdcc8a" : "#fef0d9";

const getColorHousing = value => value == null ? "#d3d3d3" : 
value > 500000 ? "#b30000" :
value > 350000 ? "#e34a33" : value > 250000 ? "#fc8d59" :
value > 150000 ? "#fdcc8a" : "#fef0d9";

const getColorPercentile = value => value == null ? "#d3d3d3" :
value > 90 ? "#b30000" :
value > 80 ? "#e34a33" : value > 70 ? "#fc8d59" :
value > 60 ? "#fdcc8a" : "#fef0d9";


// Define choropleth layers
let currentLayer1, currentLayer2;

function addChoropleth(map, currentLayer, property, getColorFn) {
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
        const percentile = feature.properties.percentile
         ? feature.properties.percentile.toFixed(2): "N/A";
        const population = new Intl.NumberFormat().format(feature.properties.population);
        console.log(feature.properties);

        // Add a popup with dynamic hyperlink
        const popupContent = `
          <strong>${name}</strong><br>
          Median Sale Price: ${salePrice}<br>
          NWEA growth percentile: ${percentile}<br>
          Population: ${population}<br>
        <a href="#charts-container" class="has-text-link" onclick="loadGraphs('${name}')">
      More about this area</a>
        `;
        layer.bindPopup(popupContent);
      },
    }).addTo(map);
  }).catch((error) => console.error("Error loading GeoJSON:", error));
}


document.getElementById("map-selector-1").addEventListener("change", e => {
  const selected = e.target.value;
  if (selected === "population") {
    addChoropleth(map1, currentLayer1, "population", getColorPopulation);
  } else if (selected === "housing") {
    addChoropleth(map1, currentLayer1, "median_sale_price", getColorHousing);
  } else if (selected === "percentile") {
    addChoropleth(map1, currentLayer1, "percentile", getColorPercentile);
  }
});

document.getElementById("map-selector-2").addEventListener("change", e => {
  const selected = e.target.value;
  if (selected === "population") {
    addChoropleth(map2, currentLayer2, "population", getColorPopulation);
  } else if (selected === "housing") {
    addChoropleth(map2, currentLayer2, "median_sale_price", getColorHousing);
  } else if (selected === "percentile") {
    addChoropleth(map2, currentLayer2, "percentile", getColorPercentile);
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
addChoropleth(map1, currentLayer1, "population", getColorPopulation);
addChoropleth(map2, currentLayer2, "population", getColorPopulation);
