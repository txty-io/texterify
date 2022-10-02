import { Button, Form, message, Select } from "antd";
import * as React from "react";
import { IKey, KeysAPI } from "../api/v1/KeysAPI";
import { ITag, TagsAPI } from "../api/v1/TagsAPI";

interface IFormValues {
    tagId: string;
}

export interface IAddTagToKeyFormProps {
    translationKey: IKey;
    style?: React.CSSProperties;
    formId?: string;
    noButton?: boolean;
    onSaving?(): void;
    onSaved?(): void;
}

export function AddTagToKeyForm(props: IAddTagToKeyFormProps) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [tags, setTags] = React.useState<ITag[]>([]);

    async function loadTags() {
        setLoading(true);

        try {
            const tagsResponse = await TagsAPI.getTags({ projectId: props.translationKey.attributes.project_id });
            setTags(tagsResponse.data);
        } catch (error) {
            console.error(error);
            message.error("Failed to load tags.");
        }

        setLoading(false);
    }

    React.useEffect(() => {
        loadTags();
    }, []);

    async function handleSubmit(values: IFormValues) {
        setLoading(true);

        if (props.onSaving) {
            props.onSaving();
        }

        try {
            const response = await KeysAPI.addTag({
                projectId: props.translationKey.attributes.project_id,
                keyId: props.translationKey.id,
                tagId: values.tagId
            });
            if (response.error) {
                message.error("An error occurred while adding tag to key.");
            } else {
                message.success("Tag successfully added to key.");
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to add tag to key.");
        }

        if (props.onSaved) {
            props.onSaved();
        }

        setLoading(false);
    }

    return (
        <>
            <Form name="addTagToKeyForm" onFinish={handleSubmit} style={props.style} id={props.formId}>
                <h3>Select the tag to add</h3>
                <Form.Item
                    name="tagId"
                    rules={[{ required: true, whitespace: true, message: "Please select a tag to add." }]}
                >
                    <Select
                        showSearch
                        placeholder="Select a tag to add"
                        optionFilterProp="children"
                        filterOption
                        style={{ width: "100%" }}
                    >
                        {tags.map((tag) => {
                            return (
                                <Select.Option value={tag.attributes.id} key={tag.id}>
                                    {tag.attributes.name}
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                {!props.noButton && (
                    <Button type="primary" htmlType="submit" data-id="add-tag-to-form-submit-button">
                        Add key
                    </Button>
                )}
            </Form>
        </>
    );
}
