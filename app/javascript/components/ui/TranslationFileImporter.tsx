import { FileTextOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Input, message, Result, Select, Tag } from "antd";
import AppleLogoBlack from "images/apple_logo_black.svg";
import AppleLogoWhite from "images/apple_logo_white.svg";
import ChromeLogo from "images/chrome_logo.svg";
import DjangoLogo from "images/django_logo.svg";
import FlutterLogo from "images/flutter_logo.svg";
import FormatJSLogo from "images/formatjs_logo.svg";
import GNULogo from "images/gnu_logo.svg";
import GoLogo from "images/go_logo_blue.svg";
import JavaLogo from "images/java_logo.svg";
import JSONLogo from "images/json_logo.svg";
import TOMLLogo from "images/toml_logo.svg";
import { observer } from "mobx-react";
import * as React from "react";
import Dropzone from "react-dropzone";
import { useParams } from "react-router";
import { APIUtils } from "../api/v1/APIUtils";
import { ExportConfigsAPI, IGetExportConfigsResponse } from "../api/v1/ExportConfigsAPI";
import { IGetLanguagesResponse, LanguagesAPI } from "../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { ImportFileFormats } from "../sites/dashboard/FileImportSite";
import { generalStore } from "../stores/GeneralStore";
import { DropZoneWrapper } from "./DropZoneWrapper";
import FlagIcon from "./FlagIcons";
import { HoverCard } from "./HoverCard";
import { Loading } from "./Loading";
import { LoadingOverlay } from "./LoadingOverlay";
import { Styles } from "./Styles";

const ACCEPTED_FILE_FORMATS = [".json", ".strings", ".toml", ".properties", ".po", ".arb"];

