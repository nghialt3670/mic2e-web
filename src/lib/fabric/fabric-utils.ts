import { readFileAsDataURL, readFileAsText } from "@/utils/client/file-readers";
import { FabricImage, Group, StaticCanvas } from "fabric";
import { dataURLToBlob } from "blob-util";
import { v4 } from "uuid";


export const convertFileToFigJsonFile = async (file: File): Promise<File> => {
  if (file.name.endsWith(".fig.json") && file.type === "application/json") {
    return file;
  }
  return convertImageFileToFabricImageGroupFile(file);
};

export const convertImageFileToFabricImageGroupFile = async (
  file: File,
): Promise<File> => {
  const dataUrl = await readFileAsDataURL(file);
  const image = await FabricImage.fromURL(dataUrl);
  const group = new Group([image]);
  return new File([JSON.stringify(group.toJSON())], `${file.name}.fig.json`, {
    type: "application/json",
  });
};

export const createFabricImageGroupObjectFromImageFile = async (
  file: File,
): Promise<any> => {
  const dataUrl = await readFileAsDataURL(file);
  const image = await FabricImage.fromURL(dataUrl);
  const group = new Group([image]);
  return group.toJSON();
};

export const convertFabricImageGroupObjectToDataURL = async (
  obj: any,
): Promise<string> => {
  const group = await Group.fromObject(obj);
  const image = group.getObjects()[0] as FabricImage;
  const canvas = new StaticCanvas();
  canvas.add(group);
  canvas.setDimensions({
    width: image.getScaledWidth(),
    height: image.getScaledHeight(),
  });
  return canvas.toDataURL();
};

export const readFigJsonFileAsDataURL = async (file: File): Promise<string> => {
  const text = await readFileAsText(file);
  const obj = JSON.parse(text);
  const group = await Group.fromObject(obj);
  const image = group.getObjects()[0] as FabricImage;
  const canvas = new StaticCanvas();
  canvas.add(group);
  canvas.setDimensions({
    width: image.getScaledWidth(),
    height: image.getScaledHeight(),
  });
  return canvas.toDataURL();
};

export const createFigFromUrl = async (url: string): Promise<Group> => {
  const response = await fetch(url);
  const text = await response.text();
  const obj = JSON.parse(text);
  const group = await Group.fromObject(obj);
  group.selectable = false;
  group.set({
    id: crypto.randomUUID(),
  });
  return group;
};

export const createImageFileFromFig = async (fig: Group): Promise<File> => {
  const image = fig.getObjects()[0] as FabricImage;
  const canvas = new StaticCanvas();
  canvas.add(fig);
  canvas.setDimensions({
    width: image.getScaledWidth(),
    height: image.getScaledHeight(),
  });
  const dataUrl = canvas.toDataURL();
  const blob = dataURLToBlob(dataUrl);
  return new File([blob], v4() + ".png", { type: "image/png" });
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
