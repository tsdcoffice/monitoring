import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonText, IonButton, IonIcon,
  IonInput, IonSelect, IonSelectOption,
  IonPopover, IonList, IonItem, IonLabel, IonButtons
} from '@ionic/react';

import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

import { jsPDF } from 'jspdf';
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import { saveAs } from "file-saver";

import {
  printOutline,
  downloadOutline,
  funnelOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import autoTable from 'jspdf-autotable';

interface Trainee {
  id: string;
  firstname: string;
  lastname: string;
  middlename: string | null;
  barangay: string;
  gender: string;
  educational_attainment: string;
  is_ip: boolean;
  created_at: string;
  training_type_id: string;
}

interface TrainingType {
  id: string;
  name: string;
}

const courseSlugMap: { [slug: string]: string } = {
  "barista": "Barista",
  "barangay-health": "Barangay Health Services NCII",
  "bayong-making": "Bayong Making",
  "beauty-care": "Beauty Care (Nail Care, Hair and Make-up)",
  "bread-pastry": "Bread and Pastry Production",
  "bookkeeping-nc3": "Bookkeeping NC III",
  "community-nutrition": "Community Nutrition Services",
  "cookery": "Cookery",
  "driving-nc2": "Driving NC II",
  "dressmaking-nc2": "Dressmaking NC II",
  "electrical-nc2": "Electrical Installation and Maintenance NC II",
  "emergency-medical": "Emergency Medical Services NC II",
  "food-processing": "Food Processing",
  "garbage-collection": "Garbage Collection NC II",
  "housekeeping-nc2": "Housekeeping NC II",
  "masonry-hallow": "Masonry and Hallow Blocks",
  "massage-therapy": "Massage Therapy",
  "organic-nc2": "Organic agriculture NC II",
  "plumbing": "Plumbing",
  "pineapple-processing": "Pineapple Processing",
  "scaffolding": "Scaffolding",
  "security-nc2": "Security Services NCII",
  "smaw-nc1": "Shielded Metal Arc Welding(SMAW) NC I",
  "smaw-nc2": "Shielded Metal Arc Welding(SMAW) NC II"
};

const barangays = [
  "Agusan Canyon","Alae","Dahilayan","Guilang-Guilang","Kalugmanan",
  "Lingion","Lunocan","Maluko","Mampayag","Mantibugao",
  "North Poblacion","Santiago","Sankanan","San Miguel","South Poblacion",
  "Tankulan","Ticalaan","Dicklum","Dalirig","Damilag",
  "Pagalungan","Lingi-on"
];

const TraineeList: React.FC = () => {

  const { slug } = useParams<{ slug: string }>();
  const history = useHistory();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlSearch = queryParams.get('query') || '';

  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);

  const [searchText, setSearchText] = useState(urlSearch);
  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedTrainingType, setSelectedTrainingType] = useState('');

  const [sortOption, setSortOption] = useState('date_desc');
  const [showFilter, setShowFilter] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  /* =========================
     SEARCH DEBOUNCE
  ========================== */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText]);

  /* =========================
     FETCH TRAINING TYPES
  ========================== */
  useEffect(() => {
    const fetchTypes = async () => {
      const { data } = await supabase
        .from('training_types')
        .select('*')
        .order('name');
      setTrainingTypes(data || []);
    };
    fetchTypes();
  }, []);

  /* =========================
     FETCH TRAINEES
  ========================== */
  useEffect(() => {

    const fetchTrainees = async () => {

      let query = supabase.from('trainees').select('*');

      if (slug && slug !== 'all') {

        const trainingName = courseSlugMap[slug];

        const { data: typeData } = await supabase
          .from('training_types')
          .select('id')
          .eq('name', trainingName)
          .single();

        if (!typeData) {
          setTrainees([]);
          return;
        }
          query = query.eq('training_type_id', typeData.id);
        

      }

        if (debouncedSearch || urlSearch) {
          const searchValue = debouncedSearch || urlSearch;

          query = query.or(
            `firstname.ilike.%${searchValue}%,lastname.ilike.%${searchValue}%`
          );
        }

      if (selectedBarangay) {
        query = query.eq('barangay', selectedBarangay);
      }

      if (selectedTrainingType) {
        query = query.eq('training_type_id', selectedTrainingType);
      }

      switch (sortOption) {
        case 'az':
          query = query.order('lastname', { ascending: true });
          break;
        case 'za':
          query = query.order('lastname', { ascending: false });
          break;
        case 'date_asc':
          query = query.order('created_at', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data } = await query;
      setTrainees(data || []);
    };

    fetchTrainees();

  }, [
    slug,
    debouncedSearch,
    urlSearch,
    selectedBarangay,
    selectedTrainingType,
    sortOption
  ]);

  const resetFilters = () => {
    setSelectedBarangay('');
    setSelectedTrainingType('');
    setSearchText('');
    setSortOption('date_desc');
  };

  /* PRINT */
const handlePrint = () => {
  if (!tableRef.current) return;

  const printWindow = window.open('', '', 'width=900,height=700');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>TSDC Trainee List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
          th { background: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>TSDC Trainee List</h2>
        <table>
          ${generateTableRows()}
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

  /* PDF DOWNLOAD */
const handleDownloadPDF = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');

  pdf.setFontSize(14);
  pdf.text('TSDC Trainee List', 105, 15, { align: 'center' });

  const tableColumn = [
    "Barangay",
    "Name",
    "Gender",
    "Education",
    "IP",
    "Date",
    "Training Type"
  ];

  const tableRows = trainees.map(t => [
    t.barangay,
    `${t.lastname}, ${t.firstname} ${t.middlename || ''}`,
    t.gender,
    t.educational_attainment,
    t.is_ip ? 'IP' : 'Not IP',
    new Date(t.created_at).toLocaleDateString(),
    trainingTypes.find(tt => tt.id === t.training_type_id)?.name || ''
  ]);

  autoTable(pdf, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: { fontSize: 8 }
  });

  pdf.save('tsdc_trainee_list.pdf');
};

const generateTableRows = () => {
  const header = `
    <tr>
      <th>Barangay</th>
      <th>Name</th>
      <th>Gender</th>
      <th>Education</th>
      <th>IP</th>
      <th>Date</th>
      <th>Training Type</th>
    </tr>
  `;

  const rows = trainees.map(t => `
    <tr>
      <td>${t.barangay}</td>
      <td>${t.lastname}, ${t.firstname} ${t.middlename || ''}</td>
      <td>${t.gender}</td>
      <td>${t.educational_attainment}</td>
      <td>${t.is_ip ? 'IP' : 'Not IP'}</td>
      <td>${new Date(t.created_at).toLocaleDateString()}</td>
      <td>${trainingTypes.find(tt => tt.id === t.training_type_id)?.name || ''}</td>
    </tr>
  `).join('');

  return header + rows;
};

   const downloadExcel = () => {

  const data = trainees.map(t => ({
    Barangay: t.barangay,
    Name: `${t.lastname}, ${t.firstname} ${t.middlename || ""}`,
    Gender: t.gender,
    Education: t.educational_attainment,
    IP: t.is_ip ? "IP" : "Not IP",
    Date: new Date(t.created_at).toLocaleDateString(),
    "Training Type": trainingTypes.find(tt => tt.id === t.training_type_id)?.name || ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Trainees");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, "tsdc_trainee_list.xlsx");

  setShowDownload(false);
};

  const downloadWord = async () => {

  const rows = [

    new TableRow({
      children: [
        new TableCell({children:[new Paragraph("Barangay")]}),
        new TableCell({children:[new Paragraph("Name")]}),
        new TableCell({children:[new Paragraph("Gender")]}),
        new TableCell({children:[new Paragraph("Education")]}),
        new TableCell({children:[new Paragraph("IP")]}),
        new TableCell({children:[new Paragraph("Date")]}),
        new TableCell({children:[new Paragraph("Training Type")]})
      ]
    }),

    ...trainees.map(t =>
      new TableRow({
        children: [
          new TableCell({children:[new Paragraph(t.barangay)]}),
          new TableCell({children:[new Paragraph(`${t.lastname}, ${t.firstname} ${t.middlename || ""}`)]}),
          new TableCell({children:[new Paragraph(t.gender)]}),
          new TableCell({children:[new Paragraph(t.educational_attainment)]}),
          new TableCell({children:[new Paragraph(t.is_ip ? "IP" : "Not IP")]}),
          new TableCell({children:[new Paragraph(new Date(t.created_at).toLocaleDateString())]}),
          new TableCell({children:[new Paragraph(trainingTypes.find(tt => tt.id === t.training_type_id)?.name || "")]})
        ]
      })
    )
  ];

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: "TSDC Trainee List",
          heading: "Heading1"
        }),
        new Paragraph(" "),
        new Table({ rows })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);

  saveAs(blob, "tsdc_trainee_list.docx");

  setShowDownload(false);
};

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
              <IonButton
                fill="clear"
                onClick={() => {
                resetFilters();
                history.push('/training');
                }}
              >
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>
            {slug === 'all' || !slug
              ? 'All Trainees'
              : `${slug.replace(/-/g,' ').toUpperCase()} Trainees`}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'15px'}}>
          <div style={{display:'flex',gap:'8px'}}>
            <IonButton fill="clear" onClick={handlePrint}>
              <IonIcon icon={printOutline}/>
            </IonButton>
            <IonButton fill="clear" onClick={() => setShowDownload(true)}>
  <IonIcon icon={downloadOutline}/>
