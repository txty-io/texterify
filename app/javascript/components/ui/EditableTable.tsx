import { Form, Input, message, Table } from "antd";
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
  dataIndex: any;
  title: any;
  record: any;
  index: any;
  handleSave: any;
}
interface IEditableCellState {
  editing: boolean;
}

class EditableCell extends React.Component<IEditableCellProps, IEditableCellState> {
  form: any;
  input: any;
  cell: any;

  constructor(props: IEditableCellProps) {
    super(props);

    this.state = { editing: false };
  }

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
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  }

  handleClickOutside = (e: any) => {
    const { editing } = this.state;
    if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
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
      ...restProps
    } = this.props;

    return (
      <td ref={(node) => (this.cell = node)} {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form: any) => {
              this.form = form;

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
                    <div
                      className="editable-cell-value-wrap"
                      style={{ maxWidth: 400, overflow: "scroll", display: "flex", alignItems: "center", wordBreak: "break-all" }}
                      onClick={this.toggleEdit}
                      role="button"
                    >
                      {restProps.children}
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
}
interface IEditableTableState {
  dataSource: any[];
}

class EditableTable extends React.Component<IEditableTableProps, IEditableTableState> {
  constructor(props: IEditableTableProps) {
    super(props);

    this.state = {
      dataSource: this.props.dataSource
    };
  }

  componentWillReceiveProps(props: IEditableTableProps) {
    this.setState({
      dataSource: props.dataSource
    });
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
        row.description
      );
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
          } else {
            response = await TranslationsAPI.updateTranslation(
              this.props.projectId,
              newItem[`translation-exists-for-${languageKey}`],
              newItem[`language-${languageKey}`]
            );
          }

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
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
          width: 400
        })
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
      />
    );
  }
}

export { EditableTable };
