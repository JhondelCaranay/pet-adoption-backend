import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (base64: string) => {
  const result = await cloudinary.uploader.upload(base64, {
    upload_preset: 'petfolders',
    resource_type: '',
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
};

export const deleteImage = async (public_id: string) => {
  await cloudinary.uploader.destroy(public_id);
};

export default cloudinary;
