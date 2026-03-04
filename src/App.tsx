import React from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

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

setupIonicReact();

const AppContent: React.FC = () => {
  const location = useLocation();

  // Dili nato ipakita ang Menu kung naa sa Login page
  const isLoginPage = location.pathname.includes('/monitoring');

  return (
    <IonSplitPane contentId="main" disabled={isLoginPage}>
      {/* 1. I-render lang ang Menu kung dili login page */}
      {!isLoginPage && <Menu />}

      {/* 2. Main Content Area */}
      <IonRouterOutlet id="main">
        {/* Default route redirect to Login */}
        <Route exact path="/">
          <Redirect to="/monitoring" />
        </Route>

        <Route exact path="/monitoring" component={Login} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/profiling" component={Profiling} />
        <Route exact path="/account" component={UserAccount} />
        <Route exact path="/scholarship" component={Scholarship}/>
        <Route exact path="/students" component={StudentList}/>
        
        {/* Scholarship Dashboard is now root */}
        <Route exact path="/">
          <Scholarship />
        </Route>

        <Route exact path="/students/:type">
          <StudentList />
        </Route>

        <Route exact path="/student-profile">
          <StudentProfile />
        </Route>


        {/* Child routes for Profiling (Scholarship/Training) */}
        <Route exact path="/profiling/scholarship" component={StudentProfile} />
        <Route exact path="/profiling/training" component={Profiling} />
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter basename="/tsdc_monitoring">
      <AppContent />
    </IonReactRouter>
  </IonApp>
);

export default App;