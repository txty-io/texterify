import { Button, Comment } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import { authStore } from "../stores/AuthStore";
import { Styles } from "./Styles";
import { UserAvatar } from "./UserAvatar";

type IProps = {};
type IState = {};

class KeyChat extends React.Component<IProps, IState> {
    render() {
        return (
            <>
                <h3>Chat</h3>
                <p style={{ color: Styles.COLOR_TEXT_DISABLED, fontStyle: "italic" }}>No chat messages so far for this key.</p>
                <Comment
                    avatar={
                        <UserAvatar user={authStore.currentUser} />
                    }
                    author={authStore.currentUser && authStore.currentUser.username}
                    content={
                        <>
                            <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
                            <Button htmlType="submit" type="primary" style={{ marginTop: 8 }}>
                                Send message
                            </Button>
                        </>
                    }
                />
            </>
        );
    }
}

export { KeyChat };
