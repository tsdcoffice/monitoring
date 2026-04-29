import React from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonContent, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';

/* Pages */
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu'; 
import Profiling from './pages/Profiling';
import UserAccount from './pages/UserAccount';
import Scholarship from './pages/Scholarship';
import StudentList from './pages/StudentList';
import StudentProfile from './pages/StudentProfile';
import Training from './pages/Training';
import TraineeList from './pages/TraineeList';
import TraineeProfile from './pages/TraineeProfile';
import ResetPassword from './pages/ResetPassword';
import UpdateStudent from './pages/UpdateStudent';
import BatchList from './pages/BatchList';
import HistoryLogs from './pages/HistoryLogs';
import UpdateTrainee from './pages/UpdateTrainee';

setupIonicReact();

const AppContent: React.FC<{ session: any }> = ({ session }) => {
  const location = useLocation();

  const isAuthPage =
  location.pathname.includes('/login') ||
  location.pathname.includes('/reset-password');

  return (
      <IonSplitPane contentId="main" disabled={isAuthPage}>
  {!isAuthPage && <Menu />}

      <IonRouterOutlet id="main">

        {/* Default redirect */}
        <Route exact path="/reset-password" component={ResetPassword} />
        <Route exact path="/">  {session ? <Redirect to="/dashboard" /> : <Redirect to="/login" />} </Route>
        <Route exact path="/login"> {session ? <Redirect to="/dashboard" /> : <Login />} </Route>
        <Route exact path="/dashboard"> {session ? <Dashboard /> : <Redirect to="/login" />} </Route>
        <Route exact path="/profiling">  {session ? <Profiling /> : <Redirect to="/login" />} </Route>
        <Route exact path="/account">  {session ? <UserAccount /> : <Redirect to="/login" />} </Route>
        <Route exact path="/scholarship">  {session ? <Scholarship /> : <Redirect to="/login" />} </Route>
        <Route exact path="/students">  {session ? <StudentList /> : <Redirect to="/login" />} </Route>
        <Route exact path="/training">  {session ? <Training /> : <Redirect to="/login" />} </Route>
        <Route exact path="/student-profile">  {session ? <StudentProfile /> : <Redirect to="/login" />} </Route>
        <Route exact path="/update-student/:id">  {session ? <UpdateStudent /> : <Redirect to="/login" />} </Route>
        <Route exact path="/update-trainee/:id">  {session ? <UpdateTrainee /> : <Redirect to="/login" />} </Route>
        <Route exact path="/batch/:slug">  {session ? <BatchList /> : <Redirect to="/login" />} </Route>
        <Route exact path="/trainees/:slug"> {session ? <TraineeList /> : <Redirect to="/login" />} </Route>
        <Route exact path="/trainees/:slug/:batch"> {session ? <TraineeList /> : <Redirect to="/login" />} </Route>
        <Route path="/history-logs" component={HistoryLogs} exact />
        <Route path="/trainees/:slug/:batch/:year" component={TraineeList} exact />

        {/* Profiling children */}
        <Route exact path="/profiling/scholarship">  {session ? <StudentProfile /> : <Redirect to="/login" />} </Route>
        <Route exact path="/profiling/training">  {session ? <TraineeProfile /> : <Redirect to="/login" />} </Route>

         <Route exact path="/reset-password">
          <ResetPassword />
        </Route>

      </IonRouterOutlet>
    </IonSplitPane>
  );
};

const App: React.FC = () => {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Handle Supabase password recovery
if (window.location.hash.includes("access_token")) {
  window.history.replaceState(
    null,
    "",
    "/monitoring/reset-password" + window.location.hash
  );
}

// GitHub Pages 404 redirect fix
const redirect = window.location.search.replace(/^\?\//, '');
if (redirect) {
  window.history.replaceState(null, "", "/" + redirect);
}

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
  return <IonApp><IonContent></IonContent></IonApp>;
}

  return (
    <IonApp>
      <IonReactRouter basename="/monitoring">
        <AppContent session={session} />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;