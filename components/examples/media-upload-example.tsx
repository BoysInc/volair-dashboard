"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MediaUpload } from "@/components/ui/media-upload";
import { CustomInput } from "@/components/ui/custom-input";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Example 1: Single file upload
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatar: z.string().min(1, "Avatar is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function SingleFileUploadExample() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      avatar: "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    toast.success("Profile updated successfully!");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Profile Setup</CardTitle>
        <CardDescription>Single file upload example</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CustomInput
            label="Name"
            placeholder="Enter your name"
            registration={register("name")}
            error={errors.name?.message}
            required
          />

          <Controller
            name="avatar"
            control={control}
            render={({ field }) => (
              <MediaUpload
                label="Profile Picture"
                helperText="Upload a profile picture (JPEG, PNG, WebP)"
                multiple={false}
                maxFiles={1}
                maxSize={5}
                acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                value={field.value}
                onChange={field.onChange}
                error={errors.avatar?.message}
                required
              />
            )}
          />

          <Button type="submit" className="w-full">
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Example 2: Multiple file upload
const gallerySchema = z.object({
  title: z.string().min(1, "Title is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

type GalleryFormData = z.infer<typeof gallerySchema>;

export function MultipleFileUploadExample() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      title: "",
      images: [],
    },
  });

  const onSubmit = (data: GalleryFormData) => {
    toast.success("Gallery created successfully!");
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Photo Gallery</CardTitle>
        <CardDescription>Multiple file upload example</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CustomInput
            label="Gallery Title"
            placeholder="Enter gallery title"
            registration={register("title")}
            error={errors.title?.message}
            required
          />

          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <MediaUpload
                label="Gallery Images"
                helperText="Upload multiple images for your gallery"
                multiple={true}
                maxFiles={10}
                maxSize={5}
                acceptedTypes={[
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "image/gif",
                ]}
                value={field.value}
                onChange={field.onChange}
                error={errors.images?.message}
                required
              />
            )}
          />

          <Button type="submit" className="w-full">
            Create Gallery
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Example 3: Mixed media upload
const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  files: z.array(z.string()).min(1, "At least one file is required"),
});

type DocumentFormData = z.infer<typeof documentSchema>;

export function MixedMediaUploadExample() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      files: [],
    },
  });

  const onSubmit = (data: DocumentFormData) => {
    toast.success("Documents uploaded successfully!");
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>Mixed media upload example</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CustomInput
            label="Document Title"
            placeholder="Enter document title"
            registration={register("title")}
            error={errors.title?.message}
            required
          />

          <Controller
            name="files"
            control={control}
            render={({ field }) => (
              <MediaUpload
                label="Upload Files"
                helperText="Upload images, videos, PDFs, and other documents"
                multiple={true}
                maxFiles={5}
                maxSize={10}
                acceptedTypes={[
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "video/mp4",
                  "video/quicktime",
                  "application/pdf",
                  "text/plain",
                  "application/msword",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ]}
                value={field.value}
                onChange={field.onChange}
                error={errors.files?.message}
                required
              />
            )}
          />

          <Button type="submit" className="w-full">
            Upload Documents
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Main demo component
export function MediaUploadExamples() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Media Upload Examples</h1>
          <p className="text-muted-foreground">
            Different ways to use the MediaUpload component with React Hook Form
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <SingleFileUploadExample />
          <MultipleFileUploadExample />
          <MixedMediaUploadExample />
        </div>

        <Separator />

        <div className="prose prose-sm max-w-none">
          <h2>Usage Notes:</h2>
          <ul>
            <li>
              Use <code>Controller</code> from React Hook Form for proper
              integration
            </li>
            <li>
              Set <code>multiple={true}</code> for multiple file uploads
            </li>
            <li>
              Configure <code>maxFiles</code>, <code>maxSize</code>, and{" "}
              <code>acceptedTypes</code> as needed
            </li>
            <li>
              The component returns an array of media IDs that can be used to
              reference uploaded files
            </li>
            <li>Files are uploaded immediately when selected</li>
            <li>
              Use <code>onUploadComplete</code> and <code>onUploadError</code>{" "}
              callbacks for custom handling
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
