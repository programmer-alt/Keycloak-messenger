// client/src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";

import keycloak from "../keycloakClient/keycloakInitClient";
import Keycloak from "keycloak-js";

export interface AuthContextType {
  authenticated: boolean;
  user: string | undefined;
  loading: boolean;
  keycloakInstance: typeof Keycloak | null;
}

// 2. Создаем сам контекст, который будет нести эти данные.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Создаем компонент-поставщик (Provider).
// Он будет единственным местом, где происходит инициализация.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Флаг для защиты от двойного вызова в React.StrictMode
  const isInitialized = useRef(false);

  useEffect(() => {
    // Если уже инициализировали, выходим.
    if (isInitialized.current) {
      return;
    }
    // Помечаем, что процесс пошел.
    isInitialized.current = true;

    // Запускаем инициализацию Keycloak ОДИН РАЗ при старте приложения.
    keycloak
      .init({
        onLoad: "login-required",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        checkLoginIframe: false,
      })
      .then((auth: boolean) => {
        setAuthenticated(auth);
        if (auth) {
          setUser(keycloak.tokenParsed?.preferred_username);
        }
      })
      .catch((err: unknown) => {
        console.error(
          "Ошибка инициализации Keycloak в AuthProvider:",
          JSON.stringify(err, null, 2)
        );
        console.error("Детали ошибки:", err);
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const authContextValue: AuthContextType = {
    loading,
    user,
    authenticated,
    keycloakInstance: keycloak,
  };

  // Пока идет проверка в Keycloak, показываем глобальное сообщение о загрузке.
  if (loading) {
    return <div>Проверка авторизации...</div>;
  }
  // Если пользователь не авторизован, показываем кнопку входа
  if (!loading && !authenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Необходима авторизация</h2>
        <button 
          onClick={() => keycloak.login()}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Войти через Keycloak
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 

// 4. Создаем кастомный хук для удобного доступа к данным.
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
};
