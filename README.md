# OpenCV Document Scanner (with Dynamsoft Document Viewer)

This project contains the source code and reverse-engineered modules for the OpenCV + Dynamsoft Document Viewer document scanning demo:
- Source: `https://tony-xlh.github.io/Vanilla-JS-Document-Scanner-Demos/dynamsoft-document-viewer/opencv/`
- Recovered and decompiled using [REA (morluto/rea)](https://github.com/morluto/rea) and Wakaru.

## Project Structure

```
.
├── index.html                                  # Main page integrating OpenCV.js & Dynamsoft Document Viewer
├── dist/
│   └── opencv-document-scanner.js              # Production bundled script
├── decompiled/
│   └── opencv-document-scanner.decompiled.js   # Decompiled readable ES6 module
└── src/
    ├── document-scanner.ts                     # Core OpenCV contour & perspective transformation logic
    ├── dynamsoft-document-viewer-handler.ts    # Custom Dynamsoft DDV detect handler
    ├── index.ts                                # Module exports
    └── main.ts                                 # Entry point
```

## How It Works

1. **OpenCV.js**:
   - Performs grayscale conversion (`cvtColor`), Gaussian blur (`GaussianBlur`), and Otsu binarization (`threshold`).
   - Extracts document contour (`findContours`) and identifies 4 corner points (`getCornerPoints`).
   - Crops and straightens the document via perspective transform (`getPerspectiveTransform`, `warpPerspective`).

2. **Dynamsoft Document Viewer (DDV)**:
   - Manages camera capture stream (`CaptureViewer`).
   - Provides quadrilateral boundary editing and viewer UI (`PerspectiveViewer`).