</IonButton>
          </div>

          <div style={{display:'flex',gap:'8px'}}>

            <IonInput
              placeholder="Search name..."
              value={searchText}
              onIonInput={e => setSearchText(e.detail.value!)}
              style={{
                width:'180px',
                border:'1px solid #ccc',
                borderRadius:'20px',
                paddingLeft:'10px'
              }}
            />

            <IonButton onClick={() => setShowFilter(true)}>
              <IonIcon icon={funnelOutline}/> Filter
            </IonButton>

            {/* SORT - NO CANCEL/OK */}
            <IonSelect
              interface="popover"
              value={sortOption}
              onIonChange={e => setSortOption(e.detail.value)}
            >
              <IonSelectOption value="az">A-Z</IonSelectOption>
              <IonSelectOption value="za">Z-A</IonSelectOption>
              <IonSelectOption value="date_desc">Newest</IonSelectOption>
              <IonSelectOption value="date_asc">Oldest</IonSelectOption>
            </IonSelect>

          </div>
        </div>

        {/* FILTER POPOVER */}
        <IonPopover
          isOpen={showFilter}
          onDidDismiss={() => setShowFilter(false)}
        >
          <IonList style={{ padding: 15, minWidth: 250 }}>

            <IonItem>
              <IonLabel position="stacked">Barangay</IonLabel>
              <IonSelect
                interface="popover"
                value={selectedBarangay}
                onIonChange={e => setSelectedBarangay(e.detail.value)}
              >
                {barangays.map(b => (
                  <IonSelectOption key={b} value={b}>{b}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Training Type</IonLabel>
              <IonSelect
                interface="popover"
                value={selectedTrainingType}
                onIonChange={e => setSelectedTrainingType(e.detail.value)}
              >
                {trainingTypes.map(t => (
                  <IonSelectOption key={t.id} value={t.id}>
                    {t.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            {/* RESET + OK BUTTON */}
            <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
              <IonButton expand="block" color="medium" onClick={resetFilters}>
                Reset
              </IonButton>
              <IonButton expand="block" onClick={() => setShowFilter(false)}>
                OK
              </IonButton>
            </div>

          </IonList>
        </IonPopover>

        <IonText>
          <h2>Total Displayed: {trainees.length}</h2>
        </IonText>

        <div ref={tableRef}>
          <IonGrid>
            <IonRow style={{
              fontWeight:'bold',
              borderBottom:'2px solid #333',
              background:'#f2f2f2'
            }}>
              <IonCol>Barangay</IonCol>
              <IonCol>Name</IonCol>
              <IonCol>Gender</IonCol>
              <IonCol>Education</IonCol>
              <IonCol>IP</IonCol>
              <IonCol>Date</IonCol>
              <IonCol>Training Type</IonCol>
            </IonRow>

            {trainees.map(t => (
              <IonRow key={t.id}>
                <IonCol>{t.barangay}</IonCol>
                <IonCol>
                  {t.lastname}, {t.firstname} {t.middlename || ''}
                </IonCol>
                <IonCol>{t.gender}</IonCol>
                <IonCol>{t.educational_attainment}</IonCol>
                <IonCol>{t.is_ip ? 'IP' : 'Not IP'}</IonCol>
                <IonCol>
                  {new Date(t.created_at).toLocaleDateString()}
                </IonCol>
                <IonCol>
                  {trainingTypes.find(tt => tt.id === t.training_type_id)?.name || ''}
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </div>

      </IonContent>
      <IonPopover
  isOpen={showDownload}
  onDidDismiss={() => setShowDownload(false)}
>
  <IonList style={{minWidth:'200px'}}>

    <IonItem button onClick={downloadExcel}>
      <IonLabel>Download as Excel</IonLabel>
    </IonItem>

    <IonItem button onClick={handleDownloadPDF}>
      <IonLabel>Download as PDF</IonLabel>
    </IonItem>

    <IonItem button onClick={downloadWord}>
      <IonLabel>Download as Word</IonLabel>
    </IonItem>

  </IonList>
</IonPopover>
    </IonPage>
  );
};

export default TraineeList;


