import './App.css';
import {useEffect, useState} from 'react';
import { Routes, Route } from "react-router-dom";
import { MsalProvider, useMsal } from '@azure/msal-react';
import { EventType } from '@azure/msal-browser';

import { PageLayout } from './components/PageLayout';
import { TodoList } from './pages/TodoList';
import { Home } from './pages/Home';
import { b2cPolicies, protectedResources } from './authConfig';
import { compareIssuingPolicy } from './utils/claimUtils';
import {TemppList} from "./components/Tempp";
import {NewTodoList} from "./pages/NewTodoList";




const Pages = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance,
     * an array of all accounts currently signed in and an inProgress value
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance } = useMsal();
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const callbackId = instance.addEventCallback((event) => {
            if ((event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) && event.payload.account) {
                /**
                 * For the purpose of setting an active account for UI update, we want to consider only the auth
                 * response resulting from SUSI flow. "tfp" claim in the id token tells us the policy (NOTE: legacy
                 * policies may use "acr" instead of "tfp"). To learn more about B2C tokens, visit:
                 * https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
                 */
                if (event.payload.idTokenClaims['tfp'] === b2cPolicies.names.editProfile) {
                    // retrieve the account from initial sing-in to the app
                    const originalSignInAccount = instance.getAllAccounts()
                        .find(account =>
                            account.idTokenClaims.oid === event.payload.idTokenClaims.oid
                            &&
                            account.idTokenClaims.sub === event.payload.idTokenClaims.sub
                            &&
                            account.idTokenClaims['tfp'] === b2cPolicies.names.signUpSignIn
                        );

                    let signUpSignInFlowRequest = {
                        authority: b2cPolicies.authorities.signUpSignIn.authority,
                        account: originalSignInAccount
                    };

                    // silently login again with the signUpSignIn policy
                    instance.ssoSilent(signUpSignInFlowRequest);
                }
            }

            if (event.eventType === EventType.SSO_SILENT_SUCCESS && event.payload.account) {
                setStatus("ssoSilent success");
            }
        });

        return () => {
            if (callbackId) {
                instance.removeEventCallback(callbackId);
            }
        }
        // eslint-disable-next-line
    }, []);

    //TODO change routes
    return (
        <Routes>
            <Route path="/todolist" element={<NewTodoList />} />
            <Route path="/" element={<Home status={status} />} />
        </Routes>
    );
};

/**
 * msal-react is built on the React context API and all parts of your app that require authentication must be
 * wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication
 * then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the
 * PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const App = ({ instance }) => {
    return (
        <MsalProvider instance={instance}>
            <PageLayout>
                <Pages />
            </PageLayout>
        </MsalProvider>
    );
};

export default App;
