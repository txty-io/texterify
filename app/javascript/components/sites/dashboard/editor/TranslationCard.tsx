import { LoadingOutlined } from "@ant-design/icons";
import EditorJS from "@editorjs/editorjs";
import List from "@editorjs/list";
import { Button, message, Select } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import styled from "styled-components";
import { APIUtils } from "../../../api/v1/APIUtils";
import {
    IGetMachineTranslationsSourceLanguages,
    IGetMachineTranslationsTargetLanguages,
    IGetMachineTranslationSuggestion
} from "../../../api/v1/MachineTranslationsAPI";
import { TranslationsAPI } from "../../../api/v1/TranslationsAPI";
import FlagIcon from "../../../ui/FlagIcons";
import { MachineTranslationSuggestion } from "../../../ui/MachineTranslationSuggestion";
import { Styles } from "../../../ui/Styles";
import { Utils } from "../../../ui/Utils";
import { TranslationUtils } from "../../../utilities/TranslationUtils";

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
    supportedSourceLanguages?: IGetMachineTranslationsSourceLanguages;
    supportedTargetLanguages?: IGetMachineTranslationsTargetLanguages;
    onChange?(changed: boolean, content: string);
    onSave?();
    onSelectedLanguageIdChange?(languageId: string): void;
}
interface IState {
    selectedLanguageId: string;
    editorContentChanged: boolean;
    editorLoaded: boolean;
    textareaContentChanged: boolean;
    isHTMLKey: boolean;
    translationForLanguage: string;
    content: string;
    translationSuggestion: IGetMachineTranslationSuggestion;
    translationSuggestionLoading: boolean;
    initialMachineTranslationLoaded: boolean;
}

class TranslationCard extends React.Component<IProps, IState> {
    state: IState = {
        selectedLanguageId: this.props.defaultSelected,
        editorContentChanged: false,
        editorLoaded: false,
        textareaContentChanged: false,
        isHTMLKey: true,
        translationForLanguage: null,
        content: null,
        translationSuggestion: null,
        translationSuggestionLoading: false,
        initialMachineTranslationLoaded: false
    };

    editor: any;

    async componentDidMount() {
        await this.loadData();
    }

    loadData = async () => {
        const translationForLanguage = TranslationUtils.getTranslationForLanguage({
            languageId: this.state.selectedLanguageId,
            keyResponse: this.props.keyResponse
        })?.attributes.content;

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
                holder: `codex-editor-${this.state.selectedLanguageId}`,
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
                    languageId: this.state.selectedLanguageId,
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
            <div style={{ marginBottom: 24, width: "100%" }} data-id="translation-card">
                {(!this.props.hideLanguageSelection || !this.props.hideSaveButton) && (
                    <div style={{ marginBottom: 8, display: "flex" }}>
                        {!this.props.hideLanguageSelection && !this.props.isDefaultLanguage && (
                            <Select
                                style={{ flexGrow: 1, maxWidth: 200 }}
                                onChange={async (selectedValue: string) => {
                                    this.setState(
                                        {
                                            selectedLanguageId: selectedValue
                                        },
                                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                        this.loadData
                                    );

                                    if (this.props.onSelectedLanguageIdChange) {
                                        this.props.onSelectedLanguageIdChange(selectedValue);
                                    }
                                }}
                                value={this.state.selectedLanguageId}
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
                            <div id={`codex-editor-${this.state.selectedLanguageId}`} />
                        </EditorWrapper>
                        {!this.state.editorLoaded && this.getEditorLoadingOverlay()}
                    </div>
                ) : (
                    <TextArea
                        autoSize={{ minRows: 8, maxRows: 12 }}
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

                <MachineTranslationSuggestion
                    defaultLanguage={this.props.defaultLanguage}
                    isHTMLKey={this.state.isHTMLKey}
                    defaultLanguageTranslationContent={this.props.defaultLanguageTranslationContent}
                    supportedSourceLanguages={this.props.supportedSourceLanguages}
                    supportedTargetLanguages={this.props.supportedTargetLanguages}
                    onUseTranslation={(data) => {
                        this.setState({
                            content: data.suggestion.translation,
                            editorContentChanged: true
                        });
                    }}
                    selectedLanguageId={this.state.selectedLanguageId}
                    translationForTargetLanguage={this.state.content}
                    languagesResponse={this.props.languagesResponse}
                    projectId={this.props.projectId}
                    keyReponse={this.props.keyResponse}
                />
            </div>
        );
    }
}

export { TranslationCard };
