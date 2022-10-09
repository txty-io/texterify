import { CloseOutlined } from "@ant-design/icons";
import { message, Tag, Tooltip } from "antd";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { IKey, IKeyIncluded, KeysAPI } from "../api/v1/KeysAPI";
import { AddTagToKeyModal } from "../forms/AddTagToKeyModal";
import { dashboardStore } from "../stores/DashboardStore";
import { PermissionUtils } from "../utilities/PermissionUtils";
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
            <Tooltip
                key={`${props.translationKey.attributes.id}-html_enabled`}
                title="This key has the HTML editor enabled."
            >
                <Tag color="geekblue" style={{ margin: 0, marginRight: 4, marginBottom: 4 }}>
                    System: HTML
                </Tag>
            </Tooltip>
        );
    }

    if (props.translationKey.attributes.pluralization_enabled) {
        tags.push(
            <Tooltip key={`${props.translationKey.attributes.id}-plural`} title="This key has pluralization enabled.">
                <Tag
                    color="geekblue"
                    style={{
                        margin: 0,
                        marginRight: 4,
                        marginBottom: 4
                    }}
                >
                    System: Plural
                </Tag>
            </Tooltip>
        );
    }

    if (props.translationKey.relationships.wordpress_contents.data.length > 0) {
        tags.push(
            <Tooltip
                key={`${props.translationKey.attributes.id}-wordpress`}
                title="This key is linked to WordPress content."
            >
                <Tag color="geekblue" style={{ margin: 0 }}>
                    System: WordPress
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
                        <Tooltip key={`${props.translationKey.attributes.id}-${tag.id}`} title="This is a custom key.">
                            <Tag
                                color="magenta"
                                style={{ margin: 0, marginRight: 4, marginBottom: 4 }}
                                closable={PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())}
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
                        </Tooltip>
                    );
                })}
                {tags}
                {PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole()) && (
                    <AddTagButton
                        onClick={() => {
                            setAddTagModalVisible(true);
                        }}
                    />
                )}
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
