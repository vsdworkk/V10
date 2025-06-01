/**
 * Type declarations for html2pdf.js library
 */

declare module "html2pdf.js" {
  interface Html2PdfWrapper {
    from(element: HTMLElement): Html2PdfWrapper
    set(options?: Html2PdfOptions): Html2PdfWrapper
    save(): Promise<void>
  }

  interface Html2PdfOptions {
    margin?: number
    filename?: string
    image?: {
      type?: string
      quality?: number
    }
    html2canvas?: Record<string, any>
    jsPDF?: {
      unit?: string
      format?: string
      orientation?: string
    }
  }

  function html2pdf(): Html2PdfWrapper
  export = html2pdf
}
