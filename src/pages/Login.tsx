import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonIcon
} from "@ionic/react";
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { supabase } from "../supabaseClient";

// ✅ Make sure this path matches your logo location
import tesdaLogo from "../pics/tesda-logo.jfif";

const Login: React.FC = () => {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Invalid email or password.");
    } else {
      history.push("/dashboard");
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>

        {/* CENTER WRAPPER */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#0038A8"
          }}
        >
          <IonCard
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
              animation: "fadeIn 0.8s ease-in-out"
            }}
          >
            <IonCardContent>

              {/* LOGO */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <img
                  src={tesdaLogo}
                  alt="TESDA Logo"
                  style={{ width: "100px" }}
                />
              </div>

              {/* TITLE */}
              <h1
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#0038A8"
                }}
              >
                TSDC Monitoring System
              </h1>

              <p
                style={{
                  textAlign: "center",
                  marginBottom: "30px",
                  color: "gray"
                }}
              >
                Admin Login
              </p>

              {/* EMAIL FIELD */}
              <IonItem style={{ marginBottom: "20px" }}>
                {!email && (
                  <IonLabel position="floating"></IonLabel>
                )}
                <IonInput
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onIonChange={(e) => setEmail(e.detail.value!)}
                />
              </IonItem>

              {/* PASSWORD FIELD */}
              <IonItem style={{ marginBottom: "25px" }}>
                {!password && (
                  <IonLabel position="floating"></IonLabel>
                )}
                <IonInput
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter your password"
                  onIonChange={(e) => setPassword(e.detail.value!)}
                />
                <IonIcon
                  icon={showPassword ? eyeOffOutline : eyeOutline}
                  slot="end"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </IonItem>

              {/* LOGIN BUTTON */}
              <IonButton
                expand="block"
                onClick={handleLogin}
                disabled={loading}
                style={{
                  height: "45px",
                  fontWeight: "bold"
                }}
              >
                {loading ? <IonSpinner name="crescent" /> : "Login"}
              </IonButton>

              {/* ERROR MESSAGE */}
              {errorMessage && (
                <IonText color="danger">
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {errorMessage}
                  </p>
                </IonText>
              )}

            </IonCardContent>
          </IonCard>
        </div>

        {/* FADE-IN ANIMATION */}
        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>

      </IonContent>
    </IonPage>
  );
};

export default Login;