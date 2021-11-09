import React from "react";
import { PdfMultiViewer } from "react-pdfjs-multi";
import { IFileState } from "Types";

import "react-pdfjs-multi/dist/react-pdfjs-multi.css";
import "./PdfViewer2.scss";

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
  private pdfFiles = [
    {
      title: "Editor Documentation",
      source: "static/cellml_editor_documentation.pdf",
    },
    {
      title: "Editor Tutorial",
      source: "static/cellml_editor_tutorial.pdf",
    },
    {
      title: "CellML 2.0 Specification",
      source: "static/cellml_2_0_normative_specification.pdf",
    },
  ];

  private childRef: React.RefObject<PdfMultiViewer>;

  constructor(props: PVProps) {
    super(props);
    this.childRef = React.createRef<PdfMultiViewer>();
  }

  render(): React.ReactNode {
    // // if (idx == -1) idx = 0;
    // // const idxString = idx as unknown as string
    // // this.childRef.current.changePdf(idxString).
    // if (this.childRef.current != null) {
    //   let idx = this.childRef.current.state.files.findIndex(
    //     (pdfFile) => this.props.file.filepath == pdfFile.source
    //   );
    //   console.log("Idx:", idx);
    //   if (idx == -1) idx = 0;
    //   const pdfFile = this.childRef.current.state.files[idx];
    //   console.log("pdfFile:", pdfFile);
    //   this.childRef.current.changePdf(String(idx), pdfFile);
    // }
    return (
      <div
        className={`pdf-viewer-container ${this.props.hidden ? "hidden" : ""}`}
      >
        <PdfMultiViewer
          ref={this.childRef}
          pdfs={this.pdfFiles}
          autoZoom={false}
        />
      </div>
    );
  }
}
