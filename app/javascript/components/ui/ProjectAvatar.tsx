import { observer } from "mobx-react";
import * as React from "react";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { Styles } from "./Styles";

interface IProps {
    project: any;
    style?: React.CSSProperties;
}
interface IState {
    image: any;
    loading: boolean;
}

@observer
class ProjectAvatar extends React.Component<IProps, IState> {
    state: IState = {
        image: null,
        loading: true
    };

    async componentDidMount() {
        const imageResponse = await ProjectsAPI.getImage({ projectId: this.props.project.id });
        this.setState({ image: imageResponse.image, loading: false });
    }

    render() {
        const hasImage = !!this.state.image;

        return (
            <div
                className={this.state.loading ? undefined : "fade-in-fast"}
                style={{ display: "inline-block", opacity: this.state.loading ? 0 : 1 }}
            >
                {hasImage && (
                    <img
                        style={{
                            height: 40,
                            width: 40,
                            borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                            ...this.props.style
                        }}
                        src={this.state.image}
                        alt="project image"
                    />
                )}
                {!hasImage && (
                    <div
                        style={{
                            height: 40,
                            width: 40,
                            background: Styles.COLOR_PRIMARY_LIGHT,
                            color: Styles.COLOR_PRIMARY,
                            borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                            lineHeight: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textTransform: "uppercase",
                            fontSize: 14,
                            ...this.props.style
                        }}
                    >
                        {this.props.project &&
                            this.props.project.attributes &&
                            this.props.project.attributes.name.substr(0, 2)}
                    </div>
                )}
            </div>
        );
    }
}

export { ProjectAvatar };
