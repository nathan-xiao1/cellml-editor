import React, { useState } from "react";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "./PdfViewer.scss";

interface PVProps {
  hidden: boolean;
}

export default function PdfViewer(props: PVProps): JSX.Element {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    removeTextLayerOffset();
  }

  function removeTextLayerOffset() {
    const textLayers = document.querySelectorAll(
      ".react-pdf__Page__textContent"
    );
    textLayers.forEach((layer) => {
      const { style } = layer as HTMLElement;
      style.top = "0";
      style.left = "0";
      style.transform = "";
    });
  }

  return (
    <div className={`pdf-viewer ${props.hidden ? "hidden" : ""}`}>
      <Document
        file="static/cellml_2_0_normative_specification.pdf"
        onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  );
}
