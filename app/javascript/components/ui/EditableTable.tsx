import { Empty, Form, Input, message, Table } from "antd";
import * as React from "react";
import { KeysAPI } from "../api/v1/KeysAPI";
import { TranslationsAPI } from "../api/v1/TranslationsAPI";
const FormItem = Form.Item;

const EditableContext = React.createContext(undefined);
const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);
const EditableFormRow = Form.create()(EditableRow);

interface IEditableCellProps {
  editable: boolean;
  dataIndex: string;
  title: any;
  record: any;
  index: any;
  handleSave: any;
  onCellEdit(options: { languageId: string; keyId: string }): any;
}
interface IEditableCellState {
  editing: boolean;
}

class EditableCell extends React.Component<IEditableCellProps, IEditableCellState> {
  form: any;
  input: any;
  cell: any;

  state: IEditableCellState = {
    editing: false
  };

  componentDidMount() {
    if (this.props.editable) {
      document.addEventListener("click", this.handleClickOutside, true);
    }
  }

  componentWillUnmount() {
    if (this.props.editable) {
      document.removeEventListener("click", this.handleClickOutside, true);
    }
  }

  toggleEdit = () => {
    if (this.props.record.htmlEnabled && this.props.dataIndex !== "name" && this.props.dataIndex !== "description") {
      this.props.onCellEdit({
        languageId: this.props.dataIndex.substr("language-".length),
        keyId: this.props.record.key
      });
    } else {
      const editing = !this.state.editing;
      this.setState({ editing }, () => {
        if (editing) {
          this.input.focus();
        }
      });
    }
  }

  handleClickOutside = (e: any) => {
    const { editing } = this.state;
    // Only save if clicked element is not the textarea.
    if (editing && !(this.cell.contains(e.target) && (e.target.tagName === "TEXTAREA"))) {
      this.save();
    }
  }

  save = () => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error) {
        console.error("Cell error");

        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  }

  render() {
    const { editing } = this.state;
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      onCellEdit,
      ...restProps
    } = this.props;

    return (
      <td ref={(node) => (this.cell = node)} {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form: any) => {
              this.form = form;

              // console.error(restProps.children);

              return (
                editing ? (
                  <FormItem style={{ margin: 0 }}>
                    {form.getFieldDecorator(dataIndex, {
                      rules: [{
                        // required: true,
                        message: `${title} is required.`
                      }],
                      initialValue: record[dataIndex]
                    })(
                      <Input.TextArea
                        ref={(node) => (this.input = node)}
                        onPressEnter={this.save}
                        autosize
                      />
                    )}
                  </FormItem>
                ) : (
                    // tslint:disable-next-line:react-no-dangerous-html
                    <div
                      className="editable-cell-value-wrap"
                      style={{ maxWidth: 400, overflow: "scroll", display: "flex", flexDirection: "column", justifyContent: "center", wordBreak: "break-all" }}
                      onClick={this.toggleEdit}
                      role="button"
                      dangerouslySetInnerHTML={
                        this.props.record.htmlEnabled ?
                          {
                            __html: restProps.children[2]
                          } :
                          undefined
                      }
                    >
                      {this.props.record.htmlEnabled ? undefined : restProps.children[2]}
                    </div>
                  )
              );
            }}
          </EditableContext.Consumer>
        ) : restProps.children}
      </td>
    );
  }
}

interface IEditableTableProps {
  dataSource: any;
  columns: any;
  style?: React.CSSProperties;
  bordered?: boolean;
  loading?: boolean;
  size?: "default" | "small" | "middle";
  projectId: any;
  pagination?: any;
  rowSelection?: any;
  onCellEdit(options: { languageId: string; keyId: string }): void;
  onTranslationUpdated(translation: any): void;
  onKeyUpdated(key: any): void;
}
interface IEditableTableState {
  dataSource: any[];
}

class EditableTable extends React.Component<IEditableTableProps, IEditableTableState> {
  static getDerivedStateFromProps(props: IEditableTableProps) {
    return {
      dataSource: props.dataSource
    };
  }

  constructor(props: IEditableTableProps) {
    super(props);

    this.state = {
      dataSource: props.dataSource
    };
  }

  handleDelete = (key: any) => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter((item) => item.key !== key) });
  }

  handleSave = async (row: any) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((data) => row.key === data.key);
    const oldRow = newData[index];
    const newItem = {
      ...oldRow,
      ...row
    };

    if (row.name.trim() === "") {
      message.error("Name can't be empty.");

      return;
    }

    if (oldRow.name !== row.name || oldRow.description !== row.description) {
      const response = await KeysAPI.update(
        this.props.projectId,
        row.key,
        row.name,
        row.description,
        row.html_enabled
      );
      this.props.onKeyUpdated(response.data);
      if (response.errors) {
        return;
      }
    } else {
      const keys = Object.keys(newItem);
      let languageKey;
      for (const key of keys) {
        if (key.startsWith("language-")) {
          languageKey = key.slice("language-".length);
          const hasTranslation = keys.indexOf(`translation-exists-for-${languageKey}`) !== -1;

          let response;
          if (!hasTranslation) {
            response = await TranslationsAPI.createTranslation(
              this.props.projectId,
              languageKey,
              newItem.key,
              newItem[`language-${languageKey}`]
            );
            newItem[`translation-exists-for-${languageKey}`] = response.data.id;
          } else {
            response = await TranslationsAPI.updateTranslation(
              this.props.projectId,
              newItem[`translation-exists-for-${languageKey}`],
              newItem[`language-${languageKey}`]
            );
          }

          this.props.onTranslationUpdated(response.data);

          if (response.error) {
            return;
          }
        }
      }
    }

    newData.splice(index, 1, newItem);
    this.setState({ dataSource: newData });
  }

  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell
      }
    };
    const columns = this.props.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => {
          return {
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave: this.handleSave,
            onCellEdit: this.props.onCellEdit,
            width: 400
          };
        }
      };
    });

    return (
      <Table
        rowSelection={this.props.rowSelection}
        components={components}
        rowClassName={() => "editable-row"}
        bordered={this.props.bordered}
        dataSource={dataSource}
        columns={columns}
        style={this.props.style}
        loading={this.props.loading}
        size={this.props.size}
        pagination={this.props.pagination}
        locale={{ emptyText: <Empty description="No keys found" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      />
    );
  }
}

export { EditableTable };
