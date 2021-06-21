import { FileTextOutlined } from "@ant-design/icons";
import { Alert, Button, message, Select, Tag } from "antd";
import AppleLogoBlack from "images/apple_logo_black.svg";
import AppleLogoWhite from "images/apple_logo_white.svg";
import AndroidLogo from "images/android_logo.svg";
import FormatJSLogo from "images/formatjs_logo.svg";
import GoLogo from "images/go_logo_blue.svg";
import JSONLogo from "images/json_logo.svg";
import TOMLLogo from "images/toml_logo.png";
import RailsLogo from "images/rails_logo.svg";
import { observer } from "mobx-react";
import * as React from "react";
import Dropzone from "react-dropzone";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { APIUtils } from "../api/v1/APIUtils";
import { ExportConfigsAPI, IGetExportConfigsResponse } from "../api/v1/ExportConfigsAPI";
import { IGetLanguagesResponse, LanguagesAPI } from "../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { Routes } from "../routing/Routes";
import { ImportFileFormats } from "../sites/dashboard/ImportSite";
import { generalStore } from "../stores/GeneralStore";
import { DropZoneWrapper } from "./DropZoneWrapper";
import FlagIcon from "./FlagIcons";
import { HoverCard } from "./HoverCard";
import { LoadingOverlay } from "./LoadingOverlay";

const SUPPORTED_FORMATS: {
    image: any;
    imageDarkMode?: any;
    name: string;
    format: string[];
    id: ImportFileFormats;
    disabled?: boolean;
}[] = [
    {
        image: AppleLogoBlack,
        imageDarkMode: AppleLogoWhite,
        name: "iOS",
        format: [".strings"],
        id: "ios"
    },
    {
        image: AndroidLogo,
        name: "Android",
        format: [".xml"],
        id: "android",
        disabled: true
    },
    {
        image: JSONLogo,
        name: "JSON Flat",
        format: [".json"],
        id: "json"
    },
    {
        image: JSONLogo,
        name: "JSON Nested",
        format: [".json"],
        id: "json-nested",
        disabled: true
    },
    {
        image: FormatJSLogo,
        name: "JSON FormatJS",
        format: [".json"],
        id: "json-formatjs"
    },
    {
        image: GoLogo,
        name: "go-i18n",
        format: [".toml"],
        id: "toml"
    },
    {
        image: TOMLLogo,
        name: "TOML",
        format: [".toml"],
        id: "toml"
    },
    {
        image: RailsLogo,
        name: "Rails",
        format: [".yml", ".yaml"],
        id: "rails",
        disabled: true
    }
];

function getFileEndingForSelectedFormat(selectedImportFormat: string) {
    if (selectedImportFormat === "json") {
        return ".json";
    } else if (selectedImportFormat === "json-nested") {
        return ".json";
    } else if (selectedImportFormat === "json-formatjs") {
        return ".json";
    } else if (selectedImportFormat === "ios") {
        return ".strings";
    } else if (selectedImportFormat === "toml") {
        return ".toml";
    }
}

