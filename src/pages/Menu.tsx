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
  schoolOutline,   // Icon for Scholarship
  constructOutline,   // Icon for Training
  chevronDownOutline 
} from 'ionicons/icons';

const Menu: React.FC = () => {
  const [width, setWidth] = useState(280); 
  const [isResizing, setIsResizing] = useState(false);

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
      style={{ '--width': `${width}px`, width: `${width}px` }} 
    >
      <IonContent className="ion-no-padding">
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#1e1e1e' }}>
          
          <IonList id="menu-list" style={{ background: 'transparent' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 15px', gap: '15px' }}>
              <IonMenuToggle>
                <IonIcon icon={menuOutline} style={{ fontSize: '28px', color: 'white', cursor: 'pointer' }} />
              </IonMenuToggle>
              <h2 style={{ margin: 0, color: 'white', fontWeight: 'bold' }}>MyApp</h2>
            </div>

            {/* Navigation Items */}
            <IonItem routerLink="/dashboard" lines="none" style={{ '--background': 'transparent', color: 'white' }}>
              <IonIcon slot="start" icon={gridOutline} />
              <IonLabel>Dashboard</IonLabel>
            </IonItem>

            {/* --- DROPDOWN ACCORDION FOR PROFILING --- */}
            <IonAccordionGroup>
              <IonAccordion value="profiling" style={{ background: 'transparent' }}>
                <IonItem slot="header" lines="none" style={{ '--background': 'transparent', color: 'white' }}>
                  <IonIcon slot="start" icon={newspaperOutline} />
                  <IonLabel>Profiling</IonLabel>
                </IonItem>

                <div slot="content" style={{ paddingLeft: '20px', background: 'rgba(255,255,255,0.05)' }}>
                  <IonMenuToggle autoHide={false}>
                    <IonItem routerLink="/profiling/scholarship" lines="none" style={{ '--background': 'transparent', color: 'white' }}>
                      <IonIcon slot="start" icon={schoolOutline} />
                      <IonLabel>Scholarship</IonLabel>
                    </IonItem>
                    
                    <IonItem routerLink="/profiling/training" lines="none" style={{ '--background': 'transparent', color: 'white' }}>
                      <IonIcon slot="start" icon={constructOutline} />
                      <IonLabel>Training</IonLabel>
                    </IonItem>
                  </IonMenuToggle>
                </div>
              </IonAccordion>
            </IonAccordionGroup>

            <IonItem routerLink="/account" lines="none" style={{ '--background': 'transparent', color: 'white' }}>
              <IonIcon slot="start" icon={personOutline} />
              <IonLabel>User Account</IonLabel>
            </IonItem>
            
            <div style={{ padding: '20px 15px' }}>
              <IonButton expand="block" color="danger" routerLink="/login">
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
              borderRight: isResizing ? '2px solid white' : 'none'
            }}
          />
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;