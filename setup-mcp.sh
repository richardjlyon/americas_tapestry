#!/bin/bash
# Setup script for MCP configuration based on platform

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Setting up MCP for macOS..."
    cp .mcp.json.macos .mcp.json

    # Create Serena wrapper if it doesn't exist
    if [ ! -f ~/.claude/serena-mcp-wrapper.sh ]; then
        mkdir -p ~/.claude
        cat > ~/.claude/serena-mcp-wrapper.sh << 'EOF'
#!/usr/bin/env bash
# Wrapper script for Serena MCP server that Claude Code can execute

# Source the user's shell profile to get PATH with uvx
if [ -f ~/.zshrc ]; then
    source ~/.zshrc
fi

# Explicitly add common tool paths
export PATH="/Users/$USER/.local/bin:$PATH"
export PATH="/Users/$USER/.local/share/mise/shims:$PATH"
export PATH="/Users/$USER/.local/share/mise/installs/uv/0.4.22/bin:$PATH"

# Run Serena MCP server
exec uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
EOF
        chmod +x ~/.claude/serena-mcp-wrapper.sh
    fi

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Setting up MCP for Linux..."
    cp .mcp.json.linux .mcp.json

    # Create Serena wrapper if it doesn't exist
    if [ ! -f ~/.claude/serena-mcp-wrapper.sh ]; then
        mkdir -p ~/.claude
        cat > ~/.claude/serena-mcp-wrapper.sh << 'EOF'
#!/usr/bin/env bash
# Wrapper script for Serena MCP server that Claude Code can execute

# Source the user's shell profile to get PATH with uvx
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
elif [ -f ~/.zshrc ]; then
    source ~/.zshrc
fi

# Explicitly add common tool paths
export PATH="/home/$USER/.local/bin:$PATH"

# Run Serena MCP server
exec uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
EOF
        chmod +x ~/.claude/serena-mcp-wrapper.sh
    fi

else
    echo "Unsupported platform: $OSTYPE"
    exit 1
fi

echo "MCP configuration setup complete for $OSTYPE"
echo "Restart Claude Code to load the new configuration"