import { readFileAsDataURL, readFileAsText } from "@/utils/client/file-readers";
import { FabricImage, Group, StaticCanvas } from "fabric";

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
