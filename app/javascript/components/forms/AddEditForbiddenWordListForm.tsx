import { Button, Form, Input, message, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { ForbiddenWordsListsAPI, IForbiddenWordsList } from "../api/v1/ForbiddenWordsListsAPI";
import { IGetLanguagesResponse, LanguagesAPI } from "../api/v1/LanguagesAPI";
import { DATA_IDS } from "../ui/DataIds";
import { ErrorUtils } from "../ui/ErrorUtils";
import FlagIcon from "../ui/FlagIcons";
import { TexterifyModal } from "../ui/TexterifyModal";

interface IProps {
    forbiddenWordListToEdit?: IForbiddenWordsList;
    projectId: string;
    visible: boolean;
    onCancelRequest();
    onCreated?(): void;
    onUpdated?(): void;
    onChanged?(): void;
}

interface IState {
    languagesResponse: IGetLanguagesResponse;
    languagesLoading: boolean;
    selectedLanguageId: string;
}

interface IFormValues {
    name: string;
    description: string;
    content: string;
    languageId: string;
}

class AddEditForbiddenWordsListForm extends React.Component<IProps, IState> {
    state: IState = {
        languagesResponse: null,
        languagesLoading: false,
        selectedLanguageId: null
    };

    formRef = React.createRef<FormInstance>();

    async componentDidMount() {
        try {
            const languagesResponse = await LanguagesAPI.getLanguages(this.props.projectId, { showAll: true });
            this.setState({ languagesResponse: languagesResponse });
        } catch (error) {
            console.error(error);
            ErrorUtils.showError("Failed to load languages.");
        }

        this.setState({ languagesLoading: false });
    }

    handleSubmit = async (values: IFormValues) => {
        let response;

        if (this.props.forbiddenWordListToEdit) {
            response = await ForbiddenWordsListsAPI.updateForbiddenWordsList({
                projectId: this.props.projectId,
                forbiddenWordsListId: this.props.forbiddenWordListToEdit.id,
                name: values.name,
                content: values.content,
                languageId: values.languageId
            });
        } else {
            response = await ForbiddenWordsListsAPI.createForbiddenWordsList({
                projectId: this.props.projectId,
                name: values.name,
                content: values.content,
                languageId: values.languageId
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
    };

    render() {
        return (
            <TexterifyModal
                title={
                    this.props.forbiddenWordListToEdit ? "Edit forbidden word list" : "Add a new forbidden word list"
                }
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
                        >
                            {this.props.forbiddenWordListToEdit ? "Save changes" : "Create forbidden word list"}
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
            >
                <Form
                    ref={this.formRef}
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%" }}
                    id="addEditForbiddenWordsListForm"
                    initialValues={
                        this.props.forbiddenWordListToEdit && {
                            name: this.props.forbiddenWordListToEdit.attributes.name,
                            content: this.props.forbiddenWordListToEdit.attributes.content,
                            languageId: this.props.forbiddenWordListToEdit.attributes.language_id
                        }
                    }
                >
                    <h3>Name *</h3>
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

                    <h3>Language</h3>
                    <Form.Item
                        name="languageId"
                        rules={[{ required: false, whitespace: true, message: "Please select a language." }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a language"
                            optionFilterProp="children"
                            filterOption
                            allowClear
                            style={{ width: "100%" }}
                        >
                            {this.state.languagesResponse?.data.map((language, index) => {
                                const countryCode = APIUtils.getIncludedObject(
                                    language.relationships.country_code.data,
                                    this.state.languagesResponse.included
                                );

                                return (
                                    <Select.Option value={language.attributes.id} key={index}>
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
                    </Form.Item>

                    <h3>Words</h3>
                    <p>
                        A list of words that should not be included in your translations. Each word should be put on a
                        new line.
                    </p>
                    <Form.Item name="content" rules={[{ required: false, whitespace: true }]}>
                        <TextArea placeholder="bad word" style={{ minHeight: 400 }} />
                    </Form.Item>
                </Form>
            </TexterifyModal>
        );
    }
}

export { AddEditForbiddenWordsListForm };
