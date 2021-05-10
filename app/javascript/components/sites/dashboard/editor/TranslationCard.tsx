import { LoadingOutlined, RobotOutlined } from "@ant-design/icons";
import EditorJS from "@editorjs/editorjs";
import List from "@editorjs/list";
import { Button, message, Select, Skeleton } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import styled from "styled-components";
import { APIUtils } from "../../../api/v1/APIUtils";
import { IGetMachineTranslation, MachineTranslationsAPI } from "../../../api/v1/MachineTranslationsAPI";
import { TranslationsAPI } from "../../../api/v1/TranslationsAPI";
import FlagIcon from "../../../ui/FlagIcons";
import { Styles } from "../../../ui/Styles";
import { Utils } from "../../../ui/Utils";
import DeeplLogo from "images/deepl_logo.svg";

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
    languages?: any;
    languagesResponse: any;
    defaultSelected: any;
    keyResponse?: any;
    isHTMLKey?: boolean;
    hideLanguageSelection?: boolean;
    hideSaveButton?: boolean;
    exportConfigId?: string;
    initialValue?: string;
    isDefaultLanguage?: boolean;
    defaultLanguage?: any;
    defaultLanguageTranslationContent?: string;
    onChange?(changed: boolean, content: string);
    onSave?();
    onSelectedLanguageChange?(languageId: string): void;
}
interface IState {
    selectedLanguage: string;
    editorContentChanged: boolean;
    editorLoaded: boolean;
    textareaContentChanged: boolean;
    isHTMLKey: boolean;
    translationForLanguage: string;
    content: string;
    translationSuggestion: IGetMachineTranslation;
    translationSuggestionLoading: boolean;
}

class TranslationCard extends React.Component<IProps, IState> {
    state: IState = {
        selectedLanguage: this.props.defaultSelected,
        editorContentChanged: false,
        editorLoaded: false,
        textareaContentChanged: false,
        isHTMLKey: true,
        translationForLanguage: null,
        content: null,
        translationSuggestion: null,
        translationSuggestionLoading: false
    };

    editor: any;

    async componentDidUpdate(prevProps: IProps) {
        if (prevProps.defaultLanguageTranslationContent !== this.props.defaultLanguageTranslationContent) {
            await this.loadMachineTranslation();
        }
    }

    async componentDidMount() {
        await this.loadData();
        await this.loadMachineTranslation();
    }

    async loadMachineTranslation() {
        if (this.isHTMLKey()) {
            // Machine translations for HTML keys are not supported.
            return;
        }

        if (this.props.defaultLanguage && this.props.defaultLanguageTranslationContent) {
            this.setState({ translationSuggestionLoading: true });
            try {
                const translationSuggestion = await MachineTranslationsAPI.translate({
                    projectId: this.props.projectId,
                    translationId: this.getTranslationForLanguage(this.props.defaultLanguage.id).attributes.id,
                    targetLanguageId: this.state.selectedLanguage
                });

                this.setState({ translationSuggestion: translationSuggestion });
            } catch (error) {
                console.error(error);
            }

            this.setState({ translationSuggestionLoading: false });
        }
    }

    loadData = async () => {
        const translationForLanguage = this.getTranslationForLanguage(this.state.selectedLanguage)?.attributes.content;
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
        let translationForLanguage;

        if (this.props.keyResponse) {
            this.props.keyResponse.data.relationships.translations.data.some((translationReference) => {
                const translation = APIUtils.getIncludedObject(translationReference, this.props.keyResponse.included);

                // Check for language
                if (translation.relationships.language.data.id === languageId) {
                    if (this.props.exportConfigId) {
                        // If translation for export config is requested
                        if (translation.relationships.export_config.data?.id === this.props.exportConfigId) {
                            translationForLanguage = translation;
                            return true;
                        }
                    } else if (!translation.relationships.export_config.data?.id) {
                        // If the default translation for that language is requested
                        translationForLanguage = translation;
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
                    textareaContentChanged: false,
                    translationForLanguage: content
                });
            })
            .catch((error) => {
                console.error(error);
                message.error("Failed to save changes.");
            });
    };

    render() {
        let defaultLanguageDisplay;
        if (this.props.isDefaultLanguage && this.props.languages && !this.props.isHTMLKey) {
            const language = this.props.languages[0];

            const countryCode = APIUtils.getIncludedObject(
                language.relationships.country_code.data,
                this.props.languagesResponse.included
            );

            defaultLanguageDisplay = (
                <div style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
                    {countryCode && (
                        <span style={{ marginRight: 8 }}>
                            <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                        </span>
                    )}
                    {language.attributes.name}
                </div>
            );
        }

        return (
            <div style={{ marginBottom: 24, width: "100%" }}>
                {(!this.props.hideLanguageSelection || !this.props.hideSaveButton) && (
                    <div style={{ marginBottom: 8, display: "flex" }}>
                        {!this.props.hideLanguageSelection && !this.props.isDefaultLanguage && (
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

                                    this.props.onSelectedLanguageChange(selectedValue);
                                }}
                                value={this.state.selectedLanguage}
                            >
                                {this.props.languages &&
                                    this.props.languages.map((language) => {
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

                        {this.props.isDefaultLanguage && defaultLanguageDisplay}

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

                {this.props.defaultLanguage && !this.state.isHTMLKey && (
                    <div style={{ padding: 8, marginTop: 8 }}>
                        <h4 style={{ fontSize: 12 }}>
                            <RobotOutlined style={{ marginRight: 4 }} /> Machine Translation Suggestion
                        </h4>
                        {this.state.translationSuggestionLoading && (
                            <div style={{ marginTop: 16, marginBottom: 16 }}>
                                <Skeleton active paragraph={{ rows: 2 }} title={false} />
                            </div>
                        )}

                        {!this.state.translationSuggestionLoading && (
                            <div>
                                {this.props.defaultLanguageTranslationContent && this.state.translationSuggestion ? (
                                    this.state.translationSuggestion.translation !==
                                    this.state.translationForLanguage ? (
                                        <>
                                            <div style={{ marginTop: 16 }}>
                                                {this.state.translationSuggestion.translation}
                                            </div>
                                            <Button
                                                type="primary"
                                                style={{ marginTop: 16, marginBottom: 8 }}
                                                disabled={
                                                    this.state.translationSuggestion.translation === this.state.content
                                                }
                                                onClick={() => {
                                                    this.setState({
                                                        content: this.state.translationSuggestion.translation,
                                                        editorContentChanged: true
                                                    });
                                                }}
                                            >
                                                Use translation
                                            </Button>
                                        </>
                                    ) : (
                                        <div
                                            style={{
                                                fontStyle: "italic",
                                                color: "var(--color-passive)",
                                                fontSize: 12,
                                                marginTop: 16,
                                                marginBottom: 16
                                            }}
                                        >
                                            Machine translation suggestion is the same as the current translation.
                                            <div style={{ fontWeight: "bold", marginTop: 4 }}>
                                                {this.state.translationSuggestion.translation}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div
                                        style={{
                                            fontStyle: "italic",
                                            color: "var(--color-passive)",
                                            fontSize: 12,
                                            marginTop: 16,
                                            marginBottom: 16
                                        }}
                                    >
                                        No translation in source language to translate.
                                    </div>
                                )}
                            </div>
                        )}
                        <div
                            style={{
                                color: "var(--color-passive)",
                                marginTop: 8,
                                fontSize: 11,
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            powered by <img src={DeeplLogo} style={{ maxWidth: 16, marginRight: 4, marginLeft: 4 }} />
                            DeepL
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export { TranslationCard };
