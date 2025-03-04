#!/bin/bash

# Set Node.js version if nvm is available
echo "Setting Node.js version..."
if command -v nvm &> /dev/null; then
  nvm use 23 || { echo "Failed to set Node.js version."; exit 1; }
else
  echo "nvm not found, using system Node.js version: $(node -v)"
fi

# Ensure the docs directory exists
mkdir -p docs

# Check for uncommitted changes
echo "Checking for uncommitted changes..."
if [[ $(git status --porcelain) ]]; then
  echo "Uncommitted changes found. Proceeding with update..."
else
  echo "No uncommitted changes found."
fi

# Build the project to ensure everything compiles
echo "Building project..."
npm run build || { echo "Build failed. Please fix the errors before pushing."; exit 1; }

# Run linting
echo "Running linter..."
npm run lint || { echo "Linting failed. Please fix the errors before pushing."; exit 1; }

# Stage the changes
echo "Staging changes..."
git add src/services/multiagent/
git add src/services/multiagent/README.md
git add src/demo-multiagent.ts
git add run-multiagent-demo.sh
git add test-multiagent.js
git add test-multiagent.sh
git add monitor-multiagent-performance.js
git add monitor-multiagent-performance.sh
git add validate-multiagent-system.sh
git add docs/multiagent-system.md
git add docs/multiagent-user-guide.md
git add docs/multiagent-api-reference.md
git add docs/multiagent-test-plan.md
git add docs/multiagent-implementation-summary.md
git add CHANGELOG-MULTIAGENT.md
git add MULTIAGENT-IMPLEMENTATION-COMPLETE.md
git add package.json
git add README.md

# Show the staged changes
echo "The following changes will be committed:"
git diff --cached --stat

# Confirm before committing
read -p "Do you want to commit these changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Commit the changes
  echo "Committing changes..."
  git commit -m "Add multi-agent system for collaborative art creation" -m "This update includes:
- Multi-agent system core framework
- Specialized agent roles (Director, Ideator, Stylist, Refiner, Critic)
- Collaborative workflow for art creation
- Demo script and execution tools
- Test scripts for validation
- Performance monitoring tools
- System validation tools
- Comprehensive documentation and test plan
- Implementation summary
- Updated README with multi-agent system details"

  # Push the changes
  echo "Pushing changes to remote repository..."
  git push origin $(git branch --show-current)
  
  echo "Multi-agent system update has been pushed successfully!"
else
  echo "Commit cancelled."
fi 