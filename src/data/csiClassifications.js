// CSI Master Classification Data based on Construction Specifications Institute
export const CSI_MAIN_CATEGORIES = [
    { id: '00', name: 'Procurement & Contracting' },
    { id: '01', name: 'General Requirements' },
    { id: '02', name: 'Existing Conditions' },
    { id: '03', name: 'Concrete' },
    { id: '04', name: 'Masonry' },
    { id: '05', name: 'Metals' },
    { id: '06', name: 'Wood, Plastics, & Composites' },
    { id: '07', name: 'Thermal & Moisture Protection' },
    { id: '08', name: 'Openings' },
    { id: '09', name: 'Finishes' },
    { id: '10', name: 'Specialties' },
    { id: '11', name: 'Equipment' },
    { id: '12', name: 'Furnishings' },
    { id: '13', name: 'Special Construction' },
    { id: '14', name: 'Conveying Equipment' },
    { id: '21', name: 'Fire Suppression' },
    { id: '22', name: 'Plumbing' },
    { id: '23', name: 'Heating, Ventilation & Air Conditioning' },
    { id: '25', name: 'Integrated Automation' },
    { id: '26', name: 'Electrical' },
    { id: '27', name: 'Communications' },
    { id: '28', name: 'Electronic Safety & Security' },
    { id: '31', name: 'Earthwork' },
    { id: '32', name: 'Exterior Improvements' },
    { id: '33', name: 'Utilities' },
  ];
  
  export const CSI_SUBCATEGORIES = {
    '03': [ // Concrete
      { id: '03 10 00', name: 'Concrete Forming' },
      { id: '03 20 00', name: 'Concrete Reinforcing' },
      { id: '03 30 00', name: 'Cast-in-Place Concrete' },
      { id: '03 40 00', name: 'Precast Concrete' },
    ],
    '09': [ // Finishes
      { id: '09 20 00', name: 'Plaster and Gypsum Board' },
      { id: '09 30 00', name: 'Tiling' },
      { id: '09 50 00', name: 'Ceilings' },
      { id: '09 60 00', name: 'Flooring' },
      { id: '09 70 00', name: 'Wall Finishes' },
      { id: '09 80 00', name: 'Acoustical Treatment' },
    ],
    '23': [ // HVAC
      { id: '23 05 00', name: 'Common Work Results for HVAC' },
      { id: '23 07 00', name: 'HVAC Insulation' },
      { id: '23 20 00', name: 'HVAC Piping & Pumps' },
      { id: '23 30 00', name: 'HVAC Air Distribution' },
      { id: '23 60 00', name: 'HVAC Air Cleaning Devices' },
    ],
    '26': [ // Electrical
      { id: '26 05 00', name: 'Common Work Results for Electrical' },
      { id: '26 20 00', name: 'Low-Voltage Electrical Transmission' },
      { id: '26 30 00', name: 'Medium-Voltage Electrical Transmission' },
      { id: '26 40 00', name: 'Electrical & Cathodic Protection' },
      { id: '26 50 00', name: 'Lighting' },
    ],
    '27': [ // Communications
      { id: '27 10 00', name: 'Structured Cabling' },
      { id: '27 20 00', name: 'Data Communications' },
      { id: '27 30 00', name: 'Voice Communications' },
      { id: '27 40 00', name: 'Audio-Video Communications' },
    ]
  };
  
  // Common vendor specializations for quick selection
  export const VENDOR_SPECIALIZATIONS = [
    'Architectural', 'Structural', 'MEP', 'Electrical', 'Mechanical', 'General',
    'Interior Design', 'Civil', 'Finishing', 'Infrastructure', 'Fire Fighting', 
    'HVAC', 'Plumbing', 'Landscaping', 'Facade', 'Elevators', 'Security Systems'
  ];