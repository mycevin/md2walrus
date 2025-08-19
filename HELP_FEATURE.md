# Help Feature Documentation

## 🆕 New Feature: Help Page

A help button (❓ icon) has been added to the right side of the navigation bar. Clicking it opens a detailed help page that introduces all features and usage methods of MD2Walrus.

## 🎯 Help Page Content

### 1. Basic Features
- **Real-time Editing**: Supports real-time Markdown editing
- **Real-time Preview**: Real-time rendering of Markdown content
- **Syntax Highlighting**: Code block syntax highlighting
- **Table Support**: GitHub-style tables
- **Math Formulas**: LaTeX mathematical formula support
- **File Export**: Export Markdown files

### 2. Keyboard Shortcuts
- **Ctrl + B**: Bold text
- **Ctrl + I**: Italic text
- **Ctrl + K**: Insert link
- **Tab**: Indent (4 spaces)
- **Ctrl + S**: Save (reserved)

### 3. Toolbar Features
The help page详细介绍s all toolbar button functions, grouped by functionality:

#### View Toggle
- Edit Mode: Split-screen editing and preview
- Preview Mode: Full-screen preview

#### Text Formatting
- Bold, Italic, Strikethrough, Inline Code

#### Headings
- Heading 1, Heading 2, Heading 3

#### Lists & Quotes
- Unordered List, Ordered List, Quote

#### Media & Links
- Insert Link, Insert Image

#### Code & Tables
- Code Block, Insert Table, Horizontal Rule

#### Actions
- Copy Content, Export File

### 4. Markdown Syntax Support
Provides examples of common Markdown syntax:
- Heading syntax
- Text formatting
- Code syntax
- Links and images
- Mathematical formulas

## 🎨 Design Features

### User Experience
- **Modal Design**: Doesn't interfere with current editing work
- **Responsive Layout**: Adapts to different screen sizes
- **Smooth Animation**: Smooth open/close animations
- **Background Blur**: Click background to close

### Visual Design
- **Clear Classification**: Features grouped by category
- **Icon Assistance**: Each feature has a corresponding icon
- **Keyboard Styling**: Shortcuts displayed with keyboard styling
- **Code Examples**: Markdown syntax displayed in code blocks

### Interaction Design
- **Click to Close**: Click background or close button
- **ESC to Close**: Support for ESC key to close (expandable)
- **Scroll Support**: Scrollable content when too long

## 🔧 Technical Implementation

### Component Structure
```
HelpModal.tsx          # Help modal component
├── Modal Container
├── Header (Title + Close Button)
└── Content Area
    ├── Basic Features
    ├── Keyboard Shortcuts
    ├── Toolbar Features
    └── Markdown Syntax
```

### Style Features
- **CSS Grid**: Responsive grid layout
- **Flexbox**: Flexible layout control
- **CSS Variables**: Unified color theme
- **Media Queries**: Mobile adaptation

### State Management
- **React State**: Use useState to manage modal open/close state
- **Props Passing**: Pass callback functions through props
- **Event Handling**: Click events and keyboard event handling

## 📱 Responsive Design

### Desktop
- Maximum width 800px
- Grid layout for features
- Complete toolbar description

### Mobile
- Width 95%, height 95vh
- Single column layout
- Simplified feature display

## 🚀 Usage

1. **Open Help**: Click the ❓ icon on the right side of the navigation bar
2. **Browse Content**: Scroll to view various feature descriptions
3. **Close Help**: Click background or close button

## 🎯 Feature Highlights

1. **Comprehensive Introduction**: Covers all application features
2. **Visual Friendly**: Clear icons and layout
3. **Practical**: Includes specific shortcuts and syntax examples
4. **Easy to Maintain**: Modular component design
5. **User Friendly**: Intuitive operation

This help feature provides users with a complete application usage guide, especially suitable for new users to get started quickly, and also convenient for experienced users to look up specific feature usage methods.
