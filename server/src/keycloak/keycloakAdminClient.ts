
import type KeycloakAdminClient from '@keycloak/keycloak-admin-client';

/**
 *  Создание "Админского Клиента Keycloak" - специальный инструмент для управления пользователями 
 * и другими настройками в Keycloak из серверного кода
 */
let kcAdminClient: KeycloakAdminClient | null = null;

async function createKeycloakAdminClient(): Promise<KeycloakAdminClient> {
    if (kcAdminClient) {
        return kcAdminClient;
    }

    // Динамически импортируем саму библиотеку во время выполнения
    const { default: KcAdminClient } = await import('@keycloak/keycloak-admin-client');

    kcAdminClient = new KcAdminClient({
        baseUrl: 'http://localhost:8080',
        realmName: 'Messenger',
    });


    const clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || 'Grp0TH9H8Ppuw45Yqb0bBwiVvW46M77i';

    if (!clientSecret) {
        throw new Error('KEYCLOAK_ADMIN_CLIENT_SECRET не задан в переменных окружения');
    }

    await kcAdminClient.auth({
        grantType: 'client_credentials',
        clientId: 'admin-cli',
        clientSecret: clientSecret 
    });

    return kcAdminClient;
}

export { createKeycloakAdminClient };