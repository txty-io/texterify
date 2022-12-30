import { FileTextOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
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
import RailsLogo from "images/rails_logo.svg";
import TOMLLogo from "images/toml_logo.svg";
import { observer } from "mobx-react";
import * as React from "react";
import Dropzone from "react-dropzone";
import { useParams } from "react-router";
import { ImportsAPI } from "../api/v1/ImportsAPI";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { ImportFileFormats } from "../utilities/ImportUtils";
import { DropZoneWrapper } from "./DropZoneWrapper";
import { LoadingOverlay } from "./LoadingOverlay";

export const SUPPORTED_FORMATS: {
    image?: string;
    imageDarkMode?: any;
    name: string;
    formats: string[];
    id: ImportFileFormats;
    documentationURL?: string;
    example?: React.ReactNode;
    description?: string;
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
        image: JSONLogo,
        name: "JSON POEditor",
        description: "Use this format if you want to import exports of the POEditor translation management system.",
        formats: [".json"],
        id: "json-poeditor",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`[
    {
        "term": "app_title",
        "definition": "Texterify",
        "context": "welcome screen",
        "term_plural": "",
        "reference": "",
        "comment": "this comment is shown as description"
    }
    ...
]
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
    },
    {
        name: "XLIFF .xlf",
        formats: [".xlf", ".xliff"],
        id: "xliff",
        documentationURL: "https://docs.oasis-open.org/xliff/xliff-core/xliff-core.html",
        example: (
            <pre style={{ whiteSpace: "break-spaces" }}>{`<xliff
    ...
    version="2.0"
    srcLang="en-US"
    trgLang="de-AT"
>
    <file id="f1">
        <unit id="1">
            <segment>
                <source>Hello</source>
                <target>Hallo</target>
            </segment>
        </unit>
    </file>
</xliff>`}</pre>
        )
    },
    {
        image: RailsLogo,
        name: "Rails",
        formats: [".yml", ".yaml"],
        id: "rails"
    },
    {
        name: "YAML",
        formats: [".yml", ".yaml"],
        id: "yaml"
    }
];

const ACCEPTED_FILE_FORMATS = [];

SUPPORTED_FORMATS.forEach((supportedFormat) => {
    supportedFormat.formats.forEach((format) => {
        if (!ACCEPTED_FILE_FORMATS.includes(format)) {
            ACCEPTED_FILE_FORMATS.push(format);
        }
    });
});

export const TranslationFileImporter = observer(
    (props: { style?: React.CSSProperties; fileDropOnly?: boolean; onCreateLanguageClick?(): void }) => {
        const params = useParams<{ organizationId?: string; projectId?: string }>();

        const [files, setFiles] = React.useState<File[]>([]);
        const [loading, setLoading] = React.useState<boolean>(false);

        async function upload() {
            setLoading(true);

            try {
                const createImportResponse = await ImportsAPI.create({
                    projectId: params.projectId,
                    files: files
                });

                if (createImportResponse?.data) {
                    history.push(
                        Routes.DASHBOARD.PROJECT_IMPORTS_DETAILS_RESOLVER({
                            projectId: params.projectId,
                            importId: createImportResponse.data.attributes.id
                        })
                    );
                } else {
                    message.error("An error occurred while uploading your files.");
                }
            } catch (error) {
                console.error(error);
                message.error("An error occurred while uploading your files.");
            } finally {
                setLoading(false);
            }
        }

        return (
            <>
                <>
                    <div style={{ ...props.style, display: "flex" }}>
                        <div style={{ flexGrow: 1 }}>
                            <Dropzone
                                onDrop={(acceptedFiles) => {
                                    setFiles(acceptedFiles);
                                }}
                                accept={ACCEPTED_FILE_FORMATS}
                            >
                                {({ getRootProps, getInputProps }) => {
                                    return (
                                        <DropZoneWrapper {...getRootProps()} style={{ minHeight: 320 }}>
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
                                                    <ul style={{ margin: 0 }}>
                                                        {files.map((f, index) => {
                                                            return <li key={index}>{f.name}</li>;
                                                        })}
                                                    </ul>
                                                </p>
                                            ) : (
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        padding: 24,
                                                        textAlign: "center"
                                                    }}
                                                >
                                                    Drop your translation files here.
                                                </p>
                                            )}
                                            <input
                                                {...getInputProps()}
                                                accept={ACCEPTED_FILE_FORMATS.join(",")}
                                                data-id="files-importer-files-uploader"
                                            />
                                        </DropZoneWrapper>
                                    );
                                }}
                            </Dropzone>
                            <div
                                style={{
                                    marginTop: 10,
                                    justifyContent: "flex-end",
                                    display: "flex"
                                }}
                            >
                                <Button
                                    disabled={files.length === 0}
                                    onClick={() => {
                                        setFiles([]);
                                    }}
                                    style={{ marginRight: 10 }}
                                >
                                    Remove files
                                </Button>
                                <Button
                                    type="primary"
                                    disabled={files.length === 0}
                                    onClick={upload}
                                    data-id="files-importer-submit-button"
                                >
                                    Import files
                                </Button>
                            </div>
                        </div>
                    </div>

                    <LoadingOverlay isVisible={loading} loadingText="Uploading files..." />
                </>
            </>
        );
    }
);
