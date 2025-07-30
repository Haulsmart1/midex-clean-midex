import { useState, useEffect, useRef } from 'react';
import styles from '../styles/forms.module.css';
import SEOFooter from '../components/SEOFooter';

export default function Booking() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    origin: 'Carlisle', destination: 'Belfast',
    collectionAddress: '', pickupMiles: '', collectionContact: '',
    deliveryAddress: '', deliveryMiles: '', deliveryContact: '',
    deliverToDepot: false, collectFromDepot: false,
    standardPallets: [], doublePallets: [],
    tssRefs: [{ ref: '', file: null }],
    exportMrn: '', exportMrnFiles: [],
    importMrn: '', importMrnFiles: [],
    t1Ref: '', t1Files: [],
    dgnRef: '', dgnFiles: [],
  });

  const collectionRef = useRef(null);
  const deliveryRef = useRef(null);

  useEffect(() => {
    const loadScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDGbId7zYsavRZlcFiNKzGtpbzUooZ_wEM&libraries=places`;
        script.async = true;
        script.onload = initAutocomplete;
        document.body.appendChild(script);
      } else {
        initAutocomplete();
      }
    };

    const initAutocomplete = () => {
      if (!formData.deliverToDepot && collectionRef.current)
        new window.google.maps.places.Autocomplete(collectionRef.current);
      if (!formData.collectFromDepot && deliveryRef.current)
        new window.google.maps.places.Autocomplete(deliveryRef.current);
    };

    loadScript();
  }, [formData.deliverToDepot, formData.collectFromDepot]);

  const toggleDepot = (key) => {
    setFormData({ ...formData, [key]: !formData[key] });
  };

  const addPallet = (type) => {
    const pallet = { weight: '', length: '', width: '', height: '', isHazardous: false, adrClass: 'None' };
    setFormData(prev => ({ ...prev, [type]: [...prev[type], pallet] }));
  };

  const removePallet = (type, i) => {
    const updated = [...formData[type]];
    updated.splice(i, 1);
    setFormData({ ...formData, [type]: updated });
  };

  const updatePallet = (type, i, field, value) => {
    const updated = [...formData[type]];
    updated[i][field] = value;
    setFormData({ ...formData, [type]: updated });
  };

  const handleUpload = (key, files) => {
    setFormData({ ...formData, [key]: Array.from(files) });
  };

  const documentGroup = (label, refKey, fileKey) => (
    <div className={styles.formGrid}>
      <label>{label}:
        <input type="text" className={styles.inputField} value={formData[refKey]} onChange={e => setFormData({ ...formData, [refKey]: e.target.value })} />
      </label>
      <label>Upload:
        <input type="file" className={styles.fileUpload} multiple onChange={e => handleUpload(fileKey, e.target.files)} />
      </label>
    </div>
  );

  const palletGroup = (type, pallets) => pallets.map((p, i) => (
    <div className={styles.palletGroup} key={`${type}-${i}`}>
      {["weight", "length", "width", "height"].map(f => (
        <label key={f}>{f.charAt(0).toUpperCase() + f.slice(1)}:
          <input type="number" className={styles.inputField} value={p[f]} onChange={e => updatePallet(type, i, f, e.target.value)} />
        </label>
      ))}
      <label>Hazardous:
        <select className={styles.inputField} value={p.isHazardous ? 'Yes' : 'No'} onChange={e => updatePallet(type, i, 'isHazardous', e.target.value === 'Yes')}>
          <option>No</option><option>Yes</option>
        </select>
      </label>
      <label>ADR Class:
        <select className={styles.inputField} value={p.adrClass} onChange={e => updatePallet(type, i, 'adrClass', e.target.value)}>
          <option>None</option><option>Class 2</option><option>Class 3</option><option>Class 4</option><option>Class 5</option><option>Class 6</option><option>Class 8</option><option>Class 9</option>
        </select>
      </label>
      <button type="button" onClick={() => removePallet(type, i)} className={styles.deleteBtn}>🗑 Remove {type === 'standardPallets' ? 'Standard' : 'Double'} Pallet</button>
    </div>
  ));

  return (
    <main className="pageContainer" style={{ backgroundImage: "url('/midex.jpg')" }}>
      <div className="formContainer">
        <h1>Book Your Pallet</h1>

        {/* ... all form layout code ... */}

        <div className={styles.buttonRow}>
          <button type="button">Back</button>
          <button type="submit">Continue</button>
        </div>
      </div>
      <SEOFooter />
    </main>
  );
}
