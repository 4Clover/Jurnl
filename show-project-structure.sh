#!/bin/bash
# show-project-structure.sh - Comprehensive project structure viewer
# Run this from your project root to generate a shareable project overview

echo "🔍 ScribblyScraps Project Structure Analysis"
echo "==========================================="
echo "Generated: $(date)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from your project root (where package.json is)"
    exit 1
fi

echo "📁 PROJECT ROOT: $(pwd)"
echo ""

# Function to show tree with specific depth
show_tree() {
    local dir=$1
    local max_depth=$2
    local title=$3

    echo "### $title"
    echo '```'
    if command -v tree &> /dev/null; then
        tree -L $max_depth -I 'node_modules|.git|.svelte-kit|dist|build' $dir 2>/dev/null || echo "Directory not found: $dir"
    else
        # Fallback if tree is not installed
        find $dir -maxdepth $max_depth -type d 2>/dev/null | grep -v node_modules | sort | sed 's|[^/]*/|- |g' || echo "Directory not found: $dir"
    fi
    echo '```'
    echo ""
}

# Main source structure
echo "## 📂 SOURCE STRUCTURE"
echo ""
show_tree "src" 4 "src/ Directory"

# Routes detail
echo "## 🛣️ ROUTES DETAIL"
echo ""
show_tree "src/routes" 5 "Routes Structure"

# API routes specifically
echo "## 🌐 API ROUTES"
echo '```'
find src/routes/api -name "*.ts" -o -name "*.js" -o -name "*.svelte" 2>/dev/null | sort || echo "No API routes found"
echo '```'
echo ""

# Library structure
echo "## 📚 LIBRARY STRUCTURE"
echo ""
show_tree "src/lib" 4 "lib/ Directory"

# Database schemas
echo "## 🗄️ DATABASE SCHEMAS"
echo '```'
find src/lib/server/database/schemas -name "*.ts" -o -name "*.js" 2>/dev/null | sort || echo "No schemas found"
echo '```'
echo ""

# Important files check
echo "## 📋 KEY FILES CHECK"
echo ""
echo "| File | Status | Path |"
echo "|------|--------|------|"

# Function to check file
check_file() {
    local file=$1
    local description=$2
    if [ -f "$file" ]; then
        echo "| $description | ✅ Found | \`$file\` |"
    else
        echo "| $description | ❌ Missing | \`$file\` |"
    fi
}

# Check important files
check_file "package.json" "Package.json"
check_file "svelte.config.js" "Svelte Config"
check_file "vite.config.ts" "Vite Config"
check_file "tsconfig.json" "TypeScript Config"
check_file "docker-compose.yml" "Docker Compose"
check_file ".env" "Environment Variables"
check_file ".env.example" "Env Example"
check_file "src/app.html" "App HTML"
check_file "src/app.d.ts" "App Types"
check_file "src/hooks.server.ts" "Server Hooks"
check_file "src/hooks.client.ts" "Client Hooks"
echo ""

# Check for auth-related files
echo "## 🔐 AUTH FILES"
echo ""
echo '```'
find src -path "*/node_modules" -prune -o -name "*auth*" -type f -print 2>/dev/null | grep -v node_modules | sort
find src -path "*/node_modules" -prune -o -name "*login*" -type f -print 2>/dev/null | grep -v node_modules | sort
find src -path "*/node_modules" -prune -o -name "*session*" -type f -print 2>/dev/null | grep -v node_modules | sort
echo '```'
echo ""

# Component structure
echo "## 🎨 COMPONENTS"
echo '```'
find src/lib/components -name "*.svelte" 2>/dev/null | sort || echo "No components found in src/lib/components"
find src/routes -name "*.svelte" -path "*/components/*" 2>/dev/null | sort || echo "No route-specific components found"
echo '```'
echo ""

# Static assets
echo "## 🖼️ STATIC ASSETS"
echo '```'
ls -la static/ 2>/dev/null | grep -v "^total" || echo "No static directory found"
echo '```'
echo ""

# Package.json details
echo "## 📦 PACKAGE.JSON SUMMARY"
echo '```json'
if [ -f "package.json" ]; then
    cat package.json | jq '{name, version, type, scripts, dependencies: .dependencies | keys, devDependencies: .devDependencies | keys}' 2>/dev/null || cat package.json | grep -E '"(name|version|type)":'
fi
echo '```'
echo ""

# Environment variables (without values)
echo "## 🔑 ENVIRONMENT VARIABLES"
echo '```'
if [ -f ".env" ]; then
    cat .env | grep -E "^[A-Z]" | cut -d'=' -f1 | sort
else
    echo "No .env file found"
fi
echo '```'
echo ""

# Git status (optional)
if [ -d ".git" ]; then
    echo "## 📊 GIT STATUS"
    echo '```'
    git status --short 2>/dev/null | head -20
    if [ $(git status --short 2>/dev/null | wc -l) -gt 20 ]; then
        echo "... and $(( $(git status --short | wc -l) - 20 )) more files"
    fi
    echo '```'
    echo ""
fi

# Docker status
echo "## 🐳 DOCKER STATUS"
echo '```'
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -E "(NAMES|mongo|jurnl)" || echo "Docker not running or no containers found"
echo '```'
echo ""

# Recent errors from console
echo "## 🚨 RECENT ERRORS (if any)"
echo '```'
if [ -f "npm-debug.log" ]; then
    tail -20 npm-debug.log
elif [ -d ".svelte-kit" ]; then
    echo "No error logs found"
else
    echo "No error logs found"
fi
echo '```'
echo ""

# Summary
echo "## 📈 SUMMARY"
echo ""
echo "- Total Routes: $(find src/routes -name "+page.svelte" 2>/dev/null | wc -l)"
echo "- Total API Routes: $(find src/routes/api -name "+server.ts" 2>/dev/null | wc -l)"
echo "- Total Components: $(find src -name "*.svelte" 2>/dev/null | wc -l)"
echo "- Total TypeScript Files: $(find src -name "*.ts" 2>/dev/null | wc -l)"
echo "- Total Schemas: $(find src/lib/server/database/schemas -name "*.ts" 2>/dev/null | wc -l)"
echo ""

echo "## 💡 SHARING INSTRUCTIONS"
echo ""
echo "1. Copy all output above"
echo "2. Paste into your message"
echo "3. Or save to file: ./show-project-structure.sh > project-structure.md"
echo ""
echo "Generated by show-project-structure.sh"