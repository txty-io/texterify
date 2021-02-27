import { PermissionUtils } from "../utilities/PermissionUtils";
import { dashboardStore } from "../stores/DashboardStore";
import * as React from "react";
import FormItem from "antd/lib/form/FormItem";
import { Input, Form } from "antd";

interface IEditableRowProps {
    index: number;
}

const EditableContext = React.createContext<any>(undefined);

export const EditableRow: React.FC<IEditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();

    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

interface IEditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: string;
    record: any;
    handleSave: (record: any) => void;
    onCellEdit(options: { languageId: string; keyId: string; exportConfigId?: string }): any;
}

export const EditableCell: React.FC<IEditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    onCellEdit,
    ...restProps
}) => {
    const [editing, setEditing] = React.useState(false);
    const inputRef = React.useRef();
    const form = React.useContext(EditableContext);
    const isCellEditEnabled =
        dataIndex !== "name" || PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole());

    React.useEffect(() => {
        if (editing) {
            // eslint-disable-next-line no-unused-expressions
            inputRef.current?.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        if (record.htmlEnabled && dataIndex !== "name" && dataIndex !== "description") {
            onCellEdit({
                languageId: dataIndex.substr("language-".length),
                keyId: record.keyId,
                exportConfigId: record.exportConfigId
            });
        } else {
            setEditing(!editing);
            form.setFieldsValue({ [dataIndex]: record[dataIndex] });
        }
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();

            // Only save changes if content changed.
            if (values[dataIndex] !== children[1]) {
                handleSave({ ...record, ...values });
            }
        } catch (errInfo) {
            console.log("Save failed:", errInfo);
        }
    };

    return (
        <td {...restProps}>
            {editable ? (
                editing ? (
                    <FormItem style={{ margin: 0 }} name={dataIndex}>
                        <Input.TextArea ref={inputRef} onPressEnter={save} onBlur={save} autoSize />
                    </FormItem>
                ) : (
                    <div
                        className={isCellEditEnabled ? "editable-cell-value-wrap" : undefined}
                        style={{
                            minWidth: 320,
                            maxWidth: "100%",
                            overflow: "auto",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            wordBreak: "break-word"
                        }}
                        onClick={isCellEditEnabled ? toggleEdit : undefined}
                        role="button"
                        dangerouslySetInnerHTML={
                            record.htmlEnabled
                                ? {
                                      __html: children[1]
                                  }
                                : undefined
                        }
                    >
                        {record.htmlEnabled ? undefined : children[1]}
                    </div>
                )
            ) : (
                children
            )}
        </td>
    );
};
