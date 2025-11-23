import { Canvas, Circle, FabricImage, Group, Path, Point, Rect } from "fabric";

export const canvasToFigCoords = (point: Point, canvas: Canvas) => {
  const zoom = canvas.getZoom();
  const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  
  // Account for viewport transform and zoom
  const x = (point.x - vpt[4]) / zoom;
  const y = (point.y - vpt[5]) / zoom;
  
  return new Point(x, y);
};

export const createPoint = (point: Point, canvas: Canvas, color: string) => {
  const fig = canvas.getObjects()[0] as Group;
  const figCoords = canvasToFigCoords(point, canvas);
  const zoom = canvas.getZoom();

  const circle = new Circle({
    left: figCoords.x,
    top: figCoords.y,
    radius: 5 / zoom,
    fill: color,
    originX: "center",
    originY: "center",
    pointerEvents: "none",
  });
  circle.set("selectable", false);
  circle.set("evented", false);
  
  fig.add(circle);
  canvas.requestRenderAll();
};

export const createFigFrame = (canvas: Canvas, color: string) => {
  const fig = canvas.getObjects()[0] as Group;
  const zoom = canvas.getZoom();
  
  // Get the first object (the image) from the fig
  const image = fig.getObjects()[0] as FabricImage;
  if (!image) return;
  
  // Use the image's dimensions
  const strokeWidth = 5 / zoom;
  const width = image.getScaledWidth() - strokeWidth;
  const height = image.getScaledHeight() - strokeWidth;
  
  const rect = new Rect({
    left: 0,
    top: 0,
    width: width,
    height: height,
    fill: "transparent",
    stroke: color,
    strokeWidth: 5 / zoom,
  });
  rect.set("selectable", false);
  rect.set("evented", false);
  rect.set("pointerEvents", "none");
  fig.add(rect);
  canvas.requestRenderAll();
};

export const createScribble = (points: Point[], canvas: Canvas, color: string) => {
  const fig = canvas.getObjects()[0] as Group;
  if (points.length < 2) return;
  
  const figPoints = points.map(p => canvasToFigCoords(p, canvas));
  
  // Build SVG path string with smooth curves
  let pathString = `M ${figPoints[0].x} ${figPoints[0].y}`;
  
  // Use quadratic curves for smoother brush-like effect
  for (let i = 1; i < figPoints.length; i++) {
    const xc = (figPoints[i].x + figPoints[i - 1].x) / 2;
    const yc = (figPoints[i].y + figPoints[i - 1].y) / 2;
    pathString += ` Q ${figPoints[i - 1].x} ${figPoints[i - 1].y} ${xc} ${yc}`;
  }
  
  // Add the last point
  if (figPoints.length > 1) {
    const lastPoint = figPoints[figPoints.length - 1];
    pathString += ` L ${lastPoint.x} ${lastPoint.y}`;
  }
  
  const zoom = canvas.getZoom();
  const path = new Path(pathString, {
    stroke: color,
    strokeWidth: 10 / zoom,
    fill: "",
    strokeLineCap: "round",
    strokeLineJoin: "round",
  });
  path.set("selectable", false);
  path.set("evented", false);
  fig.add(path);
  canvas.requestRenderAll();
};

export const createBox = (start: Point, end: Point, canvas: Canvas, color: string) => {
  const fig = canvas.getObjects()[0] as Group;
  const figStart = canvasToFigCoords(start, canvas);
  const figEnd = canvasToFigCoords(end, canvas);
  
  const left = Math.min(figStart.x, figEnd.x);
  const top = Math.min(figStart.y, figEnd.y);
  const width = Math.abs(figEnd.x - figStart.x);
  const height = Math.abs(figEnd.y - figStart.y);
  const zoom = canvas.getZoom();
  const rect = new Rect({
    left,
    top,
    width,
    height,
    fill: "transparent",
    stroke: color,
    strokeWidth: 5 / zoom,
    selectable: true,
  });
  rect.set("selectable", false);
  rect.set("evented", false);
  fig.add(rect);
  canvas.requestRenderAll();
};