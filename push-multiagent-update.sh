#!/bin/bash

# Set Node.js version
echo "Setting Node.js version..."
nvm use 23 || { echo "Failed to set Node.js version. Make sure nvm is installed."; exit 1; }

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
git add src/demo-multiagent.ts
git add run-multiagent-demo.sh
git add docs/multiagent-system.md
git add docs/multiagent-user-guide.md
git add docs/multiagent-api-reference.md
git add CHANGELOG-MULTIAGENT.md
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
- Comprehensive documentation
- Updated README with multi-agent system details"

  # Push the changes
  echo "Pushing changes to remote repository..."
  git push origin $(git branch --show-current)
  
  echo "Multi-agent system update has been pushed successfully!"
else
  echo "Commit cancelled."
fi 