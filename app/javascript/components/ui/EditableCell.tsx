import { Form, Input } from "antd";
import FormItem from "antd/lib/form/FormItem";
import * as React from "react";
import { useOrganization } from "../network/useOrganization";
import { IKeysTableRecord } from "../sites/dashboard/KeysSite";
import { dashboardStore } from "../stores/DashboardStore";
import { PermissionUtils } from "../utilities/PermissionUtils";
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

export interface IEditableCellFormValues {
    [key: string]: string;
}

interface IEditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: string;
    languageId: string;
    record?: IKeysTableRecord;

    // antd injected properties
    className?: string;
    colSpan?: number;
    rowSpan?: number;

    handleSave: (data: { record: IKeysTableRecord; values: IEditableCellFormValues }) => void;
    onCellEdit(options: { languageId: string; keyId: string; flavorId: string }): void;
}

export const EditableCell: React.FC<IEditableCellProps> = (props: IEditableCellProps) => {
    const [editing, setEditing] = React.useState(false);
    const inputRef = React.useRef<any>();
    const form = React.useContext(EditableContext);

    const { data: organizationResponse } = useOrganization({
        organizationId: props.record?.organizationId
    });

    if (!props.record) {
        return (
            <td className={props.className} colSpan={props.colSpan} rowSpan={props.rowSpan}>
                {props.children}
            </td>
        );
    }

    const isAllowedToChangeColumn =
        props.dataIndex !== "name" || PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole());

    const isNameColumnAndNotEditable = props.dataIndex === "name" && !props.record.nameEditable;
    const isEditableForCurrentUser = props.record.keyObject.attributes.editable_for_current_user;

    const isCellEditable =
        isAllowedToChangeColumn &&
        !isNameColumnAndNotEditable &&
        isEditableForCurrentUser &&
        !organizationResponse?.data.attributes.key_limit_reached;

    React.useEffect(() => {
        if (editing && inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        if (
            (props.record.keyObject.attributes.html_enabled ||
                props.record.keyObject.attributes.pluralization_enabled) &&
            props.dataIndex !== "name" &&
            props.dataIndex !== "description"
        ) {
            props.onCellEdit({
                languageId: props.languageId,
                keyId: props.record.keyId,
                flavorId: props.record.flavorId
            });
        } else {
            setEditing(!editing);

            if (props.languageId) {
                const languageTranslations = props.record.translations[props.languageId] || {};
                form.setFieldsValue({
                    [props.dataIndex]: languageTranslations[props.record.flavorId]?.attributes.content
                });
            } else {
                form.setFieldsValue({
                    [props.dataIndex]: props.record[props.dataIndex]
                });
            }
        }
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();

            // Only save changes if content changed.
            if (values[props.dataIndex] !== props.children[1]) {
                props.handleSave({ record: props.record, values: values });
            }
        } catch (errInfo) {
            console.log("Save failed:", errInfo);
        }
    };

    return (
        <td className={props.className} colSpan={props.colSpan} rowSpan={props.rowSpan}>
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
                        flavorId={props.record.flavorId}
                    />
                )
            ) : (
                props.children
            )}
        </td>
    );
};
