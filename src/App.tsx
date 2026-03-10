import React from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { HashRouter } from 'react-router-dom';

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

setupIonicReact();

const AppContent: React.FC = () => {
  const location = useLocation();

  const isLoginPage = location.pathname.includes('/login');

  return (
    <IonSplitPane contentId="main" disabled={isLoginPage}>
      {!isLoginPage && <Menu />}

      <IonRouterOutlet id="main">

        {/* Default redirect */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        <Route exact path="/login" component={Login} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/profiling" component={Profiling} />
        <Route exact path="/account" component={UserAccount} />
        <Route exact path="/scholarship" component={Scholarship}/>
        <Route exact path="/students" component={StudentList}/>
        <Route exact path="/training" component={Training}/>
        <Route exact path="/trainees/:slug" component={TraineeList}/>
        <Route exact path="/student-profile" component={StudentProfile} />
        <Route exact path="/reset-password" component={ResetPassword} />
        <Route path="/update-student/:id" component={UpdateStudent} exact />

        {/* Profiling children */}
        <Route exact path="/profiling/scholarship" component={StudentProfile} />
        <Route exact path="/profiling/training" component={TraineeProfile} />

      </IonRouterOutlet>
    </IonSplitPane>
  );
};

const App: React.FC = () => (
  <IonApp>
    <HashRouter> {/* ✅ Mao ni ang bida */}
      <IonReactRouter> {/* ✅ Wala nay basename="/monitoring" diri */}
        <AppContent />
      </IonReactRouter>
    </HashRouter>
  </IonApp>
);

export default App;