export const ADMIN_EMAIL = 'deepu75245564@gmail.com';
export const ADMIN_PASSWORD = 'deepu5564';

export const EXAM_TYPES = ['JEE Mains', 'JEE Advanced', 'NEET', 'CUET', 'Board Exams'];

export const SUBJECTS = {
  JEE: ['Physics', 'Chemistry', 'Mathematics'],
  NEET: ['Physics', 'Chemistry', 'Biology'],
  ALL: ['Physics', 'Chemistry', 'Mathematics', 'Biology']
};

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

export const QUESTION_TYPES = ['MCQ', 'Numerical', 'Assertion Reason', 'Match the Following'];

export const CHAPTERS = {
  Physics: [
    'Mechanics', 'Kinematics', 'Laws of Motion', 'Work Energy Power',
    'Rotational Motion', 'Gravitation', 'Fluid Mechanics',
    'Thermodynamics', 'Kinetic Theory', 'Waves', 'Oscillations',
    'Electrostatics', 'Current Electricity', 'Magnetism',
    'Electromagnetic Induction', 'AC Circuits', 'Optics',
    'Modern Physics', 'Semiconductors', 'Communication Systems'
  ],
  Chemistry: [
    'Atomic Structure', 'Chemical Bonding', 'Periodic Table',
    'States of Matter', 'Thermodynamics', 'Equilibrium',
    'Redox Reactions', 'Electrochemistry', 'Chemical Kinetics',
    'Surface Chemistry', 'Organic Chemistry Basics', 'Hydrocarbons',
    'Haloalkanes', 'Alcohols Phenols Ethers', 'Aldehydes Ketones',
    'Coordination Compounds', 'Polymers', 'Biomolecules'
  ],
  Mathematics: [
    'Sets Relations Functions', 'Complex Numbers', 'Quadratic Equations',
    'Matrices Determinants', 'Permutations Combinations', 'Binomial Theorem',
    'Sequences Series', 'Limits Continuity', 'Differentiation',
    'Integration', 'Differential Equations', 'Coordinate Geometry',
    'Straight Lines', 'Circles', 'Conic Sections', 'Vectors',
    '3D Geometry', 'Probability', 'Statistics', 'Trigonometry'
  ],
  Biology: [
    'Cell Biology', 'Biomolecules', 'Cell Division', 'Plant Anatomy',
    'Plant Physiology', 'Photosynthesis', 'Respiration',
    'Human Physiology', 'Digestion', 'Breathing', 'Circulation',
    'Excretion', 'Nervous System', 'Endocrine System',
    'Reproduction', 'Genetics', 'Evolution', 'Ecology',
    'Biotechnology', 'Human Health Diseases'
  ]
};

export const BOTTOM_NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/student' },
  { id: 'tests', label: 'Tests', path: '/student/tests' },
  { id: 'notifications', label: 'Inbox', path: '/student/notifications' },
  { id: 'profile', label: 'Profile', path: '/student/profile' }
];

export const ADMIN_SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: 'dashboard' },
  { id: 'questions', label: 'Question Manager', path: '/admin/questions', icon: 'questions' },
  { id: 'bulk-upload', label: 'Bulk Upload', path: '/admin/bulk-upload', icon: 'upload' },
  { id: 'json-paste', label: 'JSON Paste', path: '/admin/json-paste', icon: 'json' },
  { id: 'database', label: 'Database Control', path: '/admin/database', icon: 'database' },
  { id: 'api-keys', label: 'API Integration', path: '/admin/api-keys', icon: 'api' },
  { id: 'ai-system', label: 'AI System', path: '/admin/ai-system', icon: 'ai' },
  { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: 'analytics' },
  { id: 'notifications', label: 'Notifications', path: '/admin/notifications', icon: 'notifications' },
  { id: 'logs', label: 'Activity Logs', path: '/admin/logs', icon: 'logs' },
  { id: 'access', label: 'Access Control', path: '/admin/access', icon: 'access' },
  { id: 'ui-customize', label: 'UI Settings', path: '/admin/ui-customize', icon: 'settings' }
];
