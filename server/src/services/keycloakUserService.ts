import { createKeycloakAdminClient } from '../keycloak/keycloakAdminClient';

/**
 *  Получает всех пользователей из Keycloak
 * @returns список всех пользователей из Keycloak
 */
export async function getAllUsers() {
    const kcAdminClient = await createKeycloakAdminClient();
    const users = await kcAdminClient.users.find();
    return users.map((user: any) => ({
        id: user.id,
        username: user.username,
    }));
}
