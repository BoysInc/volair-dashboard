"use client";

import * as React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Upload,
  X,
  Image,
  File,
  AlertCircle,
  CheckCircle2,
  Camera,
  Video,
  Music,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  uploadMedia,
  uploadMultipleMedia,
  MediaUploadResponse,
} from "@/lib/server/media/media";

interface MediaUploadProps {
  // React Hook Form integration
  value?: string[] | string;
  onChange?: (value: string[] | string) => void;
  registration?: UseFormRegisterReturn;
  error?: string;

  // Configuration
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];

  // Styling
  className?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;

  // Callbacks
  onUploadComplete?: (files: MediaUploadResponse[]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  mediaId: string;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
];

const MAX_FILE_SIZE = 10; // 10MB default

export const MediaUpload = React.forwardRef<HTMLDivElement, MediaUploadProps>(
  (
    {
      value,
      onChange,
      registration,
      error,
      multiple = false,
      maxFiles = 5,
      maxSize = MAX_FILE_SIZE,
      acceptedTypes = DEFAULT_ACCEPTED_TYPES,
      className,
      label,
      helperText,
      required = false,
      disabled = false,
      onUploadComplete,
      onUploadError,
      ...props
    },
    ref
  ) => {
    const { token } = useAuth();
    const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>(
      []
    );
    const [isDragActive, setIsDragActive] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Convert value to array for easier handling
    const currentValue = React.useMemo(() => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    }, [value]);

    const uploadMutation = useMutation({
      mutationFn: async (files: File[]) => {
        if (files.length === 1) {
          return uploadMedia(token, files[0], "aircraft", 0);
        }
        return uploadMultipleMedia(token, files, "aircraft");
      },
      onSuccess: (result) => {
        if (result.error) {
          toast.error(result.error);
          onUploadError?.(result.error);

          // Mark all uploading files as failed
          setUploadedFiles((prev) =>
            prev.map((file) =>
              file.status === "uploading"
                ? {
                    ...file,
                    status: "error" as const,
                    error: result.error || "Upload failed",
                  }
                : file
            )
          );
        } else {
          const uploadedData = Array.isArray(result.data)
            ? result.data
            : [result.data!];
          const newIds = uploadedData.map((item) => item.id);

          // Update form value
          const updatedValue = multiple
            ? [...currentValue, ...newIds]
            : newIds[0];

          onChange?.(updatedValue);
          onUploadComplete?.(uploadedData);

          // Update uploaded files state - mark all uploading files as successful
          // since we know the upload was successful
          setUploadedFiles((prev) => {
            let dataIndex = 0;

            return prev.map((file) => {
              if (file.status === "uploading") {
                // Get the corresponding upload data by index
                const correspondingData = uploadedData[dataIndex];
                dataIndex++;

                // console.log("correspondingData", correspondingData);

                if (correspondingData) {
                  return {
                    ...file,
                    status: "success" as const,
                    progress: 100,
                    mediaId: correspondingData.id,
                    url: correspondingData.url,
                  };
                }
              }
              return file;
            });
          });

          toast.success(`Successfully uploaded ${uploadedData.length} file(s)`);
        }
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(errorMessage);
        onUploadError?.(errorMessage);

        // Mark files as failed
        setUploadedFiles((prev) =>
          prev.map((file) => ({
            ...file,
            status: "error" as const,
            error: errorMessage,
          }))
        );
      },
    });

    const validateFile = (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `File type ${file.type} is not supported`;
      }

      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`;
      }

      return null;
    };

    const handleFileUpload = (files: File[]) => {
      if (disabled) return;

      // Validate files
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        toast.error(`Validation errors: ${errors.join(", ")}`);
        return;
      }

      // Check file limits
      if (!multiple && validFiles.length > 1) {
        toast.error("Only one file is allowed");
        return;
      }

      if (multiple && currentValue.length + validFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files`);
        return;
      }

      // Add to uploaded files state
      const newUploadedFiles = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: URL.createObjectURL(file),
        mediaId: "",
        status: "uploading" as const,
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

      // Start upload
      uploadMutation.mutate(validFiles);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFileUpload(files);

      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const removeFile = (fileId: string) => {
      setUploadedFiles((prev) => {
        const fileToRemove = prev.find((f) => f.id === fileId);
        if (fileToRemove?.mediaId) {
          // Remove from form value
          const updatedValue = currentValue.filter(
            (id) => id !== fileToRemove.mediaId
          );
          onChange?.(multiple ? updatedValue : updatedValue[0] || "");
        }
        return prev.filter((f) => f.id !== fileId);
      });
    };

    const getFileIcon = (file: File) => {
      if (file.type.startsWith("image/")) return <Image className="h-4 w-4" />;
      if (file.type.startsWith("video/")) return <Video className="h-4 w-4" />;
      if (file.type.startsWith("audio/")) return <Music className="h-4 w-4" />;
      if (file.type === "application/pdf")
        return <FileText className="h-4 w-4" />;
      return <File className="h-4 w-4" />;
    };

    const getStatusIcon = (file: UploadedFile) => {
      switch (file.status) {
        case "uploading":
          return <LoadingState size="sm" className="h-4 w-4" />;
        case "success":
          return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case "error":
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        default:
          return null;
      }
    };

    return (
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        {label && (
          <Label
            className={cn("text-sm font-medium", error && "text-destructive")}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}

        <Card
          className={cn(
            "border-2 border-dashed transition-colors",
            isDragActive && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive"
          )}
        >
          <CardContent className="p-6">
            <div
              className={cn(
                "flex flex-col items-center justify-center text-center space-y-4",
                !disabled && "cursor-pointer"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Drop files here"
                    : "Drag files here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {multiple
                    ? `Up to ${maxFiles} files, max ${maxSize}MB each`
                    : `Max ${maxSize}MB`}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={disabled}
              >
                <Camera className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Uploaded Files</Label>
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        file.status === "success"
                          ? "default"
                          : file.status === "error"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {file.status}
                    </Badge>

                    {getStatusIcon(file)}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === "uploading"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {file.status === "uploading" && (
                  <Progress value={file.progress} className="mt-2" />
                )}

                {file.status === "error" && file.error && (
                  <p className="text-xs text-red-500 mt-1">{file.error}</p>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
      </div>
    );
  }
);

MediaUpload.displayName = "MediaUpload";
