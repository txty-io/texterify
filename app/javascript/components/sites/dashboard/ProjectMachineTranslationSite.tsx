import { Button, Checkbox, Form, Layout, message } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";

interface IAutoTranslation {
    machineTranslationEnabled: boolean;
    autoTranslateNewKeys: boolean;
    autoTranslateNewLanguages: boolean;
}

@observer
class ProjectMachineTranslationSite extends React.Component {
    async handleSubmit(values: IAutoTranslation) {
        try {
            await ProjectsAPI.updateProject({
                projectId: dashboardStore.currentProject.id,
                machineTranslationEnabled: values.machineTranslationEnabled,
                autoTranslateNewKeys: values.autoTranslateNewKeys,
                autoTranslateNewLanguages: values.autoTranslateNewLanguages
            });
            message.success("Settings updated.");
        } catch (error) {
            console.error(error);
            message.error("Failed to update machine translation settings.");
        }
    }

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="projectMachineTranslation" />
                <Layout.Content
                    style={{
                        margin: "24px 16px 0",
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: 560
                    }}
                >
                    <h1>Machine Translation</h1>
                    <p>
                        Machine translation allows you to automatically translate your project into several different
                        languages with the click of a button.
                    </p>

                    <Form
                        id="machineTranslationSettingsForm"
                        onFinish={this.handleSubmit}
                        style={{ maxWidth: "100%", marginTop: 24 }}
                        initialValues={{
                            machineTranslationEnabled:
                                dashboardStore.currentProject.attributes.machine_translation_enabled,
                            autoTranslateNewKeys: dashboardStore.currentProject.attributes.auto_translate_new_keys,
                            autoTranslateNewLanguages:
                                dashboardStore.currentProject.attributes.auto_translate_new_languages
                        }}
                    >
                        <Form.Item noStyle shouldUpdate>
                            {() => {
                                return (
                                    <>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <Form.Item
                                                name="machineTranslationEnabled"
                                                rules={[{ required: false }]}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Checkbox>
                                                    <div style={{ display: "inline-block" }}>
                                                        <div style={{ fontWeight: "bold" }}>
                                                            Enable auto machine translation
                                                        </div>
                                                        <div>Enable auto machine translation for this project.</div>
                                                    </div>
                                                </Checkbox>
                                            </Form.Item>
                                        </div>
                                    </>
                                );
                            }}
                        </Form.Item>

                        <div style={{ marginLeft: 40, marginTop: 24 }}>
                            <Form.Item noStyle shouldUpdate>
                                {({ getFieldValue }) => {
                                    return (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <Form.Item
                                                    name="autoTranslateNewKeys"
                                                    rules={[{ required: false }]}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox disabled={!getFieldValue("machineTranslationEnabled")}>
                                                        <div style={{ display: "inline-block" }}>
                                                            <div style={{ fontWeight: "bold" }}>
                                                                Automatically translate new keys
                                                            </div>
                                                            <div>
                                                                Automatically translate new keys using machine
                                                                translation.
                                                            </div>
                                                        </div>
                                                    </Checkbox>
                                                </Form.Item>
                                            </div>
                                        </>
                                    );
                                }}
                            </Form.Item>

                            <Form.Item noStyle shouldUpdate>
                                {({ getFieldValue }) => {
                                    return (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
                                                <Form.Item
                                                    name="autoTranslateNewLanguages"
                                                    rules={[{ required: false }]}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox disabled={!getFieldValue("machineTranslationEnabled")}>
                                                        <div style={{ display: "inline-block" }}>
                                                            <div style={{ fontWeight: "bold" }}>
                                                                Automatically translate new languages
                                                            </div>
                                                            <div>
                                                                When you add a new language all keys are automatically
                                                                translated.
                                                            </div>
                                                        </div>
                                                    </Checkbox>
                                                </Form.Item>
                                            </div>
                                        </>
                                    );
                                }}
                            </Form.Item>
                        </div>
                    </Form>

                    <Button
                        form="machineTranslationSettingsForm"
                        type="primary"
                        htmlType="submit"
                        style={{ alignSelf: "flex-end", marginTop: 24 }}
                    >
                        Save
                    </Button>
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectMachineTranslationSite };
