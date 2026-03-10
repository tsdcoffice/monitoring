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
  IonToolbar,
  IonTitle,
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
  const [loading, setLoading] = useState(false);

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

  if (!currentPassword) {
    setAlertMessage("Please enter your current password to save changes.");
    setShowAlert(true);
    return;
  }

  setLoading(true); // ✅ Sugod sa Loading spinner effect

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('Session expired. Please log in again.');
    }

    // 1. Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error('Incorrect current password.');
    }

    // 2. Update user info sa table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        user_firstname: firstName,
        user_lastname: lastName,
        username: username,
      })
      .eq('user_email', session.user.email);

    if (updateError) throw updateError;

    // 3. Update password kung naay gi-input
    if (password) {
      const { error: passUpdateError } = await supabase.auth.updateUser({
        password: password,
      });
      if (passUpdateError) throw passUpdateError;
    }

    // ✅ KINI ANG MO-CLEAR SA MGA INPUT BOXES
    setCurrentPassword('');
    setPassword('');
    setConfirmPassword('');

    setAlertMessage('Account updated successfully!');
    setShowAlert(true);

    // I-redirect human ang 1.5 seconds
    setTimeout(() => {
      history.replace('/account'); 
    }, 1500);

  } catch (error: any) {
    setAlertMessage(error.message || 'An error occurred.');
    setShowAlert(true);
  } finally {
    setLoading(false); // ✅ Sigurado nga mawala ang loading maski naay error
  }
};

  return (
    <IonPage>
      <IonHeader>
  <IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>
    <IonButtons slot="start">
      <IonBackButton defaultHref="/app" />
    </IonButtons>
    <IonTitle style={{ fontWeight: 600 }}>EDIT ACCOUNT</IonTitle>
  </IonToolbar>
</IonHeader>

      <IonContent className="ion-padding">
      

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

        <IonButton 
          expand="full" 
          onClick={handleUpdate} 
          shape="round" 
          disabled={loading} // ✅ Dili ma-click samtang nag-loading
          style={{ marginTop: '20px', '--background': '#10377a' }}
          >
          {loading ? 'Updating...' : 'Update Account'}
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