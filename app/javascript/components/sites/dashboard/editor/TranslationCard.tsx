import { LoadingOutlined } from "@ant-design/icons";
import EditorJS from "@editorjs/editorjs";
import List from "@editorjs/list";
import { Button, message, Select } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import styled from "styled-components";
import { APIUtils } from "../../../api/v1/APIUtils";
import { TranslationsAPI } from "../../../api/v1/TranslationsAPI";
import FlagIcon from "../../../ui/FlagIcons";
import { Styles } from "../../../ui/Styles";
import { Utils } from "../../../ui/Utils";

const EMPTY_EDITOR_HEIGHT = 108;

const EditorWrapper = styled.div`
    background: #fff;
    border: 1px solid var(--border-color-flashier);
    padding: 12px 40px 12px 20px;
    border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
    transition: all 0.3s;

    .dark-theme & {
        background: transparent;
    }
`;

interface IProps {
    projectId: string;
    languagesResponse: any;
    defaultSelected: any;
    keyResponse?: any;
    isHTMLKey?: boolean;
    hideLanguageSelection?: boolean;
    hideSaveButton?: boolean;
    exportConfigId?: string;
    initialValue?: string;
    onChange?(changed: boolean, content: string);
    onSave?();
}
interface IState {
    selectedLanguage: string;
    editorContentChanged: boolean;
    editorLoaded: boolean;
    textareaContentChanged: boolean;
    isHTMLKey: boolean;
    translationForLanguage: string;
    content: string;
}

class TranslationCard extends React.Component<IProps, IState> {
    state: IState = {
        selectedLanguage: this.props.defaultSelected,
        editorContentChanged: false,
        editorLoaded: false,
        textareaContentChanged: false,
        isHTMLKey: true,
        translationForLanguage: null,
        content: null
    };

    editor: any;

    async componentDidMount() {
        await this.loadData();
    }

    loadData = async () => {
        const translationForLanguage = this.getTranslationForLanguage(this.state.selectedLanguage);
        const isHTMLKey = this.props.keyResponse
            ? this.props.keyResponse.data.attributes.html_enabled
            : this.props.isHTMLKey;

        if (isHTMLKey) {
            let htmlData;
            try {
                htmlData = JSON.parse(this.props.initialValue || translationForLanguage);
            } catch (e) {
                //
            }

            this.editor = new EditorJS({
                holder: `codex-editor-${this.state.selectedLanguage}`,
                minHeight: 40,
                tools: {
                    list: {
                        class: List,
                        inlineToolbar: true
                    }
                },
                onChange: async () => {
                    if (this.props.onChange) {
                        const content = await this.editor.save();
                        this.props.onChange(true, JSON.stringify(content));
                    }
                    this.setState({ editorContentChanged: true });
                },
                data: isHTMLKey ? Utils.escapeEditorContent(htmlData) : undefined
            });
            await this.editor.isReady;
        } else {
            this.setState({ content: translationForLanguage });
        }

        this.setState({
            editorLoaded: true,
            isHTMLKey: isHTMLKey,
            translationForLanguage: translationForLanguage
        });
    };

    getTranslationForLanguage = (languageId: string) => {
        let translationForLanguage = "";

        if (this.props.keyResponse) {
            this.props.keyResponse.data.relationships.translations.data.some((translationReference) => {
                const translation = APIUtils.getIncludedObject(translationReference, this.props.keyResponse.included);

                // Check for language
                if (translation.relationships.language.data.id === languageId) {
                    if (this.props.exportConfigId) {
                        // If translation for export config is requested
                        if (translation.relationships.export_config.data?.id === this.props.exportConfigId) {
                            translationForLanguage = translation.attributes.content;
                            return true;
                        }
                    } else if (!translation.relationships.export_config.data?.id) {
                        // If the default translation for that language is requested
                        translationForLanguage = translation.attributes.content;
                        return true;
                    }
                }
            });
        }

        return translationForLanguage;
    };

    isHTMLKey = () => {
        return this.state.isHTMLKey;
    };

    contentChanged = () => {
        return this.state.editorContentChanged || this.state.textareaContentChanged;
    };

    getEditorLoadingOverlay = () => {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    left: 0,
                    top: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <LoadingOutlined style={{ fontSize: 24, margin: "auto" }} spin />
            </div>
        );
    };

    saveChanges = async () => {
        let promise;
        if (this.state.isHTMLKey) {
            promise = this.editor.save();
        } else {
            promise = Promise.resolve(this.state.content);
        }

        return promise
            .then(async (content) => {
                if (this.state.isHTMLKey) {
                    content = JSON.stringify(content);
                }

                await TranslationsAPI.createTranslation({
                    projectId: this.props.projectId,
                    languageId: this.state.selectedLanguage,
                    keyId: this.props.keyResponse.data.id,
                    exportConfigId: this.props.exportConfigId ? this.props.exportConfigId : undefined,
                    content: content
                });

                if (this.props.onSave) {
                    this.props.onSave();
                }

                this.setState({
                    editorContentChanged: false,
                    textareaContentChanged: false
                });
            })
            .catch((error) => {
                console.error(error);
                message.error("Failed to save changes.");
            });
    };

    render() {
        return (
            <div style={{ marginBottom: 24, width: "100%" }}>
                {(!this.props.hideLanguageSelection || !this.props.hideSaveButton) && (
                    <div style={{ marginBottom: 8, display: "flex" }}>
                        {!this.props.hideLanguageSelection && (
                            <Select
                                style={{ flexGrow: 1, maxWidth: 200 }}
                                onChange={async (selectedValue: string) => {
                                    this.setState(
                                        {
                                            selectedLanguage: selectedValue
                                        },
                                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                        this.loadData
                                    );
                                }}
                                value={this.state.selectedLanguage}
                            >
                                {this.props.languagesResponse &&
                                    this.props.languagesResponse.data.map((language) => {
                                        const countryCode = APIUtils.getIncludedObject(
                                            language.relationships.country_code.data,
                                            this.props.languagesResponse.included
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
                        )}
                        {!this.props.hideSaveButton && (
                            <Button
                                type="primary"
                                disabled={!this.contentChanged()}
                                style={{ marginLeft: "auto" }}
                                onClick={this.saveChanges}
                            >
                                Save changes
                            </Button>
                        )}
                    </div>
                )}

                {this.isHTMLKey() ? (
                    <div style={{ position: "relative" }}>
                        <EditorWrapper
                            style={{
                                opacity: this.state.editorLoaded ? 1 : 0,
                                height: this.state.editorLoaded ? undefined : EMPTY_EDITOR_HEIGHT
                            }}
                        >
                            <div id={`codex-editor-${this.state.selectedLanguage}`} />
                        </EditorWrapper>
                        {!this.state.editorLoaded && this.getEditorLoadingOverlay()}
                    </div>
                ) : (
                    <TextArea
                        autoSize={{ minRows: 4, maxRows: 12 }}
                        placeholder="Language translation content"
                        onChange={(event) => {
                            const changed = event.target.value !== this.state.translationForLanguage;

                            this.setState({ textareaContentChanged: changed });

                            if (this.props.onChange) {
                                this.props.onChange(changed, event.target.value);
                            }

                            this.setState({ content: event.target.value });
                        }}
                        value={this.state.content}
                    />
                )}
            </div>
        );
    }
}

export { TranslationCard };
