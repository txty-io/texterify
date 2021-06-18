import { Button, Form, Input, Slider } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import AvatarEditor from "react-avatar-editor";
import Dropzone from "react-dropzone";
import * as uuid from "uuid";
import { APIUtils } from "../api/v1/APIUtils";
import { ICreateProjectResponse, IProject, IUpdateProjectResponse, ProjectsAPI } from "../api/v1/ProjectsAPI";
import { AvatarEditorWrapper } from "../sites/dashboard/AvatarEditorWrapper";
import { AvatarNoImage } from "../sites/dashboard/AvatarNoImage";
import { AvatarWrapper } from "../sites/dashboard/AvatarWrapper";
import { dashboardStore } from "../stores/DashboardStore";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";

interface IProps {
    isEdit?: boolean;
    projectToEdit?: IProject;
    organizationId?: string;
    orientation?: "vertical" | "horizontal";
    onChanged?(project: IProject, isNew: boolean): void;
    onError?(): void;
    onValidationsFailed?(): void;
}
interface IState {
    imageUrl: string;
    imageScale: number;
    imagePosition: { x: number; y: number };
}

interface IFormValues {
    name: string;
    description: string;
}

class NewProjectForm extends React.Component<IProps, IState> {
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
            const imageResponse = await ProjectsAPI.getImage({
                projectId: this.props.projectToEdit ? this.props.projectToEdit.id : dashboardStore.currentProject.id
            });
            if (imageResponse.image) {
                this.setState({ imageUrl: imageResponse.image });
            }
        }
    }

    handleSubmit = async (values: IFormValues) => {
        try {
            let response: ICreateProjectResponse | IUpdateProjectResponse;

            if (this.props.isEdit) {
                response = await ProjectsAPI.updateProject({
                    projectId: this.props.projectToEdit
                        ? this.props.projectToEdit.id
                        : dashboardStore.currentProject.id,
                    name: values.name,
                    description: values.description
                });
            } else {
                response = await ProjectsAPI.createProject(values.name, values.description, this.props.organizationId);
            }

            if (response.error) {
                if (response.message === "MAXIMUM_NUMBER_OF_PROJECTS_REACHED") {
                    if (this.props.organizationId) {
                        ErrorUtils.showError(
                            "You have reached the maximum number of projects for the free plan. Please upgrade to a paid plan create more projects."
                        );
                    } else {
                        ErrorUtils.showError(
                            "You have reached the maximum number of private projects. You can create more projects as part of an organization."
                        );
                    }
                }

                if (this.props.onError) {
                    this.props.onError();
                }

                return;
            } else if (response.errors) {
                if (ErrorUtils.hasError("name", ERRORS.BLANK, response.errors)) {
                    this.formRef.current.setFields([
                        {
                            name: "name",
                            errors: [ErrorUtils.getErrorMessage("name", ERRORS.BLANK)]
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
                await ProjectsAPI.uploadImage({ projectId: response.data.id, formData: formData });
            } else {
                await ProjectsAPI.deleteImage({ projectId: response.data.id });
            }

            dashboardStore.currentProject = response.data;
            dashboardStore.currentProjectIncluded = response.included;
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
                id="newProjectForm"
                onFinish={this.handleSubmit}
                onFinishFailed={() => {
                    if (this.props.onValidationsFailed) {
                        this.props.onValidationsFailed();
                    }
                }}
                initialValues={{
                    name: this.props.isEdit
                        ? this.props.projectToEdit
                            ? this.props.projectToEdit.attributes.name
                            : dashboardStore.currentProject.attributes.name
                        : undefined,
                    description: this.props.isEdit
                        ? this.props.projectToEdit
                            ? this.props.projectToEdit.attributes.description
                            : dashboardStore.currentProject.attributes.description
                        : undefined
                }}
                style={{
                    maxWidth: "100%",
                    display: "flex",
                    flexDirection: this.props.orientation === "vertical" ? "column" : "row"
                }}
                ref={this.formRef}
            >
                <div style={{ flexGrow: 2, marginRight: this.props.orientation === "vertical" ? 0 : 40 }}>
                    <h3>Name *</h3>
                    <Form.Item
                        name="name"
                        rules={[{ required: true, whitespace: true, message: "Please enter the name of the project." }]}
                    >
                        <Input placeholder="Name" autoFocus={!this.props.isEdit} />
                    </Form.Item>

                    <h3>Description</h3>
                    <Form.Item name="description">
                        <Input.TextArea autoSize={{ minRows: 4, maxRows: 8 }} placeholder="Description" />
                    </Form.Item>
                </div>

                <div style={{ flexGrow: 1 }}>
                    <h3>Image</h3>
                    <Form.Item>
                        <div style={{ display: "flex" }}>
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
                            <div style={{ marginLeft: 24, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                    <span style={{ fontWeight: "bold" }}>Resize</span>
                                    <Slider
                                        value={this.state.imageScale}
                                        onChange={(value: number) => {
                                            this.setState({ imageScale: value });
                                        }}
                                    />
                                </div>
                                <Button
                                    onClick={this.centerImage}
                                    disabled={this.state.imagePosition.x === 0.5 && this.state.imagePosition.y === 0.5}
                                    style={{ width: "100%", marginBottom: 16 }}
                                >
                                    Center image
                                </Button>
                                <Button
                                    onClick={this.deleteImage}
                                    disabled={!this.state.imageUrl}
                                    danger
                                    style={{ marginBottom: 0, width: "100%" }}
                                >
                                    Delete image
                                </Button>
                            </div>
                        </div>
                    </Form.Item>
                </div>
            </Form>
        );
    }
}

export { NewProjectForm, IProps };
