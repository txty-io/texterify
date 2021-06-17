import { Button, Form, Input, Slider } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import AvatarEditor from "react-avatar-editor";
import Dropzone from "react-dropzone";
import * as uuid from "uuid";
import { APIUtils } from "../api/v1/APIUtils";
import {
    ICreateOrganizationResponse,
    IGetOrganizationResponse,
    IUpdateOrganizationResponse,
    OrganizationsAPI
} from "../api/v1/OrganizationsAPI";
import { AvatarEditorWrapper } from "../sites/dashboard/AvatarEditorWrapper";
import { AvatarNoImage } from "../sites/dashboard/AvatarNoImage";
import { AvatarWrapper } from "../sites/dashboard/AvatarWrapper";
import { dashboardStore, IOrganization } from "../stores/DashboardStore";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";

interface IProps {
    isEdit?: boolean;
    organizationToEdit?: IOrganization;
    styles?: React.CSSProperties;
    onError(): void;
    onValidationsFailed?(): void;
    onChanged?(organization: IOrganization, isNew: boolean): void;
}
interface IState {
    imageUrl: string;
    imageScale: number;
    imagePosition: { x: number; y: number };
}

class NewOrganizationForm extends React.Component<IProps, IState> {
    isMovingImage = false;
    dropzone: any = React.createRef();
    avatarEditor: any = React.createRef();
    formRef = React.createRef<FormInstance>();

    state: IState = {
        imageUrl: "",
        imageScale: 100,
        imagePosition: { x: 0.5, y: 0.5 }
    };

    async componentDidMount() {
        if (this.props.isEdit) {
            const imageResponse = await OrganizationsAPI.getImage({
                organizationId: this.props.organizationToEdit
                    ? this.props.organizationToEdit.id
                    : dashboardStore.currentOrganization.id
            });
            if (imageResponse.image) {
                this.setState({ imageUrl: imageResponse.image });
            }
        }
    }

    handleSubmit = async (values: any) => {
        try {
            let response: IUpdateOrganizationResponse | ICreateOrganizationResponse;

            if (this.props.isEdit) {
                response = await OrganizationsAPI.updateOrganization(
                    this.props.organizationToEdit
                        ? this.props.organizationToEdit.id
                        : dashboardStore.currentOrganization.id,
                    values.name,
                    values.description
                );
            } else {
                response = await OrganizationsAPI.createOrganization(values.name, values.description);
            }

            if (response.errors) {
                if (ErrorUtils.hasError("name", ERRORS.TAKEN, response.errors)) {
                    this.formRef.current?.setFields([
                        {
                            name: "name",
                            errors: [ErrorUtils.getErrorMessage("name", ERRORS.TAKEN)]
                        }
                    ]);
                } else {
                    ErrorUtils.showErrors(response.errors);
                }

                if (this.props.onError) {
                    this.props.onError();
                }

                return;
            }

            const imageBlob = await this.getImageBlob();
            const formData = await this.createFormData(imageBlob);
            if (this.state.imageUrl) {
                await OrganizationsAPI.uploadImage({
                    organizationId: response.data.id,
                    formData: formData
                });
            } else {
                await OrganizationsAPI.deleteImage({ organizationId: response.data.id });
            }

            dashboardStore.currentOrganization = response.data;
            this.props.onChanged(response.data, !this.props.isEdit);
        } catch (error) {
            console.error(error);
            if (this.props.onError) {
                this.props.onError();
            }
        }
    };

    createFormData = async (blob: any) => {
        const data = new FormData();
        const uid = uuid.v4();
        const filename = `${uid}.jpg`;
        data.append("image", blob, filename);

        return data;
    };

    getImageBlob = async () => {
        const canvas: HTMLCanvasElement = this.avatarEditor.getImageScaledToCanvas();
        if (canvas) {
            let blob;
            if (canvas.toBlob) {
                // Chrome goes here.
                blob = await new Promise((resolve, _reject) => {
                    canvas.toBlob(resolve as any);
                });
            } else {
                // Safari goes here.
                const url = canvas.toDataURL();
                blob = APIUtils.dataURItoBlob(url);
            }

            return blob;
        }
    };

