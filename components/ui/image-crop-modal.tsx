"use client";

import * as React from "react";
import Cropper, { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Crop,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: File[];
  onCropComplete: (croppedImages: File[]) => void;
  aspectRatio?: number;
}

interface CropData {
  crop: { x: number; y: number };
  zoom: number;
  croppedAreaPixels: Area | null;
}

/**
 * Helper function to create cropped image from canvas
 */
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  fileName: string,
  fileType: string
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to the crop area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }

        // Convert blob to File
        const file = new File([blob], fileName, {
          type: fileType,
          lastModified: Date.now(),
        });
        resolve(file);
      },
      fileType,
      fileType === "image/jpeg" ? 0.95 : 1 // Higher quality for JPEG
    );
  });
};

/**
 * Helper to create image element from src
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

export function ImageCropModal({
  open,
  onOpenChange,
  images,
  onCropComplete,
  aspectRatio = 16 / 9,
}: ImageCropModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [cropDataMap, setCropDataMap] = React.useState<Map<number, CropData>>(
    new Map()
  );
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Create object URLs for all images when modal opens
  React.useEffect(() => {
    if (open && images.length > 0) {
      const urls = images.map((file) => URL.createObjectURL(file));
      setImageUrls(urls);

      // Initialize crop data for all images
      const initialCropData = new Map<number, CropData>();
      images.forEach((_, index) => {
        initialCropData.set(index, {
          crop: { x: 0, y: 0 },
          zoom: 1,
          croppedAreaPixels: null,
        });
      });
      setCropDataMap(initialCropData);

      // Cleanup URLs on unmount
      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    }
  }, [open, images]);

  const currentImage = images[currentIndex];
  const currentImageUrl = imageUrls[currentIndex];
  const currentCropData = cropDataMap.get(currentIndex) || {
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedAreaPixels: null,
  };

  const handleCropChange = (crop: { x: number; y: number }) => {
    setCropDataMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentIndex, {
        ...currentCropData,
        crop,
      });
      return newMap;
    });
  };

  const handleZoomChange = (zoom: number) => {
    setCropDataMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentIndex, {
        ...currentCropData,
        zoom,
      });
      return newMap;
    });
  };

  const handleCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCropDataMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentIndex, {
        ...currentCropData,
        croppedAreaPixels,
      });
      return newMap;
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDone = async () => {
    setIsProcessing(true);

    try {
      // Crop all images
      const croppedImages: File[] = [];

      for (let i = 0; i < images.length; i++) {
        const cropData = cropDataMap.get(i);
        if (!cropData?.croppedAreaPixels) {
          throw new Error(`No crop data for image ${i + 1}`);
        }

        const croppedFile = await getCroppedImg(
          imageUrls[i],
          cropData.croppedAreaPixels,
          images[i].name,
          images[i].type
        );
        croppedImages.push(croppedFile);
      }

      onCropComplete(croppedImages);
      onOpenChange(false);

      // Reset state
      setCurrentIndex(0);
      setCropDataMap(new Map());
    } catch (error) {
      console.error("Error cropping images:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setCurrentIndex(0);
    setCropDataMap(new Map());
  };

  if (!currentImage || !currentImageUrl) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Crop className="h-5 w-5" />
                Crop Image to 16:9
              </DialogTitle>
              <DialogDescription className="mt-1">
                Adjust the crop area and zoom to frame your image perfectly
              </DialogDescription>
            </div>
            {images.length > 1 && (
              <Badge variant="secondary" className="text-sm">
                Image {currentIndex + 1} of {images.length}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Cropper Area */}
        <div className="relative w-full h-[500px] bg-black">
          <Cropper
            image={currentImageUrl}
            crop={currentCropData.crop}
            zoom={currentCropData.zoom}
            aspect={aspectRatio}
            onCropChange={handleCropChange}
            onZoomChange={handleZoomChange}
            onCropComplete={handleCropComplete}
            objectFit="contain"
          />
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4 border-t">
          {/* Zoom Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                Zoom
              </Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(currentCropData.zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[currentCropData.zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([value]) => handleZoomChange(value)}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* File Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{currentImage.name}</span>
            <span>{(currentImage.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex-row justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          <div className="flex gap-2">
            {/* Navigation for multiple images */}
            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0 || isProcessing}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentIndex === images.length - 1 || isProcessing}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}

            {/* Done button */}
            <Button
              type="button"
              onClick={handleDone}
              disabled={isProcessing}
              className="min-w-[100px]"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : currentIndex === images.length - 1 ? (
                <>
                  <Crop className="h-4 w-4 mr-2" />
                  Done
                </>
              ) : (
                <>Continue</>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
