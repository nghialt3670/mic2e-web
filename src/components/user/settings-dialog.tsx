"use client";

import { createOrUpdateUserSettings } from "@/actions/settings-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LLM_MODELS, useSettingsStore } from "@/stores/settings-store";
import { withToastHandler } from "@/utils/client/action-utils";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const SettingsDialog = () => {
  const {
    llmModel,
    maxImageWidth,
    maxImageHeight,
    setLlmModel,
    setMaxImageWidth,
    setMaxImageHeight,
    resetToDefaults,
  } = useSettingsStore();

  const [open, setOpen] = useState(false);
  const [localLlmModel, setLocalLlmModel] = useState(llmModel);
  const [localMaxWidth, setLocalMaxWidth] = useState(maxImageWidth.toString());
  const [localMaxHeight, setLocalMaxHeight] = useState(
    maxImageHeight.toString(),
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset local state when opening
      setLocalLlmModel(llmModel);
      setLocalMaxWidth(maxImageWidth.toString());
      setLocalMaxHeight(maxImageHeight.toString());
    }
    setOpen(newOpen);
  };

  const handleSave = async () => {
    const width = parseInt(localMaxWidth);
    const height = parseInt(localMaxHeight);

    if (isNaN(width) || width <= 0) {
      toast.error("Max width must be a positive number");
      return;
    }

    if (isNaN(height) || height <= 0) {
      toast.error("Max height must be a positive number");
      return;
    }

    if (width > 2000 || height > 2000) {
      toast.error("Maximum dimensions cannot exceed 2000 pixels");
      return;
    }

    // Save to database (creates a new settings snapshot)
    await withToastHandler(createOrUpdateUserSettings, {
      llmModel: localLlmModel,
      maxImageWidth: width,
      maxImageHeight: height,
    });

    // Update local store
    setLlmModel(localLlmModel);
    setMaxImageWidth(width);
    setMaxImageHeight(height);
    setOpen(false);
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalLlmModel(useSettingsStore.getState().llmModel);
    setLocalMaxWidth(useSettingsStore.getState().maxImageWidth.toString());
    setLocalMaxHeight(useSettingsStore.getState().maxImageHeight.toString());
    toast.success("Settings reset to defaults");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="size-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your preferences for the application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* LLM Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="llm-model">LLM Model</Label>
            <Select value={localLlmModel} onValueChange={setLocalLlmModel}>
              <SelectTrigger id="llm-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {LLM_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the AI model for chat responses
            </p>
          </div>

          {/* Image Dimensions */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">Image Upload Settings</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum dimensions for uploaded images
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-width">Max Width (px)</Label>
                <Input
                  id="max-width"
                  type="number"
                  min="100"
                  max="2000"
                  value={localMaxWidth}
                  onChange={(e) => setLocalMaxWidth(e.target.value)}
                  placeholder="480"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-height">Max Height (px)</Label>
                <Input
                  id="max-height"
                  type="number"
                  min="100"
                  max="2000"
                  value={localMaxHeight}
                  onChange={(e) => setLocalMaxHeight(e.target.value)}
                  placeholder="360"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