const SUPPORTED_FORMATS: {
    image: any;
    imageDarkMode?: any;
    name: string;
    formats: string[];
    id: ImportFileFormats;
    documentationURL?: string;
    example?: React.ReactNode;
}[] = [
    {
        image: AppleLogoBlack,
        imageDarkMode: AppleLogoWhite,
        name: "iOS",
        formats: [".strings"],
        id: "ios",
        documentationURL:
            "https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/LoadingResources/Strings/Strings.html",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`"my_key_1" = "Translation text 1";
"my_key_2" = "Translation text 2";`}</pre>
        )
    },
    // {
    //     image: AndroidLogo,
    //     name: "Android",
    //     formats: [".xml"],
    //     id: "android",
    //     disabled: true
    // },
    {
        image: JSONLogo,
        name: "JSON",
        formats: [".json"],
        id: "json",
        documentationURL: "https://www.json.org/json-en.html",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`{
    "welcome_message": "Hello world",
    ...
}
`}</pre>
        )
    },
    {
        image: FormatJSLogo,
        name: "JSON FormatJS",
        formats: [".json"],
        id: "json-formatjs",
        documentationURL: "https://formatjs.io/docs/getting-started/message-extraction",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`{
    "say_hello": {
        "defaultMessage": "hello world",
        "description": "A nice welcome message."
    },
    ...
}
`}</pre>
        )
    },
    {
        image: ChromeLogo,
        name: "Chrome JSON",
        formats: [".json"],
        id: "json-formatjs",
        documentationURL: "https://developer.chrome.com/docs/extensions/reference/i18n/",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`{
    "say_hello": {
        "message": "hello world",
        "description": "A nice welcome message."
    },
    ...
}
`}</pre>
        )
    },
    {
        image: GoLogo,
        name: "go-i18n",
        formats: [".toml"],
        id: "toml",
        documentationURL: "https://github.com/nicksnyder/go-i18n",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`[groupOne]
"title" = "This is my title"
...

[groupTwo]
title = "This is another title"
...`}</pre>
        )
    },
    {
        image: TOMLLogo,
        name: "TOML",
        formats: [".toml"],
        id: "toml",
        documentationURL: "https://toml.io",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`[groupOne]
"title" = "This is my title"
...

[groupTwo]
title = "This is another title"
...`}</pre>
        )
    },
    {
        image: JavaLogo,
        name: "Java .properties",
        formats: [".properties"],
        id: "properties",
        documentationURL: "https://docs.oracle.com/javase/10/docs/api/java/util/PropertyResourceBundle.html",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`
title = This is my title
description = This is some description text
...`}</pre>
        )
    },
    {
        image: GNULogo,
        name: "gettext .po",
        formats: [".po"],
        id: "po",
        documentationURL: "https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`
msgctxt "My description"
msgid "app_title"
msgstr "Awesome app"
...`}</pre>
        )
    },
    {
        image: DjangoLogo,
        name: "Django .po",
        formats: [".po"],
        id: "po",
        documentationURL: "https://docs.djangoproject.com/en/3.2/topics/i18n/translation/",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`
msgctxt "My description"
msgid "app_title"
msgstr "Awesome app"
...`}</pre>
        )
    },
    {
        image: FlutterLogo,
        name: "Flutter .arb",
        formats: [".arb"],
        id: "arb",
        documentationURL: "https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`{
    "@@locale": "en_US",

    "title": "The cake is a lie.",
    "@title": {
        "description": "There is no cake so it is a lie."
    },

    "all_ok": "Everything is fine (but still no cake)."
    ...
}`}</pre>
        )
    }
    // {
    //     image: RailsLogo,
    //     name: "Rails",
    //     formats: [".yml", ".yaml"],
    //     id: "rails",
    //     disabled: true
    // }
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
    } else if (selectedImportFormat === "arb") {
        return ".arb";
    }
}

export const TranslationFileImporter = observer(
    (props: { style?: React.CSSProperties; onCreateLanguageClick?(): void }) => {
        const params = useParams<{ organizationId?: string; projectId?: string }>();

        const [languagesResponse, setLanguagesResponse] = React.useState<IGetLanguagesResponse>();
        const [languagesLoading, setLanguagesLoading] = React.useState<boolean>(true);
        const [selectedLanguageId, setSelectedLanguageId] = React.useState<string>();
        const [search, setSearch] = React.useState<string>("");
        const [showExportConfigSelect, setShowExportConfigSelect] = React.useState<boolean>(false);
        const [selectedImportFormat, setSelectedImportFormat] = React.useState<typeof SUPPORTED_FORMATS[0]>();
        const [selectedExportConfigId, setSelectedExportConfigId] = React.useState<string>();
        const [exportConfigsResponse, setExportConfigsResponse] = React.useState<IGetExportConfigsResponse>();
        const [files, setFiles] = React.useState<File[]>([]);
        const [loading, setLoading] = React.useState<boolean>(false);
        const [importSuccessful, setImportSuccessful] = React.useState<boolean>(false);

        React.useEffect(() => {
            (async () => {
                try {
                    const responseLanguages = await LanguagesAPI.getLanguages(params.projectId, { showAll: true });
                    const responseExportConfigs = await ExportConfigsAPI.getExportConfigs({
                        projectId: params.projectId
                    });

                    setLanguagesResponse(responseLanguages);
                    setExportConfigsResponse(responseExportConfigs);
                } catch (e) {
                    console.error(e);
                }

                setLanguagesLoading(false);
            })();
        }, []);

        async function upload() {
            setLoading(true);

            const response = await ProjectsAPI.import({
                projectId: params.projectId,
                languageId: selectedLanguageId,
                exportConfigId: selectedExportConfigId,
                file: files[0],
                fileFormat: selectedImportFormat.id
            });

            if (!response.errors && response.ok) {
                message.success("Successfully imported translations.");
                setFiles([]);
                setSelectedLanguageId(null);
                setImportSuccessful(true);
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

        function getFilteredFormats() {
            return SUPPORTED_FORMATS.filter((format) => {
                if (!search) {
                    return true;
                }

                if (
                    format.id.toLowerCase().includes(search.toLowerCase()) ||
                    format.name.toLowerCase().includes(search.toLowerCase())
                ) {
                    return true;
                } else {
                    if (
                        format.formats.find((f) => {
                            return f.toLowerCase().includes(search.toLowerCase());
                        })
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                }
            });
        }

        if (importSuccessful) {
            return (
                <Result
                    status="success"
                    title="Your import was successful."
                    style={{ margin: "auto" }}
                    extra={[
                        <Button
                            type="primary"
                            key="import-another"
                            onClick={() => {
                                setImportSuccessful(false);
                            }}
                        >
                            Import another file
                        </Button>
                    ]}
                />
            );
        }

        return (
            <div style={props.style}>
                {languagesLoading && <Loading />}
                {languagesResponse?.data.length === 0 && (
                    <>
                        <Alert
                            type="info"
                            showIcon
                            message="No language"
                            description={
                                <>
                                    <a
                                        onClick={
                                            props.onCreateLanguageClick
                                                ? props.onCreateLanguageClick
                                                : () => {
                                                      history.push(
                                                          Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                                              ":projectId",
                                                              params.projectId
                                                          )
                                                      );
                                                  }
                                        }
                                    >
                                        Create a language
                                    </a>{" "}
                                    to import your keys.
                                </>
                            }
                        />
                    </>
                )}
                {languagesResponse?.data.length > 0 && (
                    <>
                        <div style={{ marginBottom: 8 }}>
                            <h3>For which language do you want to import your existing translations?</h3>
                            <p>Click on a language to continue.</p>
                            <div style={{ marginTop: 24, display: "flex", alignItems: "center" }}>
                                {languagesResponse.data.map((language) => {
                                    const countryCode = APIUtils.getIncludedObject(
                                        language.relationships.country_code.data,
                                        languagesResponse.included
                                    );

                                    return (
                                        <Tag.CheckableTag
                                            key={language.id}
                                            checked={language.id === selectedLanguageId}
                                            onChange={() => {
                                                setSelectedLanguageId(language.id);
                                            }}
                                        >
                                            {countryCode && (
                                                <span style={{ marginRight: 8 }}>
                                                    <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                                </span>
                                            )}
                                            {language.attributes.name}
                                        </Tag.CheckableTag>
                                    );
                                })}
                            </div>
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

                        {!showExportConfigSelect && exportConfigsResponse && exportConfigsResponse.data.length > 0 && (
                            <a
                                onClick={() => {
                                    setShowExportConfigSelect(true);
                                }}
                            >
                                Click here to import strings for an export config
                            </a>
                        )}

                        {selectedLanguageId && (
                            <>
                                <h3 style={{ marginTop: 24 }}>Select your translations file format</h3>
                                <Input.Search
                                    placeholder="Search for file formats"
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                    }}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        columnGap: 24,
                                        rowGap: 24,
                                        margin: "24px 0"
                                    }}
                                >
                                    {getFilteredFormats().map((supportedFormat) => {
                                        return (
                                            <HoverCard
                                                style={{
                                                    padding: 24,
                                                    width: 200,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center"
                                                }}
                                                key={`${supportedFormat.id}-${supportedFormat.name}`}
                                                selected={
                                                    selectedImportFormat?.id === supportedFormat.id &&
                                                    selectedImportFormat?.name === supportedFormat.name
                                                }
                                                onClick={() => {
                                                    setSelectedImportFormat(supportedFormat);
                                                }}
                                            >
                                                {supportedFormat.image && (
                                                    <img
                                                        src={
                                                            generalStore.theme === "dark" &&
                                                            supportedFormat.imageDarkMode
                                                                ? supportedFormat.imageDarkMode
                                                                : supportedFormat.image
                                                        }
                                                        style={{ height: 32, maxWidth: 80 }}
                                                    />
                                                )}
                                                <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 16 }}>
                                                    {supportedFormat.name}
                                                </div>
                                                <div style={{ marginTop: 16 }}>
                                                    {supportedFormat.formats.map((format, index) => {
                                                        return (
                                                            <Tag
                                                                style={{
                                                                    marginRight:
                                                                        index === supportedFormat.formats.length - 1
                                                                            ? 0
                                                                            : 4
                                                                }}
                                                                key={format}
                                                            >
                                                                {format}
                                                            </Tag>
                                                        );
                                                    })}
                                                </div>
                                            </HoverCard>
                                        );
                                    })}
                                    {getFilteredFormats().length === 0 && (
                                        <Empty
                                            description="We couldn't find the file format you requested."
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            style={{
                                                gridColumnEnd: -1,
                                                gridColumnStart: 1
                                            }}
                                        />
                                    )}
                                </div>

                                {selectedImportFormat && (
                                    <div style={{ display: "flex" }}>
                                        {(selectedImportFormat.documentationURL || selectedImportFormat.example) && (
                                            <div
                                                style={{
                                                    marginRight: 40,
                                                    padding: 12,
                                                    width: "50%",
                                                    display: "flex",
                                                    flexDirection: "column"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: 16,
                                                        display: "flex",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    {selectedImportFormat.image && (
                                                        <img
                                                            src={
                                                                generalStore.theme === "dark" &&
                                                                selectedImportFormat.imageDarkMode
                                                                    ? selectedImportFormat.imageDarkMode
                                                                    : selectedImportFormat.image
                                                            }
                                                            style={{ height: 32, maxWidth: 80, marginRight: 12 }}
                                                        />
                                                    )}
                                                    {selectedImportFormat.name}
                                                </div>
                                                {selectedImportFormat.documentationURL && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <span style={{ fontWeight: "bold" }}>Documentation: </span>
                                                        <a
                                                            href={selectedImportFormat.documentationURL}
                                                            target="_blank"
                                                            style={{ wordBreak: "break-all" }}
                                                        >
                                                            {selectedImportFormat.documentationURL}
                                                        </a>
                                                    </div>
                                                )}
                                                {selectedImportFormat && (
                                                    <>
                                                        <div style={{ marginTop: 8, fontWeight: "bold" }}>Example:</div>
                                                        <div
                                                            style={{
                                                                marginTop: 8,
                                                                padding: 24,
                                                                borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                                                                background: "var(--background-highlight-color)"
                                                            }}
                                                        >
                                                            {selectedImportFormat.example}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <div style={{ flexGrow: 1 }}>
                                            <Dropzone
                                                onDrop={(acceptedFiles) => {
                                                    setFiles(acceptedFiles);
                                                }}
                                                accept={ACCEPTED_FILE_FORMATS}
                                                disabled={!selectedImportFormat}
                                            >
                                                {({ getRootProps, getInputProps }) => {
                                                    return (
                                                        <DropZoneWrapper
                                                            {...getRootProps()}
                                                            disabled={!selectedImportFormat}
                                                            style={{ minHeight: 320 }}
                                                        >
                                                            {files.length > 0 ? (
                                                                <p
                                                                    style={{
                                                                        margin: 0,
                                                                        display: "flex",
                                                                        alignItems: "center"
                                                                    }}
                                                                >
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
                                                                <p
                                                                    style={{
                                                                        margin: 0,
                                                                        padding: 24,
                                                                        textAlign: "center"
                                                                    }}
                                                                >
                                                                    {!selectedImportFormat ? (
                                                                        <>Please select an import format.</>
                                                                    ) : (
                                                                        <>
                                                                            Drop a{" "}
                                                                            <b>
                                                                                {getFileEndingForSelectedFormat(
                                                                                    selectedImportFormat.id
                                                                                )}
                                                                            </b>{" "}
                                                                            file here or click to upload one.
                                                                        </>
                                                                    )}
                                                                </p>
                                                            )}
                                                            <input
                                                                {...getInputProps()}
                                                                accept={ACCEPTED_FILE_FORMATS.join(",")}
                                                            />
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
                                                <Button
                                                    type="primary"
                                                    disabled={files.length === 0 || !selectedLanguageId}
                                                    onClick={upload}
                                                >
                                                    Import file
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <LoadingOverlay isVisible={loading} loadingText="Importing data..." />
                    </>
                )}
            </div>
        );
    }
);
