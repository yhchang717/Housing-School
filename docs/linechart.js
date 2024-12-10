function renderLineChart(areaName) {
  console.log(`Rendering line chart for area: ${areaName}`);

  // Load the data from the CSV file
  d3.csv("./housing_price.csv", (d) => ({
    name: d.name,
    year: +d.year,
    median_sale_price: +d.median_sale_price,
  }))
    .then((data) => {
      // Filter the data for the selected area
      const areaData = data.filter((d) => d.name === areaName);

      // Set dimensions
      const margin = { top: 20, right: 50, bottom: 30, left: 70 };
      const width = 500;
      const height = 300;

      // Clear any existing chart
      const chartContainer = d3.select("#line-chart");
      chartContainer.selectAll("*").remove();
      // console.log("Cleared existing chart");

      // Create the SVG container
      const svg = chartContainer
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      // console.log("Created SVG container");

      // Set up the scales
      const x = d3
        .scaleLinear()
        .domain(d3.extent(areaData, (d) => d.year))
        .range([0, width]);
      // console.log("X scale domain:", x.domain());

      const y = d3
        .scaleLinear()
        .domain([0, 800000]) // Every area use the same scale
        .nice()
        .range([height, 0]);
      // console.log("Y scale domain:", y.domain());

      // Add x-axis
      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
      // console.log("Added X axis");

      // Add y-axis
      svg.append("g").call(d3.axisLeft(y));
      // console.log("Added Y axis");

      // Declare the line generator
      const line = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.median_sale_price));

      // Add the line
      svg
        .append("path")
        .datum(areaData) // Bind data
        .attr("fill", "none")
        .attr("stroke", "#b30000")
        .attr("stroke-width", 1.5)
        .attr("d", line);

      // Add variable titles
      svg
        .append("text")
        .text("Year")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .attr("x", (width + margin.left - margin.right) / 2)
        .attr("text-anchor", "middle")
        .attr("y", height + 30);

      svg
        .append("text")
        .text("Median Sale Price($)")
        .attr("x", -(height - margin.bottom) / 2)
        .attr("y", -margin.left + 10)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "11px")
        .style("font-weight", "bold");
    })
    .catch((error) => {
      console.error("Error loading or processing the data:", error);
    });
}
