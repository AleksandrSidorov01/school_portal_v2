import Input from './Input.jsx';

const SearchBar = ({ value, onChange, placeholder = 'Поиск...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        🔍
      </div>
    </div>
  );
};

export default SearchBar;

