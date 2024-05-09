import React, { useEffect, useState } from 'react';
import '../assets/fileList.css';

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFiles = () => {
            const storedFiles = JSON.parse(localStorage.getItem('fileMetadata') || '[]');
            setFiles(storedFiles);
            setLoading(false);
        };

        loadFiles();
    }, []);

    const generateUrl = (fileId) => {
        const isLocal = process.env.DFX_NETWORK === "local";
        const canisterId = process.env.CANISTER_ID_FILESTORAGE_BACKEND;

        if (isLocal) {
            return `http://127.0.0.1:4943/d3?canisterId=${canisterId}&file_id=${fileId}`;
        } else {
            return `https://${canisterId}.raw.icp0.io/d3?file_id=${fileId}`;
        }
    };

    return (
        <div>
            <h1>My Files</h1>
            <h2>{loading ? `Loading...` : ''}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>File Name</th>
                        <th>File Type</th>
                        <th>File Size</th>
                        <th>View</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, index) => (
                        <tr key={file.fileId}>
                            <td>{index + 1}</td>
                            <td>{file.filename}</td>
                            <td>{file.filetype}</td>
                            <td>{(file.filesize / (1024 * 1024)).toFixed(2)} MB</td>
                            <td><a href={generateUrl(file.fileId)} target="_blank" rel="noopener noreferrer"><button>View</button></a></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FileList;
