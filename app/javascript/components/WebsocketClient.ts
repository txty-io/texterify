import { createConsumer } from "@rails/actioncable";
import { authStore } from "./stores/AuthStore";

function getWebSocketURL() {
    const client = authStore.client;
    const accessToken = authStore.accessToken;
    const uid = authStore.currentUser && authStore.currentUser.email;
    return `http://localhost:3000/cable?client=${client}&access-token=${accessToken}&uid=${uid}`;
}

const consumer = createConsumer(getWebSocketURL);

export { consumer };
