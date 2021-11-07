import React from "react";
import { IDOM, IDOMAttributes } from "Types";
import CellMLSchema, {
  IAttribute as ISchemaAttribute,
} from "src/commons/CellMLSchema";
import "./AttributePane.scss";

interface APProps {
  node: IDOM;
  attributeEditHandler: (key: string, value: string) => void;
}

export default class AttributePane extends React.Component<APProps> {
  constructor(props: APProps) {
    super(props);
  }

  onChangeTimeout = (() => {
    let timer: NodeJS.Timeout;
    return (callback: (key: string, value: string) => void, ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();

  render(): React.ReactNode {
    const schemaNode = this.props.node
      ? CellMLSchema.get(this.props.node.name)
      : null;
    const schemaAttributes = schemaNode ? schemaNode.attributes : [];
    return (
      <div className="attribute-container">
        <table className="attribute-table">
          <colgroup>
            <col width="40%" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {this.props.node &&
              schemaAttributes.map((schemaAttr: ISchemaAttribute) => {
                const domAttribute = this.props.node.attributes.find(
                  (domAttr) => domAttr.key === schemaAttr.name
                );
                let attribute: IDOMAttributes;
                if (domAttribute) {
                  attribute = domAttribute;
                } else {
                  attribute = { key: schemaAttr.name, value: undefined };
                }
                return (
                  <tr key={this.props.node.id + attribute.key}>
                    <td className="attribute-table-key" title={attribute.key + (schemaAttr.required ? " (Required)" : "")}>
                      {attribute.key}
                      {schemaAttr.required && "*"}
                    </td>
                    <td className="attribute-table-value">
                      <input
                        className={`${
                          (schemaAttr.required && attribute.value == undefined)
                            ? "input-required"
                            : "nope"
                        }`}
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
                );
              })}
            {/* {this.props.node &&
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
              ))} */}
          </tbody>
        </table>
      </div>
    );
  }
}
