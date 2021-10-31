import React from "react";
import { pdfjs, Document, Page } from "react-pdf/dist/esm/entry.webpack";
import PlusIcon from "@material-ui/icons/Add";
import MinusIcon from "@material-ui/icons/Remove";
import { IFileState } from "Types";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "./PdfViewer.scss";

pdfjs.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";

interface PVProps {
  hidden: boolean;
  file: IFileState;
}

interface PVState {
  numPages: number;
  pageNumber: number;
  scale: number;
}

export default class PdfViewer extends React.Component<PVProps, PVState> {
  constructor(props: PVProps) {
    super(props);
    this.state = {
      numPages: null,
      pageNumber: 1,
      scale: 1,
    };
  }

  onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    this.setState({ numPages: numPages });
    this.removeTextLayerOffset();
  }

  removeTextLayerOffset(): void {
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

  zoomIn(): void {
    this.setState((prevState) => ({
      scale: prevState.scale + 0.2,
    }));
  }

  zoomOut(): void {
    this.setState((prevState) => ({
      scale: prevState.scale - 0.2,
    }));
  }

  render(): React.ReactNode {
    return (
      <div
        className={`pdf-viewer-container ${this.props.hidden ? "hidden" : ""}`}
      >
        <div className="pdf-viewer-control-container">
          <MinusIcon
            style={{ fontSize: 16, cursor: "pointer" }}
            onClick={this.zoomOut.bind(this)}
          />
          <span className="zoom-level-label" title="Zoom Level">
            {Math.round(this.state.scale * 100)}%
          </span>
          <PlusIcon
            style={{ fontSize: 16, cursor: "pointer" }}
            onClick={this.zoomIn.bind(this)}
          />
        </div>
        <div className="pdf-viewer">
          <Document
            file={this.props.hidden ? undefined : this.props.file.filepath}
            onLoadSuccess={this.onDocumentLoadSuccess.bind(this)}
          >
            {/* <Page
              key={`page_${this.state.pageNumber}`}
              pageNumber={this.state.pageNumber}
              scale={this.state.scale}
            /> */}
            {Array.from(new Array(this.state.numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                scale={this.state.scale}
              />
            ))}
          </Document>
        </div>
      </div>
    );
  }
}
