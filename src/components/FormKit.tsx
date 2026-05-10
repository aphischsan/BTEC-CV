import React from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

export const Input = ({ label, helperText, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">{label}</label>
    <input
      {...props}
      className={`w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors ${props.className || ''}`}
    />
    {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
  </div>
);

export const Textarea = ({ label, helperText, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">{label}</label>
    <textarea
      {...props}
      className={`w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors ${props.className || ''}`}
    />
    {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
  </div>
);

export const SectionAccordion = ({ title, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-lg mb-4 bg-white overflow-hidden shadow-sm">
      <button
        type="button"
        className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {isOpen ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>
      {isOpen && <div className="p-5 border-t border-slate-200">{children}</div>}
    </div>
  );
};

export const AddItemButton = ({ onClick, label }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-center text-sm text-slate-800 bg-white border border-slate-300 px-4 py-2 rounded font-medium hover:bg-slate-50 transition-colors mt-2 w-full sm:w-auto shadow-sm"
  >
    <Plus size={16} className="mr-1" />
    {label}
  </button>
);

export const RemoveItemButton = ({ onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
    aria-label="Remove item"
  >
    <Trash2 size={16} />
  </button>
);

export const CheckboxGroup = ({ options, selected, onChange, title }: any) => (
  <div className="mb-4">
    {title && <label className="block text-xs font-semibold text-slate-700 uppercase mb-3">{title}</label>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
      {options.map((option: string) => {
        const isChecked = selected.includes(option);
        return (
          <label
            key={option}
            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
              isChecked ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <input
              type="checkbox"
              className="rounded text-blue-600 focus:ring-blue-500 shrink-0"
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selected, option]);
                } else {
                  onChange(selected.filter((item: string) => item !== option));
                }
              }}
            />
            <span className="truncate">{option}</span>
          </label>
        );
      })}
    </div>
  </div>
);
