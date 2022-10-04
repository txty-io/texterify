import { Empty, Table } from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import * as React from "react";
import { EditableRow, EditableCell, IEditableCellFormValues } from "./EditableCell";
import { TablePaginationConfig } from "antd/lib/table";
import { IKey } from "../api/v1/KeysAPI";
import { IKeysTableRecord } from "../sites/dashboard/KeysSite";

interface IEditableTableProps {
    dataSource: any;
    columns: any;
    style?: React.CSSProperties;
    bordered?: boolean;
    loading?: boolean;
    size?: SizeType;
    projectId: string;
    pagination?: false | TablePaginationConfig;
    rowSelection?: any;
    expandedRowRender?: any;
    className?: string;
    showHeader?: boolean;
    onSave(data: { record: IKeysTableRecord; values: IEditableCellFormValues }): Promise<void>;
    onCellEdit(options: { languageId: string; keyId: string; exportConfigId?: string }): void;
    onTranslationUpdated(translation: any): void;
    onKeyUpdated(key: IKey): void;
}
interface IEditableTableState {
    dataSource: IKeysTableRecord[];
}

class EditableTable extends React.Component<IEditableTableProps, IEditableTableState> {
    constructor(props: IEditableTableProps) {
        super(props);

        this.state = {
            dataSource: props.dataSource
        };
    }

    static getDerivedStateFromProps(props: IEditableTableProps) {
        return {
            dataSource: props.dataSource
        };
    } 

    handleDelete = (key: IKey) => {
        const dataSource = [...this.state.dataSource];
        this.setState({
            dataSource: dataSource.filter((item) => {
                return item.keyObject !== key;
            })
        });
    };

    handleSave = async (data: { record: IKeysTableRecord; values: IEditableCellFormValues }) => {
        // const newData = [...this.state.dataSource];
        // const index = newData.findIndex((item) => {
        //     return item.keyObject.id === data.record.keyObject.id;
        // });
        // const oldRow = newData[index];
        // const newItem = {
        //     ...oldRow,
        //     ...row
        // };

        await this.props.onSave(data);

        // newData.splice(index, 1, newItem);
        // this.setState({ dataSource: newData });
    };

    render() {
        const { dataSource } = this.state;
        const components = {
            body: {
                row: EditableRow,
                cell: EditableCell
            }
        };
        const columns = this.props.columns.map((col) => {
            if (!col.editable) {
                return col;
            }

            return {
                ...col,
                onCell: (record: IKeysTableRecord) => {
                    return {
                        record: record,
                        ...col,
                        handleSave: this.handleSave,
                        onCellEdit: this.props.onCellEdit
                    };
                }
            };
        });

        return (
            <Table
                expandedRowRender={this.props.expandedRowRender}
                rowSelection={this.props.rowSelection}
                components={components}
                className={this.props.className}
                rowClassName={() => {
                    return "editable-row";
                }}
                showHeader={this.props.showHeader}
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
