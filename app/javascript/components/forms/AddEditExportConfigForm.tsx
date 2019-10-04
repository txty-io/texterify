import { Button, Form, Input, Modal, Select } from "antd";
import * as React from "react";
import { CountryCodesAPI } from "../api/v1/CountryCodesAPI";
import { ExportConfigsAPI } from "../api/v1/ExportConfigsAPI";
import { LanguageCodesAPI } from "../api/v1/LanguageCodesAPI";
import { LanguagesAPI } from "../api/v1/LanguagesAPI";
import FlagIcon from "../ui/FlagIcons";

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

class AddEditExportConfigFormUnwrapped extends React.Component<IProps, IState> {
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

  handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: IFormValues) => {
      if (!err) {
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
      }
    });
  }

  getFileFormatOptions = () => {
    return [
      {
        value: "json",
        text: "JSON"
      },
      {
        value: "typescript",
        text: "TypeScript"
      },
      {
        value: "android",
        text: "Android"
      },
      {
        value: "ios",
        text: "iOS"
      },
      {
        value: "rails",
        text: "Ruby on Rails"
      }
    ];
  }

  // tslint:disable-next-line:max-func-body-length
  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form
        onSubmit={this.handleSubmit}
        style={{ maxWidth: "100%" }}
        id="addEditExportConfigForm"
      >
        <h3>Name *</h3>
        <Form.Item>
          {getFieldDecorator("name", {
            initialValue: this.props.exportConfigToEdit ? this.props.exportConfigToEdit.attributes.name : undefined,
            rules: [{ required: true, message: "Please enter the name of the export config." }]
          })(
            <Input placeholder="Name" autoFocus />
          )}
        </Form.Item>

        <h3>File format *</h3>
        <Form.Item>
          {getFieldDecorator("fileFormat", {
            initialValue: this.props.exportConfigToEdit ? this.props.exportConfigToEdit.attributes.file_format : undefined,
            rules: [{ required: true, message: "Please enter the file format of the files." }]
          })(
            <Select
              showSearch
              placeholder="Select a file format"
              optionFilterProp="children"
              filterOption
              style={{ width: "100%" }}
            >
              {this.getFileFormatOptions().map((fileFormat, index) => {
                return (
                  <Select.Option value={fileFormat.value} key={index}>
                    {fileFormat.text}
                  </Select.Option>
                );
              })
              }
            </Select>
          )}
        </Form.Item>

        <h3>File path *</h3>
        <p>The file path specifies where files are placed in the exported folder.</p>
        <Form.Item>
          {getFieldDecorator("filePath", {
            initialValue: this.props.exportConfigToEdit ? this.props.exportConfigToEdit.attributes.file_path : undefined,
            rules: [{ required: true, message: "Please enter the file path of the files." }]
          })(
            <Input placeholder="File path" autoFocus />
          )}
        </Form.Item>

        <h3>Default language file path</h3>
        <p>A special file path for the default language if available.</p>
        <Form.Item>
          {getFieldDecorator("defaultLanguageFilePath", {
            initialValue: this.props.exportConfigToEdit ? this.props.exportConfigToEdit.attributes.default_language_file_path : undefined,
            rules: []
          })(
            <Input placeholder="Default language file path" autoFocus />
          )}
        </Form.Item>
      </Form>
    );
  }
}

const AddEditExportConfigForm: any = Form.create()(AddEditExportConfigFormUnwrapped);
export { AddEditExportConfigForm };
