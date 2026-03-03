import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonCheckbox,
  IonToast,
} from '@ionic/react';

import { useState } from 'react';
import { useHistory } from 'react-router';
import { supabase } from '../supabaseClient';

const StudentProfile: React.FC = () => {
  const history = useHistory();

  const [formData, setFormData] = useState({
    name: '',
    barangay: '',
    gender: '',
    school: '',
    course: '',
    year: '',
    ip: false,
    type: '',
  });

  const [showToast, setShowToast] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const saveStudent = async () => {
    if (
      !formData.name ||
      !formData.barangay ||
      !formData.gender ||
      !formData.school ||
      !formData.course ||
      !formData.year ||
      !formData.type
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    const { error } = await supabase
      .from('students')
      .insert([formData]);

    if (error) {
      console.error(error);
      alert('Error saving student.');
      return;
    }

    setShowToast(true);

    // Reset form
    setFormData({
      name: '',
      barangay: '',
      gender: '',
      school: '',
      course: '',
      year: '',
      ip: false,
      type: '',
    });

    // Redirect after short delay
    setTimeout(() => {
      history.push('/');
    }, 1000);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Student Profiling Form</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonItem>
          <IonLabel position="stacked">Full Name *</IonLabel>
          <IonInput
            value={formData.name}
            onIonChange={e => handleChange('name', e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Barangay Address *</IonLabel>
          <IonInput
            value={formData.barangay}
            onIonChange={e => handleChange('barangay', e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Gender *</IonLabel>
          <IonSelect
            value={formData.gender}
            onIonChange={e => handleChange('gender', e.detail.value)}
          >
            <IonSelectOption value="Male">Male</IonSelectOption>
            <IonSelectOption value="Female">Female</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">School Name *</IonLabel>
          <IonInput
            value={formData.school}
            onIonChange={e => handleChange('school', e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Course *</IonLabel>
          <IonInput
            value={formData.course}
            onIonChange={e => handleChange('course', e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Year Level *</IonLabel>
          <IonInput
            value={formData.year}
            onIonChange={e => handleChange('year', e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel>IP (Indigenous Person)</IonLabel>
          <IonCheckbox
            checked={formData.ip}
            onIonChange={e => handleChange('ip', e.detail.checked)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Type of Scholarship *</IonLabel>
          <IonSelect
            value={formData.type}
            onIonChange={e => handleChange('type', e.detail.value)}
          >
            <IonSelectOption value="shs">SHS</IonSelectOption>
            <IonSelectOption value="jhs">JHS</IonSelectOption>
            <IonSelectOption value="college">College</IonSelectOption>
            <IonSelectOption value="als">ALS</IonSelectOption>
            <IonSelectOption value="medicine">Medicine</IonSelectOption>
            <IonSelectOption value="law">Law</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonButton expand="block" onClick={saveStudent} className="ion-margin-top">
          Save Student
        </IonButton>

        <IonButton
          expand="block"
          color="medium"
          onClick={() => history.push('/')}
        >
          Cancel
        </IonButton>

        <IonToast
          isOpen={showToast}
          message="Student saved successfully!"
          duration={1500}
          onDidDismiss={() => setShowToast(false)}
        />

      </IonContent>
    </IonPage>
  );
};

export default StudentProfile;