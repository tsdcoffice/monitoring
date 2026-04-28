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
import * as XLSX from "xlsx-js-style";
import {  Document, Packer, Paragraph, Table, TableRow, TableCell, ImageRun, AlignmentType, HeadingLevel, ShadingType } from "docx";
import { saveAs } from "file-saver";
import headerImg from "../pics/header.png";
import { TextRun } from "docx";
import { statsChartOutline, closeOutline } from 'ionicons/icons';

import {
  printOutline,
  downloadOutline,
  funnelOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import autoTable from 'jspdf-autotable';

interface Trainee {
  id: string;

  lastname: string;
  firstname: string;
  middlename: string | null;
  extension: string | null;

  barangay: string;
  city: string;
  province: string;

  email: string;
  contact: string;
  nationality: string;

  gender: string;
  civil_status: string;
  employment: string;

  birth_month: string;
  birth_day: number;
  birth_year: number;
  age: number;

  birthplace_city: string;
  birthplace_province: string;

  educational_attainment: string;

  classification: string[];
  disability: string;
  disability_other: string;

  course: string;
  batch: number;

  scholarship: string;
  scholarship_other: string;

  year_enrolled: number;

  created_at: string;
  status: string;
}

interface TrainingType {
  id: string;
  name: string;
}

interface BatchDetails {
  id: string;
  course: string;
  batch: number;
  start_date: string;
  end_date: string;
  duration_hours: number;
  trainor: string;
  venue: string;
}

const courseSlugMap: { [slug: string]: string } = {
  "barista": "Barista",
  "barangay-health": "Barangay Health Services NC II",
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
  "organic-nc2": "Organic Agriculture NC II",
  "plumbing": "Plumbing",
  "pineapple-processing": "Pineapple Processing",
  "scaffolding": "Scaffolding",
  "security-nc2": "Security Services NC II",
  "smaw-nc1": "Shielded Metal Arc Welding(SMAW) NC I",
  "smaw-nc2": "Shielded Metal Arc Welding(SMAW) NC II"
};

const barangays = [
  "Agusan Canyon","Alae","Dahilayan" ,"Dalirig" ,"Damilag" ,"Dicklum","Guilang-Guilang","Kalugmanan",
  "Lindaban" ,"Lingion","Lunocan","Maluko", "Mambatangan" ,"Mampayag", "Minsuro" , "Mantibugao", 
  "San Miguel" , "Sankanan" ,"Santiago" , "Santo Niño" , "Tankulan (Pob.)","Ticala"
  
];

const TraineeList: React.FC = () => {

  const tableHeaderStyle = {
    fontWeight: 'bold',
    background: '#10377a',
    color: 'white',
    textAlign: 'center' as const,
    padding: '10px 6px'
  };

  const tableCellStyle = {
  padding: '8px 6px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #eee',
  whiteSpace: 'nowrap'   // ✅ ADD THIS
};

  const { slug, batch } = useParams<{ slug: string, batch?: string }>();
  const history = useHistory();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlSearch = queryParams.get('query') || '';
  const urlYear = queryParams.get('year') || '';
  useEffect(() => {
  setSelectedYear(urlYear);
}, [urlYear]);
  const urlMode = queryParams.get('mode') || '';

  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationHours, setDurationHours] = useState<number | "">("");
  const [trainor, setTrainor] = useState("");
  const [venue, setVenue] = useState("");
  const [selectedYear, setSelectedYear] = useState(urlYear);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [yearSummary, setYearSummary] = useState<any[]>([]);
  const [availableTrainingTypes, setAvailableTrainingTypes] = useState<TrainingType[]>([]);
  const [filteredTrainingTypes, setFilteredTrainingTypes] = useState<TrainingType[]>([]);
  const [isReportMode, setIsReportMode] = useState(urlMode === 'report');

      const overallTrainings = yearSummary.length;

const overallBatches = yearSummary.reduce(
  (sum, item) => sum + item.batches,
  0
);

const overallTrainees = yearSummary.reduce(
  (sum, item) => sum + item.trainees,
  0
);

      const reportTitle = selectedYear
  ? `TSDC Year ${selectedYear} Training Summary`
  : "TSDC Trainee List";

  const [searchText, setSearchText] = useState(urlSearch);
  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
  const params = new URLSearchParams(location.search);

  if (selectedYear) {
    params.set('year', selectedYear);
  } else {
    params.delete('year');
  }

  // MODE
  if (isReportMode) {
    params.set('mode', 'report');
  } else {
    params.delete('mode');
  }

  history.replace({ search: params.toString() });

}, [selectedYear]);

  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  /* =========================
   FETCH BATCH DETAILS (FIXED)
========================== */
useEffect(() => {
  const fetchBatchDetails = async () => {
    if (!slug || !batch) return;

    const trainingName = courseSlugMap[slug];

    const { data, error } = await supabase
      .from('training_batches')
      .select('*')
      .eq('course', trainingName)
      .eq('batch', Number(batch))
      .maybeSingle();

    if (error) {
      console.error("Error fetching batch details:", error);
      return;
    }

    if (data) {
      setBatchDetails(data);

      // 👉 IMPORTANT: para mo stay sa UI after refresh
      setStartDate(data.start_date || "");
      setEndDate(data.end_date || "");
      setDurationHours(data.duration_hours || "");
      setTrainor(data.trainor || "");
      setVenue(data.venue || "");
    } else {
      setBatchDetails(null);
      setStartDate("");
      setEndDate("");
      setDurationHours("");
      setTrainor("");
      setVenue("");
    }
  };

  fetchBatchDetails();
}, [slug, batch]);

  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedTrainingType, setSelectedTrainingType] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);

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


  
  useEffect(() => {
  const fetchFilteredTrainingTypes = async () => {

    let query = supabase
      .from('trainees')
      .select('course');

    if (selectedBarangay) {
      query = query.eq('barangay', selectedBarangay);
    }

    const { data } = await query;

    if (!data) return;

    const uniqueTypeIds = Array.from(
      new Set(data.map(d => d.course))
    );

    const filtered = trainingTypes.filter(t =>
      uniqueTypeIds.includes(t.name)
    );

    setFilteredTrainingTypes(filtered);

  };

  fetchFilteredTrainingTypes();
}, [selectedBarangay, trainingTypes]);

