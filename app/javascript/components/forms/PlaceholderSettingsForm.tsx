import { CheckCircleFilled } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import * as React from "react";
import { PlaceholdersAPI } from "../api/v1/PlaceholdersAPI";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { dashboardStore } from "../stores/DashboardStore";
import { TexterifyModal } from "../ui/TexterifyModal";

interface IFormValues {
    placeholderStart: string;
    placeholderEnd: string;
}

function PlaceholderSettingsForm(props: {
    projectId: string;
    placeholderStart: string;
    placeholderEnd: string;
    onSaving?(): void;
    onSaved?(): void;
}) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [updatePlaceholdersModalVisible, setUpdatePlaceholdersModalVisible] = React.useState<boolean>(false);

    async function handleSubmit(values: IFormValues) {
        setLoading(true);

        if (props.onSaving) {
            props.onSaving();
        }

        try {
            const response = await ProjectsAPI.updateProjectPlaceholderSettings({
                projectId: props.projectId,
                placeholderStart: values.placeholderStart,
                placeholderEnd: values.placeholderEnd
            });

            if (response.error) {
                message.error("An error occurred while udpating project settings.");
            } else {
                message.success("Project settings successfully updated.");

                setUpdatePlaceholdersModalVisible(true);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to update placeholder settings.");
        }

        if (props.onSaved) {
            props.onSaved();
        }

        setLoading(false);
    }

    return (
        <>
            <Form
                name="placeholderSettingsForm"
                onFinish={handleSubmit}
                initialValues={{
                    placeholderStart: props.placeholderStart,
                    placeholderEnd: props.placeholderEnd
                }}
            >
                <h3>Enter the placeholder start</h3>
                <Form.Item
                    name="placeholderStart"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: "Please enter the start of your placeholders."
                        }
                    ]}
                >
                    <Input
                        placeholder="e.g. {"
                        disabled={loading || !dashboardStore.featureEnabled("FEATURE_VALIDATIONS")}
                    />
                </Form.Item>

                <h3 style={{ marginTop: 24 }}>Enter the placeholder end</h3>
                <Form.Item
                    name="placeholderEnd"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: "Please enter the end of your placeholders."
                        }
                    ]}
                >
                    <Input
                        placeholder="e.g. }"
                        disabled={loading || !dashboardStore.featureEnabled("FEATURE_VALIDATIONS")}
                    />
                </Form.Item>
            </Form>

            <TexterifyModal
                title="Check placeholders"
                visible={updatePlaceholdersModalVisible}
                footer={
                    <div style={{ margin: "6px 0" }}>
                        <Button
                            onClick={() => {
                                setUpdatePlaceholdersModalVisible(false);
                            }}
                        >
                            Skip
                        </Button>
                        <Button
                            type="primary"
                            data-id="check-placeholders-of-all-keys-button"
                            onClick={async () => {
                                try {
                                    await PlaceholdersAPI.checkPlaceholders({
                                        projectId: props.projectId
                                    });
                                    message.success("Successfully queued job to check placeholders for issues.");
                                    setUpdatePlaceholdersModalVisible(false);
                                    await dashboardStore.loadBackgroundJobs(props.projectId);
                                } catch (error) {
                                    console.error(error);
                                    message.error("Failed to queue job for checking placeholders.");
                                }
                            }}
                        >
                            Check placeholders of all keys
                        </Button>
                    </div>
                }
                onCancel={() => {
                    setUpdatePlaceholdersModalVisible(false);
                }}
                afterClose={() => {
                    setUpdatePlaceholdersModalVisible(false);
                }}
            >
                <CheckCircleFilled style={{ marginRight: 8, color: "var(--color-success)" }} /> Your placeholder
                settings have been updated.
                <br />
                <br />
                Do you want to check all your keys for placeholders? Existing placeholders will be removed from keys if
                they can't be found anymore in your source translations based on your new settings and new found
                placeholders will be added automatically.
            </TexterifyModal>
        </>
    );
}

export { PlaceholderSettingsForm };
