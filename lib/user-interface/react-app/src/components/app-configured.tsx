import { useEffect, useState } from "react";
import {  
  ThemeProvider,
  defaultDarkModeOverride,
} from "@aws-amplify/ui-react";
import App from "../app";
import { Amplify, Auth} from "aws-amplify";
import { AppConfig } from "../common/types";
import { AppContext } from "../common/app-context";
import { Alert, StatusIndicator } from "@cloudscape-design/components";
import { StorageHelper } from "../common/helpers/storage-helper";
import { Mode } from "@cloudscape-design/global-styles";
import "@aws-amplify/ui-react/styles.css";

export default function AppConfigured() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  // const [error, setError] = useState<boolean | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(null);
  const [theme, setTheme] = useState(StorageHelper.getTheme());
  const [configured, setConfigured] = useState<boolean>(false);  

  // this is the authentication provider that Cognito needs
  const federatedIdName : string = "AzureAD-OIDC-Prod-GENIE";

  // trigger authentication state when needed
  useEffect(() => {
    (async () => {
      try {     
        const result = await fetch("/aws-exports.json");
        const awsExports = await result.json();
        // start removing here
        delete awsExports['aws_cognito_identity_pool_id']
        delete awsExports['aws_user_pools_id']
        delete awsExports['aws_user_pools_web_client_id']
        awsExports["Auth"] = {
    "region": "us-east-1",
    "userPoolId": "us-east-1_LX9ZnsM6h",
    "userPoolWebClientId": "3nr3r1qtocclc95jrhuq4qe22r",
    "oauth": {
      "domain": "prod-genie.auth.us-east-1.amazoncognito.com",
      "scope": ["email", "openid", "profile"],
      "redirectSignIn": "https://d34zoiv84m8ivb.cloudfront.net/",
      "redirectSignOut": "https://login.microsoftonline.com/3e861d16-48b7-4a0e-9806-8c04d81b7b2a/oauth2/v2.0/authorize?client_id=e8832ead-7ca3-48d0-8b40-8d29c6c4e03d&redirect_uri=https%3A%2F%2Fprod-genie.auth.us-east-1.amazoncognito.com%2Foauth2%2Fidpresponse&scope=openid&response_type=code&state=H4sIAAAAAAAAAD2RS7OiMBSE_0vWRnkEFHcIInBFnXu9Kk5NWSEJLzFBHuowNf994mZ2faq_rnPq9B-AwRz0LWS47aB6WZ-sM28jMwcjkEjHHvqG2S7cBq4Dd42gcLXcBEvpEunqvNEb9d4JQipiGWWT93d0Z5rWSIBKIO-6up1PJlRHgygeM3SbFY9kTCrR07QRvBtz1k0kzCRMBGVSplK-10mZgflPwG64qOQgasYLKkXdiLSoGPg1ArlkcRC30dCH9ZJq3C3Mvvfdmp_Xzo_doa1XhUwUEjte3Y1mul6po9asrkG4Vvhlg56xiiO0d5XVgehW5jzdIJaJUia-NMOU8vreEcbN9JE7axKqa3_h9xt6iLA_qIZT1vdLVmn9MfwwNlocasy-RC-HLhbl0fP86Dt46iy6fF9OUTnYZ8XSLdHuHXTco-0dn5fKK7h_fnwup2Ya8OyQruKYZl67OPovD6Hh9HKusb-hiciigb121-QMd1_wYe-R8Gjv8S086X7u4t9PeLXbx7uaSl5cv7vK5MfYGPddPv5f8Rjf8CA4ERkvOjEm4iYTNzBXp7qumtp0qsgPg3mKq5aNQPNu2SIznTACMSUGRBZG0NIUClFCiKGqKNGwCf7-A_PI9FlKAgAA.H4sIAAAAAAAAAFvM-yj_49fQvfPkXn3qY_vYZC4V7nb5hKthX-wH4Va_sMUAKe-INSAAAAA.4&sso_reload=true",
      "responseType": "code"
    }};
    // end removing here
        Amplify.configure(awsExports);   
        setConfigured(true);
        // const currentUser = 
        await Auth.currentAuthenticatedUser();
        // console.log("Authenticated user:", currentUser);
        setAuthenticated(true);
        // console.log(authenticated);
        setConfig(awsExports);
      } catch (e) {
        console.error("Authentication check error:", e);
        setAuthenticated(false);
      }
    })();
  }, []);
  
  
  // whenever the authentication state changes, if it's changed to un-authenticated, re-verify
  useEffect(() => {  
    if (!authenticated && configured) {
      console.log("No authenticated user, initiating sign-in.");
      Auth.federatedSignIn({ customProvider: federatedIdName });
    }
  }, [authenticated]);

  // dark/light theme
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const newValue =
            document.documentElement.style.getPropertyValue(
              "--app-color-scheme"
            );

          const mode = newValue === "dark" ? Mode.Dark : Mode.Light;
          if (mode !== theme) {
            setTheme(mode);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      observer.disconnect();
    };
  }, [theme]);

  // display a loading screen while waiting for the config file to load
  if (!config) {
    // if (error) {
    //   return (
    //     <div
    //       style={{
    //         height: "100%",
    //         width: "100%",
    //         display: "flex",
    //         justifyContent: "center",
    //         alignItems: "center",
    //       }}
    //     >
    //       <Alert header="Configuration error" type="error">
    //         Error loading configuration from "
    //         <a href="/aws-exports.json" style={{ fontWeight: "600" }}>
    //           /aws-exports.json
    //         </a>
    //         "
    //       </Alert>
    //     </div>
    //   );
    // }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusIndicator type="loading">Loading</StatusIndicator>        
      </div>
    );
  }

  // the main app - only display it when authenticated
  return (
    <AppContext.Provider value={config}>
      <ThemeProvider
        theme={{
          name: "default-theme",
          overrides: [defaultDarkModeOverride],
        }}
        colorMode={theme === Mode.Dark ? "dark" : "light"}
      >        
        {authenticated ? (
          <App/>
        ) : (          
          // <TextContent>Are we authenticated: {authenticated}</TextContent>
          <></>
        )}
      </ThemeProvider>
    </AppContext.Provider>
  );
}
