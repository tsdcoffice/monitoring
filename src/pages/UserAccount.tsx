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
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.session) {
        setAlertMessage('You must be logged in to access this page.');
        setShowAlert(true);
        history.push('/login');
        return;
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_firstname, user_lastname, user_email, username')
        .eq('user_email', session.session.user.email)
        .maybeSingle();

      if (userError) {
        setAlertMessage(userError.message);
        setShowAlert(true);
        return;
      }

      if (!user) {
        // create user record automatically if missing
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            user_email: session.session.user.email,
            user_firstname: '',
            user_lastname: '',
            username: ''
          },
          { onConflict: 'user_email' }
        );

        if (insertError) {
          setAlertMessage(insertError.message);
          setShowAlert(true);
          return;
        }

        setEmail(session.session.user.email || '');
        return;
      }

      setFirstName(user.user_firstname || '');
      setLastName(user.user_lastname || '');
      setEmail(user.user_email);
      setUsername(user.username || '');
    };

    fetchSessionAndData();
  }, [history]);

  const handleUpdate = async () => {
    if (password !== confirmPassword) {
      setAlertMessage("Passwords don't match.");
      setShowAlert(true);
      return;
    }

    const { data: session, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session || !session.session) {
      setAlertMessage('Error fetching session or no session available.');
      setShowAlert(true);
      return;
    }

    const user = session.session.user;
    if (!user.email) {
      setAlertMessage('Error: User email is missing.');
      setShowAlert(true);
      return;
    }

    // Verify current password
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (passwordError) {
      setAlertMessage('Incorrect current password.');
      setShowAlert(true);
      return;
    }

    // Update user info
    const { error: updateError } = await supabase
      .from('users')
      .update({
        user_firstname: firstName,
        user_lastname: lastName,
        username: username,
      })
      .eq('user_email', user.email);

    if (updateError) {
      setAlertMessage(updateError.message);
      setShowAlert(true);
      return;
    }

    // Update password if provided
    if (password) {
      const { error: passwordUpdateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (passwordUpdateError) {
        setAlertMessage(passwordUpdateError.message);
        setShowAlert(true);
        return;
      }
    }

    setAlertMessage('Account updated successfully!');
    setShowAlert(true);
    history.push('/app'); // Redirect to app dashboard
  };

  return (
    <IonPage>
      <IonHeader>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/app" />
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
                type="text"
                labelPlacement="floating"
                fill="outline"
                placeholder="Enter username"
                value={username}
                onIonChange={(e) => setUsername(e.detail.value!)}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonInput
                label="First Name"
                type="text"
                labelPlacement="floating"
                fill="outline"
                placeholder="Enter First Name"
                value={firstName}
                onIonChange={(e) => setFirstName(e.detail.value!)}
              />
            </IonCol>
            <IonCol size="6">
              <IonInput
                label="Last Name"
                type="text"
                labelPlacement="floating"
                fill="outline"
                placeholder="Enter Last Name"
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
            <IonCol size="12">
              <IonInput
                label="New Password"
                type="password"
                labelPlacement="floating"
                fill="outline"
                placeholder="Enter New Password"
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
                placeholder="Confirm New Password"
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
            <IonCol size="12">
              <IonInput
                label="Current Password"
                type="password"
                labelPlacement="floating"
                fill="outline"
                placeholder="Enter Current Password to Save Changes"
                value={currentPassword}
                onIonChange={(e) => setCurrentPassword(e.detail.value!)}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonButton expand="full" onClick={handleUpdate} shape="round">
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