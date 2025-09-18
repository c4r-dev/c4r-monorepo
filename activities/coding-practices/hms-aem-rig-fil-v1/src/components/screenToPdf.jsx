const logger = require('../../../../../packages/logging/logger.js');
import React, { useRef } from "react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ScreenToPDF = () => {

    const printRef = useRef();

    const handlePrint = () => {
        const input = printRef.current;
        html2canvas(input)
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'PNG', 0, 0);
                pdf.save('download.pdf');
            })
            .catch(error => {
                logger.app.error('Error generating PDF:', error);
            });
    };

    return (
        <div>
           <div ref={printRef} style={{ padding: '10px', border: '1px solid #000' }}>
                
            </div>
            <button onClick={handlePrint}>Print to PDF</button>
        </div>
    )
}

export default ScreenToPDF