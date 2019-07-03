import EditorJS from "@editorjs/editorjs";
import List from "@editorjs/list";
import { Button, Icon, message, Select } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import styled from "styled-components";
import { APIUtils } from "../../../api/v1/APIUtils";
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
    languagesResponse: any;
    defaultSelected: any;
    keyResponse: any;
};
type IState = {
    selectedLanguage: string;
    editorContentChanged: boolean;
    editorLoaded: boolean;
};

class TranslationCard extends React.Component<IProps, IState> {
    state: IState = {
        selectedLanguage: this.props.defaultSelected,
        editorContentChanged: false,
        editorLoaded: false
    };

    editor: any;

    async componentDidMount() {
        this.editor = new EditorJS({
            holder: `codex-editor-${this.state.selectedLanguage}`,
            minHeight: 40,
            tools: {
                list: {
                    class: List,
                    inlineToolbar: true
                }
            },
            onChange: () => { this.setState({ editorContentChanged: true }); },
            data: {
                blocks: [
                    {
                        type: "paragraph",
                        data: {
                            text: this.getTranslationForLanguage(this.state.selectedLanguage)
                        }
                    }
                ]
            }
        });
        await this.editor.isReady;
        this.setState({
            editorLoaded: true
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
        return true;
    }

    contentChanged = () => {
        return this.state.editorContentChanged;
    }

    getEditorLoadingOverlay = () => {
        return (
            <div style={{ width: "100%", height: "100%", position: "absolute", left: 0, top: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Icon type="loading" style={{ fontSize: 24, margin: "auto" }} spin />
            </div>
        );
    }

    render() {
        return (
            <div style={{ marginBottom: 24, width: "100%" }}>
                <div style={{ marginBottom: 8, display: "flex" }}>
                    <Select
                        style={{ flexGrow: 1, maxWidth: 200 }}
                        onChange={(selectedValue: string) => {
                            this.setState({
                                selectedLanguage: selectedValue
                            });
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
                    </Select>
                    <Button
                        type="primary"
                        disabled={!this.contentChanged()}
                        style={{ marginLeft: "auto" }}
                        onClick={() => {
                            this.editor.save().then((outputData) => {
                                console.log("Article data: ", outputData);
                            }).catch((error) => {
                                message.error("Failed to save changes.");
                            });
                        }}
                    >
                        Save changes
                    </Button>
                </div>

                {this.isHTMLKey() ?
                    <div style={{ position: "relative" }}>
                        <EditorWrapper style={{ opacity: this.state.editorLoaded ? 1 : 0, height: this.state.editorLoaded ? undefined : EMPTY_EDITOR_HEIGHT }}>
                            <div id={`codex-editor-${this.state.selectedLanguage}`} />
                        </EditorWrapper>
                        {!this.state.editorLoaded && this.getEditorLoadingOverlay()}
                    </div> :
                    <TextArea autosize={{ minRows: 4, maxRows: 6 }} placeholder="Language translation content" />
                }
            </div>
        );
    }
}

export { TranslationCard };
