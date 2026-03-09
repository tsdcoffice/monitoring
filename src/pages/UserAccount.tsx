import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonAlert,
  IonHeader,
  IonBackButton,
  IonButtons,
  IonItem,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonInputPasswordToggle,
} from '@ionic/react';
import { supabase } from '../supabaseClient';
import { useHistory } from 'react-router-dom';

const UserAccount: React.FC = () => {
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        history.replace('/login');
        return;
      }

      const userEmail = data.session.user.email || '';

      setEmail(userEmail);

      const { data: user } = await supabase
        .from('users')
        .select('user_firstname, user_lastname, username')
        .eq('user_email', userEmail)
        .maybeSingle();

      if (user) {
        setFirstName(user.user_firstname || '');
        setLastName(user.user_lastname || '');
        setUsername(user.username || '');
      }
    };

    fetchUser();
  }, [history]);

  const handleUpdate = async () => {

    if (password && password !== confirmPassword) {
      setAlertMessage("Passwords don't match.");
      setShowAlert(true);
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      history.replace('/login');
      return;
    }

    const userEmail = data.session.user.email;

    if (!userEmail) return;

    // verify current password if user wants to change password
    if (password) {
      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (error) {
        setAlertMessage("Incorrect current password.");
        setShowAlert(true);
        return;
      }
    }

    // update profile info
    const { error: updateError } = await supabase
      .from('users')
      .update({
        user_firstname: firstName,
        user_lastname: lastName,
        username: username,
      })
      .eq('user_email', userEmail);

    if (updateError) {
      setAlertMessage(updateError.message);
      setShowAlert(true);
      return;
    }

    // update password if provided
    if (password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password,
      });

      if (passwordError) {
        setAlertMessage(passwordError.message);
        setShowAlert(true);
        return;
      }

      // logout and redirect
      setAlertMessage("Password updated. Please login again.");
      setShowAlert(true);

      setTimeout(async () => {
        await supabase.auth.signOut();
        history.replace('/login');
      }, 1200);

      return;
    }

    // only name updated
    setAlertMessage("Account updated successfully.");
    setShowAlert(true);
  };

  return (
    <IonPage>

      <IonHeader>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/dashboard" />
        </IonButtons>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonItem>
          <IonText color="secondary">
            <h1>Edit Account</h1>
          </IonText>
        </IonItem>

        <br />

        <IonGrid>

          <IonRow>
            <IonCol>
              <IonInput
                label="Username"
                labelPlacement="floating"
                fill="outline"
                value={username}
                onIonChange={(e) => setUsername(e.detail.value!)}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="6">
              <IonInput
                label="First Name"
                labelPlacement="floating"
                fill="outline"
                value={firstName}
                onIonChange={(e) => setFirstName(e.detail.value!)}
              />
            </IonCol>

            <IonCol size="6">
              <IonInput
                label="Last Name"
                labelPlacement="floating"
                fill="outline"
                value={lastName}
                onIonChange={(e) => setLastName(e.detail.value!)}
              />
            </IonCol>
          </IonRow>

        </IonGrid>

        <IonGrid>

          <IonRow>
            <IonText color="secondary">
              <h3>Change Password</h3>
            </IonText>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonInput
                label="New Password"
                type="password"
                labelPlacement="floating"
                fill="outline"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonInput
                label="Confirm Password"
                type="password"
                labelPlacement="floating"
                fill="outline"
                value={confirmPassword}
                onIonChange={(e) => setConfirmPassword(e.detail.value!)}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonCol>
          </IonRow>

        </IonGrid>

        <IonGrid>

          <IonRow>
            <IonText color="secondary">
              <h3>Confirm Changes</h3>
            </IonText>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonInput
                label="Current Password"
                type="password"
                labelPlacement="floating"
                fill="outline"
                value={currentPassword}
                onIonChange={(e) => setCurrentPassword(e.detail.value!)}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonCol>
          </IonRow>

        </IonGrid>

        <IonButton expand="full" shape="round" onClick={handleUpdate}>
          Update Account
        </IonButton>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          message={alertMessage}
          buttons={['OK']}
        />

      </IonContent>

    </IonPage>
  );
};

export default UserAccount;