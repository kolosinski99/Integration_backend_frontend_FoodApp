import React, { useEffect, useState } from 'react';
import { getOwnerSalesReport } from '../../api/orderApi';
import Spinner from '../../components/Spinner';
import styles from './OwnerReportPage.module.css';

const OwnerReportPage = () => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOwnerSalesReport()
      .then((res) => setReport(res.data))
      .catch(() => setError('Nie udało się załadować raportu.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!report) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Raport sprzedaży</h1>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Przychód (zrealizowane)</p>
          <p className={styles.statValue}>
            {Number(report.total_revenue).toFixed(2)} zł
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Zrealizowane zamówienia</p>
          <p className={styles.statValue}>{report.total_orders}</p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Najlepiej sprzedające się dania</h2>

      {report.top_products.length === 0 ? (
        <p className={styles.empty}>
          Brak danych — zrealizuj pierwsze zamówienia.
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Danie</th>
              <th>Sprzedano (szt.)</th>
              <th>Przychód</th>
            </tr>
          </thead>
          <tbody>
            {report.top_products.map((p, i) => (
              <tr key={p.product_name}>
                <td className={styles.rank}>{i + 1}</td>
                <td>{p.product_name}</td>
                <td className={styles.qty}>{p.quantity_sold}</td>
                <td className={styles.rev}>
                  {Number(p.revenue).toFixed(2)} zł
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OwnerReportPage;
