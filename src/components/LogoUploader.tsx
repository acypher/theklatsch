
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadToLogosBucket } from '@/utils/uploadToLogos';

export const LogoUploader: React.FC = () => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Uploading file:', file.name);
      const result = await uploadToLogosBucket(file, file.name);
      if (result.success) {
        alert(`File uploaded successfully!\nURL: ${result.publicUrl}`);
        console.log('Upload successful:', result.publicUrl);
      } else {
        alert(`Upload failed: ${JSON.stringify(result.error)}`);
        console.error('Upload failed:', result.error);
      }
    }
  };

  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Upload to Logos Bucket</h3>
      <div className="flex flex-col space-y-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-sm text-gray-600">
          Click "Choose File" above to select an image file to upload to the logos bucket in Supabase.
        </p>
      </div>
    </div>
  );
};
