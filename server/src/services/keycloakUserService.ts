import { createKeycloakAdminClient } from '../keycloak/keycloakAdminClient';

export async function getAllUsers() {
    const kcAdminClient = await createKeycloakAdminClient();
    const users = await kcAdminClient.users.find();
    return users.map((user: any) => ({
        id: user.id,
        username: user.username,
    }));
}