useEffect(() => {
  setSelectedTrainingType('');
  setSelectedBatchFilter('');
}, [selectedBarangay]);

useEffect(() => {
  if (selectedTrainingType && selectedTrainingType !== batchDetails?.course) {
    setSelectedBatchFilter('');
  }
}, [selectedTrainingType, batchDetails]);

  /* =========================
     FETCH TRAINEES
  ========================== */
// BAG-O NGA CODE
useEffect(() => {
  const fetchTrainees = async () => {
    let query = supabase.from('trainees').select('*');

    // Filter by Course (Slug)
    if (slug && slug !== 'all') {
      const trainingName = courseSlugMap[slug];
      query = query.eq('course', trainingName);
      
      // Filter by Batch (Priority: URL param, fallback to Filter state)
      const activeBatch = batch || selectedBatchFilter;
      if (activeBatch) {
        query = query.eq('batch', Number(activeBatch));
      }
    } else {
      // Logic para sa "All Trainees" page
      if (selectedTrainingType) query = query.eq('course', selectedTrainingType);
      if (selectedBatchFilter) query = query.eq('batch', Number(selectedBatchFilter));
    }

    if (debouncedSearch) {
      query = query.or(`firstname.ilike.%${debouncedSearch}%,lastname.ilike.%${debouncedSearch}%`);
    }

    if (selectedBarangay) query = query.eq('barangay', selectedBarangay);

    // ✅ YEAR FILTER
if (selectedYear) {
  query = query.eq('year_enrolled', Number(selectedYear));
}

    const { data } = await query;
    setTrainees(data || []);
  };
  fetchTrainees();
}, [slug, batch, debouncedSearch, selectedBarangay, selectedTrainingType, selectedBatchFilter, selectedYear, sortOption]);

  const resetFilters = () => {
  setSelectedBarangay('');
  setSelectedTrainingType('');
  setSelectedBatchFilter('');
  setSelectedYear('');   // ⭐ ADD THIS
  setSearchText('');
  setSortOption('date_desc');
};

    useEffect(() => {

  const fetchYears = async () => {

    const { data } = await supabase
      .from("trainees")
      .select("created_at");

    if (!data) return;

    const years = Array.from(
      new Set(
        data.map(t => new Date(t.created_at).getFullYear())
      )
    ).sort((a,b)=>b-a);

    setAvailableYears(years.map(String));

  };

  fetchYears();

}, []);

  useEffect(() => {

  if (!selectedYear) {
    setYearSummary([]);
    return;
  }

  const fetchYearSummary = async () => {

    const start = `${selectedYear}-01-01`;
    const end = `${selectedYear}-12-31`;

    const { data } = await supabase
      .from("trainees")
      .select("course,batch,created_at")
      .gte("created_at", start)
      .lte("created_at", end);

    if (!data) return;

    const grouped:any = {};

    data.forEach(t => {

      const typeName = t.course;

      if (!grouped[typeName]) {
        grouped[typeName] = {
          trainees: 0,
          batches: new Set()
        };
      }

      grouped[typeName].trainees += 1;
      grouped[typeName].batches.add(t.batch);

    });

    const result = Object.keys(grouped)
  .sort((a, b) => a.localeCompare(b))
  .map(key => ({
      training: key,
      trainees: grouped[key].trainees,
      batches: grouped[key].batches.size
    }));

    setYearSummary(result);

  };

  fetchYearSummary();

}, [selectedYear, trainingTypes]);

 const TraineeTable: React.FC = () => {

  
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>No.</th>
          <th>Barangay</th>
          <th>Name</th>
          <th>Gender</th>
          <th>Education</th>
          <th>Date</th>
          <th>Training Type</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {trainees.map((t, index) => {
          const typeName =
            trainingTypes.find(tt => tt.id === t.course)?.name || "";
          const trainingDisplay =
            (!batch && !selectedBatchFilter)
              ? `${typeName} (Batch ${t.batch})`
              : typeName;

          function deleteTrainee(id: string): void {
            throw new Error('Function not implemented.');
          }

          return (
            <tr key={t.id}>
              <td>{index + 1}</td>
              <td>{t.barangay}</td>
              <td>{`${t.lastname}, ${t.firstname} ${t.middlename || ''}`}</td>
              <td>{t.gender}</td>
              <td>{t.educational_attainment}</td>
              <td>{new Date(t.created_at).toLocaleDateString()}</td>
              <td>{trainingDisplay}</td>
              <td>
                <IonButton
                  size="small"
                  color="primary"
                  onClick={() => history.push(`/update-trainee/${t.id}`)}
                  style={{ marginRight: '5px' }}
                >
                  Update
                </IonButton>
                <IonButton
                  size="small"
                  color="danger"
                  onClick={() => deleteTrainee(t.id)}
                >
                  Delete
                </IonButton>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

  /* PRINT */
const handlePrint = () => {
  if (!tableRef.current) return;

  const printWindow = window.open('', '', 'width=900,height=700');
  if (!printWindow) return;

  // 1. Isuwat ang content (apil ang image)
  printWindow.document.write(`
    <html>
      <head>
        <title>TSDC Trainee List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align:center; margin-top:10px; }
          .generated { text-align:center; font-size:12px; margin-bottom:15px; }
          table { width:100%; border-collapse:collapse; }
          th, td { border:1px solid #333; padding:6px; font-size:12px; text-align:center; }
          th { background:#10377a; color:white; }
        </style>
      </head>
      <body>
        <img id="print-header" src="${headerImg}" style="width:100%; max-height:120px; object-fit:contain;" />
        <h2>${reportTitle}</h2>

<div class="generated" style="margin-bottom:15px;">
Generated: ${new Date().toLocaleDateString()}
</div>

${batchDetails ? `
<div style="margin-bottom:15px;font-size:12px">

<div style="display:flex;">
<div style="width:33%"><b>Batch:</b> ${batchDetails.batch}</div>
<div style="width:33%"><b>Start Date:</b> ${batchDetails.start_date}</div>
<div style="width:33%"><b>End Date:</b> ${batchDetails.end_date}</div>
</div>

<div style="display:flex;margin-top:5px;">
<div style="width:33%"><b>Duration:</b> ${batchDetails.duration_hours} hrs</div>
<div style="width:33%"><b>Trainor:</b> ${batchDetails.trainor}</div>
<div style="width:33%"><b>Venue:</b> ${batchDetails.venue}</div>
</div>

</div>
` : ""}

<table>
  ${generateTableRows()}
</table>

    <div style="
  margin-top:20px;
  padding-top:10px;
  border-top:2px solid #000;
  font-weight:bold;
">

<!-- ✅ MOVE TOTALS HERE -->
${selectedYear ? `
<div style="margin-top:20px;font-weight:bold">
Overall Trainings: ${overallTrainings}<br>
Overall Batches: ${overallBatches}<br>
Overall Trainees: ${overallTrainees.toLocaleString()}
</div>
` : ""}

      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // 2. KINI ANG IMPORTANTE:
  // Maghulat ta nga ma-load ang image sa dili pa i-print
  const header = printWindow.document.getElementById('print-header') as HTMLImageElement;
  
  if (header) {
    header.onload = () => {
      printWindow.print();
      // printWindow.close(); // Optional: i-close ang window after print/cancel
    };

    // Para sa mga browser nga paspas kaayo o naka-cache na ang image
    if (header.complete) {
      header.onload(new Event('load'));
    }
  } else {
    // Backup kung pananglitan naay error sa image
    printWindow.print();
  }
};

  /* PDF DOWNLOAD */
const handleDownloadPDF = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');

  const img = new Image();
  img.src = headerImg;

pdf.addImage(img, "PNG", 10, 5, 190, 30);

  pdf.setFontSize(16);
pdf.text(reportTitle, 105, 40, { align: 'center' });

pdf.setFontSize(10);
pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 46, { align: 'center' });
let startY = 60;

if(batchDetails){

autoTable(pdf, {
  startY: startY,

  body: [
    [
      `Batch: ${batchDetails.batch}`,
      `Start Date: ${batchDetails.start_date}`,
      `End Date: ${batchDetails.end_date}`
    ],
    [
      `Duration: ${batchDetails.duration_hours} hrs`,
      `Trainor: ${batchDetails.trainor}`,
      `Venue: ${batchDetails.venue}`
    ]
  ],

  theme: "plain",

  styles:{
    fontSize:10,
    halign:"left"
  },

  columnStyles:{
    0:{cellWidth:63},
    1:{cellWidth:63},
    2:{cellWidth:63}
  }

});

startY = (pdf as any).lastAutoTable.finalY + 5;
}

  let tableColumn;
let tableRows;

 if (selectedYear) {

  tableColumn = [
    "No.",
    "Training Type",
    "Total Batches",
    "Total Trainees"
  ];

  tableRows = yearSummary.map((t, index) => [
    index + 1,
    t.training,
    t.batches,
    t.trainees
  ]);

} else {

  tableColumn = [
    "No.",
    "Barangay",
    "Name",
    "Gender",
    "Education",
    "IP",
    "Date",
    "Training Type"
  ];

  tableRows = trainees.map((t, index) => {

    const typeName =
      trainingTypes.find(tt => tt.id === t.course)?.name || "";

    const trainingDisplay =
      (!batch && !selectedBatchFilter)
        ? `${typeName} (Batch ${t.batch})`
        : typeName;

  

    return [
      index + 1,
      t.barangay,
      `${t.lastname}, ${t.firstname} ${t.middlename || ''}`,
      t.gender,
      t.educational_attainment,
      new Date(t.created_at).toLocaleDateString(),
      trainingDisplay
    ];
  });

}

  autoTable(pdf, {
  head: [tableColumn],
  body: tableRows,
  startY: startY,
  showHead: "everyPage",

  

  styles: {
    fontSize:8,
    halign:'center',
    valign:'middle'
  },

  headStyles:{
    fillColor:[16,55,122],
    textColor:255,
    fontStyle:'bold',
    halign:'center'
  },

  alternateRowStyles:{
    fillColor:[245,245,245]
  }
});

    const finalY = (pdf as any).lastAutoTable.finalY;

if (selectedYear) {
  pdf.text(`Overall Trainings: ${overallTrainings}`, 20, finalY + 10);
  pdf.text(`Overall Batches: ${overallBatches}`, 20, finalY + 18);
  pdf.text(`Overall Trainees: ${overallTrainees.toLocaleString()}`, 20, finalY + 26);
}

  pdf.save(
  selectedYear
    ? `tsdc_${selectedYear}_summary.pdf`
    : "tsdc_trainee_list.pdf"
); };



   const downloadExcel = () => {

let data;

if (selectedYear) {

  data = yearSummary.map((t, index) => ({
    "No.": index + 1,
    "Training Type": t.training,
    "Total Batches": t.batches,
    "Total Trainees": t.trainees
  }));

} else {

  data = trainees.map((t, index) => {

    const typeName =
      trainingTypes.find(tt => tt.id === t.course)?.name || "";

    return {
      "No.": index + 1,
      Barangay: t.barangay,
      Name: `${t.lastname}, ${t.firstname} ${t.middlename || ""}`,
      Gender: t.gender,
      Education: t.educational_attainment,
      Date: new Date(t.created_at).toLocaleDateString(),
      "Training Type":
        (!batch && !selectedBatchFilter)
          ? `${typeName} (Batch ${t.batch})`
          : typeName
    };
  });

}

 const worksheet = XLSX.utils.json_to_sheet([]);

// Add title + batch details
XLSX.utils.sheet_add_aoa(
  worksheet,
  [
    [reportTitle],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    
    ...(batchDetails ? [
  [
    `Batch: ${batchDetails.batch}`,
    "",
    `Start Date: ${batchDetails.start_date}`,
    "",
    "",
    `End Date: ${batchDetails.end_date}`
  ],
  [
    `Duration: ${batchDetails.duration_hours} hrs`,
    "",
    `Trainor: ${batchDetails.trainor}`,
    "",
    "",
    `Venue: ${batchDetails.venue}`
  ],
  []
] : [])
  ],
  { origin: "A1" }
);

worksheet["!merges"] = [

  // TITLE
  { s:{r:0,c:0}, e:{r:0,c:7} },

  // GENERATED
  { s:{r:1,c:0}, e:{r:1,c:7} },

  // BATCH / START / END
  { s:{r:3,c:0}, e:{r:3,c:1} },
  { s:{r:3,c:2}, e:{r:3,c:4} },
  { s:{r:3,c:5}, e:{r:3,c:7} },

  // DURATION / TRAINOR / VENUE
  { s:{r:4,c:0}, e:{r:4,c:1} },
  { s:{r:4,c:2}, e:{r:4,c:4} },
  { s:{r:4,c:5}, e:{r:4,c:7} }

];

worksheet["A1"].s = {
  font:{ bold:true, sz:16 },
  alignment:{ horizontal:"center", vertical:"center" }
};

worksheet["A2"].s = {
  alignment:{ horizontal:"center", vertical:"center" }
};

// Header row
const headerRow = selectedYear
  ? ["No.", "Training Type", "Total Batches", "Total Trainees"]
  : ["No.", "Barangay", "Name", "Gender", "Education", "IP", "Date", "Training Type"];

XLSX.utils.sheet_add_aoa(
  worksheet,
  [headerRow],
  { origin: "A6" }
);

// Add data rows
XLSX.utils.sheet_add_json(
  worksheet,
  data,
  { origin: "A7", skipHeader: true }
);

// 2 add totals AFTER
if (selectedYear) {
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [],
      [`Overall Trainings: ${overallTrainings}`],
      [`Overall Batches: ${overallBatches}`],
      [`Overall Trainees: ${overallTrainees}`]
    ],
    { origin: -1 }
  );
}

// Style header cells
const headerStyle = {
  fill: { fgColor: { rgb: "10377A" } },
  font: { bold: true, color: { rgb: "FFFFFF" } },
  alignment: { horizontal: "center", vertical: "center" }
};

for (let C = 0; C < headerRow.length; C++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 5, c: C }); // row 10
  if (!worksheet[cellAddress]) continue;
  worksheet[cellAddress].s = headerStyle;
}

// Auto column width
worksheet["!cols"] = selectedYear
  ? [
      { wch: 5 },
      { wch: 35 },
      { wch: 20 },
      { wch: 20 }
    ]
  : [
      { wch: 5 },
      { wch: 18 },
      { wch: 30 },
      { wch: 10 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
      { wch: 30 }
    ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Trainees");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(
  blob,
  selectedYear
    ? `tsdc_${selectedYear}_summary.xlsx`
    : "tsdc_trainee_list.xlsx"
);

  setShowDownload(false);
};

const saveBatchDetails = async () => {
  // 1. Siguraduhon nato nga naay slug ug batch gikan sa URL
  if (!slug || !batch) {
    alert("Missing course or batch information.");
    return;
  }

  const trainingName = courseSlugMap[slug];

  // 2. Prepare ang payload (Siguraduhon nga ang types match sa DB)
  const payload = {
    course: trainingName,
    batch: Number(batch),
    // Gamit og null kon empty ang string para dili mag-error ang Postgres date/int fields
    start_date: startDate || null,
    end_date: endDate || null,
    duration_hours: durationHours === "" ? null : Number(durationHours),
    trainor: trainor || null,
    venue: venue || null
  };

  console.log("Saving payload:", payload);

  // 3. KINI ANG IMONG GIPANGUTANA (Ang Upsert Logic)
  const { data, error } = await supabase
    .from("training_batches")
    .upsert(payload, {
      onConflict: "course,batch", 
    })
    .select(); // .select() para makuha ang updated row

  if (error) {
    console.error("SAVE ERROR:", error);
    // Mas maayo i-alert ang error.message para mahibal-an nato ang rason (e.g. Constraint error)
    alert(`Error saving batch details: ${error.message}`);
  } else {
    alert("Batch details saved successfully!");
    
    // 4. I-update ang local state para makita dayon ang kausaban sa UI
    if (data && data.length > 0) {
  const saved = data[0];
  setBatchDetails(saved);
  setStartDate(saved.start_date || "");
  setEndDate(saved.end_date || "");
  setDurationHours(saved.duration_hours || "");
  setTrainor(saved.trainor || "");
  setVenue(saved.venue || "");
  setSelectedTrainingType(saved.course);      // ✅ keep filter consistent
  setSelectedBatchFilter(String(saved.batch)); // ✅ keep filter consistent
}
  }
};

  const downloadWord = async () => {
    const generatedDate = new Date().toLocaleDateString();

  const rows = [

    new TableRow({
  tableHeader: true,
  children: selectedYear
    ? [
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("No.")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("Training Type")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("Total Batches")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("Total Trainees")] })
      ]
    : [
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("No.")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("Barangay")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("Name")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("Gender")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("Education")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("IP")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("Date")] }),
        new TableCell({ shading:{ fill:"10377A", type:ShadingType.CLEAR }, children:[new Paragraph("Training Type")] })
      ]
}),

...selectedYear
  ? yearSummary.map((t,index)=> new TableRow({
      children:[
        new TableCell({children:[new Paragraph(String(index+1))]}),
        new TableCell({children:[new Paragraph(t.training)]}),
        new TableCell({children:[new Paragraph(String(t.batches))]}),
        new TableCell({children:[new Paragraph(String(t.trainees))]})
      ]
    }))
  : trainees.map((t,index)=> {
  const typeName = trainingTypes.find(tt => tt.id === t.course)?.name || "";
  // I-append ang Batch No. kung wala'y filter
  const trainingDisplay = (!batch && !selectedBatchFilter) ? `${typeName} (Batch ${t.batch})` : typeName;


  return new TableRow({
    children: [
      new TableCell({children:[new Paragraph(String(index + 1))]}),
      new TableCell({children:[new Paragraph(t.barangay)]}),
      new TableCell({children:[new Paragraph(`${t.lastname}, ${t.firstname} ${t.middlename || ""}`)]}),
      new TableCell({children:[new Paragraph(t.gender)]}),
      new TableCell({children:[new Paragraph(t.educational_attainment)]}),
      new TableCell({children:[new Paragraph(new Date(t.created_at).toLocaleDateString())]}),
      new TableCell({children:[new Paragraph(trainingDisplay)]}) 
    ]
  });
})
  ];

const paragraphs = [
  new Paragraph({ text: "Some header or title..." }),
  // only add totals if YEAR is selected
];

if (selectedYear) {
  paragraphs.push(
    new Paragraph({ text: `Overall Trainings: ${overallTrainings}` }),
    new Paragraph({ text: `Overall Batches: ${overallBatches}` }),
    new Paragraph({ text: `Overall Trainees: ${overallTrainees.toLocaleString()}` })
  );
}

  

  const doc = new Document({
    sections: [{
      children: [

  new Paragraph({
    children: [
      new ImageRun({
        data: await fetch(headerImg).then(r => r.arrayBuffer()),
        transformation: {
          width: 500,
          height: 100
        },
        type: "png"
      })
    ]
  }),

new Paragraph({
  text: reportTitle,
  heading: HeadingLevel.HEADING_1,
  alignment: AlignmentType.CENTER
}),

new Paragraph({
  text: `Generated: ${generatedDate}`,
  alignment: AlignmentType.CENTER
}),

...(batchDetails ? [

new Paragraph(" "), // space after generated date

new Table({
  width: { size: 100, type: "pct" },

  borders: {
    top: { style: "none", size: 0, color: "FFFFFF" },
    bottom: { style: "none", size: 0, color: "FFFFFF" },
    left: { style: "none", size: 0, color: "FFFFFF" },
    right: { style: "none", size: 0, color: "FFFFFF" },
    insideHorizontal: { style: "none", size: 0, color: "FFFFFF" },
    insideVertical: { style: "none", size: 0, color: "FFFFFF" }
  },

  rows: [

    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(`Batch: ${batchDetails.batch}`)]
        }),
        new TableCell({
          children: [new Paragraph(`Start Date: ${batchDetails.start_date}`)]
        }),
        new TableCell({
          children: [new Paragraph(`End Date: ${batchDetails.end_date}`)]
        })
      ]
    }),

    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(`Duration: ${batchDetails.duration_hours} hrs`)]
        }),
        new TableCell({
          children: [new Paragraph(`Trainor: ${batchDetails.trainor}`)]
        }),
        new TableCell({
          children: [new Paragraph(`Venue: ${batchDetails.venue}`)]
        })
      ]
    })

  ]
}),

new Paragraph(" "),

] : []),

new Paragraph(" "),

  new Table({
    rows,
    width:{ size:100, type:"pct" }
  }),

]
    }]
  });

  const blob = await Packer.toBlob(doc);

  saveAs(
  blob,
  selectedYear
    ? `tsdc_${selectedYear}_summary.docx`
    : "tsdc_trainee_list.docx"
);

  setShowDownload(false);
};

  const handleDelete = async (id: string) => {
  const confirmDelete = window.confirm("Are you sure you want to delete?");
  if (!confirmDelete) return;

  const { error } = await supabase
    .from('trainees')
    .delete()
    .eq('id', id);

  if (error) {
    alert("Delete failed: " + error.message);
  } else {
    setTrainees(prev => prev.filter(t => t.id !== id));
  }
};

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>
          <IonButtons slot="start">
              <IonButton
  fill="clear"
  onClick={() => {
  const params = new URLSearchParams();

  if (selectedYear) {
    params.set('year', selectedYear);
  }

  if (slug && batch) {
    history.push(`/batch/${slug}?${params.toString()}`);
  } else {
    history.push(`/training?${params.toString()}`);
  }
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

        {isReportMode && (
  <IonText color="primary">
    <p><b>Report Mode:</b> Year Summary Active</p>
  </IonText>
)}

        {/* FILTER POPOVER */}
        {/* FILTER POPOVER */}
<IonPopover
  isOpen={showFilter}
  onDidDismiss={() => setShowFilter(false)}
>
  <IonList style={{ padding: 15, minWidth: 250 }}>

    {/* MODE TOGGLE BUTTON */}
    <IonItem lines="none">
      <IonButton
        expand="block"
        fill="outline"
        onClick={() => setIsReportMode(prev => !prev)}
      >
        <IonIcon
          slot="start"
          icon={isReportMode ? closeOutline : statsChartOutline}
        />
        {isReportMode ? "Exit Report Mode" : "Year Summary Mode"}
      </IonButton>
    </IonItem>

    {/* REPORT MODE */}
    {isReportMode ? (
      <IonItem>
        <IonLabel position="stacked">Year (Summary Report)</IonLabel>
        <IonSelect
          interface="alert"  // automatic filter
          value={selectedYear}
          onIonChange={e => setSelectedYear(e.detail.value)}
        >
          <IonSelectOption value="">Select Year</IonSelectOption>
          {availableYears.map(year => (
            <IonSelectOption key={year} value={year}>
              {year}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
    ) : (
      <>
        {/* NORMAL MODE */}
        <IonItem>
          <IonLabel>Barangay</IonLabel>
          <IonSelect
            interface="alert" // automatic filter
            value={selectedBarangay}
            onIonChange={(e) => setSelectedBarangay(e.detail.value)}
          >
            <IonSelectOption value="">All</IonSelectOption>
            {barangays.map(b => (
              <IonSelectOption key={b} value={b}>{b}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Training Type</IonLabel>
          <IonSelect
            interface="alert" // automatic filter
            value={selectedTrainingType}
            onIonChange={(e) => setSelectedTrainingType(e.detail.value)}
          >
            <IonSelectOption value="">All</IonSelectOption>
            {(selectedBarangay ? filteredTrainingTypes : trainingTypes).map(t => (
              <IonSelectOption key={t.name} value={t.name}>
  {t.name}
</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Batch</IonLabel>
          <IonSelect
            interface="alert" // automatic filter
            value={selectedBatchFilter}
            onIonChange={(e) => setSelectedBatchFilter(e.detail.value)}
          >
            <IonSelectOption value="">All</IonSelectOption>
            {availableBatches.map(b => (
              <IonSelectOption key={b} value={b}>{b}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      </>
    )}

    {/* BUTTONS */}
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
  <h2>
{selectedYear
  ? `Overall Trainees: ${yearSummary.reduce((a,b)=>a+b.trainees,0)}`
  : `Total Displayed: ${trainees.length}`
}
</h2>
</IonText>

{/* BATCH DETAILS TABLE */}

{slug !== "all" && batch && (

<IonGrid style={{
border:"1px solid #ccc",
marginBottom:"15px",
padding:"10px",
borderRadius:"6px"
}}>

<IonRow style={{fontWeight:"bold", background:"#10377a", color:"white"}}>
<IonCol>Batch</IonCol>
<IonCol>Start Date</IonCol>
<IonCol>End Date</IonCol>
<IonCol>Duration (hrs)</IonCol>
<IonCol>Trainor</IonCol>
<IonCol>Venue</IonCol>
<IonCol>Action</IonCol>
</IonRow>

<IonRow style={{ alignItems: 'center' }}>
  {/* 1. Batch Number gikan sa URL */}
  <IonCol>{batch}</IonCol>

  {/* 2. Start Date Input */}
  <IonCol>
    <IonInput
      type="date"
      value={startDate || ""}
      onIonInput={e => setStartDate(e.detail.value!)}
      style={{ border: '1px solid #ddd', borderRadius: '4px' }}
    />
  </IonCol>

  {/* 3. End Date Input */}
  <IonCol>
    <IonInput
      type="date"
      value={endDate || ""}
      onIonInput={e => setEndDate(e.detail.value!)}
      style={{ border: '1px solid #ddd', borderRadius: '4px' }}
    />
  </IonCol>

  {/* 4. Duration Input */}
  <IonCol>
    <IonInput
      type="number"
      value={durationHours}
      onIonInput={e => {
        const val = e.detail.value;
        setDurationHours(val === "" ? "" : Number(val));
      }}
      placeholder="Hrs"
      style={{ border: '1px solid #ddd', borderRadius: '4px' }}
    />
  </IonCol>

  {/* 5. Trainor Input */}
  <IonCol>
    <IonInput
      value={trainor || ""}
      onIonInput={e => setTrainor(e.detail.value!)}
      placeholder="Trainor"
      style={{ border: '1px solid #ddd', borderRadius: '4px' }}
    />
  </IonCol>

  {/* 6. Venue Input */}
  <IonCol>
    <IonInput
      value={venue || ""}
      onIonInput={e => setVenue(e.detail.value!)}
      placeholder="Venue"
      style={{ border: '1px solid #ddd', borderRadius: '4px' }}
    />
  </IonCol>

  {/* 7. Save Button */}
  <IonCol>
    <IonButton size="small" expand="block" onClick={saveBatchDetails}>
      Save
    </IonButton>
  </IonCol>
</IonRow>

</IonGrid>
)}



     {isReportMode && selectedYear ? (
        <div
          ref={tableRef}
          style={{
            overflowX: "auto",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px"
          }}
        >
          <h2>Year {selectedYear}</h2>
          <IonGrid>
            <IonRow style={{ fontWeight: 'bold', background: '#10377a', color: 'white' }}>
              <IonCol size="1">No.</IonCol>
              <IonCol>Training Type</IonCol>
              <IonCol>Total Batches</IonCol>
              <IonCol>Total Trainees</IonCol>
            </IonRow>
            {yearSummary.map((t, index) => (
              <IonRow key={index}>
                <IonCol size="1">{index + 1}</IonCol>
                <IonCol>{t.training}</IonCol>
                <IonCol>{t.batches}</IonCol>
                <IonCol>{t.trainees}</IonCol>
              </IonRow>
            ))}
          </IonGrid>
          <IonText>
            <b>Overall Trainees: {yearSummary.reduce((a, b) => a + b.trainees, 0)}</b>
          </IonText>
        </div>
      ) : (
        <div
          ref={tableRef}
          style={{
            overflowX: "auto",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px"
          }}
        >
          <IonGrid style={{ minWidth: '2600px', padding: 0 }}>
            {/* HEADER ROW */}
            <IonRow style={{ flexWrap: 'nowrap' }}>
              <IonCol style={{ ...tableHeaderStyle, width: '50px', flex: 'none' }}>No.</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '200px', flex: 'none' }}>Lastname</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '200px', flex: 'none' }}>Firstname</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '200px', flex: 'none' }}>Middlename</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '60px', flex: 'none' }}>Ext</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '250px', flex: 'none' }}>Barangay</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '250px', flex: 'none' }}>City</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '250px', flex: 'none' }}>Province</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '250px', flex: 'none' }}>Contact</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '250px', flex: 'none' }}>Email</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '150px', flex: 'none' }}>Gender</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '250px', flex: 'none' }}>Civil Status</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '300px', flex: 'none' }}>Employment</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '200px', flex: 'none' }}>Birthdate</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '60px', flex: 'none' }}>Age</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '300px', flex: 'none' }}>Birthplace</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '400px', flex: 'none' }}>Education</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '400px', flex: 'none' }}>Course</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '100px', flex: 'none' }}>Batch</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '150px', flex: 'none' }}>Scholarship</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '100px', flex: 'none' }}>Year</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '150px', flex: 'none' }}>Status</IonCol>
              <IonCol style={{ ...tableHeaderStyle, width: '180px', flex: 'none' }}>Action</IonCol>
            </IonRow>

            {/* DATA ROWS */}
            {trainees.map((t, index) => (
              <IonRow
                key={t.id}
                style={{
                  textAlign: 'center',
                  background: index % 2 === 0 ? '#fafafa' : '#ffffff',
                  flexWrap: 'nowrap'
                }}
              >
                <IonCol style={{ ...tableCellStyle, width: '50px', flex: 'none' }}>{index + 1}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '200px', flex: 'none' }}>{t.lastname}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '200px', flex: 'none' }}>{t.firstname}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '200px', flex: 'none' }}>{t.middlename || '-'}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '60px', flex: 'none' }}>{t.extension || '-'}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '250px', flex: 'none' }}>{t.barangay}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '250px', flex: 'none' }}>{t.city}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '250px', flex: 'none' }}>{t.province}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '250px', flex: 'none' }}>{t.contact}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '250px', flex: 'none', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.email}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '150px', flex: 'none' }}>{t.gender}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '250px', flex: 'none' }}>{t.civil_status}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '300px', flex: 'none' }}>{t.employment}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '200px', flex: 'none' }}>
                  {t.birth_month} {t.birth_day}, {t.birth_year}
                </IonCol>
                <IonCol style={{ ...tableCellStyle, width: '60px', flex: 'none' }}>{t.age}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '300px', flex: 'none', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.birthplace_city}, {t.birthplace_province}
                </IonCol>
                <IonCol style={{ ...tableCellStyle, width: '400px', flex: 'none', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.educational_attainment}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '400px', flex: 'none', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.course}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '100px', flex: 'none' }}>{t.batch}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '150px', flex: 'none' }}>
                  {t.scholarship === "Other" ? t.scholarship_other : t.scholarship}
                </IonCol>
                <IonCol style={{ ...tableCellStyle, width: '100px', flex: 'none' }}>{t.year_enrolled}</IonCol>
                <IonCol style={{ ...tableCellStyle, width: '150px', flex: 'none' }}>
  <span style={{
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    background:
      t.status === 'COMPLETED' ? '#2dd36f' :
      t.status === 'DROPOUT' ? '#eb445a' :
      '#ffc409',
    color: '#fff'
  }}>
    {t.status || 'ENROLLED'}
  </span>
</IonCol>


<IonCol style={{ ...tableCellStyle, width: '180px', flex: 'none' }}>
  <IonButton
    size="small"
    color="primary"
    onClick={() => history.push(`/update-trainee/${t.id}`)}
    style={{ marginRight: '5px' }}
  >
    Update
  </IonButton>

  <IonButton
    size="small"
    color="danger"
    onClick={() => handleDelete(t.id)}
  >
    Delete
  </IonButton>
</IonCol>


              </IonRow>
            ))}
          </IonGrid>
        </div>
      )}
    </IonContent>

    <IonPopover isOpen={showDownload} onDidDismiss={() => setShowDownload(false)}>
      <IonList style={{ minWidth: '200px' }}>
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
function generateTableRows() {
  throw new Error('Function not implemented.');
}

