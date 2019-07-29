import EditorJS from "@editorjs/editorjs";
import List from "@editorjs/list";
import { Button, Icon, message, Select } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import styled from "styled-components";
import { APIUtils } from "../../../api/v1/APIUtils";
import { TranslationsAPI } from "../../../api/v1/TranslationsAPI";
import FlagIcon from "../../../ui/FlagIcons";
import { Styles } from "../../../ui/Styles";

const EMPTY_EDITOR_HEIGHT = 108;

const EditorWrapper = styled.div`
    background: #fff;
    border: 1px solid #e8e8e8;
    padding: 12px 24px 12px 40px;
    border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
    transition: all 0.3s;

    &:hover {
        border: 1px solid ${Styles.COLOR_PRIMARY};
    }
`;

type IProps = {
    projectId: string;
    languagesResponse: any;
    defaultSelected: any;
    keyResponse: any;
    hideLanguageSelection?: boolean;
    hideSaveButton?: boolean;
    onChange?(changed: boolean);
};
type IState = {
    selectedLanguage: string;
    editorContentChanged: boolean;
    editorLoaded: boolean;
    textareaContentChanged: boolean;
    isHTMLKey: boolean;
    translationForLanguage: string;
    content: string;
};

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
        const translationForLanguage = await this.getTranslationForLanguage(this.state.selectedLanguage);
        const isHTMLKey = this.props.keyResponse.data.attributes.html_enabled;

        if (isHTMLKey) {
            let htmlData;
            try {
                htmlData = JSON.parse(translationForLanguage);
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
                onChange: () => {
                    if (this.props.onChange) {
                        this.props.onChange(true);
                    }
                    this.setState({ editorContentChanged: true });
                },
                data: isHTMLKey ? htmlData : undefined
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
    }

    getTranslationForLanguage = (languageId: string) => {
        let translationForLanguage;
        this.props.keyResponse.data.relationships.translations.data.map((translationReference) => {
            const translation = APIUtils.getIncludedObject(translationReference, this.props.keyResponse.included);
            if (translation.relationships.language.data.id === languageId) {
                translationForLanguage = translation.attributes.content;
            }
        });

        return translationForLanguage;
    }

    isHTMLKey = () => {
        return this.state.isHTMLKey;
    }

    contentChanged = () => {
        return this.state.editorContentChanged || this.state.textareaContentChanged;
    }

    getEditorLoadingOverlay = () => {
        return (
            <div style={{ width: "100%", height: "100%", position: "absolute", left: 0, top: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Icon type="loading" style={{ fontSize: 24, margin: "auto" }} spin />
            </div>
        );
    }

    saveChanges = async () => {
        let promise;
        if (this.state.isHTMLKey) {
            promise = this.editor.save();
        } else {
            promise = Promise.resolve(this.state.content);
        }

        return promise.then(async (content) => {
            if (this.state.isHTMLKey) {
                content = JSON.stringify(content);
            }

            let translationIdToUpdate;
            this.props.keyResponse.data.relationships.translations.data.map((translationReference) => {
                const translation = APIUtils.getIncludedObject(translationReference, this.props.keyResponse.included);
                const languageId = translation.relationships.language.data.id;

                if (languageId === this.state.selectedLanguage) {
                    translationIdToUpdate = translation.id;
                }
            });

            if (translationIdToUpdate) {
                await TranslationsAPI.updateTranslation(
                    this.props.projectId,
                    translationIdToUpdate,
                    content
                );
            } else {
                await TranslationsAPI.createTranslation(
                    this.props.projectId,
                    this.state.selectedLanguage,
                    this.props.keyResponse.data.id,
                    content
                );
            }

            this.setState({
                editorContentChanged: false,
                textareaContentChanged: false
            });
        }).catch((error) => {
            console.error(error);
            message.error("Failed to save changes.");
        });
    }

    render() {
        return (
            <div style={{ marginBottom: 24, width: "100%" }}>
                <div style={{ marginBottom: 8, display: "flex" }}>
                    {!this.props.hideLanguageSelection && <Select
                        style={{ flexGrow: 1, maxWidth: 200 }}
                        onChange={async (selectedValue: string) => {
                            this.setState({
                                selectedLanguage: selectedValue
                            }, this.loadData);
                        }}
                        value={this.state.selectedLanguage}
                    >
                        {this.props.languagesResponse && this.props.languagesResponse.data.map((language, index) => {
                            const countryCode = APIUtils.getIncludedObject(language.relationships.country_code.data, this.props.languagesResponse.included);

                            return <Select.Option value={language.id} key={language.attributes.name}>
                                {countryCode && <span style={{ marginRight: 8 }}>
                                    <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                </span>}
                                {language.attributes.name}
                            </Select.Option>;
                        })}
                    </Select>}
                    {!this.props.hideSaveButton && <Button
                        type="primary"
                        disabled={!this.contentChanged()}
                        style={{ marginLeft: "auto" }}
                        onClick={this.saveChanges}
                    >
                        Save changes
                    </Button>}
                </div>

                {this.isHTMLKey() ?
                    <div style={{ position: "relative" }}>
                        <EditorWrapper style={{ opacity: this.state.editorLoaded ? 1 : 0, height: this.state.editorLoaded ? undefined : EMPTY_EDITOR_HEIGHT }}>
                            <div id={`codex-editor-${this.state.selectedLanguage}`} />
                        </EditorWrapper>
                        {!this.state.editorLoaded && this.getEditorLoadingOverlay()}
                    </div> :
                    <TextArea
                        autosize={{ minRows: 4, maxRows: 6 }}
                        placeholder="Language translation content"
                        onChange={(event) => {
                            if (event.target.value !== this.state.translationForLanguage && !this.state.textareaContentChanged) {
                                this.setState({ textareaContentChanged: true });
                            } else if (event.target.value === this.state.translationForLanguage && this.state.textareaContentChanged) {
                                this.setState({ textareaContentChanged: false });
                            }

                            this.setState({ content: event.target.value });
                        }}
                        value={this.state.content}
                    />
                }
            </div>
        );
    }
}

export { TranslationCard };
