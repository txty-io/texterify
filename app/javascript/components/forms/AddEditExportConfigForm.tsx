import { Input, Select, Form } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import * as React from "react";
import { ExportConfigsAPI } from "../api/v1/ExportConfigsAPI";
import { FileFormatOptions } from "../configs/FileFormatOptions";

type IFormValues = {
    name: string;
    fileFormat: string;
    filePath: string;
    defaultLanguageFilePath: string;
};

interface IProps {
    exportConfigToEdit?: any;
    form: any;
    projectId: string;
    visible: boolean;
    onCreated?(): void;
}
interface IState {
    exportConfigsResponse: any;
}

class AddEditExportConfigForm extends React.Component<IProps, IState> {
    async componentDidMount() {
        try {
            const exportConfigsResponse = await ExportConfigsAPI.getExportConfigs({ projectId: this.props.projectId });
            this.setState({
                exportConfigsResponse: exportConfigsResponse
            });
        } catch (err) {
            console.error(err);
        }
    }

    handleSubmit = async (values: IFormValues) => {
        let response;

        if (this.props.exportConfigToEdit) {
            response = await ExportConfigsAPI.updateExportConfig({
                projectId: this.props.projectId,
                defaultLanguageFilePath: values.defaultLanguageFilePath,
                fileFormat: values.fileFormat,
                exportConfigId: this.props.exportConfigToEdit.id,
                filePath: values.filePath,
                name: values.name
            });
        } else {
            response = await ExportConfigsAPI.createExportConfig({
                projectId: this.props.projectId,
                defaultLanguageFilePath: values.defaultLanguageFilePath,
                fileFormat: values.fileFormat,
                filePath: values.filePath,
                name: values.name
            });
        }

        if (response.errors) {
            return;
        }

        if (this.props.onCreated) {
            this.props.onCreated();
        }
    };

    // tslint:disable-next-line:max-func-body-length
    render() {
        return (
            <Form
                onFinish={this.handleSubmit}
                style={{ maxWidth: "100%" }}
                id="addEditExportConfigForm"
                initialValues={
                    this.props.exportConfigToEdit && {
                        name: this.props.exportConfigToEdit.attributes.name,
                        fileFormat: this.props.exportConfigToEdit.attributes.file_format,
                        filePath: this.props.exportConfigToEdit.attributes.file_path,
                        defaultLanguageFilePath: this.props.exportConfigToEdit.attributes.default_language_file_path
                    }
                }
            >
                <h3>Name *</h3>
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: "Please enter the name of the export config." }]}
                >
                    <Input placeholder="Name" autoFocus />
                </Form.Item>

                <h3>File format *</h3>
                <Form.Item
                    name="fileFormat"
                    rules={[{ required: true, message: "Please enter the file format of the files." }]}
                >
                    <Select
                        showSearch
                        placeholder="Select a file format"
                        optionFilterProp="children"
                        filterOption
                        style={{ width: "100%" }}
                    >
                        {FileFormatOptions.map((fileFormat, index) => {
                            return (
                                <Select.Option value={fileFormat.value} key={index}>
                                    {fileFormat.text}
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                <h3>File path *</h3>
                <p>The file path specifies where files are placed in the exported folder.</p>

                <p>You can make use of the following variables to create dynamic paths:</p>
                <div style={{ display: "flex" }}>
                    <Paragraph code copyable style={{ marginRight: 24 }}>
                        {"{languageCode}"}
                    </Paragraph>
                    <Paragraph code copyable>
                        {"{countryCode}"}
                    </Paragraph>
                </div>
                <Form.Item
                    name="filePath"
                    rules={[{ required: true, message: "Please enter the file path of the files." }]}
                >
                    <Input placeholder="File path" />
                </Form.Item>

                <h3>Default language file path</h3>
                <p>A special file path for the default language if available.</p>
                <Form.Item name="defaultLanguageFilePath" rules={[]}>
                    <Input placeholder="Default language file path" />
                </Form.Item>
            </Form>
        );
    }
}

export { AddEditExportConfigForm };
