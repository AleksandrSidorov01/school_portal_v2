const Checkbox = ({ checked, onChange, label, className = '', ...props }) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        {...props}
      />
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
};

export default Checkbox;

