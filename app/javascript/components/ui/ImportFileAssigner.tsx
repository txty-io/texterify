import { FileOutlined } from "@ant-design/icons";
import { Button, Empty, Form, List, message, Select, Skeleton } from "antd";
import React from "react";
import { useQuery } from "react-query";
import { FileFormatsAPI } from "../api/v1/FileFormatsAPI";
import { IGetImportResponse, IImportFile, ImportsAPI } from "../api/v1/ImportsAPI";
import useLanguages from "../hooks/useLanguages";
import FlagIcon from "./FlagIcons";

export function ImportFileAssigner(props: {
    importResponse: IGetImportResponse;
    importLoading: boolean;
    style?: React.CSSProperties;
    onAssigningComplete(): void;
}) {
    const { data: fileFormatsData } = useQuery("fileFormats", async ({ signal }) => {
        const response = await FileFormatsAPI.getFileFormats({ signal });
        return response.data;
    });

    const { languagesResponse, languagesLoading, getCountryCodeForLanguage } = useLanguages(
        props.importResponse.data.attributes.project_id,
        {
            showAll: true
        }
    );

    const [verifying, setVerifying] = React.useState<boolean>(false);

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

                    try {
                        setVerifying(true);
                        const response = await ImportsAPI.verify({
                            projectId: props.importResponse.data.attributes.project_id,
                            importId: props.importResponse.data.id,
                            fileLanguageAssignments: fileLanguageAssignments,
                            fileFormatAssignments: fileFormatAssignments
                        });
                        if (response.error) {
                            message.error(`Failed to verify import: ${response.message}`);
                        } else {
                            props.onAssigningComplete();
                        }
                    } catch (error) {
                        console.error(error);
                        message.error("Failed to verify import.");
                    } finally {
                        setVerifying(false);
                    }
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
                                    title={
                                        <span>
                                            <FileOutlined style={{ marginRight: 8 }} />
                                            {item.attributes.name}
                                        </span>
                                    }
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
                                            data-id="import-file-assigner-select-format"
                                            data-import-file-id={item.id}
                                            data-import-name={item.attributes.name}
                                        >
                                            {fileFormatsData?.data
                                                .filter((fileFormat) => fileFormat.attributes.import_support)
                                                .map((fileFormat, index) => {
                                                    return (
                                                        <Select.Option value={fileFormat.id} key={index}>
                                                            {fileFormat.attributes.name}
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
                                            data-id="import-file-assigner-select-language"
                                            data-import-file-id={item.id}
                                            data-import-name={item.attributes.name}
                                        >
                                            {languagesResponse?.data.map((language, index) => {
                                                const countryCode = getCountryCodeForLanguage(language);

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
                <Button
                    type="primary"
                    htmlType="submit"
                    style={{ alignSelf: "flex-end", marginTop: 24 }}
                    data-id="import-file-assigner-import-button"
                    loading={verifying}
                >
                    Import
                </Button>
            </Form>
        </>
    );
}
