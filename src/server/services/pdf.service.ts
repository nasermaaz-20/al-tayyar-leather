import PDFDocument from 'pdfkit';
import { readFileSync } from 'fs';
import { join } from 'path';

// Brand colors from logo
const COLORS = {
  primary: '#8B4513',    // Saddle Brown
  secondary: '#D2691E',  // Chocolate
  accent: '#CD853F',     // Peru/Tan
  gold: '#DAA520',       // Goldenrod
  text: '#333333',
  lightText: '#666666',
  border: '#E5E5E5',
};

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price?: number | null;
  images: Array<{ url: string; alt: string; order: number }>;
  colors: Array<{ nameAr: string; nameEn: string; hexCode: string }>;
  categories: Array<{ nameAr: string; nameEn: string }>;
}

export class PDFService {
  /**
   * Generate a PDF catalog of products
   * @param products Array of products to include in the catalog
   * @param locale Language locale ('ar' for Arabic, 'en' for English)
   * @returns Buffer containing the PDF document
   */
  async generateCatalog(products: Product[], locale: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const isRTL = locale === 'ar';
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          bufferPages: true,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Add header with logo and branding
        this.addHeader(doc, locale, isRTL);

        // Add products
        products.forEach((product, index) => {
          if (index > 0) {
            doc.addPage();
          }
          this.addProduct(doc, product, locale, isRTL);
        });

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header with logo and branding to the PDF
   */
  private addHeader(doc: PDFKit.PDFDocument, locale: string, isRTL: boolean): void {
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;

    try {
      // Try to load and add logo
      const logoPath = join(process.cwd(), 'img', 'logo.jpg');
      const logoBuffer = readFileSync(logoPath);
      
      // Add logo at top center
      const logoWidth = 80;
      const logoHeight = 80;
      const logoX = (pageWidth - logoWidth) / 2;
      
      doc.image(logoBuffer, logoX, 50, {
        width: logoWidth,
        height: logoHeight,
        fit: [logoWidth, logoHeight],
        align: 'center',
      });

      // Add title below logo
      doc.moveDown(6);
    } catch (error) {
      // If logo not found, just add title
      doc.moveDown(2);
    }

    // Add catalog title
    const title = locale === 'ar' ? 'كتالوج المنتجات' : 'Product Catalog';
    doc
      .fontSize(24)
      .fillColor(COLORS.primary)
      .font('Helvetica-Bold')
      .text(title, margin, doc.y, {
        width: pageWidth - 2 * margin,
        align: 'center',
      });

    // Add decorative line
    doc
      .moveDown(1)
      .strokeColor(COLORS.gold)
      .lineWidth(2)
      .moveTo(margin + 100, doc.y)
      .lineTo(pageWidth - margin - 100, doc.y)
      .stroke();

    doc.moveDown(2);
  }

  /**
   * Add a single product to the PDF
   */
  private addProduct(
    doc: PDFKit.PDFDocument,
    product: Product,
    locale: string,
    isRTL: boolean
  ): void {
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;
    const contentWidth = pageWidth - 2 * margin;

    const name = locale === 'ar' ? product.nameAr : product.nameEn;
    const description = locale === 'ar' ? product.descAr : product.descEn;

    // Product name
    doc
      .fontSize(18)
      .fillColor(COLORS.primary)
      .font('Helvetica-Bold')
      .text(name, margin, doc.y, {
        width: contentWidth,
        align: isRTL ? 'right' : 'left',
      });

    doc.moveDown(0.5);

    // Add product image if available
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      try {
        // Try to load the image from the file system
        const imagePath = join(process.cwd(), 'public', firstImage.url);
        const imageBuffer = readFileSync(imagePath);
        
        const imageWidth = 200;
        const imageHeight = 200;
        const imageX = isRTL ? pageWidth - margin - imageWidth : margin;

        doc.image(imageBuffer, imageX, doc.y, {
          width: imageWidth,
          height: imageHeight,
          fit: [imageWidth, imageHeight],
        });

        doc.moveDown(12);
      } catch (error) {
        // If image not found, skip it
        console.warn(`Image not found: ${firstImage.url}`);
      }
    }

    // Price (if available)
    if (product.price !== null && product.price !== undefined) {
      const priceLabel = locale === 'ar' ? 'السعر:' : 'Price:';
      const priceText = `${priceLabel} ${product.price}`;
      
      doc
        .fontSize(14)
        .fillColor(COLORS.gold)
        .font('Helvetica-Bold')
        .text(priceText, margin, doc.y, {
          width: contentWidth,
          align: isRTL ? 'right' : 'left',
        });

      doc.moveDown(0.5);
    }

    // Colors (if available)
    if (product.colors && product.colors.length > 0) {
      const colorsLabel = locale === 'ar' ? 'الألوان المتاحة:' : 'Available Colors:';
      
      doc
        .fontSize(12)
        .fillColor(COLORS.text)
        .font('Helvetica-Bold')
        .text(colorsLabel, margin, doc.y, {
          width: contentWidth,
          align: isRTL ? 'right' : 'left',
        });

      doc.moveDown(0.3);

      // Display color names and swatches
      const colorNames = product.colors
        .map((color) => (locale === 'ar' ? color.nameAr : color.nameEn))
        .join(', ');

      doc
        .fontSize(11)
        .fillColor(COLORS.lightText)
        .font('Helvetica')
        .text(colorNames, margin, doc.y, {
          width: contentWidth,
          align: isRTL ? 'right' : 'left',
        });

      doc.moveDown(0.5);
    }

    // Description
    const descLabel = locale === 'ar' ? 'الوصف:' : 'Description:';
    
    doc
      .fontSize(12)
      .fillColor(COLORS.text)
      .font('Helvetica-Bold')
      .text(descLabel, margin, doc.y, {
        width: contentWidth,
        align: isRTL ? 'right' : 'left',
      });

    doc.moveDown(0.3);

    doc
      .fontSize(11)
      .fillColor(COLORS.lightText)
      .font('Helvetica')
      .text(description, margin, doc.y, {
        width: contentWidth,
        align: isRTL ? 'right' : 'left',
      });

    // Add decorative bottom border
    doc.moveDown(1);
    doc
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .moveTo(margin, doc.y)
      .lineTo(pageWidth - margin, doc.y)
      .stroke();
  }
}

// Export singleton instance
export const pdfService = new PDFService();
