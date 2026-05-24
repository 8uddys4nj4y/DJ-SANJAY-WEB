import { PDFDocument } from 'pdf-lib';

/**
 * Loads a PDF template, fills the form fields by matching their placeholder text values,
 * flattens the form, and returns the raw PDF bytes.
 */
async function generateFilledPdf(data: {
  packageType: 'silver' | 'gold';
  invoiceNumber: string;
  invoiceDate: string;
  customerPhone: string;
  customerDetails: string;
}): Promise<Uint8Array> {
  const templatePath =
    data.packageType === 'silver'
      ? '/invoice/silver-package-inv-draft.pdf'
      : '/invoice/gold-package-inv-draft.pdf';

  const existingPdfBytes = await fetch(templatePath).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  // The sejda.com PDF fields have auto-generated names like text_1llpr, textarea_4mixw etc.
  // But each field's current text value IS the placeholder name we defined:
  //   "invoiceNumber", "invoiceDate", "customerPhone", "customerDetails"
  // So we iterate all fields, check the current text, and replace with real data.
  const placeholderToValue: Record<string, string> = {
    invoiceNumber: data.invoiceNumber,
    invoiceDate: data.invoiceDate,
    customerPhone: data.customerPhone,
    customerDetails: data.customerDetails,
  };

  for (const field of form.getFields()) {
    const name = field.getName();
    try {
      const textField = form.getTextField(name);
      const currentText = textField.getText() || '';
      if (placeholderToValue[currentText] !== undefined) {
        textField.setText(placeholderToValue[currentText]);
      }
    } catch {
      // Not a text field, skip
    }
  }

  form.flatten();
  return await pdfDoc.save();
}

/**
 * Generates a filled PDF and returns a blob URL for embedding/preview.
 */
export async function getInvoicePreviewUrl(data: {
  packageType: 'silver' | 'gold';
  invoiceNumber: string;
  invoiceDate: string;
  customerPhone: string;
  customerDetails: string;
}): Promise<string> {
  const pdfBytes = await generateFilledPdf(data);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

/**
 * Generates a filled PDF and triggers a browser download.
 */
export async function generateInvoice(data: {
  packageType: 'silver' | 'gold';
  invoiceNumber: string;
  invoiceDate: string;
  customerPhone: string;
  customerDetails: string;
}) {
  const pdfBytes = await generateFilledPdf(data);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `DJ_Sanjay_${data.packageType.toUpperCase()}_Invoice_${data.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
