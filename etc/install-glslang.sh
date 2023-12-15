#!/bin/bash

# Quick & simple installer for GLSLang tool
# This tool is needed for the GLSL Lint extension for VSCode
# NOTE: This assumes you have ~/.local/bin folder in your PATH

echo "Quick & simple installer for GLSLang tool..."

echo "Downloading release from GitHub"
wget https://github.com/KhronosGroup/glslang/releases/download/main-tot/glslang-main-linux-Release.zip -qO /tmp/glslang.zip

echo "Unzipping and placing in ~/.local/bin"
unzip /tmp/glslang.zip -d /tmp/glslang > /dev/null
mkdir -p ~/.local/bin
cp -r /tmp/glslang/bin/* ~/.local/bin/
mv ~/.local/bin/glslang ~/.local/bin/glslangValidator
rm -rf /tmp/glslang*

echo "GLSLang tool installed successfully into $(which glslangValidator)"
