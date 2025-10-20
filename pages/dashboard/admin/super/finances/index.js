// pages/dashboard/admin/super/finances/index.js

import Head from 'next/head';
import { useEffect, useState } from 'react';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';
import { supabase } from '@/lib/supabaseClient';
import styles from '@/styles/Exports.module.css'; // reuse your styled gradient CSS

export default function FinancesPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllFinanceData = async () => {
      try {
        const results = await Promise.all([
          supabase.from("invoices").select("id, description, amount, created_at"),
          supabase.from("payments").select("id, payer, amount, created_at"),
          supabase.from("forwarder_commissions").select("id, forwarder, commission_amount, created_at")
        ]);

        const [invoicesData, paymentsData, commissionsData] = results.map(r => r.data || []);

        const invoices = invoicesData.map(item => ({
          id: `INV-${item.id}`,
          title: item.description || "Invoice",
          amount: item.amount,
          date: item.created_at,
          type: item.amount >= 0 ? "Income" : "Expense"
        }));

        const payments = paymentsData.map(item => ({
          id: `PAY-${item.id}`,
          title: item.payer || "Payment",
          amount: item.amount,
          date: item.created_at,
          type: "Income"
        }));

        const commissions = commissionsData.map(item => ({
          id: `COM-${item.id}`,
          title: `Commission: ${item.forwarder || "Partner"}`,
          amount: -Math.abs(item.commission_amount || 0),
          date: item.created_at,
          type: "Expense"
        }));

        const all = [...invoices, ...payments, ...commissions].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setTransactions(all);
      } catch (err) {
        console.error(err);
        setError("Failed to load financial data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllFinanceData();
  }, []);

  return (
    <SuperAdminLayout>
      <Head>
        <title>💰 Finances | Super Admin</title>
      </Head>

      <div className={styles.pageBackground}>
        <h1 style={{ marginBottom: "20px" }}>💰 Financial Overview</h1>

        {loading ? (
          <p>Loading financial data...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => {
                    const isExpense = t.type === "Expense";
                    return (
                      <tr key={t.id}>
                        <td>{t.title}</td>
                        <td className={isExpense ? styles.badgeError : styles.badgeSuccess}>
                          £{Math.abs(Number(t.amount)).toFixed(2)}
                        </td>
                        <td>{new Date(t.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`${styles.badge} ${isExpense ? styles.badgeError : styles.badgeSuccess}`}>
                            {t.type}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyText}>
                      No finance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
