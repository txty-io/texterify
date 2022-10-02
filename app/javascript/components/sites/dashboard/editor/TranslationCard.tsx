import { Button, Select } from "antd";
import * as React from "react";
import { APIUtils } from "../../../api/v1/APIUtils";
import { IGetKeyResponse, IPlaceholder } from "../../../api/v1/KeysAPI";
import { IGetLanguagesResponse, ILanguage } from "../../../api/v1/LanguagesAPI";
import {
    IGetMachineTranslationsSourceLanguages,
    IGetMachineTranslationsTargetLanguages,
    IGetMachineTranslationSuggestion
} from "../../../api/v1/MachineTranslationsAPI";
import { EditTranslationForm } from "../../../forms/EditTranslationForm";
import FlagIcon from "../../../ui/FlagIcons";
import { MachineTranslationSuggestion } from "../../../ui/MachineTranslationSuggestion";
import { TranslationUtils } from "../../../utilities/TranslationUtils";

interface IProps {
    projectId: string;
    languages?: ILanguage[];
    languagesResponse: IGetLanguagesResponse;
    defaultSelected: string;
    keyResponse?: IGetKeyResponse;
    hideLanguageSelection?: boolean;
    hideSaveButton?: boolean;
    exportConfigId?: string;
    initialValue?: string;
    isDefaultLanguage?: boolean;
    defaultLanguage?: ILanguage;
    defaultLanguageTranslationContent?: string;
    supportedSourceLanguages?: IGetMachineTranslationsSourceLanguages;
    supportedTargetLanguages?: IGetMachineTranslationsTargetLanguages;
    onChange?(changed: boolean, content: string): void;
    onSave?(): void;
    onSelectedLanguageIdChange?(languageId: string): void;
}
interface IState {
    selectedLanguageId: string;
    contentChanged: boolean;
    translationForLanguage: string;
    content: string;
    forceContentOther: string;
}

class TranslationCard extends React.Component<IProps, IState> {
    state: IState = {
        selectedLanguageId: this.props.defaultSelected,
        contentChanged: false,
        translationForLanguage: null,
        content: null,
        forceContentOther: null
    };

    async componentDidMount() {
        await this.loadData();
    }

    loadData = async () => {
        const translationForLanguage = TranslationUtils.getTranslationForLanguage({
            languageId: this.state.selectedLanguageId,
            keyResponse: this.props.keyResponse
        })?.attributes.content;

        this.setState({
            translationForLanguage: translationForLanguage,
            content: translationForLanguage,
            contentChanged: false,
            forceContentOther: null
        });
    };

    render() {
        let defaultLanguageDisplay;
        if (this.props.isDefaultLanguage && this.props.languages) {
            const language = this.props.languages[0];

            const countryCode = APIUtils.getIncludedObject(
                language.relationships.country_code.data,
                this.props.languagesResponse.included
            );

            defaultLanguageDisplay = (
                <div style={{ display: "flex", alignItems: "center" }}>
                    {countryCode && (
                        <span style={{ marginRight: 8 }}>
                            <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                        </span>
                    )}
                    {language.attributes.name}
                </div>
            );
        }

        let converted = [this.state.content];

        this.props.keyResponse?.included
            .filter((included) => {
                return included.type === "placeholder";
            })
            .forEach((included: IPlaceholder) => {
                converted = converted.reduce((acc, element) => {
                    if (typeof element === "string") {
                        const splitted = element.split(included.attributes.name);
                        const joined = splitted.reduce((arr, curr, currIndex) => {
                            if (currIndex > 0) {
                                return arr.concat([
                                    <mark key={`${included.attributes.name}-${currIndex}`}>
                                        {included.attributes.name}
                                    </mark>,
                                    curr
                                ]);
                            } else {
                                return arr.concat([curr]);
                            }
                        }, []);

                        return acc.concat(joined);
                    } else {
                        return acc.concat([element]);
                    }
                }, []);
            });

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
                                htmlType="submit"
                                disabled={!this.state.contentChanged}
                                style={{ marginLeft: "auto" }}
                                form={`edit-translation-form-${this.state.selectedLanguageId}`}
                            >
                                Save changes
                            </Button>
                        )}
                    </div>
                )}

                <EditTranslationForm
                    keyResponse={this.props.keyResponse}
                    languagesResponse={this.props.languagesResponse}
                    projectId={this.props.projectId}
                    selectedLanguageId={this.state.selectedLanguageId}
                    selectedExportConfigId={null}
                    onChange={() => {
                        this.setState({ contentChanged: true });
                    }}
                    onSuccess={(values) => {
                        this.setState({ contentChanged: false, content: values.other, forceContentOther: null });
                        if (this.props.onSave) {
                            this.props.onSave();
                        }
                    }}
                    formId={`edit-translation-form-${this.state.selectedLanguageId}`}
                    forceContentOther={this.state.forceContentOther}
                />

                <MachineTranslationSuggestion
                    defaultLanguage={this.props.defaultLanguage}
                    defaultLanguageTranslationContent={this.props.defaultLanguageTranslationContent}
                    supportedSourceLanguages={this.props.supportedSourceLanguages}
                    supportedTargetLanguages={this.props.supportedTargetLanguages}
                    onUseTranslation={(data) => {
                        this.setState({
                            forceContentOther: data.suggestion.translation
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
