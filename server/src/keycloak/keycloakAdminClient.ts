// Импортируем только тип, это безопасно и не влияет на исполнение
import type KeycloakAdminClient from '@keycloak/keycloak-admin-client';

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

    // Убедитесь, что это значение совпадает с секретом из вкладки "Credentials" в Keycloak
    const clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || 'Grp0TH9H8Ppuw45Yqb0bBwiVvW46M77i';

    if (!clientSecret) {
        throw new Error('KEYCLOAK_ADMIN_CLIENT_SECRET is not set in environment variables');
    }

    await kcAdminClient.auth({
        grantType: 'client_credentials',
        clientId: 'admin-cli',
        clientSecret: clientSecret // <-- ИСПРАВЛЕНО: Используем переменную, а не жестко заданное значение
    });

    return kcAdminClient;
}

export { createKeycloakAdminClient };