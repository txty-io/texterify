import { Form, Input, message } from "antd";
import * as React from "react";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { dashboardStore } from "../stores/DashboardStore";

interface IFormValues {
    placeholderStart: string;
    placeholderEnd: string;
}

function PlaceholderSettingsForm(props: {
    projectId: string;
    placeholderStart: string;
    placeholderEnd: string;
    style?: React.CSSProperties;
    onSaving?(): void;
    onSaved?(): void;
}) {
    const [loading, setLoading] = React.useState<boolean>(false);

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
                message.error("An error occurred while updating project settings.");
            } else {
                message.success("Project settings successfully updated.");
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
                style={props.style}
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
        </>
    );
}

export { PlaceholderSettingsForm };
