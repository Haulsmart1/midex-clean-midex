'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabaseClient';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import { Tabs, Tab } from 'react-bootstrap';
import styles from '@/styles/ManageBookings.module.css';

import {
  normalizePostcode,
  getRegion,
} from '@/utils/regionDetect';

function safeParseArray(input, label = '') {
  try {
    if (typeof input === 'string') {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    }
    if (Array.isArray(input)) return input;
    return [];
  } catch (e) {
    console.error(`❌ Failed to parse ${label}:`, input, e);
    return [];
  }
}

export default function ManageBookingsPage() {
  const [key, setKey] = useState('internal');
  const [internalBookings, setInternalBookings] = useState([]);
  const [crossBorderBookings, setCrossBorderBookings] = useState([]);
  const [currysBookings, setCurrysBookings] = useState([]);
  const [carBatteries, setCarBatteries] = useState([]);
  const [luminescence, setLuminescence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['draft', 'confirmed']);

      const { data: currys } = await supabase
        .from('bookings_currys')
        .select('*');

      let cars = [];
      let lumi = [];

      try {
        const resultCars = await supabase.from('bookings_car_batteries').select('*');
        cars = resultCars.data || [];
      } catch (e) {
        console.warn('⚠️ Car batteries table missing.');
      }

      try {
        const resultLumi = await supabase.from('bookings_luminescence').select('*');
        lumi = resultLumi.data || [];
      } catch (e) {
        console.warn('⚠️ Luminescence table missing.');
      }

      const internal = [];
      const cross = [];

      (bookings || []).forEach(b => {
        const collections = safeParseArray(b.collectionpoints, 'collections');
        const deliveries = safeParseArray(b.deliverypoints, 'deliveries');
        const legs = safeParseArray(b.legs, 'legs');

        const origin = normalizePostcode(collections?.[0]?.postcode || '');
        const destination = normalizePostcode(deliveries?.[0]?.postcode || '');

        const originRegion = getRegion(origin);
        const destinationRegion = getRegion(destination);

        const isFerry = legs.some(
          leg => leg?.isFerry || leg?.ferry || leg?.mode === 'ferry'
        );

        const isCrossBorder = isFerry || originRegion !== destinationRegion;

        const bookingWithLocation = { ...b, origin, destination };

        if (isCrossBorder) {
          cross.push(bookingWithLocation);
        } else {
          internal.push(bookingWithLocation);
        }
      });

      const parseCurrysLikeData = (items) =>
        (items || []).map((b) => {
          const origin = normalizePostcode(b.postcode || '');
          const destination = normalizePostcode(b.deliverypostcode || '');
          return { ...b, origin, destination };
        });

      setInternalBookings(internal);
      setCrossBorderBookings(cross);
      setCurrysBookings(parseCurrysLikeData(currys));
      setCarBatteries(parseCurrysLikeData(cars));
      setLuminescence(parseCurrysLikeData(lumi));
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDelete = async (b, type) => {
    const confirmed = window.confirm('Are you sure you want to delete this booking?');
    if (!confirmed) return;

    let table;
    switch (type) {
      case 'internal':
      case 'cross':
        table = 'bookings';
        break;
      case 'currys':
        table = 'bookings_currys';
        break;
      case 'car':
        table = 'bookings_car_batteries';
        break;
      case 'lumi':
        table = 'bookings_luminescence';
        break;
      default:
        return;
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', b.id);

    if (error) {
      alert('Error deleting booking: ' + error.message);
      return;
    }

    const updateState = (setFn, list) => setFn(list.filter(item => item.id !== b.id));

    switch (type) {
      case 'internal': updateState(setInternalBookings, internalBookings); break;
      case 'cross': updateState(setCrossBorderBookings, crossBorderBookings); break;
      case 'currys': updateState(setCurrysBookings, currysBookings); break;
      case 'car': updateState(setCarBatteries, carBatteries); break;
      case 'lumi': updateState(setLuminescence, luminescence); break;
    }
  };

  const renderCard = (b, type = 'internal') => {
    const editPath = `/dashboard/admin/super/booking/${type}/edit/${b.id}`;

    return (
      <div key={b.id} className={styles.card}>
        <div className={styles.details}>
          <strong>Ref:</strong> {b.internal_reference || b.consignment_ref || b.id}<br />
          <strong>Status:</strong> {b.status || 'unknown'}<br />
          <strong>Collection Postcode:</strong> {b.origin || b.postcode || 'n/a'}<br />
          <strong>Delivery Postcode:</strong> {b.destination || b.deliverypostcode || 'n/a'}
        </div>
        <div className={styles.actions}>
          <Link href={editPath}>
            <button className={styles.btn}>Edit</button>
          </Link>
          <button className={styles.btnDelete} onClick={() => handleDelete(b, type)}>Delete</button>
        </div>
      </div>
    );
  };

  return (
    <SuperAdminLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>📂 Manage All Bookings</h2>

        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3" fill>
          <Tab eventKey="internal" title="🏠 Internal Bookings">
            {internalBookings.map((b) => renderCard(b, 'internal'))}
          </Tab>
          <Tab eventKey="cross" title="⛴️ Cross-Border Bookings">
            {crossBorderBookings.map((b) => renderCard(b, 'cross'))}
          </Tab>
          <Tab eventKey="currys" title="🛒 Currys">
            {currysBookings.map((b) => renderCard(b, 'currys'))}
          </Tab>
          <Tab eventKey="car" title="🔋 Car Batteries">
            {carBatteries.map((b) => renderCard(b, 'car'))}
          </Tab>
          <Tab eventKey="lumi" title="💡 Luminescence">
            {luminescence.map((b) => renderCard(b, 'lumi'))}
          </Tab>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
}


