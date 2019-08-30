import { Button, Form, Input, Modal, Select } from "antd";
import * as React from "react";
import { CountryCodesAPI } from "../api/v1/CountryCodesAPI";
import { LanguagesAPI } from "../api/v1/LanguagesAPI";
import FlagIcon from "../ui/FlagIcons";
import { makeCancelable } from "../utilities/Promise";

interface IProps {
  languageToEdit?: any;
  form: any;
  projectId: string;
  visible: boolean;
  onCancelRequest();
  onCreated?(): void;
}
interface IState {
  countryCodes: any[];
}

class AddEditLanguageFormUnwrapped extends React.Component<IProps, IState> {
  getCountryCodesPromise: any = null;

  constructor(props: IProps) {
    super(props);

    this.state = {
      countryCodes: []
    };
  }

  async componentDidMount() {
    try {
      this.getCountryCodesPromise = makeCancelable(CountryCodesAPI.getCountryCodes());
      const countryCodes = await this.getCountryCodesPromise.promise;
      this.setState({
        countryCodes: countryCodes.data
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
  }

  componentWillUnmount() {
    if (this.getCountryCodesPromise !== null) { this.getCountryCodesPromise.cancel(); }
  }

  handleSubmit = (e: any): void => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (!err) {
        let response;

        if (this.props.languageToEdit) {
          response = await LanguagesAPI.updateLanguage(this.props.projectId, this.props.languageToEdit.id, values.name, values.countryCode);
        } else {
          response = await LanguagesAPI.createLanguage(this.props.projectId, values.name, values.countryCode);
        }

        if (response.errors) {
          response.errors.map((error) => {
            if (error.details === "A language with that name already exists for this project.") {
              this.props.form.setFields({
                name: {
                  value: values.name,
                  errors: [new Error(error.details)]
                }
              });
            }
          });

          return;
        }

        if (this.props.onCreated) {
          this.props.onCreated();
        }
      }
    });
  }

  render(): JSX.Element {
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        maskClosable={false}
        title={this.props.languageToEdit ? "Edit language" : "Add a new language"}
        visible={this.props.visible}
        footer={
          <div style={{ margin: "6px 0" }}>
            <Button onClick={() => { this.props.onCancelRequest(); }}>
              Cancel
            </Button>
            <Button form="addEditLanguageForm" type="primary" htmlType="submit">
              {this.props.languageToEdit ? "Save changes" : "Create language"}
            </Button>
          </div>}
        onCancel={this.props.onCancelRequest}
        destroyOnClose
      >
        <Form
          onSubmit={this.handleSubmit}
          style={{ maxWidth: "100%" }}
          id="addEditLanguageForm"
        >
          <h3>Name *</h3>
          <Form.Item>
            {getFieldDecorator("name", {
              initialValue: this.props.languageToEdit ? this.props.languageToEdit.attributes.name : undefined,
              rules: [{ required: true, message: "Please enter the name of the language." }]
            })(
              <Input placeholder="Name" autoFocus />
            )}
          </Form.Item>

          <h3>Country</h3>
          <Form.Item>
            {getFieldDecorator("countryCode", {
              initialValue: this.props.languageToEdit &&
                this.props.languageToEdit.relationships &&
                this.props.languageToEdit.relationships.country_code &&
                this.props.languageToEdit.relationships.country_code.data ? this.props.languageToEdit.relationships.country_code.data.id : undefined,
              rules: []
            })(
              <Select
                showSearch
                placeholder="Select a country"
                optionFilterProp="children"
                filterOption
                style={{ width: "100%" }}
              >
                {this.state.countryCodes.map((countryCode) => {
                  return (
                    <Select.Option key={countryCode.id}>
                      <span style={{ marginRight: 8 }}>
                        <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                      </span>
                      {countryCode.attributes.name}
                    </Select.Option>
                  );
                })
                }
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const AddEditLanguageForm: any = Form.create()(AddEditLanguageFormUnwrapped);
export { AddEditLanguageForm };
