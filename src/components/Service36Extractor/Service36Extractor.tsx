// I UNDERSTAND THAT THIS FILE COULD BETTER FOLLOW THE SINGLE RESPONSIBILITY PRINCIPLE,
// BUT DECIDED NOT TO DUE TO TIME. IF I WERE TO FOLLOW THE SRP, I WOULD SPLIT THIS 
// FILE INTO FOUR COMPONENTS: FILE HANDLING, DATA CONVERSION, UI, AND DATA PROCESSING.

import React, { useState } from 'react';
import './Service36Extractor.scss';

const validFileExtensions = ['.candata'];

const isValidFileType = (fileName: string): boolean => {
    const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    return validFileExtensions.includes(extension);
}

const arrayBufferToHex = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let hex = '';

    bytes.forEach((byte) => {
        const hexByte = byte.toString(16).padStart(2, '0').toUpperCase();
        hex += hexByte;
    });

    return hex;
}

const hexToBinaryArrayBuffer = (hexStr: string): ArrayBuffer => {
    const byteCount = Math.ceil(hexStr.length / 2);
    const buffer = new ArrayBuffer(byteCount);
    const byteView = new Uint8Array(buffer);

    for (let i=0; i<byteCount; i++) {
        const byteStr = hexStr.slice(i * 2, i * 2 + 2);
        byteView[i] = parseInt(byteStr, 16);
    }

    return buffer;
}

const Service36Extractor: React.FC = () => {
    const [hexData, setHexData] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const readFile = (file: File, onComplete: (hexContent: string) => void) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const hexContent = arrayBufferToHex(arrayBuffer);
          onComplete(hexContent);
        };
      
        reader.readAsArrayBuffer(file);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            readFile(file, (hexContent) => {
                setHexData(hexContent);
            });
        }
    };

    const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0]
        setIsDragActive(false);
        if (file && isValidFileType(file.name)) {
            readFile(file, (hexContent) => {
                setHexData(hexContent);
            });
        } else {
            alert('Invalid file type. Please upload a .candata file.')
        }
    }

    const handleDragEnter = () => {
        setIsDragActive(true);
    }

    const handleDragLeave = () => {
        setIsDragActive(false);
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(true)
    }

    const handleClickToUpload = (inputRef: React.RefObject<HTMLInputElement>) => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    const handleExtractionDownload = (hexString: string) => {
        const arrayBuffer = hexToBinaryArrayBuffer(hexString);

        const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
        const downloadUrl = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = 'data.bin';
        downloadLink.click();

        URL.revokeObjectURL(downloadUrl);
        return;
    };

    if (!hexData) {
        return (
            <div className='extractor'>
                <h2>Extract Transfer Data</h2>
                <input 
                    type='file' 
                    accept='.candata' 
                    onChange={handleFileUpload} 
                    ref={inputRef} />

                <div
                    className={`dragNDrop ${isDragActive ? 'active' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleFileDrop}
                    onClick={() => handleClickToUpload(inputRef)}>
                    
                    <svg className="upload-icon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="UploadFileIcon">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm4 18H6V4h7v5h5zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z"></path>
                    </svg>

                    <p>Drag and drop your <span>.candata</span> file here or click to&nbsp;upload.</p>
                </div>
            </div>
        )
    }


    // EXTRACTION LOGIC

    const segmentLength = 34;

    // Split strings into an array of UDS Messages
    let segments = Array.from(
        { length: Math.ceil(hexData.length / segmentLength) },
        (_, i) => hexData.slice(i * segmentLength, (i + 1) * segmentLength)
    );

    // Filter out engine computer and dongle transmitting IDs
    segments = segments.filter((str, i) => str.includes('07E8') || str.includes('07E0'))
    
    let hexDataOutput: string[] = [];
    let canDataOnly: string[] = segments.map(
        (seg) => seg.slice(18) // Extract the CAN data
    )
    let isValidSequence = false;

    // Loop through the 'canDataOnly' and process based on the frame type
    canDataOnly.forEach((data, index) => {
        const frameType = data[0];
        // Single Frame (SF) begins with 0
        // First Frame (FF) begins with 1
        // Consecutive Frame (CF) begins with 2
        // Flow Control Frame (FC) begins with 3

        if (frameType === '0' || frameType === '3') return;

        if (frameType === '1') {
            const thirdByte = data.slice(4, 6); // Check the service type
            if (thirdByte === '36') {
                isValidSequence = true;
                hexDataOutput.push(data.slice(8, 16));
            } else {
                isValidSequence = false;
            }
            return;
        }

        if (isValidSequence && frameType === '2') {
            const currentData = data.slice(2);
            const containsFiftyFive = currentData.includes('55');

            if (!containsFiftyFive) {
                hexDataOutput.push(currentData)
            } else {
                let shouldRemoveTrailingFives = false;

                if (index + 1 < canDataOnly.length) {
                    const nextFrameType = canDataOnly[index + 1][0] // Get the next index's frame type

                    if (nextFrameType === '0' || nextFrameType === '3') {
                        shouldRemoveTrailingFives = true;
                    }
                }

                if (shouldRemoveTrailingFives) {
                    const cleanedData = currentData.replace(/(55)+$/,''); // Remove only trailing 55 "byte" pairs. 
                    hexDataOutput.push(cleanedData);
                } else {
                    hexDataOutput.push(currentData);
                }
            }
        }
    });

    return (
        <div className='downloader'>
            <h2>Transfer data has been extracted!</h2>
            <p>Download the BIN-formatted extracted transfer data from the provided CAN bus log by clicking the green button&nbsp;below:</p>
            <button className='primary' onClick={() => handleExtractionDownload(hexDataOutput.join(''))}>
                <span>
                    Download
                    <div className='icon-container'>
                        <svg className="download-icon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="FileDownloadOutlinedIcon">
                            <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3zm-1-4-1.41-1.41L13 12.17V4h-2v8.17L8.41 9.59 7 11l5 5z"></path>
                        </svg>
                    </div>
                </span>
            </button>
            <button className='secondary' onClick={() => setHexData(null)}><span>Start Over</span></button>
        </div>
    )
}

export default Service36Extractor;