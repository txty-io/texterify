import { Alert, Button, Form, FormInstance, Input, Slider } from "antd";
import * as React from "react";
import AvatarEditor from "react-avatar-editor";
import Dropzone from "react-dropzone";
import * as uuid from "uuid";
import { APIUtils } from "../api/v1/APIUtils";
import { UsersAPI } from "../api/v1/UsersAPI";
import { AvatarEditorWrapper } from "../sites/dashboard/AvatarEditorWrapper";
import { AvatarNoImage } from "../sites/dashboard/AvatarNoImage";
import { AvatarWrapper } from "../sites/dashboard/AvatarWrapper";
import { authStore } from "../stores/AuthStore";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";

interface IProps {
    onError?(): void;
    onCreated?(): void;
}
interface IState {
    imageUrl: string;
    imageScale: number;
    imagePosition: { x: number; y: number };
}

class EditUserForm extends React.Component<IProps, IState> {
    state: IState = {
        imageUrl: "",
        imageScale: 100,
        imagePosition: { x: 0.5, y: 0.5 }
    };

    isMovingImage = false;
    dropzone: any = React.createRef();
    avatarEditor: any = React.createRef();
    formRef = React.createRef<FormInstance>();

    async componentDidMount() {
        const imageResponse = await UsersAPI.getImage(authStore.currentUser.id);
        if (imageResponse.image) {
            this.setState({ imageUrl: imageResponse.image });
        }
    }

    handleSubmit = async (values: { username: string; email: string }) => {
        const imageBlob = await this.getImageBlob();
        const formData = await this.createFormData(imageBlob);
        if (this.state.imageUrl) {
            await UsersAPI.uploadImage(formData);
        } else {
            await UsersAPI.deleteImage();
            authStore.userImageUrl = null;
        }

        try {
            const response = await UsersAPI.updateUser({ username: values.username, email: values.email });

            if (response.errors) {
                if (response.errors.username?.includes("has already been taken")) {
                    this.formRef.current?.setFields([
                        {
                            name: "username",
                            errors: [ErrorUtils.getErrorMessage("username", ERRORS.TAKEN)]
                        }
                    ]);
                } else {
                    ErrorUtils.showErrors(response.errors);
                }

                this.props.onError();
            } else {
                // Set new user data.
                authStore.currentUser = response.data;

                if (this.props.onCreated) {
                    this.props.onCreated();
                }

                await authStore.refetchCurrentUserImage();
            }
        } catch (error) {
            console.error(error);

            this.props.onError();
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

    createFormData = async (blob: any) => {
        const data = new FormData();
        const uid = uuid.v4();
        const filename = `${uid}.jpg`;
        data.append("image", blob, filename);

        return data;
    };

    render() {
        return (
            <Form
                ref={this.formRef}
                id="editUserForm"
                onFinish={this.handleSubmit}
                initialValues={{
                    username: authStore.currentUser.username,
                    email: authStore.currentUser.email
                }}
                style={{ maxWidth: "100%" }}
            >
                <h3>Profile image</h3>
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

                <h3 style={{ marginTop: 24 }}>Username *</h3>
                <p>This name will be visible to others.</p>
                <Form.Item
                    name="username"
                    rules={[{ required: true, whitespace: true, message: "Please enter your username." }]}
                >
                    <Input placeholder="Username" />
                </Form.Item>

                <h3>Email address *</h3>
                <p>Your email address that you also use to log in.</p>
                <Form.Item
                    name="email"
                    rules={[{ required: true, whitespace: true, message: "Please enter your email address." }]}
                >
                    <Input placeholder="Email address" />
                </Form.Item>
            </Form>
        );
    }
}

export { EditUserForm };
