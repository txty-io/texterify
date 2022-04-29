import { Button, Form, Input, message, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import { CountryCodesAPI } from "../api/v1/CountryCodesAPI";
import {
    ForbiddenWordsListsAPI,
    IForbiddenWordsList,
    IForbiddenWordsListLinkedTo
} from "../api/v1/ForbiddenWordsListsAPI";
import { LanguageCodesAPI } from "../api/v1/LanguageCodesAPI";
import { DATA_IDS } from "../ui/DataIds";
import { ErrorUtils } from "../ui/ErrorUtils";
import FlagIcon from "../ui/FlagIcons";
import { TexterifyModal } from "../ui/TexterifyModal";

interface IProps {
    forbiddenWordListToEdit?: IForbiddenWordsList;
    linkedId: string;
    linkedType: IForbiddenWordsListLinkedTo;
    visible: boolean;
    onCancelRequest();
    onCreated?(): void;
    onUpdated?(): void;
    onChanged?(): void;
}

interface IState {
    countryCodes: any[];
    languageCodes: any[];
    formSubmitting: boolean;
}

interface IFormValues {
    name: string;
    description: string;
    content: string;
    languageCodeId: string;
    countryCodeId: string;
}

class AddEditForbiddenWordsListForm extends React.Component<IProps, IState> {
    state: IState = {
        countryCodes: [],
        languageCodes: [],
        formSubmitting: false
    };

    formRef = React.createRef<FormInstance>();

    async componentDidMount() {
        try {
            const countryCodes = await CountryCodesAPI.getCountryCodes();
            this.setState({
                countryCodes: countryCodes.data
            });
        } catch (err) {
            console.error(err);
        }

        try {
            const languageCodes = await LanguageCodesAPI.getAll();
            this.setState({
                languageCodes: languageCodes.data
            });
        } catch (err) {
            console.error(err);
        }
    }

    handleSubmit = async (values: IFormValues) => {
        this.setState({ formSubmitting: true });

        try {
            let response;

            if (this.props.forbiddenWordListToEdit) {
                response = await ForbiddenWordsListsAPI.updateForbiddenWordsList({
                    linkedId: this.props.linkedId,
                    linkedType: this.props.linkedType,
                    forbiddenWordsListId: this.props.forbiddenWordListToEdit.id,
                    name: values.name,
                    content: values.content,
                    languageCodeId: values.languageCodeId,
                    countryCodeId: values.countryCodeId
                });
            } else {
                response = await ForbiddenWordsListsAPI.createForbiddenWordsList({
                    linkedId: this.props.linkedId,
                    linkedType: this.props.linkedType,
                    name: values.name,
                    content: values.content,
                    languageCodeId: values.languageCodeId,
                    countryCodeId: values.countryCodeId
                });
            }

            if (response.errors) {
                ErrorUtils.showErrors(response.errors);

                return;
            }

            if (!this.props.forbiddenWordListToEdit && this.props.onCreated) {
                this.props.onCreated();
            }

            if (this.props.forbiddenWordListToEdit && this.props.onUpdated) {
                this.props.onUpdated();
            }

            if (this.props.onChanged) {
                this.props.onChanged();
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to save list.");
        }

        this.setState({ formSubmitting: false });
    };

    render() {
        return (
            <TexterifyModal
                title={this.props.forbiddenWordListToEdit ? "Edit list" : "Add a new list"}
                visible={this.props.visible}
                footer={
                    <div style={{ margin: "6px 0" }}>
                        <Button
                            onClick={() => {
                                this.props.onCancelRequest();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            form="addEditForbiddenWordsListForm"
                            type="primary"
                            htmlType="submit"
                            data-id={DATA_IDS.FORBIDDEN_WORDS_LIST_FORM_SUBMIT}
                            loading={this.state.formSubmitting}
                        >
                            {this.props.forbiddenWordListToEdit ? "Save changes" : "Create forbidden word list"}
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
                big
            >
                <Form
                    ref={this.formRef}
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%" }}
                    id="addEditForbiddenWordsListForm"
                    initialValues={
                        this.props.forbiddenWordListToEdit &&
                        ({
                            name: this.props.forbiddenWordListToEdit.attributes.name,
                            content: this.props.forbiddenWordListToEdit.attributes.content,
                            languageCodeId: this.props.forbiddenWordListToEdit.attributes.language_code_id,
                            countryCodeId: this.props.forbiddenWordListToEdit.attributes.country_code_id
                        } as IFormValues)
                    }
                >
                    <div style={{ display: "flex" }}>
                        <div
                            style={{
                                width: "50%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <div>
                                <h3>Name *</h3>
                                <p>Give your list a name that best describes the words in it.</p>
                                <Form.Item
                                    name="name"
                                    rules={[
                                        {
                                            required: true,
                                            whitespace: true,
                                            message: "Please enter the name of the forbidden words list."
                                        }
                                    ]}
                                >
                                    <Input placeholder="Name" />
                                </Form.Item>
                            </div>

                            <div>
                                <h3>
                                    Language
                                    <span style={{ fontSize: 12, marginLeft: 8, fontWeight: "bold" }}>
                                        (ISO 639-1 code)
                                    </span>
                                </h3>
                                <p>
                                    Set a language for which this word list applys. If you don't set a language the word
                                    list applys to all translations of all languages.
                                </p>
                                <Form.Item name="languageCodeId" rules={[]}>
                                    <Select
                                        showSearch
                                        placeholder="Select a language"
                                        optionFilterProp="children"
                                        filterOption
                                        style={{ width: "100%" }}
                                    >
                                        {this.state.languageCodes.map((languageCode) => {
                                            return (
                                                <Select.Option key={languageCode.id} value={undefined}>
                                                    {`${languageCode.attributes.name} (${languageCode.attributes.code})`}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                </Form.Item>
                            </div>

                            <div>
                                <h3>
                                    Country
                                    <span style={{ fontSize: 12, marginLeft: 8, fontWeight: "bold" }}>
                                        (ISO 3166-1 alpha-2 code)
                                    </span>
                                </h3>
                                <p>
                                    Set a country for which this word list applys. If you don't set a country the word
                                    list applys to all translations of all languages.
                                </p>
                                <Form.Item name="countryCodeId" rules={[]}>
                                    <Select
                                        showSearch
                                        placeholder="Select a country"
                                        optionFilterProp="children"
                                        filterOption
                                        style={{ width: "100%" }}
                                    >
                                        {this.state.countryCodes.map((countryCode) => {
                                            return (
                                                <Select.Option key={countryCode.id} value={undefined}>
                                                    <span style={{ marginRight: 8 }}>
                                                        <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                                    </span>
                                                    {`${countryCode.attributes.name} (${countryCode.attributes.code})`}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>

                        <div style={{ width: "50%", marginLeft: 40 }}>
                            <h3>Words</h3>
                            <p>
                                A list of words that should not be included in your translations. Each word should be
                                put on a new line.
                            </p>
                            <Form.Item name="content" rules={[{ required: false, whitespace: true }]}>
                                <TextArea placeholder="bad word" style={{ minHeight: 400 }} />
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </TexterifyModal>
        );
    }
}

export { AddEditForbiddenWordsListForm };
