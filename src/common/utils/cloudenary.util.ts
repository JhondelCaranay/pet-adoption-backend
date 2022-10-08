import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (base64: string) => {
  try {
    console.log('the base url:::', base64);
    const result = await cloudinary.uploader.upload(base64, {
      upload_preset: 'petfolders',
      resource_type: '',
    });
    return {
      secure_url: result?.url,
      public_id: result?.public_id,
    };
  } catch (error) {
    console.error('error cloudinary upload', error)
  }
};

export const deleteImage = async (public_id: string) => {
  try {
  await cloudinary.uploader.destroy(public_id);
    
  } catch (error) {
    console.error('error cloudinary upload')
  }
};

export default cloudinary;
