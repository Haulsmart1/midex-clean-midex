import ForwarderLayout from '../../../components/layouts/ForwarderLayout';

export default function UploadPOD() {
  return (
    <ForwarderLayout>
      <div className="container py-4">
        <div className="bg-dark text-white p-4 rounded shadow">
          <h2 className="mb-3">📤 Upload Proof of Delivery</h2>
          <p className="mb-4 text-light">Submit your delivery documents securely.</p>

          <form>
            <div className="mb-3">
              <label htmlFor="podFile" className="form-label text-white">Upload File</label>
              <input type="file" className="form-control bg-dark text-white border-secondary" id="podFile" />
            </div>

            <button type="submit" className="btn btn-success w-100">
              Upload POD
            </button>
          </form>
        </div>
      </div>
    </ForwarderLayout>
  );
}
