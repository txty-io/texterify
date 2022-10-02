import { CloseOutlined } from "@ant-design/icons";
import { message, Tag, Tooltip } from "antd";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { IKey, IKeyIncluded, KeysAPI } from "../api/v1/KeysAPI";
import { AddTagToKeyModal } from "../forms/AddTagToKeyModal";
import { AddTagButton } from "./AddTagButton";

export function KeyTags(props: {
    translationKey: IKey;
    included: IKeyIncluded;
    onTagAdded(): void;
    onTagRemoved(): void;
}) {
    const [addTagModalVisible, setAddTagModalVisible] = React.useState<boolean>(false);

    const tags = [];

    if (props.translationKey.attributes.html_enabled) {
        tags.push(
            <Tooltip title="This key has the HTML editor enabled.">
                <Tag
                    key={`${props.translationKey.attributes.id}-html_enabled`}
                    color="magenta"
                    style={{ margin: 0, marginRight: 4, marginBottom: 4 }}
                >
                    HTML
                </Tag>
            </Tooltip>
        );
    }

    if (props.translationKey.attributes.pluralization_enabled) {
        tags.push(
            <Tooltip title="This key has pluralization enabled.">
                <Tag
                    key={`${props.translationKey.attributes.id}-plural`}
                    color="geekblue"
                    style={{
                        margin: 0,
                        marginRight: 4,
                        marginBottom: 4
                    }}
                >
                    Plural
                </Tag>
            </Tooltip>
        );
    }

    if (props.translationKey.relationships.wordpress_contents.data.length > 0) {
        tags.push(
            <Tooltip title="This key is linked to WordPress content.">
                <Tag key={`${props.translationKey.attributes.id}-wordpress`} color="magenta" style={{ margin: 0 }}>
                    WordPress
                </Tag>
            </Tooltip>
        );
    }

    return (
        <>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {props.translationKey.relationships.tags.data.map((tag) => {
                    const included = APIUtils.getIncludedObject(tag, props.included);

                    return (
                        <Tag
                            key={`${props.translationKey.attributes.id}-${tag.id}`}
                            color="magenta"
                            style={{ margin: 0, marginRight: 4, marginBottom: 4 }}
                            closable
                            closeIcon={<CloseOutlined style={{ color: "var(--custom-tag-color)" }} />}
                            onClose={(e: React.MouseEvent<HTMLElement>) => {
                                e.preventDefault();

                                try {
                                    KeysAPI.removeTag({
                                        projectId: props.translationKey.attributes.project_id,
                                        keyId: props.translationKey.id,
                                        tagId: tag.id
                                    });
                                    message.success("Successfully removed tag from key.");
                                } catch (error) {
                                    console.error(error);
                                    message.error("Failed to remove tag from key.");
                                }

                                props.onTagRemoved();
                            }}
                        >
                            {included.attributes.name}
                        </Tag>
                    );
                })}
                {tags}
                <AddTagButton
                    onClick={() => {
                        setAddTagModalVisible(true);
                    }}
                />
            </div>

            <AddTagToKeyModal
                translationKey={props.translationKey}
                visible={addTagModalVisible}
                onCancelRequest={async () => {
                    setAddTagModalVisible(false);
                }}
                onSaved={async () => {
                    setAddTagModalVisible(false);
                    props.onTagAdded();
                }}
            />
        </>
    );
}
