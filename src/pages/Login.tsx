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
  IonIcon,
  useIonViewWillEnter
} from "@ionic/react";
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { supabase } from "../supabaseClient";

import tesdaLogo from "../pics/tesda-logo.jfif";
import bgImage from "../pics/tsdc.jpg"; 

const Login: React.FC = () => {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<HTMLIonInputElement>(null);

   // Clear inputs when login page loads
    useEffect(() => {
      setEmail("");
      setPassword("");
    }, []);

  // Clear inputs every time Login page opens (important for Ionic)
    useIonViewWillEnter(() => {
      setEmail("");
      setPassword("");
    });

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
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

const handleForgotPassword = async () => {
  if (!email) {
    setErrorMessage("Please enter your email first.");
    return;
  }

  setErrorMessage("");
  setSuccessMessage("");
  setLoading(true);

  const redirectTo =
    window.location.hostname === "localhost"
      ? "http://localhost:8100/monitoring/reset-password"
      : "https://tsdcoffice.github.io/monitoring/#/reset-password";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  setLoading(false);

  if (error) {
    setErrorMessage(error.message);
  } else {
    setSuccessMessage("Password reset email sent. Check your inbox.");
  }
};

  return (
    <IonPage>
      <IonContent fullscreen>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            
            backgroundImage: `linear-gradient(rgba(0, 20, 60, 0.89), rgba(2, 44, 129, 0.97)), url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
            }}
          >
        <IonCard
          style={{
            width: "90%", 
            maxWidth: "450px", 
            padding: "30px",
            borderRadius: "15px",
            backgroundColor: "#ffffff",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)", // Mas lawom nga shadow
            animation: "fadeIn 0.8s ease-in-out"
            }}
          >
            <IonCardContent>

              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <img
                  src={tesdaLogo}
                  alt="TESDA Logo"
                  style={{ width: "100px" }}
                />
              </div>

              <h1
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#0038A8"
                }}
              >
                TSDC MONITORING SYSTEM
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
                {!email && <IonLabel position="floating"></IonLabel>}
                <IonInput
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onIonInput={(e:any)=> setEmail(e.detail.value!)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      passwordRef.current?.setFocus();
                    }
                  }}
                />
              </IonItem>

              {/* PASSWORD FIELD */}
              <IonItem style={{ marginBottom: "10px" }}>
                {!password && <IonLabel position="floating"></IonLabel>}
                <IonInput
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter your password"
                  onIonInput={(e:any)=> setPassword(e.detail.value!)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                />
                <IonIcon
                  icon={showPassword ? eyeOffOutline : eyeOutline}
                  slot="end"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </IonItem>

              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <IonText
                  color="primary"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </IonText>
              </div>

              <IonButton
                expand="block"
                onClick={handleLogin}
                disabled={loading}
                style={{
                  height: "50px",
                  marginTop: "20px",
                  fontWeight: "700",
                  "--background": "#10377a", // ✅ TESDA Deep Blue
                  "--border-radius": "12px",
   
                }}
              >
                {loading ? <IonSpinner name="crescent" /> : "Login"}
              </IonButton>

              {errorMessage && (
                <IonText color="danger">
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {errorMessage}
                  </p>
                </IonText>
              )}

              {successMessage && (
                <IonText color="success">
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {successMessage}
                  </p>
                </IonText>
              )}

            </IonCardContent>
          </IonCard>
        </div>

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