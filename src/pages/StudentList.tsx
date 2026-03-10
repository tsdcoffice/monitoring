import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonButton,
  IonIcon,
  IonButtons,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  useIonViewWillEnter
} from '@ionic/react';

import {
  arrowBackOutline,
  printOutline,
  downloadOutline,
  funnelOutline
} from 'ionicons/icons';

import { useLocation, useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx-js-style";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import { saveAs } from "file-saver";
import headerImg from "../pics/header.png";
import { ImageRun } from "docx";
import { ShadingType } from "docx";


interface Student {
  id: string;
  firstname: string;
  lastname: string;
  middlename: string | null;
  gender: string;
  barangay: string;
  school: string;
  course: string | null;
  year_level: string | null;
  is_ip: boolean;
  ip_group: string | null;
  created_at: string;
  scholarship_types: { name: string } | null;
  status: string | null;
}

const barangays = [
  "Agusan Canyon","Alae","Dahilayan","Dalirig","Damilag","Diclum",
  "Guilang-guilang","Kalugmanan","Lindaban","Lingion","Lunocan",
  "Maluko","Mambatangan","Mampayag","Mantibugao","Minsuro",
  "San Miguel","Sankanan","Santiago","Santo Niño",
  "Tankulan (Pob.)","Ticala"
];

const StudentList: React.FC = () => {

  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  const typeQuery = queryParams.get('type');
  const searchQuery = queryParams.get('query');

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [searchText, setSearchText] = useState(searchQuery || '');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [sortOption, setSortOption] = useState('az');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [selectedIP, setSelectedIP] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkYear, setBulkYear] = useState('');
  const [showSelect, setShowSelect] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  

  useEffect(() => {
    fetchStudents();
  }, [typeQuery, searchQuery]);

  useIonViewWillEnter(() => {
  fetchStudents();
});

  useEffect(() => {
    applyFilters();
  }, [
    students,
    searchText,
    selectedBarangay,
    selectedGender,
    selectedIP,
    selectedSchool,
    selectedCourse,
    selectedYear,
    selectedStatus,
    sortOption
  ]);

  const fetchStudents = async () => {

    let query = supabase
      .from('students')
      .select(`*, scholarship_types(name)`);

    if (typeQuery) {
      const { data: typeData } = await supabase
        .from('scholarship_types')
        .select('id')
        .eq('name', typeQuery)
        .single();

      if (typeData) {
        query = query.eq('scholarship_type_id', typeData.id);
      }
    }
     if (searchQuery) {
    query = query.or(
      `lastname.ilike.%${searchQuery}%,firstname.ilike.%${searchQuery}%`
    );
  }

    const { data } = await query;

if (data) {

  const updated = data.map((s: Student) => {

    if (s.status === 'Graduated' && s.year_level !== 'Graduated') {

      // auto update database
      supabase
        .from('students')
        .update({ year_level: 'Graduated' })
        .eq('id', s.id);

      return { ...s, year_level: 'Graduated' };
    }

    return s;
  });

  setStudents(updated);

} else {
  setStudents([]);
}
  };

  const applyFilters = () => {

    let data = [...students];

    if (searchText) {
      data = data.filter(s =>
        `${s.lastname} ${s.firstname}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }

    if (selectedBarangay) {
      data = data.filter(s => s.barangay === selectedBarangay);
    }

    if (selectedGender) {
      data = data.filter(s => s.gender === selectedGender);
    }

    if (selectedIP) {
      data = data.filter(s =>
        selectedIP === 'IP' ? s.is_ip === true : s.is_ip === false
      );
    }

    if (selectedSchool) {
      data = data.filter(s => s.school === selectedSchool);
    }

    if (selectedCourse) {
      data = data.filter(s => s.course === selectedCourse);
    }

    if (selectedStatus) {
      data = data.filter(s => (s.status || 'On-going') === selectedStatus);
    }

    if (selectedYear) {
  data = data.filter(s => s.year_level === selectedYear);
}

    switch (sortOption) {
      case 'az':
        data.sort((a, b) => a.lastname.localeCompare(b.lastname));
        break;
      case 'za':
        data.sort((a, b) => b.lastname.localeCompare(a.lastname));
        break;
      case 'date_desc':
        data.sort((a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
        break;
      case 'date_asc':
        data.sort((a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
        break;
    }

    setFilteredStudents(data);
  };

  const handleBack = () => {
    history.replace('/scholarship');
  };

  const resetFilters = () => {
  setSearchText('');
  setSelectedBarangay('');
  setSelectedGender('');
  setSelectedIP('');
  setSelectedSchool('');
  setSelectedCourse('');
  setSelectedYear('');
  setSelectedStatus('');
  setSortOption('az');
  setSelectedStudents([]); // clear selected rows
  setShowSelect(false); // hide select column
  setShowFilter(false);
};

  /* PRINT */
  const handlePrint = () => {

  const printWindow = window.open('', '', 'width=1000,height=700');
  if (!printWindow) return;

  printWindow.document.write(generateHTMLTable(filteredStudents));
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
};

  const generateHTMLTable = (data: Student[]) => `
    <html>
      <head>
        <style>
          body { font-family: Arial; padding:20px; }
          table { width:100%; border-collapse:collapse; }
          th,td { border:1px solid #000; padding:5px; font-size:12px; }
          th { background:#10377a; color:white; font-weight:bold; }
        </style>
      </head>
      <body>

<div style="text-align:center; margin-bottom:15px;">
  <img src="${headerImg}" style="width:100%; max-width:700px;" />
</div>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Barangay</th>
              <th>Name</th>
              <th>Gender</th>
              <th>School</th>
              <th>Course</th>
              <th>Year</th>
              <th>IP</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${s.barangay}</td>
                <td>${s.lastname}, ${s.firstname}</td>
                <td>${s.gender}</td>
                <td>${s.school}</td>
                <td>${s.course || '-'}</td>
                <td>${s.year_level || '-'}</td>
                <td>${s.is_ip ? 'IP' : 'Not IP'}</td>
                <td>${s.scholarship_types?.name || '-'}</td>
                <td style="
  color: ${
    (s.status || 'On-going') === 'Graduated'
      ? 'green'
      : (s.status || 'On-going') === 'Stopped'
      ? 'red'
      : 'gray'
  };
  font-weight: bold;
">
  ${s.status || 'On-going'}
</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  /* PDF */
  const handleDownloadPDF = () => {

  const doc = new jsPDF();

  // ADD HEADER IMAGE
  const img = new Image();
  img.src = headerImg;

  doc.addImage(img, "PNG", 10, 5, 190, 25);

  const tableData = filteredStudents.map((s, i) => [
  i + 1,
    s.barangay,
    `${s.lastname}, ${s.firstname}`,
    s.gender,
    s.school,
    s.course || '-',
    s.year_level || '-',
    s.is_ip ? 'IP' : 'Not IP',
    s.scholarship_types?.name || '-',
    s.status || 'On-going'
  ]);

  autoTable(doc, {
    head: [['No.','Barangay','Name','Gender','School','Course','Year','IP','Type','Status']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },

    didParseCell: function (data) {

      if (data.column.index === 8) {

        const status = data.cell.raw;

        if (status === 'Graduated') data.cell.styles.textColor = [0,128,0];
        if (status === 'Stopped') data.cell.styles.textColor = [200,0,0];
        if (status === 'On-going') data.cell.styles.textColor = [120,120,120];

        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  doc.save('scholarship_student_list.pdf');
};

    const getStatusColor = (status: string | null) => {
      if (status === 'Graduated') return 'success';
      if (status === 'Stopped') return 'danger';
      return 'medium'; // On-going
    };

    const getRowColor = (status: string | null) => {

  if (status === 'Graduated') return '#d4edda'; // green

  if (status === 'Stopped') return '#f8d7da'; // red

  return ''; // ongoing
};

    const handleUpdate = (studentId: string) => {
  history.push(`/update-student/${studentId}`);
};

const toggleSelectStudent = (id: string) => {
  setSelectedStudents(prev =>
    prev.includes(id)
      ? prev.filter(s => s !== id)
      : [...prev, id]
  );
};

const updateYearLevel = async (studentId: string, year: string) => {
  await supabase
    .from('students')
    .update({ year_level: year })
    .eq('id', studentId);

  fetchStudents();
};

const handleBulkUpdate = async () => {

  if (!bulkYear || selectedStudents.length === 0) return;

  await supabase
    .from('students')
    .update({ year_level: bulkYear })
    .in('id', selectedStudents);

  setSelectedStudents([]);
  setBulkYear('');

  fetchStudents();
};

   const downloadExcel = () => {

  const data = filteredStudents.map((s, i) => ({
  No: i + 1,
    Barangay: s.barangay,
    Name: `${s.lastname}, ${s.firstname}`,
    Gender: s.gender,
    School: s.school,
    Course: s.course || "-",
    Year: s.year_level || "-",
    IP: s.is_ip ? "IP" : "Not IP",
    Type: s.scholarship_types?.name || "-",
    Status: s.status || "On-going"
  }));

  const worksheet = XLSX.utils.json_to_sheet([]);

XLSX.utils.sheet_add_aoa(worksheet, [
  ["TSDC Scholarship Monitoring System"],
  ["Scholarship Student List"],
  []
]);

XLSX.utils.sheet_add_json(worksheet, data, { origin: "A4" });

  // Auto column width
  worksheet["!cols"] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 10 },
    { wch: 25 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 20 },
    { wch: 15 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, "Scholarship_Students.xlsx");

  setShowDownload(false);
};

  const downloadWord = async () => {

  const rows = [

    // HEADER
   new TableRow({
  children: [

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("No.")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Barangay")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Name")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Gender")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("School")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Course")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Year")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("IP")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Type")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Status")]
    })

  ]
}),

    ...filteredStudents.map((s, i) =>
      new TableRow({
        children: [
          new TableCell({children:[new Paragraph(String(i + 1))]}),
          new TableCell({children:[new Paragraph(s.barangay)]}),
          new TableCell({children:[new Paragraph(`${s.lastname}, ${s.firstname}`)]}),
          new TableCell({children:[new Paragraph(s.gender)]}),
          new TableCell({children:[new Paragraph(s.school)]}),
          new TableCell({children:[new Paragraph(s.course || "-")]}),
          new TableCell({children:[new Paragraph(s.year_level || "-")]}),
          new TableCell({children:[new Paragraph(s.is_ip ? "IP" : "Not IP")]}),
          new TableCell({children:[new Paragraph(s.scholarship_types?.name || "-")]}),
          new TableCell({children:[new Paragraph(s.status || "On-going")]})
        ]
      })
    )
  ];

  const doc = new Document({
    sections: [
      {
        children: [

  new Paragraph({
    children: [
      new ImageRun({
        data: await fetch(headerImg).then(r => r.arrayBuffer()),
        transformation: {
          width: 600,
          height: 120
        },
        type: "png"
      })
    ]
  }),

  new Paragraph(" "),

  new Table({
    rows
  })

]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);

  saveAs(blob, "Scholarship_Students.docx");

  setShowDownload(false);
};

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon icon={arrowBackOutline}/>
            </IonButton>
          </IonButtons>

          <IonTitle>
            {typeQuery ? `${typeQuery.toUpperCase()} Scholars` : 'All Scholars'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'15px'}}>

          <div>
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
              style={{border:'1px solid #ccc',borderRadius:'20px',paddingLeft:'10px'}}
            />

            <IonButton onClick={() => setShowFilter(true)}>
              <IonIcon icon={funnelOutline}/> Filter
            </IonButton>

            <IonSelect
              interface="popover"
              value={sortOption}
              onIonChange={e => setSortOption(e.detail.value)}
            >
              <IonSelectOption value="az">A to Z</IonSelectOption>
              <IonSelectOption value="za">Z to A</IonSelectOption>
              <IonSelectOption value="date_desc">Newest</IonSelectOption>
              <IonSelectOption value="date_asc">Oldest</IonSelectOption>
            </IonSelect>

          </div>
        </div>

        <IonPopover isOpen={showFilter} onDidDismiss={() => setShowFilter(false)}>
          <IonList style={{padding:'15px',minWidth:'250px'}}>

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
              <IonLabel position="stacked">Filter Type</IonLabel>
              <IonSelect
                interface="popover"
                value={filterType}
                onIonChange={e => {
                  setFilterType(e.detail.value);
                  setSelectedGender('');
                  setSelectedIP('');
                  setSelectedSchool('');
                  setSelectedCourse('');
                }}
              >
                <IonSelectOption value="gender">Gender</IonSelectOption>
                <IonSelectOption value="ip">IP</IonSelectOption>
                <IonSelectOption value="school">School</IonSelectOption>
                <IonSelectOption value="course">Course</IonSelectOption>
                <IonSelectOption value="year">Year Level</IonSelectOption>
                <IonSelectOption value="status">Status</IonSelectOption>
              </IonSelect>
            </IonItem>

            {filterType === 'gender' && (
<IonItem>
  <IonLabel position="stacked">Gender</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedGender}
    onIonChange={e => {
      setSelectedGender(e.detail.value);
      setShowFilter(false);
    }}
  >
    <IonSelectOption value="Male">Male</IonSelectOption>
    <IonSelectOption value="Female">Female</IonSelectOption>
  </IonSelect>
</IonItem>
)}

{filterType === 'ip' && (
<IonItem>
  <IonLabel position="stacked">IP</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedIP}
    onIonChange={e => {
      setSelectedIP(e.detail.value);
      setShowFilter(false);
    }}
  >
    <IonSelectOption value="IP">IP</IonSelectOption>
    <IonSelectOption value="NOT_IP">Not IP</IonSelectOption>
  </IonSelect>
</IonItem>
)}

{filterType === 'school' && (
<IonItem>
  <IonLabel position="stacked">School</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedSchool}
    onIonChange={e => {
      setSelectedSchool(e.detail.value);
      setShowFilter(false);
    }}
  >
    {[...new Set(students.map(s => s.school))].map(school => (
      <IonSelectOption key={school} value={school}>
        {school}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>
)}

{filterType === 'course' && (
<IonItem>
  <IonLabel position="stacked">Course</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedCourse}
    onIonChange={e => {
      setSelectedCourse(e.detail.value);
      setShowFilter(false);
    }}
  >
    {[...new Set(students.map(s => s.course).filter(Boolean))].map(course => (
      <IonSelectOption key={course} value={course}>
        {course}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>
)}

{filterType === 'year' && (
<IonItem>
  <IonLabel position="stacked">Year Level</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedYear}
    onIonChange={e => {

  const year = e.detail.value;

  setSelectedYear(year);
  setShowFilter(false);

  if (year) {

    setShowSelect(true);

    const ids = students
      .filter(s => s.year_level === year)
      .map(s => s.id);

    setSelectedStudents(ids);

  } else {

    setShowSelect(false);
    setSelectedStudents([]);

  }

}}
  >
    <IonSelectOption value="1st Year">1st Year</IonSelectOption>
    <IonSelectOption value="2nd Year">2nd Year</IonSelectOption>
    <IonSelectOption value="3rd Year">3rd Year</IonSelectOption>
    <IonSelectOption value="4th Year">4th Year</IonSelectOption>
    <IonSelectOption value="5th Year">5th Year</IonSelectOption>
  </IonSelect>
</IonItem>
)}

{filterType === 'status' && (
<IonItem>
  <IonLabel position="stacked">Student Status</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedStatus}
    onIonChange={e => {
      setSelectedStatus(e.detail.value);
      setShowFilter(false);
    }}
  >
    <IonSelectOption value="On-going">On-going</IonSelectOption>
    <IonSelectOption value="Graduated">Graduated</IonSelectOption>
    <IonSelectOption value="Stopped">Stopped</IonSelectOption>
  </IonSelect>
</IonItem>
)}

            <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
              <IonButton expand="block" color="medium" onClick={resetFilters}>
                Reset
              </IonButton>

              <IonButton expand="block" onClick={() => setShowFilter(false)}>
                Ok
              </IonButton>
            </div>

          </IonList>
        </IonPopover>

        <IonText>
          <h2>Total Displayed: {filteredStudents.length}</h2>
        </IonText>

{showSelect && (
<div style={{display:'flex',gap:'10px',marginBottom:'10px'}}>

<IonSelect
  placeholder="Change Year Level"
  value={bulkYear}
  onIonChange={e => setBulkYear(e.detail.value)}
>
  <IonSelectOption value="1st Year">1st Year</IonSelectOption>
  <IonSelectOption value="2nd Year">2nd Year</IonSelectOption>
  <IonSelectOption value="3rd Year">3rd Year</IonSelectOption>
  <IonSelectOption value="4th Year">4th Year</IonSelectOption>
  <IonSelectOption value="5th Year">5th Year</IonSelectOption>
</IonSelect>

<IonButton
  disabled={selectedStudents.length === 0}
  onClick={handleBulkUpdate}
>
  Update Selected
</IonButton>

</div>
)}

        <IonGrid>
          <IonRow style={{fontWeight:'bold',borderBottom:'2px solid #000'}}>
            {showSelect && <IonCol size="1">Select</IonCol>}
            <IonCol size="1">No.</IonCol>
            <IonCol>Barangay</IonCol>
            <IonCol>Barangay</IonCol>
            <IonCol>Name</IonCol>
            <IonCol>Gender</IonCol>
            <IonCol>School</IonCol>
            <IonCol>Course</IonCol>
            <IonCol>Year</IonCol>
            <IonCol>IP</IonCol>
            <IonCol>Type</IonCol>
            <IonCol>Status</IonCol>
            <IonCol>Action</IonCol>
          </IonRow>

          {filteredStudents.map((student, index) => (
            <IonRow key={student.id}
              style={{ backgroundColor: getRowColor(student.status) }}
            >
              {showSelect && (
<IonCol size="1">
  <input
    type="checkbox"
    checked={selectedStudents.includes(student.id)}
    onChange={() => toggleSelectStudent(student.id)}
  />
</IonCol>
)}
              <IonCol size="1">{index + 1}</IonCol>
              <IonCol>{student.barangay}</IonCol>
              <IonCol>{student.lastname}, {student.firstname}</IonCol>
              <IonCol>{student.gender}</IonCol>
              <IonCol>{student.school}</IonCol>
              <IonCol>{student.course || '-'}</IonCol>
              <IonCol>

{student.status === 'Graduated' ? (

<IonText color="success">
  <b>Graduated</b>
</IonText>

) : showSelect ? (

<IonSelect
  value={student.year_level}
  placeholder="-"
  onIonChange={e =>
    updateYearLevel(student.id, e.detail.value)
  }
>

  <IonSelectOption value="1st Year">1st Year</IonSelectOption>
  <IonSelectOption value="2nd Year">2nd Year</IonSelectOption>
  <IonSelectOption value="3rd Year">3rd Year</IonSelectOption>
  <IonSelectOption value="4th Year">4th Year</IonSelectOption>
  <IonSelectOption value="5th Year">5th Year</IonSelectOption>

</IonSelect>

) : (

<IonText>
  {student.year_level || '-'}
</IonText>

)}

</IonCol>
              <IonCol>{student.is_ip ? 'IP' : 'Not IP'}</IonCol>
              <IonCol>{student.scholarship_types?.name || '-'}</IonCol>
              {/* STATUS COLUMN */}
              <IonCol>
      <IonText color={getStatusColor(student.status)}>
        {student.status || 'On-going'}
      </IonText>
    </IonCol>

    {/* UPDATE BUTTON */}
    <IonCol>
      <IonButton
        size="small"
        color="primary"
        onClick={() => handleUpdate(student.id)}
      >
        Update
      </IonButton>
    </IonCol>
            </IonRow>
          ))}

        </IonGrid>

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

export default StudentList;