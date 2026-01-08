# Your Apps - Data Safety Tracker

An interactive web application that displays data safety information for mobile applications. Visualize which data types each app collects, shares, or both based on comprehensive data mappings.

## 🎯 Features

### Core Functionality
- **App Grid Display**: Browse 6 app icons per page with intuitive pagination
- **Interactive Modals**: Click any app icon to view detailed data safety information
- **Smart Data Indicators**: Visual arrows showing data flow directions
- **Data Type Icons**: Icon representations for 15+ data categories
- **Real-time CSV Parsing**: Dynamic data loading from CSV files
- **Responsive Design**: Optimized for desktop and mobile viewing

### Visual Effects
- **Animated Header Text**: Dynamic glowing effect that circles around the subtitle
- **Smooth Transitions**: Hover effects on app icons and interactive elements
- **Color-Coded Arrows**:
  - 🟢 **Green Arrow (Left)** = Data is Collected
  - 🔴 **Red Arrow (Right)** = Data is Shared
  - ↔️ **Both Arrows** = Data is both Shared and Collected

## 📋 Data Categories

The application tracks 15 data types:
1. Personal Info
2. Money & Payment Info
3. App Operational Overview
4. Location Data
5. Health & Fitness
6. Photos & Videos
7. Sound & Music
8. Messages
9. User Activity Patterns
10. Device Info
11. Contacts & Calendar
12. Belief & Identity
13. Files & Docs
14. Things Users Create
15. Miscellaneous Info

## 🏗️ Project Structure

```
Project root/
├── Index.html                      # Main HTML file
├── Style.css                       # Styling and animations
├── app.js                          # Core application logic
├── README.md                       # This file
├── data/
│   ├── Apps-icons.json            # App metadata and icons
│   ├── Shared_Mapped (1).csv      # Data shared by apps
│   ├── Collected_Mapped (1).csv   # Data collected by apps
│   ├── datatype.json              # Data type definitions
│   └── Arrows.json                # Arrow icon definitions
└── Assets/
    ├── App-icons/                 # Individual app icon images
    ├── data-type-icons/           # Data type category icons
    └── Arrows/                    # Direction arrow images
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for CSV parsing via CORS)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Your-Apps-Data-Safety.git
   cd "Your Apps - Data Safety"
   ```

2. **Start a Local Server**

   **Option A: Python**
   ```bash
   python -m http.server 8000
   ```

   **Option B: Node.js (http-server)**
   ```bash
   npm install -g http-server
   http-server
   ```

   **Option C: VS Code Live Server**
   - Install the Live Server extension
   - Right-click `Index.html` → "Open with Live Server"

3. **Open in Browser**
   ```
   http://localhost:8000
   http://127.0.0.1:5500  (Live Server)
   ```

## 📱 How to Use

1. **Browse Apps**: View 6 apps per page with pagination buttons
2. **Navigate**: Click "← Previous" or "Next →" to view more apps
3. **View Details**: Click any app icon to open the data safety modal
4. **Check Data Types**: See which data types are collected/shared with visual indicators
5. **Close Modal**: Click the × button or outside the modal to close

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with keyframe animations
- **JavaScript (Vanilla)**: No frameworks, pure JS logic
- **PapaParse**: CSV file parsing library
- **Local Storage**: Session-based data caching

## 📊 Data Flow

```
CSV Files
    ↓
PapaParse (CSV Parsing)
    ↓
Normalized Name Matching
    ↓
dataSafety Object (App → Data Types)
    ↓
Build HTML Table with Icons & Arrows
    ↓
Display in Modal
```

### Key Logic: Name Normalization

The application uses intelligent name matching to handle character encoding differences (like different em-dash variants):

```javascript
// Removes special characters and normalizes to lowercase
normalizeName("Discord – Talk, Play, Hang Out") 
→ "discordtalkplayhangout"
```

This ensures apps in CSV files match those in Apps-icons.json even with character encoding variations.

## 🎨 Customization

### Change Header Animation
Edit the `roamingGlow` keyframes in `Style.css`:
```css
@keyframes roamingGlow {
    /* Modify text-shadow values to change glow color/intensity */
}
```

### Add New Data Types
1. Add entry to `datatype.json`
2. Add new column to CSV files
3. Update column headers to match exactly

### Modify App Grid
In `Style.css`, adjust `.apps` properties:
```css
.apps {
    gap: 20px;        /* Space between icons */
    max-width: 1400px; /* Container width */
}
```

In `app.js`, change `appsPerPage`:
```javascript
const appsPerPage = 6; // Change this number
```

## 🔧 Development

### File Descriptions

**Index.html**
- Page structure and DOM elements
- Includes PapaParse library via CDN
- Modal and app list containers

**app.js**
- Loads JSON files and CSV data
- Processes and normalizes app names
- Builds HTML table for modal display
- Handles pagination and modal interactions

**Style.css**
- Responsive grid layout
- Modal styling and positioning
- Animations and visual effects
- Color scheme and typography

## 📈 Data Sources

### Apps-icons.json Format
```json
{
  "App Full Name": {
    "icon": "Assets/App-icons/filename.png",
    "name": "app display name"
  }
}
```

### CSV Format
```
Applications,Personal info,Money & payment info,...
Discord,Y,N,Y,...
Instagram,Y,Y,Y,...
```

## 🐛 Known Issues & Troubleshooting

| Issue | Solution |
|-------|----------|
| "No data safety details available" | Check CSV file names match code paths |
| Icons not loading | Verify Assets folder paths are correct |
| Modal won't close | Ensure close button is within modal click handler |
| CSV not parsing | Use local server, not file:// protocol |

## 📝 Future Enhancements

- [ ] Search and filter functionality
- [ ] Dark/Light mode toggle
- [ ] Export data as PDF/CSV
- [ ] Compare multiple apps side-by-side
- [ ] User ratings and reviews
- [ ] Historical data tracking
- [ ] Mobile app integration
- [ ] Multi-language support

## 📜 License

This project is open source and available under the MIT License.

## 👤 Author

Created as a data transparency and user privacy awareness tool.

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Data sourced from app privacy policies and transparency reports
- Icon designs and UI inspiration from modern data visualization tools
- Community feedback and contributions

---

**Last Updated**: January 8, 2026

**Version**: 1.0.0

**Status**: Active Development ✅