export const TranslationFileImporter = observer(() => {
    const params = useParams<{ organizationId?: string; projectId?: string }>();

    const [languagesResponse, setLanguagesResponse] = React.useState<IGetLanguagesResponse>();
    const [selectedLanguageId, setSelectedLanguageId] = React.useState<string>();
    const [showExportConfigSelect, setShowExportConfigSelect] = React.useState<boolean>(false);
    const [selectedImportFormat, setSelectedImportFormat] = React.useState<ImportFileFormats>();
    const [selectedExportConfigId, setSelectedExportConfigId] = React.useState<string>();
    const [exportConfigsResponse, setExportConfigsResponse] = React.useState<IGetExportConfigsResponse>();
    const [files, setFiles] = React.useState<File[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        (async () => {
            try {
                const responseLanguages = await LanguagesAPI.getLanguages(params.projectId);
                const responseExportConfigs = await ExportConfigsAPI.getExportConfigs({
                    projectId: params.projectId
                });

                setLanguagesResponse(responseLanguages);
                setExportConfigsResponse(responseExportConfigs);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    async function upload() {
        setLoading(true);

        const response = await ProjectsAPI.import({
            projectId: params.projectId,
            languageId: selectedLanguageId,
            exportConfigId: selectedExportConfigId,
            file: files[0],
            fileFormat: selectedImportFormat
        });

        if (!response.errors && response.ok) {
            message.success("Successfully imported translations.");
            setFiles([]);
            setSelectedLanguageId(null);
        } else {
            if (response.message === "NO_OR_EMPTY_FILE") {
                message.error("Please select a file with content.");
            } else if (response.message === "INVALID_JSON") {
                message.error("The content of the file is invalid JSON.");
            } else if (response.message === "NOTHING_IMPORTED") {
                message.error("No data in file found to import.");
            } else if (response.message === "INVALID_FILE_FORMAT") {
                message.error("The selected file format is invalid.");
            } else {
                message.error("Failed to import translations.");
            }
        }

        setLoading(false);
    }

    function getExportConfigSelect() {
        return (
            <Select
                style={{ flexGrow: 1 }}
                onChange={(selectedValue: string) => {
                    setSelectedExportConfigId(selectedValue);
                }}
                value={selectedExportConfigId}
            >
                {exportConfigsResponse.data.map((exportConfig) => {
                    return (
                        <Select.Option value={exportConfig.id} key={exportConfig.id}>
                            {exportConfig.attributes.name}
                        </Select.Option>
                    );
                })}
            </Select>
        );
    }

    return (
        <div>
            {languagesResponse?.data.length === 0 && (
                <>
                    <Alert
                        type="info"
                        showIcon
                        message="No language"
                        description={
                            <p>
                                <Link to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(":projectId", params.projectId)}>
                                    Create a language
                                </Link>{" "}
                                to import your keys.
                            </p>
                        }
                    />
                </>
            )}
            {languagesResponse?.data.length > 0 && (
                <>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ marginRight: 8 }}>Select a language:</span>
                        <Select
                            style={{ flexGrow: 1 }}
                            onChange={(selectedValue: string) => {
                                setSelectedLanguageId(selectedValue);
                            }}
                            value={selectedLanguageId}
                        >
                            {languagesResponse.data.map((language) => {
                                const countryCode = APIUtils.getIncludedObject(
                                    language.relationships.country_code.data,
                                    languagesResponse.included
                                );

                                return (
                                    <Select.Option value={language.id} key={language.attributes.name}>
                                        {countryCode && (
                                            <span style={{ marginRight: 8 }}>
                                                <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                            </span>
                                        )}
                                        {language.attributes.name}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </div>
                    {showExportConfigSelect && exportConfigsResponse && exportConfigsResponse.data.length > 0 && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: 8
                            }}
                        >
                            <span style={{ marginRight: 8 }}>Select an export config:</span>
                            {getExportConfigSelect()}
                        </div>
                    )}

                    {!showExportConfigSelect && (
                        <a
                            onClick={() => {
                                setShowExportConfigSelect(true);
                            }}
                        >
                            Click here to import strings for an export config
                        </a>
                    )}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                            columnGap: 24,
                            rowGap: 24,
                            margin: "24px 0"
                        }}
                    >
                        {SUPPORTED_FORMATS.map((supportedFormat) => {
                            return (
                                <HoverCard
                                    style={{
                                        padding: 24,
                                        width: 200,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center"
                                    }}
                                    key={supportedFormat.name}
                                >
                                    {supportedFormat.image && (
                                        <img
                                            src={
                                                generalStore.theme === "dark" && supportedFormat.imageDarkMode
                                                    ? supportedFormat.imageDarkMode
                                                    : supportedFormat.image
                                            }
                                            style={{ height: 56, maxWidth: 96 }}
                                        />
                                    )}
                                    <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 16 }}>
                                        {supportedFormat.name}
                                    </div>
                                    <div style={{ marginTop: 16 }}>
                                        <Tag style={{ marginRight: 0 }}>{supportedFormat.format}</Tag>
                                    </div>
                                </HoverCard>
                            );
                        })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
                        <span style={{ marginRight: 8 }}>Select the format of your file:</span>
                        <Select
                            style={{ flexGrow: 1 }}
                            onChange={(selectedValue: ImportFileFormats) => {
                                setSelectedImportFormat(selectedValue);
                            }}
                            value={selectedImportFormat}
                        >
                            <Select.Option value="json">JSON Flat</Select.Option>
                            {/* <Select.Option value="json-nested">JSON Nested</Select.Option> */}
                            <Select.Option value="json-formatjs">JSON Format.js</Select.Option>
                            <Select.Option value="ios">iOS .strings</Select.Option>
                            <Select.Option value="toml">TOML</Select.Option>
                        </Select>
                    </div>
                    <Dropzone
                        onDrop={(acceptedFiles) => {
                            setFiles(acceptedFiles);
                        }}
                        accept={[".json", ".strings", ".toml"]}
                        disabled={!selectedImportFormat}
                    >
                        {({ getRootProps, getInputProps }) => {
                            return (
                                <DropZoneWrapper {...getRootProps()} disabled={!selectedImportFormat}>
                                    {files.length > 0 ? (
                                        <p style={{ margin: 0, display: "flex", alignItems: "center" }}>
                                            <FileTextOutlined
                                                style={{
                                                    fontSize: 26,
                                                    color: "#aaa",
                                                    marginRight: 10
                                                }}
                                            />
                                            {files[0].name}
                                        </p>
                                    ) : (
                                        <p style={{ margin: 0 }}>
                                            {!selectedImportFormat ? (
                                                <>Please select an import format.</>
                                            ) : (
                                                <>
                                                    Drop a <b>{getFileEndingForSelectedFormat(selectedImportFormat)}</b>{" "}
                                                    file here or click to upload one.
                                                </>
                                            )}
                                        </p>
                                    )}
                                    <input {...getInputProps()} accept=".json,.strings,.toml" />
                                </DropZoneWrapper>
                            );
                        }}
                    </Dropzone>
                    <div style={{ marginTop: 10, justifyContent: "flex-end", display: "flex" }}>
                        <Button
                            disabled={files.length === 0}
                            onClick={() => {
                                setFiles([]);
                            }}
                            style={{ marginRight: 10 }}
                        >
                            Remove file
                        </Button>
                        <Button type="primary" disabled={files.length === 0 || !selectedLanguageId} onClick={upload}>
                            Import file
                        </Button>
                    </div>

                    <LoadingOverlay isVisible={loading} loadingText="Importing data..." />
                </>
            )}
        </div>
    );
});
