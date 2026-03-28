import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiBookOpen, FiChevronDown, FiChevronUp, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FORMULAS = {
  Physics: {
    Mechanics: [
      { name: "Newton's Second Law", formula: "F = ma", desc: "Force equals mass times acceleration" },
      { name: "Kinetic Energy", formula: "KE = ½mv²", desc: "Energy of a moving object" },
      { name: "Potential Energy", formula: "PE = mgh", desc: "Energy due to height" },
      { name: "Work-Energy Theorem", formula: "W = ΔKE = ½mv² - ½mu²", desc: "Net work equals change in kinetic energy" },
      { name: "Momentum", formula: "p = mv", desc: "Linear momentum" },
      { name: "Impulse", formula: "J = FΔt = Δp", desc: "Impulse-momentum theorem" },
      { name: "Projectile Range", formula: "R = u²sin2θ/g", desc: "Range of projectile on level ground" },
      { name: "Centripetal Force", formula: "F = mv²/r", desc: "Force for circular motion" }
    ],
    Thermodynamics: [
      { name: "First Law", formula: "ΔU = Q - W", desc: "Internal energy, heat, work relation" },
      { name: "Ideal Gas Law", formula: "PV = nRT", desc: "Equation of state for ideal gas" },
      { name: "Efficiency", formula: "η = 1 - T₂/T₁", desc: "Carnot efficiency" },
      { name: "Specific Heat", formula: "Q = mcΔT", desc: "Heat absorbed or released" }
    ],
    Electrostatics: [
      { name: "Coulomb's Law", formula: "F = kq₁q₂/r²", desc: "Force between charges" },
      { name: "Electric Field", formula: "E = kq/r²", desc: "Electric field due to point charge" },
      { name: "Capacitance", formula: "C = Q/V = ε₀A/d", desc: "Parallel plate capacitor" },
      { name: "Ohm's Law", formula: "V = IR", desc: "Voltage-current relation" }
    ]
  },
  Chemistry: {
    'Physical Chemistry': [
      { name: "Ideal Gas", formula: "PV = nRT", desc: "R = 8.314 J/mol·K" },
      { name: "pH", formula: "pH = -log[H⁺]", desc: "Measure of acidity" },
      { name: "Nernst Equation", formula: "E = E° - (RT/nF)lnQ", desc: "Electrode potential" },
      { name: "Rate Law", formula: "Rate = k[A]ⁿ[B]ᵐ", desc: "Chemical kinetics" }
    ],
    'Organic Chemistry': [
      { name: "Degree of Unsaturation", formula: "DBE = (2C + 2 + N - H - X)/2", desc: "Calculate unsaturation" },
      { name: "Markovnikov's Rule", formula: "H adds to C with more H's", desc: "Electrophilic addition" }
    ]
  },
  Mathematics: {
    Calculus: [
      { name: "Derivative of xⁿ", formula: "d/dx(xⁿ) = nxⁿ⁻¹", desc: "Power rule" },
      { name: "Chain Rule", formula: "dy/dx = dy/du · du/dx", desc: "Composite function derivative" },
      { name: "Integration of xⁿ", formula: "∫xⁿdx = xⁿ⁺¹/(n+1) + C", desc: "Power rule for integration" },
      { name: "Integration by Parts", formula: "∫udv = uv - ∫vdu", desc: "Product integration" }
    ],
    Trigonometry: [
      { name: "Pythagorean Identity", formula: "sin²θ + cos²θ = 1", desc: "Fundamental identity" },
      { name: "Double Angle (sin)", formula: "sin2θ = 2sinθcosθ", desc: "Sine double angle" },
      { name: "Double Angle (cos)", formula: "cos2θ = cos²θ - sin²θ", desc: "Cosine double angle" }
    ]
  }
};

export default function FormulaSheets() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const chapters = FORMULAS[selectedSubject] || {};

  const copyFormula = (formula) => {
    navigator.clipboard?.writeText(formula);
    toast.success('Formula copied!');
  };

  const allFormulas = Object.entries(chapters).flatMap(([ch, formulas]) =>
    formulas.map(f => ({ ...f, chapter: ch }))
  );

  const filteredFormulas = searchQuery.trim()
    ? allFormulas.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.formula.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark-800">Formula Sheets 📐</h1>
          <p className="text-xs text-dark-400">Quick reference for exams</p>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar">
        {Object.keys(FORMULAS).map(subj => (
          <button key={subj} onClick={() => { setSelectedSubject(subj); setExpandedChapter(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              selectedSubject === subj ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-dark-500'
            }`}
          >{subj}</button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search formulas..." className="input-field pl-10 text-sm py-2.5" />
      </div>

      {/* Search Results */}
      {filteredFormulas ? (
        <div className="space-y-2">
          {filteredFormulas.length === 0 ? (
            <div className="card p-8 text-center"><p className="text-dark-400">No formulas found</p></div>
          ) : filteredFormulas.map((f, i) => (
            <div key={i} className="card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-dark-800">{f.name}</p>
                <p className="text-base font-mono text-primary-600 mt-0.5">{f.formula}</p>
                <p className="text-[10px] text-dark-400 mt-0.5">{f.desc}</p>
              </div>
              <button onClick={() => copyFormula(f.formula)} className="p-2 text-dark-300 hover:text-primary-500">
                <FiCopy size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Chapter-wise display */
        <div className="space-y-3">
          {Object.entries(chapters).map(([chapter, formulas]) => (
            <div key={chapter} className="card p-0 overflow-hidden">
              <button
                onClick={() => setExpandedChapter(expandedChapter === chapter ? null : chapter)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <FiBookOpen className="text-primary-500" size={16} />
                  <span className="font-semibold text-dark-800">{chapter}</span>
                  <span className="badge bg-primary-100 text-primary-600 text-[9px]">{formulas.length}</span>
                </div>
                {expandedChapter === chapter ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
              {expandedChapter === chapter && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100 animate-slide-up">
                  {formulas.map((f, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-dark-600">{f.name}</p>
                        <p className="text-sm font-mono text-primary-600 font-bold mt-0.5">{f.formula}</p>
                        <p className="text-[10px] text-dark-400 mt-0.5">{f.desc}</p>
                      </div>
                      <button onClick={() => copyFormula(f.formula)} className="p-2 text-dark-300 hover:text-primary-500 flex-shrink-0">
                        <FiCopy size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}