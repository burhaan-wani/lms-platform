import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.config.js";
import { DeleteApiResponse } from "cloudinary";

export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folderName: string = "skillforge/avatars",
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "fill" }], // Optional: auto-resize avatars
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(
            new Error("Cloudinary upload failed with no response."),
          );
        }
        resolve(result);
      },
    );

    // Pipe the buffer into the Cloudinary upload stream
    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (
  publicId: string,
): Promise<DeleteApiResponse> => {
  try {
    const result = (await cloudinary.uploader.destroy(
      publicId,
    )) as DeleteApiResponse;
    return result;
  } catch (error) {
    throw new Error(
      `Failed to delete file from Cloudinary: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};
