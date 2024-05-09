import React, { useState } from 'react';
import { fileStorage_backend } from 'declarations/fileStorage_backend';
import '../assets/fileUpload.css';

const FileUpload = () => {
   const [loading, setLoading] = useState(false);
   const [file, setFile] = useState(null);
   const [fileName, setFileName] = useState('');

   const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
   };

   const readChunkAsync = (chunk) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => {
            const arrayBuffer = reader.result;
            const uint8Array = new Uint8Array(arrayBuffer);
            resolve(Array.from(uint8Array)); // Convert buffer to array of numbers
         };
         reader.onerror = () => reject(reader.error);
         reader.readAsArrayBuffer(chunk);
      });
   };

   const uploadChunk = (chunk, index, fileId) => {
      return readChunkAsync(chunk).then(chunkData => {
         return fileStorage_backend.uploadChunkedFile({
            id: fileId,
            data: chunkData,
            index: index
         });
      });
   };

   const handleUpload = async () => {
      if (!file) {
         console.error('No file selected');
         return;
      }

      setLoading(true);

      try {
         const filemetadata = {
            filesize: file.size,
            filename: file.name,
            filetype: file.type
         };
         console.log('Uploading metadata : ', filemetadata);
         const metadataResponse = await fileStorage_backend.uploadMetadata(filemetadata);
         console.log('Metadata uploaded : ', metadataResponse);

         //store in local storage
         const LocalStorageData = {
            filesize: file.size,
            filename: file.name,
            filetype: file.type,
            fileId: metadataResponse.fileId
         }
         const existingFiles = JSON.parse(localStorage.getItem('fileMetadata') || '[]');
         existingFiles.push(LocalStorageData);
         localStorage.setItem('fileMetadata', JSON.stringify(existingFiles));

         ////////////
         const chunkSizeInBytes = Number(metadataResponse.chunkSizeInBytes);
         const numOfChunks = Number(metadataResponse.numOfChunks);
         let start = 0;
         const batchSize = 100; // Size of each batch

         for (let i = 0; i < numOfChunks; i += batchSize) {
            const promises = [];
            for (let j = i; j < Math.min(numOfChunks, i + batchSize); j++) {
               const chunk = file.slice(start, start + chunkSizeInBytes);
               promises.push(uploadChunk(chunk, j, metadataResponse.fileId));
               start += chunkSizeInBytes;
            }
            const chunkResponses = await Promise.all(promises);
            chunkResponses.forEach((response, index) => {
               console.log(`Chunk ${i + index} uploaded: `, response);
            });
         }

         console.log('All chunks uploaded successfully');
      } catch (error) {
         console.error('Error uploading file:', error);
      } finally {
         setLoading(false);
         window.location.reload();
      }
   };

   return (
      <div className="file-upload-container">
         <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
         />
         <button
            onClick={() => document.querySelector('.file-input').click()}
            className="choose-file-btn"
         >
            Choose File
         </button>
         <p className="selected-file-info">
            {fileName && `Selected File: ${fileName}`}
         </p>
         <button
            onClick={handleUpload}
            className="upload-btn"
            disabled={loading}
         >
            {loading ? "Loading..." : "Upload"}
         </button>
      </div>
   );
};

export default FileUpload;
