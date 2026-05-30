import React, { useEffect, useRef, useState } from 'react';
import styles from './MapPicker.module.css';

const L = window.L;

const POLAND_CENTER = [52.0, 19.5];
const INITIAL_ZOOM = 6;

const MapPicker = ({ onAddressSelected, onClose }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [status, setStatus] = useState(
    'Kliknij na mapie aby wybrać adres dostawy'
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!L || mapRef.current) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: POLAND_CENTER,
      zoom: INITIAL_ZOOM,
    });

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">' +
          'OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      setLoading(true);
      setStatus('Pobieranie adresu...');

      try {
        const url =
          `https://nominatim.openstreetmap.org/reverse` +
          `?format=jsonv2&lat=${lat}&lon=${lng}` +
          `&accept-language=pl`;

        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'pl',
          },
        });

        if (!res.ok) throw new Error('Nominatim error');
        const data = await res.json();

        const addr = data.address || {};

        const street =
          addr.road ||
          addr.pedestrian ||
          addr.footway ||
          addr.cycleway ||
          '';

        const houseNumber = addr.house_number || '';

        const postalCode = addr.postcode
          ? addr.postcode.replace(/\s/g, '').slice(0, 6)
          : '';

        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.hamlet ||
          addr.county ||
          '';

        const parsed = {
          street,
          houseNumber,
          apartmentNumber: '',
          postalCode,
          city,
          lat,
          lon: lng,
          displayName: data.display_name || '',
        };

        if (markerRef.current) {
          markerRef.current
            .bindPopup(
              `<strong>${street} ${houseNumber}</strong>` +
              `<br/>${postalCode} ${city}`
            )
            .openPopup();
        }

        setStatus(
          street
            ? `Wybrany adres: ${street} ${houseNumber}, ` +
              `${postalCode} ${city}`
            : `Wybrano punkt: ${lat.toFixed(5)}, ${lng.toFixed(5)}` +
              ` — uzupełnij adres ręcznie`
        );

        setLoading(false);
        onAddressSelected(parsed);
      } catch {
        setStatus(
          'Nie udało się pobrać adresu. ' +
          'Uzupełnij go ręcznie poniżej.'
        );
        onAddressSelected({
          street: '',
          houseNumber: '',
          apartmentNumber: '',
          postalCode: '',
          city: '',
          lat,
          lon: lng,
          displayName: '',
        });
        setLoading(false);
      }
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [onAddressSelected]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Wybierz adres na mapie</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Zamknij mapę"
          >
            ✕
          </button>
        </div>

        <div className={styles.statusBar}>
          {loading ? (
            <span className={styles.loading}>
              Pobieranie adresu...
            </span>
          ) : (
            <span>{status}</span>
          )}
        </div>

        <div
          ref={mapContainerRef}
          className={styles.mapContainer}
          aria-label="Mapa Polski — kliknij aby wybrać adres"
        />

        <div className={styles.footer}>
          <p className={styles.hint}>
            Po kliknięciu pola adresowe zostaną wypełnione
            automatycznie. Możesz je poprawić przed złożeniem
            zamówienia.
          </p>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onClose}
          >
            Zatwierdź i wróć do koszyka
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
