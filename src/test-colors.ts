// Color palette test
const colorPalette = [
  "classic beige (RGB: 235, 228, 215)",
  "warm cream (RGB: 245, 238, 225)",
  "platinum grey (RGB: 190, 190, 190)",
  "classic interface blue (RGB: 0, 0, 170)",
  "vintage monitor green (Pantone 360C)",
  "retro keyboard grey",
  "system window grey",
  "phosphor green",
  "early menu bar white",
  "classic shadow grey",
  "vintage platinum",
  "retro computer beige"
];

function formatColorPalette(colors: string[], maxDisplay?: number): string {
  if (!colors || colors.length === 0) {
    return 'No colors defined';
  }

  const displayColors = maxDisplay ? colors.slice(0, maxDisplay) : colors;
  const remaining = maxDisplay && colors.length > maxDisplay ? colors.length - maxDisplay : 0;

  const formattedColors = displayColors.map(color => {
    // Clean up the color name and ensure proper formatting
    const cleanColor = color.trim()
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\s+/g, ' '); // Normalize spaces

    // Check for RGB values and format them nicely
    const rgbMatch = cleanColor.match(/\(RGB:\s*(\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch;
      return `\n  - ${cleanColor.split('(')[0].trim()} (🎨 RGB: ${r}, ${g}, ${b})`;
    }

    // Check for Pantone values
    const pantoneMatch = cleanColor.match(/\(Pantone [^)]+\)/);
    if (pantoneMatch) {
      return `\n  - ${cleanColor}`;
    }

    return `\n  - ${cleanColor}`;
  }).join('');

  let output = `Color Palette:${formattedColors}`;
  if (remaining > 0) {
    output += `\n  ... and ${remaining} more colors`;
  }

  return output;
}

// Display the color palette
console.log(formatColorPalette(colorPalette, 10)); 