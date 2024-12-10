// Function to render the pie chart
function renderPieChart(areaName) {
  // Load the data from the CSV file
  d3.csv("./population_lower.csv").then((data) => {
    // Filter the data for the selected area
    const areaData = data.find((d) => d.name === areaName);
    if (!areaData) {
      console.error(`No data found for area: ${areaName}`);
      return;
    }
    // Extract race composition from the area data
    const races = [
      { label: "White", value: +areaData.white },
      { label: "Hispanic or Latino", value: +areaData["Hispanic or Latino"] },
      { label: "Black", value: +areaData.Black },
      { label: "Asian", value: +areaData.Asian },
      { label: "Other", value: +areaData.Other },
    ];
    // Set dimensions and radius
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // Clear any existing chart
    d3.select("#pie-chart").selectAll("*").remove();

    // Create the SVG container
    const svg = d3
      .select("#pie-chart")
      .append("svg")
      .attr("width", width + 100)
      .attr("height", height + 100)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create the pie and arc generators
    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Create the color scale
    const color = d3
      .scaleOrdinal()
      .domain(["White", "Hispanic or Latino", "Black", "Asian", "Other"])
      .range(["#93a1a1", "#a58fa5", "#656565", "#d0a585", "#f7e09c"]);

    // Bind data and create the pie chart
    svg
      .selectAll("path")
      .data(pie(races))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    // Add labels to the chart
    const legend = d3
      .select("#pie-chart svg")
      .append("g")
      .attr("transform", `translate(300, 200)`);

    legend
      .selectAll("rect")
      .data(races)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20) // Position each legend item vertically
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d) => color(d.label));

    legend
      .selectAll("text")
      .data(races)
      .enter()
      .append("text")
      .attr("x", 20) // Position text to the right of the legend box
      .attr("y", (d, i) => i * 20 + 10) // Align vertically with the box
      .text((d) => d.label)
      .style("font-size", "12px")
      .style("font-family", "Arial")
      .style("alignment-baseline", "middle");
  });
}
