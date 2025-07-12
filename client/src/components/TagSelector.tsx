
import React from 'react';
import Select from 'react-select';

interface Tag {
  value: string;
  label: string;
}

interface TagSelectorProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  placeholder?: string;
}

const availableTags: Tag[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'database', label: 'Database' },
  { value: 'api', label: 'API' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'mobile', label: 'Mobile' },
];

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
  placeholder = 'Select tags...'
}) => {
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--border))',
      '&:hover': {
        borderColor: 'hsl(var(--border))',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'hsl(var(--primary))'
        : state.isFocused
        ? 'hsl(var(--muted))'
        : 'transparent',
      color: state.isSelected
        ? 'hsl(var(--primary-foreground))'
        : 'hsl(var(--foreground))',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--muted))',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
  };

  return (
    <Select
      isMulti
      options={availableTags}
      value={selectedTags}
      onChange={(newValue) => onChange(newValue as Tag[])}
      placeholder={placeholder}
      styles={customStyles}
      className="text-sm"
      classNamePrefix="react-select"
      isClearable={false}
      isSearchable
      maxMenuHeight={200}
    />
  );
};

export default TagSelector;
