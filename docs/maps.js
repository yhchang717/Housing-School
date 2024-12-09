const chicago = [41.84, -87.74];
const initialZoom = 11;

const map1 = L.map("map-goes-here-1").setView(chicago, initialZoom);
const map2 = L.map("map-goes-here-2").setView(chicago, initialZoom);

// OSM bright layer
const osmbURL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?key=48ca86c8-eae0-4b72-9fbd-1898be6aeebc';
L.tileLayer(osmbURL, {
  maxZoom: 14,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
}).addTo(map1);

L.tileLayer(osmbURL, {
  maxZoom: 14,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
}).addTo(map2);

// Load GeoJSON
const geojsonFile = "./community_areas.geojson";

// Set the bin
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


// Define choropleth layers(Use layerGroup for removing layer while selecting)
const layerGroup1 = L.layerGroup().addTo(map1);
const layerGroup2 = L.layerGroup().addTo(map2);

function addChoropleth(map, layerGroup, property, getColorFn) {
fetch(geojsonFile)
  .then(response => response.json())
  .then(data => {
    layerGroup.clearLayers()
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
    })
    layerGroup.addLayer(currentLayer);
  }).catch((error) => console.error("Error loading GeoJSON:", error));
}

// Legend
function createLegend(map, getColorFn, grades) {
  if (map.legend) {
    map.removeControl(map.legend); // Remove the current legend
  }

  const legend = L.control({ position: "bottomleft" });
  
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    // console.log("Legend div created:", div);
    let labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
      labels.push(
        `<i style="background:${getColorFn(grades[i] + 1)}"></i> ${
          grades[i]
        }${grades[i + 1] ? "&ndash;" + grades[i + 1] : "+"}`
      );
    }
    // console.log(labels)
    div.innerHTML = labels.join("<br>");
    return div;
  };
legend.addTo(map);
map.legend = legend;
}

document.getElementById("map-selector-1").addEventListener("change", e => {
  const selected = e.target.value;
  if (selected === "population") {
    addChoropleth(map1, layerGroup1, "population", getColorPopulation);
    createLegend(map1, getColorPopulation, [0, 10000, 20000, 30000, 50000]);
  } else if (selected === "housing") {
    addChoropleth(map1, layerGroup1, "median_sale_price", getColorHousing);
    createLegend(map1, getColorHousing, [0, 150000, 250000, 350000, 500000]);
  } else if (selected === "percentile") {
    addChoropleth(map1, layerGroup1, "percentile", getColorPercentile);
    createLegend(map1, getColorPercentile, [0, 60, 70, 80, 90]);
  }
});

document.getElementById("map-selector-2").addEventListener("change", e => {
  const selected = e.target.value;
  if (selected === "population") {
    addChoropleth(map2, layerGroup2, "population", getColorPopulation);
    createLegend(map2, getColorPopulation, [0, 10000, 20000, 30000, 50000]);
  } else if (selected === "housing") {
    addChoropleth(map2, layerGroup2, "median_sale_price", getColorHousing);
    createLegend(map2, getColorHousing, [0, 150000, 250000, 350000, 500000]);
  } else if (selected === "percentile") {
    addChoropleth(map2, layerGroup2, "percentile", getColorPercentile);
    createLegend(map2, getColorPercentile, [0, 60, 70, 80, 90]);
  }
});

function loadGraphs(areaName) {
    // Update the charts container with the selected area's name
    document.getElementById("charts-container").innerHTML = `
      <h2 class="title is-4">${areaName}</h2>
      <div class=charts-wrapper>
        <div class="side-by-side">
          <h2 class="title is-6">Race and Ethnicity</h2>
          <div id="pie-chart" style="height: 300px;"></div>
        </div>
        <div class="side-by-side">
          <h2 class="title is-6">Median Sale Prices by Time</h2>
            <div id="line-chart" style="height: 300px;"></div>
        </div>
      </div>
    `;
  
    // Call D3 functions to render the charts
    renderPieChart(areaName);
    renderLineChart(areaName);
  }


// Initialize with the default map
addChoropleth(map1, layerGroup1, "population", getColorPopulation);
createLegend(map1, getColorPopulation, [0, 10000, 20000, 30000, 50000]);
addChoropleth(map2, layerGroup2, "population", getColorPopulation);
createLegend(map2, getColorPopulation, [0, 10000, 20000, 30000, 50000]);
