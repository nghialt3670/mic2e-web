import { readFileAsDataURL } from "@/utils/client/file-utils";
import { createImageFileFromDataURL } from "@/utils/client/image-utils";
import { Canvas, FabricImage, Group, Rect, StaticCanvas } from "fabric";
import { v4 } from "uuid";

export const createFigObjectFromImageFile = async (
  file: File,
): Promise<Record<string, any>> => {
  const dataUrl = await readFileAsDataURL(file);
  const image = await FabricImage.fromURL(dataUrl);
  image.set({
    originX: "center",
    originY: "center",
    selectable: false,
  });
  const group = new Group([image]);
  group.set({
    id: crypto.randomUUID(),
    originX: "center",
    originY: "center",
    left: image.getScaledWidth() / 2,
    top: image.getScaledHeight() / 2,
    selectable: false,
    hoverCursor: "default",
  });
  return group.toObject(["id", "selectable", "evented", "hoverCursor"] as any);
};

export const createFigFileFromFigObject = async (
  figObject: Record<string, any>,
  filename: string = `${v4()}.fig.json`,
): Promise<File> => {
  return new File([JSON.stringify(figObject)], filename, {
    type: "application/json",
  });
};

export const createFigFileFromImageFile = async (
  imageFile: File,
): Promise<File> => {
  const figObject = await createFigObjectFromImageFile(imageFile);
  return await createFigFileFromFigObject(
    figObject,
    `${imageFile.name}.fig.json`,
  );
};

export const createFigObjectFromFigFile = async (
  file: File,
): Promise<Record<string, any>> => {
  return await JSON.parse(await file.text());
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

export const createFigFromFigObject = async (
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

export const removeObjectWithReference = (
  canvases: Canvas[],
  reference: Record<string, any>,
  onUpdate?: (canvas: Canvas) => void,
) => {
  canvases.forEach((canvas) => {
    const fig = canvas.getObjects()[0] as Group;
    if (!fig) return;

    let objectRemoved = false;

    // Check if this is a fig frame reference
    if (fig.get("reference")?.value === reference.value) {
      const frame = fig.getObjects()[1] as Rect;
      if (frame && frame.get("id") === fig.get("id")) {
        fig.remove(frame);
        canvas.renderAll();
        objectRemoved = true;
      }
    }

    // Check if this is a regular object reference
    if (!objectRemoved) {
      const figObjects = fig.getObjects();
      const object = figObjects.find(
        (obj) => obj.get("reference")?.value === reference.value,
      );
      if (object) {
        fig.remove(object);
        canvas.renderAll();
        objectRemoved = true;
      }
    }

    // Trigger update callback if something was removed
    if (objectRemoved && onUpdate) {
      onUpdate(canvas);
    }
  });
};
