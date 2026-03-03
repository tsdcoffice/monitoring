import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet,IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Login';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu'; 
import Pfofiling from './pages/Profiling';
import UserAccount from './pages/UserAccount';
import Profiling from './pages/Profiling';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      {/* 1. Ang SplitPane ang nag-divide sa Menu ug sa main Content */}
      <IonSplitPane contentId="main">
        
        {/* 2. Imong Sidebar Menu */}
        <Menu />

        {/* 3. Ang main area kung asa manggawas imong mga pages */}
          <IonRouterOutlet id="main">
          <Route path="/monitoring/app" component={Menu} />
          <Route exact path="/monitoring" component={Login} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/profiling" component={Profiling} />
          <Route exact path="/account" component={UserAccount} />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  </IonApp>
);

export default App;
