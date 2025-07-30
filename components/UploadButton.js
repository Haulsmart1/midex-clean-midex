export default function UploadButton({ label, onChange, accept }) {
  return (
    <label className="cursor-pointer inline-block px-4 py-2 bg-lime-500 hover:bg-lime-400 text-black font-semibold rounded text-center transition w-full">
      {label}
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}
