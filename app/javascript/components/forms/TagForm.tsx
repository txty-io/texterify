import { QuestionCircleFilled, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message, Tooltip } from "antd";
import * as React from "react";
import { ITag, TagsAPI } from "../api/v1/TagsAPI";
import { dashboardStore } from "../stores/DashboardStore";

interface IFormValues {
    name: string;
    disableTranslationForTranslators: boolean;
}

export interface ITagFromProps {
    projectId: string;
    tag?: ITag;
    style?: React.CSSProperties;
    formId?: string;
    noButton?: boolean;
    onSaving?(): void;
    onSaved?(): void;
}

function TagForm(props: ITagFromProps) {
    const [loading, setLoading] = React.useState<boolean>(false);

    async function handleSubmit(values: IFormValues) {
        setLoading(true);

        if (props.onSaving) {
            props.onSaving();
        }

        if (props.tag) {
            try {
                const response = await TagsAPI.updateTag({
                    projectId: props.projectId,
                    tagId: props.tag.id,
                    name: values.name,
                    disable_translation_for_translators: values.disableTranslationForTranslators
                });

                if (response.error) {
                    message.error("An error occurred while updating tag.");
                } else {
                    message.success("Tag successfully updated.");
                }
            } catch (error) {
                console.error(error);
                message.error("Failed to update tag.");
            }
        } else {
            try {
                const response = await TagsAPI.createTag({
                    projectId: props.projectId,
                    name: values.name,
                    disable_translation_for_translators: values.disableTranslationForTranslators
                });

                if (response.error) {
                    message.error("An error occurred while creating tag.");
                } else {
                    message.success("Tag successfully created.");
                }
            } catch (error) {
                console.error(error);
                message.error("Failed to create tag.");
            }
        }

        if (props.onSaved) {
            props.onSaved();
        }

        setLoading(false);
    }

    return (
        <>
            <Form
                name="tagForm"
                onFinish={handleSubmit}
                initialValues={{
                    name: props.tag?.attributes.name,
                    disableTranslationForTranslators: props.tag?.attributes.disable_translation_for_translators
                }}
                style={props.style}
                id={props.formId}
            >
                <h3>Enter the tag name</h3>
                <Form.Item
                    name="name"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: "Please enter the name of your tag."
                        }
                    ]}
                >
                    <Input
                        autoFocus
                        placeholder="Name"
                        disabled={loading || !dashboardStore.featureEnabled("FEATURE_TAGS")}
                    />
                </Form.Item>

                <Form.Item
                    name="disableTranslationForTranslators"
                    rules={[{ required: false }]}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                >
                    <Checkbox>
                        Disable translation for translators
                        <Tooltip title="Activating this option means that keys with this tag assigned can't be edited by users with the translator role.">
                            <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                        </Tooltip>
                    </Checkbox>
                </Form.Item>

                {!props.noButton && (
                    <Button type="primary" htmlType="submit" data-id="tag-form-submit-button">
                        {props.tag ? "Save changes" : "Create"}
                    </Button>
                )}
            </Form>
        </>
    );
}

export { TagForm };
