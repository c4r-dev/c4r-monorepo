export const createCursorFromIcon = (svgString) => {
    // Convert the SVG to a data URL
    const encodedSvg = encodeURIComponent(svgString);
    return `data:image/svg+xml;utf8,${encodedSvg}`;
};