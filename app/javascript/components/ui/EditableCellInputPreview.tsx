import { LockOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import * as React from "react";
import { ITranslation } from "../api/v1/TranslationsAPI";
import { IKeysTableRecord } from "../sites/dashboard/KeysSite";
import { escapeHTML } from "./Utils";

function PluralHeader(props: { children: React.ReactNode; isFirst: boolean }) {
    return (
        <div
            style={{
                marginTop: props.isFirst ? 0 : 16,
                fontSize: 12,
                fontWeight: "bold",
                marginBottom: 4,
                marginLeft: 11,
                color: "var(--color-passive)"
            }}
        >
            {props.children}
        </div>
    );
}

export function EditableCellInputPreview(props: {
    record: IKeysTableRecord;
    isCellEditable: boolean;
    dataIndex: string;
    languageId: string;
    flavorId: string;
    onClick(): void;
}) {
    const isNameColumnAndNotEditable = props.dataIndex === "name" && !props.record.nameEditable;

    function EditableInput(editableInputProps: { content: any }) {
        return (
            <div
                className={props.isCellEditable ? "editable-cell-value-wrap" : undefined}
                style={{
                    minWidth: 320,
                    maxWidth: "100%",
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    wordBreak: "break-word",
                    color: !props.record.keyObject.attributes.editable_for_current_user
                        ? "var(--color-passive)"
                        : undefined
                }}
                data-id="editable-cell-content"
                onClick={props.isCellEditable ? props.onClick : undefined}
                role="button"
                dangerouslySetInnerHTML={
                    props.record.keyObject.attributes.html_enabled
                        ? {
                              __html: escapeHTML(editableInputProps.content)
                          }
                        : undefined
                }
            >
                {props.record.keyObject.attributes.html_enabled ? undefined : editableInputProps.content}
            </div>
        );
    }

    let content: JSX.Element;
    if (props.dataIndex === "name") {
        if (props.record.keyObject.attributes.editable_for_current_user) {
            content = EditableInput({ content: props.record.name });
        } else {
            content = (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "var(--color-passive)"
                    }}
                >
                    {props.record.keyObject.attributes.name}
                    {!props.record.keyObject.attributes.editable_for_current_user && (
                        <Tooltip title="You are not allowed to edit this key. This key is either a system key or editing has been disabled via one of the assigned tags.">
                            <LockOutlined style={{ marginLeft: 8 }} />
                        </Tooltip>
                    )}
                </div>
            );
        }
    } else if (props.dataIndex === "description") {
        content = EditableInput({ content: props.record.description });
    } else {
        const language = props.record.languages.find((l) => {
            return l.id === props.languageId;
        });

        if (!language) {
            console.error("Failed to find langugage with ID:", props.languageId);
            return null;
        }

        const languageTranslations = props.record.translations[language.id] || {};

        const translation: ITranslation | undefined = languageTranslations[props.flavorId || null];

        if (props.record.keyObject.attributes.pluralization_enabled) {
            let firstItem: "zero" | "one" | "two" | "few" | "many" | "other";
            if (language.attributes.supports_plural_zero) {
                firstItem = "zero";
            } else if (language.attributes.supports_plural_one) {
                firstItem = "one";
            } else if (language.attributes.supports_plural_two) {
                firstItem = "two";
            } else if (language.attributes.supports_plural_few) {
                firstItem = "few";
            } else if (language.attributes.supports_plural_many) {
                firstItem = "many";
            } else {
                firstItem = "other";
            }

            content = (
                <>
                    {language.attributes.supports_plural_zero && (
                        <>
                            <PluralHeader isFirst={firstItem === "zero"}>Zero</PluralHeader>
                            <EditableInput content={translation?.attributes.zero} />
                        </>
                    )}
                    {language.attributes.supports_plural_one && (
                        <>
                            <PluralHeader isFirst={firstItem === "one"}>One</PluralHeader>
                            <EditableInput content={translation?.attributes.one} />
                        </>
                    )}
                    {language.attributes.supports_plural_two && (
                        <>
                            <PluralHeader isFirst={firstItem === "two"}> Two</PluralHeader>
                            <EditableInput content={translation?.attributes.two} />
                        </>
                    )}
                    {language.attributes.supports_plural_few && (
                        <>
                            <PluralHeader isFirst={firstItem === "few"}>Few</PluralHeader>
                            <EditableInput content={translation?.attributes.few} />
                        </>
                    )}
                    {language.attributes.supports_plural_many && (
                        <>
                            <PluralHeader isFirst={firstItem === "many"}>Many</PluralHeader>
                            <EditableInput content={translation?.attributes.many} />
                        </>
                    )}
                    <>
                        <PluralHeader isFirst={firstItem === "other"}>Other</PluralHeader>
                        <EditableInput content={translation?.attributes.content} />
                    </>
                </>
            );
        } else {
            content = <EditableInput content={translation?.attributes.content} />;
        }
    }

    if (isNameColumnAndNotEditable) {
        return <Tooltip title="The name of keys synced with WordPress can't be changed.">{content}</Tooltip>;
    }

    return <div style={{ minWidth: 320, maxWidth: "100%" }}>{content}</div>;
}
