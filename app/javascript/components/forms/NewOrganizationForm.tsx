import { Button, Input, Slider, Form } from "antd";
import * as React from "react";
import AvatarEditor from "react-avatar-editor";
import Dropzone from "react-dropzone";
import * as uuid from "uuid";
import { OrganizationsAPI } from "../api/v1/OrganizationsAPI";
import { dashboardStore } from "../stores/DashboardStore";
import { Styles } from "../ui/Styles";
import { FormInstance } from "antd/lib/form";
import { ErrorUtils, ERRORS } from "../ui/ErrorUtils";

interface IProps {
    isEdit?: boolean;
    onError(errors: any): void;
    onCreated?(organizationId: string): void;
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
                organizationId: dashboardStore.currentOrganization.id
            });
            if (imageResponse.image) {
                this.setState({ imageUrl: imageResponse.image });
            }
        }
    }

    handleSubmit = async (values: any) => {
        let response;

        if (this.props.isEdit) {
            response = await OrganizationsAPI.updateOrganization(
                dashboardStore.currentOrganization.id,
                values.name,
                values.description
            );
        } else {
            response = await OrganizationsAPI.createOrganization(values.name, values.description);
        }

        if (response.errors) {
            if (ErrorUtils.hasError("name", ERRORS.TAKEN, response.errors)) {
                this.formRef.current.setFields([
                    {
                        name: "name",
                        errors: [ErrorUtils.getErrorMessage("name", ERRORS.TAKEN)]
                    }
                ]);
            } else {
                ErrorUtils.showErrors(response.errors);
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
        this.props.onCreated(response.data.id);
    };

    /**
     * Converts a data URI to a blob.
     * See https://github.com/graingert/datauritoblob/blob/master/dataURItoBlob.js.
     */
    dataURItoBlob(dataURI: any) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        const byteString = atob(dataURI.split(",")[1]);
        // separate out the mime component
        const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        // write the bytes of the string to an ArrayBuffer
        const ab = new ArrayBuffer(byteString.length);
        const dw = new DataView(ab);
        for (let i = 0; i < byteString.length; i++) {
            dw.setUint8(i, byteString.charCodeAt(i));
        }
        // write the ArrayBuffer to a blob, and you're done

        return new Blob([ab], { type: mimeString });
    }

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
                blob = this.dataURItoBlob(url);
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
                initialValues={{
                    name: this.props.isEdit ? dashboardStore.currentOrganization.attributes.name : undefined
                }}
                style={{ maxWidth: "100%" }}
                ref={this.formRef}
            >
                <h3>Organization image</h3>
                <Form.Item>
                    <div style={{ display: "flex", marginTop: 4 }}>
                        <Dropzone onDrop={this.handleDrop} accept="image/*" ref={this.dropzone}>
                            {({ getRootProps, getInputProps }) => {
                                return (
                                    <div
                                        {...getRootProps({
                                            onClick: (event) => {
                                                event.stopPropagation();
                                                this.isMovingImage = false;
                                            }
                                        })}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                                            border: "1px solid #d9d9d9"
                                        }}
                                    >
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
                                        <input {...getInputProps()} />
                                    </div>
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
                                style={{ width: "100%" }}
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

                <h3>Name *</h3>
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: "Please enter the name of the organization." }]}
                >
                    <Input placeholder="Name" autoFocus={!this.props.isEdit} />
                </Form.Item>
            </Form>
        );
    }
}

export { NewOrganizationForm, IProps };
