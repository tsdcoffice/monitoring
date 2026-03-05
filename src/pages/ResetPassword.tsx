import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonInput,
  IonItem,
  IonButton,
  IonText,
  IonSpinner
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ResetPassword: React.FC = () => {
  const history = useHistory();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

const handleUpdatePassword = async () => {
  if (!password || !confirmPassword) {
    setError("Please fill all fields.");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  setError("");
  setMessage("");
  setLoading(true);

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  setLoading(false);

  if (error) {
    setError(error.message);
  } else {
    setMessage("Password updated successfully!");

    setTimeout(() => {
      history.push("/");
    }, 2000);
  }
};

  useEffect(() => {
  const checkSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      setError("Invalid or expired reset link.");
    }
  };

  checkSession();
}, []);

  return (
    <IonPage>
      <IonContent
        fullscreen
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0038A8"
        }}
      >
        <IonCard
          style={{
            width: "100%",
            maxWidth: "450px",
            padding: "30px",
            borderRadius: "20px"
          }}
        >
          <IonCardContent>

            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              Reset Password
            </h2>

            <IonItem style={{ marginBottom: "15px" }}>
              <IonInput
                type="password"
                placeholder="New Password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              />
            </IonItem>

            <IonItem style={{ marginBottom: "20px" }}>
              <IonInput
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onIonChange={(e) => setConfirmPassword(e.detail.value!)}
              />
            </IonItem>

            <IonButton
              expand="block"
              onClick={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? <IonSpinner /> : "Update Password"}
            </IonButton>

            {error && (
              <IonText color="danger">
                <p style={{ textAlign: "center", marginTop: "15px" }}>
                  {error}
                </p>
              </IonText>
            )}

            {message && (
              <IonText color="success">
                <p style={{ textAlign: "center", marginTop: "15px" }}>
                  {message}
                </p>
              </IonText>
            )}

          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ResetPassword;