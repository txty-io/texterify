import { PermissionUtils } from "../utilities/PermissionUtils";
import { dashboardStore } from "../stores/DashboardStore";
import * as React from "react";
import FormItem from "antd/lib/form/FormItem";
import { Input, Form, Tooltip } from "antd";
import { IKeysTableRecord } from "../sites/dashboard/KeysSite";
import { TranslationUtils } from "../utilities/TranslationUtils";
import { EditableCellInputPreview } from "./EditableCellInputPreview";

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
    languageId: string;
    record: IKeysTableRecord;
    handleSave: (record: IKeysTableRecord) => void;
    onCellEdit(options: { languageId: string; keyId: string }): any;
}

export const EditableCell: React.FC<IEditableCellProps> = (props: IEditableCellProps) => {
    const [editing, setEditing] = React.useState(false);
    const inputRef = React.useRef<any>();
    const form = React.useContext(EditableContext);

    if (!props.record) {
        return <td>{props.children}</td>;
    }

    const isAllowedToChangeColumn =
        props.dataIndex !== "name" || PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole());

    const isNameColumnAndNotEditable = props.dataIndex === "name" && !props.record.nameEditable;

    const isCellEditable = isAllowedToChangeColumn && !isNameColumnAndNotEditable;

    React.useEffect(() => {
        if (editing && inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        if (
            (props.record.key.attributes.html_enabled || props.record.key.attributes.pluralization_enabled) &&
            props.dataIndex !== "name" &&
            props.dataIndex !== "description"
        ) {
            props.onCellEdit({
                languageId: props.languageId,
                keyId: props.record.keyId
            });
        } else {
            setEditing(!editing);
            form.setFieldsValue({ [props.dataIndex]: props.record[props.dataIndex] });
        }
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();

            // Only save changes if content changed.
            if (values[props.dataIndex] !== props.children[1]) {
                props.handleSave({ ...props.record, ...values });
            }
        } catch (errInfo) {
            console.log("Save failed:", errInfo);
        }
    };

    return (
        <td>
            {props.editable ? (
                editing ? (
                    <FormItem style={{ margin: 0, minWidth: 320, maxWidth: "100%" }} name={props.dataIndex}>
                        <Input.TextArea
                            ref={inputRef}
                            onPressEnter={save}
                            onBlur={save}
                            autoSize
                            disabled={!isCellEditable}
                        />
                    </FormItem>
                ) : (
                    <EditableCellInputPreview
                        languageId={props.languageId}
                        record={props.record}
                        isCellEditable={isCellEditable}
                        dataIndex={props.dataIndex}
                        onClick={toggleEdit}
                    />
                )
            ) : (
                props.children
            )}
        </td>
    );
};
