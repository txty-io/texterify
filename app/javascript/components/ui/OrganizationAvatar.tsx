import { observer } from "mobx-react";
import * as React from "react";
import { OrganizationsAPI } from "../api/v1/OrganizationsAPI";
import { Styles } from "./Styles";
import styled from "styled-components";

interface IProps {
    organization: any;
    dontRenderIfNoImage?: boolean;
    style?: React.CSSProperties;
}
interface IState {
    image: any;
    loading: boolean;
}

const Avatar = styled.div`
    background: var(--avatar-background-color);
    color: var(--avatar-color);

    .dark-theme & {
        color: #fff;
    }
`;

@observer
class OrganizationAvatar extends React.Component<IProps, IState> {
    state: IState = {
        image: null,
        loading: true
    };

    async componentDidMount() {
        try {
            const imageResponse = await OrganizationsAPI.getImage({ organizationId: this.props.organization.id });
            this.setState({ image: imageResponse.image });
        } catch (error) {
            console.error(error);
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const hasImage = !!this.state.image;

        if (!hasImage && this.props.dontRenderIfNoImage) {
            return null;
        }

        return (
            <div style={{ display: "inline" }}>
                <div
                    style={{
                        display: "flex",
                        opacity: this.state.loading ? 0 : 1,
                        height: 40,
                        width: 40,
                        ...this.props.style
                    }}
                >
                    {hasImage && (
                        <img
                            style={{
                                height: "100%",
                                width: "100%",
                                borderRadius: Styles.DEFAULT_BORDER_RADIUS
                            }}
                            src={this.state.image}
                            alt="organization image"
                        />
                    )}
                    {!hasImage && (
                        <Avatar
                            style={{
                                height: "100%",
                                width: "100%",
                                borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                                lineHeight: 0,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                textTransform: "uppercase",
                                fontSize: 14
                            }}
                        >
                            {this.props.organization &&
                                this.props.organization.attributes &&
                                this.props.organization.attributes.name.substr(0, 2)}
                        </Avatar>
                    )}
                </div>
            </div>
        );
    }
}

export { OrganizationAvatar };