    handleDrop = (dropped: any) => {
        if (dropped.length > 0) {
            this.setState({ imageUrl: dropped[0] });
        }
    };

    centerImage = () => {
        this.setState({ imagePosition: { x: 0.5, y: 0.5 } });
    };

    deleteImage = () => {
        this.setState({ imageUrl: "" });
    };

    render() {
        return (
            <Form
                id="newOrganizationForm"
                onFinish={this.handleSubmit}
                onFinishFailed={() => {
                    if (this.props.onValidationsFailed) {
                        this.props.onValidationsFailed();
                    }
                }}
                initialValues={{
                    name: this.props.isEdit
                        ? this.props.organizationToEdit
                            ? this.props.organizationToEdit.attributes.name
                            : dashboardStore.currentOrganization.attributes.name
                        : undefined
                }}
                style={{ maxWidth: "100%", ...this.props.styles }}
                ref={this.formRef}
            >
                <h3>Name *</h3>
                <Form.Item
                    name="name"
                    rules={[
                        { required: true, whitespace: true, message: "Please enter the name of the organization." }
                    ]}
                >
                    <Input placeholder="Name" autoFocus={!this.props.isEdit} />
                </Form.Item>

                <h3>Image</h3>
                <Form.Item>
                    <div style={{ display: "flex", marginTop: 4 }}>
                        <Dropzone onDrop={this.handleDrop} accept="image/*" ref={this.dropzone}>
                            {({ getRootProps, getInputProps }) => {
                                return (
                                    <AvatarWrapper
                                        {...getRootProps({
                                            onClick: (event) => {
                                                event.stopPropagation();
                                                this.isMovingImage = false;
                                            }
                                        })}
                                    >
                                        {!this.state.imageUrl && <AvatarNoImage />}
                                        <AvatarEditorWrapper>
                                            <AvatarEditor
                                                ref={(ref) => {
                                                    this.avatarEditor = ref;
                                                }}
                                                image={this.state.imageUrl}
                                                width={160}
                                                height={160}
                                                border={0}
                                                position={this.state.imagePosition}
                                                scale={this.state.imageScale / 100}
                                                onPositionChange={(position) => {
                                                    if (!isNaN(position.x) && !isNaN(position.y)) {
                                                        this.setState({ imagePosition: position });
                                                    }
                                                }}
                                                onMouseMove={() => {
                                                    this.isMovingImage = true;
                                                }}
                                                onMouseUp={(e) => {
                                                    if (e) {
                                                        e.preventDefault();
                                                    }

                                                    if (!this.isMovingImage && this.dropzone.current) {
                                                        this.dropzone.current.open();
                                                    }
                                                }}
                                            />
                                        </AvatarEditorWrapper>
                                        <input {...getInputProps()} />
                                    </AvatarWrapper>
                                );
                            }}
                        </Dropzone>
                        <div
                            style={{
                                marginLeft: 24,
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                                maxWidth: 240
                            }}
                        >
                            <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                <span style={{ fontWeight: "bold" }}>Resize</span>
                                <Slider
                                    value={this.state.imageScale}
                                    onChange={(value: number) => {
                                        this.setState({ imageScale: value });
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <Button
                                    onClick={this.centerImage}
                                    disabled={this.state.imagePosition.x === 0.5 && this.state.imagePosition.y === 0.5}
                                    style={{ marginBottom: 16 }}
                                >
                                    Center image
                                </Button>
                                <Button
                                    onClick={this.deleteImage}
                                    disabled={!this.state.imageUrl}
                                    danger
                                    style={{ marginBottom: 0 }}
                                >
                                    Delete image
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form.Item>
            </Form>
        );
    }
}

export { NewOrganizationForm, IProps };
