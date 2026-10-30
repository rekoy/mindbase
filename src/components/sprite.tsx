type SpriteProps = {
  /** Rows of characters; each character is one pixel, "." is transparent. */
  grid: readonly string[];
  /** Maps a grid character to a CSS color. */
  colors: Record<string, string>;
  /** Screen pixels per sprite pixel. */
  scale?: number;
  className?: string;
  /** Accessible name; omit for decorative sprites. */
  title?: string;
};

export function Sprite({ grid, colors, scale = 4, className, title }: SpriteProps) {
  const height = grid.length;
  const width = Math.max(...grid.map((row) => row.length));
  const rects: React.ReactNode[] = [];

  // Merge horizontal runs of the same color into one rect.
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const char = row[x];
      const fill = colors[char];
      if (!fill) {
        x++;
        continue;
      }
      let end = x;
      while (end < row.length && row[end] === char) end++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={fill} />);
      x = end;
    }
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width * scale}
      height={height * scale}
      shapeRendering="crispEdges"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {rects}
    </svg>
  );
}
