"use server";

import { tryCatch } from "@/lib/utils";

export interface MediaUploadResponse {
    id: string;
    url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    created_at: string;
}

export interface MediaUploadResult {
    data: MediaUploadResponse | null;
    error: string | null;
}

export const uploadMedia = async (
    token: string | null,
    file: File,
    directory: string,
    order: number
): Promise<MediaUploadResult> => {

    if (!token) {
        return { data: null, error: "No authentication token provided" };
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", directory);
    formData.append("order", order.toString());

    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/media`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                // Don't set Content-Type header for FormData - let the browser set it
            },
            body: formData,
        })
    );

    if (error !== null) {
        return { data: null, error: error.message };
    }

    if (!data.ok) {
        // Try to get error details from response
        const { data: errorData, error: parseError } = await tryCatch(data.json());

        if (!parseError && errorData?.message) {
            return { data: null, error: errorData.message };
        }

        return { data: null, error: `Failed to upload media: ${data.status} ${data.statusText}` };
    }

    const { data: mediaData, error: mediaError } = await tryCatch(data.json());

    if (mediaError) {
        return { data: null, error: mediaError.message };
    }

    return { data: mediaData.data as MediaUploadResponse, error: null };
};

export const uploadMultipleMedia = async (
    token: string | null,
    files: File[],
    directory: string,
): Promise<{ data: MediaUploadResponse[] | null; error: string | null }> => {

    if (!token) {
        return { data: null, error: "No authentication token provided" };
    }

    const uploadPromises = files.map((file, index) => uploadMedia(token, file, directory, index));
    const results = await Promise.all(uploadPromises);

    const errors = results.filter(result => result.error !== null);

    if (errors.length > 0) {
        return {
            data: null,
            error: `Failed to upload ${errors.length} file(s): ${errors.map(e => e.error).join(", ")}`
        };
    }

    const successfulUploads = results
        .filter(result => result.data !== null)
        .map(result => result.data!);

    return { data: successfulUploads, error: null };
}; 