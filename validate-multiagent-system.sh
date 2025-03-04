#!/bin/bash

# Set Node.js version
echo "Setting Node.js version..."
nvm use 23 || { echo "Failed to set Node.js version. Make sure nvm is installed."; exit 1; }

# Create output directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="validation-reports/${TIMESTAMP}"
mkdir -p "$REPORT_DIR"

# Initialize report file
REPORT_FILE="${REPORT_DIR}/validation-report.md"

echo "# Multi-Agent System Validation Report" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Generated on: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Function to append section to report
append_section() {
  echo "## $1" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "$2" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
}

# Function to run a command and capture output
run_and_capture() {
  local cmd="$1"
  local section="$2"
  local output_file="${REPORT_DIR}/$3"
  
  echo "Running: $cmd"
  echo "$ $cmd" > "$output_file"
  eval "$cmd" >> "$output_file" 2>&1
  local status=$?
  
  if [ $status -eq 0 ]; then
    append_section "$section" "✅ Passed\n\n\`\`\`\n$(cat $output_file)\n\`\`\`"
    return 0
  else
    append_section "$section" "❌ Failed (Exit code: $status)\n\n\`\`\`\n$(cat $output_file)\n\`\`\`"
    return 1
  fi
}

# Build the project
append_section "Build Status" "Building project to ensure all components compile correctly..."
run_and_capture "npm run build" "Build Result" "build-output.txt"
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
  append_section "Validation Summary" "❌ Validation failed at build stage. Please fix build errors before proceeding."
  echo "Validation report generated at $REPORT_FILE"
  exit 1
fi

# Run linting
append_section "Linting Status" "Running linter to ensure code quality..."
run_and_capture "npm run lint" "Linting Result" "lint-output.txt"
LINT_STATUS=$?

# Run tests
append_section "Unit Tests" "Running unit tests..."
run_and_capture "npm test" "Unit Test Results" "unit-test-output.txt"
TEST_STATUS=$?

# Run multi-agent tests
append_section "Multi-Agent System Tests" "Running multi-agent system tests..."
run_and_capture "npm run test:multiagent" "Multi-Agent Test Results" "multiagent-test-output.txt"
MULTIAGENT_TEST_STATUS=$?

# Run performance monitoring (with timeout to ensure it completes)
append_section "Performance Monitoring" "Running performance monitoring with a 2-minute timeout..."
run_and_capture "timeout 120s npm run monitor:performance" "Performance Results" "performance-output.txt"
PERFORMANCE_STATUS=$?

# Check file structure
append_section "File Structure Validation" "Checking for required files and directories..."

# Define expected files and directories
EXPECTED_FILES=(
  "src/services/multiagent/MultiAgentSystem.ts"
  "src/services/multiagent/BaseAgent.ts"
  "src/services/multiagent/agents/DirectorAgent.ts"
  "src/services/multiagent/agents/IdeatorAgent.ts"
  "src/services/multiagent/agents/StylistAgent.ts"
  "src/services/multiagent/agents/RefinerAgent.ts"
  "src/services/multiagent/agents/CriticAgent.ts"
  "src/demo-multiagent.ts"
  "run-multiagent-demo.sh"
  "test-multiagent.js"
  "test-multiagent.sh"
  "monitor-multiagent-performance.js"
  "monitor-multiagent-performance.sh"
  "docs/multiagent-system.md"
  "docs/multiagent-user-guide.md"
  "docs/multiagent-api-reference.md"
  "docs/multiagent-test-plan.md"
  "docs/multiagent-implementation-summary.md"
  "CHANGELOG-MULTIAGENT.md"
)

FILE_CHECK_OUTPUT="${REPORT_DIR}/file-check-output.txt"
echo "Checking for required files:" > "$FILE_CHECK_OUTPUT"
FILE_CHECK_STATUS=0

for file in "${EXPECTED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists" >> "$FILE_CHECK_OUTPUT"
  else
    echo "❌ $file is missing" >> "$FILE_CHECK_OUTPUT"
    FILE_CHECK_STATUS=1
  fi
done

if [ $FILE_CHECK_STATUS -eq 0 ]; then
  append_section "File Structure Check" "✅ All required files exist\n\n\`\`\`\n$(cat $FILE_CHECK_OUTPUT)\n\`\`\`"
else
  append_section "File Structure Check" "❌ Some required files are missing\n\n\`\`\`\n$(cat $FILE_CHECK_OUTPUT)\n\`\`\`"
fi

# Generate validation summary
OVERALL_STATUS=0
if [ $BUILD_STATUS -ne 0 ] || [ $LINT_STATUS -ne 0 ] || [ $TEST_STATUS -ne 0 ] || [ $MULTIAGENT_TEST_STATUS -ne 0 ] || [ $FILE_CHECK_STATUS -ne 0 ]; then
  OVERALL_STATUS=1
fi

if [ $OVERALL_STATUS -eq 0 ]; then
  SUMMARY="✅ **All validation checks passed!** The multi-agent system is ready for deployment."
else
  SUMMARY="❌ **Some validation checks failed.** Please review the report for details."
fi

append_section "Validation Summary" "$SUMMARY

| Check | Status |
|-------|--------|
| Build | $([ $BUILD_STATUS -eq 0 ] && echo "✅ Passed" || echo "❌ Failed") |
| Linting | $([ $LINT_STATUS -eq 0 ] && echo "✅ Passed" || echo "❌ Failed") |
| Unit Tests | $([ $TEST_STATUS -eq 0 ] && echo "✅ Passed" || echo "❌ Failed") |
| Multi-Agent Tests | $([ $MULTIAGENT_TEST_STATUS -eq 0 ] && echo "✅ Passed" || echo "❌ Failed") |
| Performance | $([ $PERFORMANCE_STATUS -eq 0 ] && echo "✅ Passed" || echo "❌ Failed") |
| File Structure | $([ $FILE_CHECK_STATUS -eq 0 ] && echo "✅ Passed" || echo "❌ Failed") |

## Next Steps

$([ $OVERALL_STATUS -eq 0 ] && echo "- Run \`./push-multiagent-update.sh\` to commit and push the changes
- Execute \`./run-multiagent-demo.sh\` to see the multi-agent system in action
- Review the documentation in the \`docs/\` directory for usage details" || echo "- Fix the issues identified in this report
- Run this validation script again to ensure all checks pass
- Review the error logs in the \`${REPORT_DIR}\` directory")
"

# Generate HTML version of the report
HTML_REPORT="${REPORT_DIR}/validation-report.html"
echo "Generating HTML report..."

cat > "$HTML_REPORT" << EOL
<!DOCTYPE html>
<html>
<head>
  <title>Multi-Agent System Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    h1, h2, h3 { color: #333; }
    .container { max-width: 1200px; margin: 0 auto; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    pre { background: #f8f8f8; padding: 10px; border-radius: 5px; overflow-x: auto; }
    code { font-family: monospace; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .pass { color: #4CAF50; }
    .fail { color: #F44336; }
  </style>
</head>
<body>
  <div class="container">
    $(cat "$REPORT_FILE" | sed 's/```/\<pre\>\<code\>/g' | sed 's/```/\<\/code\>\<\/pre\>/g' | sed 's/✅/<span class="pass">✅<\/span>/g' | sed 's/❌/<span class="fail">❌<\/span>/g')
  </div>
</body>
</html>
EOL

echo "Validation complete! Report generated at:"
echo "- Markdown: $REPORT_FILE"
echo "- HTML: $HTML_REPORT"

# Open the HTML report if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$HTML_REPORT"
fi

exit $OVERALL_STATUS 