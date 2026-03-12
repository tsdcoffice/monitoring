import {
  IonPage,
  IonContent,
  IonItem,
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
import { supabase } from "../supabaseClient";
import { useEffect } from "react";

import tesdaLogo from "../pics/tesda-logo.jfif";
import bgImage from "../pics/tsdc.jpg";

const ResetPassword: React.FC = () => {

  const [password, setPassword] = useState("");
 useEffect(() => {
  const hash = window.location.hash;

  // Remove "#/" or "#"
  const cleanHash = hash.replace("#/", "").replace("#", "");

  if (cleanHash.includes("access_token")) {

    const params = new URLSearchParams(cleanHash);

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token
      });
    }
  }
}, []);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {

    if (!password || !confirmPassword) {
      setMessage("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {

       // CLEAR TOKEN FROM URL
      window.history.replaceState({}, document.title, "/monitoring/reset-password");
      setMessage("Password updated successfully. Redirecting to login...");

      //para ni sa sign out recovery session
      await supabase.auth.signOut();

      setTimeout(() => {
        window.location.href = "/monitoring/login";
      }, 2000);
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
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}
          >
            <IonCardContent>

              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <img
                  src={tesdaLogo}
                  alt="TESDA Logo"
                  style={{ width: "90px" }}
                />
              </div>

              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "25px",
                  color: "#0038A8",
                  fontWeight: "bold"
                }}
              >
                Reset Password
              </h2>

              {/* New Password */}
              <IonItem style={{ marginBottom: "15px" }}>
                <IonInput
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onIonInput={(e:any)=>setPassword(e.detail.value!)}
                />
                <IonIcon
                  icon={showPassword ? eyeOffOutline : eyeOutline}
                  slot="end"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </IonItem>

              {/* Confirm Password */}
              <IonItem style={{ marginBottom: "20px" }}>
                <IonInput
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onIonInput={(e:any)=>setConfirmPassword(e.detail.value!)}
                />
                <IonIcon
                  icon={showConfirm ? eyeOffOutline : eyeOutline}
                  slot="end"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowConfirm(!showConfirm)}
                />
              </IonItem>

              <IonButton
                expand="block"
                onClick={handleReset}
                disabled={loading}
                style={{
                  height: "50px",
                  fontWeight: "700",
                  "--background": "#10377a",
                  "--border-radius": "12px"
                }}
              >
                {loading ? <IonSpinner name="crescent" /> : "Reset Password"}
              </IonButton>

              {message && (
                <IonText>
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {message}
                  </p>
                </IonText>
              )}

            </IonCardContent>
          </IonCard>

        </div>

      </IonContent>
    </IonPage>
  );
};

export default ResetPassword;