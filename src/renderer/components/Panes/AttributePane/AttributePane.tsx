import React from "react";
import { IDOM, IDOMAttributes } from "Types";
import CellMLSchema from "src/commons/CellMLSchema";
import "./AttributePane.scss";

interface APProps {
  node: IDOM;
  attributeEditHandler: (key: string, value: string) => void;
}

export default class AttributePane extends React.Component<APProps> {
  onChangeTimeout = (() => {
    let timer: NodeJS.Timeout;
    return (callback: (key: string, value: string) => void, ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();

  render(): React.ReactNode {
    return (
      <div className="attribute-container">
        <table className="attribute-table">
          <colgroup>
            <col width="40%" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {this.props.node &&
              this.props.node.attributes.map((attribute: IDOMAttributes) => (
                <tr key={this.props.node.id + attribute.key}>
                  <td className="attribute-table-key" title={attribute.key}>
                    {attribute.key}
                  </td>
                  <td className="attribute-table-value">
                    <input
                      type="text"
                      spellCheck="false"
                      placeholder="<unset>"
                      defaultValue={attribute.value}
                      onChange={(e) =>
                        this.onChangeTimeout(
                          () =>
                            this.props.attributeEditHandler(
                              attribute.key,
                              e.target.value
                            ),
                          500
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}
