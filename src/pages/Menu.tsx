import React, { useState, useCallback, useEffect } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonAccordion,
  IonAccordionGroup,
} from '@ionic/react';
import { 
  gridOutline, 
  personOutline, 
  newspaperOutline, 
  menuOutline, 
  logOutOutline,
  schoolOutline,   
  constructOutline 
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const Menu: React.FC = () => {
  const [width, setWidth] = useState(280); 
  const [isResizing, setIsResizing] = useState(false);
  const history = useHistory();

  const handleLogout = () => {
    // I-clear ang session kung naa man gani (e.g., localStorage.clear())
    // Unya i-redirect pabalik sa login screen
    history.replace('/login');
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      if (e.clientX > 200 && e.clientX < 600) {
        setWidth(e.clientX);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <IonMenu 
  contentId="main" 
  type="overlay" 
  swipeGesture={false}
  style={{ '--width': `${width}px`, width: `${width}px`, '--background': '#ffffff' }} // White menu background
>
  <IonContent className="ion-no-padding">
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#ffffff' }}>
      
      <IonList id="menu-list" style={{ background: 'transparent' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 15px', gap: '15px', background: '#ffffff' }}>
          <IonMenuToggle>
            <IonIcon icon={menuOutline} style={{ fontSize: '28px', color: '#0038A8', cursor: 'pointer' }} />
          </IonMenuToggle>
          <h2 style={{ margin: 0, color: '#0038A8', fontWeight: 'bold' }}>TSDC MONITORING</h2>
        </div>

        {/* Navigation Items */}
        <IonMenuToggle autoHide={false}>
          <IonItem routerLink="/dashboard" lines="none" style={{ '--background': '#ffffff', color: '#0038A8' }}>
            <IonIcon slot="start" icon={gridOutline} />
            <IonLabel>Dashboard</IonLabel>
          </IonItem>
        </IonMenuToggle>

        {/* --- DROPDOWN ACCORDION FOR PROFILING --- */}
        <IonAccordionGroup>
          <IonAccordion value="profiling" style={{ background: '#ffffff' }}>
            <IonItem slot="header" lines="none" style={{ '--background': '#ffffff', color: '#0038A8' }}>
              <IonIcon slot="start" icon={newspaperOutline} />
              <IonLabel>Profiling</IonLabel>
            </IonItem>

            <div slot="content" style={{ paddingLeft: '20px', background: '#f5f5f5' }}>
              <IonMenuToggle autoHide={false}>
                <IonItem routerLink="/profiling/scholarship" lines="none" style={{ '--background': '#ffffff', color: '#0038A8' }}>
                  <IonIcon slot="start" icon={schoolOutline} />
                  <IonLabel>Scholarship</IonLabel>
                </IonItem>
                
                <IonItem routerLink="/profiling/training" lines="none" style={{ '--background': '#ffffff', color: '#0038A8' }}>
                  <IonIcon slot="start" icon={constructOutline} />
                  <IonLabel>TSDC Skills Training</IonLabel>
                </IonItem>
              </IonMenuToggle>
            </div>
          </IonAccordion>
        </IonAccordionGroup>

        <IonMenuToggle autoHide={false}>
          <IonItem routerLink="/account" lines="none" style={{ '--background': '#ffffff', color: '#0038A8' }}>
            <IonIcon slot="start" icon={personOutline} />
            <IonLabel>User Account</IonLabel>
          </IonItem>
        </IonMenuToggle>
        
        <div style={{ padding: '20px 15px' }}>
          <IonButton expand="block" color="danger" onClick={handleLogout}>
            <IonIcon slot="start" icon={logOutOutline} />
            Logout
          </IonButton>
        </div>

      </IonList>

      {/* Resize Handle */}
      <div
        onMouseDown={startResizing}
        style={{
          position: 'absolute', top: 0, right: 0, width: '10px', height: '100%',
          cursor: 'ew-resize', zIndex: 999,
          borderRight: isResizing ? '2px solid #0038A8' : 'none'
        }}
      />
    </div>
  </IonContent>
</IonMenu>
  );
};

export default Menu;