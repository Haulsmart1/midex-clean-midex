import { useState } from 'react';

export default function BookingModal({ show, onClose, onSubmit }) {
  const [booking, setBooking] = useState({
    from: '',
    to: '',
    collections: '',
    deliveries: '',
    pallets: '',
    group_as_one: false,
    adr: false,
    adr_class_special: false,
    un_number: '',
    dgn_file_url: '',
    eori_sender: '',
    eori_receiver: '',
    hs_code: '',
    declared_value: '',
    invoice_file_url: '',
    packing_list_url: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBooking({
      ...booking,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(booking);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content text-dark">
          <div className="modal-header">
            <h5 className="modal-title">New Booking</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Route */}
              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">From</label>
                  <input type="text" name="from" value={booking.from} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="col">
                  <label className="form-label">To</label>
                  <input type="text" name="to" value={booking.to} onChange={handleInputChange} className="form-control" required />
                </div>
              </div>

              {/* Collection & Delivery */}
              <div className="mb-3">
                <label className="form-label">Collection (JSON)</label>
                <input type="text" name="collections" value={booking.collections} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Delivery (JSON)</label>
                <input type="text" name="deliveries" value={booking.deliveries} onChange={handleInputChange} className="form-control" required />
              </div>

              {/* Pallets */}
              <div className="mb-3">
                <label className="form-label">Pallets (JSON)</label>
                <input type="text" name="pallets" value={booking.pallets} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-check mb-3">
                <input type="checkbox" name="group_as_one" checked={booking.group_as_one} onChange={handleInputChange} className="form-check-input" />
                <label className="form-check-label">Group as One</label>
              </div>

              {/* ADR */}
              <div className="form-check mb-2">
                <input type="checkbox" name="adr" checked={booking.adr} onChange={handleInputChange} className="form-check-input" />
                <label className="form-check-label">ADR</label>
              </div>
              <div className="form-check mb-3">
                <input type="checkbox" name="adr_class_special" checked={booking.adr_class_special} onChange={handleInputChange} className="form-check-input" />
                <label className="form-check-label">ADR Class 1/7</label>
              </div>
              <div className="mb-3">
                <label className="form-label">UN Number</label>
                <input type="text" name="un_number" value={booking.un_number} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">DGN File URL</label>
                <input type="url" name="dgn_file_url" value={booking.dgn_file_url} onChange={handleInputChange} className="form-control" />
              </div>

              {/* Customs */}
              <div className="mb-3">
                <label className="form-label">EORI Sender</label>
                <input type="text" name="eori_sender" value={booking.eori_sender} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">EORI Receiver</label>
                <input type="text" name="eori_receiver" value={booking.eori_receiver} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">HS Code</label>
                <input type="text" name="hs_code" value={booking.hs_code} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Declared Value (£)</label>
                <input type="number" step="0.01" name="declared_value" value={booking.declared_value} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Invoice File URL</label>
                <input type="url" name="invoice_file_url" value={booking.invoice_file_url} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Packing List File URL</label>
                <input type="url" name="packing_list_url" value={booking.packing_list_url} onChange={handleInputChange} className="form-control" />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-success">Submit Booking</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
