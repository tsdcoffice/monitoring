import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';

import { supabase } from '../supabaseClient';

const HistoryLogs: React.FC = () => {

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
  fetchLogs();

  const channel = supabase
    .channel('admin_logs_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_logs',
      },
      (payload) => {
        setLogs((prevLogs) => [payload.new, ...prevLogs]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const fetchLogs = async () => {

    const { data: session } = await supabase.auth.getSession();

    if (!session.session) return;

    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
  console.error("Error fetching logs:", error);
} else {
  setLogs(data || []);
}
  };

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#fff' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/account" />
          </IonButtons>
          <IonTitle>History Logs</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonList>
          {logs.map((log) => (
            <IonItem key={log.id}>
              <IonLabel>
                <h2>{log.action} - {log.table_name}</h2>
                <p>{log.description}</p>
                <small>{new Date(log.created_at).toLocaleString()}</small>
                  <br />
                  <small>{log.admin_email}</small>
                    <br />
                  <small>{log.admin_email}</small>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

      </IonContent>

    </IonPage>
  );
};

export default HistoryLogs;