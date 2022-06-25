import { observer } from "mobx-react";
import * as React from "react";
import { UsersAPI } from "../api/v1/UsersAPI";
import { authStore } from "../stores/AuthStore";
import { Styles } from "./Styles";
import Avatar from "boring-avatars";

// const UserAvatarWrapper = styled.div`
//     height: 40px;
//     width: 40px;
//     background: ${Styles.COLOR_PRIMARY_LIGHT};
//     color: #000;

//     .dark-theme & {
//         color: #fff;
//     }

//     border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
//     line-height: 0;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     text-transform: uppercase;
//     font-size: 14px;
// `;

interface IProps {
    user: any;
    forceDark?: boolean;
    style?: React.CSSProperties;
}
interface IState {
    image: any;
}

@observer
class UserAvatar extends React.Component<IProps, IState> {
    state: IState = {
        image: null
    };

    isCurrentUser = () => {
        return authStore.currentUser && authStore.currentUser.id === this.props.user.id;
    };

    async componentDidMount() {
        if (!this.isCurrentUser() || !authStore.userImageUrl) {
            const imageResponse = await UsersAPI.getImage(this.props.user.id);
            this.setState({ image: imageResponse.image });

            if (this.isCurrentUser()) {
                authStore.userImageUrl = imageResponse.image;
            }
        }
    }

    render() {
        const hasImage = !!(this.state.image || (this.isCurrentUser() && authStore.userImageUrl));

        return (
            <div style={{ display: "inline-block" }}>
                {hasImage && (
                    <img
                        style={{
                            height: 40,
                            width: 40,
                            borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                            ...this.props.style
                        }}
                        src={this.isCurrentUser() ? authStore.userImageUrl : this.state.image}
                        alt="user image"
                    />
                )}
                {!hasImage && (
                    <div style={{ position: "relative", borderRadius: 4, overflow: "hidden" }}>
                        <Avatar
                            size={32}
                            name={this.props.user && this.props.user.username}
                            colors={["#FF08F5", "#A05AED", "#2944BE", "#E32572", "#405059"]}
                            variant="marble"
                            square
                        />
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                textTransform: "uppercase",
                                lineHeight: 0,
                                fontSize: 12,
                                fontWeight: "bold",
                                color: "#fff"
                            }}
                        >
                            {this.props.user && this.props.user.username && this.props.user.username.substr(0, 2)}
                        </div>
                    </div>

                    // <UserAvatarWrapper
                    //     style={{
                    //         ...this.props.style
                    //     }}
                    // >

                    //     {this.props.user && this.props.user.username && this.props.user.username.substr(0, 2)}
                    // </UserAvatarWrapper>
                )}
            </div>
        );
    }
}

export { UserAvatar };
