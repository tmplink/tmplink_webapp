# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a frontend web application for TMP.LINK (钛盘), a temporary file sharing service. It's built with vanilla JavaScript using class-based architecture. The application uses a custom UI framework (tmpUI) for routing and component management.

## Commands
- No build system appears to be in place (no package.json, webpack, etc.)
- This is a static web application, so you can serve it with any static file server
- The primary development workflow appears to involve direct file editing

## Code Style Guidelines
- Classes: Use ES6 class syntax with properties defined at the top of the class
- Methods: camelCase naming convention
- Documentation: JSDoc style with comments (/**...*/) for functions and methods
- Naming: Use camelCase for variables and functions, PascalCase for classes
- Strings: Single quotes for strings ('string')
- Indentation: 4 spaces 
- Error handling: Try/catch blocks with descriptive error messages
- Language support: The app is multilingual with language files in JSON format

## Structure
- `js/core/`: Core classes and functionality
- `js/init/`: Initialization scripts for different pages
- `js/tools/`: Utility functions and third-party libraries
- `tpl/`: HTML templates
- `css/`: Stylesheet files
- `img/`: Image assets
- `plugin/`: Third-party libraries and plugins

## Version Control
- Version numbers are maintained in both HTML files and the service worker
- When updating, ensure version numbers are synchronized across files