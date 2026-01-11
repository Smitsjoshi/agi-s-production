import { jsPDF } from 'jspdf';

export async function generateCertificate(userName: string, courseName: string, score: number) {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [11, 8.5]
    });

    // Background / Border
    doc.setLineWidth(0.1);
    doc.rect(0.5, 0.5, 10, 7.5);

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(40, 40, 40);
    doc.text("Certificate of Mastery", 5.5, 2.5, { align: "center" });

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.setTextColor(80, 80, 80);
    doc.text("This certifies that", 5.5, 3.5, { align: "center" });

    // Name
    doc.setFont("times", "italic");
    doc.setFontSize(40);
    doc.setTextColor(0, 0, 0);
    doc.text(userName, 5.5, 4.5, { align: "center" });

    doc.setLineWidth(0.02);
    doc.line(3, 4.6, 8, 4.6); // Underline

    // Course Details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.setTextColor(80, 80, 80);
    doc.text(`Has successfully completed the curriculum:`, 5.5, 5.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.text(courseName, 5.5, 6.0, { align: "center" });

    doc.setFontSize(15);
    doc.text(`Score: ${score}%`, 5.5, 6.5, { align: "center" });

    // Footer (AGI-S Signature)
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text("Verified by AGI-S Neural Core", 5.5, 7.5, { align: "center" });
    doc.text(`ID: ${crypto.randomUUID().substring(0, 8)}`, 5.5, 7.7, { align: "center" });

    return doc.output('bloburl');
}
