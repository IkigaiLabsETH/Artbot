#!/bin/bash

# Set Node.js version
echo "Setting Node.js version..."
nvm use 23 || { echo "Failed to set Node.js version. Make sure nvm is installed."; exit 1; }

# Build the project to ensure everything is up-to-date
echo "Building project..."
npm run build || { echo "Build failed. Please fix the errors before running performance monitoring."; exit 1; }

# Create output directory if it doesn't exist
mkdir -p performance-results

# Set timestamp for this run
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="performance-results/${TIMESTAMP}"
mkdir -p "$RESULTS_DIR"

# Run the performance monitoring script
echo "Starting performance monitoring..."
./monitor-multiagent-performance.js

# Check if performance results were generated
if [ -f "performance-results.json" ]; then
  # Move results to timestamped directory
  mv performance-results.json "$RESULTS_DIR/"
  mv performance-log.txt "$RESULTS_DIR/"
  
  echo "Performance monitoring completed. Results saved to $RESULTS_DIR/"
  
  # Generate HTML report
  echo "Generating HTML report..."
  cat > "$RESULTS_DIR/report.html" << EOL
<!DOCTYPE html>
<html>
<head>
  <title>Multi-Agent System Performance Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    h1, h2, h3 { color: #333; }
    .container { max-width: 1200px; margin: 0 auto; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .chart { width: 100%; height: 400px; margin: 20px 0; border: 1px solid #ddd; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .metric { font-weight: bold; }
    .value { color: #0066cc; }
    .error { color: #cc0000; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <h1>Multi-Agent System Performance Report</h1>
    <p>Generated on <span id="timestamp"></span></p>
    
    <div class="summary" id="summary">
      <h2>Summary</h2>
      <p>Loading summary data...</p>
    </div>
    
    <h2>Memory Usage</h2>
    <div class="chart">
      <canvas id="memoryChart"></canvas>
    </div>
    
    <h2>CPU Usage</h2>
    <div class="chart">
      <canvas id="cpuChart"></canvas>
    </div>
    
    <h2>Workflow Stage Timings</h2>
    <div id="stageTimings">
      <p>Loading stage timing data...</p>
    </div>
    
    <h2>Agent Activations</h2>
    <div id="agentActivations">
      <p>Loading agent activation data...</p>
    </div>
    
    <h2>Errors</h2>
    <div id="errors">
      <p>Loading error data...</p>
    </div>
  </div>
  
  <script>
    // Load the performance data
    fetch('performance-results.json')
      .then(response => response.json())
      .then(data => {
        // Update timestamp
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        
        // Populate summary
        const summary = data.summary;
        let summaryHTML = '<h2>Summary</h2>';
        summaryHTML += '<table>';
        summaryHTML += '<tr><td class="metric">Duration:</td><td class="value">' + summary.duration.toFixed(2) + ' seconds</td></tr>';
        summaryHTML += '<tr><td class="metric">Messages:</td><td class="value">' + summary.messageCount + ' (' + summary.messagesPerSecond.toFixed(2) + '/sec)</td></tr>';
        summaryHTML += '<tr><td class="metric">Avg Memory:</td><td class="value">' + summary.avgMemoryUsageMB.toFixed(2) + ' MB</td></tr>';
        summaryHTML += '<tr><td class="metric">Peak Memory:</td><td class="value">' + summary.peakMemoryUsageMB.toFixed(2) + ' MB</td></tr>';
        summaryHTML += '<tr><td class="metric">Avg CPU:</td><td class="value">' + summary.avgCpuPercent.toFixed(2) + '%</td></tr>';
        summaryHTML += '<tr><td class="metric">Errors:</td><td class="value">' + summary.errorCount + '</td></tr>';
        summaryHTML += '</table>';
        
        summaryHTML += '<h3>System Info</h3>';
        summaryHTML += '<table>';
        summaryHTML += '<tr><td class="metric">Platform:</td><td>' + data.systemInfo.platform + '</td></tr>';
        summaryHTML += '<tr><td class="metric">Release:</td><td>' + data.systemInfo.release + '</td></tr>';
        summaryHTML += '<tr><td class="metric">CPUs:</td><td>' + data.systemInfo.cpus + '</td></tr>';
        summaryHTML += '<tr><td class="metric">Total Memory:</td><td>' + data.systemInfo.totalMemoryMB + ' MB</td></tr>';
        summaryHTML += '</table>';
        
        summaryHTML += '<h3>Test Project</h3>';
        summaryHTML += '<pre>' + JSON.stringify(data.testProject, null, 2) + '</pre>';
        
        document.getElementById('summary').innerHTML = summaryHTML;
        
        // Memory usage chart
        const memoryData = data.rawMetrics.memoryUsage;
        const memoryLabels = memoryData.map((sample, index) => index);
        const memoryValues = memoryData.map(sample => sample.heapUsed);
        
        new Chart(document.getElementById('memoryChart'), {
          type: 'line',
          data: {
            labels: memoryLabels,
            datasets: [{
              label: 'Heap Used (MB)',
              data: memoryValues,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Memory (MB)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Sample'
                }
              }
            }
          }
        });
        
        // CPU usage chart
        const cpuData = data.rawMetrics.cpuUsage;
        const cpuLabels = cpuData.map((sample, index) => index);
        const cpuValues = cpuData.map(sample => sample.percent);
        
        new Chart(document.getElementById('cpuChart'), {
          type: 'line',
          data: {
            labels: cpuLabels,
            datasets: [{
              label: 'CPU Usage (%)',
              data: cpuValues,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'CPU (%)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Sample'
                }
              }
            }
          }
        });
        
        // Stage timings
        let stageHTML = '<table>';
        stageHTML += '<tr><th>Stage</th><th>Duration (sec)</th></tr>';
        
        for (const [stage, timing] of Object.entries(summary.stageTimings)) {
          if (timing.duration) {
            stageHTML += '<tr><td>' + stage + '</td><td>' + (timing.duration / 1000).toFixed(2) + '</td></tr>';
          }
        }
        
        stageHTML += '</table>';
        document.getElementById('stageTimings').innerHTML = stageHTML;
        
        // Agent activations
        let agentHTML = '<table>';
        agentHTML += '<tr><th>Agent</th><th>Activations</th></tr>';
        
        for (const [agent, count] of Object.entries(summary.agentActivations)) {
          agentHTML += '<tr><td>' + agent + '</td><td>' + count + '</td></tr>';
        }
        
        agentHTML += '</table>';
        document.getElementById('agentActivations').innerHTML = agentHTML;
        
        // Errors
        let errorsHTML = '';
        if (data.rawMetrics.errors.length === 0) {
          errorsHTML = '<p>No errors recorded during the test.</p>';
        } else {
          errorsHTML = '<table>';
          errorsHTML += '<tr><th>Timestamp</th><th>Message</th><th>Error</th></tr>';
          
          for (const error of data.rawMetrics.errors) {
            errorsHTML += '<tr><td>' + error.timestamp + '</td><td>' + error.message + '</td><td class="error">' + error.error + '</td></tr>';
          }
          
          errorsHTML += '</table>';
        }
        
        document.getElementById('errors').innerHTML = errorsHTML;
      })
      .catch(error => {
        console.error('Error loading performance data:', error);
        document.getElementById('summary').innerHTML = '<h2>Summary</h2><p class="error">Error loading performance data: ' + error.message + '</p>';
      });
  </script>
</body>
</html>
EOL

  echo "HTML report generated at $RESULTS_DIR/report.html"
  
  # Open the report if on macOS
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$RESULTS_DIR/report.html"
  fi
else
  echo "Error: Performance results not found."
  exit 1
fi 