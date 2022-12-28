import { Button, Empty, Form, List, Select, Skeleton } from "antd";
import React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { IGetImportResponse, IImportFile, ImportsAPI } from "../api/v1/ImportsAPI";
import { FileFormatOptions } from "../configs/FileFormatOptions";
import useLanguages from "../hooks/useLanguages";
import FlagIcon from "./FlagIcons";

export function ImportFileAssigner(props: {
    projectId: string;
    importResponse: IGetImportResponse;
    importLoading: boolean;
    style?: React.CSSProperties;
}) {
    const { languagesResponse, languagesLoading } = useLanguages(props.projectId, {
        showAll: true
    });

    const importFiles = props.importResponse.included.filter((i) => i.type === "import_file") as IImportFile[];

    if (languagesLoading) {
        return <Skeleton active loading />;
    }

    return (
        <>
            <Form
                onFinish={async (values) => {
                    const fileLanguageAssignments = {};
                    const fileFormatAssignments = {};

                    Object.keys(values).forEach((k) => {
                        if (k.startsWith("format-")) {
                            const fileId = k.replace("format-", "");
                            fileFormatAssignments[fileId] = values[k];
                        } else if (k.startsWith("language-")) {
                            const fileId = k.replace("language-", "");
                            fileLanguageAssignments[fileId] = values[k];
                        } else {
                            console.error("[ImportFileAssinger] Unknown form value:", values[k]);
                        }
                    });

                    await ImportsAPI.verify({
                        projectId: props.projectId,
                        importId: props.importResponse.data.id,
                        fileLanguageAssignments: fileLanguageAssignments,
                        fileFormatAssignments: fileFormatAssignments
                    });
                }}
                style={{ display: "flex", flexDirection: "column" }}
            >
                <List
                    size="default"
                    loading={props.importLoading}
                    locale={{
                        emptyText: <Empty description="No import files found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }}
                    style={props.style}
                    dataSource={importFiles.sort((a, b) => {
                        return a.attributes.name.toLowerCase() < b.attributes.name.toLowerCase() ? -1 : 1;
                    })}
                    renderItem={(item) => {
                        return (
                            <List.Item
                                key={item.id}
                                data-id={`import-file-${item.id}`}
                                style={{ alignItems: "baseline" }}
                            >
                                <List.Item.Meta
                                    style={{ wordBreak: "break-word", width: 320, maxWidth: 320 }}
                                    title={item.attributes.name}
                                />
                                <div style={{ flexGrow: 1, display: "flex", gap: 40 }}>
                                    <Form.Item
                                        name={`format-${item.id}`}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select a file format."
                                            }
                                        ]}
                                        style={{ width: "50%" }}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Select a file format"
                                            optionFilterProp="children"
                                            filterOption
                                        >
                                            {FileFormatOptions.map((fileFormat, index) => {
                                                return (
                                                    <Select.Option value={fileFormat.value} key={index}>
                                                        {fileFormat.text}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        name={`language-${item.id}`}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select a language."
                                            }
                                        ]}
                                        style={{ width: "50%" }}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Select a language"
                                            optionFilterProp="children"
                                            filterOption
                                        >
                                            {languagesResponse?.data.map((language, index) => {
                                                const countryCode = APIUtils.getIncludedObject(
                                                    language.relationships.country_code.data,
                                                    languagesResponse.included
                                                );

                                                return (
                                                    <Select.Option value={language.attributes.id} key={index}>
                                                        {countryCode && (
                                                            <span style={{ marginRight: 8 }}>
                                                                <FlagIcon
                                                                    code={countryCode.attributes.code.toLowerCase()}
                                                                />
                                                            </span>
                                                        )}
                                                        {language.attributes.name}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                    </Form.Item>
                                </div>
                            </List.Item>
                        );
                    }}
                />
                <Button type="primary" htmlType="submit" style={{ alignSelf: "flex-end", marginTop: 24 }}>
                    Import
                </Button>
            </Form>
        </>
    );
}
