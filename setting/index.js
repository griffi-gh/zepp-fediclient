//import { gettext as i18n } from 'i18n'
import { INSTANCE_DOMAIN, CLIENT_META } from "../configuration";

const DEFAULT_SETTINGS = {
  instance: INSTANCE_DOMAIN,
}

const COLOR_ACCENT = "#8e44ad";

const STYLE_BUTTON_BASE = {
  color: "#fff",
  borderRadius: "999px",
  padding: "10px",
  display: "flex",
  width: "100%",
  textAlign: "center",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "stretch",
}

const STYLE_BUTTON = {
  ...STYLE_BUTTON_BASE,
  backgroundColor: COLOR_ACCENT,
}

const STYLE_BUTTON_DISABLED = {
  ...STYLE_BUTTON_BASE,
  pointerEvents: "none",
  cursor: "not-allowed",
  opacity: 0.5,
  backgroundColor: "#ccc",
}

const STYLE_BUTTON_DANGER = {
  ...STYLE_BUTTON,
  backgroundColor: "#e74c3c",
}

AppSettingsPage({
  // state: {
  //   props: {},
  // },
  build(props) {
    console.log("app settings page build invoke");

    for (let key in DEFAULT_SETTINGS) {
      if (!props.settingsStorage.getItem(key)) {
        props.settingsStorage.setItem(key, DEFAULT_SETTINGS[key]);
      }
    }

    const instance = props.settingsStorage.getItem("instance");
    let oauthApp = props.settingsStorage.getItem("oauth_app");
    if (oauthApp) {
      console.log("oauthApp", oauthApp);
      oauthApp = JSON.parse(oauthApp);
    }
    const isAppIdRequested = props.settingsStorage.getItem("_reqest_appid");
    const access_token = props.settingsStorage.getItem("access_token");
    if (access_token) {
      console.log("access_token", access_token);
    }

    // console.log("oauthAppId", oauthAppId);
    // console.log("oauthAppSecret", oauthAppSecret);

    return View(
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '25px',
          backgroundColor: '#111',
          color: '#fff',
          width: '100vw',
          height: '100vh',
          padding: '10px',
        }
      },
      [
        TextInput({
          label: 'Instance:',
          settingsKey: "instance",
          maxLength: 200,
          subStyle: {
            color: '#fff',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '5px',
          }
        }),
        View({
          display: 'flex',
          flexDirection: 'column',
        }, [
          (oauthApp && !access_token) ? View({
            style: STYLE_BUTTON,
          }, [
            Auth({
              label: "Authenticate",
              authorizeUrl: `https://${instance}/oauth/authorize`,
              requestTokenUrl: `https://${instance}/oauth/token`,
              clientId: oauthApp.client_id,
              clientSecret: oauthApp.client_secret,
              scope: CLIENT_META.scopes,
              onAccessToken: (data) => {
                const str_data = JSON.stringify(data);
                console.log("onAccessToken ", str_data);
                props.settingsStorage.setItem("access_token", str_data);
              }
            })
          ]) : (
            Button({
              label: access_token ? "Log out" : "Start auth flow",
              style: access_token ? STYLE_BUTTON_DANGER : STYLE_BUTTON,
              onClick: () => {
                props.settingsStorage.setItem(access_token ? "_request_revoke" : "_reqest_appid", "1");
              },
            })
          ),
          Text({
            paragraph: true,
            style: {
              color: access_token ? '#0f0' : '#ccc',
              textAlign: 'center',
            },
          }, [
            access_token ? (
              "Authenticated"
            ) : (
              oauthApp ? (
                "Ready to authenticate"
              ) : (
                isAppIdRequested ?
                "Auth flow: Requesting application ID... If stuck, press the button again." :
                "Click the 'Authenticate' button above to get started"
              )
            ),
          ]),
        ]),

        Button({
          label: "Reset all",
          style: STYLE_BUTTON_DANGER,
          onClick: () => {
            props.settingsStorage.clear();
          },
        })

        // Text({
        //   paragraph: true,
        //   style: {
        //     color: 'red',
        //   }
        // }, [
        //   "WARNING: After changing the instance, " +
        //   "re-open the settings page before clicking " +
        //   "on the 'Authenticate' button."
        // ]),
      ],
    );
  }
})
