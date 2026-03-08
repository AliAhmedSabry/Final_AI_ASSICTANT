import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  title: string;
  subtitle?: string;
  userName?: string;
  theme?: 'dark' | 'light';
  fileName?: string;
  orientation?: 'p' | 'l';
}

export const generateNeuralPDF = async (element: HTMLElement, options: PDFOptions) => {
  const { 
    title, 
    subtitle = 'ACADEMIC INTELLIGENCE REPORT', 
    userName = 'GUEST_EXPLORER', 
    theme = 'light', // Defaulting to light for better PDF print quality
    fileName = 'Neural_Report',
    orientation = 'p'
  } = options;

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20; // Increased margin for a cleaner look
    const contentWidth = pageWidth - (margin * 2);

    // Prepare element for capture
    const originalStyle = element.getAttribute('style') || '';
    element.style.width = '800px';
    element.style.padding = '0'; // We handle padding via PDF margins
    element.style.margin = '0';
    element.style.background = '#ffffff'; // Force white background for "Pro" look
    element.style.color = '#111111';
    element.style.fontFamily = "'Georgia', serif"; // Academic font

    const addBranding = (pdfDoc: jsPDF) => {
      const totalPages = (pdfDoc.internal as any).getNumberOfPages();
      
      for (let i = 1; i <= totalPages; i++) {
        pdfDoc.setPage(i);
        
        // --- Sharp Native Header ---
        pdfDoc.setFillColor(20, 20, 20); // Deep Obsidian
        pdfDoc.rect(0, 0, pageWidth, 2, 'F'); // Top accent line

        // Branding
        pdfDoc.setTextColor(40, 40, 40);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(14);
        pdfDoc.text('NEURAL STUDY AI', margin, 15);
        
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setFontSize(7);
        pdfDoc.setTextColor(100, 100, 100);
        pdfDoc.text(subtitle.toUpperCase(), margin, 19);

        // Page Number
        pdfDoc.setFontSize(8);
        pdfDoc.text(`PAGE ${i} / ${totalPages}`, pageWidth - margin, 15, { align: 'right' });

        // User HUD (Mini)
        pdfDoc.setFontSize(6);
        pdfDoc.setTextColor(150, 150, 150);
        pdfDoc.text(`UNIT: ${userName.toUpperCase()}`, pageWidth - margin, 19, { align: 'right' });

        // --- Sharp Native Footer ---
        pdfDoc.setDrawColor(230, 230, 230);
        pdfDoc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        pdfDoc.setFontSize(6);
        pdfDoc.text(`SECURE ACADEMIC EXPORT // GENERATED: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    };

    // Temporarily enable PDF-only elements
    const pdfOnlyElements = element.querySelectorAll('.pdf-only');
    pdfOnlyElements.forEach(el => {
      (el as HTMLElement).style.setProperty('display', 'block', 'important');
    });

    await pdf.html(element, {
      callback: (doc) => {
        addBranding(doc);
        doc.save(`${fileName}_${new Date().getTime()}.pdf`);
        element.setAttribute('style', originalStyle);
        pdfOnlyElements.forEach(el => {
          (el as HTMLElement).style.removeProperty('display');
        });
      },
      x: margin,
      y: 25, // Start below our native header
      width: contentWidth,
      windowWidth: 800,
      autoPaging: 'text',
      html2canvas: {
        scale: 0.28, // High fidelity resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true
      }
    });

    return true;
  } catch (err) {
    console.error("PDF Engine Error:", err);
    throw err;
  }
};
