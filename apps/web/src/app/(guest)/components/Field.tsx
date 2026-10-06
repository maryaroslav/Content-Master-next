type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    invalid?: boolean;
};

export default function Field({ label, invalid, ...input }: FieldProps) {
    return (
        <div className="input-box">
            <p>{label}</p>
            <input {...input} className={invalid ? 'input-error' : undefined} />
        </div>
    );
}
