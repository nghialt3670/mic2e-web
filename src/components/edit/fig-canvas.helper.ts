import { Canvas, Circle, FabricImage, Group, Path, Point, Rect } from "fabric";
import { v4 } from "uuid";

export const createFigFromObject = async (
  obj: Record<string, any>,
): Promise<Group> => {
  const fig = await Group.fromObject(obj);

  fig.set({
    id: obj.id,
    subTargetCheck: true,
    selectable: false,
    evented: false,
    interactive: true,
  });

  return fig;
};

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
    id: v4(),
    left: figCoords.x,
    top: figCoords.y,
    radius: 5 / zoom,
    fill: color,
    originX: "center",
    originY: "center",
    pointerEvents: "none",
  });
  fig.add(circle);
  canvas.requestRenderAll();
  return circle;
};

export const createFigFrame = (canvas: Canvas, color: string) => {
  const fig = canvas.getObjects()[0] as Group;
  const zoom = canvas.getZoom();
  const image = fig.getObjects()[0] as FabricImage;
  const strokeWidth = 5 / zoom;
  const width = image.getScaledWidth() - strokeWidth;
  const height = image.getScaledHeight() - strokeWidth;

  const rect = new Rect({
    id: fig.get("id"), // Use the fig's id so we can identify this frame later
    left: 0,
    top: 0,
    width: width,
    height: height,
    fill: "transparent",
    stroke: color,
    strokeWidth: 5 / zoom,
  });

  // Insert the frame at index 1 (right after the base image at index 0)
  const objects = fig.getObjects();
  fig.remove(...objects);
  fig.add(objects[0]); // Add back the base image
  fig.add(rect); // Add the frame at index 1
  // Add back all other objects
  for (let i = 1; i < objects.length; i++) {
    fig.add(objects[i]);
  }

  canvas.requestRenderAll();
  return fig;
};

export const removeFigFrame = (canvas: Canvas) => {
  const fig = canvas.getObjects()[0] as Group;
  const figObjects = fig.getObjects();
  
  // Check if frame exists at index 1 (has same id as fig)
  if (figObjects.length > 1 && figObjects[1]?.get("id") === fig.get("id")) {
    fig.remove(figObjects[1]);
    canvas.requestRenderAll();
  }
  
  return fig;
};

export const hasFigFrame = (canvas: Canvas): boolean => {
  const fig = canvas.getObjects()[0] as Group;
  const figObjects = fig.getObjects();
  return figObjects.length > 1 && figObjects[1]?.get("id") === fig.get("id");
};

export const createScribble = (
  points: Point[],
  canvas: Canvas,
  color: string,
) => {
  const fig = canvas.getObjects()[0] as Group;
  const figPoints = points.map((p) => canvasToFigCoords(p, canvas));

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
    id: v4(),
    stroke: color,
    strokeWidth: 10 / zoom,
    fill: "",
    strokeLineCap: "round",
    strokeLineJoin: "round",
  });
  fig.add(path);
  canvas.requestRenderAll();
  return path;
};

export const createBox = (
  start: Point,
  end: Point,
  canvas: Canvas,
  color: string,
) => {
  const fig = canvas.getObjects()[0] as Group;
  const figStart = canvasToFigCoords(start, canvas);
  const figEnd = canvasToFigCoords(end, canvas);

  const left = Math.min(figStart.x, figEnd.x);
  const top = Math.min(figStart.y, figEnd.y);
  const width = Math.abs(figEnd.x - figStart.x);
  const height = Math.abs(figEnd.y - figStart.y);
  const zoom = canvas.getZoom();
  const rect = new Rect({
    id: v4(),
    left,
    top,
    width,
    height,
    fill: "transparent",
    stroke: color,
    strokeWidth: 5 / zoom,
  });
  fig.add(rect);
  canvas.requestRenderAll();
  return rect;
};
