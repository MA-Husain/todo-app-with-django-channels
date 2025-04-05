// FormField.jsx
const FormField = ({
    type = "text",
    placeholder,
    name,
    value,
    onChange,
    required = true,
    className = ""
  }) => (
    <div className={`form-control w-full ${className}`}>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="input input-bordered w-full"
      />
    </div>
  )
  
  export default FormField
  