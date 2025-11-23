import { readFileAsDataURL } from "@/utils/client/file-readers";
import { createImageFileFromDataURL } from "@/utils/client/image";
import { Canvas, FabricImage, Group, StaticCanvas } from "fabric";
import { v4 } from "uuid";

export const createFigObjectFromImageFile = async (
  file: File,
): Promise<Record<string, any>> => {
  const dataUrl = await readFileAsDataURL(file);
  const image = await FabricImage.fromURL(dataUrl);
  image.selectable = false;
  const group = new Group([image]);
  group.set({
    id: crypto.randomUUID(),
  });
  group.selectable = false;
  group.hoverCursor = "default";
  group.getObjects().forEach((obj, index) => {
    obj.selectable = index !== 0;
    obj.evented = true;
  });
  return group.toObject(["id", "selectable", "evented", "hoverCursor"] as any);
};

export const createFigFileFromObject = async (
  obj: Record<string, any>,
  filename: string,
): Promise<File> => {
  return new File([JSON.stringify(obj)], `${v4()}_${filename}.fig.json`, {
    type: "application/json",
  });
};

export const createImageFileFromFigObject = async (
  obj: Record<string, any>,
): Promise<File> => {
  const group = await Group.fromObject(obj);
  const image = group.getObjects()[0] as FabricImage;
  const canvas = new StaticCanvas();
  canvas.add(group);
  canvas.renderAll();
  canvas.setDimensions({
    width: image.getScaledWidth(),
    height: image.getScaledHeight(),
  });
  const dataUrl = canvas.toDataURL();
  return await createImageFileFromDataURL(dataUrl);
};

export const getFigObjectDimensions = async (
  obj: Record<string, any>,
): Promise<{ width: number; height: number }> => {
  const group = await Group.fromObject(obj);
  const image = group.getObjects()[0] as FabricImage;
  return {
    width: image.getScaledWidth(),
    height: image.getScaledHeight(),
  };
};

export const calculateZoomToFit = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
): number => {
  const widthRatio = containerWidth / imageWidth;
  const heightRatio = containerHeight / imageHeight;
  return Math.min(widthRatio, heightRatio);
};

export const resizeAndZoomCanvas = (
  canvas: Canvas,
  maxWidth: number,
  maxHeight: number,
) => {
  if (!canvas) return;
  const objects = canvas.getObjects();
  if (objects.length === 0) return;
  const fig = objects[0] as Group;
  const figObjects = fig.getObjects();
  if (figObjects.length === 0) return;
  const image = figObjects[0] as FabricImage;
  const imageWidth = image.getScaledWidth();
  const imageHeight = image.getScaledHeight();
  const zoom = calculateZoomToFit(imageWidth, imageHeight, maxWidth, maxHeight);
  canvas.setDimensions({
    width: imageWidth * zoom,
    height: imageHeight * zoom,
  });
  canvas.setZoom(zoom);
  canvas.renderAll();
};
